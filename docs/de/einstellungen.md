# Einstellungen

## Über QR Werk

Hier findest du Versionsangaben, unterstützte Barcode-Typen, Hinweise zur Entwicklung, den Quellcode, die Datenschutzinformationen und die ursprüngliche Projektzuordnung.

## Anleitung

Die integrierte Anleitung funktioniert offline. Sie verwendet dieselben Kapitel wie die Dokumentation im GitHub-Repository.

## QR-Code- und Scan-Einstellungen

Hier legst du fest, wie QR-Codes und erkannte Inhalte dargestellt werden. Im Abschnitt **Scan-Einstellungen** bestimmst du ausserdem, wie QR Werk mit doppelten Codes umgeht, wie lange die Pause zwischen zwei Erkennungen dauert und ob der Autofokus verwendet wird.

- **Doppelte Codes:** zulassen, nur im laufenden Scan sperren oder mit dem gesamten Protokoll vergleichen
- **Pause zwischen Scans:** 0,5 bis 3 Sekunden; empfohlen und voreingestellt ist eine Sekunde
- **Autofokus:** für die automatische Scharfstellung der Kamera; normalerweise eingeschaltet lassen
- **Scanfilter:** Erlaubte Codes anhand ihres Anfangs, Endes und ihrer gesamten Länge annehmen oder abweisen. Das Feld für die Zeichenanzahl enthält nur eine Zahl wie `20`, nicht den gesuchten Code.

Eine ausführliche Erklärung mit Eingabebeispielen, Scanbereichen und der Abgrenzung zum geplanten Kontrollmodus findest du im Kapitel **Scannen**.

## Datenverwaltung

Hier steuerst du die automatische Protokollierung, iCloud-Synchronisierung sowie Sicherungs-, Wiederherstellungs- und Exportfunktionen. Das Protokoll besitzt keine künstliche Begrenzung. Prüfe vor einem Zurücksetzen der App, ob wichtige Daten gesichert wurden.

### iCloud-Synchronisierung

Unter **Einstellungen → Datenverwaltung** kannst du die iCloud-Synchronisierung freiwillig einschalten. Beim ersten Einschalten führt QR Werk die Einträge des Geräts mit vorhandenen Einträgen deiner privaten iCloud zusammen. Danach erfolgt der Abgleich beim Öffnen und Verlassen der App sowie automatisch wenige Sekunden nach Änderungen. Mehrere rasche Scans werden gesammelt übertragen. Mit **Jetzt synchronisieren** kannst du den Abgleich zusätzlich sofort starten.

Synchronisiert werden Protokolle, Gruppen, Lesezeichen, Mehrfacherkennungen sowie die in QR Werk gewählte Gerätebezeichnung. Beim Aktivieren kannst du beispielsweise „iPhone Lager“ oder „iPad Büro“ eintragen. Ohne eigene Eingabe verwendet QR Werk nur „iPhone“ beziehungsweise „iPad“. Der persönliche Apple-Gerätename wird nicht ausgelesen; die übrigen App-Einstellungen bleiben lokal. Für den Abgleich müssen auf allen Geräten derselbe iCloud-Account und eine Internetverbindung aktiv sein.

Einzelne Einträge, die bei aktiver Synchronisierung gelöscht werden, verschwinden auch auf den anderen verbundenen Geräten. Bei **Alle Einträge löschen** kannst du wählen: **Auf allen Geräten löschen** überträgt die Löschung in die private iCloud. **Nur auf diesem Gerät löschen** schaltet auf diesem Gerät gleichzeitig die iCloud-Synchronisierung aus, damit die Einträge nicht beim nächsten Abgleich zurückkehren.

## Sprache

QR Werk kann auf Deutsch, Englisch, Französisch und Italienisch verwendet werden. Mit **Systemeinstellung** übernimmt die App automatisch eine dieser Sprachen; bei einer anderen Gerätesprache wird Englisch verwendet. Tippe auf die gesamte gewünschte Zeile – du musst nicht genau den Haken am rechten Rand treffen.

## Darstellung und Farben

Du kannst zwischen der hellen, dunklen und schwarzen Darstellung wählen oder die Systemeinstellung übernehmen. Zusätzlich lässt sich die Akzentfarbe der Bedienoberfläche anpassen. Zur Auswahl stehen Petrol, Blau, Violett, Grün, Orange und Pink.

## Ausrichtung

Hier bestimmst du, ob QR Werk die Systemeinstellung verwendet oder im Hoch- beziehungsweise Querformat bleibt.

## Vibration und haptische Rückmeldung

Du kannst haptische Bedienrückmeldungen und die Rückmeldung nach einem erfolgreichen Scan gemeinsam oder getrennt aktivieren. Mit **Aus** werden beide Rückmeldungen deaktiviert. Nicht jedes Gerät bietet dieselben Vibrationsmöglichkeiten.

## App-Startseite

Die Standardkonfiguration öffnet beim App-Start direkt den Scanner. Wenn du innerhalb der geöffneten App wieder auf **Scannen** wechselst, erscheint zuerst die Scan-Übersicht.

## App zurücksetzen

Beim Zurücksetzen kannst du – abhängig von der angebotenen Auswahl – Daten, Einstellungen oder beides entfernen. Diese Aktion sollte erst nach einer Sicherung ausgeführt werden.
