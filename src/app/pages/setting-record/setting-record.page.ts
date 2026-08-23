import { Component, ElementRef, ViewChild } from '@angular/core';
import { AlertController, LoadingController, ModalController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { EnvService } from 'src/app/services/env.service';
import { Toast } from '@capacitor/toast';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { format } from 'date-fns';
import { ScanRecord } from 'src/app/models/scan-record';
import { Bookmark } from 'src/app/models/bookmark';
import { Share } from '@capacitor/share';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Preferences } from '@capacitor/preferences';
import { de, enUS, fr, it } from 'date-fns/locale';
import { HistoryExportService } from 'src/app/services/history-export.service';
import { ICloudSyncService } from 'src/app/services/icloud-sync.service';

@Component({
  selector: 'app-setting-record',
  templateUrl: './setting-record.page.html',
  styleUrls: ['./setting-record.page.scss'],
  standalone: false
})
export class SettingRecordPage {

  @ViewChild('restoreFileInput') restoreFileInput?: ElementRef<HTMLInputElement>;

  preventRecordsLimitToast: boolean = true;
  iCloudEnabled = false;
  iCloudBusy = false;
  iCloudStatus = 'unknown';
  iCloudLastSync?: Date;

  constructor(
    public translate: TranslateService,
    public env: EnvService,
    // private encryptService: EncryptService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private platform: Platform,
    private modalController: ModalController,
    private historyExportService: HistoryExportService,
    public iCloudSync: ICloudSyncService,
  ) { }

  async ionViewDidEnter() {
    setTimeout(() => this.preventRecordsLimitToast = false, 100);
    if (this.iCloudSync.supported) {
      await this.env.waitForFullInit();
      this.iCloudEnabled = await this.iCloudSync.isEnabled();
      this.iCloudLastSync = await this.iCloudSync.lastSync();
      try { this.iCloudStatus = (await this.iCloudSync.accountStatus()).status; } catch { this.iCloudStatus = 'unknown'; }
    }
  }

  async onICloudToggle(enabled: boolean) {
    if (!enabled) {
      await this.iCloudSync.setEnabled(false);
      this.iCloudEnabled = false;
      return;
    }
    const alert = await this.alertController.create({
      header: this.translate.instant('ICLOUD_SYNC_ENABLE'),
      message: this.translate.instant('MSG.ICLOUD_SYNC_CONFIRM'),
      cssClass: ['alert-bg'],
      inputs: [{
        name: 'deviceLabel', type: 'text', value: this.env.deviceLabel,
        placeholder: this.translate.instant('ICLOUD_DEVICE_NAME_PLACEHOLDER'),
        attributes: { maxlength: 30, autocapitalize: 'sentences' },
      }],
      buttons: [
        { text: this.translate.instant('CANCEL'), role: 'cancel', handler: () => this.iCloudEnabled = false },
        { text: this.translate.instant('ENABLE'), handler: async (data) => {
          await this.env.setDeviceLabel(data?.deviceLabel);
          await this.iCloudSync.setEnabled(true);
          this.iCloudEnabled = true;
          await this.syncICloud();
        } },
      ],
    });
    await alert.present();
  }

  async editICloudDeviceLabel() {
    const alert = await this.alertController.create({
      header: this.translate.instant('ICLOUD_DEVICE_NAME'),
      message: this.translate.instant('MSG.ICLOUD_DEVICE_NAME_EXPLAIN'),
      cssClass: ['alert-bg'],
      inputs: [{
        name: 'deviceLabel', type: 'text', value: this.env.deviceLabel,
        placeholder: this.translate.instant('ICLOUD_DEVICE_NAME_PLACEHOLDER'),
        attributes: { maxlength: 30, autocapitalize: 'sentences' },
      }],
      buttons: [
        { text: this.translate.instant('CANCEL'), role: 'cancel' },
        { text: this.translate.instant('SAVE'), handler: async (data) => this.env.setDeviceLabel(data?.deviceLabel) },
      ],
    });
    await alert.present();
  }

  async syncICloud() {
    if (this.iCloudBusy) return;
    this.iCloudBusy = true;
    const loading = await this.presentLoading(this.translate.instant('ICLOUD_SYNC_IN_PROGRESS'));
    try {
      await this.env.waitForFullInit();
      const result = await this.iCloudSync.synchronize(this.env.scanRecords, this.env.bookmarks);
      await this.env.replaceSynchronizedData(result.records, result.bookmarks);
      this.iCloudLastSync = result.syncedAt;
      this.iCloudStatus = 'available';
      this.presentToast(this.translate.instant('MSG.ICLOUD_SYNC_SUCCESS'), 'short', 'bottom');
    } catch (error: any) {
      const reason = String(error?.message ?? error ?? 'unknown');
      if (reason === 'noAccount') {
        this.presentToast(this.translate.instant('MSG.ICLOUD_NO_ACCOUNT'), 'long', 'bottom');
      } else {
        const alert = await this.alertController.create({
          header: this.translate.instant('ICLOUD_SYNC_FAILED_TITLE'),
          message: `${this.translate.instant('MSG.ICLOUD_SYNC_FAILED')}<br><br><small>${this.describeICloudError(reason)}</small>`,
          cssClass: ['alert-bg'],
          buttons: [this.translate.instant('OK')],
        });
        await alert.present();
      }
    } finally {
      await loading.dismiss();
      this.iCloudBusy = false;
    }
  }

  private describeICloudError(reason: string): string {
    if (/not implemented|unimplemented/i.test(reason)) return this.translate.instant('MSG.ICLOUD_PLUGIN_MISSING');
    if (/not authenticated|no account/i.test(reason)) return this.translate.instant('MSG.ICLOUD_NO_ACCOUNT');
    if (/permission|not permitted|bad container|container.*not/i.test(reason)) return this.translate.instant('MSG.ICLOUD_PERMISSION_FAILED');
    if (/network|connection|offline/i.test(reason)) return this.translate.instant('MSG.ICLOUD_NETWORK_FAILED');
    // Keep the original Apple/CloudKit code visible during development so a
    // photographed error can be diagnosed without exposing any scan content.
    return reason.replace(/[<>]/g, '');
  }

  ionViewWillLeave() {
    this.preventRecordsLimitToast = true;
  }

  async onScanRecordLoggingChange(ev: any) {
    this.env.scanRecordLogging = ev ? 'on' : 'off';
    await Preferences.set({ key: this.env.KEY_SCAN_RECORD_LOGGING, value: this.env.scanRecordLogging });
    await this.tapHaptic();
  }

  async saveRecordsLimit() {
    await Preferences.set({ key: this.env.KEY_RECORDS_LIMIT, value: JSON.stringify(this.env.recordsLimit) });
    if (this.env.recordsLimit != -1 && !this.preventRecordsLimitToast) {
      this.presentToast(this.translate.instant("MSG.DELETE_OVERFLOWED_RECORDS"), "short", "bottom");
    }
  }

  async onShowNumberOfRecordsChange(ev: any) {
    this.env.showNumberOfRecords = ev ? 'on' : 'off';
    await Preferences.set({ key: this.env.KEY_SHOW_NUMBER_OF_RECORDS, value: this.env.showNumberOfRecords });
    await this.tapHaptic();
  }

  async onBackup() {
    // const loading1 = await this.presentLoading(this.translate.instant("ENCRYPTING"));
    const backup = {
      application: "QR Werk",
      scanRecords: this.env.scanRecords,
      bookmarks: this.env.bookmarks
    };
    const loading = await this.presentLoading(this.translate.instant("BACKING_UP"));
    const now = format(new Date(), "yyyyMMddHHmmss");
    const filename = `qr-werk-backup-${now}.txt`;
    await Filesystem.writeFile({
      path: `${filename}`,
      data: JSON.stringify(backup),
      directory: Directory.External,
      encoding: Encoding.UTF8,
      recursive: true
    }).then(
      async result => {
        loading.dismiss();
        // const msg = this.translate.instant("MSG.BACKUP_SUCCESSFULLY") as string;
        // const secret = `${value.secret1},${value.secret2}`;
        const alert = await this.alertController.create(
          {
            header: this.translate.instant('SUCCESS'),
            // message: msg.replace("{secret}", "(No Secret)"),
            cssClass: ['alert-bg', 'alert-can-copy'],
            buttons: [
              {
                text: this.translate.instant('COPY_SECRET_AND_SAVE_BACKUP'),
                handler: async () => {
                  const loading3 = await this.presentLoading(this.translate.instant("PLEASE_WAIT"));
                  try {
                    await Share.share({
                      title: filename,
                      files: [result.uri],
                      dialogTitle: this.translate.instant('COPY_SECRET_AND_SAVE_BACKUP'),
                    });
                  } catch (err) {
                    if (this.env.isDebugging) {
                      this.presentToast("Error when sharing backup: " + JSON.stringify(err), "long", "top");
                    }
                  } finally {
                    await loading3.dismiss();
                  }
                }
              }
            ]
          }
        )
        await alert.present();
      }
    ).catch(
      err => {
        loading.dismiss();
        if (this.env.isDebugging) {
          this.presentToast("Error when call Filesystem.writeFile: " + JSON.stringify(err), "long", "top");
        } else {
          this.presentToast(this.translate.instant("MSG.BACKUP_FAILED_2"), "short", "bottom");
        }
      }
    );
    // await this.encryptService.encrypt(JSON.stringify(backup)).then(
    //   async (value) => {
    //     // loading1.dismiss();

    //   }
    // ).catch(
    //   err => {
    //     loading1.dismiss();
    //     if (this.env.isDebugging) {
    //       this.presentToast("Error when encrypt: " + JSON.stringify(err), "long", "top");
    //     } else {
    //       this.presentToast(this.translate.instant("MSG.BACKUP_FAILED"), "short", "bottom");
    //     }
    //   }
    // )
  }

  async onRestore() {
    const input = this.restoreFileInput?.nativeElement;
    if (!input) return;
    input.value = '';
    input.click();
  }

  async onRestoreFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.item(0);
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.txt')) {
      this.presentToast(this.translate.instant('MSG.INVALID_BK_FILE'), 'short', 'bottom');
      return;
    }

    const loading = await this.presentLoading(this.translate.instant('PLEASE_WAIT'));
    try {
      await this.restore(await file.text());
    } catch (err) {
      if (this.env.isDebugging) {
        this.presentToast(`Failed to read backup: ${JSON.stringify(err)}`, 'long', 'bottom');
      } else {
        this.presentToast(this.translate.instant('MSG.RESTORE_FAILED'), 'short', 'bottom');
      }
    } finally {
      await loading.dismiss();
      input.value = '';
    }
  }

  async restore(value: string) {
    try {
      const restore = JSON.parse(value);
      // Keep backups created before the visible QR Werk rename and by the upstream app compatible.
      if (!["QR Werk", "QRWerk", "Simple QR"].includes(restore.application)) {
        this.presentToast(this.translate.instant("MSG.INVALID_BK_FILE"), "short", "bottom");
        return;
      }
      const tScanRecords = restore.scanRecords as ScanRecord[];
      const scanRecords = tScanRecords.filter(r1 => {
        if (this.env.scanRecords.find(r2 => r1.id === r2.id) == null) {
          return true;
        }
        return false;
      });
      await this.env.saveRestoredScanRecords(scanRecords);
      const tBookmarks = restore.bookmarks as Bookmark[];
      const bookmarks = tBookmarks.filter(b1 => {
        if (this.env.bookmarks.find(b2 => b1.text === b2.text) == null) {
          return true;
        }
        return false;
      });
      await this.env.saveRestoredBookmarks(bookmarks);
      const alert = await this.alertController.create(
        {
          header: this.translate.instant('SUCCESS'),
          message: this.translate.instant('MSG.RESTORE_SUCCESSFUL'),
          cssClass: ['alert-bg'],
          buttons: [
            {
              text: this.translate.instant('OK'),
              handler: async () => {
                return true;
              }
            }
          ]
        }
      )
      await alert.present();
    } catch (err) {
      if (this.env.isDebugging) {
        this.presentToast("Error when encrypt: " + JSON.stringify(err), "long", "top");
      } else {
        this.presentToast(this.translate.instant("MSG.RESTORE_FAILED"), "short", "bottom");
      }
    }
  }

  async onExportToCsv() {
    const loading = await this.presentLoading(this.translate.instant("EXPORTING"));
    try {
      await this.historyExportService.exportAndShare(this.env.scanRecords, this.env.bookmarks, 'csv');
    } catch (err) {
      this.presentToast(
        this.env.isDebugging ? `Export failed: ${JSON.stringify(err)}` : this.translate.instant('MSG.EXPORT_FAILED'),
        this.env.isDebugging ? 'long' : 'short',
        'bottom'
      );
    } finally {
      await loading.dismiss();
    }
  }

  maskDatetime(date: Date): string {
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
    return format(date, "PP pp", { locale: locale });
  }

  maskSource(source: 'create' | 'view' | 'scan' | 'external-share' | undefined): string {
    if (source == null) {
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
        return `${this.translate.instant("CREATED")}`;
      case 'view':
        return `${this.translate.instant("VIEWED")}`;
      case 'scan':
        return `${this.translate.instant("SCANNED")}`;
      case 'external-share':
        return `${this.translate.instant("EXTERNALLY_SHARED")}`;
    }
  }

  async presentToast(msg: string, duration: "short" | "long", pos: "top" | "center" | "bottom") {
    await Toast.show({
      text: msg,
      duration: duration,
      position: pos
    });
  }

  async presentLoading(msg: string): Promise<HTMLIonLoadingElement> {
    const loading = await this.loadingController.create({
      message: msg
    });
    await loading.present();
    return loading;
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

  get color() {
    switch (this.env.colorTheme) {
      case 'dark':
        return 'dark';
      case 'light':
        return 'white';
      case 'black':
        return 'black';
      default:
        return 'white';
    }
  }

  get isIOS() {
    return this.platform.is('ios');
  }
}
