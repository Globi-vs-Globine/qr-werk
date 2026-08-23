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
  schemaVersion: 1 | 2;
  records: ScanRecord[];
  bookmarks: Bookmark[];
  deletedRecords?: DeletionMarker[];
  deletedBookmarks?: DeletionMarker[];
  savedAt: string;
}

export interface DeletionMarker { id: string; deletedAt: string; }

@Injectable({ providedIn: 'root' })
export class ICloudSyncService {
  readonly enabledKey = 'icloud-sync-enabled';
  readonly lastSyncKey = 'icloud-sync-last-success';
  readonly deletedRecordsKey = 'icloud-deleted-records';
  readonly deletedBookmarksKey = 'icloud-deleted-bookmarks';

  get supported(): boolean { return Capacitor.getPlatform() === 'ios'; }
  accountStatus() { return Cloud.accountStatus(); }
  download() { return Cloud.download(); }
  upload(records: ScanRecord[], bookmarks: Bookmark[], deletedRecords: DeletionMarker[], deletedBookmarks: DeletionMarker[]) {
    const snapshot: CloudSnapshot = { schemaVersion: 2, records, bookmarks, deletedRecords, deletedBookmarks, savedAt: new Date().toISOString() };
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

  async markRecordsDeleted(ids: string[]): Promise<void> {
    await this.addDeletionMarkers(this.deletedRecordsKey, ids);
  }

  async markBookmarksDeleted(ids: string[]): Promise<void> {
    await this.addDeletionMarkers(this.deletedBookmarksKey, ids);
  }

  async undoRecordDeletion(id: string): Promise<void> { await this.removeDeletionMarker(this.deletedRecordsKey, id); }
  async undoBookmarkDeletion(id: string): Promise<void> { await this.removeDeletionMarker(this.deletedBookmarksKey, id); }

  private async addDeletionMarkers(key: string, ids: string[]): Promise<void> {
    const markers = await this.loadMarkers(key);
    const now = new Date().toISOString();
    ids.filter(Boolean).forEach(id => markers.set(id, { id, deletedAt: now }));
    await this.saveMarkers(key, [...markers.values()]);
  }

  private async removeDeletionMarker(key: string, id?: string): Promise<void> {
    if (!id) return;
    const markers = await this.loadMarkers(key);
    markers.delete(id);
    await this.saveMarkers(key, [...markers.values()]);
  }

  private async loadMarkers(key: string): Promise<Map<string, DeletionMarker>> {
    const value = (await Preferences.get({ key })).value;
    const markers: DeletionMarker[] = value ? JSON.parse(value) : [];
    return new Map(markers.map(marker => [marker.id, marker]));
  }

  private async saveMarkers(key: string, markers: DeletionMarker[]): Promise<void> {
    await Preferences.set({ key, value: JSON.stringify(markers) });
  }

  private mergeMarkers(local: DeletionMarker[], remote: DeletionMarker[]): DeletionMarker[] {
    const merged = new Map<string, DeletionMarker>();
    for (const marker of [...remote, ...local]) {
      const existing = merged.get(marker.id);
      if (!existing || new Date(marker.deletedAt) >= new Date(existing.deletedAt)) merged.set(marker.id, marker);
    }
    return [...merged.values()];
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

    const localDeletedRecords = [...(await this.loadMarkers(this.deletedRecordsKey)).values()];
    const localDeletedBookmarks = [...(await this.loadMarkers(this.deletedBookmarksKey)).values()];
    const deletedRecords = this.mergeMarkers(localDeletedRecords, remote?.deletedRecords ?? []);
    const deletedBookmarks = this.mergeMarkers(localDeletedBookmarks, remote?.deletedBookmarks ?? []);
    const recordDeletions = new Map(deletedRecords.map(marker => [marker.id, new Date(marker.deletedAt).getTime()]));
    const bookmarkDeletions = new Map(deletedBookmarks.map(marker => [marker.id, new Date(marker.deletedAt).getTime()]));
    const records = this.merge(localRecords, remote?.records ?? []).filter(record => {
      const deletedAt = record.id ? recordDeletions.get(record.id) : undefined;
      return deletedAt == null || deletedAt < new Date(record.modifiedAt || record.createdAt || 0).getTime();
    });
    const bookmarks = this.merge(localBookmarks, remote?.bookmarks ?? []).filter(bookmark => {
      const deletedAt = bookmark.id ? bookmarkDeletions.get(bookmark.id) : undefined;
      return deletedAt == null || deletedAt < new Date(bookmark.modifiedAt || bookmark.createdAt || 0).getTime();
    });
    const syncedAt = new Date();
    records.forEach(record => record.lastSyncedAt = syncedAt);
    await this.upload(records, bookmarks, deletedRecords, deletedBookmarks);
    await Promise.all([
      this.saveMarkers(this.deletedRecordsKey, deletedRecords),
      this.saveMarkers(this.deletedBookmarksKey, deletedBookmarks),
    ]);
    await Preferences.set({ key: this.lastSyncKey, value: syncedAt.toISOString() });
    return { records, bookmarks, syncedAt };
  }
}
