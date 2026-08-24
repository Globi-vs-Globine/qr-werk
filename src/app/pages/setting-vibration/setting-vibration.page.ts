import { Component } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { EnvService, ScanSoundType, VibrationType } from 'src/app/services/env.service';
import { ScanSoundService } from 'src/app/services/scan-sound.service';

@Component({
    selector: 'app-setting-vibration',
    templateUrl: './setting-vibration.page.html',
    styleUrls: ['./setting-vibration.page.scss'],
    standalone: false
})
export class SettingVibrationPage {

  constructor(
    public env: EnvService,
    private scanSoundService: ScanSoundService,
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
}
