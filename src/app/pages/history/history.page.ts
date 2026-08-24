import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, AlertController, IonItemSliding, LoadingController, ModalController, PopoverController, ToastController } from '@ionic/angular';
import { EnvService } from 'src/app/services/env.service';
import { format, Locale } from 'date-fns';
import { de, enUS, fr, it } from 'date-fns/locale';
import { ScanRecord } from 'src/app/models/scan-record';
import { TranslateService } from '@ngx-translate/core';
import { Bookmark } from 'src/app/models/bookmark';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Toast } from '@capacitor/toast';
import { fastFadeIn, flyOut } from 'src/app/utils/animations';
import { SplashScreen } from '@capacitor/splash-screen';
import { HistoryExportContent, HistoryExportFormat, HistoryExportService } from 'src/app/services/history-export.service';
import { Preferences } from '@capacitor/preferences';
import { ICloudSyncService } from 'src/app/services/icloud-sync.service';

@Component({
    selector: 'app-history',
    templateUrl: './history.page.html',
    styleUrls: ['./history.page.scss'],
    animations: [fastFadeIn, flyOut],
    standalone: false
})
export class HistoryPage {

  segmentModel: 'history' | 'bookmarks' = "history";

  deleteToast: HTMLIonToastElement;

  dummyArr = Array.from(Array(10).keys());

  isLoading: boolean = false;
  groupFilter: string = '__all__';
  collapsedGroups = new Set<string>();
  managedGroups: string[] = [];
  private groupsInitialized = false;
  private readonly groupsStorageKey = 'history-groups';

  get groupNames(): string[] {
    return [...new Set([
      ...this.managedGroups,
      ...this.env.scanRecords.map(record => record.group).filter((group): group is string => !!group),
    ])]
      .sort((a, b) => a.localeCompare(b));
  }

  get filteredScanRecords(): ScanRecord[] {
    if (this.groupFilter === '__all__') return this.env.scanRecords;
    if (this.groupFilter === '__ungrouped__') return this.env.scanRecords.filter(record => !record.group);
    return this.env.scanRecords.filter(record => record.group === this.groupFilter);
  }

  get currentGroupFilterLabel(): string {
    if (this.groupFilter === '__all__') return this.translate.instant('ALL_GROUPS');
    if (this.groupFilter === '__ungrouped__') return this.translate.instant('UNGROUPED');
    return this.groupFilter;
  }

  isBookmarked(record: ScanRecord): boolean {
    return this.env.bookmarks.some(item => item.text === record.text);
  }

  bookmarkLabel(record: ScanRecord): string | undefined {
    const bookmark = this.env.bookmarks.find(item => item.text === record.text);
    if (!bookmark) return undefined;
    return bookmark.tag?.trim() || undefined;
  }

  bookmarkGroups(bookmark: Bookmark): string[] {
    return [...new Set(
      this.env.scanRecords
        .filter(record => record.text === bookmark.text)
        .map(record => record.group?.trim() || this.translate.instant('UNGROUPED')),
    )].sort((a, b) => a.localeCompare(b));
  }

  get groupedScanRecords(): Array<{ key: string; name: string; records: ScanRecord[] }> {
    const groups = new Map<string, ScanRecord[]>();
    if (this.groupFilter === '__all__') {
      this.groupNames.forEach(group => groups.set(group, []));
    } else if (this.groupFilter !== '__ungrouped__') {
      groups.set(this.groupFilter, []);
    }
    for (const record of this.filteredScanRecords) {
      const key = record.group || '__ungrouped__';
      const records = groups.get(key) ?? [];
      records.push(record);
      groups.set(key, records);
    }
    return [...groups.entries()]
      .map(([key, records]) => ({
        key,
        name: key === '__ungrouped__' ? this.translate.instant('UNGROUPED') : key,
        records,
      }))
      .sort((a, b) => {
        if (a.key === '__ungrouped__') return 1;
        if (b.key === '__ungrouped__') return -1;
        return a.name.localeCompare(b.name);
      });
  }

  toggleGroup(key: string): void {
    if (this.collapsedGroups.has(key)) {
      this.collapsedGroups.delete(key);
    } else {
      this.collapsedGroups.add(key);
    }
  }

  isGroupCollapsed(key: string): boolean {
    return this.collapsedGroups.has(key);
  }

  constructor(
    public alertController: AlertController,
    public loadingController: LoadingController,
    private router: Router,
    public env: EnvService,
    public toastController: ToastController,
    public translate: TranslateService,
    public modalController: ModalController,
    public popoverController: PopoverController,
    private route: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private actionSheetController: ActionSheetController,
    private historyExportService: HistoryExportService,
    private iCloudSync: ICloudSyncService,
  ) {
    this.route.params.subscribe(val => {
      setTimeout(() => this.firstLoadItems(), 200);
    });
  }

  firstLoadItems() {
    this.isLoading = true;
    if (this.env.recordsLimit != -1) {
      if (this.env.scanRecords.length > this.env.recordsLimit) {
        this.env.scanRecords = this.env.scanRecords.slice(0, this.env.recordsLimit);
      }
    }
    this.env.viewingScanRecords = [];
    this.env.viewingBookmarks = [];
    const scanRecords = [...this.filteredScanRecords];
    this.env.viewingScanRecords = scanRecords.slice(0, 15);
    const bookmarks = [...this.env.bookmarks];
    this.env.viewingBookmarks = bookmarks.slice(0, 15);
    this.isLoading = false;
  }

  loadMoreScanRecords() {
    const scanRecords = [...this.filteredScanRecords]
    this.env.viewingScanRecords.push(...scanRecords.slice(this.env.viewingScanRecords.length, this.env.viewingScanRecords.length + 15));
  }

  loadMoreBookmarks() {
    const bookmarks = [...this.env.bookmarks]
    this.env.viewingBookmarks.push(...bookmarks.slice(this.env.viewingBookmarks.length, this.env.viewingBookmarks.length + 15));
  }

  onLoadScanRecords(ev: any) {
    setTimeout(() => {
      ev.target.complete();
      this.loadMoreScanRecords();
      if (this.env.viewingScanRecords.length === this.filteredScanRecords.length) {
        ev.target.disabled = true;
      }
    }, 500);
  }

  onLoadBookmarks(ev: any) {
    setTimeout(() => {
      ev.target.complete();
      this.loadMoreBookmarks();
      if (this.env.viewingBookmarks.length === this.env.bookmarks.length) {
        ev.target.disabled = true;
      }
    }, 500);
  }

  ionViewWillEnter() {
    this.isLoading = true;
  }

  async ionViewDidEnter() {
    await SplashScreen.hide()
    await this.loadManagedGroups();
    this.segmentModel = this.env.historyPageStartSegment;
  }

  private async loadManagedGroups(): Promise<void> {
    const stored = await Preferences.get({ key: this.groupsStorageKey });
    try {
      this.managedGroups = stored.value ? JSON.parse(stored.value) : [];
    } catch {
      this.managedGroups = [];
    }
    this.managedGroups = this.groupNames;
    await this.saveManagedGroups();
    if (!this.groupsInitialized) {
      this.groupNames.forEach(group => this.collapsedGroups.add(group));
      this.groupsInitialized = true;
    }
  }

  private async saveManagedGroups(): Promise<void> {
    await Preferences.set({
      key: this.groupsStorageKey,
      value: JSON.stringify(this.managedGroups),
    });
    const groupDates = new Map<string, Date | string>();
    for (const record of this.env.scanRecords) {
      if (!record.group) continue;
      const candidate = record.modifiedAt || record.createdAt;
      const current = groupDates.get(record.group);
      if (candidate && (!current || new Date(candidate) > new Date(current))) groupDates.set(record.group, candidate);
    }
    await this.iCloudSync.saveLocalGroups(this.managedGroups, groupDates);
  }

  async createGroup(): Promise<void> {
    const alert = await this.alertController.create({
      header: this.translate.instant('CREATE_GROUP'),
      inputs: [{ name: 'group', type: 'text', placeholder: this.translate.instant('GROUP_NAME'), attributes: { maxlength: 40 } }],
      buttons: [
        { text: this.translate.instant('CANCEL'), role: 'cancel' },
        {
          text: this.translate.instant('CREATE'),
          handler: async data => {
            const name = data.group?.trim();
            if (!name) return false;
            if (!this.managedGroups.includes(name)) this.managedGroups.push(name);
            this.managedGroups.sort((a, b) => a.localeCompare(b));
            this.collapsedGroups.add(name);
            await this.saveManagedGroups();
            return true;
          },
        },
      ],
      cssClass: ['alert-bg'],
    });
    await alert.present();
  }

  async deleteSelectedGroup(selectedGroup?: string): Promise<void> {
    const group = selectedGroup ?? this.groupFilter;
    if (group === '__all__' || group === '__ungrouped__') return;
    const alert = await this.alertController.create({
      header: this.translate.instant('DELETE_GROUP'),
      message: `${group}: ${this.translate.instant('GROUP_DELETE_INFO')}`,
      buttons: [
        { text: this.translate.instant('CANCEL'), role: 'cancel' },
        {
          text: this.translate.instant('DELETE'),
          role: 'destructive',
          handler: async () => {
            await this.env.removeScanRecordGroup(group);
            this.managedGroups = this.managedGroups.filter(item => item !== group);
            this.collapsedGroups.delete(group);
            if (this.groupFilter === group) this.groupFilter = '__all__';
            await this.saveManagedGroups();
            this.firstLoadItems();
          },
        },
      ],
      cssClass: ['alert-bg'],
    });
    await alert.present();
  }

  ionViewWillLeave() {
    this.changeDetectorRef.detach();
    this.env.viewingScanRecords = [];
    this.env.viewingBookmarks = [];
    this.changeDetectorRef.detectChanges();
    this.changeDetectorRef.reattach();
    if (this.deleteToast) {
      this.deleteToast.dismiss();
      this.deleteToast = undefined;
    }
  }

  scanRecordsTrackByFn(index: number, record: ScanRecord): string {
    return record.id;
  }

  bookmarksTrackByFn(index: number, bookmark: Bookmark): string {
    return bookmark.id;
  }

  maskDatetimeAndSource(date: Date, source: 'create' | 'view' | 'scan' | 'external-share' | undefined): string {
    if (!date) {
      return "-";
    }
    let locale: Locale;
    switch (this.env.language) {
      case "de":
        locale = de;
        break;
      case "en":
        locale = enUS;
        break;
      case "fr":
        locale = fr;
        break;
      case "it":
        locale = it;
        break;
      default:
        locale = enUS;
    }
    switch (source) {
      case 'create':
        return `${this.translate.instant("CREATED")} ${this.translate.instant("AT")} ${format(date, "PP pp", { locale: locale })}`;
      case 'view':
        return `${this.translate.instant("VIEWED")} ${this.translate.instant("AT")} ${format(date, "PP pp", { locale: locale })}`;
      case 'scan':
        return `${this.translate.instant("SCANNED")} ${this.translate.instant("AT")} ${format(date, "PP pp", { locale: locale })}`;
      case 'external-share':
        return `${this.translate.instant("EXTERNALLY_SHARED")} ${this.translate.instant("AT")} ${format(date, "PP pp", { locale: locale })}`;
    }
  }

  getBarcodeFormat(barcodeType: string): string {
    switch (barcodeType) {
      case "UPC_A":
        return this.translate.instant("BARCODE_TYPE.UPC").trim() + ` (UPC-A)`;
      case "UPC_E":
        return this.translate.instant("BARCODE_TYPE.UPC").trim() + ` (UPC-E)`;
      case "UPC_EAN_EXTENSION":
        return this.translate.instant("BARCODE_TYPE.UPC").trim() + ` (UPC/EAN Ext.)`;
      case "EAN_8":
        return this.translate.instant("BARCODE_TYPE.EAN").trim() + ` (EAN-8)`;
      case "EAN_13":
        return this.translate.instant("BARCODE_TYPE.EAN").trim() + ` (EAN-13)`;
      case "CODE_39":
        return this.translate.instant("BARCODE_TYPE.1D").trim() + ` (Code 39)`;
      case "CODE_39_MOD_43":
        return this.translate.instant("BARCODE_TYPE.1D").trim() + ` (Code 39 mod 43)`;
      case "CODE_93":
        return this.translate.instant("BARCODE_TYPE.1D").trim() + ` (Code 93)`;
      case "CODE_128":
        return this.translate.instant("BARCODE_TYPE.1D").trim() + ` (Code 128)`;
      case "CODABAR":
        return this.translate.instant("BARCODE_TYPE.1D").trim() + ` (Codabar)`;
      case "ITF":
        return this.translate.instant("BARCODE_TYPE.1D").trim() + ` (ITF)`;
      case "ITF_14":
        return this.translate.instant("BARCODE_TYPE.1D").trim() + ` (ITF-14)`;
      case "AZTEC":
        return this.translate.instant("BARCODE_TYPE.AZTEC").trim();
      case "DATA_MATRIX":
        return this.translate.instant("BARCODE_TYPE.DATA_MATRIX").trim();
      case "MAXICODE":
        return this.translate.instant("BARCODE_TYPE.MAXICODE").trim();
      case "PDF_417":
        return this.translate.instant("BARCODE_TYPE.PDF_417").trim();
      case "QR_CODE":
        return this.translate.instant("BARCODE_TYPE.QR_CODE").trim();
      case "RSS_14":
        return this.translate.instant("BARCODE_TYPE.RSS").trim();
      case "RSS_EXPANDED":
        return this.translate.instant("BARCODE_TYPE.RSS").trim();
      default:
        return this.env.resultContentFormat;
    }
  }

  viewRecord(data: string, source: "view-log" | "view-bookmark", recordId?: string) {
    this.isLoading = true;
    this.changeDetectorRef.detach();
    this.env.viewingScanRecords = [];
    this.env.viewingBookmarks = [];
    this.changeDetectorRef.detectChanges();
    this.changeDetectorRef.reattach();
    this.env.resultContent = data;
    this.env.resultContentFormat = "";
    this.env.recordSource = "view";
    this.env.detailedRecordSource = source;
    this.env.viewResultFrom = "/tabs/history";
    this.env.selectedScanRecordId = recordId;
    this.router.navigate(['tabs/result']);
  }

  async segmentChanged(ev: any) {
    this.firstLoadItems();
  }

  groupFilterChanged() {
    this.firstLoadItems();
  }

  async presentGroupFilter(): Promise<void> {
    const choices = [
      { value: '__all__', label: this.translate.instant('ALL_GROUPS') },
      { value: '__ungrouped__', label: this.translate.instant('UNGROUPED') },
      ...this.groupNames.map(group => ({ value: group, label: group })),
    ];
    const buttons: any[] = choices.map(choice => ({
      text: choice.label,
      icon: choice.value === this.groupFilter ? 'checkmark-circle' : 'folder-outline',
      handler: () => {
        this.groupFilter = choice.value;
        this.groupFilterChanged();
      },
    }));
    buttons.push({
      text: this.translate.instant('CANCEL'),
      icon: 'close',
      role: 'cancel',
      handler: () => undefined,
    });
    const actionSheet = await this.actionSheetController.create({
      header: this.translate.instant('FILTER_GROUPS'),
      buttons,
    });
    await actionSheet.present();
  }

  async assignGroup(record: ScanRecord, slidingItem: IonItemSliding) {
    await slidingItem.close();
    await this.presentGroupDestination([record]);
  }

  private async selectEntriesToMove(): Promise<void> {
    const records = this.filteredScanRecords;
    if (!records.length) return;
    const alert = await this.alertController.create({
      header: this.translate.instant('SELECT_ENTRIES'),
      inputs: records.map(record => ({
        type: 'checkbox',
        label: record.text,
        value: record.id,
        checked: false,
      })),
      buttons: [
        { text: this.translate.instant('CANCEL'), role: 'cancel' },
        {
          text: this.translate.instant('CONTINUE'),
          handler: (selected: string[]) => {
            const chosen = records.filter(record => selected.includes(record.id));
            if (!chosen.length) return false;
            this.presentGroupDestination(chosen);
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  private async presentGroupDestination(records: ScanRecord[]): Promise<void> {
    const actionSheet = await this.actionSheetController.create({
      header: `${this.translate.instant('MOVE_TO_GROUP')} (${records.length})`,
      buttons: [
        {
          text: this.translate.instant('UNGROUPED'),
          icon: 'folder-outline',
          handler: () => this.moveEntriesToGroup(records),
        },
        ...this.groupNames.map(group => ({
          text: group,
          icon: 'folder',
          handler: () => this.moveEntriesToGroup(records, group),
        })),
        {
          text: this.translate.instant('CREATE_GROUP'),
          icon: 'folder-open-outline',
          handler: () => this.createGroupForEntries(records),
        },
        { text: this.translate.instant('CANCEL'), role: 'cancel' },
      ],
    });
    await actionSheet.present();
  }

  private async createGroupForEntries(records: ScanRecord[]): Promise<void> {
    const alert = await this.alertController.create({
      header: this.translate.instant('CREATE_GROUP'),
      inputs: [{ name: 'group', type: 'text', placeholder: this.translate.instant('GROUP_NAME'), attributes: { maxlength: 40 } }],
      buttons: [
        { text: this.translate.instant('CANCEL'), role: 'cancel' },
        {
          text: this.translate.instant('CREATE'),
          handler: data => {
            const group = data.group?.trim();
            if (!group) return false;
            this.moveEntriesToGroup(records, group);
            return true;
          },
        },
      ],
      cssClass: ['alert-bg'],
    });
    await alert.present();
  }

  private async moveEntriesToGroup(records: ScanRecord[], group?: string): Promise<void> {
    for (const record of records) await this.env.setScanRecordGroup(record.id, group);
    if (group && !this.managedGroups.includes(group)) {
      this.managedGroups.push(group);
      this.managedGroups.sort((a, b) => a.localeCompare(b));
      this.collapsedGroups.add(group);
      await this.saveManagedGroups();
    }
    this.firstLoadItems();
    await this.presentToast(`${records.length} ${this.translate.instant('ENTRIES_MOVED')}`, 'short', 'bottom');
  }

  async addBookmark(record: ScanRecord, slidingItem: IonItemSliding) {
    await slidingItem.close();
    if (this.env.bookmarks.find(x => x.text === record.text)) {
      await this.presentToast(this.translate.instant("MSG.ALREADY_BOOKMARKED"), "short", "bottom");
      return;
    }
    await this.showBookmarkAlert(record);
  }

  async showBookmarkAlert(record: ScanRecord) {
    const alert = await this.alertController.create(
      {
        header: this.translate.instant('BOOKMARK'),
        message: this.translate.instant('MSG.INPUT_TAG'),
        cssClass: ['alert-bg'],
        inputs: [
          {
            name: 'tag',
            id: 'tag',
            type: 'text',
            label: `${this.translate.instant("MSG.TAG_MAX_LENGTH")}`,
            placeholder: `${this.translate.instant("MSG.TAG_MAX_LENGTH")}`,
            max: 30
          }
        ],
        buttons: [
          {
            text: this.translate.instant('CREATE'),
            handler: async data => {
              alert.dismiss();
              if (data.tag != null && data.tag.trim().length > 30) {
                this.presentToast(this.translate.instant("MSG.TAG_MAX_LENGTH_EXPLAIN"), "short", "bottom");
                return true;
              }
              const bookmark = await this.env.saveBookmark(record.text, data.tag);
              this.env.viewingBookmarks.unshift(bookmark);
              this.env.viewingBookmarks.sort((a, b) => {
                return ('' + a.tag).localeCompare(b.tag ?? '');
              });
              if (bookmark != null) {
                await this.presentToast(this.translate.instant("MSG.BOOKMARKED"), "short", "bottom");
              } else {
                await this.presentToast(this.translate.instant("MSG.ALREADY_BOOKMARKED"), "short", "bottom");
              }
            }
          }
        ]
      }
    )
    await alert.present();
  }

  async removeBookmark(bookmark: Bookmark, slidingItem: IonItemSliding) {
    slidingItem.disabled = true;
    if (this.deleteToast) {
      await this.deleteToast.dismiss();
      this.deleteToast = null;
    }
    await this.env.deleteBookmark(bookmark.text);
    const index = this.env.viewingBookmarks.findIndex(x => x.text == bookmark.text);
    if (index != -1) {
      this.env.viewingBookmarks.splice(index, 1);
      if (this.env.bookmarks?.length > this.env.viewingBookmarks.length) {
        const bookmarks = [...this.env.bookmarks]
        this.env.viewingBookmarks.push(...bookmarks.slice(this.env.viewingBookmarks.length, this.env.viewingBookmarks.length + 1));
      }
    }
    this.deleteToast = await this.toastController.create({
      message: this.translate.instant('MSG.UNDO_DELETE'),
      duration: 2000,
      color: "light",
      position: "top",
      buttons: [
        {
          text: this.translate.instant('UNDO'),
          side: 'end',
          handler: async () => {
            await this.env.undoBookmarkDeletion(bookmark);
            this.env.viewingBookmarks.splice(index, 0, bookmark);
            this.deleteToast.dismiss();
          }
        }
      ]
    });
    await this.deleteToast.present();
  }

  async editBookmark(bookmark: Bookmark, slidingItem: IonItemSliding) {
    await slidingItem.close();
    await this.showEditBookmarkAlert(bookmark);
  }

  async showEditBookmarkAlert(bookmark: Bookmark) {
    const alert = await this.alertController.create(
      {
        header: this.translate.instant('BOOKMARK'),
        message: this.translate.instant('MSG.INPUT_TAG'),
        cssClass: ['alert-bg'],
        inputs: [
          {
            name: 'tag',
            id: 'tag',
            type: 'text',
            label: `${this.translate.instant("MSG.TAG_MAX_LENGTH")}`,
            placeholder: `${this.translate.instant("MSG.TAG_MAX_LENGTH")}`,
            value: bookmark.tag ?? '',
            max: 30
          }
        ],
        buttons: [
          {
            text: this.translate.instant('EDIT'),
            handler: async data => {
              alert.dismiss();
              if (data.tag != null && data.tag.trim().length > 30) {
                this.presentToast(this.translate.instant("MSG.TAG_MAX_LENGTH_EXPLAIN"), "short", "bottom");
                return true;
              }
              this.isLoading = true;
              await this.env.deleteBookmark(bookmark.text);
              const index = this.env.viewingBookmarks.findIndex(x => x.text === bookmark.text);
              if (index != -1) {
                this.env.viewingBookmarks.splice(index, 1);
              }
              const newBookmark = await this.env.saveBookmark(bookmark.text, data.tag);
              this.env.viewingBookmarks.unshift(newBookmark);
              this.env.viewingBookmarks.sort((a, b) => {
                return ('' + a.tag).localeCompare(b.tag ?? '');
              });
              this.isLoading = false;
            }
          }
        ]
      }
    )
    await alert.present();
  }

  async removeRecord(record: ScanRecord, slidingItem: IonItemSliding) {
    slidingItem.disabled = true;
    if (this.deleteToast) {
      await this.deleteToast.dismiss();
      this.deleteToast = null;
    }
    await this.env.deleteScanRecord(record.id);
    const index = this.env.viewingScanRecords.findIndex(x => x.id == record.id);
    if (index != -1) {
      this.env.viewingScanRecords.splice(index, 1);
      if (this.env.scanRecords?.length > this.env.viewingScanRecords.length) {
        const scanRecords = [...this.env.scanRecords]
        this.env.viewingScanRecords.push(...scanRecords.slice(this.env.viewingScanRecords.length, this.env.viewingScanRecords.length + 1));
      }
    }
    this.deleteToast = await this.toastController.create({
      message: this.translate.instant('MSG.UNDO_DELETE'),
      duration: 2000,
      color: "light",
      position: "top",
      buttons: [
        {
          text: this.translate.instant('UNDO'),
          side: 'end',
          handler: async () => {
            await this.env.undoScanRecordDeletion(record);
            this.env.viewingScanRecords.splice(index, 0, record);
            this.deleteToast.dismiss();
          }
        }
      ]
    });
    await this.deleteToast.present();

  }

  async removeAll() {
    const iCloudEnabled = await this.iCloudSync.isEnabled();
    if (this.segmentModel === 'history') {
      const alert = await this.alertController.create({
        header: this.translate.instant('REMOVE_ALL'),
        message: this.translate.instant(iCloudEnabled ? 'MSG.REMOVE_ALL_RECORD_ICLOUD' : 'MSG.REMOVE_ALL_RECORD'),
        cssClass: ['alert-bg'],
        buttons: [
          {
            text: this.translate.instant(iCloudEnabled ? 'DELETE_ON_ALL_DEVICES' : 'YES'),
            role: 'destructive',
            handler: async () => {
              await this.env.deleteAllScanRecords();
              this.isLoading = true;
              this.env.viewingScanRecords = [];
              this.isLoading = false;
            }
          },
          ...(iCloudEnabled ? [{
            text: this.translate.instant('DELETE_ONLY_THIS_DEVICE'),
            handler: async () => {
              await this.iCloudSync.setEnabled(false);
              await this.env.deleteAllScanRecords(false);
              this.env.viewingScanRecords = [];
            }
          }] : []),
          {
            text: this.translate.instant('NO'),
            role: 'cancel'
          },
        ]
      });
      alert.present();
    } else if (this.segmentModel === 'bookmarks') {
      const alert = await this.alertController.create({
        header: this.translate.instant('REMOVE_ALL'),
        message: this.translate.instant(iCloudEnabled ? 'MSG.REMOVE_ALL_BOOKMARKS_ICLOUD' : 'MSG.REMOVE_ALL_BOOKMARKS'),
        cssClass: ['alert-bg'],
        buttons: [
          {
            text: this.translate.instant(iCloudEnabled ? 'DELETE_ON_ALL_DEVICES' : 'YES'),
            role: 'destructive',
            handler: async () => {
              await this.env.deleteAllBookmarks();
              this.isLoading = true;
              this.env.viewingBookmarks = [];
              this.isLoading = false;
            }
          },
          ...(iCloudEnabled ? [{
            text: this.translate.instant('DELETE_ONLY_THIS_DEVICE'),
            handler: async () => {
              await this.iCloudSync.setEnabled(false);
              await this.env.deleteAllBookmarks(false);
              this.env.viewingBookmarks = [];
            }
          }] : []),
          {
            text: this.translate.instant('NO'),
            role: 'cancel'
          },
        ]
      });
      alert.present();
    }
  }

  async exportHistory() {
    const actionSheet = await this.actionSheetController.create({
      header: this.translate.instant('EXPORT_SCOPE'),
      buttons: [
        { text: this.translate.instant('CURRENT_FILTER'), icon: 'filter', handler: () => this.presentExportFormats(this.filteredScanRecords) },
        { text: this.translate.instant('SELECT_GROUPS'), icon: 'folder-open', handler: () => this.selectGroupsForExport() },
        { text: this.translate.instant('SELECT_CODES'), icon: 'checkbox', handler: () => this.selectCodesForExport() },
        { text: this.translate.instant('CANCEL'), role: 'cancel' }
      ]
    });
    await actionSheet.present();
  }

  async presentMoreActions(): Promise<void> {
    const buttons: any[] = [];
    if (this.segmentModel === 'history') {
      buttons.push({
        text: this.translate.instant('MANAGE_ENTRIES'),
        icon: 'list-outline',
        handler: () => this.presentRecordManagement(),
      });
      if (this.env.scanRecords?.length) {
        buttons.push({
          text: this.translate.instant('DELETE_ALL_ENTRIES'),
          icon: 'trash-outline',
          role: 'destructive',
          handler: () => this.removeAll(),
        });
      }
    } else if (this.env.bookmarks?.length) {
      buttons.push({ text: this.translate.instant('REMOVE_ALL'), icon: 'trash-outline', role: 'destructive', handler: () => this.removeAll() });
    }
    buttons.push({ text: this.translate.instant('CANCEL'), role: 'cancel' });
    const actionSheet = await this.actionSheetController.create({
      header: this.translate.instant('ACTIONS'),
      buttons,
    });
    await actionSheet.present();
  }

  private async presentRecordManagement(): Promise<void> {
    if (!this.env.scanRecords?.length) {
      const alert = await this.alertController.create({
        header: this.translate.instant('MANAGE_ENTRIES'),
        message: this.translate.instant('NO_ENTRIES_TO_MANAGE'),
        cssClass: ['alert-bg'],
        buttons: [this.translate.instant('OK')],
      });
      await alert.present();
      return;
    }

    const buttons: any[] = [
      { text: this.translate.instant('MOVE_ENTRIES'), icon: 'move-outline', handler: () => this.selectEntriesToMove() },
      { text: this.translate.instant('CANCEL'), role: 'cancel' },
    ];
    const actionSheet = await this.actionSheetController.create({ header: this.translate.instant('MANAGE_ENTRIES'), buttons });
    await actionSheet.present();
  }

  async presentGroupManagement(): Promise<void> {
    const buttons: any[] = [{
      text: this.translate.instant('CREATE_GROUP'),
      icon: 'folder-open-outline',
      handler: () => this.createGroup(),
    }];
    buttons.push(...this.groupNames.map(group => ({ text: group, icon: 'folder-outline', handler: () => this.presentSelectedGroupActions(group) })));
    buttons.push({ text: this.translate.instant('CANCEL'), role: 'cancel' });
    const actionSheet = await this.actionSheetController.create({ header: this.translate.instant('MANAGE_GROUPS'), buttons });
    await actionSheet.present();
  }

  private async presentSelectedGroupActions(group: string): Promise<void> {
    const actionSheet = await this.actionSheetController.create({
      header: group,
      buttons: [
        { text: this.translate.instant('ADD_ENTRIES'), icon: 'add-circle-outline', handler: () => this.selectEntriesForGroup(group) },
        { text: this.translate.instant('RENAME_GROUP'), icon: 'pencil-outline', handler: () => this.renameGroup(group) },
        { text: this.translate.instant('DELETE_GROUP'), icon: 'trash-outline', role: 'destructive', handler: () => this.deleteSelectedGroup(group) },
        { text: this.translate.instant('CANCEL'), role: 'cancel' },
      ],
    });
    await actionSheet.present();
  }

  private async selectEntriesForGroup(group: string): Promise<void> {
    const records = this.env.scanRecords.filter(record => record.group !== group);
    if (!records.length) {
      await this.presentToast(this.translate.instant('NO_ENTRIES_AVAILABLE'), 'short', 'bottom');
      return;
    }
    const alert = await this.alertController.create({
      header: `${this.translate.instant('ADD_ENTRIES')}: ${group}`,
      inputs: records.map(record => ({ type: 'checkbox', label: record.text, value: record.id, checked: false })),
      buttons: [
        { text: this.translate.instant('CANCEL'), role: 'cancel' },
        {
          text: this.translate.instant('ADD'),
          handler: (selected: string[]) => {
            const chosen = records.filter(record => selected.includes(record.id));
            if (!chosen.length) return false;
            this.moveEntriesToGroup(chosen, group);
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  private async renameGroup(group: string): Promise<void> {
    const alert = await this.alertController.create({
      header: this.translate.instant('RENAME_GROUP'),
      inputs: [{ name: 'group', type: 'text', value: group, attributes: { maxlength: 40 } }],
      buttons: [
        { text: this.translate.instant('CANCEL'), role: 'cancel' },
        {
          text: this.translate.instant('SAVE'),
          handler: async data => {
            const newGroup = data.group?.trim();
            if (!newGroup) return false;
            if (newGroup !== group) await this.env.renameScanRecordGroup(group, newGroup);
            this.managedGroups = this.managedGroups.filter(item => item !== group);
            if (!this.managedGroups.includes(newGroup)) this.managedGroups.push(newGroup);
            this.managedGroups.sort((a, b) => a.localeCompare(b));
            if (this.collapsedGroups.delete(group)) this.collapsedGroups.add(newGroup);
            if (this.groupFilter === group) this.groupFilter = newGroup;
            await this.saveManagedGroups();
            this.firstLoadItems();
            return true;
          },
        },
      ],
      cssClass: ['alert-bg'],
    });
    await alert.present();
  }

  async presentDataTransfer(): Promise<void> {
    const buttons: any[] = [{ text: this.translate.instant('IMPORT_CODES'), icon: 'clipboard-outline', handler: () => this.importCodes() }];
    if (this.env.scanRecords?.length) buttons.push({ text: this.translate.instant('EXPORT'), icon: 'share-outline', handler: () => this.exportHistory() });
    buttons.push({ text: this.translate.instant('CANCEL'), role: 'cancel' });
    const actionSheet = await this.actionSheetController.create({ header: this.translate.instant('TRANSFER_DATA'), buttons });
    await actionSheet.present();
  }

  async importCodes(): Promise<void> {
    const alert = await this.alertController.create({
      header: this.translate.instant('IMPORT_CODES'),
      message: this.translate.instant('ONE_CODE_PER_LINE'),
      inputs: [{
        name: 'codes',
        type: 'textarea',
        placeholder: this.translate.instant('PASTE_CODES'),
        attributes: { rows: 10, autocapitalize: 'off', autocorrect: 'off', spellcheck: false },
      }],
      buttons: [
        { text: this.translate.instant('CANCEL'), role: 'cancel' },
        {
          text: this.translate.instant('CONTINUE'),
          handler: data => {
            const codes = String(data.codes ?? '')
              .split(/\r?\n/)
              .map(code => code.trim())
              .filter(code => code.length > 0);
            if (!codes.length) {
              this.presentToast(this.translate.instant('NO_VALID_CODES'), 'short', 'bottom');
              return false;
            }
            this.presentCodeImportDestination(codes);
            return true;
          },
        },
      ],
      cssClass: ['alert-bg'],
    });
    await alert.present();
  }

  private async presentCodeImportDestination(codes: string[]): Promise<void> {
    const buttons = [
      {
        text: this.translate.instant('UNGROUPED'),
        icon: 'folder-outline',
        handler: () => this.saveImportedCodes(codes),
      },
      ...this.groupNames.map(group => ({
        text: group,
        icon: 'folder',
        handler: () => this.saveImportedCodes(codes, group),
      })),
      {
        text: this.translate.instant('CREATE_GROUP'),
        icon: 'folder-open-outline',
        handler: () => this.createImportGroup(codes),
      },
      { text: this.translate.instant('CANCEL'), role: 'cancel' as const },
    ];
    const actionSheet = await this.actionSheetController.create({
      header: `${this.translate.instant('IMPORT_TO_GROUP')} (${codes.length})`,
      buttons,
    });
    await actionSheet.present();
  }

  private async createImportGroup(codes: string[]): Promise<void> {
    const alert = await this.alertController.create({
      header: this.translate.instant('CREATE_GROUP'),
      inputs: [{ name: 'group', type: 'text', placeholder: this.translate.instant('GROUP_NAME'), attributes: { maxlength: 40 } }],
      buttons: [
        { text: this.translate.instant('CANCEL'), role: 'cancel' },
        {
          text: this.translate.instant('CREATE'),
          handler: data => {
            const group = data.group?.trim();
            if (!group) return false;
            this.saveImportedCodes(codes, group);
            return true;
          },
        },
      ],
      cssClass: ['alert-bg'],
    });
    await alert.present();
  }

  private async saveImportedCodes(codes: string[], group?: string): Promise<void> {
    const previousSource = this.env.recordSource;
    const previousFormat = this.env.resultContentFormat;
    this.env.recordSource = 'scan';
    this.env.resultContentFormat = '';
    try {
      for (const code of codes) await this.env.saveScanRecord(code, group);
      if (group && !this.managedGroups.includes(group)) {
        this.managedGroups.push(group);
        this.managedGroups.sort((a, b) => a.localeCompare(b));
        this.collapsedGroups.add(group);
        await this.saveManagedGroups();
      }
      this.firstLoadItems();
      await this.presentToast(`${codes.length} ${this.translate.instant('CODES_IMPORTED')}`, 'short', 'bottom');
    } finally {
      this.env.recordSource = previousSource;
      this.env.resultContentFormat = previousFormat;
    }
  }

  private async presentExportFormats(records: ScanRecord[]) {
    if (!records.length) return;
    const actionSheet = await this.actionSheetController.create({
      header: `${this.translate.instant('EXPORT')} (${records.length})`,
      buttons: [
        { text: `${this.translate.instant('FULL_DETAILS')} (CSV)`, icon: 'document-text', handler: () => this.shareHistory(records, 'csv', 'full') },
        { text: `${this.translate.instant('FULL_DETAILS')} (TXT)`, icon: 'reader', handler: () => this.shareHistory(records, 'txt', 'full') },
        { text: `${this.translate.instant('CODES_ONLY')} (TXT)`, icon: 'list', handler: () => this.shareHistory(records, 'txt', 'codes') },
        { text: this.translate.instant('COPY_CODES'), icon: 'copy', handler: () => this.copyCodes(records) },
        { text: this.translate.instant('CANCEL'), role: 'cancel' },
      ],
    });
    await actionSheet.present();
  }

  private async selectGroupsForExport() {
    const keys = [...this.groupNames, '__ungrouped__'];
    const alert = await this.alertController.create({
      header: this.translate.instant('SELECT_GROUPS'),
      inputs: keys.map(key => ({
        type: 'checkbox',
        label: key === '__ungrouped__' ? this.translate.instant('UNGROUPED') : key,
        value: key,
        checked: true,
      })),
      buttons: [
        { text: this.translate.instant('CANCEL'), role: 'cancel' },
        {
          text: this.translate.instant('CONTINUE'),
          handler: (selected: string[]) => {
            const records = this.env.scanRecords.filter(record =>
              selected.includes(record.group || '__ungrouped__'),
            );
            if (!records.length) return false;
            this.presentExportFormats(records);
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  private async selectCodesForExport() {
    const records = this.filteredScanRecords;
    const alert = await this.alertController.create({
      header: this.translate.instant('SELECT_CODES'),
      inputs: records.map(record => ({
        type: 'checkbox',
        label: record.text,
        value: record.id,
        checked: true,
      })),
      buttons: [
        { text: this.translate.instant('CANCEL'), role: 'cancel' },
        {
          text: this.translate.instant('CONTINUE'),
          handler: (selected: string[]) => {
            const chosen = records.filter(record => selected.includes(record.id));
            if (!chosen.length) return false;
            this.presentExportFormats(chosen);
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  private async shareHistory(records: ScanRecord[], exportFormat: HistoryExportFormat, content: HistoryExportContent) {
    const loading = await this.presentLoading(this.translate.instant('EXPORTING'));
    try {
      await this.historyExportService.exportAndShare(records, this.env.bookmarks, exportFormat, content);
    } catch (err) {
      await this.presentToast(
        this.env.isDebugging ? `Export failed: ${JSON.stringify(err)}` : this.translate.instant('MSG.EXPORT_FAILED'),
        this.env.isDebugging ? 'long' : 'short',
        'bottom'
      );
    } finally {
      await loading.dismiss();
    }
  }

  private async copyCodes(records: ScanRecord[]) {
    await this.historyExportService.copyCodes(records);
    await this.presentToast(this.translate.instant('COPIED'), 'short', 'bottom');
  }

  goSetting() {
    this.isLoading = true;
    this.changeDetectorRef.detach();
    this.env.viewingScanRecords = [];
    this.env.viewingBookmarks = [];
    this.changeDetectorRef.detectChanges();
    this.changeDetectorRef.reattach();
    this.router.navigate(['setting-record']);
  }

  get denominator() {
    return this.env.recordsLimit;
  }

  async presentAlert(msg: string, head: string, buttonText: string, buttonless: boolean = false): Promise<HTMLIonAlertElement> {
    let alert: any;
    if (!buttonless) {
      alert = await this.alertController.create({
        header: head,
        message: msg,
        cssClass: ['alert-bg'],
        buttons: [buttonText]
      });
    } else {
      alert = await this.alertController.create({
        header: head,
        message: msg,
        buttons: [],
        cssClass: ['alert-bg'],
        backdropDismiss: false
      });
    }
    await alert.present();
    return alert;
  }

  async presentLoading(msg: string): Promise<HTMLIonLoadingElement> {
    const loading = await this.loadingController.create({
      message: msg
    });
    await loading.present();
    return loading;
  }

  async presentToast(msg: string, duration: "short" | "long", pos: "top" | "center" | "bottom") {
    await Toast.show({
      text: msg,
      duration: duration,
      position: pos
    });
  }

  async tapHaptic() {
    if (this.env.vibration === 'on' || this.env.vibration === 'on-haptic') {
      await Haptics.impact({ style: ImpactStyle.Light })
        .catch(async err => {
          if (this.env.debugMode === 'on') {
            await Toast.show({ text: 'Err when Haptics.impact: ' + JSON.stringify(err), position: "top", duration: "long" })
          }
        })
    }
  }
}
