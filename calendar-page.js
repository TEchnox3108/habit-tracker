/* =========================================================
   calendar-page.js – Seite "Kalender"

   Aufbau der Seite (von oben nach unten):
   - Titel (z. B. „November 2026“) + Knopf „+“ für das Formular
   - Quick-Add-Feld: Satz eintippen → Enter → Vorschau → Enter = eintragen
   - Umschalter Tag | Woche | Monat | Jahr
   - Blätter-Leiste: ‹ Heute ›
   - die gewählte Ansicht

   Damit das Eingabefeld beim Blättern nicht den Fokus verliert,
   wird nur der untere Teil (ansichtNeu) neu aufgebaut, nicht die
   ganze Seite.

   Detailansicht und Formular stehen in calendar-forms.js.
   ========================================================= */

const Kalender = {
  bereichWahl: 'kalender',   // 'kalender' | 'anstehend' | 'projekte'
  anstehendTage: 60,         // so viele Tage zeigt „Anstehend“ (wird mit „Weitere“ größer)
  ansicht: 'monat',          // 'tag' | 'woche' | 'monat' | 'jahr'
  datum: Datum.heute(),      // Tag, um den sich die Ansicht dreht
  vorschau: null,            // Quick-Add: { satz, e } (Ergebnis von QuickAdd.parse)
  bereich: null,             // <section> der Seite
  neuId: null,               // zuletzt angelegter Termin (kurz hervorheben)
  uhr: null,                 // Zeitgeber für die „Jetzt“-Linie
  scrollMerken: null,        // Scroll-Position im Stundenraster beim Neuzeichnen
  STUNDE: 48,                // Höhe einer Stunde im Raster (Pixel)

  MONATE: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli',
    'August', 'September', 'Oktober', 'November', 'Dezember'],
  WOCHENTAGE: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],


  /* ---------- Kleine Helfer ---------- */

  key(d) { return Datum.schluessel(d); },
  istHeute(d) { return this.key(d) === this.key(Datum.heute()); },
  monatsAnfang(d) { return new Date(d.getFullYear(), d.getMonth(), 1); },

  // Kalenderwoche nach ISO (Montag = Wochenbeginn)
  kw(d) {
    const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const tagNr = t.getUTCDay() || 7;
    t.setUTCDate(t.getUTCDate() + 4 - tagNr);
    const jahrAnfang = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
    return Math.ceil(((t - jahrAnfang) / 86400000 + 1) / 7);
  },

  // Farbe eines Kalenders als CSS-Zuweisung für --kat
  farbe(kalender) {
    return `--kat: var(--farbe-${kalender ? kalender.farbe : 'salbei'})`;
  },

  // „14:30 – 15:30“ oder „ganztägig“ für ein Vorkommen an einem bestimmten Tag
  zeitText(v, tag = v.datum) {
    if (v.ganztaegig) return 'ganztägig';
    const beginntHeute = v.datum === tag;
    const endetHeute = v.endDatum === tag;
    if (beginntHeute && endetHeute) return `${v.start} – ${v.ende}`;
    if (beginntHeute) return `ab ${v.start}`;
    if (endetHeute) return `bis ${v.ende}`;
    return 'ganztägig';
  },

  // Alle Vorkommen, die einen Tag berühren (auch mehrtägige)
  vorkommenAm(liste, tag) {
    return liste.filter(v => v.datum <= tag && v.endDatum >= tag);
  },


  /* =========================================================
     Seite aufbauen
     ========================================================= */
  anzeigen(bereich) {
    this.bereich = bereich;
    bereich.innerHTML = `
      <header class="seiten-kopf kal-kopf">
        <h1 data-titel></h1>
        <div class="kal-kopf-knoepfe">
          <button type="button" class="icon-knopf" data-aktion="suche" aria-label="Suchen" title="Suchen">${icon('search')}</button>
          <button type="button" class="icon-knopf" data-aktion="kalender-verwalten" aria-label="Kalender verwalten" title="Kalender verwalten">${icon('layers')}</button>
          <button type="button" class="icon-knopf kal-plus" data-aktion="neu" aria-label="Neu" title="Neu">${icon('plus')}</button>
        </div>
      </header>

      <form class="kal-schnell" data-schnell autocomplete="off">
        <span class="kal-schnell-icon">${icon('sparkles')}</span>
        <input class="eingabe" name="satz" enterkeyhint="done" maxlength="200"
               placeholder="z. B. Zahnarzt morgen 14:30 1h" aria-label="Termin mit einem Satz eintragen">
      </form>
      <div data-vorschau></div>

      ${auswahlGruppe('bereich', [
        { wert: 'kalender', text: 'Kalender', icon: 'calendar-days' },
        { wert: 'anstehend', text: 'Anstehend', icon: 'list' },
        { wert: 'projekte', text: 'Projekte', icon: 'folder-kanban' }
      ], this.bereichWahl)}

      <div class="kal-ansichten" data-nur-kalender>
        ${auswahlGruppe('ansicht', [
          { wert: 'tag', text: 'Tag' },
          { wert: 'woche', text: 'Woche' },
          { wert: 'monat', text: 'Monat' },
          { wert: 'jahr', text: 'Jahr' }
        ], this.ansicht)}
      </div>

      <div class="kal-leiste" data-nur-kalender>
        <span class="kal-leiste-text" data-leiste></span>
        <div class="kal-blaettern">
          <button type="button" class="icon-knopf" data-aktion="zurueck" aria-label="Zurück">${icon('chevron-left')}</button>
          <button type="button" class="knopf zweit klein" data-aktion="heute">Heute</button>
          <button type="button" class="icon-knopf" data-aktion="vor" aria-label="Weiter">${icon('chevron-right')}</button>
        </div>
      </div>

      <div class="kal-ansicht" data-ansicht></div>`;

    // Klicks auf der ganzen Seite (bleibt bestehen, deshalb onclick statt addEventListener)
    bereich.onclick = e => this.klick(e);

    // Quick Add: Enter zeigt die Vorschau, zweites Enter trägt ein
    const form = bereich.querySelector('[data-schnell]');
    const feld = form.elements.satz;
    form.onsubmit = e => {
      e.preventDefault();
      const satz = feld.value.trim();
      if (!satz) return;
      if (this.vorschau && this.vorschau.satz === satz) this.quickAddSpeichern();
      else this.vorschauSetzen(satz);
    };
    // Während eine Vorschau offen ist, ändert sie sich beim Weitertippen mit
    feld.oninput = () => {
      if (!this.vorschau) return;
      const satz = feld.value.trim();
      if (satz) this.vorschauSetzen(satz);
      else this.vorschauWeg();
    };
    feld.onkeydown = e => {
      if (e.key === 'Escape' && this.vorschau) { e.preventDefault(); this.vorschauWeg(); }
    };
    if (this.vorschau) feld.value = this.vorschau.satz;

    this.tastaturEinrichten();
    this.vorschauZeichnen();
    this.ansichtNeu();
  },

  // Baut nur Titel, Leiste und Ansicht neu auf (z. B. nach dem Blättern)
  ansichtNeu(richtung = 0) {
    const b = this.bereich;
    if (!b || !b.isConnected) return;

    // Scroll-Position im Stundenraster merken – nur wenn die Ansicht gleich bleibt
    // (z. B. nach dem Speichern). Neue Ansicht/Blättern → zur Uhrzeit springen.
    const scroll = b.querySelector('[data-scroll]');
    const gleicheAnsicht = this._letzteAnsicht === this.ansicht;
    this.scrollMerken = scroll && !richtung && gleicheAnsicht ? scroll.scrollTop : null;
    this._letzteAnsicht = this.ansicht;

    clearInterval(this.uhr);
    const ansicht = b.querySelector('[data-ansicht]');
    const imKalender = this.bereichWahl === 'kalender';
    let inhalt;
    if (this.bereichWahl === 'anstehend') inhalt = this.anstehendHtml();
    else if (this.bereichWahl === 'projekte') inhalt = Projekte.listeHtml();
    else {
      inhalt = {
        tag: () => this.tagHtml(),
        woche: () => this.wocheHtml(),
        monat: () => this.monatHtml(),
        jahr: () => this.jahrHtml()
      }[this.ansicht]();
    }

    ansicht.innerHTML = inhalt;
    ansicht.className = 'kal-ansicht' + (richtung > 0 ? ' kal-rein-vor' : richtung < 0 ? ' kal-rein-zurueck' : '');

    b.querySelector('[data-titel]').textContent = this.titelText();
    b.querySelector('[data-leiste]').textContent = imKalender ? this.leisteText() : '';
    b.querySelectorAll('[data-nur-kalender]').forEach(el => { el.hidden = !imKalender; });
    const knopfMarkieren = (gruppe, wert) => {
      b.querySelectorAll(`[data-name="${gruppe}"] .auswahl-knopf`).forEach(k => {
        const aktiv = k.dataset.wert === wert;
        k.classList.toggle('aktiv', aktiv);
        k.setAttribute('aria-pressed', aktiv);
      });
    };
    knopfMarkieren('ansicht', this.ansicht);
    knopfMarkieren('bereich', this.bereichWahl);
    const plus = b.querySelector('[data-aktion="neu"]');
    plus.setAttribute('aria-label', this.bereichWahl === 'projekte' ? 'Neues Projekt' : 'Neuer Termin');
    plus.title = plus.getAttribute('aria-label');

    if (imKalender && (this.ansicht === 'tag' || this.ansicht === 'woche')) this.rasterEinrichten();
    if (imKalender) this.wischenEinrichten(ansicht);
    else { ansicht.ontouchstart = null; ansicht.ontouchend = null; }
    iconsZeichnen();

    // Neu angelegten Termin/Projekt kurz hervorheben
    if (this.neuId) {
      b.querySelectorAll(`[data-termin="${this.neuId}"], [data-projekt="${this.neuId}"]`).forEach(el => el.classList.add('kal-neu'));
      this.neuId = null;
    }
  },

  // Nach dem Anlegen/Ändern eines Projekts: Projekt-Übersicht zeigen und es hervorheben
  projektGezeigt(p) {
    if (Navigation.aktuelle !== 'kalender') return;
    this.bereichWahl = 'projekte';
    this.neuId = p.id;
    this.ansichtNeu();
  },

  /* Termine + Projekt-Deadlines eines Zeitraums in einer Liste.
     Deadlines sehen aus wie ganztägige Termine, haben aber „deadline: true“. */
  alleVorkommen(von, bis) {
    const deadlines = KalenderDaten.deadlines(von, bis).map(d => ({
      deadline: true,
      projekt: d.projekt,
      schluessel: 'p@' + d.projekt.id,
      termin: { id: d.projekt.id, titel: d.projekt.titel, wiederholung: { art: 'keine' }, ort: '' },
      datum: d.datum,
      endDatum: d.datum,
      ganztaegig: true,
      start: null,
      ende: null,
      kalender: d.kalender
    }));
    return [...deadlines, ...KalenderDaten.vorkommen(von, bis)].sort((a, b) =>
      a.datum.localeCompare(b.datum) || (b.ganztaegig - a.ganztaegig)
      || String(a.start).localeCompare(String(b.start)));
  },

  // Klick-Ziel eines Eintrags: Termin (mit Tag) oder Projekt
  zielAttr(v) {
    return v.deadline ? `data-projekt="${v.projekt.id}"` : `data-termin="${v.termin.id}" data-am="${v.datum}"`;
  },


  /* =========================================================
     Liste „Anstehend“: alles Kommende chronologisch
     ========================================================= */
  anstehendHtml() {
    const heute = this.key(Datum.heute());
    const bis = KalenderDaten.plusTage(heute, this.anstehendTage - 1);
    const liste = this.alleVorkommen(heute, bis).filter(v => v.endDatum >= heute);

    // Nach Tagen gruppieren (schon laufende mehrtägige Termine erscheinen unter „Heute“)
    const tage = new Map();
    liste.forEach(v => {
      const tag = v.datum < heute ? heute : v.datum;
      if (!tage.has(tag)) tage.set(tag, []);
      tage.get(tag).push(v);
    });

    // Überfällige Projekte ganz oben
    const ueberfaellig = KalenderDaten.bereich.projekte
      .filter(p => !p.erledigt && p.deadline && p.deadline < heute && KalenderDaten.istSichtbar(p));
    const ueberfaelligHtml = ueberfaellig.length ? `
      <section class="karte kal-tagesliste kal-warnung">
        <h2 class="kal-tagkopf">Überfällige Projekte</h2>
        <div class="kal-zeilen">${ueberfaellig.map(p => this.zeileHtml(this.alleVorkommenProjekt(p), p.deadline)).join('')}</div>
      </section>` : '';

    const morgen = KalenderDaten.plusTage(heute, 1);
    const gruppen = [...tage.keys()].sort().map(tag => {
      const d = Datum.ausSchluessel(tag);
      const name = tag === heute ? 'Heute' : tag === morgen ? 'Morgen' : this.WOCHENTAGE[d.getDay()];
      return `
        <div class="kal-tag-gruppe">
          <h2 class="kal-tagkopf"><span>${name}</span><small>${Datum.kurz(d)}</small></h2>
          <div class="kal-zeilen">${tage.get(tag).map(v => this.zeileHtml(v, tag)).join('')}</div>
        </div>`;
    }).join('');

    const ende = Datum.kurz(Datum.ausSchluessel(bis));
    return `
      ${ueberfaelligHtml}
      ${gruppen ? `<section class="karte kal-anstehend">${gruppen}</section>`
        : platzhalter('calendar-check', 'Nichts geplant', `Bis zum ${ende} stehen keine Termine an.`)}
      <div class="kal-mehr-laden">
        <small>Zeigt alles bis ${ende}</small>
        <button type="button" class="knopf zweit klein" data-aktion="mehr-laden">${icon('chevrons-down')}<span>Weitere 60 Tage</span></button>
      </div>`;
  },

  // Ein Projekt als Listen-Eintrag (für „Überfällig“)
  alleVorkommenProjekt(p) {
    return {
      deadline: true, projekt: p, termin: { id: p.id, titel: p.titel, wiederholung: { art: 'keine' }, ort: '' },
      datum: p.deadline, endDatum: p.deadline, ganztaegig: true, kalender: KalenderDaten.kalenderVon(p)
    };
  },

  // Von außen aufrufen, wenn sich Daten geändert haben
  neuZeichnen() {
    if (Navigation.aktuelle === 'kalender') this.ansichtNeu();
  },

  titelText() {
    const d = this.datum;
    if (this.bereichWahl === 'anstehend') return 'Anstehend';
    if (this.bereichWahl === 'projekte') return 'Projekte';
    if (this.ansicht === 'jahr') return String(d.getFullYear());
    if (this.ansicht === 'woche') {
      const tage = Datum.wocheVon(d);
      const a = tage[0], z = tage[6];
      if (a.getMonth() === z.getMonth()) return `${this.MONATE[a.getMonth()]} ${a.getFullYear()}`;
      const kurz = m => QuickAdd.MONATE_ANZEIGE[m];
      return a.getFullYear() === z.getFullYear()
        ? `${kurz(a.getMonth())} – ${kurz(z.getMonth())} ${z.getFullYear()}`
        : `${kurz(a.getMonth())} ${a.getFullYear()} – ${kurz(z.getMonth())} ${z.getFullYear()}`;
    }
    return `${this.MONATE[d.getMonth()]} ${d.getFullYear()}`;
  },

  leisteText() {
    const d = this.datum;
    if (this.ansicht === 'tag') {
      return `${this.WOCHENTAGE[d.getDay()]}, ${Datum.kurz(d)}${this.istHeute(d) ? ' · Heute' : ''}`;
    }
    if (this.ansicht === 'woche') {
      const tage = Datum.wocheVon(d);
      return `KW ${this.kw(tage[0])} · ${Datum.kurz(tage[0]).slice(0, 6)} – ${Datum.kurz(tage[6])}`;
    }
    if (this.ansicht === 'monat') {
      const von = this.key(this.monatsAnfang(d));
      const bis = this.key(new Date(d.getFullYear(), d.getMonth() + 1, 0));
      const n = this.alleVorkommen(von, bis).length;
      return n === 0 ? 'Keine Termine' : n === 1 ? '1 Termin' : `${n} Termine`;
    }
    return '';
  },


  /* =========================================================
     Monatsansicht
     ========================================================= */
  monatHtml() {
    const d = this.datum;
    const anfang = this.monatsAnfang(d);
    // Erster angezeigter Tag = Wochenbeginn vor dem 1.
    const erster = Datum.wocheVon(anfang)[0];
    const letzterImMonat = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    const wochen = Math.ceil((Math.round((letzterImMonat - erster) / 86400000) + 1) / 7);
    const tage = Array.from({ length: wochen * 7 }, (_, i) => Datum.plusTage(erster, i));
    const liste = this.alleVorkommen(this.key(tage[0]), this.key(tage[tage.length - 1]));
    const gewaehlt = this.key(d);

    const kopf = Datum.wochenReihenfolge().map(t => `<span>${Datum.WOCHENTAGE_KURZ[t]}</span>`).join('');
    const zellen = tage.map(tag => {
      const k = this.key(tag);
      const am = this.vorkommenAm(liste, k);
      const klassen = ['kal-tag'];
      if (tag.getMonth() !== d.getMonth()) klassen.push('anders');
      if (this.istHeute(tag)) klassen.push('heute');
      if (k === gewaehlt) klassen.push('gewaehlt');
      // Handy: farbige Punkte · Laptop: kurze Einträge
      const punkte = am.slice(0, 4).map(v => `<i style="${this.farbe(v.kalender)}"></i>`).join('');
      const eintraege = am.slice(0, 3).map(v => `
        <span class="kal-kurz ${v.ganztaegig ? 'ganz' : ''}" style="${this.farbe(v.kalender)}" ${this.zielAttr(v)}>
          ${v.deadline ? icon('flag') : v.ganztaegig ? '' : `<b>${v.datum === k ? v.start : ''}</b>`}${esc(v.termin.titel)}
        </span>`).join('');
      const mehr = am.length > 3 ? `<span class="kal-mehr">+${am.length - 3} weitere</span>` : '';
      return `
        <button type="button" class="${klassen.join(' ')}" data-tag="${k}"
                aria-label="${Datum.lang(tag)}${am.length ? `, ${am.length} Termin${am.length > 1 ? 'e' : ''}` : ''}">
          <span class="kal-tag-nr">${tag.getDate()}</span>
          <span class="kal-punkte">${punkte}</span>
          <span class="kal-eintraege">${eintraege}${mehr}</span>
        </button>`;
    }).join('');

    return `
      <div class="kal-monat">
        <div class="kal-wochenkopf">${kopf}</div>
        <div class="kal-tage">${zellen}</div>
      </div>
      ${this.tageslisteHtml(d)}`;
  },

  // Liste der Termine eines Tages (unter dem Monat)
  tageslisteHtml(tag) {
    const k = this.key(tag);
    const liste = this.vorkommenAm(this.alleVorkommen(k, k), k);
    const zeilen = liste.map(v => this.zeileHtml(v, k)).join('');
    return `
      <section class="karte kal-tagesliste">
        <h2 class="karten-titel">${this.WOCHENTAGE[tag.getDay()]}, ${Datum.kurz(tag)}${this.istHeute(tag) ? ' · Heute' : ''}</h2>
        ${zeilen ? `<div class="kal-zeilen">${zeilen}</div>`
          : `<p class="karten-text">Keine Termine. Schreib oben einen Satz oder tippe auf „+“.</p>`}
      </section>`;
  },

  // Eine Termin-Zeile (Liste)
  zeileHtml(v, tag) {
    if (v.deadline) {
      // Projekt-Deadline
      const p = v.projekt;
      return `
        <button type="button" class="kal-zeile" style="${this.farbe(v.kalender)}" data-projekt="${p.id}">
          <span class="kal-strich"></span>
          <span class="titel-text">
            <strong>${esc(p.titel)}</strong>
            <small>Deadline · ${esc(Projekte.frist(p).text)} · ${KalenderDaten.projektFortschritt(p)} %</small>
          </span>
          <span class="kal-zeile-icon">${icon('flag')}</span>
        </button>`;
    }
    const t = v.termin;
    const unter = [this.zeitText(v, tag)];
    if (t.wiederholung.art !== 'keine') unter.push(QuickAdd.wiederholungText(t.wiederholung));
    if (t.ort) unter.push(t.ort);
    return `
      <button type="button" class="kal-zeile" style="${this.farbe(v.kalender)}"
              data-termin="${t.id}" data-am="${v.datum}">
        <span class="kal-strich"></span>
        <span class="titel-text">
          <strong>${esc(t.titel)}</strong>
          <small>${esc(unter.join(' · '))}</small>
        </span>
        ${t.wiederholung.art !== 'keine' ? `<span class="kal-zeile-icon">${icon('repeat')}</span>` : ''}
      </button>`;
  },


  /* =========================================================
     Jahresansicht: 12 kleine Monate
     ========================================================= */
  jahrHtml() {
    const jahr = this.datum.getFullYear();
    const liste = this.alleVorkommen(`${jahr}-01-01`, `${jahr}-12-31`);
    // Welche Tage haben Termine? (mehrtägige: jeder Tag)
    const belegt = new Set();
    liste.forEach(v => {
      for (let k = v.datum; k <= v.endDatum; k = KalenderDaten.plusTage(k, 1)) belegt.add(k);
    });
    const heute = Datum.heute();
    const kopf = Datum.wochenReihenfolge().map(t => `<span>${Datum.WOCHENTAGE_KURZ[t].charAt(0)}</span>`).join('');

    const monate = this.MONATE.map((name, m) => {
      const anfang = new Date(jahr, m, 1);
      const leer = Datum.wocheVon(anfang).findIndex(t => t.getDate() === 1 && t.getMonth() === m);
      const anzahl = new Date(jahr, m + 1, 0).getDate();
      let zellen = '<span></span>'.repeat(leer);
      for (let t = 1; t <= anzahl; t++) {
        const k = this.key(new Date(jahr, m, t));
        const klassen = [];
        if (belegt.has(k)) klassen.push('hat');
        if (jahr === heute.getFullYear() && m === heute.getMonth() && t === heute.getDate()) klassen.push('heute');
        zellen += `<span class="${klassen.join(' ')}">${t}</span>`;
      }
      const aktuell = jahr === heute.getFullYear() && m === heute.getMonth();
      return `
        <button type="button" class="kal-minimonat ${aktuell ? 'aktuell' : ''}" data-monat="${m}">
          <span class="kal-minimonat-name">${name}</span>
          <span class="kal-minikopf">${kopf}</span>
          <span class="kal-minitage">${zellen}</span>
        </button>`;
    }).join('');
    return `<div class="kal-jahr">${monate}</div>`;
  },


  /* =========================================================
     Woche & Tag: Stundenraster
     ========================================================= */
  wocheHtml() {
    return this.rasterHtml(Datum.wocheVon(this.datum), true);
  },

  tagHtml() {
    // Oben ein Wochenstreifen wie am iPhone, darunter das Raster eines Tages
    const woche = Datum.wocheVon(this.datum);
    const liste = this.alleVorkommen(this.key(woche[0]), this.key(woche[6]));
    const streifen = woche.map(tag => {
      const k = this.key(tag);
      const klassen = ['kal-streifen-tag'];
      if (this.istHeute(tag)) klassen.push('heute');
      if (k === this.key(this.datum)) klassen.push('gewaehlt');
      const hat = this.vorkommenAm(liste, k).length > 0;
      return `
        <button type="button" class="${klassen.join(' ')}" data-tag="${k}" aria-label="${Datum.lang(tag)}">
          <small>${Datum.WOCHENTAGE_KURZ[tag.getDay()]}</small>
          <span>${tag.getDate()}</span>
          <i class="${hat ? 'an' : ''}"></i>
        </button>`;
    }).join('');
    return `<div class="kal-streifen">${streifen}</div>${this.rasterHtml([this.datum], false)}`;
  },

  /* Ordnet überlappende Termine nebeneinander an.
     Jeder Termin bekommt „spalte“ (0, 1, 2 …) und „spalten“ (wie viele nebeneinander). */
  anordnen(stuecke) {
    const sortiert = [...stuecke].sort((a, b) => a.von - b.von || b.bis - a.bis);
    let gruppe = [];
    let gruppenEnde = -1;
    const abschliessen = () => {
      const spaltenEnde = []; // wann ist welche Spalte wieder frei?
      gruppe.forEach(s => {
        let i = spaltenEnde.findIndex(ende => ende <= s.von);
        if (i < 0) { i = spaltenEnde.length; spaltenEnde.push(0); }
        spaltenEnde[i] = s.bis;
        s.spalte = i;
      });
      gruppe.forEach(s => { s.spalten = spaltenEnde.length; });
    };
    sortiert.forEach(s => {
      if (gruppe.length && s.von >= gruppenEnde) { abschliessen(); gruppe = []; gruppenEnde = -1; }
      gruppe.push(s);
      gruppenEnde = Math.max(gruppenEnde, s.bis);
    });
    if (gruppe.length) abschliessen();
    return sortiert;
  },

  rasterHtml(tage, mitKopf) {
    const von = this.key(tage[0]);
    const bis = this.key(tage[tage.length - 1]);
    const liste = this.alleVorkommen(von, bis);
    const H = this.STUNDE;

    // Kopfzeile mit Wochentagen (nur Woche)
    const kopf = mitKopf ? `
      <div class="kal-raster-kopf">
        <span></span>
        ${tage.map(tag => `
          <button type="button" class="kal-spaltenkopf ${this.istHeute(tag) ? 'heute' : ''}" data-tag-oeffnen="${this.key(tag)}">
            <small>${Datum.WOCHENTAGE_KURZ[tag.getDay()]}</small><span>${tag.getDate()}</span>
          </button>`).join('')}
      </div>` : '';

    // Leiste für ganztägige Termine
    let ganzAnzahl = 0;
    const ganz = tage.map(tag => {
      const k = this.key(tag);
      const am = this.vorkommenAm(liste, k).filter(v => v.ganztaegig);
      ganzAnzahl += am.length;
      return `<div class="kal-ganz-zelle">${am.map(v => `
        <button type="button" class="kal-ganz-termin ${v.deadline ? 'deadline' : ''}" style="${this.farbe(v.kalender)}" ${this.zielAttr(v)}>
          ${v.deadline ? icon('flag') : ''}${esc(v.termin.titel)}
        </button>`).join('')}</div>`;
    }).join('');

    // Spalten mit Terminen
    const spalten = tage.map(tag => {
      const k = this.key(tag);
      const stuecke = this.vorkommenAm(liste, k).filter(v => !v.ganztaegig).map(v => {
        const anfang = v.datum === k ? KalenderDaten.minuten(v.start) : 0;
        let ende = v.endDatum === k ? KalenderDaten.minuten(v.ende) : 1440;
        if (ende <= anfang) ende = anfang + 15;
        return { v, von: anfang, bis: ende };
      });
      const termine = this.anordnen(stuecke).map(s => {
        const hoehe = Math.max((s.bis - s.von) / 60 * H, 20);
        const breite = 100 / s.spalten;
        const kurz = hoehe < 36;
        return `
          <button type="button" class="kal-termin ${kurz ? 'kurz' : ''}" style="${this.farbe(s.v.kalender)};
                  top:${s.von / 60 * H}px; height:${hoehe - 2}px;
                  left:calc(${s.spalte * breite}% + 1px); width:calc(${breite}% - 3px)"
                  data-termin="${s.v.termin.id}" data-am="${s.v.datum}">
            <strong>${esc(s.v.termin.titel)}</strong>
            <small>${esc(this.zeitText(s.v, k))}</small>
          </button>`;
      }).join('');
      return `<div class="kal-spalte ${this.istHeute(tag) ? 'heute' : ''}" data-spalte="${k}">${termine}</div>`;
    }).join('');

    const stunden = Array.from({ length: 23 }, (_, i) =>
      `<span style="top:${(i + 1) * H}px">${String(i + 1).padStart(2, '0')}:00</span>`).join('');

    return `
      <div class="kal-raster ${tage.length > 1 ? 'woche' : 'einzeltag'}" style="--spalten:${tage.length}; --kal-stunde:${H}px">
        ${kopf}
        <div class="kal-ganz ${ganzAnzahl ? '' : 'leer'}">
          <span class="kal-ganz-name">ganztägig</span>${ganz}
        </div>
        <div class="kal-scroll" data-scroll>
          <div class="kal-raster-innen" style="height:${24 * H}px">
            <div class="kal-stunden">${stunden}</div>
            ${spalten}
          </div>
        </div>
      </div>`;
  },

  // Nach dem Zeichnen: an die richtige Stelle scrollen + „Jetzt“-Linie
  rasterEinrichten() {
    const scroll = this.bereich.querySelector('[data-scroll]');
    if (!scroll) return;
    const jetztZeichnen = () => {
      if (!scroll.isConnected) { clearInterval(this.uhr); return; }
      scroll.querySelectorAll('.kal-jetzt, .kal-jetzt-zeit').forEach(el => el.remove());
      const heute = scroll.querySelector(`[data-spalte="${this.key(Datum.heute())}"]`);
      if (!heute) return;
      const n = new Date();
      const min = n.getHours() * 60 + n.getMinutes();
      const top = min / 60 * this.STUNDE;
      heute.insertAdjacentHTML('beforeend', `<div class="kal-jetzt" style="top:${top}px"></div>`);
      scroll.querySelector('.kal-stunden').insertAdjacentHTML('beforeend',
        `<span class="kal-jetzt-zeit" style="top:${top}px">${KalenderDaten.zeitText(min)}</span>`);
    };
    jetztZeichnen();
    this.uhr = setInterval(jetztZeichnen, 30000);

    if (this.scrollMerken !== null) {
      scroll.scrollTop = this.scrollMerken;
    } else {
      // Heute sichtbar → zur aktuellen Uhrzeit, sonst zu 7 Uhr
      const n = new Date();
      const ziel = scroll.querySelector('.kal-jetzt') ? (n.getHours() - 1.5) : 7;
      scroll.scrollTop = Math.max(0, ziel * this.STUNDE);
    }
  },


  /* =========================================================
     Blättern, Wischen, Tastatur
     ========================================================= */
  blaettern(richtung) {
    const d = this.datum;
    if (this.ansicht === 'tag') this.datum = Datum.plusTage(d, richtung);
    else if (this.ansicht === 'woche') this.datum = Datum.plusTage(d, 7 * richtung);
    else if (this.ansicht === 'jahr') this.datum = new Date(d.getFullYear() + richtung, d.getMonth(), 1);
    else {
      // Monat: der 1. – oder heute, wenn man im aktuellen Monat landet
      const neu = new Date(d.getFullYear(), d.getMonth() + richtung, 1);
      const heute = Datum.heute();
      this.datum = neu.getMonth() === heute.getMonth() && neu.getFullYear() === heute.getFullYear() ? heute : neu;
    }
    this.ansichtNeu(richtung);
  },

  zuHeute() {
    const vorher = this.key(this.datum);
    this.datum = Datum.heute();
    this.ansichtNeu(this.key(this.datum) < vorher ? -1 : this.key(this.datum) > vorher ? 1 : 0);
  },

  // Am Handy: nach links/rechts wischen = blättern
  wischenEinrichten(el) {
    let start = null;
    el.ontouchstart = e => {
      if (e.touches.length !== 1) { start = null; return; }
      start = { x: e.touches[0].clientX, y: e.touches[0].clientY, zeit: Date.now() };
    };
    el.ontouchend = e => {
      if (!start) return;
      const dx = e.changedTouches[0].clientX - start.x;
      const dy = e.changedTouches[0].clientY - start.y;
      const schnell = Date.now() - start.zeit < 600;
      start = null;
      if (schnell && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.8) this.blaettern(dx < 0 ? 1 : -1);
    };
  },

  // Am Laptop: ← → blättern, T = heute (nur wenn kein Eingabefeld aktiv ist)
  tastaturEinrichten() {
    if (this._tastatur) return;
    this._tastatur = true;
    document.addEventListener('keydown', e => {
      if (Navigation.aktuelle !== 'kalender' || e.ctrlKey || e.metaKey || e.altKey) return;
      if (document.querySelector('dialog[open]')) return;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) return;
      if (e.key === 'ArrowLeft') this.blaettern(-1);
      else if (e.key === 'ArrowRight') this.blaettern(1);
      else if (e.key === 't' || e.key === 'T') this.zuHeute();
    });
  },


  /* =========================================================
     Quick Add
     ========================================================= */
  vorschauSetzen(satz) {
    this.vorschau = { satz, e: QuickAdd.parse(satz) };
    this.vorschauZeichnen();
  },

  vorschauWeg() {
    this.vorschau = null;
    this.vorschauZeichnen();
  },

  vorschauZeichnen() {
    const platz = this.bereich && this.bereich.querySelector('[data-vorschau]');
    if (!platz) return;
    if (!this.vorschau) { platz.innerHTML = ''; return; }
    const e = this.vorschau.e;
    const vorhanden = e.kategorie ? KalenderDaten.kalenderNachName(e.kategorie) : KalenderDaten.kalenderVon({});
    const kalName = vorhanden ? vorhanden.name : e.kategorie.charAt(0).toUpperCase() + e.kategorie.slice(1);
    const hinweise = [vorhanden ? `Kalender: ${kalName}` : `neuer Kalender „${kalName}“`];
    if (e.ort) hinweise.push(`Ort: ${e.ort}`);
    hinweise.push(...e.annahmen);
    platz.innerHTML = `
      <div class="kal-vorschau" style="${this.farbe(vorhanden)}" role="status">
        <span class="kal-strich"></span>
        <span class="kal-vorschau-text">
          <small>${e.art === 'projekt' ? 'Neues Projekt' : 'Neuer Termin'}</small>
          <strong>${esc(e.titel)}</strong>
          <span>${esc(QuickAdd.wannText(e))}</span>
          <small class="kal-vorschau-hinweis">${esc(hinweise.join(' · '))}</small>
        </span>
        <span class="kal-vorschau-knoepfe">
          <button type="button" class="knopf klein" data-aktion="qa-ok">${icon('corner-down-left')}<span>Eintragen</span></button>
          <span class="kal-vorschau-neben">
            ${e.art === 'termin' ? `<button type="button" class="icon-knopf" data-aktion="qa-anpassen" aria-label="Im Formular anpassen" title="Im Formular anpassen">${icon('pencil')}</button>` : ''}
            <button type="button" class="icon-knopf" data-aktion="qa-weg" aria-label="Verwerfen" title="Verwerfen">${icon('x')}</button>
          </span>
        </span>
      </div>`;
    iconsZeichnen();
  },

  quickAddSpeichern() {
    if (!this.vorschau) return;
    const { art, eintrag } = KalenderDaten.ausQuickAdd(this.vorschau.e);
    this.vorschau = null;
    const feld = this.bereich.querySelector('[data-schnell] input');
    feld.value = '';
    this.vorschauZeichnen();
    if (art === 'projekt') {
      meldung(`Projekt „${eintrag.titel}“ angelegt`);
      this.projektGezeigt(eintrag);
      return;
    }
    meldung(`Eingetragen: ${eintrag.titel}`);
    this.springeZu(eintrag);
  },

  // Zeigt den Tag eines Termins (z. B. nach dem Anlegen) und hebt ihn hervor
  springeZu(termin, tag = termin.datum) {
    // In „Anstehend“ bleiben (dort taucht der Termin in der Liste auf), aus „Projekte“ zum Kalender
    if (this.bereichWahl === 'anstehend') {
      this.neuId = termin.id;
      return this.ansichtNeu();
    }
    this.bereichWahl = 'kalender';
    const vorher = this.key(this.datum);
    this.datum = Datum.ausSchluessel(tag);
    if (this.ansicht === 'jahr') this.ansicht = 'monat';
    this.neuId = termin.id;
    this.scrollMerken = null;
    this.ansichtNeu(tag < vorher ? -1 : tag > vorher ? 1 : 0);
    // Im Stundenraster zum Termin scrollen
    const el = this.bereich.querySelector(`.kal-termin[data-termin="${termin.id}"]`);
    const scroll = this.bereich.querySelector('[data-scroll]');
    if (el && scroll) scroll.scrollTop = Math.max(0, el.offsetTop - this.STUNDE);
  },


  /* =========================================================
     Klicks
     ========================================================= */
  klick(e) {
    const ziel = e.target;

    const knopfAnsicht = ziel.closest('[data-name="ansicht"] .auswahl-knopf');
    if (knopfAnsicht) {
      this.ansicht = knopfAnsicht.dataset.wert;
      this.scrollMerken = null;
      this.ansichtNeu();
      return;
    }

    // Kalender | Anstehend | Projekte
    const knopfBereich = ziel.closest('[data-name="bereich"] .auswahl-knopf');
    if (knopfBereich) {
      this.bereichWahl = knopfBereich.dataset.wert;
      this._letzteAnsicht = null;
      this.ansichtNeu();
      return;
    }

    const aktion = ziel.closest('[data-aktion]');
    if (aktion) {
      switch (aktion.dataset.aktion) {
        case 'zurueck': return this.blaettern(-1);
        case 'vor': return this.blaettern(1);
        case 'heute': return this.zuHeute();
        case 'neu':
          if (this.bereichWahl === 'projekte') return ProjektFormular.oeffnen();
          return TerminFormular.oeffnen({ werte: { datum: this.key(this.datum) } });
        case 'projekt-neu': return ProjektFormular.oeffnen();
        case 'suche': return KalenderSuche.oeffnen();
        case 'kalender-verwalten': return KalenderVerwaltung.oeffnen();
        case 'mehr-laden':
          this.anstehendTage += 60;
          return this.ansichtNeu();
        case 'qa-ok': return this.quickAddSpeichern();
        case 'qa-weg': {
          this.vorschauWeg();
          const feld = this.bereich.querySelector('[data-schnell] input');
          feld.value = '';
          return feld.focus();
        }
        case 'qa-anpassen': {
          const q = this.vorschau.e;
          const k = q.kategorie ? KalenderDaten.kalenderNachName(q.kategorie) : null;
          return TerminFormular.oeffnen({
            werte: { ...q, kalenderId: k ? k.id : undefined, neuerKalender: !k && q.kategorie ? q.kategorie : null },
            ausQuickAdd: true
          });
        }
      }
      return;
    }

    // Termin/Projekt angeklickt → Detailansicht
    // (im Monat am Laptop zählt ein Klick auf einen kurzen Eintrag als Klick auf den Tag)
    const termin = ziel.closest('[data-termin], [data-projekt]');
    if (termin && !termin.classList.contains('kal-kurz')) {
      if (termin.dataset.projekt) return ProjektDetail.oeffnen(termin.dataset.projekt);
      return TerminDetail.oeffnen(termin.dataset.termin, termin.dataset.am);
    }

    // Monat: Tag antippen = auswählen, nochmal antippen = Tagesansicht
    const tagKnopf = ziel.closest('.kal-tag');
    if (tagKnopf) {
      const k = tagKnopf.dataset.tag;
      if (k === this.key(this.datum)) {
        this.ansicht = 'tag';
        this.scrollMerken = null;
        this.ansichtNeu();
      } else {
        const vorher = this.key(this.datum);
        const gleicherMonat = k.slice(0, 7) === vorher.slice(0, 7);
        this.datum = Datum.ausSchluessel(k);
        this.ansichtNeu(gleicherMonat ? 0 : k < vorher ? -1 : 1);
      }
      return;
    }

    // Tag im Wochenstreifen (Tagesansicht)
    const streifenTag = ziel.closest('.kal-streifen-tag');
    if (streifenTag) {
      this.datum = Datum.ausSchluessel(streifenTag.dataset.tag);
      this.ansichtNeu();
      return;
    }

    // Wochenansicht: Tag im Kopf antippen → Tagesansicht
    const spaltenKopf = ziel.closest('[data-tag-oeffnen]');
    if (spaltenKopf) {
      this.datum = Datum.ausSchluessel(spaltenKopf.dataset.tagOeffnen);
      this.ansicht = 'tag';
      this.scrollMerken = null;
      this.ansichtNeu();
      return;
    }

    // Jahr: Monat antippen → Monatsansicht
    const minimonat = ziel.closest('[data-monat]');
    if (minimonat) {
      const m = Number(minimonat.dataset.monat);
      const heute = Datum.heute();
      const jahr = this.datum.getFullYear();
      this.datum = jahr === heute.getFullYear() && m === heute.getMonth() ? heute : new Date(jahr, m, 1);
      this.ansicht = 'monat';
      this.ansichtNeu();
      return;
    }

    // Leere Stelle im Stundenraster antippen → neuer Termin zu dieser Uhrzeit
    const spalte = ziel.closest('.kal-spalte');
    if (spalte && ziel === spalte) {
      const rect = spalte.getBoundingClientRect();
      const min = Math.floor((e.clientY - rect.top) / this.STUNDE * 2) * 30; // auf halbe Stunden
      const start = Math.min(min, 23 * 60);
      TerminFormular.oeffnen({
        werte: {
          datum: spalte.dataset.spalte, ganztaegig: false,
          start: KalenderDaten.zeitText(start), ende: KalenderDaten.zeitText(Math.min(start + 60, 1439))
        }
      });
    }
  }
};

Seiten.kalender = {
  titel: 'Kalender',
  anzeigen: bereich => Kalender.anzeigen(bereich)
};
