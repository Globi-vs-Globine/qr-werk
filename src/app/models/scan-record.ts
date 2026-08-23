export class ScanRecord {
    id!: string;
    text!: string;
    createdAt!: Date;
    source: 'create' | 'view' | 'scan' | 'external-share' | undefined;
    barcodeType: string | undefined;
    group: string | undefined;
    duplicateCount?: number;
    lastDuplicateAt?: Date;
    duplicateDetectedAt?: Date[];
    originDeviceId?: string;
    originDeviceType?: string;
    lastModifiedDeviceId?: string;
    lastModifiedDeviceType?: string;
    modifiedAt?: Date;
    lastSyncedAt?: Date;
}
