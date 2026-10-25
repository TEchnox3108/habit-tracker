/* =========================================================
   stats.js – Die Seite "Statistik"

   Inhalt der Seite:
   - Kacheln: Heute, diese Woche, beste Serie, letzte 30 Tage
   - Kalender (Heatmap wie bei GitHub) für alle Gewohnheiten
   - Wochen-/Monatsübersicht pro Kategorie mit Erfolgsquote
   - Verlauf als Diagramm für Zähler- und Zahlen-Gewohnheiten
   - Liste aller Gewohnheiten mit Serien → Tipp öffnet Details

   Aufbau dieser Datei:
   1. Berechnungen (Serien, Quoten, Tageswerte)
   2. Bausteine (Kacheln, Heatmap, Diagramm)
   3. Die Seite
   4. Detailansicht einer Gewohnheit
   ========================================================= */

const Statistik = {
  // Einstellungen der Seite (bleiben erhalten, solange die App offen ist)
  zeitraum: 'woche',    // 'woche' oder 'monat'
  versatz: 0,           // 0 = aktuelle Woche/Monat, -1 = davor ...
  verlaufId: null,      // welche Gewohnheit im Diagramm gezeigt wird
  verlaufTage: 30,      // 7, 30 oder 90 Tage
  diagramme: {},        // offene Chart.js-Diagramme (zum Aufräumen)
  bereich: null,


  /* ---------- 1. Berechnungen ---------- */

  heuteS() {
    return Datum.schluessel(Datum.heute());
  },

  // Nur sichtbare Gewohnheiten (nicht ausgeblendet, Kategorie nicht ausgeblendet)
  sichtbare() {
    return Daten.zustand.kategorien
      .filter(k => !k.ausgeblendet)
      .flatMap(k => Daten.gewohnheitenVon(k.id).filter(g => !g.ausgeblendet));
  },

  // Ab wann zählt eine Gewohnheit? Erstelldatum – oder früher, falls nachgetragen wurde
  startVon(g) {
    // Einmal pro Anzeige ausrechnen, wann jede Gewohnheit ihren ersten Eintrag hat
    if (!this._ersteEintraege) {
      this._ersteEintraege = {};
      Object.keys(Daten.zustand.eintraege).sort().forEach(tag => {
        Object.keys(Daten.zustand.eintraege[tag]).forEach(id => {
          if (!this._ersteEintraege[id]) this._ersteEintraege[id] = tag;
        });
      });
    }
    const erster = this._ersteEintraege[g.id];
    return erster && erster < g.erstellt ? erster : g.erstellt;
  },

  // Ist die Gewohnheit an diesem Datum laut Plan dran? ("X-mal pro Woche" wird extra behandelt)
  geplant(g, datum) {
    const h = g.haeufigkeit;
    if (h.art === 'wochentage') return h.tage.includes(datum.getDay());
    return h.art === 'taeglich';
  },

  istProWoche(g) {
    return g.haeufigkeit.art === 'proWoche';
  },

  // Serien: wie oft hintereinander geschafft?
  // Tage, an denen die Gewohnheit nicht dran ist, unterbrechen nicht.
  // Heute zählt erst, wenn es geschafft ist (bricht die Serie aber nicht).
  // Bei "X-mal pro Woche" wird in Wochen gezählt.
  serie(g) {
    const heute = Datum.heute();
    const start = Datum.ausSchluessel(this.startVon(g));
    let lauf = 0;
    let laengste = 0;

    if (this.istProWoche(g)) {
      let woche = Datum.wocheVon(start)[0];
      const dieseWoche = Datum.wocheVon(heute)[0];
      while (woche <= dieseWoche) {
        const geschafft = Daten.wochenErledigt(g, woche) >= g.haeufigkeit.anzahl;
        if (geschafft) laengste = Math.max(laengste, ++lauf);
        else if (woche < dieseWoche) lauf = 0;
        woche = Datum.plusTage(woche, 7);
      }
      return { aktuell: lauf, laengste, einheit: lauf === 1 ? 'Woche' : 'Wochen', einheitRekord: laengste === 1 ? 'Woche' : 'Wochen' };
    }

    for (let d = start; d <= heute; d = Datum.plusTage(d, 1)) {
      if (!this.geplant(g, d)) continue;
      const tag = Datum.schluessel(d);
      if (Daten.istErledigt(g, tag)) laengste = Math.max(laengste, ++lauf);
      else if (tag !== this.heuteS()) lauf = 0;
    }
    return { aktuell: lauf, laengste, einheit: lauf === 1 ? 'Tag' : 'Tage', einheitRekord: laengste === 1 ? 'Tag' : 'Tage' };
  },

  // Bilanz in einem Zeitraum: { geschafft, geplant }
  // Heute zählt nur, wenn schon geschafft. Bei "X-mal pro Woche" zählt das Wochenziel.
  bilanz(g, von, bis) {
    const heuteS = this.heuteS();
    const start = this.startVon(g);
    const imBereich = d => {
      const s = Datum.schluessel(d);
      return d >= von && d <= bis && s >= start && s <= heuteS;
    };
    let geschafft = 0;
    let geplant = 0;

    if (this.istProWoche(g)) {
      for (let woche = Datum.wocheVon(von)[0]; woche <= bis; woche = Datum.plusTage(woche, 7)) {
        const tage = Datum.wocheVon(woche);
        const relevant = tage.filter(imBereich);
        if (!relevant.length) continue;
        const n = relevant.filter(d => Daten.istErledigt(g, Datum.schluessel(d))).length;
        const vorbei = Datum.schluessel(tage[6]) < heuteS;
        // Angeschnittene Wochen (z. B. am Monatsanfang) zählen anteilig
        const ziel = vorbei ? Math.max(1, Math.round(g.haeufigkeit.anzahl * relevant.length / 7)) : Math.min(n, g.haeufigkeit.anzahl);
        geplant += ziel;
        geschafft += Math.min(n, ziel);
      }
      return { geschafft, geplant };
    }

    for (let d = new Date(von); d <= bis; d = Datum.plusTage(d, 1)) {
      if (!imBereich(d) || !this.geplant(g, d)) continue;
      const tag = Datum.schluessel(d);
      const erledigt = Daten.istErledigt(g, tag);
      if (tag === heuteS && !erledigt) continue;
      geplant++;
      if (erledigt) geschafft++;
    }
    return { geschafft, geplant };
  },

  // Bilanz mehrerer Gewohnheiten zusammengezählt
  bilanzVon(gewohnheiten, von, bis) {
    return gewohnheiten.reduce((summe, g) => {
      const b = this.bilanz(g, von, bis);
      return { geschafft: summe.geschafft + b.geschafft, geplant: summe.geplant + b.geplant };
    }, { geschafft: 0, geplant: 0 });
  },

  quote(b) {
    return b.geplant ? Math.round(b.geschafft / b.geplant * 100) : null;
  },

  quoteText(b) {
    const q = this.quote(b);
    return q === null ? '–' : `${q}%`;
  },

  // Wie gut war ein einzelner Tag? 0 bis 1, oder null (nichts geplant / Zukunft)
  tagesWert(gewohnheiten, datum) {
    const tag = Datum.schluessel(datum);
    if (tag > this.heuteS()) return null;
    let summe = 0;
    let anzahl = 0;
    gewohnheiten.forEach(g => {
      if (tag < this.startVon(g)) return;
      if (this.istProWoche(g)) {
        // "X-mal pro Woche" zählt nur an Tagen, an denen es gemacht wurde (als Bonus)
        if (Daten.istErledigt(g, tag)) { summe += 1; anzahl += 1; }
      } else if (this.geplant(g, datum)) {
        summe += Daten.fortschritt(g, tag);
        anzahl += 1;
      }
    });
    return anzahl ? summe / anzahl : null;
  },

  // Tageswert → Farbstufe 0 bis 4 (oder "leer")
  stufe(wert) {
    if (wert === null) return 'leer';
    if (wert === 0) return 0;
    if (wert < 0.34) return 1;
    if (wert < 0.67) return 2;
    if (wert < 1) return 3;
    return 4;
  },


  /* ---------- 2. Bausteine ---------- */

  kachel(iconName, titel, wert, text) {
    return `
      <div class="kachel">
        <span class="kachel-titel">${icon(iconName)}${esc(titel)}</span>
        <strong>${esc(wert)}</strong>
        <small>${esc(text)}</small>
      </div>`;
  },

  // Kalender-Heatmap: Spalten = Wochen, Zeilen = Wochentage
  heatmap(gewohnheiten, wochen = 26) {
    const heute = Datum.heute();
    const ersteWoche = Datum.plusTage(Datum.wocheVon(heute)[0], -(wochen - 1) * 7);
    const reihenfolge = Datum.wocheVon(heute).map(d => Datum.WOCHENTAGE_KURZ[d.getDay()]);

    // Linke Spalte: Wochentage (nur jeden zweiten beschriften, damit es luftig bleibt)
    let html = `<div class="hm-spalte hm-beschriftung"><span class="hm-monat"></span>${
      reihenfolge.map((name, i) => `<span>${i % 2 === 0 ? name : ''}</span>`).join('')}</div>`;

    for (let w = 0; w < wochen; w++) {
      const tage = Datum.wocheVon(Datum.plusTage(ersteWoche, w * 7));
      // Monatsname über der Spalte, in der ein neuer Monat beginnt
      const monatsErster = tage.find(d => d.getDate() === 1);
      const monatsName = monatsErster
        ? monatsErster.toLocaleDateString('de-DE', { month: 'short' }).replace('.', '') : '';

      html += `<div class="hm-spalte"><span class="hm-monat">${monatsName}</span>${tage.map(d => {
        if (d > heute) return '<span class="hm-zelle zukunft"></span>';
        const wert = this.tagesWert(gewohnheiten, d);
        const titel = `${Datum.kurz(d)}: ${wert === null ? 'nichts geplant' : Math.round(wert * 100) + ' %'}`;
        return `<span class="hm-zelle stufe-${this.stufe(wert)}" title="${titel}"></span>`;
      }).join('')}</div>`;
    }

    return `
      <div class="heatmap-rahmen"><div class="heatmap">${html}</div></div>
      <div class="hm-legende">
        <span>weniger</span>
        ${[0, 1, 2, 3, 4].map(s => `<span class="hm-zelle stufe-${s}"></span>`).join('')}
        <span>mehr</span>
      </div>`;
  },

  // Heatmaps beim Öffnen ganz nach rechts (zu heute) scrollen
  heatmapsAnsEnde(wurzel) {
    wurzel.querySelectorAll('.heatmap-rahmen').forEach(r => { r.scrollLeft = r.scrollWidth; });
  },

  // Balken-Diagramm mit Chart.js für Zähler/Zahlen
  diagrammZeichnen(canvas, g, tage, name) {
    if (this.diagramme[name]) this.diagramme[name].destroy();
    if (!window.Chart) {
      canvas.parentElement.innerHTML = '<p class="karten-text">Diagramme brauchen eine Internetverbindung.</p>';
      return;
    }

    const css = getComputedStyle(document.documentElement);
    const farbe = n => css.getPropertyValue(n).trim();
    Chart.defaults.font.family = css.getPropertyValue('--schrift');
    const kategorie = Daten.kategorie(g.kategorieId);
    const katFarbe = farbe(`--farbe-${kategorie ? kategorie.farbe : 'salbei'}`);

    const heute = Datum.heute();
    const daten = [];
    for (let i = tage - 1; i >= 0; i--) daten.push(Datum.plusTage(heute, -i));
    const werte = daten.map(d => Daten.wert(Datum.schluessel(d), g.id));
    const einheit = g.einheit ? ' ' + g.einheit : '';

    const datensaetze = [{
      type: 'bar',
      label: g.name,
      data: werte,
      backgroundColor: katFarbe,
      borderRadius: 5,
      maxBarThickness: 22
    }];
    if (g.ziel != null) {
      datensaetze.push({
        type: 'line',
        label: g.richtung === 'negativ' ? 'Höchstwert' : 'Ziel',
        data: daten.map(() => g.ziel),
        borderColor: farbe('--text-3'),
        borderDash: [5, 5],
        borderWidth: 1.5,
        pointRadius: 0,
        pointHoverRadius: 0
      });
    }

    this.diagramme[name] = new Chart(canvas, {
      data: { labels: daten.map(d => d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })), datasets: datensaetze },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 400 },
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: farbe('--text'),
            titleColor: farbe('--hintergrund'),
            bodyColor: farbe('--hintergrund'),
            displayColors: false,
            padding: 10,
            cornerRadius: 10,
            callbacks: {
              label: c => c.raw == null ? `${c.dataset.label}: –` : `${c.dataset.label}: ${zahl(c.raw)}${einheit}`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: { color: farbe('--text-3'), maxRotation: 0, autoSkip: true, maxTicksLimit: 6 }
          },
          y: {
            beginAtZero: true,
            grid: { color: farbe('--linie') },
            border: { display: false },
            ticks: { color: farbe('--text-3'), maxTicksLimit: 5, callback: v => zahl(v) }
          }
        }
      }
    });
  },


  /* ---------- 3. Die Seite ---------- */

  // Start und Ende des gewählten Zeitraums (Woche oder Monat)
  zeitraumGrenzen() {
    const heute = Datum.heute();
    if (this.zeitraum === 'woche') {
      const tage = Datum.wocheVon(Datum.plusTage(heute, this.versatz * 7));
      return { von: tage[0], bis: tage[6], tage, titel: `${Datum.kurz(tage[0]).slice(0, 6)} – ${Datum.kurz(tage[6])}` };
    }
    const von = new Date(heute.getFullYear(), heute.getMonth() + this.versatz, 1);
    const bis = new Date(von.getFullYear(), von.getMonth() + 1, 0);
    return { von, bis, tage: [], titel: von.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' }) };
  },

  kategorienHtml() {
    const z = this.zeitraumGrenzen();
    const kategorien = Daten.zustand.kategorien.filter(k => !k.ausgeblendet);

    const zeilen = kategorien.map(k => {
      const gewohnheiten = Daten.gewohnheitenVon(k.id).filter(g => !g.ausgeblendet);
      if (!gewohnheiten.length) return '';
      const b = this.bilanzVon(gewohnheiten, z.von, z.bis);
      const q = this.quote(b);

      // Woche: 7 kleine Felder unter dem Namen (ein Feld pro Tag). Monat: Balken + "x von y".
      const unterzeile = this.zeitraum === 'woche'
        ? `<span class="tage-reihe">${z.tage.map(d => `<span class="hm-zelle stufe-${this.stufe(this.tagesWert(gewohnheiten, d))}" title="${Datum.kurz(d)}"></span>`).join('')}</span>`
        : `<small>${b.geplant ? `${b.geschafft} von ${b.geplant} geschafft` : 'noch keine Daten'}</small>`;
      const balken = this.zeitraum === 'monat'
        ? `<span class="quote-balken"><span style="width: ${q ?? 0}%"></span></span>` : '';

      return `
        <li class="kat-zeile" style="--kat: var(--farbe-${k.farbe})">
          <span class="icon-feld klein">${icon(k.icon)}</span>
          <span class="titel-text">
            <strong>${esc(k.name)}</strong>
            ${unterzeile}
          </span>
          ${balken}
          <span class="quote">${this.quoteText(b)}</span>
        </li>`;
    }).join('');

    const kopfTage = this.zeitraum === 'woche'
      ? `<div class="tage-kopf">${z.tage.map(d => `<span>${Datum.WOCHENTAGE_KURZ[d.getDay()].charAt(0)}</span>`).join('')}</div>` : '';

    return `
      <section class="karte">
        <div class="karten-kopf">
          <h2 class="karten-titel">Kategorien</h2>
          ${auswahlGruppe('zeitraum', [{ wert: 'woche', text: 'Woche' }, { wert: 'monat', text: 'Monat' }], this.zeitraum)}
        </div>
        <div class="zeitraum-wahl">
          <button type="button" class="icon-knopf" data-aktion="zeitraum-zurueck" aria-label="Früher">${icon('chevron-left')}</button>
          <span>${esc(z.titel)}</span>
          <button type="button" class="icon-knopf" data-aktion="zeitraum-vor" aria-label="Später" ${this.versatz >= 0 ? 'disabled' : ''}>${icon('chevron-right')}</button>
        </div>
        ${kopfTage}
        <ul class="kat-liste ${this.zeitraum}">${zeilen}</ul>
      </section>`;
  },

  verlaufHtml(zahlGewohnheiten) {
    if (!zahlGewohnheiten.length) return '';
    if (!zahlGewohnheiten.some(g => g.id === this.verlaufId)) this.verlaufId = zahlGewohnheiten[0].id;
    return `
      <section class="karte">
        <div class="karten-kopf">
          <h2 class="karten-titel">Verlauf</h2>
          ${auswahlGruppe('verlauf-tage', [{ wert: 7, text: '7 T' }, { wert: 30, text: '30 T' }, { wert: 90, text: '90 T' }], this.verlaufTage)}
        </div>
        <select class="eingabe verlauf-wahl" name="verlauf">
          ${zahlGewohnheiten.map(g => `<option value="${g.id}" ${g.id === this.verlaufId ? 'selected' : ''}>${esc(g.name)}${g.einheit ? ` (${esc(g.einheit)})` : ''}</option>`).join('')}
        </select>
        <div class="diagramm"><canvas data-diagramm="haupt"></canvas></div>
      </section>`;
  },

  gewohnheitenHtml(gewohnheiten) {
    const heute = Datum.heute();
    const vor30 = Datum.plusTage(heute, -29);
    const zeilen = gewohnheiten.map(g => {
      const s = this.serie(g);
      const k = Daten.kategorie(g.kategorieId);
      return `
        <li>
          <button type="button" class="zeilen-knopf statistik-zeile" data-aktion="details" data-id="${g.id}" style="--kat: var(--farbe-${k.farbe})">
            <span class="icon-feld klein">${icon(g.icon)}</span>
            <span class="titel-text">
              <strong>${esc(g.name)}</strong>
              <small class="serien">
                <span class="${s.aktuell ? 'feuer' : ''}">${icon('flame')}${s.aktuell} ${s.einheit}</span>
                <span>${icon('trophy')}Rekord ${s.laengste}</span>
              </small>
            </span>
            <span class="quote" title="Erfolgsquote der letzten 30 Tage">${this.quoteText(this.bilanz(g, vor30, heute))}</span>
            ${icon('chevron-right')}
          </button>
        </li>`;
    }).join('');

    return `
      <section class="karte">
        <div class="karten-kopf">
          <h2 class="karten-titel">Gewohnheiten</h2>
          <span class="karten-text">Quote: letzte 30 Tage</span>
        </div>
        <ul class="statistik-liste">${zeilen}</ul>
      </section>`;
  },

  anzeigen(bereich) {
    this.bereich = bereich;
    this._ersteEintraege = null; // Daten können sich geändert haben → neu ausrechnen
    const heute = Datum.heute();
    const gewohnheiten = this.sichtbare();

    if (!gewohnheiten.length) {
      bereich.innerHTML = `
        ${seitenKopf('Statistik', 'Deine Fortschritte auf einen Blick')}
        ${platzhalter('chart-column', 'Noch keine Gewohnheiten', 'Lege unter „Gewohnheiten“ welche an – dann siehst du hier deine Fortschritte.')}`;
      return;
    }

    // Kacheln oben
    const faelligHeute = gewohnheiten.filter(g => Daten.istFaellig(g, heute));
    const heuteS = this.heuteS();
    const heuteGeschafft = faelligHeute.filter(g => Daten.istErledigt(g, heuteS)).length;
    const heuteProzent = faelligHeute.length
      ? Math.round(faelligHeute.reduce((s, g) => s + Daten.fortschritt(g, heuteS), 0) / faelligHeute.length * 100) : 0;
    const woche = Datum.wocheVon(heute);
    const wochenBilanz = this.bilanzVon(gewohnheiten, woche[0], woche[6]);
    const monatBilanz = this.bilanzVon(gewohnheiten, Datum.plusTage(heute, -29), heute);
    const serien = gewohnheiten.map(g => ({ g, s: this.serie(g) })).sort((a, b) => b.s.aktuell - a.s.aktuell);
    const beste = serien[0];

    const zahlGewohnheiten = gewohnheiten.filter(g => g.typ !== 'janein');

    bereich.innerHTML = `
      ${seitenKopf('Statistik', 'Deine Fortschritte auf einen Blick')}

      <div class="kacheln">
        ${this.kachel('sun', 'Heute', `${heuteProzent}%`, `${heuteGeschafft} von ${faelligHeute.length} erledigt`)}
        ${this.kachel('calendar-range', 'Diese Woche', this.quoteText(wochenBilanz), `${wochenBilanz.geschafft} von ${wochenBilanz.geplant} geschafft`)}
        ${this.kachel('flame', 'Beste Serie', `${beste.s.aktuell} ${beste.s.einheit}`, beste.s.aktuell ? beste.g.name : 'Fang heute an!')}
        ${this.kachel('calendar-check', '30 Tage', this.quoteText(monatBilanz), 'Erfolgsquote')}
      </div>

      <section class="karte" style="--kat: var(--akzent)">
        <div class="karten-kopf">
          <h2 class="karten-titel">Kalender</h2>
          <span class="karten-text">alle Gewohnheiten</span>
        </div>
        ${this.heatmap(gewohnheiten)}
      </section>

      ${this.kategorienHtml()}
      ${this.verlaufHtml(zahlGewohnheiten)}
      ${this.gewohnheitenHtml(gewohnheiten)}`;

    this.heatmapsAnsEnde(bereich);
    this.hauptDiagramm();

    bereich.onclick = e => this.klick(e);
    bereich.onchange = e => {
      if (e.target.name === 'verlauf') {
        this.verlaufId = e.target.value;
        this.hauptDiagramm();
      }
    };
  },

  hauptDiagramm() {
    const canvas = this.bereich.querySelector('[data-diagramm="haupt"]');
    const g = Daten.gewohnheit(this.verlaufId);
    if (canvas && g) this.diagrammZeichnen(canvas, g, this.verlaufTage, 'haupt');
  },

  klick(e) {
    const el = e.target.closest('[data-aktion], .auswahl-knopf');
    if (!el) return;

    // Woche/Monat bzw. 7/30/90 Tage umschalten
    if (el.classList.contains('auswahl-knopf')) {
      const gruppe = el.closest('.auswahl-gruppe').dataset.name;
      if (gruppe === 'zeitraum') { this.zeitraum = el.dataset.wert; this.versatz = 0; }
      if (gruppe === 'verlauf-tage') this.verlaufTage = Number(el.dataset.wert);
      this.teilNeu(gruppe);
      return;
    }

    const aktion = el.dataset.aktion;
    if (aktion === 'zeitraum-zurueck') { this.versatz -= 1; this.teilNeu('zeitraum'); }
    if (aktion === 'zeitraum-vor' && this.versatz < 0) { this.versatz += 1; this.teilNeu('zeitraum'); }
    if (aktion === 'details') this.detailsOeffnen(el.dataset.id);
  },

  // Nur den betroffenen Teil der Seite neu zeichnen
  teilNeu(teil) {
    if (teil === 'zeitraum') {
      const karte = this.bereich.querySelector('.kat-liste').closest('.karte');
      const vorlage = document.createElement('template');
      vorlage.innerHTML = this.kategorienHtml().trim();
      karte.replaceWith(vorlage.content.firstElementChild);
      iconsZeichnen();
    }
    if (teil === 'verlauf-tage') {
      this.bereich.querySelectorAll('[data-name="verlauf-tage"] .auswahl-knopf').forEach(k =>
        k.classList.toggle('aktiv', Number(k.dataset.wert) === this.verlaufTage));
      this.hauptDiagramm();
    }
  },


  /* ---------- 4. Detailansicht einer Gewohnheit ---------- */
  detailsOeffnen(id) {
    const g = Daten.gewohnheit(id);
    const k = Daten.kategorie(g.kategorieId);
    const heute = Datum.heute();
    const s = this.serie(g);
    const start = Datum.ausSchluessel(this.startVon(g));

    // Die letzten Notizen dieser Gewohnheit
    const notizen = Object.keys(Daten.zustand.eintraege).sort().reverse()
      .map(tag => ({ tag, notiz: (Daten.zustand.eintraege[tag][id] || {}).notiz }))
      .filter(n => n.notiz)
      .slice(0, 5);

    const dialog = Dialog.oeffnen(g.name, `
      <div class="details" style="--kat: var(--farbe-${k.farbe})">
        <p class="karten-text">${esc(k.name)} · ${esc(gewohnheitBeschreibung(g))}</p>
        <div class="kacheln">
          ${this.kachel('flame', 'Aktuelle Serie', `${s.aktuell} ${s.einheit}`, s.aktuell ? 'Weiter so!' : 'Heute neu starten')}
          ${this.kachel('trophy', 'Rekord', `${s.laengste} ${s.einheitRekord}`, 'längste Serie')}
          ${this.kachel('calendar-check', '30 Tage', this.quoteText(this.bilanz(g, Datum.plusTage(heute, -29), heute)), 'Erfolgsquote')}
          ${this.kachel('infinity', 'Gesamt', this.quoteText(this.bilanz(g, start, heute)), `seit ${Datum.kurz(start)}`)}
        </div>
        <h3 class="details-titel">Kalender</h3>
        ${this.heatmap([g], 20)}
        ${g.typ !== 'janein' ? `
          <h3 class="details-titel">Letzte 30 Tage</h3>
          <div class="diagramm"><canvas data-diagramm="detail"></canvas></div>` : ''}
        ${notizen.length ? `
          <h3 class="details-titel">Notizen</h3>
          <ul class="notiz-liste">${notizen.map(n => `
            <li><small>${Datum.kurz(Datum.ausSchluessel(n.tag))}</small><p>${esc(n.notiz)}</p></li>`).join('')}
          </ul>` : ''}
      </div>`);

    this.heatmapsAnsEnde(dialog);
    const canvas = dialog.querySelector('[data-diagramm="detail"]');
    if (canvas) this.diagrammZeichnen(canvas, g, 30, 'detail');
  }
};

// Als Seite anmelden
Seiten.statistik = {
  titel: 'Statistik',
  anzeigen: bereich => Statistik.anzeigen(bereich)
};
