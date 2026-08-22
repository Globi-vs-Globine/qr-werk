import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Toast } from '@capacitor/toast';
import { ActionSheetController, AlertController, LoadingController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { EnvService } from 'src/app/services/env.service';
import { SplashScreen } from '@capacitor/splash-screen';
import { Preferences } from '@capacitor/preferences';

@Component({
    selector: 'app-setting',
    templateUrl: './setting.page.html',
    styleUrls: ['./setting.page.scss'],
    standalone: false
})
export class SettingPage {

  constructor(
    public alertController: AlertController,
    private actionSheetController: ActionSheetController,
    public loadingController: LoadingController,
    private router: Router,
    public env: EnvService,
    public translate: TranslateService,
    private platform: Platform,
  ) {

  }

  async ionViewDidEnter() {
    await SplashScreen.hide()
  }

  get isIos(): boolean {
    return this.platform.is('ios');
  }

  get isAndroid(): boolean {
    return this.platform.is('android');
  }

  rateAndroidApp() {
    window.open(this.env.GOOGLE_PLAY_URL, '_system');
  }

  rateIosApp() {
    window.open(this.env.APP_STORE_URL, '_system');
  }

  setLanguage() {
    this.router.navigate(['setting-language']);
  }

  setColorTheme() {
    this.router.navigate(['setting-color']);
  }

  setOrientation() {
    this.router.navigate(['setting-orientation']);
  }

  setVibration() {
    this.router.navigate(['setting-vibration']);
  }

  setScanRecordLogging() {
    this.router.navigate(['setting-record']);
  }

  async openScanSettings(): Promise<void> {
    const duplicateMode = (await Preferences.get({ key: 'batch-duplicate-mode' })).value ?? 'batch';
    const pauseRaw = (await Preferences.get({ key: 'batch-pause-ms' })).value;
    const pauseMs = pauseRaw == null ? 500 : Number(pauseRaw);
    const autofocus = (await Preferences.get({ key: 'batch-autofocus' })).value !== 'off';
    const actionSheet = await this.actionSheetController.create({
      header: this.translate.instant('SCAN_SETTINGS'),
      buttons: [
        {
          text: `${this.translate.instant('DUPLICATE_SCANS')}: ${this.duplicateSettingLabel(duplicateMode)}`,
          icon: 'copy-outline',
          handler: () => this.chooseDuplicateSetting(duplicateMode),
        },
        {
          text: `${this.translate.instant('PAUSE_BETWEEN_SCANS')}: ${pauseMs / 1000} ${this.translate.instant('SECONDS_SHORT')}`,
          icon: 'timer-outline',
          handler: () => this.chooseScanPause(pauseMs),
        },
        {
          text: `${this.translate.instant('AUTOFOCUS')}: ${this.translate.instant(autofocus ? 'ON' : 'OFF')}`,
          icon: 'aperture-outline',
          handler: async () => {
            await Preferences.set({ key: 'batch-autofocus', value: autofocus ? 'off' : 'on' });
            await this.openScanSettings();
          },
        },
        { text: this.translate.instant('CLOSE'), role: 'cancel' },
      ],
    });
    await actionSheet.present();
  }

  private duplicateSettingLabel(mode: string): string {
    if (mode === 'allow') return this.translate.instant('ALLOW');
    if (mode === 'history') return this.translate.instant('BLOCK_IN_HISTORY');
    return this.translate.instant('BLOCK_IN_SCAN_SESSION');
  }

  private async chooseDuplicateSetting(currentMode: string): Promise<void> {
    const alert = await this.alertController.create({
      header: this.translate.instant('DUPLICATE_SCANS'),
      inputs: [
        { type: 'radio', label: this.translate.instant('ALLOW'), value: 'allow', checked: currentMode === 'allow' },
        { type: 'radio', label: this.translate.instant('BLOCK_IN_SCAN_SESSION'), value: 'batch', checked: currentMode === 'batch' },
        { type: 'radio', label: this.translate.instant('BLOCK_IN_HISTORY'), value: 'history', checked: currentMode === 'history' },
      ],
      buttons: [
        { text: this.translate.instant('CANCEL'), role: 'cancel' },
        {
          text: this.translate.instant('SAVE'),
          handler: async value => {
            await Preferences.set({ key: 'batch-duplicate-mode', value: String(value) });
            await this.openScanSettings();
          },
        },
      ],
      cssClass: ['alert-bg'],
    });
    await alert.present();
  }

  private async chooseScanPause(currentPause: number): Promise<void> {
    const pauses = [500, 1000, 1500, 2000, 3000];
    const alert = await this.alertController.create({
      header: this.translate.instant('PAUSE_BETWEEN_SCANS'),
      inputs: pauses.map(pause => ({
        type: 'radio' as const,
        label: `${pause / 1000} ${this.translate.instant('SECONDS_SHORT')}`,
        value: pause,
        checked: pause === currentPause,
      })),
      buttons: [
        { text: this.translate.instant('CANCEL'), role: 'cancel' },
        {
          text: this.translate.instant('SAVE'),
          handler: async value => {
            await Preferences.set({ key: 'batch-pause-ms', value: String(value) });
            await this.openScanSettings();
          },
        },
      ],
      cssClass: ['alert-bg'],
    });
    await alert.present();
  }

  goBackupRestore() {
    this.router.navigate(['backup-restore']);
  }

  setStartPage() {
    this.router.navigate(['setting-start-page']);
  }

  setResult() {
    this.router.navigate(['setting-result']);
  }

  setDebugMode() {
    this.router.navigate(['setting-debug']);
  }

  navigateAbout() {
    this.router.navigate(['about']);
  }

  navigateGuide() {
    this.router.navigate(['guide']);
  }

  setAutoCloseApp() {
    this.router.navigate(['setting-auto-exit']);
  }

  async resetApp() {
    const alert = await this.alertController.create({
      header: this.translate.instant('RESET_APP'),
      message: this.translate.instant('MSG.RESET_APP'),
      cssClass: ['alert-bg'],
      buttons: [
        {
          text: this.translate.instant('FULL_RESET'),
          handler: async () => {
            const loading = await this.presentLoading(this.translate.instant("PLEASE_WAIT"));
            await window.caches.keys().then(
              keys => {
                keys.forEach(
                  async key => {
                    await window.caches.delete(key);
                  }
                );
              }
            );
            await this.env.resetAll();
            loading.dismiss();
            this.presentToast(this.translate.instant("DONE"), "short", "bottom");
          }
        },
        {
          text: this.translate.instant('ONLY_DELETE_DATA'),
          handler: async () => {
            const loading = await this.presentLoading(this.translate.instant("PLEASE_WAIT"));
            await this.env.resetData();
            loading.dismiss();
            this.presentToast(this.translate.instant("DONE"), "short", "bottom");
          }
        },
        {
          text: this.translate.instant('ONLY_RESET_SETTING'),
          handler: async () => {
            const loading = await this.presentLoading(this.translate.instant("PLEASE_WAIT"));
            await this.env.resetSetting();
            loading.dismiss();
            this.presentToast(this.translate.instant("DONE"), "short", "bottom");
          }
        },
        {
          text: this.translate.instant('CANCEL'),
          role: 'cancel'
        },
      ]
    });
    alert.present();
  }

  exitApp() {
    navigator['app'].exitApp();
  }

  openGooglePlay(): void {
    window.open(this.env.GOOGLE_PLAY_URL, '_system');
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
}
