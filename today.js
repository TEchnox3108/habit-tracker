/* =========================================================
   today.js – Die Seite "Heute"

   Zeigt alle Gewohnheiten, die am gewählten Tag dran sind,
   gruppiert nach Kategorie. Hier wird abgehakt, gezählt und
   eingetragen. Mit den Pfeilen oben geht es zu früheren Tagen
   (zum Nachtragen) – in die Zukunft geht es nicht.

   Aufbau:
   1. Welcher Tag & welche Gewohnheiten
   2. Bausteine (Kopf, Zeilen)
   3. Seite anzeigen
   4. Bedienung (Tippen, Zählen, Eintragen, Notizen)
   ========================================================= */

const Heute = {
  datum: Datum.heute(),  // welcher Tag gerade angezeigt wird
  bereich: null,         // der Seitenbereich (wird beim Anzeigen gesetzt)

  /* ---------- 1. Welcher Tag & welche Gewohnheiten ---------- */

  // Schlüssel des angezeigten Tages, z. B. "2026-10-25"
  get tag() {
    return Datum.schluessel(this.datum);
  },

  istHeute() {
    return this.tag === Datum.schluessel(Datum.heute());
  },

  // Alle fälligen Gewohnheiten des Tages, nach Kategorie gruppiert
  gruppen() {
    return Daten.zustand.kategorien
      .filter(k => !k.ausgeblendet)
      .map(k => ({
        kategorie: k,
        gewohnheiten: Daten.gewohnheitenVon(k.id).filter(g => Daten.istFaellig(g, this.datum))
      }))
      .filter(gruppe => gruppe.gewohnheiten.length > 0);
  },

  // Überschrift: "Heute", "Gestern", "Vorgestern" oder der Wochentag
  ueberschrift() {
    const tageZurueck = Math.round((Datum.heute() - this.datum) / 86400000);
    if (tageZurueck === 0) return 'Heute';
    if (tageZurueck === 1) return 'Gestern';
    if (tageZurueck === 2) return 'Vorgestern';
    return this.datum.toLocaleDateString('de-DE', { weekday: 'long' });
  },


  /* ---------- 2. Bausteine ---------- */

  kopfHtml() {
    return `
      <header class="seiten-kopf heute-kopf">
        <div>
          <h1>${this.ueberschrift()}</h1>
          <p>${Datum.lang(this.datum)}</p>
        </div>
        <div class="tag-wechsel">
          <button type="button" class="icon-knopf" data-aktion="tag-zurueck" aria-label="Einen Tag zurück">${icon('chevron-left')}</button>
          <span class="icon-knopf datum-wahl" role="button" tabindex="0" data-aktion="datum-waehlen" aria-label="Datum wählen">
            ${icon('calendar-days')}
            <input type="date" name="datum" tabindex="-1" aria-hidden="true"
                   value="${this.tag}" max="${Datum.schluessel(Datum.heute())}">
          </span>
          <button type="button" class="icon-knopf" data-aktion="tag-vor" aria-label="Einen Tag vor" ${this.istHeute() ? 'disabled' : ''}>${icon('chevron-right')}</button>
        </div>
      </header>
      ${this.istHeute() ? '' : `
        <button type="button" class="nachtragen-hinweis" data-aktion="tag-heute">
          ${icon('history')}<span>Du trägst für einen vergangenen Tag nach.</span><strong>Zu heute</strong>
        </button>`}`;
  },

  // Eine Zeile für eine Gewohnheit – je nach Art mit Haken, Zähler oder Zahlenfeld
  zeileHtml(g) {
    const tag = this.tag;
    const w = Daten.wert(tag, g.id);
    const erledigt = Daten.istErledigt(g, tag);
    const notiz = (Daten.eintrag(tag, g.id) || {}).notiz || '';
    const einheit = g.einheit ? ' ' + esc(g.einheit) : '';
    const negativ = g.richtung === 'negativ';

    // Kleine Info-Zeile unter dem Namen
    const info = [];
    if (g.typ === 'zaehler') {
      if (g.ziel == null) info.push(`${zahl(w ?? 0)}${einheit}`);
      else info.push(`${zahl(w ?? 0)} ${negativ ? 'von max.' : '/'} ${zahl(g.ziel)}${einheit}`);
    }
    if (g.typ === 'zahl') {
      if (g.ziel != null) info.push(`${negativ ? 'Höchstens' : 'Ziel:'} ${zahl(g.ziel)}${einheit}`);
      else if (g.einheit) info.push(`in ${esc(g.einheit)}`);
    }
    if (g.typ === 'janein' && negativ) info.push('Vermeiden');
    if (g.haeufigkeit.art === 'proWoche') {
      info.push(`${Daten.wochenErledigt(g, this.datum)} von ${g.haeufigkeit.anzahl} diese Woche`);
    }

    // Bedienelement rechts
    let steuerung;
    if (g.typ === 'janein') {
      steuerung = `
        <button type="button" class="haken ${erledigt ? 'an' : ''}" data-aktion="umschalten"
                aria-pressed="${erledigt}" aria-label="${esc(g.name)} ${negativ ? 'vermieden' : 'erledigt'}">${icon('check')}</button>`;
    } else if (g.typ === 'zaehler') {
      steuerung = `
        <div class="zaehler">
          <button type="button" class="zaehler-knopf" data-aktion="minus" aria-label="Weniger" ${w > 0 ? '' : 'disabled'}>${icon('minus')}</button>
          <span class="zaehler-wert" aria-live="polite">${zahl(w ?? 0)}</span>
          <button type="button" class="zaehler-knopf" data-aktion="plus" aria-label="Mehr">${icon('plus')}</button>
        </div>`;
    } else {
      steuerung = `
        <input class="eingabe zahl-feld" data-aktion="zahl" inputmode="decimal" enterkeyhint="done" autocomplete="off"
               value="${w != null ? zahl(w) : ''}" placeholder="–" aria-label="${esc(g.name)}">`;
    }

    // Dünner Fortschrittsbalken bei Zielen wie "8 Gläser"
    const balken = g.typ !== 'janein' && !negativ && g.ziel
      ? `<span class="zeilen-balken" style="--anteil: ${Math.min((w || 0) / g.ziel, 1)}"></span>` : '';

    // Bei "Abhaken" ist die ganze Zeile antippbar
    const haupt = g.typ === 'janein'
      ? `<button type="button" class="heute-haupt" data-aktion="umschalten" tabindex="-1">`
      : `<div class="heute-haupt">`;

    return `
      <li class="heute-zeile ${erledigt ? 'erledigt' : ''}" data-id="${g.id}">
        ${haupt}
          <span class="icon-feld">${icon(g.icon)}</span>
          <span class="titel-text">
            <strong>${esc(g.name)}</strong>
            ${info.length ? `<small>${info.join(' · ')}</small>` : ''}
            ${notiz ? `<small class="notiz-vorschau">${esc(notiz)}</small>` : ''}
          </span>
        ${g.typ === 'janein' ? '</button>' : '</div>'}
        <button type="button" class="icon-knopf notiz-knopf ${notiz ? 'hat-notiz' : ''}" data-aktion="notiz"
                aria-label="Notiz">${icon('notebook-pen')}</button>
        ${steuerung}
        ${balken}
      </li>`;
  },

  gruppeHtml({ kategorie, gewohnheiten }) {
    return `
      <section class="heute-gruppe" data-kategorie="${kategorie.id}" style="--kat: var(--farbe-${kategorie.farbe})">
        <h2 class="gruppen-kopf">
          <span class="icon-feld mini">${icon(kategorie.icon)}</span>
          <span>${esc(kategorie.name)}</span>
          <span class="gruppen-zahl"></span>
        </h2>
        <ul class="karte heute-liste">${gewohnheiten.map(g => this.zeileHtml(g)).join('')}</ul>
      </section>`;
  },


  /* ---------- 3. Seite anzeigen ---------- */
  anzeigen(bereich) {
    this.bereich = bereich;
    const gruppen = this.gruppen();

    bereich.innerHTML = `
      ${this.kopfHtml()}
      <section class="karte ring-karte">
        ${fortschrittsRing(0)}
        <div>
          <h2 class="karten-titel" data-ring-titel></h2>
          <p class="karten-text" data-ring-text></p>
        </div>
      </section>
      ${gruppen.length
        ? gruppen.map(gruppe => this.gruppeHtml(gruppe)).join('')
        : `<section class="karte leer">
             <span class="icon-feld gross">${icon('coffee')}</span>
             <h2 class="karten-titel">Nichts geplant</h2>
             <p>An diesem Tag ist keine Gewohnheit dran. Unter „Gewohnheiten“ kannst du welche anlegen oder einblenden.</p>
             <a class="knopf zweit" href="#gewohnheiten">${icon('list-checks')}<span>Zu den Gewohnheiten</span></a>
           </section>`}`;

    this.zusammenfassungAktualisieren();

    bereich.onclick = e => this.klick(e);
    bereich.onchange = e => this.aenderung(e);
    bereich.onkeydown = e => {
      // Enter im Zahlenfeld = fertig
      if (e.key === 'Enter' && e.target.matches('[data-aktion="zahl"]')) e.target.blur();
    };
  },

  // Ring, "3 von 8 erledigt" und die Zahlen bei den Kategorien neu berechnen
  zusammenfassungAktualisieren() {
    const tag = this.tag;
    const alle = [];

    this.bereich.querySelectorAll('.heute-gruppe').forEach(gruppe => {
      const liste = [...gruppe.querySelectorAll('.heute-zeile')].map(z => Daten.gewohnheit(z.dataset.id));
      const geschafft = liste.filter(g => Daten.istErledigt(g, tag)).length;
      gruppe.querySelector('.gruppen-zahl').textContent = `${geschafft}/${liste.length}`;
      alle.push(...liste);
    });

    const anzahl = alle.length;
    const geschafft = alle.filter(g => Daten.istErledigt(g, tag)).length;
    const prozent = anzahl ? alle.reduce((summe, g) => summe + Daten.fortschritt(g, tag), 0) / anzahl * 100 : 0;
    ringSetzen(this.bereich.querySelector('.ring'), prozent);

    let titel = 'Los geht’s!';
    if (anzahl === 0) titel = 'Freier Tag';
    else if (geschafft === anzahl) titel = 'Alles geschafft!';
    else if (prozent >= 50) titel = 'Weiter so!';
    else if (prozent > 0) titel = 'Guter Anfang';
    this.bereich.querySelector('[data-ring-titel]').textContent = titel;
    this.bereich.querySelector('[data-ring-text]').textContent = anzahl
      ? `${geschafft} von ${anzahl} ${anzahl === 1 ? 'Gewohnheit' : 'Gewohnheiten'} erledigt`
      : 'Heute ist nichts geplant.';
  },

  // Eine einzelne Zeile neu zeichnen (statt der ganzen Seite – so bleiben Animationen flüssig)
  zeileNeu(gewohnheitId) {
    const alt = this.bereich.querySelector(`.heute-zeile[data-id="${gewohnheitId}"]`);
    if (!alt) return;
    const warErledigt = alt.classList.contains('erledigt');

    const vorlage = document.createElement('template');
    vorlage.innerHTML = this.zeileHtml(Daten.gewohnheit(gewohnheitId)).trim();
    const neu = vorlage.content.firstElementChild;
    alt.replaceWith(neu);
    iconsZeichnen();

    // Gerade geschafft? → kleines "Plopp" (und am Handy ein kurzes Vibrieren)
    if (!warErledigt && neu.classList.contains('erledigt')) {
      neu.classList.add('plopp');
      if (navigator.vibrate) navigator.vibrate(12);
    }
    this.zusammenfassungAktualisieren();
  },

  // Zu einem anderen Tag wechseln (nie in die Zukunft)
  tagSetzen(datum) {
    this.datum = datum > Datum.heute() ? Datum.heute() : datum;
    Navigation.zeigen();
  },


  /* ---------- 4. Bedienung ---------- */
  klick(e) {
    const el = e.target.closest('[data-aktion]');
    if (!el) return;
    const aktion = el.dataset.aktion;
    const zeile = el.closest('.heute-zeile');
    const id = zeile ? zeile.dataset.id : null;
    const w = id ? Daten.wert(this.tag, id) : null;

    switch (aktion) {
      case 'tag-zurueck': this.tagSetzen(Datum.plusTage(this.datum, -1)); break;
      case 'tag-vor':     this.tagSetzen(Datum.plusTage(this.datum, 1)); break;
      case 'tag-heute':   this.tagSetzen(Datum.heute()); break;
      case 'datum-waehlen': {
        const feld = el.querySelector('input[type="date"]');
        try { feld.showPicker(); } catch (fehler) { feld.focus(); }
        break;
      }
      case 'umschalten':
        Daten.wertSetzen(this.tag, id, w >= 1 ? null : 1);
        this.zeileNeu(id);
        break;
      case 'plus':
        Daten.wertSetzen(this.tag, id, (w ?? 0) + 1);
        this.zeileNeu(id);
        break;
      case 'minus':
        Daten.wertSetzen(this.tag, id, Math.max(0, (w ?? 0) - 1));
        this.zeileNeu(id);
        break;
      case 'notiz':
        this.notizOeffnen(id);
        break;
    }
  },

  aenderung(e) {
    const feld = e.target;

    // Datum im Kalender gewählt
    if (feld.name === 'datum' && feld.value) {
      this.tagSetzen(Datum.ausSchluessel(feld.value));
      return;
    }

    // Zahl eingetragen
    if (feld.matches('[data-aktion="zahl"]')) {
      const id = feld.closest('.heute-zeile').dataset.id;
      const text = feld.value.trim();
      const wert = zahlLesen(text);
      if (text && (wert === null || wert < 0)) {
        meldung('Bitte eine Zahl eingeben, z. B. 45 oder 2,5');
        this.zeileNeu(id); // alten Wert wieder anzeigen
        return;
      }
      Daten.wertSetzen(this.tag, id, wert);
      this.zeileNeu(id);
    }
  },

  // Notiz für diesen Tag schreiben oder ändern
  notizOeffnen(id) {
    const g = Daten.gewohnheit(id);
    const tag = this.tag;
    const alt = (Daten.eintrag(tag, id) || {}).notiz || '';

    const dialog = Dialog.oeffnen('Notiz', `
      <form class="formular" novalidate>
        <p class="karten-text">${esc(g.name)} · ${Datum.kurz(this.datum)}</p>
        <textarea class="eingabe textfeld" name="notiz" rows="4" maxlength="500"
                  placeholder="Wie lief es? Was ist dir aufgefallen?">${esc(alt)}</textarea>
        ${formularKnoepfe(!!alt)}
      </form>`);
    const form = dialog.querySelector('form');

    form.addEventListener('submit', e => {
      e.preventDefault();
      Daten.notizSetzen(tag, id, form.elements.notiz.value.trim());
      Dialog.schliessen();
      this.zeileNeu(id);
    });
    const loeschen = form.querySelector('[data-loeschen]');
    if (loeschen) loeschen.addEventListener('click', () => {
      Daten.notizSetzen(tag, id, '');
      Dialog.schliessen();
      this.zeileNeu(id);
      meldung('Notiz gelöscht');
    });
  }
};

// Als Seite anmelden
Seiten.heute = {
  titel: 'Heute',
  anzeigen: bereich => Heute.anzeigen(bereich)
};

// Wenn die App über Mitternacht offen bleibt: beim Zurückkommen auf den neuen Tag springen
let zuletztHeute = Datum.schluessel(Datum.heute());
document.addEventListener('visibilitychange', () => {
  const jetzt = Datum.schluessel(Datum.heute());
  if (document.visibilityState !== 'visible' || jetzt === zuletztHeute) return;
  if (Heute.tag === zuletztHeute) Heute.datum = Datum.heute();
  zuletztHeute = jetzt;
  Navigation.zeigen();
});
