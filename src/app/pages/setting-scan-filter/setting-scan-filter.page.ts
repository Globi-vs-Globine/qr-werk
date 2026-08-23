import { Component } from '@angular/core';
import { Toast } from '@capacitor/toast';
import { EnvService } from 'src/app/services/env.service';
import { ScanFilterService, ScanFilterSettings } from 'src/app/services/scan-filter.service';

@Component({
  selector: 'app-setting-scan-filter',
  templateUrl: './setting-scan-filter.page.html',
  styleUrls: ['./setting-scan-filter.page.scss'],
  standalone: false,
})
export class SettingScanFilterPage {
  settings: ScanFilterSettings = { enabled: false, prefix: '', suffix: '', exactLength: null };
  testValue = '';

  constructor(public env: EnvService, public scanFilter: ScanFilterService) {}

  async ionViewWillEnter(): Promise<void> {
    this.settings = await this.scanFilter.load();
  }

  get hasRule(): boolean {
    return !!(this.settings.prefix.trim() || this.settings.suffix.trim() || this.settings.exactLength);
  }

  get testMatches(): boolean {
    return !!this.testValue && this.scanFilter.matches(this.testValue, { ...this.settings, enabled: true });
  }

  async save(): Promise<void> {
    if (!this.hasRule) this.settings.enabled = false;
    await this.scanFilter.save(this.settings);
    await Toast.show({ text: 'Scanfilter gespeichert', duration: 'short', position: 'bottom' });
  }

  async reset(): Promise<void> {
    this.settings = { enabled: false, prefix: '', suffix: '', exactLength: null };
    this.testValue = '';
    await this.scanFilter.save(this.settings);
  }
}
