import { strToU8, zipSync } from 'fflate';
import { Bookmark } from '../models/bookmark';
import { ScanRecord } from '../models/scan-record';

export interface HistoryXlsxLabels {
  id: string;
  content: string;
  createdAt: string;
  source: string;
  barcodeType: string;
  group: string;
  bookmarked: string;
  tag: string;
  duplicateCount: string;
  lastDuplicateAt: string;
  originDevice: string;
  lastEditedOn: string;
  modifiedAt: string;
}

type WorkbookValue = string | number | boolean | Date | undefined;

interface WorkbookCell {
  value: WorkbookValue;
  style?: number;
}

const PETROL = 'FF007F83';
const DATE_STYLE = 2;
const WRAP_STYLE = 3;

export function buildHistoryXlsx(
  records: ScanRecord[],
  bookmarks: Bookmark[],
  labels: HistoryXlsxLabels,
): Uint8Array {
  const headers = Object.values(labels);
  const rows: WorkbookCell[][] = records.map(record => {
    const bookmark = bookmarks.find(item => item.text === record.text);
    return [
      { value: record.id },
      { value: record.text ?? '', style: WRAP_STYLE },
      { value: validDate(record.createdAt), style: DATE_STYLE },
      { value: record.source ?? '' },
      { value: record.barcodeType ?? '' },
      { value: record.group ?? '' },
      { value: Boolean(bookmark) },
      { value: bookmark?.tag ?? '' },
      { value: record.duplicateCount ?? 0 },
      { value: validDate(record.lastDuplicateAt), style: DATE_STYLE },
      { value: record.originDeviceType ?? '' },
      { value: record.lastModifiedDeviceType ?? '' },
      { value: validDate(record.modifiedAt), style: DATE_STYLE },
    ];
  });

  bookmarks
    .filter(bookmark => !records.some(record => record.text === bookmark.text))
    .forEach(bookmark => rows.push([
      { value: bookmark.id ?? '' },
      { value: bookmark.text ?? '', style: WRAP_STYLE },
      { value: validDate(bookmark.createdAt), style: DATE_STYLE },
      { value: '' },
      { value: '' },
      { value: '' },
      { value: true },
      { value: bookmark.tag ?? '' },
      { value: 0 },
      { value: undefined, style: DATE_STYLE },
      { value: bookmark.originDeviceType ?? '' },
      { value: bookmark.lastModifiedDeviceType ?? '' },
      { value: validDate(bookmark.modifiedAt), style: DATE_STYLE },
    ]));

  const now = new Date().toISOString();
  const sheetRows = [
    `<row r="1" ht="25" customHeight="1">${headers.map((value, index) => stringCell(1, index, value, 1)).join('')}</row>`,
    ...rows.map((row, rowIndex) => {
      const excelRow = rowIndex + 2;
      return `<row r="${excelRow}">${row.map((cell, columnIndex) => cellXml(excelRow, columnIndex, cell)).join('')}</row>`;
    }),
  ].join('');
  const lastRow = Math.max(1, rows.length + 1);
  const sheetXml = xml(`
    <worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
      <sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
      <cols>
        <col min="1" max="1" width="38" customWidth="1"/>
        <col min="2" max="2" width="42" customWidth="1"/>
        <col min="3" max="3" width="21" customWidth="1"/>
        <col min="4" max="6" width="18" customWidth="1"/>
        <col min="7" max="7" width="14" customWidth="1"/>
        <col min="8" max="8" width="20" customWidth="1"/>
        <col min="9" max="9" width="18" customWidth="1"/>
        <col min="10" max="10" width="21" customWidth="1"/>
        <col min="11" max="12" width="22" customWidth="1"/>
        <col min="13" max="13" width="21" customWidth="1"/>
      </cols>
      <sheetData>${sheetRows}</sheetData>
      <autoFilter ref="A1:M${lastRow}"/>
      <pageMargins left="0.25" right="0.25" top="0.5" bottom="0.5" header="0.3" footer="0.3"/>
    </worksheet>`);

  const files: Record<string, Uint8Array> = {
    '[Content_Types].xml': strToU8(xml(`
      <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
        <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
        <Default Extension="xml" ContentType="application/xml"/>
        <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
        <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
        <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
        <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
        <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
      </Types>`)),
    '_rels/.rels': strToU8(xml(`
      <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
        <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
        <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
        <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
      </Relationships>`)),
    'docProps/app.xml': strToU8(xml(`
      <Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
        <Application>QR Werk</Application><AppVersion>0.9</AppVersion>
      </Properties>`)),
    'docProps/core.xml': strToU8(xml(`
      <cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
        <dc:title>QR Werk Export</dc:title><dc:creator>QR Werk</dc:creator>
        <dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified>
      </cp:coreProperties>`)),
    'xl/workbook.xml': strToU8(xml(`
      <workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
        <sheets><sheet name="QR Werk" sheetId="1" r:id="rId1"/></sheets>
      </workbook>`)),
    'xl/_rels/workbook.xml.rels': strToU8(xml(`
      <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
        <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
        <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
      </Relationships>`)),
    'xl/styles.xml': strToU8(stylesXml()),
    'xl/worksheets/sheet1.xml': strToU8(sheetXml),
  };

  return zipSync(files, { level: 6 });
}

export function uint8ArrayToBase64(data: Uint8Array): string {
  const chunkSize = 0x8000;
  let binary = '';
  for (let offset = 0; offset < data.length; offset += chunkSize) {
    binary += String.fromCharCode(...data.subarray(offset, offset + chunkSize));
  }
  return btoa(binary);
}

function cellXml(row: number, column: number, cell: WorkbookCell): string {
  if (cell.value instanceof Date) return numberCell(row, column, excelDate(cell.value), cell.style ?? DATE_STYLE);
  if (typeof cell.value === 'number') return numberCell(row, column, cell.value, cell.style);
  if (typeof cell.value === 'boolean') return booleanCell(row, column, cell.value, cell.style);
  return stringCell(row, column, cell.value ?? '', cell.style);
}

function stringCell(row: number, column: number, value: string, style = 0): string {
  return `<c r="${cellReference(row, column)}" t="inlineStr"${style ? ` s="${style}"` : ''}><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`;
}

function numberCell(row: number, column: number, value: number, style = 0): string {
  return `<c r="${cellReference(row, column)}" t="n"${style ? ` s="${style}"` : ''}><v>${value}</v></c>`;
}

function booleanCell(row: number, column: number, value: boolean, style = 0): string {
  return `<c r="${cellReference(row, column)}" t="b"${style ? ` s="${style}"` : ''}><v>${value ? 1 : 0}</v></c>`;
}

function cellReference(row: number, column: number): string {
  let value = column + 1;
  let letters = '';
  while (value > 0) {
    const remainder = (value - 1) % 26;
    letters = String.fromCharCode(65 + remainder) + letters;
    value = Math.floor((value - 1) / 26);
  }
  return `${letters}${row}`;
}

function validDate(value?: Date): Date | undefined {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function excelDate(date: Date): number {
  return date.getTime() / 86400000 + 25569;
}

function escapeXml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function xml(content: string): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>${content.replace(/\n\s*/g, '')}`;
}

function stylesXml(): string {
  return xml(`
    <styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
      <numFmts count="1"><numFmt numFmtId="164" formatCode="yyyy-mm-dd hh:mm:ss"/></numFmts>
      <fonts count="2">
        <font><sz val="11"/><color theme="1"/><name val="Aptos"/><family val="2"/></font>
        <font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Aptos"/><family val="2"/></font>
      </fonts>
      <fills count="3">
        <fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>
        <fill><patternFill patternType="solid"><fgColor rgb="${PETROL}"/><bgColor indexed="64"/></patternFill></fill>
      </fills>
      <borders count="2">
        <border><left/><right/><top/><bottom/><diagonal/></border>
        <border><left/><right/><top/><bottom style="thin"><color rgb="FFB7B7B7"/></bottom><diagonal/></border>
      </borders>
      <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
      <cellXfs count="4">
        <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
        <xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"><alignment vertical="center"/></xf>
        <xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
        <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment wrapText="1" vertical="top"/></xf>
      </cellXfs>
      <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
    </styleSheet>`);
}
