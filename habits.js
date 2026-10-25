/* =========================================================
   habits.js – Die Seite "Gewohnheiten"

   Hier verwaltest du Kategorien und Gewohnheiten:
   - anlegen, bearbeiten, löschen, ausblenden
   - Farbe und Icon wählen
   - per Drag & Drop sortieren (am Griff ⋮⋮ ziehen)

   Aufbau:
   1. Texte (z. B. "Ziel: 8 Gläser · Täglich")
   2. Bausteine für die Formulare
   3. Formular "Kategorie"
   4. Formular "Gewohnheit"
   5. Die Seite selbst + Sortieren
   ========================================================= */


/* ---------- 1. Texte ---------- */

// Wie oft? z. B. "Täglich", "Mo, Mi, Fr" oder "3× pro Woche"
function haeufigkeitText(h) {
  if (h.art === 'proWoche') return `${h.anzahl}× pro Woche`;
  if (h.art === 'wochentage' && h.tage.length < 7) {
    return Datum.wochenReihenfolge()
      .filter(tag => h.tage.includes(tag))
      .map(tag => Datum.WOCHENTAGE_KURZ[tag])
      .join(', ');
  }
  return 'Täglich';
}

// Kurze Beschreibung unter dem Namen, z. B. "Ziel: 8 Gläser · Täglich"
function gewohnheitBeschreibung(g) {
  const einheit = g.einheit ? ' ' + g.einheit : '';
  let art;
  if (g.typ === 'janein') {
    art = g.richtung === 'negativ' ? 'Vermeiden' : 'Abhaken';
  } else if (g.ziel != null) {
    art = (g.richtung === 'negativ' ? 'Höchstens ' : 'Ziel: ') + zahl(g.ziel) + einheit;
  } else {
    art = g.typ === 'zaehler' ? 'Zähler' : 'Zahl';
    if (g.einheit) art += ` (${g.einheit})`;
  }
  return `${art} · ${haeufigkeitText(g.haeufigkeit)}`;
}

function anzahlText(n, einzahl, mehrzahl) {
  return `${n} ${n === 1 ? einzahl : mehrzahl}`;
}


/* ---------- 2. Bausteine für die Formulare ---------- */

// Runde Farbtupfer zum Auswählen
function farbAuswahl(aktuell) {
  return `<div class="farb-auswahl">${KONFIG.farben.map(f => `
    <label class="farb-punkt" style="--kat: var(--farbe-${f.id})" title="${esc(f.name)}">
      <input type="radio" name="farbe" value="${f.id}" ${f.id === aktuell ? 'checked' : ''} aria-label="${esc(f.name)}">
      <span></span>
    </label>`).join('')}</div>`;
}

// Raster mit allen Icons zum Auswählen
function iconAuswahl(aktuell) {
  // Falls ein Icon nicht (mehr) in der Liste steht, trotzdem anbieten
  const liste = KONFIG.icons.includes(aktuell) ? KONFIG.icons : [aktuell, ...KONFIG.icons];
  return `<div class="icon-auswahl">${liste.map(name => `
    <label class="icon-option" title="${esc(name)}">
      <input type="radio" name="icon" value="${esc(name)}" ${name === aktuell ? 'checked' : ''} aria-label="${esc(name)}">
      <span class="icon-feld">${icon(name)}</span>
    </label>`).join('')}</div>`;
}

// "Löschen" und "Speichern" unten im Formular
function formularKnoepfe(mitLoeschen) {
  return `
    <div class="formular-knoepfe">
      ${mitLoeschen ? `<button type="button" class="knopf gefahr" data-loeschen>${icon('trash-2')}<span>Löschen</span></button>` : ''}
      <button type="submit" class="knopf">${icon('check')}<span>Speichern</span></button>
    </div>`;
}

// Zeigt eine Fehlermeldung im Formular an
function formularFehler(form, text) {
  const el = form.querySelector('.fehler');
  el.textContent = text;
  el.hidden = false;
}

// Seite nach einer Änderung neu aufbauen
function gewohnheitenNeuZeichnen() {
  Navigation.zeigen();
}


/* ---------- 3. Formular "Kategorie" ---------- */
function kategorieFormular(id) {
  const vorhanden = id ? Daten.kategorie(id) : null;
  const k = vorhanden || { name: '', farbe: KONFIG.farben[0].id, icon: 'star', ausgeblendet: false };
  const anzahl = vorhanden ? Daten.gewohnheitenVon(id).length : 0;

  const dialog = Dialog.oeffnen(vorhanden ? 'Kategorie bearbeiten' : 'Neue Kategorie', `
    <form class="formular" style="--kat: var(--farbe-${k.farbe})" novalidate>
      <label class="feld">
        <span class="feld-titel">Name</span>
        <input class="eingabe" name="titel" maxlength="40" value="${esc(k.name)}" placeholder="z. B. Musik" autocomplete="off">
      </label>
      <div class="feld"><span class="feld-titel">Farbe</span>${farbAuswahl(k.farbe)}</div>
      <div class="feld"><span class="feld-titel">Icon</span>${iconAuswahl(k.icon)}</div>
      ${schalter('ausgeblendet', 'Ausblenden', 'Die Kategorie erscheint dann nicht mehr bei „Heute“. Deine Einträge bleiben erhalten.', k.ausgeblendet)}
      <p class="fehler" hidden></p>
      ${formularKnoepfe(!!vorhanden)}
    </form>`);

  const form = dialog.querySelector('form');
  const felder = form.elements;

  // Farbe gewählt → Icons sofort in der neuen Farbe zeigen
  form.addEventListener('change', e => {
    if (e.target.name === 'farbe') form.style.setProperty('--kat', `var(--farbe-${e.target.value})`);
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = felder.titel.value.trim();
    if (!name) return formularFehler(form, 'Bitte gib einen Namen ein.');
    Daten.kategorieSpeichern({
      id: vorhanden ? vorhanden.id : null,
      name,
      farbe: felder.farbe.value,
      icon: felder.icon.value,
      ausgeblendet: felder.ausgeblendet.checked
    });
    Dialog.schliessen();
    gewohnheitenNeuZeichnen();
    meldung(vorhanden ? 'Gespeichert' : 'Kategorie angelegt');
  });

  const loeschen = form.querySelector('[data-loeschen]');
  if (loeschen) loeschen.addEventListener('click', async () => {
    const text = anzahl
      ? `„${k.name}“ und ${anzahlText(anzahl, 'Gewohnheit', 'Gewohnheiten')} darin werden mit allen Einträgen gelöscht. Das lässt sich nicht rückgängig machen. Tipp: „Ausblenden“ behält deine Einträge.`
      : `„${k.name}“ wird gelöscht.`;
    if (await bestaetigen(text)) {
      Daten.kategorieLoeschen(id);
      Dialog.schliessen();
      gewohnheitenNeuZeichnen();
      meldung('Gelöscht');
    }
  });
}


/* ---------- 4. Formular "Gewohnheit" ---------- */
function gewohnheitFormular(id, kategorieId) {
  const vorhanden = id ? Daten.gewohnheit(id) : null;
  const g = vorhanden || Daten.gewohnheitVorlage({
    kategorieId,
    icon: (Daten.kategorie(kategorieId) || {}).icon || 'check'
  });
  const h = g.haeufigkeit;
  const farbeVon = katId => (Daten.kategorie(katId) || {}).farbe || KONFIG.farben[0].id;

  const kategorieOptionen = Daten.zustand.kategorien.map(k =>
    `<option value="${k.id}" ${k.id === g.kategorieId ? 'selected' : ''}>${esc(k.name)}</option>`).join('');

  const tagKnoepfe = Datum.wochenReihenfolge().map(tag => `
    <label class="tag-chip">
      <input type="checkbox" name="tage" value="${tag}" ${h.tage.includes(tag) ? 'checked' : ''}>
      <span>${Datum.WOCHENTAGE_KURZ[tag]}</span>
    </label>`).join('');

  const dialog = Dialog.oeffnen(vorhanden ? 'Gewohnheit bearbeiten' : 'Neue Gewohnheit', `
    <form class="formular" style="--kat: var(--farbe-${farbeVon(g.kategorieId)})" novalidate>
      <label class="feld">
        <span class="feld-titel">Name</span>
        <input class="eingabe" name="titel" maxlength="50" value="${esc(g.name)}" placeholder="z. B. Gitarre üben" autocomplete="off">
      </label>

      <label class="feld">
        <span class="feld-titel">Kategorie</span>
        <select class="eingabe" name="kategorie">${kategorieOptionen}</select>
      </label>

      <div class="feld"><span class="feld-titel">Icon</span>${iconAuswahl(g.icon)}</div>

      <div class="feld">
        <span class="feld-titel">Art</span>
        ${radioGruppe('typ', [
          { wert: 'janein', text: 'Abhaken', icon: 'check' },
          { wert: 'zaehler', text: 'Zähler', icon: 'circle-plus' },
          { wert: 'zahl', text: 'Zahl', icon: 'hash' }
        ], g.typ)}
        <small class="hinweis" data-hinweis></small>
      </div>

      <div class="feld">
        <span class="feld-titel">Ziel der Gewohnheit</span>
        ${radioGruppe('richtung', [
          { wert: 'positiv', text: 'Mache ich', icon: 'thumbs-up' },
          { wert: 'negativ', text: 'Vermeide ich', icon: 'ban' }
        ], g.richtung)}
      </div>

      <div class="feld-reihe" data-nur="ziel">
        <label class="feld">
          <span class="feld-titel" data-ziel-titel>Tagesziel</span>
          <input class="eingabe" name="ziel" inputmode="decimal" autocomplete="off"
                 value="${g.ziel != null ? esc(String(g.ziel).replace('.', ',')) : ''}" placeholder="optional">
        </label>
        <label class="feld">
          <span class="feld-titel">Einheit</span>
          <input class="eingabe" name="einheit" maxlength="15" autocomplete="off" value="${esc(g.einheit)}" placeholder="z. B. Min">
        </label>
      </div>

      <div class="feld">
        <span class="feld-titel">Wie oft?</span>
        ${radioGruppe('haeufigkeit', [
          { wert: 'taeglich', text: 'Täglich' },
          { wert: 'wochentage', text: 'Wochentage' },
          { wert: 'proWoche', text: 'Pro Woche' }
        ], h.art)}
        <div class="wochentage" data-nur="wochentage">${tagKnoepfe}</div>
        <label class="anzahl-zeile" data-nur="proWoche">
          <input class="eingabe" type="number" name="anzahl" min="1" max="7" inputmode="numeric" value="${h.anzahl}">
          <span>mal pro Woche</span>
        </label>
      </div>

      ${schalter('ausgeblendet', 'Ausblenden', 'Erscheint dann nicht mehr bei „Heute“. Deine Einträge bleiben erhalten.', g.ausgeblendet)}
      <p class="fehler" hidden></p>
      ${formularKnoepfe(!!vorhanden)}
    </form>`);

  const form = dialog.querySelector('form');
  const felder = form.elements;

  // Blendet je nach Auswahl die passenden Felder ein und aus
  function aktualisieren() {
    const typ = felder.typ.value;
    const negativ = felder.richtung.value === 'negativ';
    const art = felder.haeufigkeit.value;

    form.querySelectorAll('[data-nur]').forEach(el => {
      const nur = el.dataset.nur;
      el.hidden = nur === 'ziel' ? typ === 'janein' : nur !== art;
    });
    form.querySelector('[data-ziel-titel]').textContent = negativ ? 'Höchstens' : 'Tagesziel';

    const hinweise = {
      janein: negativ ? 'Abhaken, wenn du es heute vermieden hast.' : 'Einfach abhaken, wenn du es gemacht hast.',
      zaehler: 'Mit + und − hochzählen, z. B. Gläser Wasser.',
      zahl: 'Eine Zahl eintragen, z. B. Minuten oder Schritte.'
    };
    let hinweis = hinweise[typ];
    if (typ !== 'janein' && negativ) hinweis += ' Geschafft, solange du nicht über dem Höchstwert liegst.';
    form.querySelector('[data-hinweis]').textContent = hinweis;
  }

  form.addEventListener('change', e => {
    if (e.target.name === 'kategorie') {
      form.style.setProperty('--kat', `var(--farbe-${farbeVon(e.target.value)})`);
    }
    aktualisieren();
  });
  aktualisieren();

  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = felder.titel.value.trim();
    const typ = felder.typ.value;
    const richtung = felder.richtung.value;
    const art = felder.haeufigkeit.value;
    const ziel = typ === 'janein' ? null : zahlLesen(felder.ziel.value);
    const tage = [...form.querySelectorAll('input[name="tage"]:checked')].map(el => Number(el.value));
    const anzahl = parseInt(felder.anzahl.value, 10);

    // Eingaben prüfen
    if (!name) return formularFehler(form, 'Bitte gib einen Namen ein.');
    if (typ !== 'janein' && felder.ziel.value.trim() && ziel === null) {
      return formularFehler(form, 'Das Ziel muss eine Zahl sein, z. B. 8 oder 2,5.');
    }
    if (ziel !== null && (ziel < 0 || (ziel === 0 && richtung === 'positiv'))) {
      return formularFehler(form, 'Das Ziel muss größer als 0 sein.');
    }
    if (art === 'wochentage' && tage.length === 0) {
      return formularFehler(form, 'Bitte wähle mindestens einen Wochentag.');
    }
    if (art === 'proWoche' && !(anzahl >= 1 && anzahl <= 7)) {
      return formularFehler(form, 'Bitte gib bei „Pro Woche“ eine Zahl von 1 bis 7 ein.');
    }

    Daten.gewohnheitSpeichern({
      ...g,
      id: vorhanden ? vorhanden.id : null,
      name,
      kategorieId: felder.kategorie.value,
      icon: felder.icon.value,
      typ,
      richtung,
      ziel,
      einheit: typ === 'janein' ? '' : felder.einheit.value.trim(),
      haeufigkeit: {
        art,
        tage: art === 'wochentage' ? tage : h.tage,
        anzahl: art === 'proWoche' ? anzahl : h.anzahl
      },
      ausgeblendet: felder.ausgeblendet.checked
    });
    Dialog.schliessen();
    gewohnheitenNeuZeichnen();
    meldung(vorhanden ? 'Gespeichert' : 'Gewohnheit angelegt');
  });

  const loeschen = form.querySelector('[data-loeschen]');
  if (loeschen) loeschen.addEventListener('click', async () => {
    const text = `„${g.name}“ wird mit allen Einträgen gelöscht. Das lässt sich nicht rückgängig machen. Tipp: „Ausblenden“ behält deine Einträge.`;
    if (await bestaetigen(text)) {
      Daten.gewohnheitLoeschen(id);
      Dialog.schliessen();
      gewohnheitenNeuZeichnen();
      meldung('Gelöscht');
    }
  });
}


/* ---------- 5. Die Seite selbst ---------- */

// Eine Zeile für eine Gewohnheit
function gewohnheitZeile(g) {
  return `
    <li class="gewohnheit-zeile ${g.ausgeblendet ? 'ist-ausgeblendet' : ''}" data-id="${g.id}">
      <span class="griff" aria-hidden="true">${icon('grip-vertical')}</span>
      <button type="button" class="zeilen-knopf" data-aktion="gewohnheit-bearbeiten" data-id="${g.id}">
        <span class="icon-feld klein">${icon(g.icon)}</span>
        <span class="titel-text">
          <strong>${esc(g.name)}</strong>
          <small>${esc(gewohnheitBeschreibung(g))}</small>
        </span>
        ${g.ausgeblendet ? `<span class="ausgeblendet-zeichen" title="Ausgeblendet">${icon('eye-off')}</span>` : ''}
      </button>
    </li>`;
}

// Eine Karte für eine Kategorie (mit ihren Gewohnheiten)
function kategorieKarte(k) {
  const gewohnheiten = Daten.gewohnheitenVon(k.id);
  const info = anzahlText(gewohnheiten.length, 'Gewohnheit', 'Gewohnheiten') + (k.ausgeblendet ? ' · ausgeblendet' : '');
  return `
    <section class="karte kategorie ${k.ausgeblendet ? 'ist-ausgeblendet' : ''}" data-id="${k.id}" style="--kat: var(--farbe-${k.farbe})">
      <div class="kategorie-kopf">
        <span class="griff" aria-hidden="true">${icon('grip-vertical')}</span>
        <button type="button" class="zeilen-knopf" data-aktion="kategorie-bearbeiten" data-id="${k.id}">
          <span class="icon-feld">${icon(k.icon)}</span>
          <span class="titel-text"><strong>${esc(k.name)}</strong><small>${info}</small></span>
          <span class="bearbeiten-zeichen">${icon('pencil')}</span>
        </button>
      </div>
      <ul class="gewohnheit-liste" data-kategorie="${k.id}">
        ${gewohnheiten.map(gewohnheitZeile).join('')}
      </ul>
      <button type="button" class="neue-gewohnheit" data-aktion="neue-gewohnheit" data-kategorie="${k.id}">
        ${icon('plus')}<span>Gewohnheit hinzufügen</span>
      </button>
    </section>`;
}

Seiten.gewohnheiten = {
  titel: 'Gewohnheiten',

  anzeigen(bereich) {
    const { kategorien, gewohnheiten } = Daten.zustand;
    const untertitel = `${anzahlText(kategorien.length, 'Kategorie', 'Kategorien')} · ${anzahlText(gewohnheiten.length, 'Gewohnheit', 'Gewohnheiten')}`;

    bereich.innerHTML = `
      ${seitenKopf('Gewohnheiten', untertitel)}
      <p class="seiten-hinweis">${icon('info')}<span>Tippe auf etwas, um es zu bearbeiten. Halte den Griff ${icon('grip-vertical')} gedrückt und ziehe, um zu sortieren.</span></p>
      ${kategorien.length ? '' : platzhalter('folder-plus', 'Noch keine Kategorien', 'Lege deine erste Kategorie an.')}
      <div class="kategorie-liste">${kategorien.map(kategorieKarte).join('')}</div>
      <button type="button" class="knopf gestrichelt breit" data-aktion="neue-kategorie">${icon('folder-plus')}<span>Neue Kategorie</span></button>`;

    // Klicks auf der Seite verarbeiten ("onclick =" ersetzt den alten Zuhörer beim Neuaufbau)
    bereich.onclick = e => {
      const el = e.target.closest('[data-aktion]');
      if (!el) return;
      const aktion = el.dataset.aktion;
      if (aktion === 'neue-kategorie') kategorieFormular(null);
      if (aktion === 'kategorie-bearbeiten') kategorieFormular(el.dataset.id);
      if (aktion === 'neue-gewohnheit') gewohnheitFormular(null, el.dataset.kategorie);
      if (aktion === 'gewohnheit-bearbeiten') gewohnheitFormular(el.dataset.id);
    };

    this.sortierbarMachen(bereich);
  },

  // Drag & Drop mit der Hilfs-Bibliothek SortableJS
  sortierbarMachen(bereich) {
    if (!window.Sortable) return; // ohne Internet: Sortieren nicht verfügbar
    const optionen = {
      animation: 180,
      forceFallback: true,   // eigenes Ziehen statt Browser-Drag&Drop: verhält sich überall gleich
      fallbackTolerance: 3,  // erst ab 3 Pixeln Bewegung gilt es als Ziehen
      ghostClass: 'zieh-geist',
      chosenClass: 'zieh-gewaehlt',
      onEnd: () => this.reihenfolgeSpeichern(bereich)
    };

    // Kategorien untereinander verschieben
    Sortable.create(bereich.querySelector('.kategorie-liste'), { ...optionen, handle: '.kategorie-kopf .griff' });

    // Gewohnheiten verschieben – auch in eine andere Kategorie
    bereich.querySelectorAll('.gewohnheit-liste').forEach(liste => {
      Sortable.create(liste, { ...optionen, handle: '.griff', group: 'gewohnheiten' });
    });
  },

  // Liest die neue Reihenfolge aus der Seite und speichert sie
  reihenfolgeSpeichern(bereich) {
    const kategorienIds = [...bereich.querySelectorAll('.kategorie-liste > .kategorie')].map(el => el.dataset.id);
    const zuordnung = [...bereich.querySelectorAll('.gewohnheit-liste')].flatMap(liste =>
      [...liste.children].map(zeile => ({ id: zeile.dataset.id, kategorieId: liste.dataset.kategorie })));
    Daten.reihenfolgeUebernehmen(kategorienIds, zuordnung);
    gewohnheitenNeuZeichnen(); // Anzahl pro Kategorie aktualisieren
  }
};
