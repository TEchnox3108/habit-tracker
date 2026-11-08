# Habit Tracker

Dein persönlicher Gewohnheits-Tracker – eine kleine Web-App, die komplett in deinem Browser läuft.
Keine Anmeldung, kein Server, keine Installation nötig. Deine Daten bleiben auf deinem Gerät.

---

## 1. App öffnen

1. Öffne den Ordner `Dokumente › Claude Projekte › Habit-Tracker_1`.
2. **Doppelklick auf `index.html`** – die App öffnet sich in deinem Browser.
3. Tipp: Speichere die Seite als Lesezeichen (`Strg + D`), dann musst du die Datei nicht jedes Mal suchen.

Beim **ersten Öffnen brauchst du Internet**, weil Icons, Schrift und Diagramme aus dem Internet geladen werden.
Ohne Internet funktioniert die App trotzdem, sieht dann aber etwas schlichter aus.

---

## 2. Die App aufs Handy bringen

### Warum geht das nicht einfach per Datei?
Handys erlauben das Installieren einer Web-App nur, wenn sie über eine **echte Internetadresse
(`https://…`)** geöffnet wird. Deshalb muss die App einmal kostenlos ins Internet hochgeladen werden.
**Deine Daten werden dabei nicht hochgeladen** – nur das Programm. Deine Einträge bleiben immer
im Browser des jeweiligen Geräts.

### Weg A: GitHub Pages (empfohlen – Updates gehen später ganz leicht)
1. Lege ein kostenloses Konto auf [github.com](https://github.com) an.
2. Klicke oben rechts auf **„+“ → „New repository“**, Name z. B. `habit-tracker`, Sichtbarkeit **Public**, dann **„Create repository“**.
   (Public heißt: der Programmcode ist sichtbar – deine persönlichen Daten aber nicht, die sind ja nur in deinem Browser.)
3. Sag Claude: *„Lade die App in mein GitHub-Repository `habit-tracker` hoch.“* – Claude erledigt das Hochladen.
   Beim ersten Mal öffnet sich ein Fenster, in dem du dich bei GitHub anmeldest.
4. Auf GitHub im Repository: **Settings → Pages** → bei „Branch“ **`main`** und **`/ (root)`** wählen → **Save**.
5. Nach 1–2 Minuten ist die App erreichbar unter `https://DEIN-NAME.github.io/habit-tracker/`.

### Weg B: Netlify Drop (ohne Git, per Drag & Drop)
1. Gehe auf [app.netlify.com/drop](https://app.netlify.com/drop) und lege ein kostenloses Konto an.
2. Ziehe den ganzen Ordner `Habit-Tracker_1` in das Feld auf der Seite.
3. Du bekommst eine Adresse wie `https://irgendwas.netlify.app` – fertig.
   Für Updates ziehst du den Ordner später einfach erneut hinein (unter „Deploys“).

### Auf dem Handy installieren
Öffne die Internetadresse auf dem Handy und dann:
- **Android (Chrome):** Menü **⋮ → „App installieren“** (oder „Zum Startbildschirm hinzufügen“).
- **iPhone (Safari):** **Teilen-Symbol** (Quadrat mit Pfeil) **→ „Zum Home-Bildschirm“**.

Danach hast du ein App-Symbol (grüner Haken) und die App startet ohne Browser-Leisten – auch ohne Internet.

### Wichtig: Daten auf mehreren Geräten
Jedes Gerät (und jeder Browser) hat seinen **eigenen** Speicher. Laptop und Handy gleichen sich nicht automatisch ab.
So überträgst du deine Daten:
1. Auf dem alten Gerät: **Einstellungen → Daten exportieren** (es wird eine Datei gespeichert).
2. Die Datei aufs andere Gerät bringen (z. B. per Mail an dich selbst oder per Cloud-Speicher).
3. Auf dem neuen Gerät: **Einstellungen → Backup importieren** und die Datei auswählen.

Auch die Version per Doppelklick und die Internet-Version auf demselben Laptop haben getrennte Daten.

---

## 3. Deine Daten sichern

- Die Daten liegen im Speicher deines Browsers („localStorage“). Wenn du im Browser **„Browserdaten / Websitedaten löschen“**
  wählst, sind sie weg.
- Mach deshalb ab und zu ein Backup: **Einstellungen → Daten & Backup → Daten exportieren**.
  Dort siehst du auch, wann deine letzte Sicherung war.
- **Alles zurücksetzen** löscht alles und startet mit den Beispiel-Kategorien neu (mit Sicherheitsabfrage).

---

## 4. Weisheit des Tages

Im Reiter **Weisheit** erscheint jeden Tag eine andere philosophische Weisheit – mit Erklärung
(„Was bedeutet das?“) und einem **Denkanstoß für heute**.

- **Heute | Archiv | Favoriten:** Oben umschalten. Im Archiv findest du die Weisheiten der vergangenen Tage,
  in den Favoriten alle, bei denen du auf **„Merken“** (Herz) getippt hast.
- **Filter:** In Archiv und Favoriten kannst du nach Epoche (farbige Knöpfe) und nach Philosoph filtern.
- **Meine Gedanken dazu:** Unter der Karte kannst du eine Notiz schreiben. Sie wird pro Tag automatisch gespeichert.
- **Kopieren / Teilen:** kopiert die Weisheit als Text (am Handy öffnet „Teilen“ das normale Teilen-Menü).
- **Vorschau auf „Heute“:** oben auf der Startseite. Abschalten unter **Einstellungen → Weisheit des Tages**.
- Die Weisheit wechselt um Mitternacht und bleibt den ganzen Tag gleich. Erst wenn alle Einträge einmal dran
  waren, geht es von vorn los. Nie kommt zwei Tage hintereinander dieselbe Epoche.
- Favoriten, Notizen und der Verlauf sind im **Backup (Export/Import)** enthalten.
- **„sinngemäß“** heißt: kein wörtliches Zitat, sondern der Gedanke zusammengefasst.
  **„übersetzt“** heißt: Der Denker hat nicht auf Deutsch geschrieben, der Text ist eine Übersetzung.

### Selbst eine Weisheit hinzufügen
Öffne `wisdom.js` mit einem Texteditor (z. B. Editor/Notepad) und füge in der Liste `WEISHEITEN`
(z. B. ganz unten vor der letzten Zeile `];`) einen neuen Block ein. Beispiel:

```js
  {
    id: 'seneca-heute-leben', von: 'seneca', typ: 'zitat',
    text: 'Während man das Leben aufschiebt, eilt es vorüber.',
    sinngemaess: false, quelle: 'Briefe an Lucilius 1,3',
    erklaerung: 'Seneca meint: Wer immer auf später wartet, verpasst das Jetzt. Das Leben passiert heute.',
    denkanstoss: 'Was schiebst du auf „irgendwann“? Tu heute einen ersten Schritt.'
  },
```

Darauf achten:
- **Komma** nach der schließenden geschweiften Klammer `},` nicht vergessen.
- `id` muss einmalig sein (kleine Buchstaben und Bindestriche). Später nicht mehr ändern – sonst gehen Favoriten verloren.
- `von` muss ein Name aus der Liste `PHILOSOPHEN` (weiter oben in derselben Datei) sein. Für einen neuen
  Philosophen dort erst eine Zeile ergänzen, z. B.
  `voltaire: { name: 'Voltaire', lebenszeit: '1694–1778', epoche: 'aufklaerung' },`
- `typ` ist `'zitat'`, `'lebensregel'`, `'gedankenexperiment'` oder `'denkanstoss'`.
- Texte stehen zwischen einfachen Anführungszeichen `'...'`. Für Apostrophe im Text das Zeichen `’` benutzen.
- Danach die App neu laden. Wenn die Seite leer bleibt, hat sich meist ein Komma oder Anführungszeichen versteckt –
  oder du sagst einfach Claude Bescheid.

---

## 5. Kalender (Termine & Projekte)

Der Reiter **Kalender** funktioniert ähnlich wie die Apple-Kalender-App – im Look dieser App.

### Termine per Satz eintragen (Quick Add)
Oben ins Feld einen Satz schreiben → **Enter** → eine Vorschau zeigt, was erkannt wurde
(z. B. „Zahnarzt – Mo, 9. Nov, 14:30–15:30“) → nochmal **Enter** = eingetragen.
Während die Vorschau offen ist, kannst du den Satz weiter verbessern. Mit dem **Stift** öffnest du
stattdessen das Formular, mit **Esc** oder **×** verwirfst du sie.

| Du schreibst | Die App versteht |
|---|---|
| `Zahnarzt morgen 14:30 1h` | morgen, 14:30–15:30 |
| `Mathe-Klausur 12.12. 8:00 bis 9:30` | 12. Dezember, 8:00–9:30 |
| `Training jeden Montag 18 Uhr 90 min #Fitness` | jeden Montag 18:00–19:30, Kalender „Fitness“ |
| `Arbeit Getränkemarkt Samstag 10-16 Uhr` | kommender Samstag, 10–16 Uhr |
| `Geburtstag Oma 11.11. ganztägig` | ganztägig |
| `Skiurlaub 27.12. bis 3.1.` | mehrere Tage |
| `Oma besuchen nächste Woche Freitag` · `in 3 Tagen` · `übermorgen` | Datum in Worten |
| `Physio jeden Dienstag bis 15.12. 8 Uhr` | Serie mit Enddatum |
| `Vokabeln jeden Mo und Mi 17 Uhr` · `dienstags` · `werktags` · `täglich` · `alle 2 Wochen` · `monatlich` | Wiederholungen |
| `Zahnarzt Do 9:30 @Praxis Dr. Klein` | Ort (alles hinter dem @) |
| `Arzt morgen 10 Uhr Erinnerung 1 Tag vorher` · `mit Erinnerung` · `30 min vorher erinnern` | Erinnerung |
| `Projekt Leporello bis 08.12. #Schule` | legt ein **Projekt** mit Deadline an |

Fehlt etwas, nimmt die App sinnvolle Werte: ohne Uhrzeit → ganztägig, ohne Dauer → 1 Stunde,
ohne Datum → heute (ist die Uhrzeit heute schon vorbei → morgen). Ein unbekannter `#Name` legt einen neuen Kalender an.

**Testseite:** Doppelklick auf `tests/parser-tests.html` zeigt rund 100 Beispielsätze (grün = richtig erkannt)
und hat ein Feld zum Ausprobieren. Findest du einen Satz, den die App falsch versteht: Claude Bescheid sagen.

### Ansichten
- Oben umschalten: **Kalender | Anstehend | Projekte**, im Kalender dann **Tag | Woche | Monat | Jahr**.
- **‹ Heute ›** zum Blättern; am Handy auch **nach links/rechts wischen**, am Laptop **Pfeiltasten** (T = heute).
- **Monat:** Tag antippen zeigt seine Termine darunter, nochmal antippen öffnet die Tagesansicht.
- **Tag & Woche:** roter Strich = jetzt. Ganztägige Termine stehen oben. Tipp auf eine freie Stelle = neuer Termin zu dieser Uhrzeit.
- **Verschieben:** Termin ziehen (am Handy: kurz gedrückt halten, dann ziehen). **Länge ändern:** am unteren Rand ziehen.
  Raster: 15 Minuten. Bei Serien fragt die App „Nur dieser Termin“ oder „Alle“.
- **Anstehend:** alles Kommende nach Tagen sortiert, überfällige Projekte ganz oben.

### Termine & Kalender verwalten
- Termin antippen → **Details** mit Bearbeiten, Duplizieren, Löschen und „In Handy-Kalender übernehmen (.ics)“.
- **+** oben = neuer Termin über ein Formular (im Bereich „Projekte“: neues Projekt).
- 🔍 = **Suche** über Titel, Ort, Notizen und Kalender.
- ◫ = **Kalender verwalten**: ein-/ausblenden, Name, Farbe, Icon, Standard-Kalender; dazu Erinnerungen
  und „Alle Termine als .ics exportieren“.

### Projekte
Projekte haben eine **Deadline** („noch 30 Tage“, kurz vorher gelb, überfällig rot), optionale
**Teilschritte** zum Abhaken und einen **Fortschritt** in Prozent (aus den Teilschritten berechnet oder per Regler).
Die Deadline erscheint mit Fähnchen im Kalender.

### Erinnerungen – was geht und was nicht
- Pro Termin kannst du eine Erinnerung wählen (z. B. 15 Min, 1 Std, 1 Tag vorher; bei ganztägigen Terminen bezogen auf 9:00 Uhr).
- Die App erinnert, **solange sie offen ist** (am Laptop auch in einem Hintergrund-Tab): als Benachrichtigung
  (der Browser fragt einmal um Erlaubnis) und als Hinweis oben in der App.
- **Ist die App ganz geschlossen, kann sie nicht erinnern.** Dafür bräuchte man einen eigenen Server mit
  Push-Nachrichten. Die zuverlässige Alternative: Termin öffnen → **„In Handy-Kalender übernehmen (.ics)“**.
  Dann übernimmt die Kalender-App deines Handys den Termin samt Erinnerung und meldet sich pünktlich.
- Am iPhone funktionieren Benachrichtigungen von Web-Apps nur eingeschränkt – dort ist der .ics-Weg am sichersten.

Termine, Projekte und Kalender sind im **Backup (Export/Import)** enthalten.

---

## 6. Wo ändere ich was?

| Was du ändern willst | Wo |
|---|---|
| **Kategorien & Gewohnheiten** (Namen, Farben, Icons, Ziele, Reihenfolge) | Direkt in der App unter **Gewohnheiten** – dafür musst du nichts am Code ändern |
| **Farben, Schriftgrößen, Abstände, Rundungen** | `styles.css` → ganz oben, Abschnitt **„1. DESIGN-EINSTELLUNGEN“** |
| **Farben für den Dunkel-Modus** | `styles.css` → Block `:root[data-theme="dark"]` direkt darunter |
| **Neue Farbe zur Auswahl hinzufügen** | in `styles.css` eine Zeile `--farbe-NAME: #…;` **und** in `config.js` bei `farben` eintragen |
| **Icon-Auswahl** | `config.js` → Liste `icons` (Namen findest du auf [lucide.dev/icons](https://lucide.dev/icons)) |
| **Start-Kategorien** (nur für den allerersten Start) | `config.js` → `startKategorien` |
| **Name der App** | `config.js` → `appName` und `manifest.webmanifest` → `name` |
| **Weisheiten** (hinzufügen, ändern) und **Epochen-Farben** | `wisdom.js` (siehe Abschnitt 4) |
| **Schrift der Zitate** | `styles.css` → `--schrift-zitat` |
| **Texte auf der Seite „Weisheit“** | `wisdom-page.js` |
| **Kalender: Start-Kalender** (nur für den allerersten Start) | `config.js` → `startKalender` – danach direkt in der App unter ◫ |
| **Kalender: welche Sätze Quick Add versteht** | `calendar-parser.js` (Testfälle in `tests/parser-tests.js`) |
| **Kalender: Ansichten** | `calendar-page.js` · **Formulare, Suche, Kalender verwalten:** `calendar-forms.js` |
| **Projekte** | `projects.js` |
| **Erinnerungen** (Auswahl, Ablauf) | `calendar-reminders.js` · **.ics-Export:** `calendar-ics.js` |
| **Farbe des „Jetzt“-Strichs** | `styles.css` → `--jetzt-linie` |
| **Texte auf der Seite „Heute“** | `today.js` |
| **Texte auf der Seite „Statistik“** | `stats.js` |
| **Texte auf der Seite „Gewohnheiten“** | `habits.js` |
| **Texte auf der Seite „Einstellungen“** | `settings.js` |
| **Navigation unten / links** | `index.html` |
| **App-Symbol** | Ordner `icons/` |

### Übersicht aller Dateien
| Datei | Inhalt |
|---|---|
| `index.html` | Grundgerüst der Seite und Navigation |
| `styles.css` | Das komplette Aussehen |
| `config.js` | Grundeinstellungen, Farben, Icons, Start-Kategorien |
| `data.js` | Speichern, Laden, Rechnen (was ist erledigt, was ist fällig) |
| `app.js` | Hilfsbausteine, Hell/Dunkel, Navigation, Handy-App |
| `today.js` | Seite „Heute“ |
| `stats.js` | Seite „Statistik“ |
| `wisdom.js` | Alle Weisheiten, Philosophen und Epochen (nur Inhalte) |
| `wisdom-page.js` | Seite „Weisheit“ |
| `calendar-parser.js` | Kalender: versteht Sätze wie „Zahnarzt morgen 14:30“ |
| `calendar-data.js` | Kalender: Termine, Projekte und Kalender speichern, Serien ausrechnen, Suche |
| `calendar-page.js` | Seite „Kalender“ (Tag, Woche, Monat, Jahr, Anstehend, Drag & Drop) |
| `calendar-forms.js` | Kalender: Detailansicht, Formular, Suche, Kalender verwalten |
| `projects.js` | Kalender: Projekte mit Deadline und Teilschritten |
| `calendar-reminders.js` | Kalender: Erinnerungen |
| `calendar-ics.js` | Kalender: Export als .ics-Datei |
| `tests/` | Testseite für Quick Add (`parser-tests.html`) |
| `habits.js` | Seite „Gewohnheiten“ |
| `settings.js` | Seite „Einstellungen“ |
| `manifest.webmanifest`, `sw.js`, `icons/` | Alles für die Handy-App |
| `CLAUDE.md` | Anleitung für Claude (wie das Projekt aufgebaut ist) |

**Nach Änderungen an der Internet-Version:** In `sw.js` die Zeile `const VERSION = 'v6';` um eins erhöhen
(z. B. `'v7'`) und neu hochladen – sonst zeigt das Handy evtl. noch kurz die alte Version.
Wenn du Claude um Änderungen bittest, erledigt Claude das mit.

---

## 7. So kannst du Claude um Änderungen bitten

Du kannst ganz normal auf Deutsch schreiben. Ein paar Beispiele:

**Design**
- „Mach die Hauptfarbe der App Staubblau statt Salbeigrün.“
- „Die Ecken sollen etwas runder sein.“
- „Mach die Schrift insgesamt ein bisschen größer.“
- „Der Dunkel-Modus ist mir zu dunkel – mach ihn etwas heller.“

**Gewohnheiten & Funktionen**
- „Füge eine neue Farbe ‚Waldgrün‘ zur Auswahl hinzu.“
- „Ich hätte gern eine Erinnerung, wenn ich abends noch nicht alles abgehakt habe.“
- „Bei ‚Stimmung des Tages‘ möchte ich Smileys statt einer Zahl auswählen.“
- „Zeig auf der Startseite oben einen motivierenden Spruch.“
- „Bei Zählern soll man auch in 0,5er-Schritten zählen können.“

**Weisheit**
- „Füge 20 weitere Weisheiten von Marc Aurel und Laozi hinzu.“
- „Nimm Voltaire als neuen Philosophen in die Aufklärung auf.“
- „Die Zitate sollen etwas kleiner sein.“
- „Ich möchte eine Erinnerung, die Notiz zur Tagesweisheit abends auszufüllen.“

**Kalender**
- „Quick Add soll auch ‚nächsten Monat am 3.‘ verstehen.“
- „Zeig auf der Seite ‚Heute‘ auch meine Termine von heute.“
- „Verknüpfe den Kalender mit meinen Gewohnheiten: Training-Termine sollen ‚Training‘ abhaken.“
- „Mach den ‚Jetzt‘-Strich Staubblau statt rot.“

**Statistik**
- „Zeig in der Statistik auch, an welchem Wochentag ich am fleißigsten bin.“
- „Der Kalender soll ein ganzes Jahr zeigen statt sechs Monate.“

**Fehler melden**
- „Wenn ich auf ‚Speichern‘ tippe, passiert nichts. Kannst du nachsehen?“
- „Am Handy ist der Text bei ‚Schlafenszeit eingehalten‘ abgeschnitten.“

**Sonstiges**
- „Erklär mir, was in der Datei `data.js` passiert.“
- „Lade die neue Version auf GitHub hoch.“
- „Geh zurück zur Version von gestern.“ (Jeder funktionierende Stand ist in Git gespeichert.)
