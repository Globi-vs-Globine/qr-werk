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
  schemaVersion: 1 | 2 | 3 | 4;
  records: ScanRecord[];
  trashedRecords?: ScanRecord[];
  bookmarks: Bookmark[];
  deletedRecords?: DeletionMarker[];
  deletedBookmarks?: DeletionMarker[];
  groups?: CloudGroup[];
  deletedGroups?: DeletionMarker[];
  purgedRecords?: DeletionMarker[];
  savedAt: string;
}

export interface DeletionMarker { id: string; deletedAt: string; }
export interface CloudGroup { id: string; name: string; modifiedAt: string; }

@Injectable({ providedIn: 'root' })
export class ICloudSyncService {
  readonly enabledKey = 'icloud-sync-enabled';
  readonly lastSyncKey = 'icloud-sync-last-success';
  readonly deletedRecordsKey = 'icloud-deleted-records';
  readonly deletedBookmarksKey = 'icloud-deleted-bookmarks';
  readonly groupsKey = 'history-groups';
  readonly groupMetadataKey = 'icloud-group-metadata';
  readonly deletedGroupsKey = 'icloud-deleted-groups';
  readonly purgedRecordsKey = 'icloud-purged-records';

  get supported(): boolean { return Capacitor.getPlatform() === 'ios'; }
  accountStatus() { return Cloud.accountStatus(); }
  download() { return Cloud.download(); }
  upload(records: ScanRecord[], trashedRecords: ScanRecord[], bookmarks: Bookmark[], deletedRecords: DeletionMarker[], deletedBookmarks: DeletionMarker[], groups: CloudGroup[], deletedGroups: DeletionMarker[], purgedRecords: DeletionMarker[]) {
    const snapshot: CloudSnapshot = { schemaVersion: 4, records, trashedRecords, bookmarks, deletedRecords, deletedBookmarks, groups, deletedGroups, purgedRecords, savedAt: new Date().toISOString() };
    return Cloud.upload({ payload: JSON.stringify(snapshot) });
  }

  merge<T extends { id?: string; modifiedAt?: Date | string }>(local: T[], remote: T[]): T[] {
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
  async markRecordsPurged(ids: string[]): Promise<void> { await this.addDeletionMarkers(this.purgedRecordsKey, ids); }

  /** Records locally created, renamed and deleted groups for the next cloud sync. */
  async saveLocalGroups(names: string[], modifiedAtByName: Map<string, Date | string> = new Map()): Promise<void> {
    const existing = await this.loadGroups();
    const deleted = await this.loadMarkers(this.deletedGroupsKey);
    const now = new Date().toISOString();
    const reconciled = this.reconcileGroups(names, existing, deleted, now, modifiedAtByName);
    await Promise.all([
      this.saveGroups([...reconciled.groups.values()]),
      this.saveMarkers(this.deletedGroupsKey, [...reconciled.deleted.values()]),
    ]);
  }

  reconcileGroups(
    names: string[],
    existing: Map<string, CloudGroup>,
    deleted: Map<string, DeletionMarker>,
    now: string,
    modifiedAtByName: Map<string, Date | string> = new Map(),
  ): { groups: Map<string, CloudGroup>; deleted: Map<string, DeletionMarker> } {
    const currentNames = [...new Set(names.map(name => name.trim()).filter(Boolean))];
    const groups = new Map(existing);
    const deletionMarkers = new Map(deleted);
    const current = new Set(currentNames);

    for (const name of currentNames) {
      if (!groups.has(name)) {
        const knownDate = modifiedAtByName.get(name);
        groups.set(name, { id: name, name, modifiedAt: knownDate ? new Date(knownDate).toISOString() : now });
      }
      deletionMarkers.delete(name);
    }
    for (const name of [...groups.keys()]) {
      if (!current.has(name)) {
        groups.delete(name);
        deletionMarkers.set(name, { id: name, deletedAt: now });
      }
    }
    return { groups, deleted: deletionMarkers };
  }

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

  private async loadGroups(): Promise<Map<string, CloudGroup>> {
    const value = (await Preferences.get({ key: this.groupMetadataKey })).value;
    let groups: CloudGroup[] = [];
    try { groups = value ? JSON.parse(value) : []; } catch { groups = []; }
    return new Map(groups.filter(group => group?.name).map(group => [group.name, { ...group, id: group.name }]));
  }

  private async saveGroups(groups: CloudGroup[]): Promise<void> {
    await Preferences.set({ key: this.groupMetadataKey, value: JSON.stringify(groups) });
  }

  private mergeMarkers(local: DeletionMarker[], remote: DeletionMarker[]): DeletionMarker[] {
    const merged = new Map<string, DeletionMarker>();
    for (const marker of [...remote, ...local]) {
      const existing = merged.get(marker.id);
      if (!existing || new Date(marker.deletedAt) >= new Date(existing.deletedAt)) merged.set(marker.id, marker);
    }
    return [...merged.values()];
  }

  async synchronize(localRecords: ScanRecord[], localBookmarks: Bookmark[], localTrashedRecords: ScanRecord[] = []): Promise<{
    records: ScanRecord[];
    trashedRecords: ScanRecord[];
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
    const localPurgedRecords = [...(await this.loadMarkers(this.purgedRecordsKey)).values()];
    const storedGroupNames = await Preferences.get({ key: this.groupsKey });
    let localGroupNames: string[] = [];
    try { localGroupNames = storedGroupNames.value ? JSON.parse(storedGroupNames.value) : []; } catch { localGroupNames = []; }
    localGroupNames.push(...localRecords.map(record => record.group).filter((group): group is string => !!group));
    const groupDates = new Map<string, Date | string>();
    for (const record of localRecords) {
      if (!record.group) continue;
      const candidate = record.modifiedAt || record.createdAt;
      const current = groupDates.get(record.group);
      if (candidate && (!current || new Date(candidate) > new Date(current))) groupDates.set(record.group, candidate);
    }
    await this.saveLocalGroups(localGroupNames, groupDates);
    const localGroups = [...(await this.loadGroups()).values()];
    const localDeletedGroups = [...(await this.loadMarkers(this.deletedGroupsKey)).values()];
    const deletedRecords = this.mergeMarkers(localDeletedRecords, remote?.deletedRecords ?? []);
    const deletedBookmarks = this.mergeMarkers(localDeletedBookmarks, remote?.deletedBookmarks ?? []);
    const deletedGroups = this.mergeMarkers(localDeletedGroups, remote?.deletedGroups ?? []);
    const purgedRecords = this.mergeMarkers(localPurgedRecords, remote?.purgedRecords ?? []);
    const purgeTimes = new Map(purgedRecords.map(marker => [marker.id, new Date(marker.deletedAt).getTime()]));
    const recordDeletions = new Map(deletedRecords.map(marker => [marker.id, new Date(marker.deletedAt).getTime()]));
    const bookmarkDeletions = new Map(deletedBookmarks.map(marker => [marker.id, new Date(marker.deletedAt).getTime()]));
    const records = this.merge(localRecords, remote?.records ?? []).filter(record => {
      const deletedAt = record.id ? recordDeletions.get(record.id) : undefined;
      const purgedAt = record.id ? purgeTimes.get(record.id) : undefined;
      const modifiedAt = new Date(record.modifiedAt || record.createdAt || 0).getTime();
      return (deletedAt == null || deletedAt < modifiedAt) && (purgedAt == null || purgedAt < modifiedAt);
    });
    const activeTimes = new Map(records.map(record => [record.id, new Date(record.modifiedAt || record.createdAt || 0).getTime()]));
    const trashedMap = new Map<string, ScanRecord>();
    for (const record of [...(remote?.trashedRecords ?? []), ...localTrashedRecords]) {
      if (!record.id) continue;
      const existing = trashedMap.get(record.id);
      if (!existing || new Date(record.deletedAt || 0) >= new Date(existing.deletedAt || 0)) trashedMap.set(record.id, record);
    }
    const trashedRecords = [...trashedMap.values()].filter(record => {
      const deletedAt = new Date(record.deletedAt || 0).getTime();
      const purgedAt = purgeTimes.get(record.id);
      const activeAt = activeTimes.get(record.id);
      return (purgedAt == null || purgedAt < deletedAt) && (activeAt == null || activeAt < deletedAt);
    }).sort((a, b) => new Date(b.deletedAt || 0).getTime() - new Date(a.deletedAt || 0).getTime());
    const bookmarks = this.merge(localBookmarks, remote?.bookmarks ?? []).filter(bookmark => {
      const deletedAt = bookmark.id ? bookmarkDeletions.get(bookmark.id) : undefined;
      return deletedAt == null || deletedAt < new Date(bookmark.modifiedAt || bookmark.createdAt || 0).getTime();
    });
    const groupDeletions = new Map(deletedGroups.map(marker => [marker.id, new Date(marker.deletedAt).getTime()]));
    const groups = this.merge(localGroups, remote?.groups ?? []).filter(group => {
      const deletedAt = groupDeletions.get(group.name);
      return deletedAt == null || deletedAt < new Date(group.modifiedAt || 0).getTime();
    }).sort((a, b) => a.name.localeCompare(b.name));
    const syncedAt = new Date();
    records.forEach(record => record.lastSyncedAt = syncedAt);
    await this.upload(records, trashedRecords, bookmarks, deletedRecords, deletedBookmarks, groups, deletedGroups, purgedRecords);
    await Promise.all([
      this.saveMarkers(this.deletedRecordsKey, deletedRecords),
      this.saveMarkers(this.deletedBookmarksKey, deletedBookmarks),
      this.saveMarkers(this.deletedGroupsKey, deletedGroups),
      this.saveMarkers(this.purgedRecordsKey, purgedRecords),
      this.saveGroups(groups),
      Preferences.set({ key: this.groupsKey, value: JSON.stringify(groups.map(group => group.name)) }),
    ]);
    await Preferences.set({ key: this.lastSyncKey, value: syncedAt.toISOString() });
    return { records, trashedRecords, bookmarks, syncedAt };
  }
}
