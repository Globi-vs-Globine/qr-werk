import { Component, ElementRef, NgZone, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import {
  BarcodeScanner,
  Barcode,
  BarcodeFormat,
  LensFacing,
  StartScanOptions,
} from '@capacitor-mlkit/barcode-scanning';
import { SplashScreen } from '@capacitor/splash-screen';
import {
  AlertController,
  ActionSheetController,
  InputCustomEvent,
  IonRouterOutlet,
  LoadingController,
  Platform,
} from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { EnvService } from 'src/app/services/env.service';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Toast } from '@capacitor/toast';
import {
  Camera,
  CameraResultType,
  CameraSource,
  ImageOptions,
  Photo,
} from '@capacitor/camera';
import jsQR from 'jsqr';
import { Capacitor } from '@capacitor/core';
import { EdgeToEdge } from '@capawesome/capacitor-android-edge-to-edge-support';
import { StatusBar } from '@capacitor/status-bar';
import { NavigationBar } from '@squareetlabs/capacitor-navigation-bar';
import { Preferences } from '@capacitor/preferences';

type BatchDuplicateMode = 'allow' | 'batch' | 'history';
interface BatchScanOptions {
  duplicateMode: BatchDuplicateMode;
  pauseMs: number;
  autofocus: boolean;
}

@Component({
  selector: 'app-scan',
  templateUrl: './scan.page.html',
  styleUrls: ['./scan.page.scss'],
  standalone: false,
})
export class ScanPage {
  @ViewChild('content') contentEl: HTMLIonContentElement;

  cameraActive: boolean = false;
  nativeScannerActive: boolean = false;
  flashActive: boolean = false;

  permissionAlert: HTMLIonAlertElement;

  isTorchAvailable: boolean = false;

  minZoomRatio: number | undefined;
  maxZoomRatio: number | undefined;
  zoomRatio: number = 0;

  readonly usesNativeScanner = Capacitor.getPlatform() === 'ios';

  @ViewChild('square')
  public squareElement: ElementRef<HTMLDivElement> | undefined;

  constructor(
    public alertController: AlertController,
    private actionSheetController: ActionSheetController,
    public loadingController: LoadingController,
    public routerOutlet: IonRouterOutlet,
    private router: Router,
    public env: EnvService,
    public translate: TranslateService,
    private readonly ngZone: NgZone,
    private platform: Platform,
  ) {}

  ionViewWillEnter() {
    // if (this.contentEl != null) {
    //   this.contentEl.color = "darker";
    // }
  }

  async ionViewDidEnter(): Promise<void> {
    if (this.platform.is('android')) {
      await EdgeToEdge.setBackgroundColor({ color: '#000000' });
      await StatusBar.setBackgroundColor({ color: '#000000' });
    }
    if (this.router.url.startsWith('/tabs/import-image')) {
      this.env.openScannerOnNextScanEntry = false;
      await SplashScreen.hide();
      await this.scanFromImage();
    } else if (!this.usesNativeScanner || this.env.openScannerOnNextScanEntry) {
      const isAutomaticNativeStart = this.usesNativeScanner && this.env.openScannerOnNextScanEntry;
      this.env.openScannerOnNextScanEntry = false;
      const scannerPromise = this.prepareScanner();
      if (isAutomaticNativeStart) {
        // Keep the launch screen visible while iOS presents its native camera
        // so the scan menu cannot flash briefly between both screens.
        await new Promise(resolve => setTimeout(resolve, 220));
      }
      await SplashScreen.hide();
      await scannerPromise;
    } else {
      await SplashScreen.hide();
    }
  }

  async ionViewWillLeave() {
    if (this.platform.is('android')) {
      await EdgeToEdge.enable();
    }
  }

  async ionViewDidLeave(): Promise<void> {
    try {
      const { available } = await BarcodeScanner.isTorchAvailable();
      if (available) {
        const { enabled } = await BarcodeScanner.isTorchEnabled();
        if (enabled) {
          await BarcodeScanner.disableTorch();
        }
        this.flashActive = false;
      }
    } catch {}
    await this.stopScannerUsingMlkitModule();
  }

  async stopScannerUsingMlkitModule(): Promise<void> {
    document.querySelector('body')?.classList.remove('barcode-scanning-active');
    await BarcodeScanner.stopScan();
    this.cameraActive = false;
    BarcodeScanner.isTorchAvailable().then(async (result) => {
      this.isTorchAvailable = result.available;
      if (this.isTorchAvailable) {
        const { enabled } = await BarcodeScanner.isTorchEnabled();
        if (enabled) {
          await BarcodeScanner.disableTorch();
        }
        this.flashActive = false;
      }
    });
  }

  async prepareScanner(): Promise<void> {
    const cameraPermissions = await BarcodeScanner.checkPermissions();
    if (cameraPermissions.camera === 'granted') {
      BarcodeScanner.isTorchAvailable().then(async (result) => {
        this.isTorchAvailable = result.available;
        if (this.isTorchAvailable) {
          const { enabled } = await BarcodeScanner.isTorchEnabled();
          if (enabled) {
            await BarcodeScanner.disableTorch();
          }
          this.flashActive = false;
        }
      });
      await this.scanQrUsingMlkitModule();
    } else {
      const cameraPermissions2 = await BarcodeScanner.requestPermissions();
      if (
        cameraPermissions2.camera === 'granted' ||
        cameraPermissions2.camera === 'limited'
      ) {
        BarcodeScanner.isTorchAvailable().then(async (result) => {
          this.isTorchAvailable = result.available;
          if (this.isTorchAvailable) {
            const { enabled } = await BarcodeScanner.isTorchEnabled();
            if (enabled) {
              await BarcodeScanner.disableTorch();
            }
            this.flashActive = false;
          }
        });
        await this.scanQrUsingMlkitModule();
      } else {
        this.permissionAlert = await this.alertController.create({
          header: this.translate.instant('PERMISSION_REQUIRED'),
          message: this.translate.instant('MSG.CAMERA_PERMISSION'),
          buttons: [
            {
              text: this.translate.instant('SETTING'),
              handler: () => {
                BarcodeScanner.openSettings();
                return true;
              },
            },
            {
              text: this.translate.instant('CLOSE'),
              handler: () => {
                return true;
              },
            },
          ],
          cssClass: ['alert-bg'],
        });
        await this.permissionAlert.present();
      }
    }
  }

  async scanQrUsingMlkitModule(): Promise<void> {
    await this.stopScannerUsingMlkitModule();

    if (this.usesNativeScanner) {
      await this.scanUsingNativeInterface();
      return;
    }

    document.querySelector('body')?.classList.add('barcode-scanning-active');

    const options: StartScanOptions = {
      formats: [
        BarcodeFormat.Aztec,
        BarcodeFormat.Codabar,
        BarcodeFormat.Code128,
        BarcodeFormat.Code39,
        BarcodeFormat.Code93,
        BarcodeFormat.DataMatrix,
        BarcodeFormat.Ean13,
        BarcodeFormat.Ean8,
        BarcodeFormat.Itf,
        BarcodeFormat.Pdf417,
        BarcodeFormat.QrCode,
        BarcodeFormat.UpcA,
        BarcodeFormat.UpcE,
      ],
      lensFacing: LensFacing.Back,
    };

    const squareElementBoundingClientRect =
      this.squareElement?.nativeElement.getBoundingClientRect();

    // Get screen dimensions
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // Store the screen coordinates for later transformation
    const screenRect = squareElementBoundingClientRect
      ? {
          left: squareElementBoundingClientRect.left,
          right: squareElementBoundingClientRect.right,
          top: squareElementBoundingClientRect.top,
          bottom: squareElementBoundingClientRect.bottom,
          width: squareElementBoundingClientRect.width,
          height: squareElementBoundingClientRect.height,
          screenWidth: screenWidth,
          screenHeight: screenHeight,
        }
      : undefined;

    const listener = await BarcodeScanner.addListener(
      'barcodesScanned',
      async (event) => {
        this.ngZone.run(async () => {
          const firstBarcode = event.barcodes[0];
          if (!firstBarcode) {
            return;
          }
          const cornerPoints = firstBarcode.cornerPoints;
          if (screenRect && cornerPoints) {
            // Debug: Log corner points and square bounds
            if (this.env.debugMode === 'on') {
              console.log('cornerPoints:', JSON.stringify(cornerPoints));
              console.log('square bounds:', {
                left: screenRect.left,
                top: screenRect.top,
                right: screenRect.right,
                bottom: screenRect.bottom,
                width: screenRect.width,
                height: screenRect.height
              });
              console.log('screen:', screenRect.screenWidth, screenRect.screenHeight);
            }

            // Calculate QR code center and bounds from cornerPoints
            const xs = cornerPoints.map(p => p[0]);
            const ys = cornerPoints.map(p => p[1]);
            const qrMinX = Math.min(...xs);
            const qrMaxX = Math.max(...xs);
            const qrMinY = Math.min(...ys);
            const qrMaxY = Math.max(...ys);
            const qrCenterX = (qrMinX + qrMaxX) / 2;
            const qrCenterY = (qrMinY + qrMaxY) / 2;
            
            // Square center in screen coordinates
            const squareCenterX = (screenRect.left + screenRect.right) / 2;
            const squareCenterY = (screenRect.top + screenRect.bottom) / 2;
            
            // Use the observed max Y from cornerPoints to estimate camera height
            // When QR is centered in square, we want normalized center to be 0.5
            // So: qrCenterY / cameraHeight ≈ 0.5
            // Therefore: cameraHeight ≈ qrCenterY / 0.5 = qrCenterY * 2
            const estimatedCameraHeight = qrCenterY * 2;
            
            // For width, maintain aspect ratio similar to screen
            const screenAspect = screenRect.screenWidth / screenRect.screenHeight;
            const estimatedCameraWidth = estimatedCameraHeight * screenAspect;
            
            // Normalize QR center to [0, 1] based on estimated camera dimensions
            const normalizedX = qrCenterX / estimatedCameraWidth;
            const normalizedY = qrCenterY / estimatedCameraHeight;
            
            // Convert to screen coordinates
            const screenQRX = normalizedX * screenRect.screenWidth;
            const screenQRY = normalizedY * screenRect.screenHeight;
            
            const halfWidth = screenRect.width / 2;
            const halfHeight = screenRect.height / 2;
            
            // Use a tolerance factor to allow for estimation errors
            // This makes the detection area slightly larger than the visual square
            const tolerance = 0.10; // 10% tolerance
            const effectiveHalfWidth = halfWidth * (1 + tolerance);
            const effectiveHalfHeight = halfHeight * (1 + tolerance);
            
            const isWithinSquare = 
              screenQRX >= (squareCenterX - effectiveHalfWidth) &&
              screenQRX <= (squareCenterX + effectiveHalfWidth) &&
              screenQRY >= (squareCenterY - effectiveHalfHeight) &&
              screenQRY <= (squareCenterY + effectiveHalfHeight);

            if (this.env.debugMode === 'on') {
              console.log(`QR center (camera): [${qrCenterX.toFixed(1)}, ${qrCenterY.toFixed(1)}]`);
              console.log(`Estimated camera: ${estimatedCameraWidth.toFixed(0)}x${estimatedCameraHeight.toFixed(0)}`);
              console.log(`Normalized: [${normalizedX.toFixed(3)}, ${normalizedY.toFixed(3)}]`);
              console.log(`QR center (screen): [${screenQRX.toFixed(1)}, ${screenQRY.toFixed(1)}]`);
              console.log(`Square center: [${squareCenterX.toFixed(1)}, ${squareCenterY.toFixed(1)}]`);
              console.log(`Offset from center: [${(screenQRX - squareCenterX).toFixed(1)}, ${(screenQRY - squareCenterY).toFixed(1)}]`);
              console.log(`Within square: ${isWithinSquare}`);
            }

            if (!isWithinSquare) {
              if (this.env.debugMode === 'on') {
                console.log('QR code NOT within square - ignoring');
              }
              return;
            }
          }
          listener.remove();
          const text = firstBarcode.rawValue;
          if (text == null || text?.trim()?.length <= 0 || text == '') {
            this.presentToast(
              this.translate.instant('MSG.QR_CODE_VALUE_NOT_EMPTY'),
              'short',
              'center',
            );
            this.scanQrUsingMlkitModule();
            return;
          }
          if (
            this.env.vibration === 'on' ||
            this.env.vibration === 'on-scanned'
          ) {
            await Haptics.vibrate({ duration: 100 }).catch(async (err) => {
              if (this.env.debugMode === 'on') {
                await Toast.show({
                  text: 'Err when Haptics.impact: ' + JSON.stringify(err),
                  position: 'top',
                  duration: 'long',
                });
              }
            });
          }
          this.processQrCode(text, firstBarcode.format);
        });
      },
    );
    await NavigationBar.setTransparency({ isTransparent: false });
    await NavigationBar.setColor({ color: '#000000', darkButtons: false });
    await BarcodeScanner.startScan(options);
    if (Capacitor.getPlatform() !== 'web') {
      BarcodeScanner.getMinZoomRatio().then(async (result) => {
        this.minZoomRatio = result.zoomRatio;
        await BarcodeScanner.setZoomRatio({
          zoomRatio: parseInt(this.minZoomRatio as any, 10),
        });
        this.zoomRatio = this.minZoomRatio;
      });
      BarcodeScanner.getMaxZoomRatio().then((result) => {
        this.maxZoomRatio = result.zoomRatio;
      });
    }
  }

  async scanUsingNativeInterface(): Promise<void> {
    this.nativeScannerActive = true;
    try {
      const result = await BarcodeScanner.scan({
        formats: [
          BarcodeFormat.Aztec,
          BarcodeFormat.Codabar,
          BarcodeFormat.Code128,
          BarcodeFormat.Code39,
          BarcodeFormat.Code93,
          BarcodeFormat.DataMatrix,
          BarcodeFormat.Ean13,
          BarcodeFormat.Ean8,
          BarcodeFormat.Itf,
          BarcodeFormat.Pdf417,
          BarcodeFormat.QrCode,
          BarcodeFormat.UpcA,
          BarcodeFormat.UpcE,
        ],
      });
      const barcode = result.barcodes[0];
      if (!barcode?.rawValue?.trim()) {
        return;
      }
      if (
        this.env.vibration === 'on' ||
        this.env.vibration === 'on-scanned'
      ) {
        await Haptics.vibrate({ duration: 100 }).catch(() => undefined);
      }
      await this.processQrCode(barcode.rawValue, barcode.format);
    } catch (err) {
      // Closing the native scanner is a normal action. The scan page remains
      // usable and offers a button to open it again.
      if (this.env.debugMode === 'on') {
        console.log('Native scanner closed:', err);
      }
    } finally {
      await new Promise(resolve => setTimeout(resolve, 120));
      this.nativeScannerActive = false;
    }
  }

  async scanBatchUsingNativeInterface(): Promise<void> {
    const batchOptions = await this.configureBatchScan();
    if (!batchOptions) return;

    await Preferences.set({
      key: 'qrwerk-batch-autofocus',
      value: batchOptions.autofocus ? 'on' : 'off',
    });
    this.nativeScannerActive = true;
    const scannedValues = new Set<string>();
    const valuesBeforeBatch = new Set(
      (this.env.scanRecords ?? []).map(record => record.text.trim()),
    );
    let savedCount = 0;
    let currentBatchDuplicates = 0;
    let historyDuplicates = 0;
    try {
      while (true) {
        const result = await BarcodeScanner.scan({
          formats: [
            BarcodeFormat.Aztec,
            BarcodeFormat.Codabar,
            BarcodeFormat.Code128,
            BarcodeFormat.Code39,
            BarcodeFormat.Code93,
            BarcodeFormat.DataMatrix,
            BarcodeFormat.Ean13,
            BarcodeFormat.Ean8,
            BarcodeFormat.Itf,
            BarcodeFormat.Pdf417,
            BarcodeFormat.QrCode,
            BarcodeFormat.UpcA,
            BarcodeFormat.UpcE,
          ],
        });
        const barcode = result.barcodes[0];
        const value = barcode?.rawValue?.trim();
        if (!value) {
          continue;
        }

        const duplicateInBatch = scannedValues.has(value);
        const duplicateInHistory = !duplicateInBatch && valuesBeforeBatch.has(value);
        const isDuplicate = duplicateInBatch || duplicateInHistory;

        if (duplicateInBatch) currentBatchDuplicates += 1;
        if (duplicateInHistory) historyDuplicates += 1;

        if (isDuplicate) {
          await this.env.recordDuplicateScan(value);
          const shouldBlock = batchOptions.duplicateMode === 'history' ||
            (batchOptions.duplicateMode === 'batch' && duplicateInBatch);
          if (shouldBlock) {
            await Haptics.notification({ type: NotificationType.Error }).catch(() => undefined);
            await this.presentToast(
              this.translate.instant(
                duplicateInBatch ? 'DUPLICATE_IN_BATCH' : 'DUPLICATE_IN_HISTORY',
              ),
              'short',
              'top',
            );
            await this.waitBetweenBatchScans(batchOptions.pauseMs);
            continue;
          }
        }

        scannedValues.add(value);
        this.env.recordSource = 'scan';
        this.env.detailedRecordSource = 'scan-camera';
        this.env.resultContentFormat = barcode.format;
        await this.env.saveScanRecord(value);
        savedCount += 1;
        await Haptics.vibrate({ duration: 100 }).catch(() => undefined);
        await this.waitBetweenBatchScans(batchOptions.pauseMs);
      }
    } catch (err) {
      // The native X button ends the batch intentionally.
      if (this.env.debugMode === 'on') {
        console.log('Batch scanner closed:', err);
      }
    } finally {
      delete this.env.recordSource;
      delete this.env.detailedRecordSource;
      await Preferences.set({ key: 'qrwerk-batch-autofocus', value: 'on' });
      if (savedCount > 0 || currentBatchDuplicates > 0 || historyDuplicates > 0) {
        await this.showBatchSummary(savedCount, currentBatchDuplicates, historyDuplicates);
      }
      await new Promise(resolve => setTimeout(resolve, 120));
      this.nativeScannerActive = false;
    }
  }

  private async configureBatchScan(): Promise<BatchScanOptions | undefined> {
    const duplicateMode = (await Preferences.get({ key: 'batch-duplicate-mode' })).value as BatchDuplicateMode | null;
    const pauseRawValue = (await Preferences.get({ key: 'batch-pause-ms' })).value;
    const pauseValue = pauseRawValue == null ? 1500 : Number(pauseRawValue);
    const autofocusValue = (await Preferences.get({ key: 'batch-autofocus' })).value;
    const options: BatchScanOptions = {
      duplicateMode: duplicateMode ?? 'batch',
      pauseMs: Number.isFinite(pauseValue) && pauseValue >= 0 ? pauseValue : 1500,
      autofocus: autofocusValue !== 'off',
    };

    return new Promise(async resolve => {
      const showMenu = async (): Promise<void> => {
        const actionSheet = await this.actionSheetController.create({
          header: this.translate.instant('BATCH_SETTINGS'),
          subHeader: this.translate.instant('BATCH_SETTINGS_EXPLANATION'),
          buttons: [
            {
              text: `${this.translate.instant('DUPLICATE_SCANS')}: ${this.duplicateModeLabel(options.duplicateMode)}`,
              icon: 'copy-outline',
              handler: () => void this.selectBatchDuplicateMode(options).then(showMenu),
            },
            {
              text: `${this.translate.instant('PAUSE_BETWEEN_SCANS')}: ${this.pauseLabel(options.pauseMs)}`,
              icon: 'timer-outline',
              handler: () => void this.selectBatchPause(options).then(showMenu),
            },
            {
              text: `${this.translate.instant('AUTOFOCUS')}: ${this.translate.instant(options.autofocus ? 'ON' : 'OFF')}`,
              icon: 'aperture-outline',
              handler: async () => {
                options.autofocus = !options.autofocus;
                await Preferences.set({ key: 'batch-autofocus', value: options.autofocus ? 'on' : 'off' });
                await showMenu();
              },
            },
            {
              text: this.translate.instant('START_SCANNING'),
              icon: 'scan-outline',
              handler: () => resolve(options),
            },
            {
              text: this.translate.instant('CANCEL'),
              role: 'cancel',
              handler: () => resolve(undefined),
            },
          ],
          backdropDismiss: false,
        });
        await actionSheet.present();
      };
      await showMenu();
    });
  }

  private async selectBatchDuplicateMode(options: BatchScanOptions): Promise<void> {
    return new Promise(async resolve => {
      const alert = await this.alertController.create({
        header: this.translate.instant('DUPLICATE_SCANS'),
        message: this.translate.instant('DUPLICATE_MODE_EXPLANATION'),
        inputs: [
          {
            type: 'radio',
            label: this.translate.instant('ALLOW_DUPLICATES'),
            value: 'allow',
            checked: options.duplicateMode === 'allow',
          },
          {
            type: 'radio',
            label: this.translate.instant('PREVENT_BATCH_DUPLICATES'),
            value: 'batch',
            checked: options.duplicateMode === 'batch',
          },
          {
            type: 'radio',
            label: this.translate.instant('PREVENT_HISTORY_DUPLICATES'),
            value: 'history',
            checked: options.duplicateMode === 'history',
          },
        ],
        buttons: [
          {
            text: this.translate.instant('CANCEL'), role: 'cancel', handler: () => resolve(),
          },
          {
            text: this.translate.instant('SAVE'),
            handler: async value => {
              options.duplicateMode = value as BatchDuplicateMode;
              await Preferences.set({ key: 'batch-duplicate-mode', value: options.duplicateMode });
              resolve();
            },
          },
        ],
        backdropDismiss: false,
        cssClass: ['alert-bg'],
      });
      await alert.present();
    });
  }

  private async selectBatchPause(options: BatchScanOptions): Promise<void> {
    return new Promise(async resolve => {
      const pauses = [500, 1000, 1500, 2000, 3000];
      const alert = await this.alertController.create({
        header: this.translate.instant('PAUSE_BETWEEN_SCANS'),
        message: this.translate.instant('PAUSE_EXPLANATION'),
        inputs: pauses.map(pause => ({
          type: 'radio' as const,
          label: this.pauseLabel(pause),
          value: pause,
          checked: options.pauseMs === pause,
        })),
        buttons: [
          { text: this.translate.instant('CANCEL'), role: 'cancel', handler: () => resolve() },
          {
            text: this.translate.instant('SAVE'),
            handler: async value => {
              options.pauseMs = Number(value);
              await Preferences.set({ key: 'batch-pause-ms', value: String(options.pauseMs) });
              resolve();
            },
          },
        ],
        backdropDismiss: false,
        cssClass: ['alert-bg'],
      });
      await alert.present();
    });
  }

  private duplicateModeLabel(mode: BatchDuplicateMode): string {
    if (mode === 'allow') return this.translate.instant('ALLOW_DUPLICATES');
    if (mode === 'history') return this.translate.instant('COMPLETE_HISTORY');
    return this.translate.instant('CURRENT_BATCH');
  }

  private pauseLabel(milliseconds: number): string {
    return `${milliseconds / 1000} ${this.translate.instant('SECONDS_SHORT')}`;
  }

  private async waitBetweenBatchScans(milliseconds: number): Promise<void> {
    if (milliseconds > 0) await new Promise(resolve => setTimeout(resolve, milliseconds));
  }

  async enterCodeManually(): Promise<void> {
    const alert = await this.alertController.create({
      header: this.translate.instant('ENTER_CODE_MANUALLY'),
      inputs: [{ name: 'code', type: 'textarea', placeholder: this.translate.instant('CODE') }],
      buttons: [
        { text: this.translate.instant('CANCEL'), role: 'cancel' },
        {
          text: this.translate.instant('SAVE'),
          handler: async values => {
            const value = String(values.code ?? '').trim();
            if (!value) return false;
            this.env.recordSource = 'scan';
            this.env.resultContentFormat = '';
            await this.env.saveScanRecord(value);
            delete this.env.recordSource;
            await Haptics.vibrate({ duration: 100 }).catch(() => undefined);
            await this.presentToast(this.translate.instant('MANUAL_CODE_SAVED'), 'short', 'bottom');
            return true;
          },
        },
      ],
      cssClass: ['alert-bg'],
    });
    await alert.present();
  }

  private async showBatchSummary(
    savedCount: number,
    currentBatchDuplicates: number,
    historyDuplicates: number,
  ): Promise<void> {
    const message = [
      `${this.translate.instant('BATCH_SAVED')}: ${savedCount}`,
      `${this.translate.instant('DUPLICATES_CURRENT_BATCH')}: ${currentBatchDuplicates}`,
      `${this.translate.instant('DUPLICATES_HISTORY')}: ${historyDuplicates}`,
    ].join('<br>');
    const alert = await this.alertController.create({
      header: this.translate.instant('BATCH_SUMMARY'),
      message,
      buttons: [this.translate.instant('OK')],
      cssClass: ['alert-bg'],
    });
    await alert.present();
  }

  async setZoomRatio(event: InputCustomEvent) {
    if (!this.zoomRatio) {
      return;
    }
    await BarcodeScanner.setZoomRatio({
      zoomRatio: parseInt(this.zoomRatio as any, 10),
    });
  }

  async scanFromImage() {
    const getPictureLoading = await this.presentLoading(
      this.translate.instant('PLEASE_WAIT'),
    );
    const options = {
      quality: 100,
      allowEditing: false,
      resultType: Capacitor.isNativePlatform()
        ? CameraResultType.Uri
        : CameraResultType.DataUrl,
      source: CameraSource.Photos,
      saveToGallery: false,
    } as ImageOptions;
    const cameraPermissions = await Camera.checkPermissions();
    if (
      !(
        cameraPermissions.photos == 'granted' ||
        cameraPermissions.photos == 'limited'
      )
    ) {
      await Camera.requestPermissions({ permissions: ['photos'] }).then(
        async (permissionResult) => {
          if (
            !(
              permissionResult.photos == 'granted' ||
              permissionResult.photos == 'limited'
            )
          ) {
            getPictureLoading.dismiss();
            const alert = await this.alertController.create({
              header: this.translate.instant('PERMISSION_REQUIRED'),
              message: this.translate.instant('MSG.READ_IMAGE_PERMISSION'),
              buttons: [
                {
                  text: this.translate.instant('SETTING'),
                  handler: () => {
                    BarcodeScanner.openSettings();
                    return true;
                  },
                },
                {
                  text: this.translate.instant('CLOSE'),
                  handler: () => {
                    return true;
                  },
                },
              ],
              cssClass: ['alert-bg'],
            });
            await alert.present();
            return;
            // TODO: return from scanFromImage()
          }
        },
        async (err) => {
          getPictureLoading.dismiss();
          if (this.env.debugMode === 'on') {
            await Toast.show({
              text:
                'Err when Camera.requestPermissions: ' + JSON.stringify(err),
              position: 'bottom',
              duration: 'long',
            });
          } else {
            Toast.show({
              text: 'Unknown Error',
              position: 'bottom',
              duration: 'short',
            });
          }
          return;
        },
      );
    }

    if (Capacitor.isNativePlatform()) {
      await getPictureLoading.dismiss();
      try {
        const selection = await Camera.pickImages({
          quality: 100,
          correctOrientation: true,
          limit: 0,
        });
        if (!selection.photos.length) return;

        const decodingLoading = await this.presentLoading(
          this.translate.instant('DECODING'),
        );
        const detected: Barcode[] = [];
        try {
          for (const photo of selection.photos) {
            if (!photo.path) continue;
            const result = await BarcodeScanner.readBarcodesFromImage({
              path: photo.path,
              formats: [
                BarcodeFormat.Aztec,
                BarcodeFormat.Codabar,
                BarcodeFormat.Code128,
                BarcodeFormat.Code39,
                BarcodeFormat.Code93,
                BarcodeFormat.DataMatrix,
                BarcodeFormat.Ean13,
                BarcodeFormat.Ean8,
                BarcodeFormat.Itf,
                BarcodeFormat.Pdf417,
                BarcodeFormat.QrCode,
                BarcodeFormat.UpcA,
                BarcodeFormat.UpcE,
              ],
            });
            detected.push(...result.barcodes);
          }
        } finally {
          await decodingLoading.dismiss();
        }

        const unique = detected.filter(
          (barcode, index, all) =>
            !!barcode.rawValue?.trim() &&
            all.findIndex(item => item.rawValue === barcode.rawValue) === index,
        );
        if (!unique.length) {
          await this.presentToast(
            this.translate.instant('MSG.NO_QR_CODE'),
            'short',
            'center',
          );
          return;
        }
        await this.presentImportedBarcodes(unique);
      } catch (err) {
        if (this.env.debugMode === 'on') {
          console.log('Image selection or barcode scan failed:', err);
        }
      }
      return;
    }

    await Camera.getPhoto(options).then(
      async (photo: Photo) => {
        getPictureLoading.dismiss();
        const decodingLoading = await this.presentLoading(
          this.translate.instant('DECODING'),
        );
        await this.convertDataUrlToImageData(photo?.dataUrl ?? '').then(
          async (imageData) => {
            await this.getJsQr(
              imageData.imageData.data,
              imageData.width,
              imageData.height,
            ).then(
              async (qrValue) => {
                decodingLoading.dismiss();
                this.processQrCode(qrValue, 'QR_CODE');
              },
              async (_) => {
                decodingLoading.dismiss();
                await this.presentToast(
                  this.translate.instant('MSG.NO_QR_CODE'),
                  'short',
                  'center',
                );
              },
            );
          },
          async (_) => {
            decodingLoading.dismiss();
            await this.presentToast(
              this.translate.instant('MSG.NO_QR_CODE'),
              'short',
              'center',
            );
          },
        );
      },
      async (err) => {
        getPictureLoading.dismiss();
        if (this.env.isDebugging) {
          this.presentToast(
            'Error when call Camera.getPhoto: ' + JSON.stringify(err),
            'long',
            'top',
          );
        }
      },
    );
  }

  private async presentImportedBarcodes(barcodes: Barcode[]): Promise<void> {
    if (barcodes.length === 1) {
      this.processQrCode(barcodes[0].rawValue, barcodes[0].format, 'scan-image');
      return;
    }

    const alert = await this.alertController.create({
      header: `${barcodes.length} ${this.translate.instant('SCANNED')}`,
      inputs: barcodes.map((barcode, index) => ({
        type: 'checkbox',
        label: barcode.displayValue || barcode.rawValue,
        value: String(index),
        checked: true,
      })),
      buttons: [
        {
          text: this.translate.instant('SAVE_ALL'),
          handler: async () => this.saveImportedBarcodes(barcodes),
        },
        {
          text: this.translate.instant('SAVE_SELECTION'),
          handler: async (selectedIndexes: string[]) => {
            const selected = selectedIndexes
              .map(index => barcodes[Number(index)])
              .filter((barcode): barcode is Barcode => !!barcode);
            if (!selected.length) return false;
            await this.saveImportedBarcodes(selected);
            return true;
          },
        },
        { text: this.translate.instant('CANCEL'), role: 'cancel' },
      ],
      cssClass: ['alert-can-copy'],
    });
    await alert.present();
  }

  private async saveImportedBarcodes(barcodes: Barcode[]): Promise<void> {
    for (const barcode of barcodes) {
      this.env.recordSource = 'scan';
      this.env.detailedRecordSource = 'scan-image';
      this.env.resultContentFormat = barcode.format;
      await this.env.saveScanRecord(barcode.rawValue);
    }
    delete this.env.recordSource;
    delete this.env.detailedRecordSource;
    await this.presentToast(
      `${barcodes.length} ${this.translate.instant('SAVED')}`,
      'short',
      'bottom',
    );
  }

  private async convertDataUrlToImageData(
    uri: string,
  ): Promise<{ imageData: ImageData; width: number; height: number }> {
    return await new Promise((resolve, reject) => {
      if (uri == null) return reject();
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const image = new Image();
      image.addEventListener(
        'load',
        function () {
          canvas.width = image.width;
          canvas.height = image.height;
          context.fillStyle = 'white';
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          const imageData = context.getImageData(
            0,
            0,
            canvas.width,
            canvas.height,
          );
          const data = imageData.data;
          for (let i = 0; i < data.length; i += 4) {
            const avg =
              (imageData.data[i] +
                imageData.data[i + 1] +
                imageData.data[i + 2]) /
              3;
            imageData.data[i] = avg;
            imageData.data[i + 1] = avg;
            imageData.data[i + 2] = avg;
          }
          const width = image.width;
          const height = image.height;
          resolve({ imageData: imageData, width: width, height: height });
        },
        false,
      );
      if (uri.startsWith('data')) {
        image.src = uri;
      } else {
        image.src = 'data:image/png;base64,' + uri;
      }
    });
  }

  private async getJsQr(
    imageData: Uint8ClampedArray,
    width: number,
    height: number,
  ): Promise<string> {
    return await new Promise((resolve, reject) => {
      const qrcode = jsQR(imageData, width, height, {
        inversionAttempts: 'attemptBoth',
      });
      if (qrcode) {
        return resolve(qrcode.data);
      } else {
        return reject();
      }
    });
  }

  processQrCode(
    scannedData: string,
    format: string,
    detailedSource: 'scan-camera' | 'scan-image' = 'scan-camera',
  ) {
    this.env.resultContent = scannedData;
    this.env.resultContentFormat = format;
    this.env.recordSource = 'scan';
    this.env.detailedRecordSource = detailedSource;
    this.env.viewResultFrom = '/tabs/scan';
    this.router.navigate(['tabs/result']);
  }

  async toggleFlash(): Promise<void> {
    try {
      const { available } = await BarcodeScanner.isTorchAvailable();
      if (available) {
        const { enabled } = await BarcodeScanner.isTorchEnabled();
        if (enabled) {
          await BarcodeScanner.disableTorch();
          this.flashActive = false;
        } else {
          await BarcodeScanner.enableTorch();
          this.flashActive = true;
        }
      }
    } catch {}
  }

  async presentAlert(
    msg: string,
    head: string,
    buttonText: string,
    buttonless: boolean = false,
  ): Promise<HTMLIonAlertElement> {
    let alert: any;
    if (!buttonless) {
      alert = await this.alertController.create({
        header: head,
        message: msg,
        buttons: [buttonText],
        cssClass: ['alert-bg'],
      });
    } else {
      alert = await this.alertController.create({
        header: head,
        message: msg,
        buttons: [],
        backdropDismiss: false,
        cssClass: ['alert-bg'],
      });
    }
    await alert.present();
    return alert;
  }

  async presentLoading(msg: string): Promise<HTMLIonLoadingElement> {
    const loading = await this.loadingController.create({
      message: msg,
    });
    await loading.present();
    return loading;
  }

  async presentToast(
    msg: string,
    duration: 'short' | 'long',
    pos: 'top' | 'center' | 'bottom',
  ) {
    await Toast.show({
      text: msg,
      duration: duration,
      position: pos,
    });
  }

  async tapHaptic() {
    if (this.env.vibration === 'on' || this.env.vibration === 'on-haptic') {
      await Haptics.impact({ style: ImpactStyle.Light }).catch(async (err) => {
        if (this.env.debugMode === 'on') {
          await Toast.show({
            text: 'Err when Haptics.impact: ' + JSON.stringify(err),
            position: 'top',
            duration: 'long',
          });
        }
      });
    }
  }
}
