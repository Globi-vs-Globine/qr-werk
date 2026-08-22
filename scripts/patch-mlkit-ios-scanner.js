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
const scannerImplementationPath = path.join(path.dirname(scannerViewPath), 'BarcodeScanner.swift');

if (!fs.existsSync(scannerViewPath)) {
  console.log('ML Kit iOS scanner source not installed; skipping QRWerk UI patch.');
  process.exit(0);
}

let source = fs.readFileSync(scannerViewPath, 'utf8');
let implementationSource = fs.readFileSync(scannerImplementationPath, 'utf8');
const patchMarker = 'QRWerk: reveal the guide only after the camera preview has started.';
const zoomPatchMarker = 'QRWerk: offer a simple 1x/2x scanner zoom control.';
const scannerPolishPatchMarker = 'QRWerk: keep all scanner controls within easy thumb reach.';
const autofocusPatchMarker = 'QRWerk: respect the batch autofocus preference.';
const manualInputPatchMarker = 'QRWerk: allow manual input without leaving the scanner.';

if (source.includes(patchMarker) && source.includes(zoomPatchMarker) && source.includes(scannerPolishPatchMarker) && source.includes(autofocusPatchMarker) && source.includes(manualInputPatchMarker) && implementationSource.includes(manualInputPatchMarker)) {
  console.log('QRWerk ML Kit iOS scanner UI patch already applied.');
  process.exit(0);
}

if (!source.includes(autofocusPatchMarker)) {
replaceOnce(
  `            // Set focus mode\n` +
    `            if device.isFocusModeSupported(.continuousAutoFocus) {\n` +
    `                device.focusMode = .continuousAutoFocus\n` +
    `            }\n`,
  `            // QRWerk: respect the batch autofocus preference.\n` +
    `            let autofocusEnabled = UserDefaults.standard.string(forKey: "CapacitorStorage.qrwerk-batch-autofocus") != "off"\n` +
    `            if autofocusEnabled && device.isFocusModeSupported(.continuousAutoFocus) {\n` +
    `                device.focusMode = .continuousAutoFocus\n` +
    `            } else if !autofocusEnabled && device.isFocusModeSupported(.locked) {\n` +
    `                device.focusMode = .locked\n` +
    `            }\n`,
  'batch autofocus preference',
);
}

function replaceOnce(before, after, label) {
  if (!source.includes(before)) {
    throw new Error(`Cannot apply QRWerk ML Kit patch: ${label} was not found.`);
  }
  source = source.replace(before, after);
}

function replaceImplementationOnce(before, after, label) {
  if (!implementationSource.includes(before)) {
    throw new Error(`Cannot apply QRWerk ML Kit patch: ${label} was not found.`);
  }
  implementationSource = implementationSource.replace(before, after);
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

if (!source.includes(scannerPolishPatchMarker)) {
replaceOnce(
  `    private func addCancelButton() {\n`,
  `    // QRWerk: keep all scanner controls within easy thumb reach.\n` +
    `    private func addCancelButton() {\n`,
  'scanner controls marker',
);

replaceOnce(
  `        if interfaceOrientation.isPortrait {\n` +
    `            button.frame = CGRect(x: 20, y: 50, width: 50, height: 50)\n` +
    `        } else {\n` +
    `            button.frame = CGRect(x: 20, y: 20, width: 50, height: 50)\n` +
    `        }\n`,
  `        _ = interfaceOrientation\n` +
    `        button.frame = CGRect(x: (self.bounds.size.width / 2) - 105, y: self.bounds.size.height - 86, width: 60, height: 60)\n`,
  'bottom cancel button',
);

replaceOnce(
  `        button.layer.cornerRadius = 10\n`,
  `        button.layer.cornerRadius = button.bounds.size.width / 2\n`,
  'round cancel button',
);

replaceOnce(
  `        button.frame = CGRect(x: (self.bounds.size.width / 2) - 25, y: self.bounds.size.height - 86, width: 60, height: 60)\n`,
  `        button.frame = CGRect(x: (self.bounds.size.width / 2) - 30, y: self.bounds.size.height - 86, width: 60, height: 60)\n`,
  'center torch button',
);

replaceOnce(
  `        button.frame = CGRect(x: (self.bounds.size.width / 2) + 50, y: self.bounds.size.height - 86, width: 60, height: 60)\n`,
  `        button.frame = CGRect(x: (self.bounds.size.width / 2) + 45, y: self.bounds.size.height - 86, width: 60, height: 60)\n`,
  'align zoom button',
);

replaceOnce(
  `        view.layer.borderColor = UIColor.white.cgColor\n`,
  `        view.layer.borderColor = UIColor(red: 0, green: 165.0 / 255.0, blue: 170.0 / 255.0, alpha: 1).cgColor\n`,
  'petrol detection guide',
);
}

if (!source.includes(manualInputPatchMarker)) {
replaceOnce(
  `    func onCancel()\n`,
  `    func onCancel()\n` +
    `    func onManualInput(_ value: String)\n`,
  'manual input delegate',
);

replaceOnce(
  `    private var cancelButton: UIButton?\n`,
  `    private var cancelButton: UIButton?\n` +
    `    // QRWerk: allow manual input without leaving the scanner.\n` +
    `    private var manualInputButton: UIButton?\n`,
  'manual input state',
);

replaceOnce(
  `                self.addCancelButton()\n`,
  `                self.addCancelButton()\n` +
    `                self.addManualInputButton()\n`,
  'initial manual input button',
);

replaceOnce(
  `        self.removeCancelButton()\n        self.removeVideoPreviewLayer()\n`,
  `        self.removeCancelButton()\n        self.removeManualInputButton()\n        self.removeVideoPreviewLayer()\n`,
  'manual input cleanup',
);

replaceOnce(
  `            self.removeCancelButton()\n            self.addCancelButton()\n`,
  `            self.removeCancelButton()\n            self.addCancelButton()\n            self.removeManualInputButton()\n            self.addManualInputButton()\n`,
  'manual input layout',
);

replaceOnce(
  `        button.frame = CGRect(x: (self.bounds.size.width / 2) - 105, y: self.bounds.size.height - 86, width: 60, height: 60)\n`,
  `        button.frame = CGRect(x: (self.bounds.size.width / 2) - 142.5, y: self.bounds.size.height - 86, width: 60, height: 60)\n`,
  'four-control cancel position',
);
replaceOnce(
  `        button.frame = CGRect(x: (self.bounds.size.width / 2) - 30, y: self.bounds.size.height - 86, width: 60, height: 60)\n`,
  `        button.frame = CGRect(x: (self.bounds.size.width / 2) + 7.5, y: self.bounds.size.height - 86, width: 60, height: 60)\n`,
  'four-control torch position',
);
replaceOnce(
  `        button.frame = CGRect(x: (self.bounds.size.width / 2) + 45, y: self.bounds.size.height - 86, width: 60, height: 60)\n`,
  `        button.frame = CGRect(x: (self.bounds.size.width / 2) + 82.5, y: self.bounds.size.height - 86, width: 60, height: 60)\n`,
  'four-control zoom position',
);

replaceOnce(
  `    private func addCancelButton() {\n`,
  `    private func addManualInputButton() {\n` +
    `        let image = UIImage(systemName: "keyboard.fill")?.withTintColor(.white, renderingMode: .alwaysOriginal)\n` +
    `        let button = UIButton(type: .custom)\n` +
    `        button.frame = CGRect(x: (self.bounds.size.width / 2) - 67.5, y: self.bounds.size.height - 86, width: 60, height: 60)\n` +
    `        button.backgroundColor = .black.withAlphaComponent(0.5)\n` +
    `        button.setImage(image, for: .normal)\n` +
    `        button.layer.cornerRadius = button.bounds.size.width / 2\n` +
    `        button.imageEdgeInsets = UIEdgeInsets(top: 17, left: 15, bottom: 17, right: 15)\n` +
    `        button.accessibilityLabel = "Manual input"\n` +
    `        button.addTarget(self, action: #selector(onManualInput), for: .touchUpInside)\n` +
    `        self.addSubview(button)\n` +
    `        self.manualInputButton = button\n` +
    `    }\n\n` +
    `    private func removeManualInputButton() {\n` +
    `        self.manualInputButton?.removeFromSuperview()\n` +
    `        self.manualInputButton = nil\n` +
    `    }\n\n` +
    `    @objc private func onManualInput() {\n` +
    `        let isGerman = Locale.preferredLanguages.first?.hasPrefix("de") == true\n` +
    `        let alert = UIAlertController(title: isGerman ? "Code manuell eingeben" : "Enter code manually", message: nil, preferredStyle: .alert)\n` +
    `        alert.addTextField { textField in textField.autocapitalizationType = .none }\n` +
    `        alert.addAction(UIAlertAction(title: isGerman ? "Abbrechen" : "Cancel", style: .cancel))\n` +
    `        alert.addAction(UIAlertAction(title: isGerman ? "Speichern" : "Save", style: .default) { _ in\n` +
    `            guard let value = alert.textFields?.first?.text?.trimmingCharacters(in: .whitespacesAndNewlines), !value.isEmpty else { return }\n` +
    `            self.delegate?.onManualInput(value)\n` +
    `        })\n` +
    `        self.window?.rootViewController?.present(alert, animated: true)\n` +
    `    }\n\n` +
    `    private func addCancelButton() {\n`,
  'manual input control',
);
}

if (!implementationSource.includes(manualInputPatchMarker)) {
replaceImplementationOnce(
  `    public func onCancel() {\n`,
  `    // QRWerk: allow manual input without leaving the scanner.\n` +
    `    public func onManualInput(_ value: String) {\n` +
    `        if let scanCompletionHandler = self.scanCompletionHandler {\n` +
    `            scanCompletionHandler(nil, nil, "QRWERK_MANUAL:" + value)\n` +
    `        }\n` +
    `        self.stopScan()\n` +
    `    }\n\n` +
    `    public func onCancel() {\n`,
  'manual input completion',
);
}

fs.writeFileSync(scannerViewPath, source);
fs.writeFileSync(scannerImplementationPath, implementationSource);
console.log('Applied QRWerk ML Kit iOS scanner UI patch.');
