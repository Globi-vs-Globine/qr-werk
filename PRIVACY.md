# Privacy / Datenschutz

Last updated / Zuletzt aktualisiert: 23 August 2026

## English

### Local processing

QR Werk processes camera images, imported photos, QR codes and barcodes entirely on the device using Apple's AVFoundation and Vision frameworks. Images and recognition results are not uploaded to Apple or another recognition service. Recognition also works without an internet connection. Scan history, groups, bookmarks, deleted entries in the trash and app settings are stored locally.

QR Werk does **not** transmit scanned, imported, created or manually entered code contents, the scan history, groups, bookmarks or app settings to the fork maintainer. The app contains no analytics, advertising, user-tracking or crash-reporting service operated by the fork maintainer or a third party.

### Optional iCloud synchronization

iCloud synchronization is disabled by default. If the user enables it, QR Werk stores the scan history, groups, bookmarks, duplicate-detection history, deleted entries in the trash and the device label selected inside QR Werk in the user's private Apple CloudKit database. QR Werk does not read Apple's personal device name; the default label is only “iPhone” or “iPad”. App settings are not synchronized. The data is used only to keep the user's Apple devices consistent; it is not sent to or accessible through a server operated by the QR Werk maintainer. Apple's iCloud terms and privacy policy apply.

### Permissions

QR Werk may request access to:

- **Camera:** to scan QR codes and barcodes.
- **Photos:** when the user selects images for scanning or saves a generated QR code.
- **Contacts:** only when the user explicitly chooses to add a recognized contact.

These permissions can be withdrawn in the iOS settings.

### User-initiated external actions

Data leaves the local app only when the user deliberately starts an external action or enables a corresponding option. Examples include:

- sharing content through the iOS share sheet;
- opening a scanned web address;
- starting a web search, which sends the selected search text to the chosen search provider;
- looking up a product, which sends the selected product code to Open Food Facts;
- opening GitHub pages, documentation or another external service.

Before QR Werk passes code content to a website, search provider or product service, it displays a confirmation. The selected external app, website or service then processes the data under its own privacy policy. Ordinary technical connection data, such as the IP address, may also be visible to that external service. These actions do not send scan history or code contents to the QR Werk maintainer unless the user deliberately chooses the maintainer as the recipient.

### Apple platform diagnostics

Apple may receive crash or diagnostic information according to the user's iOS, TestFlight and App Store privacy settings. This is controlled by Apple and the user, not by an analytics or crash-reporting service built into QR Werk.

### Exports

Exported files and copied content leave the protected app storage when the user saves, pastes or shares them. The user controls the destination and is responsible for handling confidential inventory, contact or access data appropriately.

## Deutsch

### Lokale Verarbeitung

QR Werk verarbeitet Kamerabilder, importierte Fotos, QR-Codes und Barcodes vollständig auf dem Gerät mit Apples Frameworks AVFoundation und Vision. Bilder und Erkennungsergebnisse werden weder zu Apple noch zu einem anderen Erkennungsdienst hochgeladen. Die Erkennung funktioniert auch ohne Internetverbindung. Scan-Protokoll, Gruppen, Lesezeichen, gelöschte Einträge im Papierkorb und App-Einstellungen werden lokal gespeichert.

QR Werk überträgt **keine** gescannten, importierten, erstellten oder manuell eingegebenen Code-Inhalte, kein Scan-Protokoll, keine Gruppen, keine Lesezeichen und keine App-Einstellungen an den Betreiber des Forks. Die App enthält keinen Analyse-, Werbe-, Benutzer-Tracking- oder Absturzberichtsdienst des Fork-Betreibers oder eines Drittanbieters.

### Optionale iCloud-Synchronisierung

Die iCloud-Synchronisierung ist standardmässig ausgeschaltet. Aktiviert der Benutzer sie, speichert QR Werk das Scan-Protokoll, Gruppen, Lesezeichen, den Verlauf von Mehrfacherkennungen, gelöschte Einträge im Papierkorb sowie die innerhalb von QR Werk gewählte Gerätebezeichnung in der privaten Apple-CloudKit-Datenbank des Benutzers. QR Werk liest den persönlichen Apple-Gerätenamen nicht aus; als Vorgabe wird lediglich „iPhone“ oder „iPad“ verwendet. App-Einstellungen werden nicht synchronisiert. Die Daten dienen ausschliesslich dem Abgleich zwischen den Apple-Geräten des Benutzers; sie werden nicht an einen vom Betreiber von QR Werk betriebenen Server gesendet und sind dort nicht zugänglich. Es gelten Apples iCloud-Bedingungen und Datenschutzbestimmungen.

### Berechtigungen

QR Werk kann Zugriff auf folgende Bereiche anfragen:

- **Kamera:** zum Scannen von QR-Codes und Barcodes.
- **Fotos:** wenn der Benutzer Bilder zum Scannen auswählt oder einen erstellten QR-Code speichert.
- **Kontakte:** nur wenn der Benutzer ausdrücklich einen erkannten Kontakt übernehmen möchte.

Diese Berechtigungen können in den iOS-Einstellungen wieder entzogen werden.

### Vom Benutzer ausgelöste externe Aktionen

Daten verlassen die lokale App nur, wenn der Benutzer bewusst eine externe Aktion startet oder eine entsprechende Option aktiviert. Dazu gehören beispielsweise:

- Inhalte über das iOS-Teilen-Menü weitergeben;
- eine gescannte Internetadresse öffnen;
- eine Websuche starten, bei der der ausgewählte Suchtext an den gewählten Suchanbieter übermittelt wird;
- ein Produkt nachschlagen, wobei die ausgewählte Artikelnummer an Open Food Facts übermittelt wird;
- GitHub-Seiten, die Dokumentation oder einen anderen externen Dienst öffnen.

Bevor QR Werk einen Code-Inhalt an eine Website, Suchmaschine oder einen Produktdienst übergibt, erscheint eine Bestätigung. Die gewählte externe App, Website oder der gewählte Dienst verarbeitet die Daten anschließend nach den eigenen Datenschutzbestimmungen. Dabei können auch gewöhnliche technische Verbindungsdaten wie die IP-Adresse für den externen Dienst sichtbar sein. Diese Aktionen senden weder das Scan-Protokoll noch Code-Inhalte an den Betreiber von QR Werk, außer der Benutzer wählt ihn bewusst als Empfänger aus.

### Diagnosefunktionen der Apple-Plattform

Apple kann abhängig von den Datenschutz-Einstellungen des Benutzers in iOS, TestFlight oder dem App Store Absturz- oder Diagnosedaten erhalten. Dies wird von Apple und dem Benutzer gesteuert und stammt nicht von einem in QR Werk eingebauten Analyse- oder Absturzberichtsdienst.

### Exporte

Exportierte Dateien und kopierte Inhalte verlassen den geschützten App-Speicher, sobald der Benutzer sie speichert, einfügt oder teilt. Der Benutzer bestimmt das Ziel und ist für den angemessenen Umgang mit vertraulichen Inventar-, Kontakt- oder Zugangsdaten verantwortlich.
