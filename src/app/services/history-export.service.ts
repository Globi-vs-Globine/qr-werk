import { Injectable } from '@angular/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Clipboard } from '@capacitor/clipboard';
import { format } from 'date-fns';
import { Bookmark } from '../models/bookmark';
import { ScanRecord } from '../models/scan-record';
import { TranslateService } from '@ngx-translate/core';
import { buildHistoryXlsx, HistoryXlsxLabels, uint8ArrayToBase64 } from '../utils/history-xlsx';

export type HistoryExportFormat = 'csv' | 'txt' | 'xlsx';
export type HistoryExportContent = 'full' | 'codes';

@Injectable({ providedIn: 'root' })
export class HistoryExportService {

  constructor(private readonly translate: TranslateService) {}

  async exportAndShare(records: ScanRecord[], bookmarks: Bookmark[], exportFormat: HistoryExportFormat, content: HistoryExportContent = 'full'): Promise<void> {
    const timestamp = format(new Date(), 'yyyyMMddHHmmss');
    const filename = `qr-werk-${content === 'codes' ? 'codes' : 'history'}-${timestamp}.${exportFormat}`;
    const isXlsx = exportFormat === 'xlsx';
    const data = isXlsx
      ? uint8ArrayToBase64(buildHistoryXlsx(records, bookmarks, this.xlsxLabels()))
      : content === 'codes'
        ? this.codesOnly(records)
        : exportFormat === 'csv'
          ? this.toCsv(records, bookmarks)
          : this.toText(records, bookmarks);

    const result = await Filesystem.writeFile({
      path: filename,
      data,
      directory: Directory.Cache,
      ...(isXlsx ? {} : { encoding: Encoding.UTF8 }),
    });

    try {
      await Share.share({
        title: filename,
        files: [result.uri],
        dialogTitle: 'QR Werk export'
      });
    } finally {
      await Filesystem.deleteFile({ path: filename, directory: Directory.Cache }).catch(() => undefined);
    }
  }

  async copyCodes(records: ScanRecord[]): Promise<void> {
    await Clipboard.write({ string: this.codesOnly(records) });
  }

  private toCsv(records: ScanRecord[], bookmarks: Bookmark[]): string {
    const rows: string[][] = [
      ['ID', 'Content', 'Created at', 'Source', 'Barcode type', 'Group', 'Bookmarked', 'Tag']
    ];

    records.forEach(record => {
      const bookmark = bookmarks.find(item => item.text === record.text);
      rows.push([
        record.id,
        record.text ?? '',
        this.isoDate(record.createdAt),
        record.source ?? '',
        record.barcodeType ?? '',
        record.group ?? '',
        bookmark ? 'TRUE' : 'FALSE',
        bookmark?.tag ?? ''
      ]);
    });

    bookmarks
      .filter(bookmark => !records.some(record => record.text === bookmark.text))
      .forEach(bookmark => rows.push([
        '', bookmark.text ?? '', this.isoDate(bookmark.createdAt), '', '', '', 'TRUE', bookmark.tag ?? ''
      ]));

    return '\uFEFF' + rows.map(row => row.map(value => this.csvCell(value)).join(',')).join('\r\n') + '\r\n';
  }

  private toText(records: ScanRecord[], bookmarks: Bookmark[]): string {
    const lines = records.map((record, index) => {
      const bookmark = bookmarks.find(item => item.text === record.text);
      return [
        `#${index + 1}`,
        `Date: ${this.isoDate(record.createdAt)}`,
        `Source: ${record.source ?? '-'}`,
        `Barcode type: ${record.barcodeType ?? '-'}`,
        `Group: ${record.group ?? '-'}`,
        `Bookmarked: ${bookmark ? 'yes' : 'no'}`,
        ...(bookmark?.tag ? [`Tag: ${bookmark.tag}`] : []),
        'Content:',
        record.text ?? ''
      ].join('\n');
    });
    return lines.join('\n\n---\n\n') + (lines.length ? '\n' : '');
  }

  private codesOnly(records: ScanRecord[]): string {
    return records.map(record => record.text ?? '').filter(Boolean).join('\n') + (records.length ? '\n' : '');
  }

  private csvCell(value: unknown): string {
    return `"${String(value ?? '').replace(/"/g, '""')}"`;
  }

  private isoDate(value: Date): string {
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toISOString();
  }

  private xlsxLabels(): HistoryXlsxLabels {
    return {
      id: this.translate.instant('XLSX.ID'),
      content: this.translate.instant('XLSX.CONTENT'),
      createdAt: this.translate.instant('XLSX.CREATED_AT'),
      source: this.translate.instant('XLSX.SOURCE'),
      barcodeType: this.translate.instant('XLSX.BARCODE_TYPE'),
      group: this.translate.instant('XLSX.GROUP'),
      bookmarked: this.translate.instant('XLSX.BOOKMARKED'),
      tag: this.translate.instant('XLSX.TAG'),
      duplicateCount: this.translate.instant('XLSX.DUPLICATE_COUNT'),
      lastDuplicateAt: this.translate.instant('XLSX.LAST_DUPLICATE_AT'),
      originDevice: this.translate.instant('XLSX.ORIGIN_DEVICE'),
      lastEditedOn: this.translate.instant('XLSX.LAST_EDITED_ON'),
      modifiedAt: this.translate.instant('XLSX.MODIFIED_AT'),
    };
  }
}
