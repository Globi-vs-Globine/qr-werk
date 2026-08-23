# QR Werk: iOS quality checklist

This checklist records the current engineering review before the first TestFlight build. It complements, but does not replace, testing on physical devices and App Review.

## Implemented in this review

- Apple system typography is used consistently by Ionic, Angular Material and the app shell.
- Legacy fixed `large` text declarations were removed so the normal component hierarchy can scale consistently.
- The default petrol accent was darkened to maintain readable white text.
- Important icon-only result and history actions have localized accessibility labels.
- Interactive About rows expose button semantics.
- Touch controls reviewed so the primary navigation, settings rows, result actions and scanner controls meet or exceed a 44 × 44 point target.
- iOS project localizations match the languages actually offered by QR Werk: German, English, French and Italian.
- Unused upstream sponsorship assets, Android store metadata, obsolete Protractor scaffolding and unused JavaScript packages were removed.

## Required physical-device pass before TestFlight

Test on at least one iPhone and one iPad:

- Fresh installation and update over the previous build.
- Camera scan, batch scan, manual entry and photo import (single/multiple images).
- Scan-area modes, zoom, flashlight, autofocus, filters and duplicate handling.
- History details, bookmarks, groups, import/export, backup and destructive confirmations.
- iCloud opt-in, initial merge, automatic sync, device naming and local/cloud deletion.
- Camera, photo and contact permission denied, restricted and later re-enabled.
- German, English, French and Italian; light, dark and black appearance; every accent color.
- Portrait and landscape on iPhone/iPad where supported.
- Larger Text at the largest accessibility sizes: no clipped labels, hidden actions or overlapping controls.
- VoiceOver: logical reading order, meaningful names for icon buttons and no focus traps.
- Voice Control: visible actions can be addressed without precise tapping.
- Increase Contrast, Reduce Motion and Reduce Transparency.
- Offline operation; external links are opened only after explicit user action.

## Known follow-up work

- Automated UI tests are not configured yet. The removed Protractor files belonged to an obsolete, non-running test setup.
- Bootstrap and Angular Material are still real dependencies in the current hybrid UI. Removing them requires a deliberate screen-by-screen migration, not file cleanup.
- The Android source tree remains for upstream compatibility. QR Werk's current release target and verified native scanner are iOS/iPadOS.
- App Store privacy answers and accessibility labels must be reviewed again against the exact archived release build.
