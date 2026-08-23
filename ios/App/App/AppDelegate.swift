import UIKit
import Capacitor
import CloudKit

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

class QRWerkViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        // QR Werk is compiled as a native app target, not as a separate CocoaPod.
        // Capacitor 7 skips registerPluginType while automatic pod discovery is
        // enabled, so a local plugin must be registered as an instance.
        bridge?.registerPluginInstance(QRWerkCloudSyncPlugin())
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
