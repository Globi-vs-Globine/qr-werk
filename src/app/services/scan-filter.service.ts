import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

export interface ScanFilterSettings {
  enabled: boolean;
  prefix: string;
  suffix: string;
  exactLength: number | null;
}

@Injectable({ providedIn: 'root' })
export class ScanFilterService {
  readonly KEY_ENABLED = 'scan-filter-enabled';
  readonly KEY_PREFIX = 'scan-filter-prefix';
  readonly KEY_SUFFIX = 'scan-filter-suffix';
  readonly KEY_LENGTH = 'scan-filter-length';

  async load(): Promise<ScanFilterSettings> {
    const [enabled, prefix, suffix, length] = await Promise.all([
      Preferences.get({ key: this.KEY_ENABLED }),
      Preferences.get({ key: this.KEY_PREFIX }),
      Preferences.get({ key: this.KEY_SUFFIX }),
      Preferences.get({ key: this.KEY_LENGTH }),
    ]);
    const parsedLength = Number(length.value);
    return {
      enabled: enabled.value === 'on',
      prefix: prefix.value ?? '',
      suffix: suffix.value ?? '',
      exactLength: length.value && Number.isInteger(parsedLength) && parsedLength > 0 ? parsedLength : null,
    };
  }

  async save(settings: ScanFilterSettings): Promise<void> {
    const prefix = settings.prefix.trim();
    const suffix = settings.suffix.trim();
    const exactLength = settings.exactLength && settings.exactLength > 0
      ? Math.floor(settings.exactLength)
      : null;
    await Promise.all([
      Preferences.set({ key: this.KEY_ENABLED, value: settings.enabled ? 'on' : 'off' }),
      Preferences.set({ key: this.KEY_PREFIX, value: prefix }),
      Preferences.set({ key: this.KEY_SUFFIX, value: suffix }),
      Preferences.set({ key: this.KEY_LENGTH, value: exactLength == null ? '' : String(exactLength) }),
    ]);
  }

  matches(value: string, settings: ScanFilterSettings): boolean {
    if (!settings.enabled) return true;
    if (settings.prefix && !value.startsWith(settings.prefix)) return false;
    if (settings.suffix && !value.endsWith(settings.suffix)) return false;
    if (settings.exactLength != null && value.length !== Number(settings.exactLength)) return false;
    return true;
  }
}
