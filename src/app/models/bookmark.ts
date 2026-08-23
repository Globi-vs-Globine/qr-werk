export class Bookmark {
    id: string;
    text: string;
    createdAt: Date;
    tag: string;
    originDeviceId?: string;
    originDeviceType?: string;
    lastModifiedDeviceId?: string;
    lastModifiedDeviceType?: string;
    modifiedAt?: Date;
}
