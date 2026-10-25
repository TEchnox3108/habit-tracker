/* =========================================================
   settings.js – Die Seite "Einstellungen"

   Hier kannst du:
   - Hell/Dunkel umschalten
   - den Wochenstart festlegen
   - zur Verwaltung der Kategorien & Gewohnheiten springen
   - die App aufs Handy installieren (wenn sie online ist)
   - deine Daten sichern, wieder einlesen oder alles zurücksetzen
   - die Farbpalette ansehen
   ========================================================= */

// Beispiel-Icons für die Farbvorschau (eins pro Farbe)
const VORSCHAU_ICONS = [
  'dumbbell', 'apple', 'moon', 'graduation-cap', 'piggy-bank', 'briefcase', 'sparkles',
  'brain', 'users', 'house', 'book-open', 'smartphone', 'heart', 'leaf'
];

// Eine antippbare Zeile mit Icon, Titel, Erklärung und Pfeil
function aktionZeile(aktion, iconName, titel, text, zusatzKlasse = '') {
  return `
    <button type="button" class="zeilen-knopf aktion-zeile ${zusatzKlasse}" data-aktion="${aktion}">
      <span class="icon-feld klein">${icon(iconName)}</span>
      <span class="titel-text"><strong>${esc(titel)}</strong><small>${esc(text)}</small></span>
      ${icon('chevron-right')}
    </button>`;
}

Seiten.einstellungen = {
  titel: 'Einstellungen',

  // Karte "Als App installieren" – je nachdem, wie die App gerade geöffnet ist
  installierenHtml() {
    let inhalt;
    if (PWA.istInstalliert()) {
      inhalt = `<p class="karten-text hinweis-gut">${icon('circle-check')} Die App läuft bereits als installierte App.</p>`;
    } else if (PWA.aufforderung) {
      inhalt = `
        <p class="karten-text">Installiere die App, dann startet sie wie eine normale App – auch ohne Internet.</p>
        <button type="button" class="knopf breit" data-aktion="installieren">${icon('download')}<span>Jetzt installieren</span></button>`;
    } else if (PWA.istOnline()) {
      inhalt = `<p class="karten-text">Öffne das Browser-Menü (⋮ oder Teilen-Symbol) und wähle <strong>„Zum Startbildschirm hinzufügen“</strong> bzw. <strong>„App installieren“</strong>.</p>`;
    } else {
      inhalt = `<p class="karten-text">Gerade ist die App direkt als Datei geöffnet. Zum Installieren muss sie einmal ins Internet hochgeladen werden – wie das geht, steht in der Anleitung <strong>README.md</strong>.</p>`;
    }
    return `
      <section class="karte">
        <h2 class="karten-titel">Als App installieren</h2>
        ${inhalt}
      </section>`;
  },

  anzeigen(bereich) {
    const e = Daten.zustand.einstellungen;

    const farbMuster = KONFIG.farben.map((farbe, i) => `
      <div class="farb-muster" style="--kat: var(--farbe-${farbe.id})">
        <span class="icon-feld">${icon(VORSCHAU_ICONS[i % VORSCHAU_ICONS.length])}</span>
        <span>${esc(farbe.name)}</span>
      </div>`).join('');

    const backupText = e.letztesBackup
      ? `Letzte Sicherung: ${Datum.kurz(Datum.ausSchluessel(e.letztesBackup))}`
      : 'Du hast noch keine Sicherung gemacht.';

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

      ${this.installierenHtml()}

      <section class="karte">
        <h2 class="karten-titel">Daten & Backup</h2>
        <p class="karten-text">Deine Daten liegen nur in diesem Browser auf diesem Gerät. Sichere sie ab und zu als Datei. ${backupText}</p>
        <div class="aktionen-liste">
          ${aktionZeile('exportieren', 'download', 'Daten exportieren', 'Als Datei speichern (Backup)')}
          ${aktionZeile('importieren', 'upload', 'Backup importieren', 'Ersetzt die aktuellen Daten')}
          ${aktionZeile('zuruecksetzen', 'trash-2', 'Alles zurücksetzen', 'Löscht alles und startet neu', 'gefahr')}
        </div>
        <input type="file" accept=".json,application/json" data-import-datei hidden>
      </section>

      <section class="karte">
        <h2 class="karten-titel">Farbpalette</h2>
        <p class="karten-text">Diese Farben kannst du deinen Kategorien geben.</p>
        <div class="farb-raster">${farbMuster}</div>
      </section>

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

    // Daten & Installieren
    bereich.onclick = ereignis => {
      const el = ereignis.target.closest('[data-aktion]');
      if (!el) return;
      const aktion = el.dataset.aktion;
      if (aktion === 'exportieren') this.exportieren();
      if (aktion === 'importieren') bereich.querySelector('[data-import-datei]').click();
      if (aktion === 'zuruecksetzen') this.zuruecksetzen();
      if (aktion === 'installieren') PWA.installieren();
    };
    bereich.onchange = ereignis => {
      if (ereignis.target.matches('[data-import-datei]')) this.importieren(ereignis.target);
    };
  },

  // Sicherungsdatei herunterladen
  exportieren() {
    const text = JSON.stringify(Daten.exportDaten(), null, 2);
    const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `habit-tracker-backup-${Datum.schluessel(new Date())}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    Daten.einstellungSetzen('letztesBackup', Datum.schluessel(new Date()));
    Navigation.zeigen();
    meldung('Backup gespeichert');
  },

  // Sicherungsdatei einlesen (nach Sicherheitsabfrage)
  async importieren(feld) {
    const datei = feld.files[0];
    feld.value = ''; // damit man dieselbe Datei nochmal wählen kann
    if (!datei) return;

    let inhalt;
    try {
      inhalt = JSON.parse(await datei.text());
    } catch (fehler) {
      meldung('Die Datei konnte nicht gelesen werden.');
      return;
    }

    const ok = await bestaetigen(
      `„${datei.name}“ einlesen? Deine aktuellen Daten in diesem Browser werden dabei komplett ersetzt.`,
      'Einlesen');
    if (!ok) return;

    try {
      Daten.importieren(inhalt);
    } catch (fehler) {
      meldung(fehler.message);
      return;
    }
    Design.anwenden();
    Heute.datum = Datum.heute();
    Navigation.zeigen();
    meldung('Backup eingelesen');
  },

  // Alles löschen (nach Sicherheitsabfrage)
  async zuruecksetzen() {
    const ok = await bestaetigen(
      'Wirklich ALLES löschen? Alle Gewohnheiten, Einträge, Notizen und Einstellungen gehen verloren. Tipp: Mach vorher ein Backup.',
      'Alles löschen');
    if (!ok) return;
    Daten.zuruecksetzen();
    Design.anwenden();
    Heute.datum = Datum.heute();
    Navigation.zeigen();
    meldung('Alles zurückgesetzt');
  }
};
