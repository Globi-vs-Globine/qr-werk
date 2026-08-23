import { Component } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { TranslateService } from '@ngx-translate/core';
import { AccentColorType, EnvService } from 'src/app/services/env.service';

@Component({
    selector: 'app-setting-color',
    templateUrl: './setting-color.page.html',
    styleUrls: ['./setting-color.page.scss'],
    standalone: false
})
export class SettingColorPage {
  readonly accentColors: Array<{ value: AccentColorType; label: string; hex: string }> = [
    { value: 'petrol', label: 'ACCENT_PETROL', hex: '#007f83' },
    { value: 'blue', label: 'ACCENT_BLUE', hex: '#0068b8' },
    { value: 'violet', label: 'ACCENT_VIOLET', hex: '#6d4bc3' },
    { value: 'green', label: 'ACCENT_GREEN', hex: '#287a43' },
    { value: 'orange', label: 'ACCENT_ORANGE', hex: '#a64b00' },
    { value: 'pink', label: 'ACCENT_PINK', hex: '#a83a72' },
  ];

  constructor(
    public translate: TranslateService,
    public env: EnvService,
  ) { }

  async saveColorTheme() {
    await this.env.toggleColorTheme();
    await Preferences.set({ key: this.env.KEY_COLOR, value: this.env.selectedColorTheme });
  }

  async saveAccentColor(): Promise<void> {
    this.env.applyAccentColor();
    await Preferences.set({ key: this.env.KEY_ACCENT_COLOR, value: this.env.accentColor });
  }

  async saveHistoryPageStartSegment(): Promise<void> {
    await Preferences.set({
      key: this.env.KEY_HISTORY_PAGE_START_SEGMENT,
      value: this.env.historyPageStartSegment
    });
  }

}
