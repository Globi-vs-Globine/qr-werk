# QR Werk

[![License: GPL-3.0](https://img.shields.io/badge/license-GPL--3.0-orange.svg)](LICENSE)
[![Status: Development](https://img.shields.io/badge/status-development-blue.svg)](https://github.com/Globi-vs-Globine/qr-werk/tree/dev/ios-history-export)

<p align="center">
  <img src="src/assets/img/round_icon.png" alt="QR Werk App-Logo" width="160">
</p>

QR Werk is an iOS-focused fork of [Simple QR by Tom Fong](https://github.com/tomfong/simple-qr). The original project and its contributors remain clearly credited while this fork is developed independently under the GNU General Public License v3.0.

> **Development status**
>
> QR Werk is currently being developed and tested for iPhone and iPad. It has not yet been published in the Apple App Store. There is therefore no download or rating link at present.

## Deutsch

QR Werk ist eine datenschutzfreundliche App zum Scannen, Erstellen und Organisieren von QR-Codes und Barcodes. Im Mittelpunkt stehen eine zuverlässige iOS-Nutzung, Mehrfach-Scans, Bildimporte, Gruppen sowie der flexible Export der Scan-Historie.

Die ausführliche Bedienungsanleitung findest du in der [Dokumentation zu QR Werk](docs/README.md). Dieselben deutschen Kapitel sind in der App unter **Einstellungen → Anleitung** offline verfügbar.

Die Verarbeitung und die Historie bleiben grundsätzlich lokal auf dem Gerät. Eine Internetverbindung wird nur für Aktionen verwendet, die der Benutzer ausdrücklich auslöst, beispielsweise das Öffnen einer Internetadresse.

## Current features / Aktuelle Funktionen

### Scanning / Scannen

- Scan QR codes and common barcode formats with the native iOS camera scanner.
- Supported formats include QR Code, EAN-8, EAN-13, UPC-A, UPC-E, Code 39, Code 93, Code 128, Codabar, ITF, Aztec, Data Matrix and PDF417.
- Batch scan multiple codes consecutively and save them directly to a group.
- Configure duplicate handling, scan pause and autofocus for batch scanning.
- Filter scans by prefix, suffix and exact character count, with a built-in test field.
- Enter a code manually when a damaged label cannot be read reliably.
- Switch between 1× and 2× zoom in the native iOS scanner.
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
- Choose light, dark or black appearance and one of six accent colors.

## Languages / Sprachen

QR Werk is available in German, English, French and Italian. If the iPhone or iPad uses another system language, QR Werk falls back to English.

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

Then open `ios/App/QRWerk.xcworkspace` in Xcode. A unique bundle identifier and a valid Apple development team are required to install the app on a physical iPhone or iPad.

## Project status and releases / Projektstatus und Versionen

- Active development takes place on [`dev/ios-history-export`](https://github.com/Globi-vs-Globine/qr-werk/tree/dev/ios-history-export).
- Changes are reviewed through pull requests before they are merged into `main`.
- QR Werk currently provides no official App Store or packaged GitHub release.
- Bugs and feature requests for this fork belong in its [GitHub Issues](https://github.com/Globi-vs-Globine/qr-werk/issues).

## Origin and attribution / Herkunft und Namensnennung

The original Simple QR project was created by **Tom Fong** and is available at [tomfong/simple-qr](https://github.com/tomfong/simple-qr). The original contributors and their work remain documented through the Git history and the upstream repository.

This fork is maintained independently at [Globi-vs-Globine/qr-werk](https://github.com/Globi-vs-Globine/qr-werk). Upstream store publications, personal profiles, sponsorship pages and demonstrations are not presented as publications or endorsements of this fork.

## Technology / Technik

- Ionic and Angular
- Capacitor 7
- Capacitor ML Kit barcode scanning
- Native iOS project with CocoaPods

## License / Lizenz

QR Werk and this fork are licensed under the [GNU General Public License v3.0](LICENSE). Copyright notices, Git history, attribution and the corresponding source code must remain available when the software is redistributed.
