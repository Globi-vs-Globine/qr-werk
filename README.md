# Simple QR – iOS fork

[![License: GPL-3.0](https://img.shields.io/badge/license-GPL--3.0-orange.svg)](LICENSE)
[![Status: Development](https://img.shields.io/badge/status-development-blue.svg)](https://github.com/Globi-vs-Globine/simple-qr/tree/dev/ios-history-export)

This repository is an iOS-focused fork of [tomfong/simple-qr](https://github.com/tomfong/simple-qr). It keeps the original project and its contributors visible while extending the app under the GNU General Public License v3.0.

> **Development status**
>
> This fork is currently being developed and tested. It has not been published by the fork owner in the Apple App Store or Google Play Store. Store download and rating links therefore are not available yet.

## Deutsch

Simple QR ist eine datenschutzfreundliche App zum Scannen, Erstellen und Organisieren von QR-Codes und Barcodes. Dieser Fork konzentriert sich insbesondere auf eine zuverlässige iOS-Version, Mehrfach-Scans, Bildimporte, Gruppen sowie den flexiblen Export der Scan-Historie.

Die Verarbeitung und die Historie bleiben grundsätzlich lokal auf dem Gerät. Eine Internetverbindung wird nur für Aktionen verwendet, die der Benutzer ausdrücklich auslöst, beispielsweise das Öffnen einer Internetadresse.

## Current features / Aktuelle Funktionen

### Scanning / Scannen

- Scan QR codes and common barcode formats with the native iOS camera scanner.
- Supported formats include QR Code, EAN-8, EAN-13, UPC-A, UPC-E, Code 39, Code 93, Code 128, Codabar, ITF, Aztec, Data Matrix and PDF417.
- Batch scan multiple codes consecutively and save them directly to a group.
- Import one or multiple images from the photo library.
- Detect multiple codes in one image.
- Review detected codes and save all or only a selected subset.

### History and groups / Protokoll und Gruppen

- Keep a local history of scanned, imported and created codes.
- Bookmark important entries.
- Create, rename and delete groups independently of existing entries.
- Move individual entries into groups.
- Collapse and expand groups for a clearer overview.
- Select individual entries or entire groups for export.
- Export as CSV or TXT, either with complete record details or only the code contents.
- Copy selected code contents directly to the clipboard.
- Back up and restore records.

### Creating and actions / Erstellen und Aktionen

- Create QR codes from text, URLs, contacts, phone numbers, messages, email addresses, Wi-Fi access data and locations.
- Use context-sensitive actions such as opening links, copying content or starting a web search.
- Customize generated QR codes and app appearance.

## Privacy / Datenschutz

The app has no advertising backend and does not require an account. Scan history and groups are stored locally. Camera and photo-library access are used only for scanning or importing codes initiated by the user.

See [PRIVACY.md](PRIVACY.md) for the privacy information maintained with this fork. The document must be reviewed again before any public App Store release.

## iOS development

Detailed prerequisites, build instructions, known iOS hurdles and GPL notes are documented in [docs/ios-development.md](docs/ios-development.md).

Basic development flow:

```sh
npm install
npm run build
npx cap sync ios
```

Then open `ios/App/App.xcworkspace` in Xcode. A unique bundle identifier and a valid Apple development team are required to install the app on a physical iPhone or iPad.

## Project status and releases / Projektstatus und Versionen

- Active development takes place on [`dev/ios-history-export`](https://github.com/Globi-vs-Globine/simple-qr/tree/dev/ios-history-export).
- Changes are reviewed through pull requests before they are merged into `main`.
- This fork currently provides no official App Store, Google Play or packaged GitHub release.
- Bugs and feature requests for this fork belong in its [GitHub Issues](https://github.com/Globi-vs-Globine/simple-qr/issues).

## Origin and attribution / Herkunft und Namensnennung

The original Simple QR project was created by **Tom Fong** and is available at [tomfong/simple-qr](https://github.com/tomfong/simple-qr). The original contributors and their work remain documented through the Git history and the upstream repository.

This fork is maintained independently at [Globi-vs-Globine/simple-qr](https://github.com/Globi-vs-Globine/simple-qr). Upstream store publications, personal profiles, sponsorship pages and demonstrations are not presented as publications or endorsements of this fork.

## Technology / Technik

- Ionic and Angular
- Capacitor 7
- Capacitor ML Kit barcode scanning
- Native iOS project with CocoaPods

## License / Lizenz

Simple QR and this fork are licensed under the [GNU General Public License v3.0](LICENSE). Copyright notices, Git history, attribution and the corresponding source code must remain available when the software is redistributed.
