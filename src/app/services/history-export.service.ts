import { Injectable } from '@angular/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { format } from 'date-fns';
import { Bookmark } from '../models/bookmark';
import { ScanRecord } from '../models/scan-record';

export type HistoryExportFormat = 'csv' | 'txt';

@Injectable({ providedIn: 'root' })
export class HistoryExportService {

  async exportAndShare(records: ScanRecord[], bookmarks: Bookmark[], exportFormat: HistoryExportFormat): Promise<void> {
    const timestamp = format(new Date(), 'yyyyMMddHHmmss');
    const filename = `simpleqr-history-${timestamp}.${exportFormat}`;
    const data = exportFormat === 'csv'
      ? this.toCsv(records, bookmarks)
      : this.toText(records, bookmarks);

    const result = await Filesystem.writeFile({
      path: filename,
      data,
      directory: Directory.Cache,
      encoding: Encoding.UTF8
    });

    try {
      await Share.share({
        title: filename,
        files: [result.uri],
        dialogTitle: 'Export scan history'
      });
    } finally {
      await Filesystem.deleteFile({ path: filename, directory: Directory.Cache }).catch(() => undefined);
    }
  }

  private toCsv(records: ScanRecord[], bookmarks: Bookmark[]): string {
    const rows: string[][] = [
      ['ID', 'Content', 'Created at', 'Source', 'Barcode type', 'Bookmarked', 'Tag']
    ];

    records.forEach(record => {
      const bookmark = bookmarks.find(item => item.text === record.text);
      rows.push([
        record.id,
        record.text ?? '',
        this.isoDate(record.createdAt),
        record.source ?? '',
        record.barcodeType ?? '',
        bookmark ? 'TRUE' : 'FALSE',
        bookmark?.tag ?? ''
      ]);
    });

    bookmarks
      .filter(bookmark => !records.some(record => record.text === bookmark.text))
      .forEach(bookmark => rows.push([
        '', bookmark.text ?? '', this.isoDate(bookmark.createdAt), '', '', 'TRUE', bookmark.tag ?? ''
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
        `Bookmarked: ${bookmark ? 'yes' : 'no'}`,
        ...(bookmark?.tag ? [`Tag: ${bookmark.tag}`] : []),
        'Content:',
        record.text ?? ''
      ].join('\n');
    });
    return lines.join('\n\n---\n\n') + (lines.length ? '\n' : '');
  }

  private csvCell(value: unknown): string {
    return `"${String(value ?? '').replace(/"/g, '""')}"`;
  }

  private isoDate(value: Date): string {
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toISOString();
  }
}
