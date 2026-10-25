/* =========================================================
   app.js – Das "Gehirn" der Oberfläche

   Inhalt:
   1. Kleine Helfer (Icons, Texte, Bausteine)
   2. Dark/Light Mode
   3. Die Seiten (Heute, Statistik, Gewohnheiten)
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

// Fortschrittsring (prozent = 0 bis 100)
function fortschrittsRing(prozent) {
  const radius = 50;
  const umfang = 2 * Math.PI * radius;
  const versatz = umfang * (1 - prozent / 100);
  return `
    <div class="ring" role="img" aria-label="${Math.round(prozent)} Prozent erledigt">
      <svg viewBox="0 0 120 120">
        <circle class="ring-spur" cx="60" cy="60" r="${radius}"></circle>
        ${prozent > 0 ? `<circle class="ring-balken" cx="60" cy="60" r="${radius}"
            stroke-dasharray="${umfang}" stroke-dashoffset="${versatz}"></circle>` : ''}
      </svg>
      <div class="ring-text"><strong>${Math.round(prozent)}%</strong><span>erledigt</span></div>
    </div>`;
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


/* ---------- 3. Die Seiten ----------
   Jede Seite hat einen Titel und eine Funktion "anzeigen",
   die den Inhalt in ihren Bereich schreibt.
   Die Seite "Einstellungen" steht in settings.js. */
const Seiten = {
  heute: {
    titel: 'Heute',
    anzeigen(bereich) {
      bereich.innerHTML = `
        ${seitenKopf('Heute', Datum.lang(new Date()))}
        <section class="karte ring-karte">
          ${fortschrittsRing(0)}
          <div>
            <h2 class="karten-titel">Dein Tag</h2>
            <p class="karten-text">Sobald du Gewohnheiten hast, siehst du hier, wie viel du heute schon geschafft hast.</p>
          </div>
        </section>
        ${platzhalter('sun', 'Hier erscheinen deine Gewohnheiten',
          'In Phase 3 kannst du hier alles, was heute dran ist, mit einem Tipp abhaken.')}`;
    }
  },

  statistik: {
    titel: 'Statistik',
    anzeigen(bereich) {
      bereich.innerHTML = `
        ${seitenKopf('Statistik', 'Deine Fortschritte auf einen Blick')}
        ${platzhalter('chart-column', 'Noch keine Statistiken',
          'In Phase 4 findest du hier Serien, einen Kalender und Diagramme.')}`;
    }
  },

  gewohnheiten: {
    titel: 'Gewohnheiten',
    anzeigen(bereich) {
      bereich.innerHTML = `
        ${seitenKopf('Gewohnheiten', 'Kategorien und Gewohnheiten verwalten')}
        ${platzhalter('list-checks', 'Bald geht’s los',
          'In Phase 2 legst du hier Kategorien und Gewohnheiten an, änderst Farben und Icons und sortierst sie.')}`;
    }
  }
};


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
