# Datenschutz und Open Source

## Lokale Verarbeitung

QR Werk verarbeitet Kamerabilder und importierte Fotos mit Apples AVFoundation- und Vision-Technik vollständig auf dem iPhone oder iPad. Bilder und Erkennungsergebnisse werden dafür weder an Apple noch an Google oder einen anderen Erkennungsdienst geschickt. Das Scannen funktioniert auch ohne Internetverbindung. Scan-Protokoll, Gruppen, Lesezeichen und Einstellungen bleiben lokal auf dem Gerät. Es gibt kein QR-Werk-Benutzerkonto und keine Werbung. Die App enthält keinen eigenen Analyse-, Tracking- oder Absturzberichtsdienst.

Die optionale iCloud-Synchronisierung ist standardmässig ausgeschaltet. Nach dem Aktivieren werden Protokolle, Gruppen, Lesezeichen, Mehrfacherkennungen, Papierkorb und die selbst gewählte Gerätebezeichnung in deiner privaten iCloud gespeichert. Persönliche Apple-Gerätenamen und App-Einstellungen werden nicht synchronisiert. Beim ersten Abgleich werden lokale und bereits vorhandene iCloud-Einträge zusammengeführt.

## Berechtigungen

QR Werk kann folgende iOS-Berechtigungen anfragen:

- **Kamera:** zum Scannen von QR-Codes und Barcodes
- **Fotos:** zum Lesen ausgewählter Bilder und zum Speichern erzeugter Codes
- **Kontakte:** nur wenn du ausdrücklich einen erkannten Kontakt übernehmen möchtest

Eine Berechtigung wird für die jeweilige Funktion benötigt und kann in den iOS-Einstellungen wieder entzogen werden.

## Internetverbindungen

Eine Internetverbindung entsteht nur, wenn du selbst eine externe Aktion auslöst oder die freiwillige iCloud-Synchronisierung aktivierst. Das gilt beispielsweise beim Öffnen einer Internetadresse, beim Starten einer Suche, beim Aufrufen von GitHub oder beim Teilen über einen Onlinedienst. Bei einer Websuche wird der ausgewählte Suchtext an den gewählten Suchanbieter übertragen. Bei einer Produktsuche wird die Artikelnummer an Open Food Facts übertragen. QR Werk zeigt vor der Übergabe eines Code-Inhalts an einen solchen Dienst eine Bestätigung. Für die Verarbeitung durch die externe App, Website oder den Dienst gelten deren eigene Datenschutzbestimmungen. Dabei können gewöhnliche technische Verbindungsdaten wie die IP-Adresse sichtbar sein.

Apple kann abhängig von deinen Datenschutz-Einstellungen in iOS oder TestFlight technische Absturz- und Diagnosedaten erhalten. Das ist eine Funktion der Apple-Plattform und kein in QR Werk eingebautes Tracking.

## Exporte und Zwischenablage

Exportierte Dateien und kopierte Codes verlassen den geschützten App-Bereich. Achte bei vertraulichen Inventar-, Kontakt- oder Zugangsdaten darauf, wohin du sie speicherst oder weitergibst.

## Open Source und Lizenz

QR Werk basiert auf dem ursprünglichen Projekt **Simple QR** von Tom Fong. Der Fork wird im Repository `Globi-vs-Globine/qr-werk` weiterentwickelt.

Das Projekt bleibt unter der **GNU General Public License Version 3 (GPL-3.0)**. Lizenz, Urheberhinweise, Git-Historie, Zuordnung zum ursprünglichen Projekt und der entsprechende Quellcode müssen bei einer Weitergabe erhalten bleiben.

Die verbindliche Datenschutzbeschreibung befindet sich in `PRIVACY.md`, die vollständigen Lizenzbedingungen in `LICENSE`.
