import { Component } from '@angular/core';
import { Toast } from '@capacitor/toast';
import { EnvService } from 'src/app/services/env.service';
import { ScanFilterService, ScanFilterSettings } from 'src/app/services/scan-filter.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-setting-scan-filter',
  templateUrl: './setting-scan-filter.page.html',
  styleUrls: ['./setting-scan-filter.page.scss'],
  standalone: false,
})
export class SettingScanFilterPage {
  settings: ScanFilterSettings = { enabled: false, prefix: '', suffix: '', exactLength: null };
  testValue = '';
  private loadedWithRule = false;

  constructor(
    public env: EnvService,
    public scanFilter: ScanFilterService,
    private translate: TranslateService,
  ) {}

  async ionViewWillEnter(): Promise<void> {
    this.settings = await this.scanFilter.load();
    this.loadedWithRule = this.hasRule;
  }

  get hasRule(): boolean {
    return !!(this.settings.prefix.trim() || this.settings.suffix.trim() || this.settings.exactLength);
  }

  get testMatches(): boolean {
    return !!this.testValue && this.scanFilter.matches(this.testValue, { ...this.settings, enabled: true });
  }

  onRuleChange(): void {
    if (!this.hasRule) {
      this.settings.enabled = false;
      return;
    }

    // A newly created filter should work immediately without requiring a
    // second, easy-to-miss activation step. Existing disabled filters remain
    // disabled until the user explicitly enables them again.
    if (!this.loadedWithRule) this.settings.enabled = true;
  }

  async save(): Promise<void> {
    if (!this.hasRule) this.settings.enabled = false;
    await this.scanFilter.save(this.settings);
    this.loadedWithRule = this.hasRule;
    await Toast.show({ text: this.translate.instant('SCAN_FILTER_SAVED'), duration: 'short', position: 'bottom' });
  }

  async reset(): Promise<void> {
    this.settings = { enabled: false, prefix: '', suffix: '', exactLength: null };
    this.testValue = '';
    this.loadedWithRule = false;
    await this.scanFilter.save(this.settings);
  }
}
