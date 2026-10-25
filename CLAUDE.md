# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Der Nutzer – bitte immer beachten
- Der Nutzer hat **keine Programmiererfahrung**. Antworte **auf Deutsch**, einfach und ohne Fachchinesisch.
- Bei größeren Änderungen: **erst einen Plan zeigen und auf OK warten**, dann programmieren.
- Entscheidungen, die der Nutzer verstehen sollte, kurz nachfragen; Kleinkram selbst sinnvoll entscheiden und erwähnen.
- Nach jeder Phase bzw. funktionierenden Änderung: erklären, was neu ist, wie man es öffnet/testet, und **einen Git-Commit mit verständlicher deutscher Beschreibung** machen. Keine kaputten Zwischenstände committen.
- Git liegt unter `C:\Program Files\Git\cmd\git.exe` (falls `git` in der Sitzung nicht im PATH ist). Autor im Repo: `eduard`.
- Code-Kommentare auf Deutsch, im Stil der vorhandenen Dateien (Abschnitts-Überschriften, kurze Erklärungen für Laien).

## Projekt
Persönlicher Habit Tracker als reine Web-App (HTML/CSS/JS). Wird per **Doppelklick auf `index.html`** geöffnet – kein Server, keine Build-Tools, keine Installation, kein npm.

Daraus folgen harte Regeln (wegen `file://`):
- **Keine ES-Module** (`type="module"`/`import`) und kein `fetch()` lokaler Dateien – das blockiert der Browser bei `file://`. Nur klassische `<script src>`-Tags; alle Dateien teilen sich globale Objekte. Die Reihenfolge der Script-Tags in `index.html` ist wichtig.
- Externe Bibliotheken nur per CDN mit fester Version: Lucide (`lucide@0.460.0`, unpkg), SortableJS (`sortablejs@1.15.3`, jsdelivr), Chart.js (`chart.js@4.4.6`, jsdelivr), Google Font Inter. Ohne Internet muss die App trotzdem laufen (`if (window.Sortable)` usw.).
- Daten nur im `localStorage` (Schlüssel `KONFIG.speicherSchluessel` – nie ändern, sonst sind Nutzerdaten „weg“).
- Service Worker/PWA funktionieren nur über `https://` (z. B. GitHub Pages) bzw. localhost, nicht über `file://`. `PWA.start()` in `app.js` bindet Manifest und `sw.js` deshalb nur bei http(s) ein. Die App muss ohne Service Worker voll funktionieren.
- **Bei jeder Änderung an App-Dateien `VERSION` in `sw.js` erhöhen** (sonst sieht die installierte App die Änderung erst verzögert). Neue Dateien zusätzlich in `APP_DATEIEN` in `sw.js` eintragen. Strategie: eigene Dateien stale-while-revalidate, CDN-Dateien cache-first.
- Für den Nutzer gibt es eine deutsche `README.md` (Öffnen, Handy/Hosting, wo man was ändert, Beispiel-Sätze) – bei neuen Dateien/Funktionen mitpflegen.

Testen: Der eingebaute Browser zeigt `file://`-Seiten nur als Schnappschuss ohne CSS/JS. Deshalb mit `preview_start` die Konfiguration `habit-tracker` aus `.claude/launch.json` starten (kleiner PowerShell-Server `.claude/server.ps1`, http://localhost:5500 – nur für Claude, kein Python/Node auf dem Rechner). Handy-Größe (375px) und Laptop (z. B. 1280px), Hell und Dunkel prüfen, Konsole auf Fehler checken. Es gibt keine automatischen Tests. Achtung: localhost hat einen eigenen localStorage, getrennt von den Daten des Nutzers unter `file://`. Auf localhost läuft der Service Worker und liefert alte Dateien zuerst aus – vor dem Testen von Änderungen `caches.keys()` löschen (ggf. SW abmelden), Dateien per `fetch(url, {cache:'reload'})` neu holen und dann `location.reload()`. Downloads (Export) nicht wirklich auslösen, sondern `HTMLAnchorElement.prototype.click` kurz abfangen. Drag & Drop lässt sich mit `left_click_drag` nicht testen (zu schnell); stattdessen schrittweise Pointer-/Mouse-Events per JavaScript auslösen.

## Dateien & Architektur
| Datei | Zweck |
|---|---|
| `index.html` | Gerüst: Navigation + vier `<section class="seite">` (heute, statistik, gewohnheiten, einstellungen) |
| `styles.css` | Gesamtes Aussehen. **Abschnitt 1 enthält alle Design-Variablen** (Farben, Schrift, Abstände, Rundungen) – Design nur dort ändern |
| `config.js` | `KONFIG`: App-Name, Version, Farbauswahl, Icon-Auswahl, `startKategorien` (12 Kategorien mit Beispiel-Gewohnheiten, nur beim allerersten Start verwendet) |
| `data.js` | `Daten` (Laden/Speichern von `Daten.zustand`, CRUD für Kategorien/Gewohnheiten, `gewohnheitVorlage()` mit allen Standardfeldern, `reihenfolgeUebernehmen()` nach Drag & Drop, Einträge `wert`/`wertSetzen`/`notizSetzen`, **Auswertung** `istErledigt`/`fortschritt`/`wochenErledigt`/`istFaellig` – Statistik in Phase 4 soll diese wiederverwenden) und `Datum` (deutsche Formate, Tages-Schlüssel `JJJJ-MM-TT`, `heute`, `plusTage`, `wocheVon`, `ausSchluessel`). `Daten.laden()` steht ganz unten, weil es `Datum` braucht |
| `app.js` | Helfer (`esc`, `icon`, `iconsZeichnen`, `seitenKopf`, `platzhalter`, `auswahlGruppe`, `radioGruppe`, `schalter`, `zahl`, `zahlLesen`, `meldung`, `Dialog`, `bestaetigen`, `fortschrittsRing` + `ringSetzen`), `Design` (Hell/Dunkel), leeres Verzeichnis `Seiten` (jede Seiten-Datei trägt sich selbst ein), `Navigation`, Start |
| `today.js` | `Heute` + `Seiten.heute`: fällige Gewohnheiten nach Kategorie, Abhaken/Zähler/Zahlenfeld, Notiz-Dialog, Tageswechsel (nicht in die Zukunft), Fortschrittsring. Nach einer Eingabe wird nur die Zeile ersetzt (`zeileNeu`) + `zusammenfassungAktualisieren()`, damit Ring-/Plopp-Animationen laufen |
| `stats.js` | `Statistik` + `Seiten.statistik`: Kacheln, Gesamt-Heatmap, Kategorien (Woche/Monat mit Blättern), Chart.js-Verlauf, Gewohnheitenliste mit Serien, Detail-Dialog pro Gewohnheit. Rechenregeln siehe unten |
| `habits.js` | `Seiten.gewohnheiten`: Liste, Formulare für Kategorie/Gewohnheit, Drag & Drop (SortableJS mit `forceFallback`), Texte wie `gewohnheitBeschreibung()`/`haeufigkeitText()` |
| `settings.js` | `Seiten.einstellungen`: Darstellung, Wochenstart, „Als App installieren“ (je nach `PWA`-Zustand), Daten & Backup (Export als JSON-Download, Import über `<input type=file>` + `Daten.importieren`, Zurücksetzen) |
| `manifest.webmanifest`, `sw.js`, `icons/` | PWA. Icons sind PNGs (192/512/maskable/apple-touch 180) + `icon.svg` als Favicon; Motiv: weißer Haken auf `#7e9c85` |

Datenmodell (`Daten.zustand`):
- `kategorien: [{ id, name, farbe, icon, ausgeblendet }]` – Array-Reihenfolge = Anzeige-Reihenfolge
- `gewohnheiten: [{ id, kategorieId, name, icon, typ: 'janein'|'zaehler'|'zahl', ziel (Zahl oder null; bei negativ = Höchstwert), einheit, richtung: 'positiv'|'negativ', haeufigkeit: { art: 'taeglich'|'wochentage'|'proWoche', tage: [0–6, 0 = So], anzahl }, ausgeblendet, erstellt }]` – Farbe kommt immer von der Kategorie
- `eintraege: { 'JJJJ-MM-TT': { [gewohnheitId]: { wert?, notiz? } } }` – `wert` ist immer eine Zahl (Abhaken: 1 = erledigt/vermieden; Zähler/Zahl: der Wert); kein Wert = nichts eingetragen. Leere Einträge/Tage werden entfernt; beim Löschen einer Gewohnheit verschwinden ihre Einträge mit
- Fälligkeit hängt nicht vom Erstelldatum ab (damit man auch vor dem Anlegen nachtragen kann).

Statistik-Regeln (`stats.js`):
- Eine Gewohnheit zählt ab `startVon(g)` = Erstelldatum oder erster Eintrag, falls früher. Ausgeblendete Gewohnheiten/Kategorien fließen nicht ein.
- **Serie:** aufeinanderfolgende geplante Tage geschafft; nicht geplante Tage unterbrechen nicht; heute zählt erst, wenn geschafft, bricht aber nicht. „X-mal pro Woche“ zählt in Wochen (Wochenziel erreicht).
- **Quote (`bilanz`)**: geschafft/geplant, binär. Heute zählt nur wenn geschafft. „X-mal pro Woche“: Wochenziel pro Woche (angeschnittene Wochen anteilig, laufende Woche ohne Strafe).
- **Heatmap (`tagesWert`)**: Durchschnitt von `Daten.fortschritt` (mit Teil-Fortschritt) über geplante Gewohnheiten; „X-mal pro Woche“ nur als Bonus an erledigten Tagen; Stufen 0–4, `leer` = nichts geplant. Farbe über `--kat` (gesamt: `--akzent`).
- Chart.js-Diagramme werden in `Statistik.diagramme[name]` gemerkt und vor dem Neuzeichnen zerstört; Farben kommen per `getComputedStyle` aus den CSS-Variablen.
- Neue Felder immer mit Standardwert in `standard()` bzw. `gewohnheitVorlage()` ergänzen, damit alte gespeicherte Daten weiter funktionieren.

Zusammenspiel:
- **Navigation per Adress-Hash** (`#heute`, `#statistik`, …). `Navigation.zeigen()` blendet die passende Section ein und ruft `Seiten[name].anzeigen(bereich)` auf, das den Inhalt komplett per `innerHTML` neu aufbaut. Nach Datenänderungen einfach `Navigation.zeigen()` erneut aufrufen. Klick-Handler auf dem (bleibenden) Bereich mit `bereich.onclick = …` setzen, nicht `addEventListener` – sonst stapeln sie sich bei jedem Neuaufbau. Neue Seiten = neuer Eintrag in `Seiten` + Section in `index.html` + Navi-Punkt.
- **Formulare** laufen in `Dialog.oeffnen(titel, html)` (ein wiederverwendetes `<dialog>`, am Handy von unten, am Laptop mittig). Lösch-Abfragen über `await bestaetigen(text)`. Formularfelder über `form.elements.x` lesen; das Namensfeld heißt `titel`, weil `form.name` belegt ist.
- **Icons:** `icon('name')` erzeugt `<i data-lucide>`-Platzhalter; nach jedem Neuaufbau muss `iconsZeichnen()` laufen (macht `Navigation.zeigen()` automatisch; bei eigenem Neu-Rendern selbst aufrufen).
- **Hell/Dunkel:** `Design.anwenden()` setzt `data-theme="light|dark"` auf `<html>` (Einstellung `system|hell|dunkel`; „system“ folgt `prefers-color-scheme`). Dunkle Farben stehen nur in `:root[data-theme="dark"]`.
- **Kategorie-Farben:** Farben haben eine `id` (z. B. `salbei`) → CSS-Variable `--farbe-<id>`. Elemente bekommen `style="--kat: var(--farbe-<id>)"`; `.icon-feld` färbt Icon und getönten runden Hintergrund (`color-mix` mit `--toenung`) daraus. Neue Farbe = Variable in `styles.css` + Eintrag in `KONFIG.farben`.
- Nutzertexte immer mit `esc()` einsetzen.

## Design-Vorgaben
Matt und ruhig: keine Verläufe, kein Glanz, keine Neonfarben; gedämpfte Palette; viel Weißraum; Rundungen 14–20px; feine Linien statt Schatten; Schrift Inter; nur sanfte, kurze Animationen. Mobile-first, untere Navigationsleiste am Handy (ab 900px Breite: Leiste links). Oberfläche komplett Deutsch, Datum `TT.MM.JJJJ`.

## Phasen (Stand)
1. ✅ Grundgerüst, Design-System, Dark/Light, Navigation
2. ✅ Kategorien & Gewohnheiten anlegen/bearbeiten/löschen/ausblenden/sortieren (12 Start-Kategorien mit Beispielen), Speichern
3. ✅ „Heute“: Abhaken, Zähler, Zahlen mit Einheit, Notiz, Fortschrittsring (mit Teil-Fortschritt bei Zielen), vergangene Tage nachtragen
4. ✅ Statistik: Streaks, Heatmap, Wochen/Monat pro Kategorie, Chart.js-Diagramme, Erfolgsquote
5. ✅ Export/Import (JSON), Zurücksetzen, PWA (manifest + sw.js), Feinschliff (bis 320px Breite getestet), README.md

Offen: Hochladen ins Internet (GitHub Pages oder Netlify) braucht ein Konto des Nutzers – das legt der Nutzer selbst an; Claude kann danach per Git hochladen.

Mit dem Nutzer vereinbarte Regeln: „Vermeide ich“-Gewohnheit abgehakt = heute vermieden (Erfolg). „X-mal pro Woche“ erscheint täglich, bis das Wochenziel erreicht ist. Zähler/Zahl erledigt bei erreichtem Tagesziel, ohne Ziel bei Wert > 0. Nicht fällige Tage unterbrechen Serien nicht. „Stimmung“ = Zahl 1–5. Nachtragen nur für vergangene Tage, nicht für die Zukunft.
