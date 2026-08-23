# QR Werk 0.9.0: TestFlight readiness

Target for the first internal beta:

- App version: `0.9.0`
- Build: `1`
- Bundle ID: `ch.qrwerk.app`
- iCloud container: `iCloud.ch.qrwerk.app`
- Primary language: German
- Primary category: Utilities

## Before archiving

- [ ] Create the QR Werk app record in App Store Connect before uploading the first build.
- [ ] Confirm that the app record uses `ch.qrwerk.app` and version `0.9.0`.
- [ ] Open CloudKit Console, select `iCloud.ch.qrwerk.app`, review the development schema and deploy its schema changes to Production.
- [ ] Confirm the production schema contains the private-database record type `QRWerkSnapshot` and its required fields/indexes.
- [ ] Confirm iCloud and CloudKit remain enabled for the Release configuration and distribution provisioning profile.
- [ ] Build on a clean checkout, run the production web build, copy it to iOS and install native dependencies.
- [ ] In Xcode, select **Any iOS Device (arm64)**, then choose **Product → Archive**.
- [ ] In Organizer, run **Validate App** before **Distribute App → App Store Connect → Upload**.
- [ ] Check warnings concerning signing, entitlements, privacy manifests, icons and supported orientations.

CloudKit schema deployment copies record types, fields and indexes, not development records. Production data is separate from development test data.

## App Store Connect app record

- Name: `QR Werk`
- Platform: iOS
- Primary language: German
- Bundle ID: `ch.qrwerk.app`
- Suggested SKU: `QRWERK-IOS-001` (internal and not shown to customers)
- Category: Utilities
- Privacy URL: `https://github.com/Globi-vs-Globine/qr-werk/blob/main/PRIVACY.md`
- Support URL: `https://github.com/Globi-vs-Globine/qr-werk`

## Internal beta test focus

- Fresh installation and update from a previous local build.
- Camera, batch scanning, image import and manual entry.
- Prefix, suffix and exact character-length filters.
- Groups, bookmarks, export, local backup and restore.
- iCloud sync between iPhone and iPad, including nearly simultaneous edits.
- Local deletion compared with deletion from iCloud on every connected device.
- Offline changes followed by reconnection.
- Denied camera, photo and contact permissions.
- German, English, French and Italian.
- Light, dark and black appearance, Larger Text and VoiceOver.

## Build numbering

Keep version `0.9.0` during the first beta round and increase only the build number for every upload: `1`, `2`, `3`, and so on. Reserve version `1.0.0` for the first public App Store release.
