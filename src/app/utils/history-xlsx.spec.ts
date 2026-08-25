import { strFromU8, unzipSync } from 'fflate';
import { ScanRecord } from '../models/scan-record';
import { buildHistoryXlsx, HistoryXlsxLabels, uint8ArrayToBase64 } from './history-xlsx';

describe('history XLSX export', () => {
  const labels: HistoryXlsxLabels = {
    id: 'ID', content: 'Inhalt', createdAt: 'Erfasst am', source: 'Quelle',
    barcodeType: 'Barcode-Typ', group: 'Gruppe', bookmarked: 'Lesezeichen',
    tag: 'Label', duplicateCount: 'Mehrfach erkannt', lastDuplicateAt: 'Letztes Duplikat',
    originDevice: 'Erfasst auf', lastEditedOn: 'Bearbeitet auf', modifiedAt: 'Geändert am',
  };

  it('creates a valid workbook package with typed dates and escaped content', () => {
    const record = {
      id: 'record-1', text: 'A&B <Test>', createdAt: new Date('2026-08-25T08:30:00Z'),
      source: 'scan', barcodeType: 'QR_CODE', group: 'Raum 313', duplicateCount: 2,
      originDeviceType: 'iPhone Lager', lastModifiedDeviceType: 'iPad Büro',
      modifiedAt: new Date('2026-08-25T09:00:00Z'),
    } as ScanRecord;
    const workbook = buildHistoryXlsx([record], [], labels);
    const files = unzipSync(workbook);
    const sheet = strFromU8(files['xl/worksheets/sheet1.xml']);

    expect(files['[Content_Types].xml']).toBeDefined();
    expect(files['xl/workbook.xml']).toBeDefined();
    expect(files['xl/styles.xml']).toBeDefined();
    expect(sheet).toContain('A&amp;B &lt;Test&gt;');
    expect(sheet).toContain('state="frozen"');
    expect(sheet).toContain('<autoFilter ref="A1:M2"/>');
    expect(sheet).toContain('s="2"><v>');
  });

  it('encodes the workbook as base64 for Capacitor Filesystem', () => {
    const workbook = buildHistoryXlsx([], [], labels);
    const decoded = atob(uint8ArrayToBase64(workbook));
    expect(decoded.charCodeAt(0)).toBe(0x50);
    expect(decoded.charCodeAt(1)).toBe(0x4b);
  });
});
