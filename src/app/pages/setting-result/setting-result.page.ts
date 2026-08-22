import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { EnvService } from 'src/app/services/env.service';
import { Preferences } from '@capacitor/preferences';
import { AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-setting-result',
    templateUrl: './setting-result.page.html',
    styleUrls: ['./setting-result.page.scss'],
    standalone: false
})
export class SettingResultPage {
  duplicateMode = 'batch';
  scanPauseMs = 1000;
  autofocus = true;

  constructor(
    public env: EnvService,
    private router: Router,
    private alertController: AlertController,
    public translate: TranslateService,
  ) { }

  async ionViewWillEnter(): Promise<void> {
    this.duplicateMode = (await Preferences.get({ key: 'batch-duplicate-mode' })).value ?? 'batch';
    const pauseRaw = (await Preferences.get({ key: 'batch-pause-ms' })).value;
    this.scanPauseMs = pauseRaw == null ? 1000 : Number(pauseRaw);
    this.autofocus = (await Preferences.get({ key: 'batch-autofocus' })).value !== 'off';
  }

  get duplicateSettingLabel(): string {
    if (this.duplicateMode === 'allow') return this.translate.instant('ALLOW');
    if (this.duplicateMode === 'history') return this.translate.instant('BLOCK_IN_HISTORY');
    return this.translate.instant('BLOCK_IN_SCAN_SESSION');
  }

  async chooseDuplicateSetting(): Promise<void> {
    const alert = await this.alertController.create({
      header: this.translate.instant('DUPLICATE_SCANS'),
      inputs: [
        { type: 'radio', label: this.translate.instant('ALLOW'), value: 'allow', checked: this.duplicateMode === 'allow' },
        { type: 'radio', label: this.translate.instant('BLOCK_IN_SCAN_SESSION'), value: 'batch', checked: this.duplicateMode === 'batch' },
        { type: 'radio', label: this.translate.instant('BLOCK_IN_HISTORY'), value: 'history', checked: this.duplicateMode === 'history' },
      ],
      buttons: [
        { text: this.translate.instant('CANCEL'), role: 'cancel' },
        {
          text: this.translate.instant('SAVE'),
          handler: async value => {
            this.duplicateMode = String(value);
            await Preferences.set({ key: 'batch-duplicate-mode', value: this.duplicateMode });
          },
        },
      ],
      cssClass: ['alert-bg'],
    });
    await alert.present();
  }

  async chooseScanPause(): Promise<void> {
    const pauses = [500, 1000, 1500, 2000, 3000];
    const alert = await this.alertController.create({
      header: this.translate.instant('PAUSE_BETWEEN_SCANS'),
      inputs: pauses.map(pause => ({
        type: 'radio' as const,
        label: `${pause / 1000} ${this.translate.instant('SECONDS_SHORT')}`,
        value: pause,
        checked: pause === this.scanPauseMs,
      })),
      buttons: [
        { text: this.translate.instant('CANCEL'), role: 'cancel' },
        {
          text: this.translate.instant('SAVE'),
          handler: async value => {
            this.scanPauseMs = Number(value);
            await Preferences.set({ key: 'batch-pause-ms', value: String(this.scanPauseMs) });
          },
        },
      ],
      cssClass: ['alert-bg'],
    });
    await alert.present();
  }

  async autofocusChanged(): Promise<void> {
    await Preferences.set({ key: 'batch-autofocus', value: this.autofocus ? 'on' : 'off' });
  }

  setAutoQr() {
    this.router.navigate(['setting-auto-qr']);
  }

  setAutoMaxBrightness() {
    this.router.navigate(['setting-auto-brightness']);
  }

  setAutoOpenUrl() {
    this.router.navigate(['setting-auto-open-url']);
  }

  setQrStyle() {
    this.router.navigate(['setting-qr']);
  }

  setSearchEngine() {
    this.router.navigate(['setting-search-engine']);
  }

  setResultPageButtons() {
    this.router.navigate(['setting-result-buttons']);
  }
}
