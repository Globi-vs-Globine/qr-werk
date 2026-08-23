# QR Werk quality audit

Last reviewed: 2026-08-23

This document records the technical checks performed before the first internal TestFlight build. It complements the hands-on device checklist and is not a substitute for testing on real iPhones and iPads.

## Checks completed

- Angular production build succeeds.
- The iOS workspace builds successfully for the iOS Simulator without code signing.
- TypeScript type checking succeeds.
- All German, English, French and Italian translation files contain the same set of keys and valid JSON.
- The iOS app, privacy manifest, entitlements, project file and localized permission descriptions are valid property lists.
- Automated tests cover scan-filter matching, the core iCloud item-merge behaviour and empty-group creation/deletion metadata.
- Camera, Contacts and photo-library permission descriptions explain the user action that triggers access.
- No analytics, advertising, tracking or third-party scanning backend is configured. Explicit actions such as opening a scanned URL, starting a web search, opening Open Food Facts or sharing content can transfer the selected content to that external service.
- Interactive settings rows use full-row button behaviour, and the smallest tab label was raised to 11 pt.
- Upstream App Store and Google Play links were removed from this fork.

## Remaining work before external testing or App Store review

1. Deploy the CloudKit development schema to production before uploading a TestFlight build.
2. Validate an Archive build in Xcode and review App Store Connect privacy answers against `PRIVACY.md`.
3. Test first launch, denied permissions, camera scanning, batch scanning, image import, exports and iCloud on real iPhone and iPad hardware.
4. Test nearly simultaneous changes on two devices. QR Werk merges individual records by their modification time, but CloudKit currently stores a shared snapshot rather than a server-side record for every scan.
5. The detailed in-app guide chapters are currently German. English, French and Italian display translated navigation and a clear language notice, but the full chapter content still needs professional translation.
6. The legacy Cordova dependencies build successfully but produce deprecation warnings in current Xcode. Replace them gradually instead of changing them immediately before the first internal test.
7. Configure a maintained linting setup. The existing `npm run lint` command has no Angular lint target.

## Internal TestFlight recommendation

The current scope is suitable for a small internal TestFlight round after the CloudKit production deployment and successful Archive validation. Large new features should wait until the existing scan, history and synchronization workflows have completed that round without data loss.
