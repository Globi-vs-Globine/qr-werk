const fs = require('fs');
const path = require('path');

const scannerViewPath = path.join(
  __dirname,
  '..',
  'node_modules',
  '@capacitor-mlkit',
  'barcode-scanning',
  'ios',
  'Plugin',
  'BarcodeScannerView.swift',
);

if (!fs.existsSync(scannerViewPath)) {
  console.log('ML Kit iOS scanner source not installed; skipping QRWerk UI patch.');
  process.exit(0);
}

let source = fs.readFileSync(scannerViewPath, 'utf8');
const patchMarker = 'QRWerk: reveal the guide only after the camera preview has started.';

if (source.includes(patchMarker)) {
  console.log('QRWerk ML Kit iOS scanner UI patch already applied.');
  process.exit(0);
}

function replaceOnce(before, after, label) {
  if (!source.includes(before)) {
    throw new Error(`Cannot apply QRWerk ML Kit patch: ${label} was not found.`);
  }
  source = source.replace(before, after);
}

replaceOnce(
  '    private var detectionAreaViewFrame: CGRect?\n',
  `    private var detectionAreaViewFrame: CGRect?\n` +
    `    // QRWerk: reveal the guide only after the camera preview has started.\n` +
    `    private var didScheduleDetectionAreaReveal = false\n` +
    `    private var cameraPreviewIsReady = false\n`,
  'scanner state',
);

replaceOnce(
  `            self.removeDetectionAreaView()\n            self.addDetectionAreaView()\n`,
  `            self.removeDetectionAreaView()\n            if self.cameraPreviewIsReady {\n                self.addDetectionAreaView()\n            }\n`,
  'guide layout',
);

replaceOnce(
  `    public func captureOutput(_ output: AVCaptureOutput, didOutput sampleBuffer: CMSampleBuffer, from connection: AVCaptureConnection) {\n        guard let barcodeScannerInstance = self.barcodeScannerInstance else {\n`,
  `    public func captureOutput(_ output: AVCaptureOutput, didOutput sampleBuffer: CMSampleBuffer, from connection: AVCaptureConnection) {\n        self.revealDetectionAreaAfterCameraPreviewStarts()\n        guard let barcodeScannerInstance = self.barcodeScannerInstance else {\n`,
  'camera frame callback',
);

replaceOnce(
  `    private func addDetectionAreaView() {\n`,
  `    private func revealDetectionAreaAfterCameraPreviewStarts() {\n` +
    `        guard !self.didScheduleDetectionAreaReveal else { return }\n` +
    `        self.didScheduleDetectionAreaReveal = true\n` +
    `        DispatchQueue.main.asyncAfter(deadline: .now() + 0.25) { [weak self] in\n` +
    `            guard let self = self, self.superview != nil else { return }\n` +
    `            self.cameraPreviewIsReady = true\n` +
    `            if self.settings.showUIElements && self.detectionAreaView == nil {\n` +
    `                self.addDetectionAreaView()\n` +
    `            }\n` +
    `        }\n` +
    `    }\n\n` +
    `    private func addDetectionAreaView() {\n`,
  'delayed guide method',
);

replaceOnce(
  `    @objc private func onCancel() {\n        self.delegate?.onCancel()\n    }\n`,
  `    @objc private func onCancel() {\n` +
    `        guard let detectionAreaView = self.detectionAreaView else {\n` +
    `            self.delegate?.onCancel()\n` +
    `            return\n` +
    `        }\n` +
    `        UIView.animate(withDuration: 0.12, animations: {\n` +
    `            detectionAreaView.alpha = 0\n` +
    `        }, completion: { _ in\n` +
    `            self.removeDetectionAreaView()\n` +
    `            self.delegate?.onCancel()\n` +
    `        })\n` +
    `    }\n`,
  'scanner close animation',
);

fs.writeFileSync(scannerViewPath, source);
console.log('Applied QRWerk ML Kit iOS scanner UI patch.');
