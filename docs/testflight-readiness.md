# QR Werk 0.9.0: TestFlight readiness

Target for the first internal beta:

- App version: `0.9.0`
- Build: `1`
- Bundle ID: `ch.qrwerk.app`
- iCloud container: `iCloud.ch.qrwerk.app`
- Primary language: German
- Primary category: Utilities

## Before archiving

- [x] Create the QR Werk app record in App Store Connect before uploading the first build (Apple ID `6804925032`).
- [x] Confirm that the app record uses `ch.qrwerk.app`; the first TestFlight build uses version `0.9.0` and build `1`.
- [x] Open CloudKit Console, select `iCloud.ch.qrwerk.app`, review the development schema and deploy its schema changes to Production.
- [x] Confirm the production schema contains the private-database record type `QRWerkSnapshot` and its required fields/indexes.
- [x] Confirm iCloud and CloudKit remain enabled for the Release configuration and distribution provisioning profile.
- [x] Build on a clean checkout, run the production web build, copy it to iOS and install native dependencies.
- [x] Create the signed Release archive for a generic iOS device.
- [x] Export and upload the signed archive to App Store Connect; Apple accepted and verified build `0.9.0 (1)`.
- [x] Check the processed build for warnings concerning signing, entitlements, privacy manifests, icons and supported orientations. No blocking upload warning is shown.

## TestFlight status

- [x] Build `0.9.0 (1)` is processed and **Ready to Test**.
- [x] Internal group `Interner Test` is created with automatic distribution enabled.
- [x] Build `0.9.0 (1)` is assigned to the internal group.
- [x] German test instructions are saved for the build.
- [ ] Add the desired internal App Store Connect users as testers.

CloudKit schema deployment copies record types, fields and indexes, not development records. Production data is separate from development test data.

## App Store Connect app record

- Name: `QR Werk`
- Platform: iOS
- Primary language: German
- Bundle ID: `ch.qrwerk.app`
- Apple ID: `6804925032`
- SKU: `QRWERK-IOS-001` (internal and not shown to customers)
- Category: Utilities
- Privacy URL: `https://github.com/Globi-vs-Globine/qr-werk/blob/main/PRIVACY.md`
- Support URL: `https://github.com/Globi-vs-Globine/qr-werk`

## Internal beta test focus

- Fresh installation and update from a previous local build.
- Camera, batch scanning, image import and manual entry.
- Prefix, suffix and exact character-length filters.
- Groups, bookmarks, direct export, local backup and restore.
- Trash, restoration, permanent deletion and emptying trash.
- Scan areas, scan sounds, vibration and relative sound volume.
- iCloud sync between iPhone and iPad, including nearly simultaneous edits.
- Deletion, synchronized trash and restoration on every connected device.
- Offline changes followed by reconnection.
- Denied camera, photo and contact permissions.
- German, English, French and Italian.
- Light, dark and black appearance, Larger Text and VoiceOver.

## Build numbering

Keep version `0.9.0` during the first beta round and increase only the build number for every upload: `1`, `2`, `3`, and so on. Reserve version `1.0.0` for the first public App Store release.
