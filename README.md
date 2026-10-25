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

## 4. Wo ändere ich was?

| Was du ändern willst | Wo |
|---|---|
| **Kategorien & Gewohnheiten** (Namen, Farben, Icons, Ziele, Reihenfolge) | Direkt in der App unter **Gewohnheiten** – dafür musst du nichts am Code ändern |
| **Farben, Schriftgrößen, Abstände, Rundungen** | `styles.css` → ganz oben, Abschnitt **„1. DESIGN-EINSTELLUNGEN“** |
| **Farben für den Dunkel-Modus** | `styles.css` → Block `:root[data-theme="dark"]` direkt darunter |
| **Neue Farbe zur Auswahl hinzufügen** | in `styles.css` eine Zeile `--farbe-NAME: #…;` **und** in `config.js` bei `farben` eintragen |
| **Icon-Auswahl** | `config.js` → Liste `icons` (Namen findest du auf [lucide.dev/icons](https://lucide.dev/icons)) |
| **Start-Kategorien** (nur für den allerersten Start) | `config.js` → `startKategorien` |
| **Name der App** | `config.js` → `appName` und `manifest.webmanifest` → `name` |
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
| `habits.js` | Seite „Gewohnheiten“ |
| `settings.js` | Seite „Einstellungen“ |
| `manifest.webmanifest`, `sw.js`, `icons/` | Alles für die Handy-App |
| `CLAUDE.md` | Anleitung für Claude (wie das Projekt aufgebaut ist) |

**Nach Änderungen an der Internet-Version:** In `sw.js` die Zeile `const VERSION = 'v1';` um eins erhöhen
(z. B. `'v2'`) und neu hochladen – sonst zeigt das Handy evtl. noch kurz die alte Version.
Wenn du Claude um Änderungen bittest, erledigt Claude das mit.

---

## 5. So kannst du Claude um Änderungen bitten

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
