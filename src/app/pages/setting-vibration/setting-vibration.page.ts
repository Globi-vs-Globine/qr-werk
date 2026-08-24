import { Component } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { EnvService, ScanSoundType, VibrationType } from 'src/app/services/env.service';
import { ScanSoundService } from 'src/app/services/scan-sound.service';
import { AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-setting-vibration',
    templateUrl: './setting-vibration.page.html',
    styleUrls: ['./setting-vibration.page.scss'],
    standalone: false
})
export class SettingVibrationPage {
  readonly scanSounds: Array<{ value: ScanSoundType; label: string }> = [
    { value: 'off', label: 'SCAN_SOUND_OFF' },
    { value: 'classic', label: 'SCAN_SOUND_CLASSIC' },
    { value: 'double', label: 'SCAN_SOUND_DOUBLE' },
    { value: 'soft', label: 'SCAN_SOUND_SOFT' },
    { value: 'high', label: 'SCAN_SOUND_HIGH' },
  ];

  constructor(
    public env: EnvService,
    private scanSoundService: ScanSoundService,
    private alertController: AlertController,
    private translate: TranslateService,
  ) { }

  async saveVibration() {
    await Preferences.set({ key: this.env.KEY_VIBRATION, value: this.env.vibration });
  }

  async setVibration(value: VibrationType): Promise<void> {
    this.env.vibration = value;
    await this.saveVibration();
  }

  async setScanSound(value: ScanSoundType): Promise<void> {
    this.env.scanSound = value;
    await Preferences.set({ key: this.env.KEY_SCAN_SOUND, value });
    if (value !== 'off') {
      await Preferences.set({ key: 'scan-sound-last-active', value });
    }
    await this.previewScanSound();
  }

  async saveScanSoundVolume(): Promise<void> {
    await Preferences.set({
      key: this.env.KEY_SCAN_SOUND_VOLUME,
      value: JSON.stringify(this.env.scanSoundVolume),
    });
  }

  async previewScanSound(): Promise<void> {
    await this.scanSoundService.play(this.env.scanSound, this.env.scanSoundVolume);
  }

  async showInfo(titleKey: string, messageKey: string): Promise<void> {
    const alert = await this.alertController.create({
      header: this.translate.instant(titleKey),
      message: this.translate.instant(messageKey),
      buttons: [this.translate.instant('OK')],
    });
    await alert.present();
  }
}
