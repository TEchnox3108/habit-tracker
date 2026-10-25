/* =========================================================
   wisdom-page.js – Die Seite "Weisheit"

   Jeden Tag eine andere Weisheit aus wisdom.js – mit Erklärung,
   Denkanstoß, Favoriten, Archiv und eigenen Notizen.

   So wird die Tagesweisheit ausgewählt:
   - Die App merkt sich in Daten.zustand.weisheit.verlauf,
     welche Weisheit an welchem Tag dran war. Sie bleibt also den
     ganzen Tag gleich und wechselt um Mitternacht.
   - Eine Weisheit kommt erst wieder, wenn alle anderen dran waren.
   - Nie zwei Tage hintereinander dieselbe Epoche (und damit auch
     nicht derselbe Philosoph).
   - Welche der passenden Weisheiten es wird, hängt vom Datum ab
     (nicht vom Zufall beim Öffnen).

   Aufbau:
   1. Daten & Auswahl der Tagesweisheit
   2. Favoriten, Notizen, Kopieren/Teilen
   3. Bausteine (Karte, Listeneintrag, Filter, Vorschau)
   4. Die Seite
   5. Bedienung
   ========================================================= */

const Weisheit = {
  ansicht: 'heute',   // 'heute', 'archiv' oder 'favoriten'
  filterEpoche: '',   // '' = alle
  filterPerson: '',   // '' = alle
  bereich: null,
  _wartendeNotizen: {}, // noch nicht gespeicherte Notizen (Speichern kurz verzögert)


  /* ---------- 1. Daten & Auswahl ---------- */

  daten() {
    return Daten.zustand.weisheit;
  },

  eintrag(id) {
    if (!this._nachId) this._nachId = new Map(WEISHEITEN.map(w => [w.id, w]));
    return this._nachId.get(id);
  },

  person(w) {
    return PHILOSOPHEN[w.von] || { name: w.von, lebenszeit: '', epoche: '' };
  },

  epoche(w) {
    return EPOCHEN[this.person(w).epoche] || { name: '', farbe: 'schiefer' };
  },

  // Aus einem Text eine feste Zahl machen (gleiches Datum → gleiche Zahl)
  zahlAus(text) {
    let h = 2166136261;
    for (let i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  },

  // Die Weisheit eines Tages (null, wenn es für den Tag keine gibt)
  fuerTag(datum) {
    this.verlaufFuellen();
    const id = this.daten().verlauf[Datum.schluessel(datum)];
    return id ? this.eintrag(id) || null : null;
  },

  // Trägt für alle Tage bis heute, die noch keine Weisheit haben, eine ein
  verlaufFuellen() {
    const verlauf = this.daten().verlauf;
    const heute = Datum.heute();
    const tage = Object.keys(verlauf).sort();

    let start;
    if (!tage.length) {
      start = Datum.plusTage(heute, -6); // erster Start: Archiv mit 7 Tagen vorfüllen
    } else {
      start = Datum.plusTage(Datum.ausSchluessel(tage[tage.length - 1]), 1);
      const spaetestens = Datum.plusTage(heute, -365);
      if (start < spaetestens) start = spaetestens;
      if (start > heute) start = heute;
    }

    let geaendert = false;
    for (let d = start; d <= heute; d = Datum.plusTage(d, 1)) {
      const tag = Datum.schluessel(d);
      // Fehlt der Tag – oder wurde seine Weisheit aus wisdom.js gelöscht?
      if (!verlauf[tag] || !this.eintrag(verlauf[tag])) {
        verlauf[tag] = this.waehle(tag);
        geaendert = true;
      }
    }
    if (geaendert) Daten.speichern();
  },

  // Sucht die Weisheit für einen neuen Tag aus
  waehle(tag) {
    const verlauf = this.daten().verlauf;

    // Welche Weisheiten waren in der laufenden Runde schon dran?
    const runde = new Set();
    Object.keys(verlauf).sort().filter(t => t < tag).forEach(t => {
      const id = verlauf[t];
      if (!this.eintrag(id)) return;
      if (runde.has(id) || runde.size >= WEISHEITEN.length) runde.clear(); // neue Runde
      runde.add(id);
    });
    let kandidaten = WEISHEITEN.filter(w => !runde.has(w.id));
    if (!kandidaten.length) kandidaten = WEISHEITEN.slice();

    // Nicht dieselbe Epoche (bzw. denselben Philosophen) wie am Vortag
    const vortag = this.eintrag(verlauf[Datum.schluessel(Datum.plusTage(Datum.ausSchluessel(tag), -1))]);
    if (vortag) {
      const andereEpoche = kandidaten.filter(w => this.person(w).epoche !== this.person(vortag).epoche);
      const andererPhilosoph = kandidaten.filter(w => w.von !== vortag.von);
      if (andereEpoche.length) kandidaten = andereEpoche;
      else if (andererPhilosoph.length) kandidaten = andererPhilosoph;
    }

    // Erst die Epoche wählen: Epochen mit vielen übrigen Einträgen sind deutlich
    // wahrscheinlicher. So bleibt am Rundenende nicht nur eine Epoche übrig.
    const proEpoche = {};
    kandidaten.forEach(w => {
      const ep = this.person(w).epoche;
      (proEpoche[ep] = proEpoche[ep] || []).push(w);
    });
    const epochen = Object.keys(proEpoche).sort();
    const gewicht = ep => proEpoche[ep].length ** 2;
    const summe = epochen.reduce((s, ep) => s + gewicht(ep), 0);
    let wurf = this.zahlAus(tag + '/epoche') % summe;
    const epoche = epochen.find(ep => (wurf -= gewicht(ep)) < 0);

    // Dann innerhalb der Epoche eine Weisheit (abhängig vom Datum)
    const auswahl = proEpoche[epoche].sort((a, b) => (a.id < b.id ? -1 : 1));
    return auswahl[this.zahlAus(tag) % auswahl.length].id;
  },


  /* ---------- 2. Favoriten, Notizen, Kopieren/Teilen ---------- */

  istFavorit(id) {
    return this.daten().favoriten.includes(id);
  },

  favoritUmschalten(id) {
    const d = this.daten();
    d.favoriten = this.istFavorit(id) ? d.favoriten.filter(f => f !== id) : [...d.favoriten, id];
    Daten.speichern();
    return this.istFavorit(id);
  },

  notiz(tag) {
    return this.daten().notizen[tag] || '';
  },

  notizSpeichern(tag, text) {
    const notizen = this.daten().notizen;
    if (text.trim()) notizen[tag] = text;
    else delete notizen[tag];
    delete this._wartendeNotizen[tag];
    Daten.speichern();
  },

  // Notizen, deren Speichern noch aussteht, sofort speichern
  notizenJetztSpeichern() {
    Object.entries(this._wartendeNotizen).forEach(([tag, eintrag]) => {
      clearTimeout(eintrag.zeit);
      this.notizSpeichern(tag, eintrag.text);
    });
  },

  // Wann war diese Weisheit zuletzt dran? (für Notizen bei Favoriten)
  letzterTag(id) {
    const verlauf = this.daten().verlauf;
    return Object.keys(verlauf).sort().reverse().find(tag => verlauf[tag] === id) || null;
  },

  // Zitat mit Anführungszeichen – aber nur bei wörtlichen Zitaten
  zitatText(w) {
    return w.typ === 'zitat' && !w.sinngemaess ? `„${w.text}“` : w.text;
  },

  textZumTeilen(w) {
    const p = this.person(w);
    return `${this.zitatText(w)}\n— ${p.name}${w.quelle ? `, ${w.quelle}` : ''}${w.sinngemaess ? ' (sinngemäß)' : ''}`;
  },

  async kopieren(w) {
    const text = this.textZumTeilen(w);
    try {
      await navigator.clipboard.writeText(text);
    } catch (fehler) {
      // Ersatzweg für Browser ohne Zwischenablage-Zugriff
      const feld = document.createElement('textarea');
      feld.value = text;
      feld.style.position = 'fixed';
      feld.style.opacity = '0';
      document.body.appendChild(feld);
      feld.select();
      document.execCommand('copy');
      feld.remove();
    }
    meldung('Kopiert');
  },

  teilen(w) {
    if (!navigator.share) return this.kopieren(w);
    navigator.share({ title: 'Weisheit des Tages', text: this.textZumTeilen(w) }).catch(() => {});
  },


  /* ---------- 3. Bausteine ---------- */

  TYP_NAMEN: {
    zitat: 'Zitat',
    lebensregel: 'Lebensregel',
    gedankenexperiment: 'Gedankenexperiment',
    denkanstoss: 'Denkanstoß'
  },

  // Die große Karte mit allem
  // optionen: { tag, mitNotiz, istHeute }
  karteHtml(w, { tag = null, mitNotiz = false, istHeute = false } = {}) {
    const p = this.person(w);
    const e = this.epoche(w);
    const fav = this.istFavorit(w.id);
    const zitat = this.zitatText(w);

    return `
      <article class="weisheit-karte" data-id="${w.id}" style="--kat: var(--farbe-${e.farbe})">
        <div class="weisheit-oben">
          <span class="epoche-marke"><span class="epoche-punkt"></span>${esc(e.name)}</span>
          <span class="typ-marke">${this.TYP_NAMEN[w.typ] || ''}</span>
        </div>

        <blockquote class="weisheit-zitat ${zitat.length > 170 ? 'lang' : ''}">${esc(zitat)}</blockquote>

        <div class="weisheit-person">
          <strong>${esc(p.name)}</strong>
          <span>${esc(p.lebenszeit)}${p.lebenszeit ? ' · ' : ''}${esc(e.name)}</span>
          ${w.quelle ? `<span class="weisheit-quelle">${esc(w.quelle)}${p.deutsch ? '' : ' · übersetzt'}</span>` : ''}
          ${w.sinngemaess ? '<span class="sinngemaess-marke">sinngemäß</span>' : ''}
        </div>

        <section class="weisheit-abschnitt">
          <h3>${icon('lightbulb')}Was bedeutet das?</h3>
          <p>${esc(w.erklaerung)}</p>
        </section>

        <section class="weisheit-abschnitt denkanstoss">
          <h3>${icon('compass')}${istHeute ? 'Denkanstoß für heute' : 'Denkanstoß'}</h3>
          <p>${esc(w.denkanstoss)}</p>
        </section>

        <div class="weisheit-knoepfe">
          <button type="button" class="knopf zweit klein favorit ${fav ? 'an' : ''}" data-aktion="favorit" aria-pressed="${fav}">
            ${icon('heart')}<span>${fav ? 'Favorit' : 'Merken'}</span>
          </button>
          <button type="button" class="knopf zweit klein" data-aktion="kopieren">${icon('copy')}<span>Kopieren</span></button>
          ${navigator.share ? `<button type="button" class="knopf zweit klein" data-aktion="teilen">${icon('share-2')}<span>Teilen</span></button>` : ''}
        </div>

        ${mitNotiz && tag ? `
          <label class="feld weisheit-notiz">
            <span class="feld-titel">${icon('notebook-pen')}Meine Gedanken dazu</span>
            <textarea class="eingabe textfeld" data-notiz="${tag}" rows="3" maxlength="1000"
                      placeholder="Was fällt dir dazu ein? Wird automatisch gespeichert.">${esc(this.notiz(tag))}</textarea>
          </label>` : ''}
      </article>`;
  },

  // Ein Eintrag in Archiv oder Favoriten
  eintragHtml(w, tag, kopfText) {
    const e = this.epoche(w);
    return `
      <li>
        <button type="button" class="weisheit-eintrag" data-aktion="oeffnen" data-id="${w.id}" data-tag="${tag || ''}"
                style="--kat: var(--farbe-${e.farbe})">
          <span class="eintrag-kopf">
            <span class="epoche-punkt"></span>
            <span>${esc(kopfText)}</span>
            ${this.istFavorit(w.id) ? `<span class="eintrag-herz">${icon('heart')}</span>` : ''}
            ${tag && this.notiz(tag) ? icon('notebook-pen') : ''}
          </span>
          <span class="eintrag-zitat">${esc(this.zitatText(w))}</span>
          <span class="eintrag-person">${esc(this.person(w).name)}</span>
        </button>
      </li>`;
  },

  // Filter nach Epoche (Knöpfe) und Philosoph (Auswahlliste)
  filterHtml(liste) {
    const epochen = Object.keys(EPOCHEN).filter(k => liste.some(x => this.person(x.w).epoche === k));
    const personen = [...new Set(liste.map(x => x.w.von))]
      .sort((a, b) => this.person({ von: a }).name.localeCompare(this.person({ von: b }).name, 'de'));

    return `
      <div class="filter-leiste" role="group" aria-label="Nach Epoche filtern">
        <button type="button" class="filter-chip ${this.filterEpoche ? '' : 'aktiv'}" data-aktion="filter-epoche" data-wert="">Alle</button>
        ${epochen.map(k => `
          <button type="button" class="filter-chip ${this.filterEpoche === k ? 'aktiv' : ''}" data-aktion="filter-epoche" data-wert="${k}"
                  style="--kat: var(--farbe-${EPOCHEN[k].farbe})">
            <span class="epoche-punkt"></span>${esc(EPOCHEN[k].name)}
          </button>`).join('')}
      </div>
      <select class="eingabe filter-person" name="filter-person" aria-label="Nach Philosoph filtern">
        <option value="">Alle Philosophen</option>
        ${personen.map(v => `<option value="${v}" ${this.filterPerson === v ? 'selected' : ''}>${esc(this.person({ von: v }).name)}</option>`).join('')}
      </select>`;
  },

  // Kleine Vorschau oben auf der Seite "Heute"
  vorschauHtml() {
    const w = this.fuerTag(Datum.heute());
    if (!w) return '';
    return `
      <a class="karte weisheit-vorschau" href="#weisheit" data-aktion="weisheit-vorschau"
         style="--kat: var(--farbe-${this.epoche(w).farbe})">
        <span class="vorschau-kopf">
          <span class="epoche-punkt"></span>Weisheit des Tages · ${esc(this.person(w).name)}${icon('chevron-right')}
        </span>
        <span class="vorschau-zitat">${esc(this.zitatText(w))}</span>
      </a>`;
  },


  /* ---------- 4. Die Seite ---------- */
  anzeigen(bereich) {
    this.bereich = bereich;
    this.notizenJetztSpeichern();
    const heute = Datum.heute();
    const heuteS = Datum.schluessel(heute);
    const verlauf = this.daten().verlauf;
    const tagesWeisheit = this.fuerTag(heute);

    let inhalt = '';
    if (this.ansicht === 'heute') {
      inhalt = tagesWeisheit
        ? this.karteHtml(tagesWeisheit, { tag: heuteS, mitNotiz: true, istHeute: true })
        : platzhalter('scroll-text', 'Keine Weisheiten gefunden', 'In der Datei wisdom.js stehen keine Einträge.');
    } else {
      // Liste für Archiv oder Favoriten zusammenstellen
      let liste;
      if (this.ansicht === 'archiv') {
        liste = Object.keys(verlauf).filter(t => t < heuteS).sort().reverse()
          .map(tag => ({ tag, w: this.eintrag(verlauf[tag]) }))
          .filter(x => x.w)
          .map(x => ({ ...x, kopf: Datum.lang(Datum.ausSchluessel(x.tag)) }));
      } else {
        liste = this.daten().favoriten.slice().reverse()
          .map(id => ({ w: this.eintrag(id), tag: this.letzterTag(id) }))
          .filter(x => x.w)
          .map(x => ({ ...x, kopf: this.epoche(x.w).name }));
      }

      const gefiltert = liste.filter(x =>
        (!this.filterEpoche || this.person(x.w).epoche === this.filterEpoche) &&
        (!this.filterPerson || x.w.von === this.filterPerson));

      const leerText = this.ansicht === 'archiv'
        ? platzhalter('archive', 'Noch kein Archiv', 'Hier sammeln sich die Weisheiten der vergangenen Tage.')
        : platzhalter('heart', 'Noch keine Favoriten', 'Tippe bei einer Weisheit auf „Merken“, dann erscheint sie hier.');

      inhalt = !liste.length ? leerText : `
        ${this.filterHtml(liste)}
        ${gefiltert.length
          ? `<ul class="weisheit-liste">${gefiltert.map(x => this.eintragHtml(x.w, x.tag, x.kopf)).join('')}</ul>`
          : '<p class="karten-text leer-filter">Für diesen Filter gibt es keine Einträge.</p>'}`;
    }

    bereich.innerHTML = `
      ${seitenKopf('Weisheit', Datum.lang(heute))}
      ${auswahlGruppe('weisheit-ansicht', [
        { wert: 'heute', text: 'Heute', icon: 'sun' },
        { wert: 'archiv', text: 'Archiv', icon: 'archive' },
        { wert: 'favoriten', text: 'Favoriten', icon: 'heart' }
      ], this.ansicht)}
      ${inhalt}`;

    bereich.onclick = e => this.klick(e);
    bereich.oninput = e => this.eingabe(e);
    bereich.onchange = e => {
      if (e.target.name === 'filter-person') {
        this.filterPerson = e.target.value;
        Navigation.zeigen();
      }
    };
  },

  // Ganze Karte im Fenster öffnen (aus Archiv oder Favoriten)
  detailOeffnen(id, tag) {
    const w = this.eintrag(id);
    if (!w) return;
    const titel = tag ? Datum.lang(Datum.ausSchluessel(tag)) : 'Weisheit';
    const dialog = Dialog.oeffnen(titel, this.karteHtml(w, { tag, mitNotiz: !!tag }));
    const inhalt = dialog.querySelector('.blatt-inhalt');
    inhalt.addEventListener('click', e => this.klick(e));
    inhalt.addEventListener('input', e => this.eingabe(e));
    // Beim Schließen: Notiz sichern und Liste auffrischen (Herz/Notiz-Symbole)
    dialog.addEventListener('close', () => {
      this.notizenJetztSpeichern();
      if (Navigation.aktuelle === 'weisheit') Navigation.zeigen();
    }, { once: true });
  },


  /* ---------- 5. Bedienung ---------- */
  klick(e) {
    // Umschalter Heute / Archiv / Favoriten
    const knopf = e.target.closest('.auswahl-knopf');
    if (knopf && knopf.closest('[data-name="weisheit-ansicht"]')) {
      this.ansicht = knopf.dataset.wert;
      Navigation.zeigen();
      return;
    }

    const el = e.target.closest('[data-aktion]');
    if (!el) return;
    const karte = el.closest('[data-id]');
    const w = karte ? this.eintrag(karte.dataset.id) : null;

    switch (el.dataset.aktion) {
      case 'favorit': {
        const an = this.favoritUmschalten(w.id);
        el.classList.toggle('an', an);
        el.setAttribute('aria-pressed', an);
        el.querySelector('span').textContent = an ? 'Favorit' : 'Merken';
        meldung(an ? 'Zu den Favoriten hinzugefügt' : 'Aus den Favoriten entfernt');
        break;
      }
      case 'kopieren': this.kopieren(w); break;
      case 'teilen': this.teilen(w); break;
      case 'oeffnen': this.detailOeffnen(el.dataset.id, el.dataset.tag || null); break;
      case 'filter-epoche':
        this.filterEpoche = el.dataset.wert;
        Navigation.zeigen();
        break;
    }
  },

  // Notiz tippen → kurz nach dem letzten Tastendruck speichern
  eingabe(e) {
    const feld = e.target;
    if (!feld.matches('[data-notiz]')) return;
    const tag = feld.dataset.notiz;
    const wartend = this._wartendeNotizen[tag];
    if (wartend) clearTimeout(wartend.zeit);
    this._wartendeNotizen[tag] = {
      text: feld.value,
      zeit: setTimeout(() => this.notizSpeichern(tag, feld.value), 600)
    };
  }
};

// Als Seite anmelden
Seiten.weisheit = {
  titel: 'Weisheit',
  anzeigen: bereich => Weisheit.anzeigen(bereich)
};

// Wenn die App geschlossen oder in den Hintergrund geschickt wird: Notizen sichern
window.addEventListener('pagehide', () => Weisheit.notizenJetztSpeichern());
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') Weisheit.notizenJetztSpeichern();
});
