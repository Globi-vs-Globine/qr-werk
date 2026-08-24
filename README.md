# QR Werk

[English](README.md) | [Deutsch](README.de.md)

[![License: GPL-3.0](https://img.shields.io/badge/license-GPL--3.0-orange.svg)](LICENSE)
[![Status: Development](https://img.shields.io/badge/status-development-blue.svg)](https://github.com/Globi-vs-Globine/qr-werk)

<p align="center">
  <img src="src/assets/img/round_icon.png" alt="QR Werk app logo" width="160">
</p>

QR Werk is a privacy-friendly app for scanning, creating and organizing QR codes and barcodes. It is an iOS-focused fork of [Simple QR by Tom Fong](https://github.com/tomfong/simple-qr), developed independently under the GNU General Public License v3.0.

> **Development status**
>
> QR Werk is currently being developed and tested for iPhone and iPad. It has not yet been published in the Apple App Store, so no download or rating link is available at present.

The detailed [QR Werk documentation](docs/README.md) is available in German, English, French and Italian. The matching chapters are also included offline in the app under **Settings → User Guide**.

Camera frames and imported images are recognized locally with Apple's AVFoundation and Vision frameworks. They are not uploaded for recognition. History remains on the device by default; internet access occurs only for optional iCloud sync or an external action confirmed by the user.

## Features

### Scanning

- Scan QR codes and common barcode formats with the native iOS camera scanner.
- Supported formats include QR Code, EAN-8, EAN-13, UPC-A, UPC-E, Code 39, Code 93, Code 128, Codabar, ITF, Aztec, Data Matrix and PDF417.
- Batch-scan multiple codes consecutively and save them directly to a group.
- Configure duplicate handling, scan delay and autofocus.
- Filter scans by prefix, suffix and exact character count, including a built-in test field.
- Enter codes manually when damaged labels cannot be read reliably.
- Switch between 1× and 2× zoom in the native iOS scanner.
- Choose a standard, wide or full-image scan area directly in the scanner.
- Configure vibration, one of four scan sounds and the relative sound volume.
- Import one or multiple images from the photo library.
- Detect multiple codes in a single image.
- Review detected codes and save all or only a selected subset.

### History and groups

- Keep a local history of scanned, imported and created codes.
- Bookmark important entries.
- Create, rename and delete groups independently of existing entries.
- Move individual entries into groups.
- Collapse and expand groups for a clearer overview.
- Select individual entries or entire groups for export.
- Export as CSV or TXT, with complete record details or only the code contents.
- Copy selected code contents directly to the clipboard.
- Move deleted entries to a recoverable trash before permanently removing them.
- Synchronize history, groups, bookmarks, duplicate events and trash between the user's Apple devices through optional private iCloud storage.
- Back up, restore and import records locally.

### Creating codes and actions

- Create QR codes from text, URLs, contacts, phone numbers, messages, email addresses, Wi-Fi access data and locations.
- Use context-sensitive actions such as opening links, copying content or starting a web search.
- Customize generated QR codes and the app appearance.
- Choose a light, dark or black appearance, a preset or custom accent color and the preferred start view.

## Languages

QR Werk is available in German, English, French and Italian. If the iPhone or iPad uses another system language, QR Werk falls back to English.

## Privacy

The app has no advertising backend and does not require a QR Werk account. Scan history, groups, bookmarks and trash are stored locally. Camera and photo-library access are used only for scanning or importing codes initiated by the user.

See [PRIVACY.md](PRIVACY.md) for the privacy information maintained with this fork. Optional iCloud synchronization is disabled by default and stores selected app data only in the user's private CloudKit database.

## iOS development

Detailed prerequisites, build instructions, known iOS hurdles and GPL notes are documented in [docs/ios-development.md](docs/ios-development.md).

Basic development flow:

```sh
npm install
npm run build
npx cap sync ios
```

Then open `ios/App/QRWerk.xcworkspace` in Xcode. A unique bundle identifier and a valid Apple development team are required to install the app on a physical iPhone or iPad.

## Project status and releases

- Development takes place on dedicated feature branches. Reviewed changes are merged into `main` through pull requests.
- QR Werk currently provides no official App Store or packaged GitHub release.
- Bugs and feature requests for this fork belong in its [GitHub Issues](https://github.com/Globi-vs-Globine/qr-werk/issues).

## Origin and attribution

The original Simple QR project was created by **Tom Fong** and is available at [tomfong/simple-qr](https://github.com/tomfong/simple-qr). The original contributors and their work remain documented through the Git history and upstream repository.

This fork is maintained independently at [Globi-vs-Globine/qr-werk](https://github.com/Globi-vs-Globine/qr-werk). Upstream store publications, personal profiles, sponsorship pages and demonstrations are not presented as publications or endorsements of this fork.

## Technology

- Ionic and Angular
- Capacitor 7
- Local Apple AVFoundation and Vision barcode recognition
- Native iOS project with CocoaPods

## License

QR Werk and this fork are licensed under the [GNU General Public License v3.0](LICENSE). Copyright notices, Git history, attribution and corresponding source code must remain available when the software is redistributed.

The concise origin and modification notice is available in [NOTICE](NOTICE).
