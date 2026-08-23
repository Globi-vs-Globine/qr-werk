import { PluginListenerHandle, registerPlugin } from '@capacitor/core';

export enum BarcodeFormat {
  Aztec = 'AZTEC',
  Codabar = 'CODABAR',
  Code39 = 'CODE_39',
  Code93 = 'CODE_93',
  Code128 = 'CODE_128',
  DataMatrix = 'DATA_MATRIX',
  Ean8 = 'EAN_8',
  Ean13 = 'EAN_13',
  Itf = 'ITF',
  Pdf417 = 'PDF_417',
  QrCode = 'QR_CODE',
  UpcA = 'UPC_A',
  UpcE = 'UPC_E',
}

export enum LensFacing {
  Back = 'BACK',
  Front = 'FRONT',
}

export interface Barcode {
  rawValue: string;
  displayValue: string;
  format: BarcodeFormat | string;
  cornerPoints?: [[number, number], [number, number], [number, number], [number, number]];
}

export interface StartScanOptions {
  formats?: BarcodeFormat[];
  lensFacing?: LensFacing;
}

interface AppleBarcodeScannerPlugin {
  scan(options?: { formats?: BarcodeFormat[] }): Promise<{ barcodes: Barcode[] }>;
  readBarcodesFromImage(options: { path: string; formats?: BarcodeFormat[] }): Promise<{ barcodes: Barcode[] }>;
  checkPermissions(): Promise<{ camera: 'prompt' | 'granted' | 'limited' | 'denied' }>;
  requestPermissions(): Promise<{ camera: 'prompt' | 'granted' | 'limited' | 'denied' }>;
  openSettings(): Promise<void>;
  stopScan(): Promise<void>;
  isTorchAvailable(): Promise<{ available: boolean }>;
  isTorchEnabled(): Promise<{ enabled: boolean }>;
  enableTorch(): Promise<void>;
  disableTorch(): Promise<void>;
  setZoomRatio(options: { zoomRatio: number }): Promise<void>;
  getMinZoomRatio(): Promise<{ zoomRatio: number }>;
  getMaxZoomRatio(): Promise<{ zoomRatio: number }>;
  startScan(options?: StartScanOptions): Promise<void>;
  addListener(
    eventName: 'barcodesScanned',
    listener: (event: { barcodes: Barcode[] }) => void,
  ): Promise<PluginListenerHandle>;
}

/**
 * QR Werk's scanner bridge. On iOS this is backed only by AVFoundation and
 * Vision, so camera frames and imported images never leave the device.
 */
export const BarcodeScanner = registerPlugin<AppleBarcodeScannerPlugin>('QRWerkBarcodeScanner');
