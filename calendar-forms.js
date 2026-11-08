/* =========================================================
   calendar-forms.js – Kalender: Detailansicht & Formular

   TerminDetail.oeffnen(id, tag)   – Fenster mit allen Infos zu einem Termin
                                     (Bearbeiten, Duplizieren, Löschen)
   TerminFormular.oeffnen({...})   – Formular zum Anlegen/Ändern
   auswahlFrage(text, optionen)    – Rückfrage mit mehreren Antworten
                                     (z. B. „Nur dieser Termin“ / „Alle“)

   „tag“ ist bei wiederkehrenden Terminen der Tag, auf den man
   getippt hat (eine Serie hat ja viele Tage).
   ========================================================= */

/* ---------- Rückfrage mit mehreren Antworten ----------
   optionen: [{ wert, text, gefahr }] – ergibt den gewählten Wert oder null */
function auswahlFrage(text, optionen) {
  return new Promise(fertig => {
    const d = document.createElement('dialog');
    d.className = 'blatt klein';
    d.innerHTML = `
      <div class="blatt-inhalt bestaetigung">
        <p>${esc(text)}</p>
        <div class="kal-frage-knoepfe">
          ${optionen.map(o => `<button type="button" class="knopf ${o.gefahr ? 'warnung' : ''} breit" data-antwort="${esc(o.wert)}">${esc(o.text)}</button>`).join('')}
          <button type="button" class="knopf zweit breit" data-antwort="">Abbrechen</button>
        </div>
      </div>`;
    document.body.appendChild(d);
    let beantwortet = false;
    const antworten = wert => {
      if (beantwortet) return;
      beantwortet = true;
      if (d.open) d.close();
      d.remove();
      fertig(wert || null);
    };
    d.addEventListener('click', e => {
      const knopf = e.target.closest('[data-antwort]');
      if (knopf) antworten(knopf.dataset.antwort);
      else if (e.target === d) antworten(null);
    });
    d.addEventListener('close', () => antworten(null));
    d.showModal();
  });
}


/* ---------- Auswahl des Kalenders (farbige Knöpfe) ----------
   neuerKalender: Name eines #Tags, für den es noch keinen Kalender gibt */
function kalenderWahlHtml(kalId, neuerKalender = null) {
  const knoepfe = KalenderDaten.kalenderListe().map(k => `
    <label class="kal-wahl" style="--kat: var(--farbe-${k.farbe})">
      <input type="radio" name="kalender" value="${k.id}" ${k.id === kalId && !neuerKalender ? 'checked' : ''}>
      <span><i></i>${esc(k.name)}</span>
    </label>`).join('');
  const neu = neuerKalender ? `
    <label class="kal-wahl" style="--kat: var(--text-3)">
      <input type="radio" name="kalender" value="__neu__" checked>
      <span><i></i>Neu: ${esc(neuerKalender)}</span>
    </label>` : '';
  return `<div class="kal-kalenderwahl">${knoepfe}${neu}</div>`;
}


/* =========================================================
   Suche über alle Termine und Projekte
   ========================================================= */
const KalenderSuche = {
  text: '',

  oeffnen() {
    const dialog = Dialog.oeffnen('Suchen', `
      <div class="kal-suche">
        <div class="kal-schnell">
          <span class="kal-schnell-icon">${icon('search')}</span>
          <input class="eingabe" type="search" name="suche" value="${esc(this.text)}"
                 placeholder="Titel, Ort, Notiz oder Kalender" autocomplete="off" aria-label="Suchen">
        </div>
        <div data-treffer></div>
      </div>`);
    const feld = dialog.querySelector('[name="suche"]');
    feld.oninput = () => { this.text = feld.value; this.trefferZeichnen(dialog); };
    this.trefferZeichnen(dialog);
    feld.focus();
    feld.select();

    dialog.querySelector('[data-treffer]').onclick = e => {
      const t = e.target.closest('[data-termin]');
      if (t) return TerminDetail.oeffnen(t.dataset.termin, t.dataset.am);
      const p = e.target.closest('[data-projekt]');
      if (p) ProjektDetail.oeffnen(p.dataset.projekt);
    };
  },

  trefferZeichnen(dialog) {
    const platz = dialog.querySelector('[data-treffer]');
    if (!this.text.trim()) {
      platz.innerHTML = '<p class="karten-text kal-suche-hinweis">Durchsucht alle Termine und Projekte – auch in ausgeblendeten Kalendern.</p>';
      return;
    }
    const { termine, projekte } = KalenderDaten.suchen(this.text);
    if (!termine.length && !projekte.length) {
      platz.innerHTML = '<p class="karten-text kal-suche-hinweis">Nichts gefunden.</p>';
      return;
    }
    const terminZeile = ({ termin: t, tag, kommend }) => {
      const k = KalenderDaten.kalenderVon(t);
      const v = TerminDetail.vorkommen(t, tag);
      const zeit = t.ganztaegig ? 'ganztägig' : `${t.start} – ${t.ende}`;
      const unter = [`${Projekte.datumText(v.datum)}`, zeit];
      if (t.wiederholung.art !== 'keine') unter.push(QuickAdd.wiederholungText(t.wiederholung));
      if (t.ort) unter.push(t.ort);
      return `
        <button type="button" class="kal-zeile ${kommend ? '' : 'vergangen'}" style="${Kalender.farbe(k)}" data-termin="${t.id}" data-am="${tag}">
          <span class="kal-strich"></span>
          <span class="titel-text"><strong>${esc(t.titel)}</strong><small>${esc(unter.join(' · '))}</small></span>
        </button>`;
    };
    const projektZeile = p => {
      const f = Projekte.frist(p);
      return `
        <button type="button" class="kal-zeile" style="${Kalender.farbe(KalenderDaten.kalenderVon(p))}" data-projekt="${p.id}">
          <span class="kal-strich"></span>
          <span class="titel-text"><strong>${esc(p.titel)}</strong><small>Projekt · ${esc(f.text)}</small></span>
          <span class="kal-zeile-icon">${icon('folder-kanban')}</span>
        </button>`;
    };
    const kommend = termine.filter(t => t.kommend);
    const vorbei = termine.filter(t => !t.kommend);
    platz.innerHTML = `
      ${kommend.length ? `<h3 class="kal-abschnitt">Kommende Termine</h3><div class="kal-zeilen">${kommend.map(terminZeile).join('')}</div>` : ''}
      ${projekte.length ? `<h3 class="kal-abschnitt">Projekte</h3><div class="kal-zeilen">${projekte.map(projektZeile).join('')}</div>` : ''}
      ${vorbei.length ? `<h3 class="kal-abschnitt">Vergangen</h3><div class="kal-zeilen">${vorbei.map(terminZeile).join('')}</div>` : ''}`;
    iconsZeichnen();
  }
};


/* =========================================================
   Kalender verwalten (wie bei Apple: ein-/ausblenden, Farbe …)
   ========================================================= */
const KalenderVerwaltung = {
  oeffnen() {
    const b = KalenderDaten.bereich;
    const zeilen = KalenderDaten.kalenderListe().map(k => {
      const termine = b.termine.filter(t => t.kalenderId === k.id).length;
      const projekte = b.projekte.filter(p => p.kalenderId === k.id).length;
      const info = [`${termine} Termin${termine === 1 ? '' : 'e'}`];
      if (projekte) info.push(`${projekte} Projekt${projekte === 1 ? '' : 'e'}`);
      if (b.standardKalender === k.id) info.push('Standard');
      return `
        <div class="kal-verw-zeile ${k.ausgeblendet ? 'aus' : ''}" style="--kat: var(--farbe-${k.farbe})">
          <button type="button" class="kal-verw-name" data-kal-bearbeiten="${k.id}">
            <span class="icon-feld">${icon(k.icon)}</span>
            <span class="titel-text"><strong>${esc(k.name)}</strong><small>${info.join(' · ')}</small></span>
          </button>
          <input type="checkbox" class="schalter" data-kal-sichtbar="${k.id}" ${k.ausgeblendet ? '' : 'checked'}
                 aria-label="${esc(k.name)} anzeigen">
        </div>`;
    }).join('');

    const dialog = Dialog.oeffnen('Kalender', `
      <div class="kal-verwaltung">
        <p class="karten-text">Schalter aus = Kalender ausblenden. Die Termine bleiben gespeichert. Tippe auf einen Namen, um Farbe, Icon oder Namen zu ändern.</p>
        <div class="kal-verw-liste">${zeilen}</div>
        <button type="button" class="knopf gestrichelt breit" data-kal-neu>${icon('plus')}<span>Neuer Kalender</span></button>
      </div>`);

    dialog.querySelectorAll('[data-kal-sichtbar]').forEach(el => {
      el.onchange = () => {
        KalenderDaten.kalenderSpeichern({ id: el.dataset.kalSichtbar, ausgeblendet: !el.checked });
        el.closest('.kal-verw-zeile').classList.toggle('aus', !el.checked);
        Kalender.neuZeichnen();
      };
    });
    dialog.querySelectorAll('[data-kal-bearbeiten]').forEach(el => {
      el.onclick = () => this.formular(el.dataset.kalBearbeiten);
    });
    dialog.querySelector('[data-kal-neu]').onclick = () => this.formular(null);
  },

  formular(id) {
    const b = KalenderDaten.bereich;
    const vorhanden = id ? KalenderDaten.kalender(id) : null;
    const benutzt = b.kalender.map(k => k.farbe);
    const k = vorhanden || {
      name: '', icon: 'calendar', ausgeblendet: false,
      farbe: (KONFIG.farben.find(f => !benutzt.includes(f.id)) || KONFIG.farben[0]).id
    };
    const istStandard = vorhanden && b.standardKalender === vorhanden.id;

    const dialog = Dialog.oeffnen(vorhanden ? 'Kalender bearbeiten' : 'Neuer Kalender', `
      <form class="formular" style="--kat: var(--farbe-${k.farbe})" novalidate>
        <label class="feld">
          <span class="feld-titel">Name</span>
          <input class="eingabe" name="titel" maxlength="30" value="${esc(k.name)}" placeholder="z. B. Verein" autocomplete="off">
          <small class="hinweis">Im Quick Add erreichst du ihn mit #Name.</small>
        </label>
        <div class="feld"><span class="feld-titel">Farbe</span>${farbAuswahl(k.farbe)}</div>
        <div class="feld"><span class="feld-titel">Icon</span>${iconAuswahl(k.icon)}</div>
        ${schalter('standard', 'Standard-Kalender', 'Neue Termine ohne #Tag landen hier.', istStandard)}
        <p class="fehler" hidden></p>
        <div class="formular-knoepfe">
          <button type="button" class="knopf zweit" data-zurueck>${icon('chevron-left')}<span>Zurück</span></button>
          ${vorhanden && b.kalender.length > 1 ? `<button type="button" class="knopf gefahr" data-loeschen aria-label="Löschen">${icon('trash-2')}</button>` : ''}
          <button type="submit" class="knopf">${icon('check')}<span>Speichern</span></button>
        </div>
      </form>`);

    const form = dialog.querySelector('form');
    const f = form.elements;
    form.addEventListener('change', e => {
      if (e.target.name === 'farbe') form.style.setProperty('--kat', `var(--farbe-${e.target.value})`);
    });
    form.querySelector('[data-zurueck]').onclick = () => this.oeffnen();

    form.addEventListener('submit', e => {
      e.preventDefault();
      const name = f.titel.value.trim();
      if (!name) return formularFehler(form, 'Bitte gib einen Namen ein.');
      const doppelt = b.kalender.find(x => x.name.toLowerCase() === name.toLowerCase() && x.id !== id);
      if (doppelt) return formularFehler(form, 'Einen Kalender mit diesem Namen gibt es schon.');
      KalenderDaten.kalenderSpeichern({ id, name, farbe: f.farbe.value, icon: f.icon.value });
      const gespeichert = id ? KalenderDaten.kalender(id) : b.kalender[b.kalender.length - 1];
      if (f.standard.checked) b.standardKalender = gespeichert.id;
      else if (b.standardKalender === gespeichert.id) b.standardKalender = b.kalender.find(x => x.id !== gespeichert.id)?.id || gespeichert.id;
      Daten.speichern();
      Kalender.neuZeichnen();
      meldung(vorhanden ? 'Gespeichert' : 'Kalender angelegt');
      this.oeffnen();
    });

    const loeschen = form.querySelector('[data-loeschen]');
    if (loeschen) loeschen.onclick = async () => {
      const termine = b.termine.filter(t => t.kalenderId === id).length;
      const projekte = b.projekte.filter(p => p.kalenderId === id).length;
      const ziel = KalenderDaten.kalender(b.standardKalender === id ? b.kalender.find(x => x.id !== id).id : b.standardKalender);
      const was = [termine ? `${termine} Termin${termine === 1 ? '' : 'e'}` : '', projekte ? `${projekte} Projekt${projekte === 1 ? '' : 'e'}` : ''].filter(Boolean).join(' und ');
      const text = was
        ? `Kalender „${k.name}“ löschen? Seine ${was} kommen in den Kalender „${ziel.name}“.`
        : `Kalender „${k.name}“ löschen?`;
      if (!await bestaetigen(text)) return;
      KalenderDaten.kalenderLoeschen(id);
      Kalender.neuZeichnen();
      meldung('Gelöscht');
      this.oeffnen();
    };
  }
};


/* =========================================================
   Detailansicht
   ========================================================= */
const TerminDetail = {
  // Ein Vorkommen eines Termins: bei Serien auf den angetippten Tag verschoben
  vorkommen(t, tag) {
    if (t.wiederholung.art === 'keine' || !tag) return { datum: t.datum, endDatum: t.endDatum };
    const spanne = KalenderDaten.tageZwischen(t.datum, t.endDatum);
    return { datum: tag, endDatum: KalenderDaten.plusTage(tag, spanne) };
  },

  // „1 Std 30 Min“
  dauerText(min) {
    const h = Math.floor(min / 60), m = min % 60;
    return [h ? `${h} Std` : '', m ? `${m} Min` : ''].filter(Boolean).join(' ');
  },

  wannHtml(t, tag) {
    const v = this.vorkommen(t, tag);
    const a = Datum.ausSchluessel(v.datum);
    const z = Datum.ausSchluessel(v.endDatum);
    const mehrtaegig = v.datum !== v.endDatum;
    if (t.ganztaegig) {
      return mehrtaegig
        ? `<li>${icon('calendar')}<span>${Datum.lang(a)} –<br>${Datum.lang(z)}</span></li><li>${icon('sun')}<span>ganztägig</span></li>`
        : `<li>${icon('calendar')}<span>${Datum.lang(a)}</span></li><li>${icon('sun')}<span>ganztägig</span></li>`;
    }
    const dauer = KalenderDaten.tageZwischen(v.datum, v.endDatum) * 1440
      + KalenderDaten.minuten(t.ende) - KalenderDaten.minuten(t.start);
    if (mehrtaegig) {
      return `<li>${icon('calendar')}<span>${Datum.lang(a)}, ${t.start} –<br>${Datum.lang(z)}, ${t.ende}</span></li>
              <li>${icon('clock')}<span>${this.dauerText(dauer)}</span></li>`;
    }
    return `<li>${icon('calendar')}<span>${Datum.lang(a)}</span></li>
            <li>${icon('clock')}<span>${t.start} – ${t.ende} <small>(${this.dauerText(dauer)})</small></span></li>`;
  },

  oeffnen(id, tag) {
    const t = KalenderDaten.termin(id);
    if (!t) return;
    const k = KalenderDaten.kalenderVon(t);
    const serie = t.wiederholung.art !== 'keine';

    const dialog = Dialog.oeffnen('Termin', `
      <div class="kal-detail" style="${Kalender.farbe(k)}">
        <div class="kal-detail-kopf">
          <span class="kal-strich"></span>
          <div>
            <h3>${esc(t.titel)}</h3>
            <span class="kal-chip"><i></i>${esc(k ? k.name : '')}</span>
          </div>
        </div>
        <ul class="kal-detail-liste">
          ${this.wannHtml(t, tag)}
          ${serie ? `<li>${icon('repeat')}<span>${esc(QuickAdd.wiederholungText(t.wiederholung))}</span></li>` : ''}
          ${t.ort ? `<li>${icon('map-pin')}<span>${esc(t.ort)}</span></li>` : ''}
          ${t.notiz ? `<li>${icon('notebook')}<span class="kal-notiz">${esc(t.notiz)}</span></li>` : ''}
        </ul>
        <div class="formular-knoepfe kal-detail-knoepfe">
          <button type="button" class="knopf gefahr" data-loeschen aria-label="Löschen" title="Löschen">${icon('trash-2')}<span>Löschen</span></button>
          <button type="button" class="knopf zweit" data-duplizieren aria-label="Duplizieren" title="Duplizieren">${icon('copy')}<span>Duplizieren</span></button>
          <button type="button" class="knopf" data-bearbeiten>${icon('pencil')}<span>Bearbeiten</span></button>
        </div>
      </div>`);

    dialog.querySelector('[data-bearbeiten]').onclick = () => TerminFormular.oeffnen({ id, tag });
    dialog.querySelector('[data-loeschen]').onclick = () => this.loeschen(id, tag);
    dialog.querySelector('[data-duplizieren]').onclick = () => this.duplizieren(id, tag);
  },

  // Löschen – bei Serien mit Rückfrage „nur dieser / alle“
  async loeschen(id, tag) {
    const t = KalenderDaten.termin(id);
    if (!t) return;
    if (t.wiederholung.art !== 'keine' && tag) {
      const wahl = await auswahlFrage(`„${t.titel}“ wiederholt sich. Was möchtest du löschen?`, [
        { wert: 'einer', text: 'Nur diesen Termin', gefahr: true },
        { wert: 'alle', text: 'Alle Termine der Serie', gefahr: true }
      ]);
      if (!wahl) return;
      if (wahl === 'einer') KalenderDaten.vorkommenLoeschen(id, tag);
      else KalenderDaten.terminLoeschen(id);
    } else {
      if (!await bestaetigen(`„${t.titel}“ wird gelöscht. Das lässt sich nicht rückgängig machen.`)) return;
      KalenderDaten.terminLoeschen(id);
    }
    Dialog.schliessen();
    Kalender.neuZeichnen();
    meldung('Gelöscht');
  },

  // Kopie anlegen und gleich zum Anpassen öffnen (bei Serien: Kopie nur dieses einen Tages)
  duplizieren(id, tag) {
    const t = KalenderDaten.termin(id);
    if (!t) return;
    const kopie = JSON.parse(JSON.stringify(t));
    delete kopie.id;
    if (t.wiederholung.art !== 'keine') {
      Object.assign(kopie, this.vorkommen(t, tag));
      kopie.wiederholung = { art: 'keine', tage: [], intervall: 1, bis: null, ausnahmen: [] };
    }
    const neu = KalenderDaten.terminSpeichern(kopie);
    Kalender.neuZeichnen();
    meldung('Dupliziert – jetzt kannst du die Kopie anpassen');
    TerminFormular.oeffnen({ id: neu.id, titel: 'Kopie bearbeiten' });
  }
};


/* =========================================================
   Formular „Neuer Termin“ / „Termin bearbeiten“
   ========================================================= */
const TerminFormular = {
  WDH_OPTIONEN: [
    { wert: 'keine', text: 'Nie' },
    { wert: 'taeglich', text: 'Täglich' },
    { wert: 'woechentlich', text: 'Wöchentlich' },
    { wert: 'zweiwoechentlich', text: 'Alle 2 Wochen' },
    { wert: 'monatlich', text: 'Monatlich' },
    { wert: 'jaehrlich', text: 'Jährlich' }
  ],

  // Wiederholung → Wert für das Auswahlfeld
  wdhWert(w) {
    if (w.art === 'woechentlich' && w.intervall === 2) return 'zweiwoechentlich';
    if (w.art !== 'keine' && w.intervall > 1) return 'eigen';
    return w.art;
  },

  /* id: vorhandener Termin (oder null = neu)
     tag: angetippter Tag einer Serie
     werte: Vorbelegung für einen neuen Termin (z. B. aus Quick Add)
     ausQuickAdd: true → nach dem Speichern das Quick-Add-Feld leeren */
  oeffnen({ id = null, tag = null, werte = {}, ausQuickAdd = false, titel = null } = {}) {
    const vorhanden = id ? KalenderDaten.termin(id) : null;
    const serie = vorhanden && vorhanden.wiederholung.art !== 'keine';

    // Werte, mit denen das Formular startet
    let t;
    if (vorhanden) {
      t = JSON.parse(JSON.stringify(vorhanden));
      if (serie && tag) Object.assign(t, TerminDetail.vorkommen(vorhanden, tag));
    } else {
      const h = Math.min(new Date().getHours() + 1, 22); // nächste volle Stunde
      t = KalenderDaten.terminVorlage({
        ganztaegig: false,
        start: `${String(h).padStart(2, '0')}:00`,
        ende: `${String(h + 1).padStart(2, '0')}:00`,
        ...werte
      });
    }
    const startZeit = t.start || '09:00';
    const endeZeit = t.ende || '10:00';
    const w = t.wiederholung;
    const wdh = this.wdhWert(w);
    const neuerKalender = werte.neuerKalender || null;
    const kalId = neuerKalender ? '__neu__' : (KalenderDaten.kalender(t.kalenderId) ? t.kalenderId : KalenderDaten.kalenderVon({}).id);

    const wdhOptionen = [...this.WDH_OPTIONEN];
    if (wdh === 'eigen') wdhOptionen.push({ wert: 'eigen', text: QuickAdd.wiederholungText({ ...w, bis: null }) });

    const startWochentag = Datum.ausSchluessel(t.datum).getDay();
    const tage = w.tage && w.tage.length ? w.tage : [startWochentag];
    const tagKnoepfe = Datum.wochenReihenfolge().map(d => `
      <label class="tag-chip">
        <input type="checkbox" name="tage" value="${d}" ${tage.includes(d) ? 'checked' : ''}>
        <span>${Datum.WOCHENTAGE_KURZ[d]}</span>
      </label>`).join('');


    const k = KalenderDaten.kalender(kalId);
    const dialog = Dialog.oeffnen(titel || (vorhanden ? 'Termin bearbeiten' : 'Neuer Termin'), `
      <form class="formular kal-formular" style="--kat: var(--farbe-${k ? k.farbe : 'salbei'})" novalidate>
        <label class="feld">
          <span class="feld-titel">Titel</span>
          <input class="eingabe" name="titel" maxlength="80" value="${esc(t.titel)}" placeholder="z. B. Zahnarzt" autocomplete="off">
        </label>
        <label class="feld">
          <span class="feld-titel">Ort</span>
          <input class="eingabe" name="ort" maxlength="80" value="${esc(t.ort)}" placeholder="optional" autocomplete="off">
        </label>

        ${schalter('ganztaegig', 'Ganztägig', 'Ohne Uhrzeit, z. B. Geburtstag oder Urlaub', t.ganztaegig)}

        <div class="feld">
          <span class="feld-titel">Beginn</span>
          <div class="kal-datumzeit">
            <input class="eingabe" type="date" name="startDatum" value="${t.datum}" required>
            <input class="eingabe" type="time" name="startZeit" value="${startZeit}" step="300" data-zeit>
          </div>
        </div>
        <div class="feld">
          <span class="feld-titel">Ende</span>
          <div class="kal-datumzeit">
            <input class="eingabe" type="date" name="endDatum" value="${t.endDatum}" required>
            <input class="eingabe" type="time" name="endZeit" value="${endeZeit}" step="300" data-zeit>
          </div>
        </div>

        <div class="feld">
          <label class="feld">
            <span class="feld-titel">Wiederholung</span>
            <select class="eingabe" name="wdh">
              ${wdhOptionen.map(o => `<option value="${o.wert}" ${o.wert === wdh ? 'selected' : ''}>${esc(o.text)}</option>`).join('')}
            </select>
          </label>
          <div class="wochentage" data-nur="woche">${tagKnoepfe}</div>
          <label class="feld" data-nur="serie">
            <span class="feld-titel">Endet am</span>
            <input class="eingabe" type="date" name="bis" value="${w.bis || ''}">
            <small class="hinweis">Leer lassen = endet nie</small>
          </label>
        </div>

        <div class="feld">
          <span class="feld-titel">Kalender</span>
          ${kalenderWahlHtml(kalId, neuerKalender)}
        </div>

        <label class="feld">
          <span class="feld-titel">Notizen</span>
          <textarea class="eingabe textfeld" name="notiz" rows="3" maxlength="1000" placeholder="optional">${esc(t.notiz)}</textarea>
        </label>

        <p class="fehler" hidden></p>
        ${formularKnoepfe(!!vorhanden)}
      </form>`);

    const form = dialog.querySelector('form');
    const f = form.elements;

    // Felder ein-/ausblenden (Uhrzeiten bei „ganztägig“, Wochentage bei „wöchentlich“ …)
    const aktualisieren = () => {
      form.querySelectorAll('[data-zeit]').forEach(el => { el.hidden = f.ganztaegig.checked; });
      const art = f.wdh.value;
      form.querySelector('[data-nur="woche"]').hidden = !(art === 'woechentlich' || art === 'zweiwoechentlich');
      form.querySelector('[data-nur="serie"]').hidden = art === 'keine';
    };
    aktualisieren();

    // Beginn verschoben → Ende mitschieben (die Dauer bleibt gleich), wie bei Apple
    const zeitpunkt = (datum, zeit) => {
      const d = Datum.ausSchluessel(datum);
      const [h, m] = (zeit || '00:00').split(':').map(Number);
      d.setHours(h, m);
      return d;
    };
    let alterBeginn = zeitpunkt(f.startDatum.value, f.startZeit.value);
    const beginnGeaendert = () => {
      if (!f.startDatum.value) return;
      const neu = zeitpunkt(f.startDatum.value, f.startZeit.value);
      const ende = zeitpunkt(f.endDatum.value || f.startDatum.value, f.endZeit.value);
      const neuesEnde = new Date(ende.getTime() + (neu - alterBeginn));
      f.endDatum.value = Datum.schluessel(neuesEnde);
      f.endZeit.value = `${String(neuesEnde.getHours()).padStart(2, '0')}:${String(neuesEnde.getMinutes()).padStart(2, '0')}`;
      alterBeginn = neu;
    };

    form.addEventListener('change', e => {
      const n = e.target.name;
      if (n === 'startDatum' || n === 'startZeit') beginnGeaendert();
      if (n === 'kalender') {
        const gewaehlt = KalenderDaten.kalender(e.target.value);
        form.style.setProperty('--kat', gewaehlt ? `var(--farbe-${gewaehlt.farbe})` : 'var(--text-3)');
      }
      aktualisieren();
    });

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const ganz = f.ganztaegig.checked;
      const art = f.wdh.value;
      const neu = {
        titel: f.titel.value.trim(),
        ort: f.ort.value.trim(),
        notiz: f.notiz.value.trim(),
        ganztaegig: ganz,
        datum: f.startDatum.value,
        endDatum: f.endDatum.value || f.startDatum.value,
        start: ganz ? null : f.startZeit.value,
        ende: ganz ? null : f.endZeit.value,
        kalenderId: f.kalender.value,
        wiederholung: {
          art: art === 'zweiwoechentlich' || art === 'eigen' && w.art === 'woechentlich' ? 'woechentlich' : art === 'eigen' ? w.art : art,
          intervall: art === 'zweiwoechentlich' ? 2 : art === 'eigen' ? w.intervall : 1,
          tage: [...form.querySelectorAll('input[name="tage"]:checked')].map(el => Number(el.value)),
          bis: art === 'keine' ? null : (f.bis.value || null),
          ausnahmen: vorhanden ? vorhanden.wiederholung.ausnahmen : []
        }
      };

      // Eingaben prüfen
      if (!neu.titel) return formularFehler(form, 'Bitte gib einen Titel ein.');
      if (!neu.datum) return formularFehler(form, 'Bitte wähle ein Datum für den Beginn.');
      if (!ganz && (!neu.start || !neu.ende)) return formularFehler(form, 'Bitte gib Beginn- und End-Uhrzeit an.');
      if (neu.endDatum < neu.datum || (!ganz && neu.endDatum === neu.datum && neu.ende <= neu.start)) {
        return formularFehler(form, 'Das Ende muss nach dem Beginn liegen.');
      }
      if (neu.wiederholung.art === 'woechentlich' && !neu.wiederholung.tage.length) {
        return formularFehler(form, 'Bitte wähle mindestens einen Wochentag.');
      }
      if (neu.wiederholung.bis && neu.wiederholung.bis < neu.datum) {
        return formularFehler(form, '„Endet am“ muss nach dem Beginn liegen.');
      }
      if (neu.wiederholung.art !== 'woechentlich') neu.wiederholung.tage = [];
      if (neu.kalenderId === '__neu__') neu.kalenderId = KalenderDaten.kalenderFuerTag(neuerKalender).id;

      let gespeichert;
      if (!vorhanden) {
        gespeichert = KalenderDaten.terminSpeichern(neu);
      } else if (!serie || !tag) {
        gespeichert = KalenderDaten.terminSpeichern({ ...neu, id });
      } else {
        // Wiederkehrender Termin: nur diesen Tag oder die ganze Serie ändern?
        const wahl = await auswahlFrage('Dieser Termin wiederholt sich. Was soll geändert werden?', [
          { wert: 'einer', text: 'Nur dieser Termin' },
          { wert: 'alle', text: 'Alle Termine der Serie' }
        ]);
        if (!wahl) return;
        if (wahl === 'einer') {
          KalenderDaten.vorkommenLoeschen(id, tag);
          gespeichert = KalenderDaten.terminSpeichern({
            ...neu, wiederholung: { art: 'keine', tage: [], intervall: 1, bis: null, ausnahmen: [] }
          });
        } else {
          gespeichert = KalenderDaten.terminSpeichern({ ...this.serieVerschieben(vorhanden, tag, neu), id });
        }
      }

      Dialog.schliessen();
      if (ausQuickAdd) {
        Kalender.vorschau = null;
        const feld = Kalender.bereich && Kalender.bereich.querySelector('[data-schnell] input');
        if (feld) feld.value = '';
        Kalender.vorschauZeichnen();
      }
      meldung(vorhanden ? 'Gespeichert' : `Eingetragen: ${gespeichert.titel}`);
      if (Navigation.aktuelle === 'kalender') Kalender.springeZu(gespeichert, neu.datum);
    });

    const loeschen = form.querySelector('[data-loeschen]');
    if (loeschen) loeschen.addEventListener('click', () => TerminDetail.loeschen(id, tag));
  },

  /* „Alle Termine der Serie“ geändert: Das Formular zeigte den angetippten Tag.
     Wurde dessen Datum verschoben, wandert die ganze Serie um genauso viele Tage. */
  serieVerschieben(alt, tag, neu) {
    if (neu.wiederholung.art === 'keine') return neu; // Serie aufgelöst → einzelner Termin
    const verschiebung = KalenderDaten.tageZwischen(tag, neu.datum);
    const spanne = KalenderDaten.tageZwischen(neu.datum, neu.endDatum);
    const datum = KalenderDaten.plusTage(alt.datum, verschiebung);
    const w = { ...neu.wiederholung };
    if (verschiebung) {
      w.ausnahmen = (w.ausnahmen || []).map(a => KalenderDaten.plusTage(a, verschiebung));
      // Nur ein Wochentag und nicht angefasst → mit dem Datum mitwandern
      const alteTage = alt.wiederholung.tage || [];
      if (w.art === 'woechentlich' && w.tage.length === 1 && alteTage.length === 1 && w.tage[0] === alteTage[0]) {
        w.tage = [Datum.ausSchluessel(datum).getDay()];
      }
    }
    return { ...neu, datum, endDatum: KalenderDaten.plusTage(datum, spanne), wiederholung: w };
  }
};
