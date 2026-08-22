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
const zoomPatchMarker = 'QRWerk: offer a simple 1x/2x scanner zoom control.';

if (source.includes(patchMarker) && source.includes(zoomPatchMarker)) {
  console.log('QRWerk ML Kit iOS scanner UI patch already applied.');
  process.exit(0);
}

function replaceOnce(before, after, label) {
  if (!source.includes(before)) {
    throw new Error(`Cannot apply QRWerk ML Kit patch: ${label} was not found.`);
  }
  source = source.replace(before, after);
}

if (!source.includes(patchMarker)) {
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
}

if (!source.includes(zoomPatchMarker)) {
replaceOnce(
  `    private var torchButton: UIButton?\n`,
  `    private var torchButton: UIButton?\n` +
    `    // QRWerk: offer a simple 1x/2x scanner zoom control.\n` +
    `    private var zoomButton: UIButton?\n` +
    `    private var isDoubleZoomActive = false\n`,
  'zoom state',
);

replaceOnce(
  `                if self.implementation.isTorchAvailable() {\n                    self.addTorchButton()\n                }\n`,
  `                if self.implementation.isTorchAvailable() {\n                    self.addTorchButton()\n                }\n` +
    `                self.addZoomButton()\n`,
  'initial zoom button',
);

replaceOnce(
  `        self.removeTorchButton()\n        self.removeCancelButton()\n`,
  `        self.removeTorchButton()\n        self.removeZoomButton()\n        self.removeCancelButton()\n`,
  'zoom cleanup',
);

replaceOnce(
  `            self.removeTorchButton()\n            self.addTorchButton()\n            self.removeDetectionAreaView()\n`,
  `            self.removeTorchButton()\n            self.addTorchButton()\n            self.removeZoomButton()\n            self.addZoomButton()\n            self.removeDetectionAreaView()\n`,
  'zoom layout',
);

replaceOnce(
  `    private func revealDetectionAreaAfterCameraPreviewStarts() {\n`,
  `    private func addZoomButton() {\n` +
    `        let button = UIButton(type: .custom)\n` +
    `        button.frame = CGRect(x: (self.bounds.size.width / 2) + 50, y: self.bounds.size.height - 86, width: 60, height: 60)\n` +
    `        button.backgroundColor = .black.withAlphaComponent(0.5)\n` +
    `        button.setTitle(self.isDoubleZoomActive ? "2×" : "1×", for: .normal)\n` +
    `        button.setTitleColor(.white, for: .normal)\n` +
    `        button.titleLabel?.font = UIFont.systemFont(ofSize: 18, weight: .semibold)\n` +
    `        button.layer.cornerRadius = button.bounds.size.width / 2\n` +
    `        button.accessibilityLabel = "Zoom"\n` +
    `        button.addTarget(self, action: #selector(onZoomToggle), for: .touchUpInside)\n` +
    `        self.addSubview(button)\n` +
    `        self.zoomButton = button\n` +
    `    }\n\n` +
    `    private func removeZoomButton() {\n` +
    `        self.zoomButton?.removeFromSuperview()\n` +
    `        self.zoomButton = nil\n` +
    `    }\n\n` +
    `    @objc private func onZoomToggle() {\n` +
    `        guard let device = self.captureDevice else { return }\n` +
    `        let oneTimesFactor: CGFloat = device.deviceType == .builtInTripleCamera ? 2.0 : 1.0\n` +
    `        let requestedFactor = self.isDoubleZoomActive ? oneTimesFactor : oneTimesFactor * 2.0\n` +
    `        let zoomFactor = min(max(requestedFactor, device.minAvailableVideoZoomFactor), device.maxAvailableVideoZoomFactor)\n` +
    `        do {\n` +
    `            try device.lockForConfiguration()\n` +
    `            device.ramp(toVideoZoomFactor: zoomFactor, withRate: 8.0)\n` +
    `            device.unlockForConfiguration()\n` +
    `            self.isDoubleZoomActive = !self.isDoubleZoomActive\n` +
    `            self.zoomButton?.setTitle(self.isDoubleZoomActive ? "2×" : "1×", for: .normal)\n` +
    `        } catch {\n` +
    `            CAPLog.print("Unable to change scanner zoom.", error.localizedDescription)\n` +
    `        }\n` +
    `    }\n\n` +
    `    private func revealDetectionAreaAfterCameraPreviewStarts() {\n`,
  'zoom controls',
);
}

fs.writeFileSync(scannerViewPath, source);
console.log('Applied QRWerk ML Kit iOS scanner UI patch.');
