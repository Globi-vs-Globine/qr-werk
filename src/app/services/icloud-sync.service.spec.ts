import { ICloudSyncService } from './icloud-sync.service';

describe('ICloudSyncService merge', () => {
  const service = new ICloudSyncService();

  it('keeps the newest version of an item with the same id', () => {
    const oldItem = { id: 'one', value: 'old', modifiedAt: new Date('2026-01-01T10:00:00Z') };
    const newItem = { id: 'one', value: 'new', modifiedAt: new Date('2026-01-01T11:00:00Z') };
    expect(service.merge([newItem], [oldItem])).toEqual([newItem]);
  });

  it('keeps independent items from both devices', () => {
    const local = { id: 'local', modifiedAt: new Date('2026-01-01T10:00:00Z') };
    const remote = { id: 'remote', modifiedAt: new Date('2026-01-01T10:00:00Z') };
    expect(service.merge([local], [remote]).map(item => item.id).sort()).toEqual(['local', 'remote']);
  });

  it('stores an empty group as cloud metadata', () => {
    const result = service.reconcileGroups(['Empty group'], new Map(), new Map(), '2026-01-01T12:00:00Z');
    expect([...result.groups.values()].map(group => group.name)).toEqual(['Empty group']);
  });

  it('creates a deletion marker when an empty group is removed', () => {
    const created = service.reconcileGroups(['Temporary'], new Map(), new Map(), '2026-01-01T12:00:00Z');
    const removed = service.reconcileGroups([], created.groups, created.deleted, '2026-01-01T13:00:00Z');
    expect([...removed.groups.values()]).toEqual([]);
    expect([...removed.deleted.values()].map(marker => marker.id)).toEqual(['Temporary']);
  });
});
