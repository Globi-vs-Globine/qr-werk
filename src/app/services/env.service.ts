import { OverlayContainer } from '@angular/cdk/overlay';
import { Injectable } from '@angular/core';
import { Device, DeviceInfo } from '@capacitor/device';
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation/ngx';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { TranslateService } from '@ngx-translate/core';
import { format } from 'date-fns';
import { environment } from 'src/environments/environment';
import { Bookmark } from '../models/bookmark';
import { ScanRecord } from '../models/scan-record';
import { Toast } from '@capacitor/toast';
import { v4 as uuidv4 } from 'uuid';
import { Preferences } from '@capacitor/preferences';
import { Observable } from 'rxjs';
import { EdgeToEdge } from '@capawesome/capacitor-android-edge-to-edge-support';
import { StatusBar, Style } from '@capacitor/status-bar';
import { ICloudSyncService } from './icloud-sync.service';

export declare type LanguageType = 'de' | 'en' | 'fr' | 'it';
export declare type TabPageType = "/tabs/scan" | "/tabs/generate" | "/tabs/history" | "/tabs/setting";
export declare type HistoryPageSegmentType = 'history' | 'bookmarks';
export declare type OnOffType = "on" | "off";
export declare type ColorThemeType = 'light' | 'dark' | 'black';
export declare type AccentColorType = 'petrol' | 'blue' | 'violet' | 'green' | 'orange' | 'pink' | 'custom';
export declare type ErrorCorrectionLevelType = 'L' | 'M' | 'Q' | 'H';
export declare type VibrationType = "on" | "off" | 'on-haptic' | 'on-scanned';
export declare type OrientationType = 'portrait' | 'landscape';
export declare type SearchEngineType = 'google' | 'bing' | 'yahoo' | 'duckduckgo' | 'yandex' | 'ecosia' | 'brave';
export declare type ResultPageButtonsType = 'detailed' | 'icon-only';
export declare type QrResultContentTypeType = "freeText" | "url" | "contact" | "phone" | "sms" | "emailW3C" | "emailDocomo" | "wifi" | "geo";
export declare type QrCreateContentTypeType = "freeText" | "url" | "contact" | "phone" | "sms" | "emailW3C" | "emailDocomo" | "wifi" | "geo";

@Injectable({
  providedIn: 'root'
})
export class EnvService {

  public appVersionNumber: string = '0.9.0 (1)';

  public startPage: TabPageType = "/tabs/scan";
  public historyPageStartSegment: HistoryPageSegmentType = 'history';
  public startPageHeader: OnOffType = 'on';
  public languages: LanguageType[] = ['de', 'en', 'fr', 'it'];
  public language: LanguageType = 'en';
  public selectedLanguage: 'default' | LanguageType = 'default';
  public colorTheme: ColorThemeType = 'light';
  public selectedColorTheme: 'default' | ColorThemeType = 'default';
  public accentColor: AccentColorType = 'petrol';
  public customAccentColor: string = '#007f83';
  public scanRecordLogging: OnOffType = 'on';
  public recordsLimit: 30 | 50 | 100 | -1 = -1;
  public showNumberOfRecords: OnOffType = 'on';
  public autoMaxBrightness: OnOffType = 'off';
  public autoOpenUrl: OnOffType = 'off';
  public errorCorrectionLevel: ErrorCorrectionLevelType = 'M';
  public qrCodeLightR: number = 255;
  public qrCodeLightG: number = 255;
  public qrCodeLightB: number = 255;
  public qrCodeDarkR: number = 34;
  public qrCodeDarkG: number = 36;
  public qrCodeDarkB: number = 40;
  public qrCodeMargin: number = 3;
  public qrCodeFrameColor: string = '#007f83';
  public qrCodeFrameOpacity: number = 100;
  public qrCodeFrameWidth: number = 0;
  public vibration: VibrationType = 'on';
  public orientation: 'default' | OrientationType = 'default';
  public searchEngine: SearchEngineType = 'google';
  public resultPageButtons: ResultPageButtonsType = 'detailed';
  public showQrAfterCameraScan: OnOffType = 'off';
  public showQrAfterImageScan: OnOffType = 'off';
  public showQrAfterCreate: OnOffType = 'on';
  public showQrAfterLogView: OnOffType = 'on';
  public showQrAfterBookmarkView: OnOffType = 'on';
  public showQrAfterExternalShare: OnOffType = 'on';
  public showSearchButton: OnOffType = 'on';
  public showCopyButton: OnOffType = 'on';
  public showBase64Button: OnOffType = 'on';
  public showEnlargeButton: OnOffType = 'on';
  public showBookmarkButton: OnOffType = 'on';
  public showOpenUrlButton: OnOffType = 'on';
  public showBrowseButton: OnOffType = 'on';
  public showAddContactButton: OnOffType = 'on';
  public showCallButton: OnOffType = 'on';
  public showSendMessageButton: OnOffType = 'on';
  public showSendEmailButton: OnOffType = 'on';
  public showOpenFoodFactsButton: OnOffType = 'on';
  public showConnectWifiButton: OnOffType = 'on';
  public showExitAppAlert: OnOffType = "on";
  public debugMode: OnOffType = 'off';
  public autoExitAppMin: 1 | 3 | 5 | -1 = -1;

  public readonly KEY_START_PAGE = "start-page";
  public readonly KEY_HISTORY_PAGE_START_SEGMENT = "history-page-start-segment";
  public readonly KEY_START_PAGE_HEADER = "start-page-header";
  public readonly KEY_SCAN_RECORDS = "scanRecords";
  public readonly KEY_TRASHED_SCAN_RECORDS = "trashedScanRecords";
  public readonly KEY_BOOKMARKS = "bookmarks";
  public readonly KEY_LANGUAGE = "language";
  public readonly KEY_COLOR = "color";
  public readonly KEY_ACCENT_COLOR = "accent-color";
  public readonly KEY_CUSTOM_ACCENT_COLOR = "custom-accent-color";
  public readonly KEY_DEBUG_MODE = "debug-mode-on";
  public readonly KEY_SHOW_EXIT_APP_ALERT = "showExitAppAlert";
  public readonly KEY_ORIENTATION = "orientation";
  public readonly KEY_SCAN_RECORD_LOGGING = "scan-record-logging";
  public readonly KEY_RECORDS_LIMIT = "recordsLimit";
  public readonly KEY_SHOW_NUMBER_OF_RECORDS = "showNumberOfRecords";
  public readonly KEY_VIBRATION = "vibration";
  public readonly KEY_ERROR_CORRECTION_LEVEL = "error-correction-level";
  public readonly KEY_QR_CODE_LIGHT_R = "qrCodeLightR";
  public readonly KEY_QR_CODE_LIGHT_G = "qrCodeLightG";
  public readonly KEY_QR_CODE_LIGHT_B = "qrCodeLightB";
  public readonly KEY_QR_CODE_DARK_R = "qrCodeDarkR";
  public readonly KEY_QR_CODE_DARK_G = "qrCodeDarkG";
  public readonly KEY_QR_CODE_DARK_B = "qrCodeDarkB";
  public readonly KEY_QR_CODE_MARGIN = "qrCodeMargin";
  public readonly KEY_QR_CODE_FRAME_COLOR = "qrCodeFrameColor";
  public readonly KEY_QR_CODE_FRAME_OPACITY = "qrCodeFrameOpacity";
  public readonly KEY_QR_CODE_FRAME_WIDTH = "qrCodeFrameWidth";
  public readonly KEY_AUTO_MAX_BRIGHTNESS = "auto-max-brightness";
  public readonly KEY_AUTO_OPEN_URL = "auto-open-url";
  public readonly KEY_SEARCH_ENGINE = "search-engine";
  public readonly KEY_RESULT_PAGE_BUTTONS = "result-page-buttons";
  public readonly KEY_SHOW_QR_AFTER_CAMERA_SCAN = "show-qr-after-camera-scan";
  public readonly KEY_SHOW_QR_AFTER_IMAGE_SCAN = "show-qr-after-image-scan";
  public readonly KEY_SHOW_QR_AFTER_CREATE = "show-qr-after-create";
  public readonly KEY_SHOW_QR_AFTER_LOG_VIEW = "show-qr-after-log-view";
  public readonly KEY_SHOW_QR_AFTER_BOOKMARK_VIEW = "show-qr-after-bookmark-view";
  public readonly KEY_SHOW_QR_AFTER_EXTERNAL_SHARE = "show-qr-after-external-share";
  public readonly KEY_SHOW_SEARCH_BUTTON = "showSearchButton";
  public readonly KEY_SHOW_COPY_BUTTON = "showCopyButton";
  public readonly KEY_SHOW_BASE64_BUTTON = "showBase64Button";
  public readonly KEY_SHOW_ENLARGE_BUTTON = "showEnlargeButton";
  public readonly KEY_SHOW_BOOKMARK_BUTTON = "showBookmarkButton";
  public readonly KEY_SHOW_OPEN_URL_BUTTON = "showOpenUrlButton";
  public readonly KEY_SHOW_BROWSE_BUTTON = "showBrowseButton";
  public readonly KEY_SHOW_ADD_CONTACT_BUTTON = "showAddContactButton";
  public readonly KEY_SHOW_CALL_BUTTON = "showCallButton";
  public readonly KEY_SHOW_SEND_MESSAGE_BUTTON = "showSendMessageButton";
  public readonly KEY_SHOW_SEND_EMAIL_BUTTON = "showSendEmailButton";
  public readonly KEY_SHOW_OPEN_FOOD_FACTS_BUTTON = "showOpenFoodFactsButton";
  public readonly KEY_SHOW_CONNECT_WIFI_BUTTON = "showConnectWifiButton";
  public readonly KEY_AUTO_EXIT_MIN = "autoExitAppMin";
  public readonly KEY_ICLOUD_DEVICE_LABEL = "icloud-device-label";

  public readonly APP_FOLDER_NAME: string = 'QRWerk';

  public readonly GOOGLE_SEARCH_URL: string = "https://www.google.com/search?q=";
  public readonly BING_SEARCH_URL: string = "https://www.bing.com/search?q=";
  public readonly YAHOO_SEARCH_URL: string = "https://search.yahoo.com/search?p=";
  public readonly DUCK_DUCK_GO_SEARCH_URL: string = "https://duckduckgo.com/?q=";
  public readonly YANDEX_SEARCH_URL: string = "https://yandex.com/search/?text=";
  public readonly ECOSIA_SEARCH_URL: string = "https://www.ecosia.org/search?method=index&q=";
  public readonly BRAVE_SEARCH_URL: string = "https://search.brave.com/search?q=";

  public readonly GITHUB_REPO_URL: string = "https://github.com/Globi-vs-Globine/qr-werk";
  public readonly UPSTREAM_REPO_URL: string = "https://github.com/tomfong/simple-qr";
  public readonly GITHUB_RELEASE_URL: string = "https://github.com/Globi-vs-Globine/qr-werk/commits/main";
  public readonly PRIVACY_POLICY: string = "https://github.com/Globi-vs-Globine/qr-werk/blob/main/PRIVACY.md";
  public readonly LICENSE_URL: string = "https://github.com/Globi-vs-Globine/qr-werk/blob/main/LICENSE";

  resultContent: string = '';
  editingContent: boolean = false;
  resultContentFormat: string = '';
  isSharedContent: boolean = false;
  pendingLaunchUrlCheck: boolean = false; // Flag to track when we're checking for launch URL
  pendingShareNavigation: boolean = false; // Flag to track if we're navigating due to shared content
  scanRecords: ScanRecord[] = [];
  trashedScanRecords: ScanRecord[] = [];
  bookmarks: Bookmark[] = [];
  viewingScanRecords: ScanRecord[] = [];
  viewingBookmarks: Bookmark[] = [];
  private _deviceInfo: DeviceInfo | undefined = undefined;
  public deviceId = '';
  public deviceType = 'Gerät';
  public deviceLabel = 'Gerät';

  recordSource: 'create' | 'view' | 'scan' | 'external-share' | undefined;
  detailedRecordSource: 'create' | 'view-log' | 'view-bookmark' | 'scan-camera' | 'scan-image' | 'external-share' | undefined;
  viewResultFrom: '/tabs/scan' | '/tabs/generate' | '/tabs/history' | undefined;
  selectedScanRecordId: string | undefined;

  public firstAppLoad: boolean = true;  // once loaded, turn it false
  public openScannerOnNextScanEntry: boolean = false;

  initObservable: Observable<boolean> | undefined;

  private _criticalInitPromise: Promise<void> | undefined;
  private _fullInitPromise: Promise<void> | undefined;
  private systemDarkModeQuery: MediaQueryList | undefined;
  private readonly systemDarkModeChanged = (event: MediaQueryListEvent): void => {
    if (this.selectedColorTheme === 'default') {
      void this.applyColorTheme(event.matches ? 'dark' : 'light');
    }
  };

  constructor(
    private platform: Platform,
    private ionicStorage: Storage,
    public translate: TranslateService,
    private overlayContainer: OverlayContainer,
    private screenOrientation: ScreenOrientation,
    private iCloudSync: ICloudSyncService,
  ) {
    // Keep the original contract: pages can subscribe and get a single `true`
    // once the minimal startup preferences are ready (e.g. `startPage`).
    // Defer non-critical preference loading (records/bookmarks, etc.) to avoid
    // slowing down first render / initial navigation.
    this.initObservable = new Observable<boolean>(subs => {
      this.ensureCriticalInit()
        .then(() => {
          subs.next(true);
          subs.complete();
        })
        .catch(() => {
          // Don't block app start if preferences fail to load.
          subs.next(true);
          subs.complete();
        });
    });
  }

  private ensureCriticalInit(): Promise<void> {
    if (this._criticalInitPromise) return this._criticalInitPromise;
    this._criticalInitPromise = (async () => {
      await this.platform.ready();
      try {
        this._deviceInfo = await Device.getInfo();
        this.deviceType = this._deviceInfo.platform === 'ios'
          ? (this._deviceInfo.model?.toLowerCase().includes('ipad') ? 'iPad' : 'iPhone')
          : this._deviceInfo.platform;
        this.deviceLabel = this.deviceType;
        this.deviceId = (await Device.getId()).identifier;
      } catch {
        // Ignore
      }
      await this._loadStorageCritical();

      // Kick off the remaining preference/data loading in the background.
      // This keeps behavior the same, but moves work off the app's critical path.
      this.ensureFullInit();
    })();
    return this._criticalInitPromise;
  }

  private ensureFullInit(): Promise<void> {
    if (this._fullInitPromise) return this._fullInitPromise;
    this._fullInitPromise = (async () => {
      // Wait for critical init so we don't duplicate platform/device work.
      await this.ensureCriticalInit();
      await this._loadStorageDeferred();
    })();
    return this._fullInitPromise;
  }

  async waitForFullInit(): Promise<void> {
    await this.ensureCriticalInit();
    await this.ensureFullInit();
  }

  async replaceSynchronizedData(records: ScanRecord[], bookmarks: Bookmark[], trashedRecords: ScanRecord[] = []): Promise<void> {
    this.scanRecords = records.map(record => {
      record.createdAt = new Date(record.createdAt);
      if (record.modifiedAt) record.modifiedAt = new Date(record.modifiedAt);
      if (record.lastSyncedAt) record.lastSyncedAt = new Date(record.lastSyncedAt);
      if (record.lastDuplicateAt) record.lastDuplicateAt = new Date(record.lastDuplicateAt);
      if (record.duplicateDetectedAt) record.duplicateDetectedAt = record.duplicateDetectedAt.map(value => new Date(value));
      return record;
    }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    this.bookmarks = bookmarks.map(bookmark => {
      bookmark.createdAt = new Date(bookmark.createdAt);
      if (bookmark.modifiedAt) bookmark.modifiedAt = new Date(bookmark.modifiedAt);
      return bookmark;
    }).sort((a, b) => ('' + a.tag).localeCompare(b.tag ?? ''));
    this.trashedScanRecords = trashedRecords.map(record => {
      record.createdAt = new Date(record.createdAt);
      if (record.modifiedAt) record.modifiedAt = new Date(record.modifiedAt);
      if (record.deletedAt) record.deletedAt = new Date(record.deletedAt);
      return record;
    }).sort((a, b) => new Date(b.deletedAt || 0).getTime() - new Date(a.deletedAt || 0).getTime());
    await Promise.all([
      Preferences.set({ key: this.KEY_SCAN_RECORDS, value: JSON.stringify(this.scanRecords) }),
      Preferences.set({ key: this.KEY_BOOKMARKS, value: JSON.stringify(this.bookmarks) }),
      Preferences.set({ key: this.KEY_TRASHED_SCAN_RECORDS, value: JSON.stringify(this.trashedScanRecords) }),
    ]);
  }

  private async _loadStorageCritical(): Promise<void> {
    const savedDeviceLabel = await Preferences.get({ key: this.KEY_ICLOUD_DEVICE_LABEL });
    if (savedDeviceLabel.value?.trim()) this.deviceLabel = savedDeviceLabel.value.trim().slice(0, 30);
    const loadPromise1 = Preferences.get({ key: this.KEY_START_PAGE }).then(
      async result => {
        if (result.value != null) {
          this.startPage = result.value == '/tabs/import-image' ? '/tabs/scan' : result.value as TabPageType;
        } else {
          this.startPage = '/tabs/scan';
        }
      }
    );
    const loadPromise2 = Preferences.get({ key: this.KEY_HISTORY_PAGE_START_SEGMENT }).then(
      async result => {
        if (result.value != null) {
          this.historyPageStartSegment = result.value as HistoryPageSegmentType;
        } else {
          this.historyPageStartSegment = 'history';
        }
      }
    );
    const loadPromise3 = Preferences.get({ key: this.KEY_START_PAGE_HEADER }).then(
      async result => {
        if (result.value != null) {
          this.startPageHeader = result.value as OnOffType;
        } else {
          this.startPageHeader = 'on';
        }
      }
    );
    const loadPromise6 = Preferences.get({ key: this.KEY_LANGUAGE }).then(
      async result => {
        if (result.value != null) {
          this.selectedLanguage = result.value as 'default' | LanguageType;
        } else {
          this.selectedLanguage = 'default';
        }
        this.toggleLanguageChange();
      }
    );
    const loadPromise7 = Preferences.get({ key: this.KEY_COLOR }).then(
      async result => {
        if (result.value != null) {
          this.selectedColorTheme = result.value as 'default' | ColorThemeType;
        } else {
          this.selectedColorTheme = 'default';
        }
        await this.toggleColorTheme();
      }
    );
    const loadPromise7b = Promise.all([
      Preferences.get({ key: this.KEY_ACCENT_COLOR }),
      Preferences.get({ key: this.KEY_CUSTOM_ACCENT_COLOR })
    ]).then(([result, customResult]) => {
        this.customAccentColor = this.normalizeHexColor(customResult.value, '#007f83');
        this.accentColor = (result.value as AccentColorType | null) ?? 'petrol';
        this.applyAccentColor();
      }
    );
    const loadPromise10 = Preferences.get({ key: this.KEY_ORIENTATION }).then(
      async result => {
        if (result.value != null) {
          this.orientation = result.value as 'default' | OrientationType;
        } else {
          this.orientation = 'default';
        }
        await this.toggleOrientationChange();
      }
    );
    await Promise.allSettled([
      loadPromise1,
      loadPromise2,
      loadPromise3,
      loadPromise6,
      loadPromise7,
      loadPromise7b,
      loadPromise10,
    ]);
  }

  async setDeviceLabel(value?: string): Promise<void> {
    const normalized = (value ?? '').trim().replace(/\s+/g, ' ').slice(0, 30);
    this.deviceLabel = normalized || this.deviceType;
    await Preferences.set({ key: this.KEY_ICLOUD_DEVICE_LABEL, value: this.deviceLabel });
  }

  private notifyCloudDataChanged(): void {
    window.dispatchEvent(new CustomEvent('qrwerk:sync-data-changed'));
  }

  private async _loadStorageDeferred(): Promise<void> {
    const loadPromise4 = Preferences.get({ key: this.KEY_SCAN_RECORDS }).then(
      async result => {
        if (result.value != null) {
          try {
            this.scanRecords = JSON.parse(result.value);
            this.scanRecords.forEach(
              r => {
                const tCreatedAt = r.createdAt;
                r.createdAt = new Date(tCreatedAt);
                if (r.modifiedAt) r.modifiedAt = new Date(r.modifiedAt);
                if (r.lastSyncedAt) r.lastSyncedAt = new Date(r.lastSyncedAt);
                if (r.lastDuplicateAt) r.lastDuplicateAt = new Date(r.lastDuplicateAt);
                if (r.duplicateDetectedAt) r.duplicateDetectedAt = r.duplicateDetectedAt.map(value => new Date(value));
              }
            );
            this.scanRecords.sort((r1, r2) => {
              return r2.createdAt.getTime() - r1.createdAt.getTime();
            });
          } catch (err) {
            console.error(err);
            this.scanRecords = [];
          }
        }
      }
    );
    const loadPromise5 = Preferences.get({ key: this.KEY_BOOKMARKS }).then(
      async result => {
        if (result.value != null) {
          try {
            this.bookmarks = JSON.parse(result.value);
            this.bookmarks.forEach(
              b => {
                if (b.id == null) {
                  b.id = uuidv4();
                }
                const tCreatedAt = b.createdAt;
                b.createdAt = new Date(tCreatedAt);
              }
            );
            this.bookmarks.sort((a, b) => {
              return ('' + a.tag).localeCompare(b.tag ?? '');
            });
          } catch (err) {
            console.error(err);
            this.bookmarks = [];
          }
        }
      }
    )
    const loadTrash = Preferences.get({ key: this.KEY_TRASHED_SCAN_RECORDS }).then(result => {
      try {
        this.trashedScanRecords = result.value ? JSON.parse(result.value) : [];
        this.trashedScanRecords.forEach(record => {
          record.createdAt = new Date(record.createdAt);
          if (record.modifiedAt) record.modifiedAt = new Date(record.modifiedAt);
          if (record.deletedAt) record.deletedAt = new Date(record.deletedAt);
        });
        this.trashedScanRecords.sort((a, b) => new Date(b.deletedAt || 0).getTime() - new Date(a.deletedAt || 0).getTime());
      } catch { this.trashedScanRecords = []; }
    });
    const loadPromise8 = Preferences.get({ key: this.KEY_SHOW_EXIT_APP_ALERT }).then(
      async result => {
        if (result.value != null) {
          this.showExitAppAlert = result.value as OnOffType;
        } else {
          this.showExitAppAlert = 'on';
        }
      }
    );
    const loadPromise9 = Preferences.get({ key: this.KEY_DEBUG_MODE }).then(
      async result => {
        if (result.value != null) {
          this.debugMode = result.value as OnOffType;
        } else {
          this.debugMode = 'off';
        }
      }
    );
    const loadPromise11 = Preferences.get({ key: this.KEY_SCAN_RECORD_LOGGING }).then(
      async result => {
        if (result.value != null) {
          this.scanRecordLogging = result.value as OnOffType;
        } else {
          this.scanRecordLogging = 'on';
        }
      }
    );
    const loadPromise12 = Preferences.set({ key: this.KEY_RECORDS_LIMIT, value: JSON.stringify(-1) }).then(() => {
      this.recordsLimit = -1;
    });
    const loadPromise13 = Preferences.get({ key: this.KEY_SHOW_NUMBER_OF_RECORDS }).then(
      async result => {
        if (result.value != null) {
          this.showNumberOfRecords = result.value as OnOffType;
        } else {
          this.showNumberOfRecords = 'on';
        }
      }
    );
    const loadPromise14 = Preferences.get({ key: this.KEY_VIBRATION }).then(
      async result => {
        if (result.value != null) {
          this.vibration = result.value as VibrationType;
        } else {
          this.vibration = 'on';
        }
      }
    );
    const loadPromise15 = Preferences.get({ key: this.KEY_ERROR_CORRECTION_LEVEL }).then(
      async result => {
        if (result.value != null) {
          this.errorCorrectionLevel = result.value as ErrorCorrectionLevelType;
        } else {
          this.errorCorrectionLevel = 'M';
        }
      }
    );
    const loadPromise16 = Preferences.get({ key: this.KEY_QR_CODE_LIGHT_R }).then(
      async result => {
        if (result.value != null) {
          this.qrCodeLightR = JSON.parse(result.value);
        } else {
          this.qrCodeLightR = 255;
        }
      }
    );
    const loadPromise17 = Preferences.get({ key: this.KEY_QR_CODE_LIGHT_G }).then(
      async result => {
        if (result.value != null) {
          this.qrCodeLightG = JSON.parse(result.value);
        } else {
          this.qrCodeLightG = 255;
        }
      }
    );
    const loadPromise18 = Preferences.get({ key: this.KEY_QR_CODE_LIGHT_B }).then(
      async result => {
        if (result.value != null) {
          this.qrCodeLightB = JSON.parse(result.value);
        } else {
          this.qrCodeLightB = 255;
        }
      }
    );
    const loadPromise19 = Preferences.get({ key: this.KEY_QR_CODE_DARK_R }).then(
      async result => {
        if (result.value != null) {
          this.qrCodeDarkR = JSON.parse(result.value);
        } else {
          this.qrCodeDarkR = 34;
        }
      }
    );
    const loadPromise20 = Preferences.get({ key: this.KEY_QR_CODE_DARK_G }).then(
      async result => {
        if (result.value != null) {
          this.qrCodeDarkG = JSON.parse(result.value);
        } else {
          this.qrCodeDarkG = 36;
        }
      }
    );
    const loadPromise21 = Preferences.get({ key: this.KEY_QR_CODE_DARK_B }).then(
      async result => {
        if (result.value != null) {
          this.qrCodeDarkB = JSON.parse(result.value);
        } else {
          this.qrCodeDarkB = 40;
        }
      }
    );
    const loadPromise22 = Preferences.get({ key: this.KEY_QR_CODE_MARGIN }).then(
      async result => {
        if (result.value != null) {
          this.qrCodeMargin = JSON.parse(result.value);
        } else {
          this.qrCodeMargin = 3;
        }
      }
    );
    const loadPromise22b = Preferences.get({ key: this.KEY_QR_CODE_FRAME_COLOR }).then(result => {
      this.qrCodeFrameColor = this.normalizeHexColor(result.value, '#007f83');
    });
    const loadPromise22c = Preferences.get({ key: this.KEY_QR_CODE_FRAME_OPACITY }).then(result => {
      this.qrCodeFrameOpacity = result.value == null ? 100 : Math.max(0, Math.min(100, JSON.parse(result.value)));
    });
    const loadPromise22d = Preferences.get({ key: this.KEY_QR_CODE_FRAME_WIDTH }).then(result => {
      this.qrCodeFrameWidth = result.value == null ? 0 : Math.max(0, Math.min(24, JSON.parse(result.value)));
    });
    const loadPromise23 = Preferences.get({ key: this.KEY_AUTO_MAX_BRIGHTNESS }).then(
      async result => {
        if (result.value != null) {
          this.autoMaxBrightness = result.value as OnOffType;
        } else {
          this.autoMaxBrightness = 'off';
        }
      }
    );
    const loadPromise24 = Preferences.get({ key: this.KEY_AUTO_OPEN_URL }).then(
      async result => {
        if (result.value != null) {
          this.autoOpenUrl = result.value as OnOffType;
        } else {
          this.autoOpenUrl = 'off';
        }
      }
    );
    const loadPromise25 = Preferences.get({ key: this.KEY_SEARCH_ENGINE }).then(
      async result => {
        if (result.value != null) {
          this.searchEngine = result.value as SearchEngineType;
        } else {
          this.searchEngine = 'google';
        }
      }
    );
    const loadPromise26 = Preferences.get({ key: this.KEY_RESULT_PAGE_BUTTONS }).then(
      async result => {
        if (result.value != null) {
          this.resultPageButtons = result.value as ResultPageButtonsType;
        } else {
          this.resultPageButtons = 'detailed';
        }
      }
    );
    const loadPromise27 = Preferences.get({ key: this.KEY_SHOW_QR_AFTER_CAMERA_SCAN }).then(
      async result => {
        if (result.value != null) {
          this.showQrAfterCameraScan = result.value as OnOffType;
        } else {
          this.showQrAfterCameraScan = 'off';
        }
      }
    );
    const loadPromise28 = Preferences.get({ key: this.KEY_SHOW_QR_AFTER_IMAGE_SCAN }).then(
      async result => {
        if (result.value != null) {
          this.showQrAfterImageScan = result.value as OnOffType;
        } else {
          this.showQrAfterImageScan = 'off';
        }
      }
    );
    const loadPromise29 = Preferences.get({ key: this.KEY_SHOW_QR_AFTER_CREATE }).then(
      async result => {
        if (result.value != null) {
          this.showQrAfterCreate = result.value as OnOffType;
        } else {
          this.showQrAfterCreate = 'on';
        }
      }
    );
    const loadPromise30 = Preferences.get({ key: this.KEY_SHOW_QR_AFTER_LOG_VIEW }).then(
      async result => {
        if (result.value != null) {
          this.showQrAfterLogView = result.value as OnOffType;
        } else {
          this.showQrAfterLogView = 'on';
        }
      }
    );
    const loadPromise31 = Preferences.get({ key: this.KEY_SHOW_QR_AFTER_BOOKMARK_VIEW }).then(
      async result => {
        if (result.value != null) {
          this.showQrAfterBookmarkView = result.value as OnOffType;
        } else {
          this.showQrAfterBookmarkView = 'on';
        }
      }
    );
    const loadPromise31b = Preferences.get({ key: this.KEY_SHOW_QR_AFTER_EXTERNAL_SHARE }).then(
      async result => {
        if (result.value != null) {
          this.showQrAfterExternalShare = result.value as OnOffType;
        } else {
          this.showQrAfterExternalShare = 'on';
        }
      }
    );
    const loadPromise32 = Preferences.get({ key: this.KEY_SHOW_SEARCH_BUTTON }).then(
      async result => {
        if (result.value != null) {
          this.showSearchButton = result.value as OnOffType;
        } else {
          this.showSearchButton = 'on';
        }
      }
    );
    const loadPromise33 = Preferences.get({ key: this.KEY_SHOW_COPY_BUTTON }).then(
      async result => {
        if (result.value != null) {
          this.showCopyButton = result.value as OnOffType;
        } else {
          this.showCopyButton = 'on';
        }
      }
    );
    const loadPromise34 = Preferences.get({ key: this.KEY_SHOW_BASE64_BUTTON }).then(
      async result => {
        if (result.value != null) {
          this.showBase64Button = result.value as OnOffType;
        } else {
          this.showBase64Button = 'on';
        }
      }
    );
    const loadPromise35 = Preferences.get({ key: this.KEY_SHOW_ENLARGE_BUTTON }).then(
      async result => {
        if (result.value != null) {
          this.showEnlargeButton = result.value as OnOffType;
        } else {
          this.showEnlargeButton = 'on';
        }
      }
    );
    const loadPromise36 = Preferences.get({ key: this.KEY_SHOW_BOOKMARK_BUTTON }).then(
      async result => {
        if (result.value != null) {
          this.showBookmarkButton = result.value as OnOffType;
        } else {
          this.showBookmarkButton = 'on';
        }
      }
    );
    const loadPromise37 = Preferences.get({ key: this.KEY_SHOW_OPEN_URL_BUTTON }).then(
      async result => {
        if (result.value != null) {
          this.showOpenUrlButton = result.value as OnOffType;
        } else {
          this.showOpenUrlButton = 'on';
        }
      }
    );
    const loadPromise38 = Preferences.get({ key: this.KEY_SHOW_BROWSE_BUTTON }).then(
      async result => {
        if (result.value != null) {
          this.showBrowseButton = result.value as OnOffType;
        } else {
          this.showBrowseButton = 'on';
        }
      }
    );
    const loadPromise39 = Preferences.get({ key: this.KEY_SHOW_ADD_CONTACT_BUTTON }).then(
      async result => {
        if (result.value != null) {
          this.showAddContactButton = result.value as OnOffType;
        } else {
          this.showAddContactButton = 'on';
        }
      }
    );
    const loadPromise40 = Preferences.get({ key: this.KEY_SHOW_CALL_BUTTON }).then(
      async result => {
        if (result.value != null) {
          this.showCallButton = result.value as OnOffType;
        } else {
          this.showCallButton = 'on';
        }
      }
    );
    const loadPromise41 = Preferences.get({ key: this.KEY_SHOW_SEND_MESSAGE_BUTTON }).then(
      async result => {
        if (result.value != null) {
          this.showSendMessageButton = result.value as OnOffType;
        } else {
          this.showSendMessageButton = 'on';
        }
      }
    );
    const loadPromise42 = Preferences.get({ key: this.KEY_SHOW_SEND_EMAIL_BUTTON }).then(
      async result => {
        if (result.value != null) {
          this.showSendEmailButton = result.value as OnOffType;
        } else {
          this.showSendEmailButton = 'on';
        }
      }
    );
    const loadPromise43 = Preferences.get({ key: this.KEY_SHOW_OPEN_FOOD_FACTS_BUTTON }).then(
      async result => {
        if (result.value != null) {
          this.showOpenFoodFactsButton = result.value as OnOffType;
        } else {
          this.showOpenFoodFactsButton = 'on';
        }
      }
    );
    const loadPromise43b = Preferences.get({ key: this.KEY_SHOW_CONNECT_WIFI_BUTTON }).then(
      async result => {
        if (result.value != null) {
          this.showConnectWifiButton = result.value as OnOffType;
        } else {
          this.showConnectWifiButton = 'on';
        }
      }
    );
    const loadPromise44 = Preferences.get({ key: this.KEY_AUTO_EXIT_MIN }).then(
      async result => {
        if (result.value != null) {
          this.autoExitAppMin = JSON.parse(result.value);
        } else {
          this.autoExitAppMin = -1;
        }
      }
    );
    await Promise.allSettled([
      loadPromise4,
      loadPromise5,
      loadTrash,
      loadPromise8,
      loadPromise9,
      loadPromise11,
      loadPromise12,
      loadPromise13,
      loadPromise14,
      loadPromise15,
      loadPromise16,
      loadPromise17,
      loadPromise18,
      loadPromise19,
      loadPromise20,
      loadPromise21,
      loadPromise22,
      loadPromise22b,
      loadPromise22c,
      loadPromise22d,
      loadPromise23,
      loadPromise24,
      loadPromise25,
      loadPromise26,
      loadPromise27,
      loadPromise28,
      loadPromise29,
      loadPromise30,
      loadPromise31,
      loadPromise31b,
      loadPromise32,
      loadPromise33,
      loadPromise34,
      loadPromise35,
      loadPromise36,
      loadPromise37,
      loadPromise38,
      loadPromise39,
      loadPromise40,
      loadPromise41,
      loadPromise42,
      loadPromise43,
      loadPromise43b,
      loadPromise44,
    ]);
  }

  public async resetAll() {
    await Preferences.clear();
    this.startPage = '/tabs/scan';
    this.historyPageStartSegment = 'history';
    this.startPageHeader = 'on';
    this.selectedLanguage = 'default';
    this.toggleLanguageChange();
    this.selectedColorTheme = 'default';
    await this.toggleColorTheme();
    this.accentColor = 'petrol';
    this.applyAccentColor();
    this.scanRecordLogging = 'on';
    this.recordsLimit = -1;
    this.showNumberOfRecords = 'on';
    this.autoMaxBrightness = 'off';
    this.autoOpenUrl = 'off';
    this.errorCorrectionLevel = 'M';
    this.qrCodeLightR = 255;
    this.qrCodeLightG = 255;
    this.qrCodeLightB = 255;
    this.qrCodeDarkR = 34;
    this.qrCodeDarkG = 36;
    this.qrCodeDarkB = 40;
    this.qrCodeMargin = 3;
    this.vibration = 'on';
    this.orientation = 'default';
    await this.toggleOrientationChange();
    this.searchEngine = 'google';
    this.resultPageButtons = 'detailed';
    this.showQrAfterCameraScan = 'off';
    this.showQrAfterImageScan = 'off';
    this.showQrAfterCreate = 'on';
    this.showQrAfterLogView = 'on';
    this.showQrAfterBookmarkView = 'on';
    this.showQrAfterExternalShare = 'on';
    this.showSearchButton = 'on';
    this.showCopyButton = 'on';
    this.showBase64Button = 'on';
    this.showEnlargeButton = 'on';
    this.showBookmarkButton = 'on';
    this.showOpenUrlButton = 'on';
    this.showBrowseButton = 'on';
    this.showAddContactButton = 'on';
    this.showCallButton = 'on';
    this.showSendMessageButton = 'on';
    this.showSendEmailButton = 'on';
    this.showOpenFoodFactsButton = 'on';
    this.showConnectWifiButton = 'on';
    this.scanRecords = [];
    this.bookmarks = [];
    this.showExitAppAlert = 'on';
    this.debugMode = 'off';
    this.autoExitAppMin = -1;
  }

  public async resetData() {
    await this.deleteAllScanRecords();
    await this.deleteAllBookmarks();
  }

  public async resetSetting() {
    this.startPage = '/tabs/scan';
    await Preferences.set({ key: this.KEY_START_PAGE, value: this.startPage });

    this.historyPageStartSegment = 'history';
    await Preferences.set({ key: this.KEY_HISTORY_PAGE_START_SEGMENT, value: this.historyPageStartSegment });

    this.startPageHeader = 'on';
    await Preferences.set({ key: this.KEY_START_PAGE_HEADER, value: this.startPageHeader });

    this.selectedLanguage = 'default';
    this.toggleLanguageChange();
    await Preferences.set({ key: this.KEY_LANGUAGE, value: this.selectedLanguage });

    this.selectedColorTheme = 'default';
    await this.toggleColorTheme();
    await Preferences.set({ key: this.KEY_COLOR, value: this.selectedColorTheme });

    this.accentColor = 'petrol';
    this.applyAccentColor();
    await Preferences.set({ key: this.KEY_ACCENT_COLOR, value: this.accentColor });

    this.scanRecordLogging = 'on';
    await Preferences.set({ key: this.KEY_SCAN_RECORD_LOGGING, value: this.scanRecordLogging });

    this.recordsLimit = -1;
    await Preferences.set({ key: this.KEY_RECORDS_LIMIT, value: JSON.stringify(this.recordsLimit) });

    this.showNumberOfRecords = 'on';
    await Preferences.set({ key: this.KEY_SHOW_NUMBER_OF_RECORDS, value: this.showNumberOfRecords });

    this.autoMaxBrightness = 'off';
    await Preferences.set({ key: this.KEY_AUTO_MAX_BRIGHTNESS, value: this.autoMaxBrightness });

    this.autoOpenUrl = 'off';
    await Preferences.set({ key: this.KEY_AUTO_OPEN_URL, value: this.autoOpenUrl });

    this.errorCorrectionLevel = 'M';
    await Preferences.set({ key: this.KEY_ERROR_CORRECTION_LEVEL, value: this.errorCorrectionLevel });

    this.qrCodeLightR = 255;
    await Preferences.set({ key: this.KEY_QR_CODE_LIGHT_R, value: JSON.stringify(this.qrCodeLightR) });

    this.qrCodeLightG = 255;
    await Preferences.set({ key: this.KEY_QR_CODE_LIGHT_G, value: JSON.stringify(this.qrCodeLightG) });

    this.qrCodeLightB = 255;
    await Preferences.set({ key: this.KEY_QR_CODE_LIGHT_B, value: JSON.stringify(this.qrCodeLightB) });

    this.qrCodeDarkR = 34;
    await Preferences.set({ key: this.KEY_QR_CODE_DARK_R, value: JSON.stringify(this.qrCodeDarkR) });

    this.qrCodeDarkG = 36;
    await Preferences.set({ key: this.KEY_QR_CODE_DARK_G, value: JSON.stringify(this.qrCodeDarkG) });

    this.qrCodeDarkB = 40;
    await Preferences.set({ key: this.KEY_QR_CODE_DARK_B, value: JSON.stringify(this.qrCodeDarkB) });

    this.qrCodeMargin = 3;
    await Preferences.set({ key: this.KEY_QR_CODE_MARGIN, value: JSON.stringify(this.qrCodeMargin) });
    this.qrCodeFrameColor = '#007f83';
    this.qrCodeFrameOpacity = 100;
    this.qrCodeFrameWidth = 0;
    await Preferences.set({ key: this.KEY_QR_CODE_FRAME_COLOR, value: this.qrCodeFrameColor });
    await Preferences.set({ key: this.KEY_QR_CODE_FRAME_OPACITY, value: JSON.stringify(this.qrCodeFrameOpacity) });
    await Preferences.set({ key: this.KEY_QR_CODE_FRAME_WIDTH, value: JSON.stringify(this.qrCodeFrameWidth) });
    this.vibration = 'on';
    await Preferences.set({ key: this.KEY_VIBRATION, value: this.vibration });

    this.orientation = 'default';
    await this.toggleOrientationChange();
    await Preferences.set({ key: this.KEY_ORIENTATION, value: this.orientation });

    this.searchEngine = 'google';
    await Preferences.set({ key: this.KEY_SEARCH_ENGINE, value: this.searchEngine });

    this.resultPageButtons = 'detailed';
    await Preferences.set({ key: this.KEY_RESULT_PAGE_BUTTONS, value: this.resultPageButtons });

    this.showQrAfterCameraScan = 'off';
    await Preferences.set({ key: this.KEY_SHOW_QR_AFTER_CAMERA_SCAN, value: this.showQrAfterCameraScan });

    this.showQrAfterImageScan = 'off';
    await Preferences.set({ key: this.KEY_SHOW_QR_AFTER_IMAGE_SCAN, value: this.showQrAfterImageScan });

    this.showQrAfterCreate = 'on';
    await Preferences.set({ key: this.KEY_SHOW_QR_AFTER_CREATE, value: this.showQrAfterCreate });

    this.showQrAfterLogView = 'on';
    await Preferences.set({ key: this.KEY_SHOW_QR_AFTER_LOG_VIEW, value: this.showQrAfterLogView });

    this.showQrAfterBookmarkView = 'on';
    await Preferences.set({ key: this.KEY_SHOW_QR_AFTER_BOOKMARK_VIEW, value: this.showQrAfterBookmarkView });

    this.showQrAfterExternalShare = 'on';
    await Preferences.set({ key: this.KEY_SHOW_QR_AFTER_EXTERNAL_SHARE, value: this.showQrAfterExternalShare });

    this.showSearchButton = 'on';
    await Preferences.set({ key: this.KEY_SHOW_SEARCH_BUTTON, value: this.showSearchButton });

    this.showCopyButton = 'on';
    await Preferences.set({ key: this.KEY_SHOW_COPY_BUTTON, value: this.showCopyButton });

    this.showBase64Button = 'on';
    await Preferences.set({ key: this.KEY_SHOW_BASE64_BUTTON, value: this.showBase64Button });

    this.showEnlargeButton = 'on';
    await Preferences.set({ key: this.KEY_SHOW_ENLARGE_BUTTON, value: this.showEnlargeButton });

    this.showBookmarkButton = 'on';
    await Preferences.set({ key: this.KEY_SHOW_BOOKMARK_BUTTON, value: this.showBookmarkButton });

    this.showOpenUrlButton = 'on';
    await Preferences.set({ key: this.KEY_SHOW_OPEN_URL_BUTTON, value: this.showOpenUrlButton });

    this.showBrowseButton = 'on';
    await Preferences.set({ key: this.KEY_SHOW_BROWSE_BUTTON, value: this.showBrowseButton });

    this.showAddContactButton = 'on';
    await Preferences.set({ key: this.KEY_SHOW_ADD_CONTACT_BUTTON, value: this.showAddContactButton });

    this.showCallButton = 'on';
    await Preferences.set({ key: this.KEY_SHOW_CALL_BUTTON, value: this.showCallButton });

    this.showSendMessageButton = 'on';
    await Preferences.set({ key: this.KEY_SHOW_SEND_MESSAGE_BUTTON, value: this.showSendMessageButton });

    this.showSendEmailButton = 'on';
    await Preferences.set({ key: this.KEY_SHOW_SEND_EMAIL_BUTTON, value: this.showSendEmailButton });

    this.showOpenFoodFactsButton = 'on';
    await Preferences.set({ key: this.KEY_SHOW_OPEN_FOOD_FACTS_BUTTON, value: this.showOpenFoodFactsButton });

    this.showConnectWifiButton = 'on';
    await Preferences.set({ key: this.KEY_SHOW_CONNECT_WIFI_BUTTON, value: this.showConnectWifiButton });

    this.showExitAppAlert = 'on';
    await Preferences.set({ key: this.KEY_SHOW_EXIT_APP_ALERT, value: this.showExitAppAlert });

    this.debugMode = 'off';
    await Preferences.set({ key: this.KEY_DEBUG_MODE, value: this.debugMode });

    this.autoExitAppMin = -1;
    await Preferences.set({ key: this.KEY_AUTO_EXIT_MIN, value: JSON.stringify(this.autoExitAppMin) });
  }

  async resetQrCodeSettings() {
    this.errorCorrectionLevel = 'M';
    await Preferences.set({ key: this.KEY_ERROR_CORRECTION_LEVEL, value: this.errorCorrectionLevel });

    this.qrCodeLightR = 255;
    await Preferences.set({ key: this.KEY_QR_CODE_LIGHT_R, value: JSON.stringify(this.qrCodeLightR) });

    this.qrCodeLightG = 255;
    await Preferences.set({ key: this.KEY_QR_CODE_LIGHT_G, value: JSON.stringify(this.qrCodeLightG) });

    this.qrCodeLightB = 255;
    await Preferences.set({ key: this.KEY_QR_CODE_LIGHT_B, value: JSON.stringify(this.qrCodeLightB) });

    this.qrCodeDarkR = 34;
    await Preferences.set({ key: this.KEY_QR_CODE_DARK_R, value: JSON.stringify(this.qrCodeDarkR) });

    this.qrCodeDarkG = 36;
    await Preferences.set({ key: this.KEY_QR_CODE_DARK_G, value: JSON.stringify(this.qrCodeDarkG) });

    this.qrCodeDarkB = 40;
    await Preferences.set({ key: this.KEY_QR_CODE_DARK_B, value: JSON.stringify(this.qrCodeDarkB) });

    this.qrCodeMargin = 3;
    await Preferences.set({ key: this.KEY_QR_CODE_MARGIN, value: JSON.stringify(this.qrCodeMargin) });
    this.qrCodeFrameColor = '#007f83';
    this.qrCodeFrameOpacity = 100;
    this.qrCodeFrameWidth = 0;
    await Preferences.set({ key: this.KEY_QR_CODE_FRAME_COLOR, value: this.qrCodeFrameColor });
    await Preferences.set({ key: this.KEY_QR_CODE_FRAME_OPACITY, value: JSON.stringify(this.qrCodeFrameOpacity) });
    await Preferences.set({ key: this.KEY_QR_CODE_FRAME_WIDTH, value: JSON.stringify(this.qrCodeFrameWidth) });
  }

  async saveScanRecord(value: string, group?: string): Promise<void> {
    const record = new ScanRecord();
    const date = new Date();
    record.id = uuidv4();
    record.text = value;
    record.createdAt = date;
    record.modifiedAt = date;
    record.originDeviceId = this.deviceId;
    record.originDeviceType = this.deviceLabel;
    record.lastModifiedDeviceId = this.deviceId;
    record.lastModifiedDeviceType = this.deviceLabel;
    record.group = group?.trim() || undefined;
    if (this.recordSource != null) {
      record.source = this.recordSource;
      if (this.recordSource == 'scan') {
        record.barcodeType = this.resultContentFormat;
      }
    } else {
      record.source = "view";
    }
    if (this.scanRecords == null) {
      this.scanRecords = [];
    }
    this.scanRecords.unshift(record);
    if (this.recordsLimit != -1) {
      if (this.scanRecords.length > this.recordsLimit) {
        this.scanRecords = this.scanRecords.slice(0, this.recordsLimit);
      }
    }
    try {
      const stringified = JSON.stringify(this.scanRecords);
      await Preferences.set({ key: this.KEY_SCAN_RECORDS, value: stringified });
      this.notifyCloudDataChanged();
    } catch (e) {
      if (this.isDebugging) {
        this.presentToast("Err when stringify scanRecords: " + JSON.stringify(e), "long", "top");
      }
    }
  }

  private markRecordModified(record: ScanRecord): void {
    record.modifiedAt = new Date();
    record.lastModifiedDeviceId = this.deviceId;
    record.lastModifiedDeviceType = this.deviceLabel;
  }

  async recordDuplicateScan(value: string): Promise<boolean> {
    const record = this.scanRecords.find(item => item.text.trim() === value.trim());
    if (!record) return false;
    record.duplicateCount = (record.duplicateCount ?? 0) + 1;
    record.lastDuplicateAt = new Date();
    record.duplicateDetectedAt = [...(record.duplicateDetectedAt ?? []), record.lastDuplicateAt];
    this.markRecordModified(record);
    await Preferences.set({
      key: this.KEY_SCAN_RECORDS,
      value: JSON.stringify(this.scanRecords),
    });
    this.notifyCloudDataChanged();
    return true;
  }

  async setScanRecordGroup(id: string, group?: string): Promise<void> {
    const record = this.scanRecords.find(item => item.id === id);
    if (!record) return;
    record.group = group?.trim() || undefined;
    this.markRecordModified(record);
    await Preferences.set({
      key: this.KEY_SCAN_RECORDS,
      value: JSON.stringify(this.scanRecords),
    });
    this.notifyCloudDataChanged();
  }

  async removeScanRecordGroup(group: string): Promise<void> {
    this.scanRecords
      .filter(record => record.group === group)
      .forEach(record => { delete record.group; this.markRecordModified(record); });
    await Preferences.set({
      key: this.KEY_SCAN_RECORDS,
      value: JSON.stringify(this.scanRecords),
    });
    this.notifyCloudDataChanged();
  }

  async renameScanRecordGroup(previousGroup: string, newGroup: string): Promise<void> {
    this.scanRecords
      .filter(record => record.group === previousGroup)
      .forEach(record => { record.group = newGroup.trim(); this.markRecordModified(record); });
    await Preferences.set({
      key: this.KEY_SCAN_RECORDS,
      value: JSON.stringify(this.scanRecords),
    });
    this.notifyCloudDataChanged();
  }

  async saveRestoredScanRecords(records: ScanRecord[]): Promise<void> {
    records.forEach(
      r => {
        this.scanRecords.unshift(r);
      }
    );
    this.scanRecords.forEach(
      t => {
        const tCreatedAt = t.createdAt;
        t.createdAt = new Date(tCreatedAt);
      }
    );
    this.scanRecords.sort((r1, r2) => {
      return r2.createdAt!.getTime() - r1.createdAt!.getTime();
    });
    try {
      const stringified = JSON.stringify(this.scanRecords);
      await Preferences.set({ key: this.KEY_SCAN_RECORDS, value: stringified });
      this.notifyCloudDataChanged();
    } catch (e) {
      if (this.isDebugging) {
        this.presentToast("Err when stringify scanRecords: " + JSON.stringify(e), "long", "top");
      }
    }
  }

  async saveRestoredBookmarks(bookmarks: Bookmark[]): Promise<void> {
    bookmarks.forEach(
      b => {
        this.bookmarks.unshift(b);
      }
    );
    this.bookmarks.forEach(
      b => {
        if (b.id == null) {
          b.id = uuidv4();
        }
        const tCreatedAt = b.createdAt;
        b.createdAt = new Date(tCreatedAt);
      }
    );
    this.bookmarks.sort((a, b) => {
      return ('' + a.tag).localeCompare(b.tag ?? '');
    });
    try {
      const stringified = JSON.stringify(this.bookmarks);
      await Preferences.set({ key: this.KEY_BOOKMARKS, value: stringified });
      this.notifyCloudDataChanged();
    } catch (e) {
      if (this.isDebugging) {
        this.presentToast("Err when stringify bookmarks: " + JSON.stringify(e), "long", "top");
      }
    }
  }

  async undoScanRecordDeletion(record: ScanRecord): Promise<void> {
    await this.iCloudSync.undoRecordDeletion(record.id);
    this.trashedScanRecords = this.trashedScanRecords.filter(item => item.id !== record.id);
    delete record.deletedAt;
    this.markRecordModified(record);
    this.scanRecords.push(record);
    this.scanRecords.sort((r1, r2) => {
      return r2.createdAt.getTime() - r1.createdAt.getTime();
    });
    try {
      const stringified = JSON.stringify(this.scanRecords);
      await Promise.all([
        Preferences.set({ key: this.KEY_SCAN_RECORDS, value: stringified }),
        Preferences.set({ key: this.KEY_TRASHED_SCAN_RECORDS, value: JSON.stringify(this.trashedScanRecords) }),
      ]);
      this.notifyCloudDataChanged();
    } catch (e) {
      if (this.isDebugging) {
        this.presentToast("Err when stringify scanRecords: " + JSON.stringify(e), "long", "top");
      }
    }
  }

  async deleteScanRecord(recordId: string, synchronizeDeletion = true): Promise<void> {
    const index = this.scanRecords.findIndex(r => r.id === recordId);
    if (index !== -1) {
      if (synchronizeDeletion && await this.iCloudSync.isEnabled()) await this.iCloudSync.markRecordsDeleted([recordId]);
      const [record] = this.scanRecords.splice(index, 1);
      record.deletedAt = new Date();
      this.trashedScanRecords = [record, ...this.trashedScanRecords.filter(item => item.id !== record.id)];
      try {
        const stringified = JSON.stringify(this.scanRecords);
        await Promise.all([
          Preferences.set({ key: this.KEY_SCAN_RECORDS, value: stringified }),
          Preferences.set({ key: this.KEY_TRASHED_SCAN_RECORDS, value: JSON.stringify(this.trashedScanRecords) }),
        ]);
        this.notifyCloudDataChanged();
      } catch (e) {
        if (this.isDebugging) {
          this.presentToast("Err when stringify scanRecords: " + JSON.stringify(e), "long", "top");
        }
      }
    }
  }

  async restoreTrashedScanRecord(recordId: string): Promise<void> {
    const record = this.trashedScanRecords.find(item => item.id === recordId);
    if (!record) return;
    await this.undoScanRecordDeletion(record);
  }

  async permanentlyDeleteTrashedScanRecord(recordId: string): Promise<void> {
    if (await this.iCloudSync.isEnabled()) await this.iCloudSync.markRecordsPurged([recordId]);
    this.trashedScanRecords = this.trashedScanRecords.filter(item => item.id !== recordId);
    await Preferences.set({ key: this.KEY_TRASHED_SCAN_RECORDS, value: JSON.stringify(this.trashedScanRecords) });
    this.notifyCloudDataChanged();
  }

  async emptyTrash(): Promise<void> {
    if (await this.iCloudSync.isEnabled()) await this.iCloudSync.markRecordsPurged(this.trashedScanRecords.map(record => record.id));
    this.trashedScanRecords = [];
    await Preferences.set({ key: this.KEY_TRASHED_SCAN_RECORDS, value: '[]' });
    this.notifyCloudDataChanged();
  }

  async deleteAllScanRecords(synchronizeDeletion = true): Promise<void> {
    if (synchronizeDeletion && await this.iCloudSync.isEnabled()) {
      await this.iCloudSync.markRecordsDeleted(this.scanRecords.map(record => record.id));
    }
    this.scanRecords = [];
    try {
      const stringified = JSON.stringify(this.scanRecords);
      await Preferences.set({ key: this.KEY_SCAN_RECORDS, value: stringified });
      this.notifyCloudDataChanged();
    } catch (e) {
      if (this.isDebugging) {
        this.presentToast("Err when stringify scanRecords: " + JSON.stringify(e), "long", "top");
      }
    }
  }

  async saveBookmark(value: string, tag: string): Promise<Bookmark | null> {
    const index = this.bookmarks.findIndex(x => x.text === value);
    if (index === -1) {
      const bookmark = new Bookmark();
      const date = new Date();
      bookmark.id = uuidv4();
      bookmark.text = value;
      bookmark.createdAt = date;
      bookmark.modifiedAt = date;
      bookmark.originDeviceId = this.deviceId;
      bookmark.originDeviceType = this.deviceLabel;
      bookmark.lastModifiedDeviceId = this.deviceId;
      bookmark.lastModifiedDeviceType = this.deviceLabel;
      bookmark.tag = tag;
      this.bookmarks.unshift(bookmark);
      this.bookmarks.sort((a, b) => {
        return ('' + a.tag).localeCompare(b.tag ?? '');
      });
      try {
        const stringified = JSON.stringify(this.bookmarks);
        await Preferences.set({ key: this.KEY_BOOKMARKS, value: stringified });
        this.notifyCloudDataChanged();
      } catch (e) {
        if (this.isDebugging) {
          this.presentToast("Err when stringify bookmarks: " + JSON.stringify(e), "long", "top");
        }
      }
      return bookmark;
    } else {
      return null;
    }
  }

  async undoBookmarkDeletion(bookmark: Bookmark): Promise<void> {
    await this.iCloudSync.undoBookmarkDeletion(bookmark.id);
    this.bookmarks.push(bookmark);
    this.bookmarks.sort((a, b) => {
      return ('' + a.tag).localeCompare(b.tag ?? '');
    });
    try {
      const stringified = JSON.stringify(this.bookmarks);
      await Preferences.set({ key: this.KEY_BOOKMARKS, value: stringified });
      this.notifyCloudDataChanged();
    } catch (e) {
      if (this.isDebugging) {
        this.presentToast("Err when stringify bookmarks: " + JSON.stringify(e), "long", "top");
      }
    }
  }

  async deleteBookmark(text: string, synchronizeDeletion = true): Promise<void> {
    const index = this.bookmarks.findIndex(t => t.text === text);
    if (index !== -1) {
      const bookmarkId = this.bookmarks[index].id;
      if (synchronizeDeletion && bookmarkId && await this.iCloudSync.isEnabled()) await this.iCloudSync.markBookmarksDeleted([bookmarkId]);
      this.bookmarks.splice(index, 1);
      try {
        const stringified = JSON.stringify(this.bookmarks);
        await Preferences.set({ key: this.KEY_BOOKMARKS, value: stringified });
        this.notifyCloudDataChanged();
      } catch (e) {
        if (this.isDebugging) {
          this.presentToast("Err when stringify bookmarks: " + JSON.stringify(e), "long", "top");
        }
      }
    }
  }

  async deleteAllBookmarks(synchronizeDeletion = true): Promise<void> {
    if (synchronizeDeletion && await this.iCloudSync.isEnabled()) {
      await this.iCloudSync.markBookmarksDeleted(this.bookmarks.map(bookmark => bookmark.id).filter((id): id is string => !!id));
    }
    this.bookmarks = [];
    try {
      const stringified = JSON.stringify(this.bookmarks);
      await Preferences.set({ key: this.KEY_BOOKMARKS, value: stringified });
      this.notifyCloudDataChanged();
    } catch (e) {
      if (this.isDebugging) {
        this.presentToast("Err when stringify bookmarks: " + JSON.stringify(e), "long", "top");
      }
    }
  }

  toggleLanguageChange() {
    if (this.selectedLanguage == 'default') {
      let language = 'en';
      const browserCultureLang = this.translate.getBrowserCultureLang();
      if (browserCultureLang == null) {
        language = 'en';
      } else {
        const lang = browserCultureLang.slice(0, 2)?.toLowerCase();
        switch (lang) {
          case "de":
            language = "de";
            break;
          case "en":
            language = "en"
            break;
          case "fr":
            language = "fr"
            break;
          case "it":
            language = "it"
            break;
          default:
            language = 'en';
        }
      }
      this.translate.use(language);
      this.language = language as LanguageType;
    } else {
      this.translate.use(this.selectedLanguage);
      this.language = this.selectedLanguage;
    }
  }

  async toggleColorTheme(): Promise<void> {
    this.stopWatchingSystemColorTheme();
    if (this.selectedColorTheme === 'default') {
      this.systemDarkModeQuery = window.matchMedia?.('(prefers-color-scheme: dark)');
      this.systemDarkModeQuery?.addEventListener('change', this.systemDarkModeChanged);
      await this.applyColorTheme(this.systemDarkModeQuery?.matches ? 'dark' : 'light');
      return;
    }
    await this.applyColorTheme(this.selectedColorTheme);
  }

  private stopWatchingSystemColorTheme(): void {
    this.systemDarkModeQuery?.removeEventListener('change', this.systemDarkModeChanged);
    this.systemDarkModeQuery = undefined;
  }

  private async applyColorTheme(theme: ColorThemeType): Promise<void> {
    this.colorTheme = theme;
    document.body.classList.toggle('dark', theme === 'dark');
    document.body.classList.toggle('black', theme === 'black');

    const overlayClasses = this.overlayContainer.getContainerElement().classList;
    overlayClasses.remove('ng-mat-light', 'ng-mat-dark', 'ng-mat-black');
    overlayClasses.add(`ng-mat-${theme}`);

    if (this.platform.is('android')) {
      await EdgeToEdge.setBackgroundColor({ color: theme === 'dark' ? '#1f1f1f' : '#000000' });
      await StatusBar.setStyle({ style: Style.Dark });
    }
  }

  applyAccentColor(): void {
    const colors: Record<Exclude<AccentColorType, 'custom'>, string> = {
      petrol: '#007f83',
      blue: '#0068b8',
      violet: '#6d4bc3',
      green: '#287a43',
      orange: '#a64b00',
      pink: '#a83a72',
    };
    const hex = this.accentColor === 'custom'
      ? this.normalizeHexColor(this.customAccentColor, colors.petrol)
      : colors[this.accentColor] ?? colors.petrol;
    const red = parseInt(hex.slice(1, 3), 16);
    const green = parseInt(hex.slice(3, 5), 16);
    const blue = parseInt(hex.slice(5, 7), 16);
    const mix = (value: number, target: number, amount: number) =>
      Math.round(value + (target - value) * amount);
    const toHex = (value: number) => value.toString(16).padStart(2, '0');
    const shade = `#${toHex(mix(red, 0, 0.12))}${toHex(mix(green, 0, 0.12))}${toHex(mix(blue, 0, 0.12))}`;
    const tint = `#${toHex(mix(red, 255, 0.14))}${toHex(mix(green, 255, 0.14))}${toHex(mix(blue, 255, 0.14))}`;
    const targets = [document.documentElement.style, document.body.style];

    targets.forEach(target => ['primary', 'secondary', 'tertiary'].forEach(name => {
      target.setProperty(`--ion-color-${name}`, hex);
      target.setProperty(`--ion-color-${name}-rgb`, `${red}, ${green}, ${blue}`);
      target.setProperty(`--ion-color-${name}-contrast`, '#ffffff');
      target.setProperty(`--ion-color-${name}-contrast-rgb`, '255, 255, 255');
      target.setProperty(`--ion-color-${name}-shade`, shade);
      target.setProperty(`--ion-color-${name}-tint`, tint);
    }));
    targets.forEach(target => {
      target.setProperty('--qrwerk-accent', hex);
      target.setProperty('--qrwerk-accent-rgb', `${red}, ${green}, ${blue}`);
    });
  }

  normalizeHexColor(value: string | null | undefined, fallback: string): string {
    return /^#[0-9a-f]{6}$/i.test(value ?? '') ? (value as string).toLowerCase() : fallback;
  }

  async toggleOrientationChange(): Promise<void> {
    switch (this.orientation) {
      case 'default':
        this.screenOrientation.unlock();
        return;
      case 'portrait':
        await this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT)
          .catch(err => {
            if (this.isDebugging) {
              this.presentToast("Error when ScreenOrientation.lock(p): " + JSON.stringify(err), "long", "top");
            }
          });
        return;
      case 'landscape':
        await this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE)
          .catch(err => {
            if (this.isDebugging) {
              this.presentToast("Error when ScreenOrientation.lock(l): " + JSON.stringify(err), "long", "top");
            }
          });
        return;
      default:
        this.screenOrientation.unlock();
    }
  }

  getBugReportMailContent(): string {
    const toEmail = "tomfong.dev@gmail.com";
    const now = new Date();
    const datetimestr1 = format(now, "yyyyMMddHHmmss");
    const datetimestr2 = format(now, "yyyy-MM-dd HH:mm:ss zzzz");
    const model = `${this._deviceInfo?.manufacturer} ${this._deviceInfo?.model}`;
    const os = this.platform.is("android") ? "Android" : (this.platform.is("ios") ? "iOS" : "Other");
    const osVersion = this._deviceInfo?.osVersion;
    const mailContent =
      `
        mailto:${toEmail}?subject=QR%20Werk%20-%20Report%20Issue%20(%23${datetimestr1})&body=Date%20%26%20Time%0A${datetimestr2}%0A%0AApp%20Version%0A${this.appVersionNumber}%0A%0AModel%0A${model}%0A%0APlatform%0A${os}%20${osVersion}%0A%0ADescription%0D%0A(describe%20the%20issue%20below)%0D%0A%0D%0A
      `;
    return mailContent;
  }

  async presentToast(msg: string, duration: "short" | "long", pos: "top" | "center" | "bottom") {
    await Toast.show({
      text: msg,
      duration: duration,
      position: pos
    });
  }

  get isDebugging(): boolean {
    return this.debugMode === 'on';
  }

  get buildEnv(): string {
    return environment.production ? '' : '.Dev';
  }
}
