/* =========================================================
   app.js – Das "Gehirn" der Oberfläche

   Inhalt:
   1. Kleine Helfer (Icons, Texte, Bausteine)
   2. Dark/Light Mode (+ 2b. Handy-App / PWA)
   3. Verzeichnis der Seiten
   4. Navigation zwischen den Seiten
   5. Start der App
   ========================================================= */


/* ---------- 1. Kleine Helfer ---------- */

// Macht Text "ungefährlich", bevor er in die Seite eingebaut wird
// (damit z. B. ein "<" in einem Namen nichts kaputt macht)
function esc(text) {
  return String(text ?? '').replace(/[&<>"']/g, zeichen => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[zeichen]));
}

// Platzhalter für ein Icon. Lucide macht daraus später ein echtes Bild.
// Alle Icon-Namen findest du auf https://lucide.dev/icons
function icon(name) {
  return `<i data-lucide="${name}"></i>`;
}

// Verwandelt alle Icon-Platzhalter auf der Seite in echte Icons
function iconsZeichnen() {
  if (window.lucide) lucide.createIcons();
}

// Überschrift einer Seite
function seitenKopf(titel, untertitel = '') {
  return `
    <header class="seiten-kopf">
      <h1>${esc(titel)}</h1>
      ${untertitel ? `<p>${esc(untertitel)}</p>` : ''}
    </header>`;
}

// Hinweis-Karte für Bereiche, die noch leer sind
function platzhalter(iconName, titel, text) {
  return `
    <section class="karte leer">
      <span class="icon-feld gross">${icon(iconName)}</span>
      <h2 class="karten-titel">${esc(titel)}</h2>
      <p>${esc(text)}</p>
    </section>`;
}

// Mehrere Knöpfe nebeneinander, von denen einer ausgewählt ist
// optionen: [{ wert, text, icon }]
function auswahlGruppe(name, optionen, aktuell) {
  const knoepfe = optionen.map(o => `
    <button type="button" class="auswahl-knopf ${String(o.wert) === String(aktuell) ? 'aktiv' : ''}"
            data-wert="${esc(o.wert)}" aria-pressed="${String(o.wert) === String(aktuell)}">
      ${o.icon ? icon(o.icon) : ''}<span>${esc(o.text)}</span>
    </button>`).join('');
  return `<div class="auswahl-gruppe" data-name="${esc(name)}" role="group">${knoepfe}</div>`;
}

// Wie auswahlGruppe, aber für Formulare (echte Auswahlfelder)
function radioGruppe(name, optionen, aktuell) {
  const knoepfe = optionen.map(o => `
    <label class="auswahl-knopf">
      <input type="radio" name="${esc(name)}" value="${esc(o.wert)}" ${String(o.wert) === String(aktuell) ? 'checked' : ''}>
      ${o.icon ? icon(o.icon) : ''}<span>${esc(o.text)}</span>
    </label>`).join('');
  return `<div class="auswahl-gruppe" role="radiogroup">${knoepfe}</div>`;
}

// Ein-/Aus-Schalter mit Titel und kurzer Erklärung
function schalter(name, titel, text, an) {
  return `
    <label class="schalter-zeile">
      <span class="titel-text"><strong>${esc(titel)}</strong><small>${esc(text)}</small></span>
      <input type="checkbox" class="schalter" name="${esc(name)}" ${an ? 'checked' : ''}>
    </label>`;
}

// Zahl schön auf Deutsch anzeigen: 8000 → "8.000", 2.5 → "2,5"
function zahl(wert) {
  return Number(wert).toLocaleString('de-DE', { maximumFractionDigits: 2 });
}

// Liest eine eingetippte Zahl ("2,5", "8.000", "8000") – leer oder ungültig = null
function zahlLesen(text) {
  let t = String(text ?? '').trim().replace(/\s/g, '');
  if (!t) return null;
  if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.');   // 1.234,5 → 1234.5
  else if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, '');  // 8.000 → 8000
  const wert = Number(t);
  return Number.isFinite(wert) ? wert : null;
}

// Kurze Meldung unten am Bildschirm, z. B. "Gespeichert"
function meldung(text) {
  const el = document.createElement('div');
  el.className = 'meldung';
  el.setAttribute('role', 'status');
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => el.classList.add('weg'), 1600);
  setTimeout(() => el.remove(), 2000);
}

// Fenster, das von unten hochfährt (am Laptop: in der Mitte)
const Dialog = {
  element: null,

  // Öffnet das Fenster mit Titel und Inhalt und gibt es zurück
  oeffnen(titel, inhalt) {
    if (!this.element) {
      this.element = document.createElement('dialog');
      this.element.className = 'blatt';
      // Beim Öffnen das Fenster selbst fokussieren (nicht den Schließen-Knopf)
      this.element.setAttribute('autofocus', '');
      document.body.appendChild(this.element);
      // Tipp auf den abgedunkelten Hintergrund schließt das Fenster
      this.element.addEventListener('click', e => {
        if (e.target === this.element) this.schliessen();
      });
    }
    this.element.innerHTML = `
      <div class="blatt-kopf">
        <h2>${esc(titel)}</h2>
        <button type="button" class="icon-knopf" data-schliessen aria-label="Schließen">${icon('x')}</button>
      </div>
      <div class="blatt-inhalt">${inhalt}</div>`;
    this.element.querySelector('[data-schliessen]').addEventListener('click', () => this.schliessen());
    iconsZeichnen();
    if (!this.element.open) this.element.showModal();
    return this.element;
  },

  schliessen() {
    if (this.element && this.element.open) this.element.close();
  }
};

// Sicherheitsabfrage. Ergibt true, wenn bestätigt wurde.
// Verwendung: if (await bestaetigen('Wirklich löschen?')) { ... }
function bestaetigen(text, knopfText = 'Löschen') {
  return new Promise(fertig => {
    const d = document.createElement('dialog');
    d.className = 'blatt klein';
    d.innerHTML = `
      <div class="blatt-inhalt bestaetigung">
        <p>${esc(text)}</p>
        <div class="formular-knoepfe">
          <button type="button" class="knopf zweit" data-antwort="nein">Abbrechen</button>
          <button type="button" class="knopf warnung" data-antwort="ja">${esc(knopfText)}</button>
        </div>
      </div>`;
    document.body.appendChild(d);

    // Antwort genau einmal weitergeben und das Fenster entfernen
    let beantwortet = false;
    const antworten = ja => {
      if (beantwortet) return;
      beantwortet = true;
      if (d.open) d.close();
      d.remove();
      fertig(ja);
    };
    d.addEventListener('click', e => {
      const knopf = e.target.closest('[data-antwort]');
      if (knopf) antworten(knopf.dataset.antwort === 'ja');
      else if (e.target === d) antworten(false);
    });
    d.addEventListener('close', () => antworten(false)); // z. B. mit der Esc-Taste geschlossen
    d.showModal();
  });
}

// Fortschrittsring (prozent = 0 bis 100)
const RING_UMFANG = 2 * Math.PI * 50;
function fortschrittsRing(prozent) {
  return `
    <div class="ring" role="img">
      <svg viewBox="0 0 120 120">
        <circle class="ring-spur" cx="60" cy="60" r="50"></circle>
        <circle class="ring-balken" cx="60" cy="60" r="50" stroke-dasharray="${RING_UMFANG}"></circle>
      </svg>
      <div class="ring-text"><strong></strong><span>erledigt</span></div>
    </div>`;
}

// Stellt einen vorhandenen Ring auf einen neuen Wert (mit sanfter Bewegung)
function ringSetzen(ring, prozent) {
  const balken = ring.querySelector('.ring-balken');
  balken.style.strokeDashoffset = RING_UMFANG * (1 - prozent / 100);
  balken.style.opacity = prozent > 0 ? 1 : 0; // bei 0 % keinen Punkt zeigen
  ring.querySelector('strong').textContent = `${Math.round(prozent)}%`;
  ring.setAttribute('aria-label', `${Math.round(prozent)} Prozent erledigt`);
}


/* ---------- 2. Dark/Light Mode ---------- */
const Design = {
  // Fragt das Gerät: "Bist du gerade dunkel eingestellt?"
  systemDunkel: window.matchMedia('(prefers-color-scheme: dark)'),

  // Setzt Hell oder Dunkel – je nach Einstellung
  anwenden() {
    const wahl = Daten.einstellung('design');
    const dunkel = wahl === 'dunkel' || (wahl === 'system' && this.systemDunkel.matches);
    document.documentElement.dataset.theme = dunkel ? 'dark' : 'light';

    // Farbe der Browser-Leiste am Handy passend machen
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.content = getComputedStyle(document.documentElement).getPropertyValue('--hintergrund').trim();
    }
  }
};

// Wenn das Gerät von Hell auf Dunkel wechselt (z. B. abends), sofort mitziehen
Design.systemDunkel.addEventListener('change', () => Design.anwenden());

// Sofort beim Laden anwenden, damit die Seite nicht kurz hell aufblitzt
Design.anwenden();


/* ---------- 2b. Handy-App (PWA) ----------
   Damit man die App installieren kann und sie offline läuft.
   Das funktioniert nur, wenn sie über eine Internetadresse (https://)
   geöffnet wird – nicht per Doppelklick auf die Datei. */
const PWA = {
  aufforderung: null, // vom Browser angebotene Installation (Android/Chrome/Edge)

  // Über eine echte Adresse geöffnet (nicht als Datei)?
  istOnline() {
    return location.protocol === 'https:' || location.protocol === 'http:';
  },

  // Läuft die App gerade als installierte App?
  istInstalliert() {
    return window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  },

  start() {
    if (!this.istOnline()) return; // als Datei geöffnet: nichts zu tun

    // App-Beschreibung (Name, Icons, Farben) für den Browser einbinden
    const manifest = document.createElement('link');
    manifest.rel = 'manifest';
    manifest.href = 'manifest.webmanifest';
    document.head.appendChild(manifest);

    // Service Worker: speichert die App-Dateien, damit sie offline startet
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(fehler => console.warn('Service Worker:', fehler));
    }

    // Der Browser bietet eine Installation an → merken und in den Einstellungen anzeigen
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      this.aufforderung = e;
      if (Navigation.aktuelle === 'einstellungen') Navigation.zeigen();
    });
    window.addEventListener('appinstalled', () => {
      this.aufforderung = null;
      meldung('App installiert');
    });
  },

  async installieren() {
    if (!this.aufforderung) return;
    this.aufforderung.prompt();
    await this.aufforderung.userChoice;
    this.aufforderung = null;
    Navigation.zeigen();
  }
};

PWA.start();


/* ---------- 3. Die Seiten ----------
   Jede Seite hat einen Titel und eine Funktion "anzeigen",
   die den Inhalt in ihren Bereich schreibt. Die Seiten melden
   sich in ihren eigenen Dateien hier an:
   today.js (Heute), stats.js (Statistik),
   habits.js (Gewohnheiten), settings.js (Einstellungen). */
const Seiten = {};


/* ---------- 4. Navigation ----------
   Welche Seite gezeigt wird, steht hinten in der Adresse,
   z. B. index.html#statistik. So bleibt man nach dem Neuladen
   auf derselben Seite. */
const Navigation = {
  aktuelle: null,

  start() {
    window.addEventListener('hashchange', () => this.zeigen());
    this.zeigen();
  },

  // Zeigt die Seite an, die in der Adresse steht
  zeigen() {
    let name = location.hash.slice(1);
    if (!Seiten[name]) name = 'heute';

    // Nur die gewählte Seite sichtbar machen
    document.querySelectorAll('.seite').forEach(seite => {
      seite.hidden = seite.dataset.seite !== name;
    });

    // Den passenden Punkt in der Navigation hervorheben
    document.querySelectorAll('.navi-punkt').forEach(punkt => {
      const aktiv = punkt.dataset.seite === name;
      punkt.classList.toggle('aktiv', aktiv);
      if (aktiv) punkt.setAttribute('aria-current', 'page');
      else punkt.removeAttribute('aria-current');
    });

    // Inhalt der Seite neu aufbauen
    Seiten[name].anzeigen(document.getElementById('seite-' + name));
    iconsZeichnen();

    document.title = `${Seiten[name].titel} · ${KONFIG.appName}`;
    if (this.aktuelle !== name) window.scrollTo(0, 0);
    this.aktuelle = name;
  }
};


/* ---------- 5. Start ----------
   Sobald die Seite fertig geladen ist, geht es los. */
document.addEventListener('DOMContentLoaded', () => {
  Navigation.start();
});
