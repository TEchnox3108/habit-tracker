/* =========================================================
   settings.js – Die Seite "Einstellungen"

   Hier kannst du:
   - Hell/Dunkel umschalten
   - den Wochenstart festlegen
   - zur Verwaltung der Kategorien & Gewohnheiten springen
   - die Farbpalette ansehen
   (Export/Import und Zurücksetzen kommen in Phase 5.)
   ========================================================= */

// Beispiel-Icons für die Farbvorschau (eins pro Farbe)
const VORSCHAU_ICONS = [
  'dumbbell', 'apple', 'moon', 'graduation-cap', 'piggy-bank', 'briefcase', 'sparkles',
  'brain', 'users', 'house', 'book-open', 'smartphone', 'heart', 'leaf'
];

Seiten.einstellungen = {
  titel: 'Einstellungen',

  anzeigen(bereich) {
    const e = Daten.zustand.einstellungen;

    const farbMuster = KONFIG.farben.map((farbe, i) => `
      <div class="farb-muster" style="--kat: var(--farbe-${farbe.id})">
        <span class="icon-feld">${icon(VORSCHAU_ICONS[i % VORSCHAU_ICONS.length])}</span>
        <span>${esc(farbe.name)}</span>
      </div>`).join('');

    bereich.innerHTML = `
      ${seitenKopf('Einstellungen', 'Passe die App an dich an')}

      <section class="karte">
        <h2 class="karten-titel">Darstellung</h2>
        <p class="karten-text">„System“ folgt automatisch deinem Handy oder Laptop.</p>
        ${auswahlGruppe('design', [
          { wert: 'system', text: 'System', icon: 'monitor-smartphone' },
          { wert: 'hell', text: 'Hell', icon: 'sun' },
          { wert: 'dunkel', text: 'Dunkel', icon: 'moon' }
        ], e.design)}
      </section>

      <section class="karte">
        <h2 class="karten-titel">Woche beginnt am</h2>
        <p class="karten-text">Wichtig für Wochenziele und die Wochenübersicht.</p>
        ${auswahlGruppe('wochenstart', [
          { wert: 1, text: 'Montag' },
          { wert: 0, text: 'Sonntag' }
        ], e.wochenstart)}
      </section>

      <a class="karte link-karte" href="#gewohnheiten">
        <span class="icon-feld">${icon('list-checks')}</span>
        <span class="titel-text">
          <strong>Kategorien & Gewohnheiten</strong>
          <small>Anlegen, bearbeiten, sortieren, ausblenden</small>
        </span>
        ${icon('chevron-right')}
      </a>

      <section class="karte">
        <h2 class="karten-titel">Farbpalette</h2>
        <p class="karten-text">Diese Farben kannst du deinen Kategorien geben.</p>
        <div class="farb-raster">${farbMuster}</div>
      </section>

      ${platzhalter('database-backup', 'Daten & Backup',
        'In Phase 5 kannst du hier deine Daten als Datei sichern, wieder einlesen oder alles zurücksetzen.')}

      <p class="fusszeile">${esc(KONFIG.appName)} · Version ${esc(KONFIG.version)}</p>`;

    // Klicks auf die Auswahl-Knöpfe verarbeiten
    bereich.querySelectorAll('.auswahl-gruppe').forEach(gruppe => {
      gruppe.addEventListener('click', ereignis => {
        const knopf = ereignis.target.closest('.auswahl-knopf');
        if (!knopf) return;

        const name = gruppe.dataset.name;
        // Wochenstart wird als Zahl gespeichert, alles andere als Text
        const wert = name === 'wochenstart' ? Number(knopf.dataset.wert) : knopf.dataset.wert;
        Daten.einstellungSetzen(name, wert);

        // Gewählten Knopf hervorheben
        gruppe.querySelectorAll('.auswahl-knopf').forEach(k => {
          const aktiv = k === knopf;
          k.classList.toggle('aktiv', aktiv);
          k.setAttribute('aria-pressed', aktiv);
        });

        if (name === 'design') Design.anwenden();
      });
    });
  }
};
