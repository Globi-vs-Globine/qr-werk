# Scannen

## Scannen mit der Kamera

Der Einzel-Scan eignet sich, wenn du einen Code erfassen und das Ergebnis sofort prüfen möchtest. Nach erfolgreicher Erkennung wird der Scanner geschlossen und die Ergebnisansicht geöffnet.

Für eine zuverlässige Erkennung:

- Halte den gesamten Code im Bild.
- Vermeide Bewegungsunschärfe und starke Spiegelungen.
- Vergrößere den Abstand bei sehr großen Codes.
- Gehe näher heran, wenn ein Code im Bild zu klein ist.
- Verwende bei Bedarf die Taschenlampe.
- Nutze bei kleinen oder weiter entfernten Codes die Umschaltung zwischen 1× und 2× Zoom.
- Falls ein beschädigter Code nicht erkannt wird, kannst du den Wert über das Tastatursymbol manuell eingeben.

## Batch scannen

Mit **Batch scannen** kannst du mehrere Codes nacheinander erfassen, ohne nach jedem Treffer zur Übersicht zurückzukehren.

1. Öffne die Scan-Übersicht.
2. Wähle **Batch scannen**.
3. Scanne die gewünschten Codes nacheinander.
4. Beende den Vorgang mit **Schließen**.

Bereits während des Batch-Vorgangs werden die erkannten Codes gespeichert. Die zugehörigen Optionen findest du unter **Einstellungen → QR-Code- und Scan-Einstellungen → Scan-Einstellungen**.

### Doppelte Codes

Unter **Doppelte Codes** stehen drei Möglichkeiten zur Auswahl:

- **Zulassen:** Jeder Scan wird gespeichert. Das ist sinnvoll, wenn derselbe Code bewusst mehrfach erfasst werden soll.
- **Im selben Scanlauf sperren:** Ein Code wird innerhalb des laufenden Batch-Scans nur einmal gespeichert. Derselbe Wert aus einem früheren Scanlauf darf erneut gespeichert werden. Diese Einstellung eignet sich für die meisten Arbeiten.
- **Auch frühere Protokolleinträge sperren:** Ein Wert wird nicht erneut gespeichert, wenn er bereits im Protokoll vorhanden ist. Das eignet sich für Bestände, in denen jeder Code nur einmal vorkommen darf.

Erkannte Duplikate werden beim vorhandenen Protokolleintrag vermerkt. In dessen Detailansicht findest du Anzahl, Datum und Uhrzeit der weiteren Erkennungen.

### Pause zwischen Scans

Unter **Pause zwischen Scans** stellst du 0,5 bis 3 Sekunden ein. Standardmässig wartet QRWerk eine Sekunde, bevor der nächste Code angenommen wird. Dadurch wird derselbe Code nicht allein deshalb mehrfach erkannt, weil die Kamera noch darauf gerichtet ist. Eine längere Pause reduziert unbeabsichtigte Wiederholungen; eine kürzere Pause beschleunigt grosse Scanläufe.

### Autofokus

Mit **Autofokus** lässt du die Kamera während des Scannens automatisch scharfstellen. Für den normalen Einsatz sollte diese Option eingeschaltet bleiben. Schalte sie nur testweise aus, wenn die Kamera bei gleichbleibendem Abstand ständig neu fokussiert und dadurch unruhig wird.

Die gespeicherten Batch-Einträge landen zunächst unter **Ohne Gruppe** und können im Protokoll gemeinsam einer Gruppe zugewiesen werden.

## Bild importieren

Der Bildimport unterstützt einzelne und mehrere Bilder. Ein Bild kann ebenfalls mehrere erkennbare Codes enthalten.

Nach der Analyse zeigt QRWerk alle gefundenen Werte an. Markiere nur die Codes, die gespeichert werden sollen, oder wähle **Alle speichern**. **Abbrechen** verwirft die noch nicht gespeicherte Auswahl.

## Unterstützte Formate

QRWerk verarbeitet unter anderem:

- QR Code
- Aztec
- Codabar
- Code 39, Code 93 und Code 128
- Data Matrix
- EAN-8 und EAN-13
- ITF
- PDF417
- UPC-A und UPC-E

Welche Formate in einem konkreten Bild erkannt werden, hängt auch von Auflösung, Kontrast, Schärfe und Druckqualität ab.
