import UIKit
import Capacitor
import CloudKit
import AVFoundation
import Vision
import ImageIO

@objc(QRWerkCloudSyncPlugin)
class QRWerkCloudSyncPlugin: CAPPlugin, CAPBridgedPlugin {
    let identifier = "QRWerkCloudSyncPlugin"
    let jsName = "QRWerkCloudSync"
    let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "accountStatus", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "download", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "upload", returnType: CAPPluginReturnPromise)
    ]

    private let container = CKContainer(identifier: "iCloud.ch.qrwerk.app")
    private let recordID = CKRecord.ID(recordName: "primary")

    @objc func accountStatus(_ call: CAPPluginCall) {
        container.accountStatus { status, error in
            if let error = error {
                let nsError = error as NSError
                call.reject("accountStatus|\(nsError.domain)|\(nsError.code)|\(error.localizedDescription)")
                return
            }
            let value: String
            switch status {
            case .available: value = "available"
            case .noAccount: value = "noAccount"
            case .restricted: value = "restricted"
            case .couldNotDetermine: value = "unknown"
            case .temporarilyUnavailable: value = "unknown"
            @unknown default: value = "unknown"
            }
            call.resolve(["status": value])
        }
    }

    @objc func download(_ call: CAPPluginCall) {
        Task {
            do {
                let record = try await container.privateCloudDatabase.record(for: recordID)
                let payload: String
                if let asset = record["payloadAsset"] as? CKAsset,
                   let url = asset.fileURL {
                    payload = try String(contentsOf: url, encoding: .utf8)
                } else {
                    // Compatibility with early development snapshots.
                    payload = record["payload"] as? String ?? ""
                }
                call.resolve(["exists": true, "payload": payload, "updatedAt": record.modificationDate?.timeIntervalSince1970 ?? 0])
            } catch let error as CKError where error.code == .unknownItem {
                call.resolve(["exists": false])
            } catch {
                let nsError = error as NSError
                call.reject("download|\(nsError.domain)|\(nsError.code)|\(error.localizedDescription)")
            }
        }
    }

    @objc func upload(_ call: CAPPluginCall) {
        guard let payload = call.getString("payload") else { call.reject("Missing payload"); return }
        Task {
            let temporaryURL = FileManager.default.temporaryDirectory
                .appendingPathComponent("qrwerk-cloud-\(UUID().uuidString).json")
            do {
                try payload.write(to: temporaryURL, atomically: true, encoding: .utf8)
                defer { try? FileManager.default.removeItem(at: temporaryURL) }
                let database = container.privateCloudDatabase
                let record = (try? await database.record(for: recordID)) ?? CKRecord(recordType: "QRWerkSnapshot", recordID: recordID)
                record["payloadAsset"] = CKAsset(fileURL: temporaryURL)
                record["payload"] = nil
                record["schemaVersion"] = 1 as CKRecordValue
                let saved = try await database.save(record)
                call.resolve(["updatedAt": saved.modificationDate?.timeIntervalSince1970 ?? Date().timeIntervalSince1970])
            } catch {
                let nsError = error as NSError
                call.reject("upload|\(nsError.domain)|\(nsError.code)|\(error.localizedDescription)")
            }
        }
    }
}

protocol QRWerkScannerViewControllerDelegate: AnyObject {
    func scanner(_ scanner: QRWerkScannerViewController, found value: String, format: String)
    func scannerDidCancel(_ scanner: QRWerkScannerViewController)
    func scanner(_ scanner: QRWerkScannerViewController, enteredManualValue value: String)
}

final class QRWerkScannerViewController: UIViewController, AVCaptureMetadataOutputObjectsDelegate {
    weak var delegate: QRWerkScannerViewControllerDelegate?

    private let session = AVCaptureSession()
    private let metadataOutput = AVCaptureMetadataOutput()
    private var previewLayer: AVCaptureVideoPreviewLayer?
    private var captureDevice: AVCaptureDevice?
    private var guideView: UIView?
    private var zoomButton: UIButton?
    private var hasFinished = false
    private var guideRevealScheduled = false

    override var prefersStatusBarHidden: Bool { false }
    override var supportedInterfaceOrientations: UIInterfaceOrientationMask { .all }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .black
        configureCamera()
        configureControls()
    }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        DispatchQueue.global(qos: .userInitiated).async { [weak self] in self?.session.startRunning() }
        revealGuideAfterPreviewStarts()
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        previewLayer?.frame = view.bounds
        layoutGuide()
    }

    private func configureCamera() {
        guard let device = AVCaptureDevice.default(for: .video),
              let input = try? AVCaptureDeviceInput(device: device),
              session.canAddInput(input), session.canAddOutput(metadataOutput) else { return }
        captureDevice = device
        session.addInput(input)
        session.addOutput(metadataOutput)
        metadataOutput.setMetadataObjectsDelegate(self, queue: .main)
        metadataOutput.metadataObjectTypes = metadataOutput.availableMetadataObjectTypes.filter {
            Self.supportedMetadataTypes.contains($0)
        }
        if device.isFocusModeSupported(.continuousAutoFocus),
           UserDefaults.standard.string(forKey: "CapacitorStorage.qrwerk-batch-autofocus") != "off" {
            try? device.lockForConfiguration()
            device.focusMode = .continuousAutoFocus
            device.unlockForConfiguration()
        }
        let layer = AVCaptureVideoPreviewLayer(session: session)
        layer.videoGravity = .resizeAspectFill
        view.layer.insertSublayer(layer, at: 0)
        previewLayer = layer
    }

    private func configureControls() {
        let stack = UIStackView()
        stack.axis = .horizontal
        stack.alignment = .center
        stack.distribution = .equalSpacing
        stack.spacing = 10
        stack.translatesAutoresizingMaskIntoConstraints = false

        let close = roundButton(symbol: "xmark", accessibility: localized("Schliessen", "Close"), action: #selector(closeScanner))
        let manual = roundButton(symbol: "keyboard", accessibility: localized("Code manuell eingeben", "Enter code manually"), action: #selector(showManualInput))
        let torch = roundButton(symbol: "flashlight.off.fill", accessibility: localized("Taschenlampe", "Torch"), action: #selector(toggleTorch))
        let zoom = textButton("1×", accessibility: "Zoom", action: #selector(toggleZoom))
        zoomButton = zoom
        let options = roundButton(symbol: "line.3.horizontal.decrease.circle", accessibility: localized("Scan-Optionen", "Scan options"), action: #selector(showScanOptions))
        [close, manual, torch, zoom, options].forEach(stack.addArrangedSubview)
        view.addSubview(stack)
        NSLayoutConstraint.activate([
            stack.leadingAnchor.constraint(greaterThanOrEqualTo: view.safeAreaLayoutGuide.leadingAnchor, constant: 18),
            stack.trailingAnchor.constraint(lessThanOrEqualTo: view.safeAreaLayoutGuide.trailingAnchor, constant: -18),
            stack.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            stack.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -14),
        ])
    }

    private func roundButton(symbol: String, accessibility: String, action: Selector) -> UIButton {
        let button = UIButton(type: .system)
        button.translatesAutoresizingMaskIntoConstraints = false
        button.widthAnchor.constraint(equalToConstant: 58).isActive = true
        button.heightAnchor.constraint(equalToConstant: 58).isActive = true
        button.backgroundColor = UIColor.black.withAlphaComponent(0.62)
        button.tintColor = .white
        button.layer.cornerRadius = 29
        button.setImage(UIImage(systemName: symbol), for: .normal)
        button.accessibilityLabel = accessibility
        button.addTarget(self, action: action, for: .touchUpInside)
        return button
    }

    private func textButton(_ text: String, accessibility: String, action: Selector) -> UIButton {
        let button = roundButton(symbol: "", accessibility: accessibility, action: action)
        button.setImage(nil, for: .normal)
        button.setTitle(text, for: .normal)
        button.setTitleColor(.white, for: .normal)
        button.titleLabel?.font = .systemFont(ofSize: 18, weight: .semibold)
        return button
    }

    private func revealGuideAfterPreviewStarts() {
        guard !guideRevealScheduled else { return }
        guideRevealScheduled = true
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.25) { [weak self] in
            guard let self = self, !self.hasFinished else { return }
            let guide = UIView()
            guide.isUserInteractionEnabled = false
            guide.layer.borderWidth = 5
            guide.layer.cornerRadius = 18
            guide.layer.borderColor = self.accentColor().withAlphaComponent(0.78).cgColor
            guide.alpha = 0
            self.view.insertSubview(guide, aboveSubview: self.view.subviews.first ?? self.view)
            self.guideView = guide
            self.layoutGuide()
            UIView.animate(withDuration: 0.16) { guide.alpha = 1 }
        }
    }

    private func layoutGuide() {
        guard let guide = guideView else { return }
        let safe = view.safeAreaInsets
        let area = UserDefaults.standard.string(forKey: "CapacitorStorage.qrwerk-scan-area") ?? "standard"
        let availableHeight = max(180, view.bounds.height - safe.top - safe.bottom - 130)
        switch area {
        case "full":
            guide.frame = CGRect(x: 24, y: safe.top + 20, width: view.bounds.width - 48, height: availableHeight - 30)
        case "wide":
            guide.frame = CGRect(x: 24, y: safe.top + availableHeight * 0.28, width: view.bounds.width - 48, height: min(230, availableHeight * 0.42))
        default:
            let size = min(255, view.bounds.width - 70)
            guide.frame = CGRect(x: (view.bounds.width - size) / 2, y: safe.top + max(45, (availableHeight - size) / 2), width: size, height: size)
        }
        if let previewLayer = previewLayer {
            metadataOutput.rectOfInterest = area == "full" ? CGRect(x: 0, y: 0, width: 1, height: 1) : previewLayer.metadataOutputRectConverted(fromLayerRect: guide.frame)
        }
    }

    @objc private func closeScanner() { finish { self.delegate?.scannerDidCancel(self) } }

    @objc private func showManualInput() {
        let alert = UIAlertController(title: localized("Code manuell eingeben", "Enter code manually"), message: nil, preferredStyle: .alert)
        alert.addTextField { $0.autocapitalizationType = .none; $0.clearButtonMode = .whileEditing }
        alert.addAction(UIAlertAction(title: localized("Abbrechen", "Cancel"), style: .cancel))
        alert.addAction(UIAlertAction(title: localized("Übernehmen", "Use"), style: .default) { [weak self, weak alert] _ in
            guard let self = self, let value = alert?.textFields?.first?.text?.trimmingCharacters(in: .whitespacesAndNewlines), !value.isEmpty else { return }
            self.finish { self.delegate?.scanner(self, enteredManualValue: value) }
        })
        present(alert, animated: true)
    }

    @objc private func toggleTorch() {
        guard let device = captureDevice, device.hasTorch else { return }
        do {
            try device.lockForConfiguration()
            device.torchMode = device.torchMode == .on ? .off : .on
            device.unlockForConfiguration()
        } catch { }
    }

    @objc private func toggleZoom() {
        guard let device = captureDevice else { return }
        let isTwo = (zoomButton?.title(for: .normal) == "2×")
        let requested: CGFloat = isTwo ? 1 : 2
        do {
            try device.lockForConfiguration()
            device.videoZoomFactor = min(max(requested, device.minAvailableVideoZoomFactor), device.maxAvailableVideoZoomFactor)
            device.unlockForConfiguration()
            zoomButton?.setTitle(isTwo ? "1×" : "2×", for: .normal)
        } catch { }
    }

    @objc private func showScanOptions(_ sender: UIButton) {
        let sheet = UIAlertController(title: localized("Scanbereich", "Scan area"), message: localized("Ein eindeutig erkannter Code wird im gewählten Bereich erfasst.", "A clearly recognized code is captured inside the selected area."), preferredStyle: .actionSheet)
        [("standard", localized("Standard", "Standard")), ("wide", localized("Breit", "Wide")), ("full", localized("Ganzes Bild", "Full image"))].forEach { value, title in
            sheet.addAction(UIAlertAction(title: title, style: .default) { [weak self] _ in
                UserDefaults.standard.set(value, forKey: "CapacitorStorage.qrwerk-scan-area")
                self?.layoutGuide()
            })
        }
        sheet.addAction(UIAlertAction(title: localized("Scan-Filter", "Scan filter"), style: .default) { [weak self] _ in self?.showFilterOptions() })
        sheet.addAction(UIAlertAction(title: localized("Abbrechen", "Cancel"), style: .cancel))
        sheet.popoverPresentationController?.sourceView = sender
        sheet.popoverPresentationController?.sourceRect = sender.bounds
        present(sheet, animated: true)
    }

    private func showFilterOptions() {
        let defaults = UserDefaults.standard
        let alert = UIAlertController(title: localized("Scan-Filter", "Scan filter"), message: localized("Optional: Nur Codes übernehmen, die alle ausgefüllten Bedingungen erfüllen.", "Optional: accept only codes matching every filled condition."), preferredStyle: .alert)
        alert.addTextField { $0.placeholder = self.localized("Beginnt mit, z. B. CF", "Starts with, e.g. CF"); $0.text = defaults.string(forKey: "CapacitorStorage.scan-filter-prefix") }
        alert.addTextField { $0.placeholder = self.localized("Endet mit, z. B. 99", "Ends with, e.g. 99"); $0.text = defaults.string(forKey: "CapacitorStorage.scan-filter-suffix") }
        alert.addTextField { $0.placeholder = self.localized("Gesamte Zeichenanzahl, z. B. 20", "Total character count, e.g. 20"); $0.keyboardType = .numberPad; $0.text = defaults.string(forKey: "CapacitorStorage.scan-filter-length") }
        alert.addAction(UIAlertAction(title: localized("Filter ausschalten", "Disable filter"), style: .destructive) { _ in
            defaults.set("off", forKey: "CapacitorStorage.scan-filter-enabled")
        })
        alert.addAction(UIAlertAction(title: localized("Abbrechen", "Cancel"), style: .cancel))
        alert.addAction(UIAlertAction(title: localized("Übernehmen", "Apply"), style: .default) { [weak alert] _ in
            let fields = alert?.textFields ?? []
            let prefix = fields.indices.contains(0) ? fields[0].text?.trimmingCharacters(in: .whitespacesAndNewlines) ?? "" : ""
            let suffix = fields.indices.contains(1) ? fields[1].text?.trimmingCharacters(in: .whitespacesAndNewlines) ?? "" : ""
            let length = fields.indices.contains(2) ? fields[2].text?.trimmingCharacters(in: .whitespacesAndNewlines) ?? "" : ""
            defaults.set(prefix, forKey: "CapacitorStorage.scan-filter-prefix")
            defaults.set(suffix, forKey: "CapacitorStorage.scan-filter-suffix")
            defaults.set(length, forKey: "CapacitorStorage.scan-filter-length")
            defaults.set((!prefix.isEmpty || !suffix.isEmpty || (Int(length) ?? 0) > 0) ? "on" : "off", forKey: "CapacitorStorage.scan-filter-enabled")
        })
        present(alert, animated: true)
    }

    private func finish(_ completion: @escaping () -> Void) {
        guard !hasFinished else { return }
        hasFinished = true
        if captureDevice?.torchMode == .on { toggleTorch() }
        guideView.map { guide in UIView.animate(withDuration: 0.12) { guide.alpha = 0 } }
        DispatchQueue.global(qos: .userInitiated).async { [weak self] in self?.session.stopRunning() }
        dismiss(animated: true, completion: completion)
    }

    func metadataOutput(_ output: AVCaptureMetadataOutput, didOutput metadataObjects: [AVMetadataObject], from connection: AVCaptureConnection) {
        guard let object = metadataObjects.compactMap({ $0 as? AVMetadataMachineReadableCodeObject }).first,
              let value = object.stringValue, !value.isEmpty else { return }
        finish { self.delegate?.scanner(self, found: value, format: Self.formatName(for: object.type, value: value)) }
    }

    private func accentColor() -> UIColor {
        switch UserDefaults.standard.string(forKey: "CapacitorStorage.accent-color") ?? "petrol" {
        case "blue": return UIColor(red: 0, green: 104/255, blue: 184/255, alpha: 1)
        case "violet": return UIColor(red: 109/255, green: 75/255, blue: 195/255, alpha: 1)
        case "green": return UIColor(red: 40/255, green: 122/255, blue: 67/255, alpha: 1)
        case "orange": return UIColor(red: 166/255, green: 75/255, blue: 0, alpha: 1)
        case "pink": return UIColor(red: 168/255, green: 58/255, blue: 114/255, alpha: 1)
        default: return UIColor(red: 0, green: 127/255, blue: 131/255, alpha: 1)
        }
    }

    private func localized(_ german: String, _ english: String) -> String {
        Locale.preferredLanguages.first?.hasPrefix("de") == true ? german : english
    }

    static let supportedMetadataTypes: Set<AVMetadataObject.ObjectType> = [.qr, .aztec, .dataMatrix, .pdf417, .code128, .code39, .code93, .ean8, .ean13, .upce, .interleaved2of5, .itf14, .codabar]

    static func formatName(for type: AVMetadataObject.ObjectType, value: String = "") -> String {
        switch type {
        case .qr: return "QR_CODE"
        case .aztec: return "AZTEC"
        case .dataMatrix: return "DATA_MATRIX"
        case .pdf417: return "PDF_417"
        case .code128: return "CODE_128"
        case .code39, .code39Mod43: return "CODE_39"
        case .code93: return "CODE_93"
        case .ean8: return "EAN_8"
        case .ean13: return value.hasPrefix("0") && value.count == 13 ? "UPC_A" : "EAN_13"
        case .upce: return "UPC_E"
        case .interleaved2of5, .itf14: return "ITF"
        case .codabar: return "CODABAR"
        default: return "UNKNOWN"
        }
    }
}

@objc(QRWerkBarcodeScannerPlugin)
class QRWerkBarcodeScannerPlugin: CAPPlugin, CAPBridgedPlugin, QRWerkScannerViewControllerDelegate {
    let identifier = "QRWerkBarcodeScannerPlugin"
    let jsName = "QRWerkBarcodeScanner"
    let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "scan", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "readBarcodesFromImage", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "checkPermissions", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "requestPermissions", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "openSettings", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stopScan", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "isTorchAvailable", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "isTorchEnabled", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "enableTorch", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "disableTorch", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setZoomRatio", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getMinZoomRatio", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getMaxZoomRatio", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "startScan", returnType: CAPPluginReturnPromise),
    ]
    private var scanCall: CAPPluginCall?
    private weak var scannerController: QRWerkScannerViewController?

    @objc override func checkPermissions(_ call: CAPPluginCall) { call.resolve(["camera": permissionValue(AVCaptureDevice.authorizationStatus(for: .video))]) }
    @objc override func requestPermissions(_ call: CAPPluginCall) {
        AVCaptureDevice.requestAccess(for: .video) { granted in call.resolve(["camera": granted ? "granted" : "denied"]) }
    }
    @objc func openSettings(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            if let url = URL(string: UIApplication.openSettingsURLString) { UIApplication.shared.open(url) }
            call.resolve()
        }
    }
    @objc func scan(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            guard let presenter = self.bridge?.viewController else { call.reject("Scanner unavailable"); return }
            let scanner = QRWerkScannerViewController()
            scanner.delegate = self
            scanner.modalPresentationStyle = .fullScreen
            self.scanCall = call
            self.scannerController = scanner
            presenter.present(scanner, animated: true)
        }
    }
    @objc func stopScan(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            self.scannerController?.dismiss(animated: false)
            self.scanCall?.reject("Scanner closed")
            self.scanCall = nil
            call.resolve()
        }
    }
    @objc func readBarcodesFromImage(_ call: CAPPluginCall) {
        guard let rawPath = call.getString("path") else { call.reject("Missing image path"); return }
        DispatchQueue.global(qos: .userInitiated).async {
            let path = rawPath.removingPercentEncoding ?? rawPath
            let url = URL(string: path)?.isFileURL == true ? URL(string: path)! : URL(fileURLWithPath: path)
            guard let source = CGImageSourceCreateWithURL(url as CFURL, nil), let image = CGImageSourceCreateImageAtIndex(source, 0, nil) else { call.reject("Image could not be opened"); return }
            let request = VNDetectBarcodesRequest()
            do {
                try VNImageRequestHandler(cgImage: image, options: [:]).perform([request])
                let barcodes = (request.results ?? []).compactMap { observation -> [String: Any]? in
                    guard let value = observation.payloadStringValue, !value.isEmpty else { return nil }
                    return ["rawValue": value, "displayValue": value, "format": Self.visionFormatName(observation.symbology)]
                }
                call.resolve(["barcodes": barcodes])
            } catch { call.reject("Local image recognition failed: \(error.localizedDescription)") }
        }
    }
    @objc func isTorchAvailable(_ call: CAPPluginCall) { call.resolve(["available": AVCaptureDevice.default(for: .video)?.hasTorch == true]) }
    @objc func isTorchEnabled(_ call: CAPPluginCall) { call.resolve(["enabled": AVCaptureDevice.default(for: .video)?.torchMode == .on]) }
    @objc func enableTorch(_ call: CAPPluginCall) { setTorch(true, call) }
    @objc func disableTorch(_ call: CAPPluginCall) { setTorch(false, call) }
    @objc func setZoomRatio(_ call: CAPPluginCall) { call.resolve() }
    @objc func getMinZoomRatio(_ call: CAPPluginCall) { call.resolve(["zoomRatio": 1]) }
    @objc func getMaxZoomRatio(_ call: CAPPluginCall) { call.resolve(["zoomRatio": 2]) }
    @objc func startScan(_ call: CAPPluginCall) { call.reject("Embedded scanning is not used on iOS") }

    func scanner(_ scanner: QRWerkScannerViewController, found value: String, format: String) {
        scanCall?.resolve(["barcodes": [["rawValue": value, "displayValue": value, "format": format]]]); scanCall = nil
    }
    func scannerDidCancel(_ scanner: QRWerkScannerViewController) { scanCall?.reject("Scanner closed"); scanCall = nil }
    func scanner(_ scanner: QRWerkScannerViewController, enteredManualValue value: String) { scanCall?.reject("QRWERK_MANUAL:\(value)"); scanCall = nil }

    private func permissionValue(_ status: AVAuthorizationStatus) -> String {
        switch status { case .authorized: return "granted"; case .notDetermined: return "prompt"; default: return "denied" }
    }
    private func setTorch(_ enabled: Bool, _ call: CAPPluginCall) {
        guard let device = AVCaptureDevice.default(for: .video), device.hasTorch else { call.resolve(); return }
        do { try device.lockForConfiguration(); device.torchMode = enabled ? .on : .off; device.unlockForConfiguration(); call.resolve() } catch { call.reject(error.localizedDescription) }
    }
    private static func visionFormatName(_ symbology: VNBarcodeSymbology) -> String {
        switch symbology {
        case .qr: return "QR_CODE"; case .aztec: return "AZTEC"; case .dataMatrix: return "DATA_MATRIX"; case .pdf417: return "PDF_417"
        case .code128: return "CODE_128"; case .code39, .code39Checksum: return "CODE_39"; case .code93, .code93i: return "CODE_93"
        case .ean8: return "EAN_8"; case .ean13: return "EAN_13"; case .upce: return "UPC_E"; case .i2of5, .i2of5Checksum, .itf14: return "ITF"; case .codabar: return "CODABAR"
        default: return "UNKNOWN"
        }
    }
}

class QRWerkViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        // QR Werk is compiled as a native app target, not as a separate CocoaPod.
        // Capacitor 7 skips registerPluginType while automatic pod discovery is
        // enabled, so a local plugin must be registered as an instance.
        bridge?.registerPluginInstance(QRWerkCloudSyncPlugin())
        bridge?.registerPluginInstance(QRWerkBarcodeScannerPlugin())
    }
}

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.
        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        // Called when the app was launched with a url. Feel free to add additional processing here,
        // but if you want the App API to support tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Called when the app was launched with an activity, including Universal Links.
        // Feel free to add additional processing here, but if you want the App API to support
        // tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }


}
