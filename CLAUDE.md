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
- Externe Bibliotheken nur per CDN mit fester Version: Lucide (`lucide@0.460.0`, unpkg), Google Font Inter; geplant: Chart.js (Statistik), SortableJS (Drag & Drop auf Touch).
- Daten nur im `localStorage` (Schlüssel `KONFIG.speicherSchluessel` – nie ändern, sonst sind Nutzerdaten „weg“).
- Service Worker/PWA funktionieren nur über `https://` (z. B. GitHub Pages), nicht über `file://`. Die App muss ohne Service Worker voll funktionieren.

Testen: Der eingebaute Browser zeigt `file://`-Seiten nur als Schnappschuss ohne CSS/JS. Deshalb mit `preview_start` die Konfiguration `habit-tracker` aus `.claude/launch.json` starten (kleiner PowerShell-Server `.claude/server.ps1`, http://localhost:5500 – nur für Claude, kein Python/Node auf dem Rechner). Handy-Größe (375px) und Laptop (z. B. 1280px), Hell und Dunkel prüfen, Konsole auf Fehler checken. Es gibt keine automatischen Tests. Achtung: localhost hat einen eigenen localStorage, getrennt von den Daten des Nutzers unter `file://`.

## Dateien & Architektur
| Datei | Zweck |
|---|---|
| `index.html` | Gerüst: Navigation + vier `<section class="seite">` (heute, statistik, gewohnheiten, einstellungen) |
| `styles.css` | Gesamtes Aussehen. **Abschnitt 1 enthält alle Design-Variablen** (Farben, Schrift, Abstände, Rundungen) – Design nur dort ändern |
| `config.js` | `KONFIG`: App-Name, Version, Farbauswahl (später: Start-Kategorien, Beispiel-Gewohnheiten, Icon-Auswahl) |
| `data.js` | `Daten` (Laden/Speichern von `Daten.zustand` im localStorage, Standardwerte werden mit Gespeichertem gemischt) und `Datum` (deutsche Formate, Tages-Schlüssel `JJJJ-MM-TT`) |
| `app.js` | Helfer (`esc`, `icon`, `iconsZeichnen`, `seitenKopf`, `platzhalter`, `auswahlGruppe`, `fortschrittsRing`), `Design` (Hell/Dunkel), Registry `Seiten`, `Navigation`, Start |
| `settings.js` | `Seiten.einstellungen` |

Zusammenspiel:
- **Navigation per Adress-Hash** (`#heute`, `#statistik`, …). `Navigation.zeigen()` blendet die passende Section ein und ruft `Seiten[name].anzeigen(bereich)` auf, das den Inhalt komplett per `innerHTML` neu aufbaut. Neue Seiten = neuer Eintrag in `Seiten` + Section in `index.html` + Navi-Punkt.
- **Icons:** `icon('name')` erzeugt `<i data-lucide>`-Platzhalter; nach jedem Neuaufbau muss `iconsZeichnen()` laufen (macht `Navigation.zeigen()` automatisch; bei eigenem Neu-Rendern selbst aufrufen).
- **Hell/Dunkel:** `Design.anwenden()` setzt `data-theme="light|dark"` auf `<html>` (Einstellung `system|hell|dunkel`; „system“ folgt `prefers-color-scheme`). Dunkle Farben stehen nur in `:root[data-theme="dark"]`.
- **Kategorie-Farben:** Farben haben eine `id` (z. B. `salbei`) → CSS-Variable `--farbe-<id>`. Elemente bekommen `style="--kat: var(--farbe-<id>)"`; `.icon-feld` färbt Icon und getönten runden Hintergrund (`color-mix` mit `--toenung`) daraus. Neue Farbe = Variable in `styles.css` + Eintrag in `KONFIG.farben`.
- Nutzertexte immer mit `esc()` einsetzen.

## Design-Vorgaben
Matt und ruhig: keine Verläufe, kein Glanz, keine Neonfarben; gedämpfte Palette; viel Weißraum; Rundungen 14–20px; feine Linien statt Schatten; Schrift Inter; nur sanfte, kurze Animationen. Mobile-first, untere Navigationsleiste am Handy (ab 900px Breite: Leiste links). Oberfläche komplett Deutsch, Datum `TT.MM.JJJJ`.

## Phasen (Stand)
1. ✅ Grundgerüst, Design-System, Dark/Light, Navigation
2. Kategorien & Gewohnheiten anlegen/bearbeiten/löschen/ausblenden/sortieren (12 Start-Kategorien mit Beispielen), Speichern
3. „Heute“: Abhaken, Zähler, Zahlen mit Einheit, Notiz, Fortschrittsring, vergangene Tage nachtragen
4. Statistik: Streaks, Heatmap, Wochen/Monat pro Kategorie, Chart.js-Diagramme, Erfolgsquote
5. Export/Import (JSON), Zurücksetzen, PWA (manifest + sw.js), Feinschliff, README.md

Mit dem Nutzer vereinbarte Regeln: „Vermeide ich“-Gewohnheit abgehakt = heute vermieden (Erfolg). „X-mal pro Woche“ erscheint täglich, bis das Wochenziel erreicht ist. Zähler/Zahl erledigt bei erreichtem Tagesziel, ohne Ziel bei Wert > 0. Nicht fällige Tage unterbrechen Serien nicht. „Stimmung“ = Zahl 1–5. Nachtragen nur für vergangene Tage, nicht für die Zukunft.
