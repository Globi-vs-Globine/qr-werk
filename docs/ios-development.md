# iOS development

This fork keeps the upstream Ionic/Angular and Capacitor 7 structure. iOS support lives in `ios/App` and targets iOS 15.5 or newer.

## Prerequisites

- macOS with a current Xcode installation
- Node.js and npm
- CocoaPods (`pod --version` must succeed)
- An Apple development team selected locally in Xcode

The repository intentionally does not contain an upstream developer-team identifier. Open `ios/App/App.xcworkspace`, select the **App** target, then choose your own team under **Signing & Capabilities**. Change the bundle identifier if the existing `com.tomfong.simpleqr` identifier is unavailable to your team.

## Build

```sh
npm ci
npm run build:ios
```

Capacitor copies the web build, updates native plugins, installs pods and builds the Xcode project. When native dependencies change, run `npx cap sync ios` before opening the workspace.

Camera, contacts and photo-library purpose strings are declared in `ios/App/App/Info.plist`. Test scanning and image import on a physical device because the simulator cannot exercise the complete camera flow.

## Scan-history export

The history screen exposes **Export**, with CSV and plain-text choices. The complete stored scan history is written to the app cache, passed to the native iOS share sheet, and deleted after the share sheet closes. CSV includes stable English column names, ISO-8601 timestamps and RFC 4180-style quote escaping; a UTF-8 BOM helps spreadsheet applications recognize Unicode content.

The existing CSV button under record settings uses the same exporter. Bookmarks are represented in CSV, including bookmarks whose content no longer has a matching history record. TXT is intended as a readable scan log and contains the complete scan history.

## Known build considerations

- CocoaPods must be installed before the native dependency step can complete.
- Code signing is deliberately developer-specific and must not be committed.
- The current dependency tree reports npm audit findings inherited from upstream. Do not apply a forced audit upgrade as part of an iOS-only change; review upgrades separately because they can include breaking changes.
- Sass and CommonJS optimization warnings are inherited from upstream and do not prevent the web bundle from compiling.

## License

The project remains licensed under GNU GPL v3. Keep `LICENSE`, preserve upstream attribution, mark material fork changes, and provide the corresponding source when distributing binaries. New source files in this fork are distributed under the same GPL v3 terms.
