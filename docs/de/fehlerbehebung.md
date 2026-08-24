# Häufige Fragen und Fehlerbehebung

## Die Kamera bleibt schwarz

- Prüfe unter **iOS-Einstellungen → Datenschutz & Sicherheit → Kamera**, ob QR Werk Zugriff hat.
- Beende QR Werk vollständig und öffne die App erneut.
- Prüfe, ob eine andere App die Kamera verwendet.
- Installiere den aktuellen Entwicklungsstand erneut über Xcode.

Bei einer iPhone-Bildschirmübertragung auf den Mac kann das Kamerabild auf dem Mac absichtlich nicht sichtbar sein, obwohl die Kamera auf dem iPhone funktioniert.

## Ein Code im Foto wird nicht erkannt

- Schneide das Bild so zu, dass der Code größer sichtbar ist.
- Verwende ein schärferes Originalbild.
- Achte auf vollständige Ränder und ausreichenden Kontrast.
- Probiere das unveränderte Foto statt eines stark komprimierten Screenshots.
- Nicht jedes strichcodeähnliche Muster ist ein gültiger oder unterstützter Barcode.

## Es werden mehrere Codes gefunden

QR Werk zeigt die erkannten Werte als Auswahl. Markiere die gewünschten Ergebnisse oder wähle **Alle speichern**. **Abbrechen** verwirft die noch nicht gespeicherten Ergebnisse.

## Wo sind meine Batch-Scans?

Neue Batch-Scans erscheinen zunächst unter **Protokoll → Ohne Gruppe**. Tippe beim gewünschten Eintrag auf die drei Punkte und wähle **In Gruppe verschieben**. Gruppen verwaltest du über **Gruppen** in der unteren Aktionsleiste.

## Warum fragt Batch-Scan nicht nach einer Gruppe?

Der Scanner startet bewusst ohne vorgeschaltete Gruppenabfrage. Dadurch kann sofort gearbeitet werden. Die Zuordnung erfolgt anschliessend über das Drei-Punkte-Menü des Eintrags.

## Ein gelöschter Eintrag fehlt

Öffne im Protokoll das Register **Papierkorb**. Dort kannst du den Eintrag wiederherstellen. Erst **Endgültig löschen** oder **Papierkorb leeren** entfernt ihn ohne Wiederherstellungsmöglichkeit. Bei aktiver iCloud-Synchronisierung wird auch der Papierkorb zwischen deinen Geräten abgeglichen.

## Was bedeuten gelbe Warnungen in Xcode?

Gelbe Symbole sind Warnungen, häufig aus eingebundenen Bibliotheken. Ein rotes Symbol kennzeichnet einen Fehler. Wenn Xcode **Build Succeeded** anzeigt, konnte die App gebaut werden. Vor einer Veröffentlichung sollten Warnungen trotzdem geprüft werden.

## Das alte Symbol oder Startbild erscheint noch

iOS speichert App-Symbole und Startbilder zwischen. Lösche die App vom Testgerät, baue sie erneut in Xcode und installiere sie anschließend neu.
