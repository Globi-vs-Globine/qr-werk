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

Bereits während des Batch-Vorgangs werden die erkannten Codes gespeichert. Die zugehörigen Optionen findest du unter **Einstellungen → QR-Codes & Scannen → Scan-Einstellungen**.

### Doppelte Codes

Unter **Doppelte Codes** stehen drei Möglichkeiten zur Auswahl:

- **Zulassen:** Jeder Scan wird gespeichert. Das ist sinnvoll, wenn derselbe Code bewusst mehrfach erfasst werden soll.
- **Im selben Scanlauf sperren:** Ein Code wird innerhalb des laufenden Batch-Scans nur einmal gespeichert. Derselbe Wert aus einem früheren Scanlauf darf erneut gespeichert werden. Diese Einstellung eignet sich für die meisten Arbeiten.
- **Auch frühere Protokolleinträge sperren:** Ein Wert wird nicht erneut gespeichert, wenn er bereits im Protokoll vorhanden ist. Das eignet sich für Bestände, in denen jeder Code nur einmal vorkommen darf.

Erkannte Duplikate werden beim vorhandenen Protokolleintrag vermerkt. In dessen Detailansicht findest du Anzahl, Datum und Uhrzeit der weiteren Erkennungen.

### Pause zwischen Scans

Unter **Pause zwischen Scans** stellst du 0,5 bis 3 Sekunden ein. Standardmässig wartet QR Werk eine Sekunde, bevor der nächste Code angenommen wird. Dadurch wird derselbe Code nicht allein deshalb mehrfach erkannt, weil die Kamera noch darauf gerichtet ist. Eine längere Pause reduziert unbeabsichtigte Wiederholungen; eine kürzere Pause beschleunigt grosse Scanläufe.

### Autofokus

Mit **Autofokus** lässt du die Kamera während des Scannens automatisch scharfstellen. Für den normalen Einsatz sollte diese Option eingeschaltet bleiben. Schalte sie nur testweise aus, wenn die Kamera bei gleichbleibendem Abstand ständig neu fokussiert und dadurch unruhig wird.

### Scan-Optionen und Scanbereich

Im geöffneten Kamerascanner findest du rechts unten die **Scan-Optionen**. Dort kannst du den **Scanbereich**, den **Scanfilter** und den **Scan-Ton** unmittelbar während der Arbeit anpassen. Die ausführliche Auswahl für Vibration, Tonart und Lautstärke befindet sich unter **Einstellungen → Scan-Rückmeldung**.

Für den Scanbereich stehen drei Darstellungen zur Verfügung:

- **Standard:** ein quadratischer Bereich für QR-Codes und die meisten alltäglichen Scans
- **Breit:** ein flacher, breiter Bereich für längliche Strichcodes
- **Ganzes Bild:** ein grosser Bereich, wenn das Gerät auf einem Stativ steht oder ein Code nicht genau positioniert werden kann

Der Rahmen hilft bei der gezielten Auswahl. Erkennt QR Werk im Kamerabild genau einen eindeutigen Code, darf dieser auch teilweise oder vollständig ausserhalb des Rahmens liegen. Sind mehrere Codes sichtbar, werden bevorzugt die Codes innerhalb des gewählten Bereichs verwendet. So kann ein einzelner schwer positionierbarer Code trotzdem erfasst werden, ohne bei Verpackungen mit vielen Codes wahllos den falschen auszuwählen.

### Scanfilter

Den Scanfilter findest du unter **Einstellungen → QR-Codes & Scannen → Scan-Einstellungen → Scanfilter**. Während der Kamerascanner geöffnet ist, erreichst du dieselben Regeln direkt über das Filtersymbol. Ein farbiges Filtersymbol zeigt an, dass der Filter aktiv ist.

Der Scanfilter legt fest, **wie ein erlaubter Code aufgebaut sein muss**. Er sucht keinen bestimmten Gegenstand und vergleicht nicht mit einer Soll-Liste. Dafür ist später der eigenständige Kontrollmodus vorgesehen.

Du kannst folgende Bedingungen einzeln oder gemeinsam verwenden. Nicht benötigte Felder bleiben leer:

- **Code beginnt mit (Präfix):** Trage den vorgeschriebenen Anfang ein. Bei `CF` werden beispielsweise `CF12345` und `CF-MONITOR-01` akzeptiert, `PC-CF123` jedoch nicht.
- **Code endet mit (Suffix):** Trage das vorgeschriebene Ende ein. Bei `99` wird beispielsweise `GERAET-99` akzeptiert, `99-GERAET` jedoch nicht.
- **Code muss genau … Zeichen haben:** Trage ausschliesslich eine Zahl ein, beispielsweise `20`. Gemeint ist die gesamte Länge des gelesenen Inhalts – nicht die gesuchte Artikel- oder Gerätenummer. Buchstaben, Ziffern, Leerzeichen und Sonderzeichen zählen jeweils als ein Zeichen.

Alle ausgefüllten Bedingungen müssen gleichzeitig passen. Der Filter unterscheidet Gross- und Kleinschreibung. Beispiel: Mit Präfix `CF`, Suffix `CH` und Zeichenanzahl `20` akzeptiert QR Werk nur Inhalte, die mit `CF` beginnen, mit `CH` enden und insgesamt genau 20 Zeichen besitzen. Nicht passende Codes werden kurz gemeldet, aber weder geöffnet noch gespeichert.

Der Filter gilt für normalen Kamerascan, Batch-Scan, Bildimport und manuelle Eingabe. Auf der Einstellungsseite kannst du unter **Filter vorab testen** einen vollständigen Beispielcode eingeben. QR Werk zeigt sofort an, ob dieser mit den eingestellten Regeln akzeptiert oder abgewiesen würde. Dieser Test speichert und scannt nichts. Schalte den Filter nach einem Arbeitsauftrag wieder aus, wenn anschliessend andere Codearten erfasst werden sollen.

Wichtig: Wenn du beispielsweise exakt den Code `3200143723` suchst und beim Fund eine besondere Meldung erwartest, ist **Genaue Zeichenanzahl** nicht das richtige Feld. Dort würdest du lediglich `10` eintragen und damit jeden zehnstelligen Code erlauben. Das gezielte Suchen eines Codes oder das Prüfen einer vollständigen Soll-Liste gehört zum separaten Kontrollmodus.

Die gespeicherten Batch-Einträge landen zunächst unter **Ohne Gruppe** und können im Protokoll gemeinsam einer Gruppe zugewiesen werden.

## Bild importieren

Der Bildimport unterstützt einzelne und mehrere Bilder. Ein Bild kann ebenfalls mehrere erkennbare Codes enthalten.

Nach der Analyse zeigt QR Werk alle gefundenen Werte an. Markiere nur die Codes, die gespeichert werden sollen, oder wähle **Alle speichern**. **Abbrechen** verwirft die noch nicht gespeicherte Auswahl.

## Unterstützte Formate

QR Werk verarbeitet unter anderem:

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
