import { Injectable } from '@angular/core';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { ScanRecord } from '../models/scan-record';
import { Bookmark } from '../models/bookmark';
import { Preferences } from '@capacitor/preferences';

interface CloudPlugin {
  accountStatus(): Promise<{ status: string }>;
  download(): Promise<{ exists: boolean; payload?: string; updatedAt?: number }>;
  upload(options: { payload: string }): Promise<{ updatedAt: number }>;
}

const Cloud = registerPlugin<CloudPlugin>('QRWerkCloudSync');

export interface CloudSnapshot {
  schemaVersion: 1;
  records: ScanRecord[];
  bookmarks: Bookmark[];
  savedAt: string;
}

@Injectable({ providedIn: 'root' })
export class ICloudSyncService {
  readonly enabledKey = 'icloud-sync-enabled';
  readonly lastSyncKey = 'icloud-sync-last-success';

  get supported(): boolean { return Capacitor.getPlatform() === 'ios'; }
  accountStatus() { return Cloud.accountStatus(); }
  download() { return Cloud.download(); }
  upload(records: ScanRecord[], bookmarks: Bookmark[]) {
    const snapshot: CloudSnapshot = { schemaVersion: 1, records, bookmarks, savedAt: new Date().toISOString() };
    return Cloud.upload({ payload: JSON.stringify(snapshot) });
  }

  merge<T extends { id?: string; modifiedAt?: Date }>(local: T[], remote: T[]): T[] {
    const items = new Map<string, T>();
    for (const item of [...remote, ...local]) {
      const key = item.id || JSON.stringify(item);
      const existing = items.get(key);
      const incomingDate = new Date(item.modifiedAt || 0).getTime();
      const existingDate = new Date(existing?.modifiedAt || 0).getTime();
      if (!existing || incomingDate >= existingDate) items.set(key, item);
    }
    return [...items.values()];
  }

  async isEnabled(): Promise<boolean> {
    return (await Preferences.get({ key: this.enabledKey })).value === 'true';
  }

  async setEnabled(enabled: boolean): Promise<void> {
    await Preferences.set({ key: this.enabledKey, value: String(enabled) });
  }

  async lastSync(): Promise<Date | undefined> {
    const value = (await Preferences.get({ key: this.lastSyncKey })).value;
    return value ? new Date(value) : undefined;
  }

  async synchronize(localRecords: ScanRecord[], localBookmarks: Bookmark[]): Promise<{
    records: ScanRecord[];
    bookmarks: Bookmark[];
    syncedAt: Date;
  }> {
    const status = await this.accountStatus();
    if (status.status !== 'available') throw new Error(status.status);

    const cloud = await this.download();
    let remote: CloudSnapshot | undefined;
    if (cloud.exists && cloud.payload) remote = JSON.parse(cloud.payload) as CloudSnapshot;

    const records = this.merge(localRecords, remote?.records ?? []);
    const bookmarks = this.merge(localBookmarks, remote?.bookmarks ?? []);
    const syncedAt = new Date();
    records.forEach(record => record.lastSyncedAt = syncedAt);
    await this.upload(records, bookmarks);
    await Preferences.set({ key: this.lastSyncKey, value: syncedAt.toISOString() });
    return { records, bookmarks, syncedAt };
  }
}
