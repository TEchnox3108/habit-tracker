/* =========================================================
   calendar-data.js – Daten für den Reiter "Kalender"

   Alles liegt in Daten.zustand.kalender (wird also genauso
   gespeichert, exportiert und importiert wie der Rest):

   kalender: [{ id, name, farbe, icon, ausgeblendet }]
       wie bei Apple: Schule, Arbeit, Privat … mit eigener Farbe

   termine: [{
       id, titel,
       datum:      'JJJJ-MM-TT'  erster Tag
       endDatum:   'JJJJ-MM-TT'  letzter Tag (meist = datum)
       ganztaegig: true/false
       start, ende: 'HH:MM' (bei ganztägig null)
       wiederholung: { art: 'keine'|'taeglich'|'woechentlich'|'monatlich'|'jaehrlich',
                       tage: [0–6] (nur wöchentlich, 0 = So),
                       intervall: 1 (= jede Woche, 2 = jede zweite …),
                       bis: 'JJJJ-MM-TT' oder null,
                       ausnahmen: ['JJJJ-MM-TT'] (einzeln gelöschte Tage) }
       kalenderId, ort, notiz,
       erinnerung: Minuten vorher oder null,
       erstellt, geaendert
   }]

   projekte: [{ id, titel, deadline: 'JJJJ-MM-TT' oder null,
                kalenderId, schritte: [{ id, text, erledigt }],
                fortschritt: 0–100 (nur wenn es keine Teilschritte gibt),
                notiz, erledigt, erstellt, geaendert }]

   Wiederkehrende Termine werden NICHT vervielfacht gespeichert:
   gespeichert ist nur die Regel, vorkommen() rechnet die
   einzelnen Tage für einen Zeitraum aus.
   ========================================================= */

const KalenderDaten = {
  // Kurzer Zugriff auf den Kalender-Bereich der Daten
  get bereich() { return Daten.zustand.kalender; },

  /* ---------- Kleine Zeit-Helfer ---------- */

  // '14:30' -> 870 (Minuten seit Mitternacht)
  minuten(zeit) {
    if (!zeit) return null;
    const [h, m] = zeit.split(':').map(Number);
    return h * 60 + m;
  },

  // 870 -> '14:30'
  zeitText(minuten) {
    const h = Math.floor(minuten / 60) % 24;
    const m = minuten % 60;
    return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
  },

  // Anzahl Tage zwischen zwei Tages-Schlüsseln ('2026-11-08' -> '2026-11-10' = 2)
  tageZwischen(von, bis) {
    const a = Datum.ausSchluessel(von);
    const b = Datum.ausSchluessel(bis);
    return Math.round((b - a) / 86400000);
  },

  // Tages-Schlüssel + n Tage
  plusTage(schluessel, n) {
    return Datum.schluessel(Datum.plusTage(Datum.ausSchluessel(schluessel), n));
  },


  /* ---------- Kalender (Schule, Arbeit, …) ---------- */

  kalenderListe() { return this.bereich.kalender; },

  kalender(id) {
    return this.bereich.kalender.find(k => k.id === id) || null;
  },

  // Kalender, in den ein Termin gehört (fällt zurück auf den Standard-Kalender)
  kalenderVon(eintrag) {
    return this.kalender(eintrag.kalenderId) || this.kalender(this.bereich.standardKalender) || this.bereich.kalender[0] || null;
  },

  // Sucht einen Kalender über seinen Namen ("schule" findet "Schule")
  kalenderNachName(name) {
    const gesucht = String(name || '').trim().toLowerCase();
    if (!gesucht) return null;
    return this.bereich.kalender.find(k => k.name.toLowerCase() === gesucht)
      || this.bereich.kalender.find(k => k.name.toLowerCase().startsWith(gesucht))
      || null;
  },

  // Für ein #Tag: vorhandenen Kalender finden oder einen neuen anlegen
  kalenderFuerTag(name) {
    const vorhanden = this.kalenderNachName(name);
    if (vorhanden) return vorhanden;
    // neue Farbe: die erste, die noch kein Kalender benutzt
    const benutzt = this.bereich.kalender.map(k => k.farbe);
    const farbe = (KONFIG.farben.find(f => !benutzt.includes(f.id)) || KONFIG.farben[0]).id;
    const neu = {
      id: Daten.neueId(),
      name: name.charAt(0).toUpperCase() + name.slice(1),
      farbe, icon: 'calendar', ausgeblendet: false
    };
    this.bereich.kalender.push(neu);
    Daten.speichern();
    return neu;
  },

  kalenderSpeichern(kalender) {
    const liste = this.bereich.kalender;
    const i = liste.findIndex(k => k.id === kalender.id);
    if (i >= 0) liste[i] = { ...liste[i], ...kalender };
    else liste.push({ ausgeblendet: false, icon: 'calendar', ...kalender, id: Daten.neueId() });
    Daten.speichern();
  },

  // Löscht einen Kalender. Seine Termine/Projekte wandern in den Standard-Kalender.
  kalenderLoeschen(id) {
    const b = this.bereich;
    if (b.kalender.length <= 1) return; // mindestens ein Kalender bleibt
    b.kalender = b.kalender.filter(k => k.id !== id);
    if (b.standardKalender === id) b.standardKalender = b.kalender[0].id;
    b.termine.forEach(t => { if (t.kalenderId === id) t.kalenderId = b.standardKalender; });
    b.projekte.forEach(p => { if (p.kalenderId === id) p.kalenderId = b.standardKalender; });
    Daten.speichern();
  },

  istSichtbar(eintrag) {
    const k = this.kalenderVon(eintrag);
    return !k || !k.ausgeblendet;
  },


  /* ---------- Termine ---------- */

  // Ein Termin mit allen Feldern (fehlende bekommen Standardwerte)
  terminVorlage(werte = {}) {
    const heute = Datum.schluessel(Datum.heute());
    const t = {
      id: null,
      titel: '',
      datum: heute,
      endDatum: null,
      ganztaegig: true,
      start: null,
      ende: null,
      kalenderId: this.bereich.standardKalender,
      ort: '',
      notiz: '',
      erinnerung: null,
      erstellt: new Date().toISOString(),
      geaendert: null,
      ...werte,
      wiederholung: {
        art: 'keine', tage: [], intervall: 1, bis: null, ausnahmen: [],
        ...(werte.wiederholung || {})
      }
    };
    if (!t.endDatum || t.endDatum < t.datum) t.endDatum = t.datum;
    if (t.ganztaegig) { t.start = null; t.ende = null; }
    return t;
  },

  termin(id) {
    return this.bereich.termine.find(t => t.id === id) || null;
  },

  // Neu anlegen (ohne id) oder ändern (mit id). Gibt den gespeicherten Termin zurück.
  terminSpeichern(werte) {
    const liste = this.bereich.termine;
    const i = werte.id ? liste.findIndex(t => t.id === werte.id) : -1;
    let termin;
    if (i >= 0) {
      termin = this.terminVorlage({ ...liste[i], ...werte, geaendert: new Date().toISOString() });
      liste[i] = termin;
    } else {
      termin = this.terminVorlage({ ...werte, id: Daten.neueId() });
      liste.push(termin);
    }
    Daten.speichern();
    return termin;
  },

  terminLoeschen(id) {
    this.bereich.termine = this.bereich.termine.filter(t => t.id !== id);
    Daten.speichern();
  },

  // Bei einer Serie nur einen einzelnen Tag entfernen
  vorkommenLoeschen(id, tag) {
    const t = this.termin(id);
    if (!t) return;
    if (!t.wiederholung.ausnahmen.includes(tag)) t.wiederholung.ausnahmen.push(tag);
    Daten.speichern();
  },

  // Kopie eines Termins (gleiche Daten, neue id)
  terminDuplizieren(id) {
    const t = this.termin(id);
    if (!t) return null;
    const kopie = JSON.parse(JSON.stringify(t));
    delete kopie.id;
    kopie.erstellt = new Date().toISOString();
    kopie.geaendert = null;
    return this.terminSpeichern(kopie);
  },

  // Passt ein wiederkehrender Termin auf diesen Tag?
  passtAufTag(t, tag) {
    const w = t.wiederholung;
    const abstand = this.tageZwischen(t.datum, tag);
    if (abstand < 0) return false;
    if (w.bis && tag > w.bis) return false;
    if (w.ausnahmen.includes(tag)) return false;
    const intervall = Math.max(1, w.intervall || 1);
    const start = Datum.ausSchluessel(t.datum);
    const d = Datum.ausSchluessel(tag);
    switch (w.art) {
      case 'taeglich':
        return abstand % intervall === 0;
      case 'woechentlich': {
        const tage = w.tage && w.tage.length ? w.tage : [start.getDay()];
        if (!tage.includes(d.getDay())) return false;
        // Wochen ab dem Montag der Startwoche zählen
        const versatz = (start.getDay() + 6) % 7;
        return Math.floor((abstand + versatz) / 7) % intervall === 0;
      }
      case 'monatlich': {
        const monate = (d.getFullYear() - start.getFullYear()) * 12 + d.getMonth() - start.getMonth();
        return d.getDate() === start.getDate() && monate % intervall === 0;
      }
      case 'jaehrlich':
        return d.getDate() === start.getDate() && d.getMonth() === start.getMonth()
          && (d.getFullYear() - start.getFullYear()) % intervall === 0;
      default:
        return abstand === 0;
    }
  },

  /* Alle Termine, die in einen Zeitraum fallen (Serien ausgerechnet).
     von/bis: Tages-Schlüssel (beide einschließlich).
     Ergebnis: [{ schluessel, termin, datum, endDatum, start, ende, ganztaegig, kalender }]
     sortiert nach Tag, dann ganztägig zuerst, dann Uhrzeit. */
  vorkommen(von, bis, { auchAusgeblendete = false } = {}) {
    const liste = [];
    this.bereich.termine.forEach(t => {
      if (!auchAusgeblendete && !this.istSichtbar(t)) return;
      const spanne = this.tageZwischen(t.datum, t.endDatum || t.datum);
      const hinzu = tag => liste.push({
        schluessel: t.id + '@' + tag,
        termin: t,
        datum: tag,
        endDatum: this.plusTage(tag, spanne),
        start: t.start,
        ende: t.ende,
        ganztaegig: t.ganztaegig,
        kalender: this.kalenderVon(t)
      });

      if (t.wiederholung.art === 'keine') {
        if (t.datum <= bis && (t.endDatum || t.datum) >= von) hinzu(t.datum);
        return;
      }
      // Serie: jeden Tag im Zeitraum prüfen (mehrtägige Termine dürfen vorher beginnen)
      let tag = this.plusTage(von, -spanne);
      if (tag < t.datum) tag = t.datum;
      const letzter = t.wiederholung.bis && t.wiederholung.bis < bis ? t.wiederholung.bis : bis;
      while (tag <= letzter) {
        if (this.passtAufTag(t, tag)) hinzu(tag);
        tag = this.plusTage(tag, 1);
      }
    });
    return liste.sort((a, b) =>
      a.datum.localeCompare(b.datum)
      || (b.ganztaegig - a.ganztaegig)
      || String(a.start).localeCompare(String(b.start))
      || a.termin.titel.localeCompare(b.termin.titel));
  },


  /* ---------- Projekte ---------- */

  projektVorlage(werte = {}) {
    return {
      id: null,
      titel: '',
      deadline: null,
      kalenderId: this.bereich.standardKalender,
      schritte: [],
      fortschritt: 0,
      notiz: '',
      erledigt: false,
      erstellt: new Date().toISOString(),
      geaendert: null,
      ...werte
    };
  },

  projekt(id) {
    return this.bereich.projekte.find(p => p.id === id) || null;
  },

  projektSpeichern(werte) {
    const liste = this.bereich.projekte;
    const i = werte.id ? liste.findIndex(p => p.id === werte.id) : -1;
    let projekt;
    if (i >= 0) {
      projekt = this.projektVorlage({ ...liste[i], ...werte, geaendert: new Date().toISOString() });
      liste[i] = projekt;
    } else {
      projekt = this.projektVorlage({ ...werte, id: Daten.neueId() });
      liste.push(projekt);
    }
    Daten.speichern();
    return projekt;
  },

  projektLoeschen(id) {
    this.bereich.projekte = this.bereich.projekte.filter(p => p.id !== id);
    Daten.speichern();
  },

  // Fortschritt in Prozent: aus den Teilschritten, sonst der eingestellte Wert
  projektFortschritt(p) {
    if (p.erledigt) return 100;
    if (p.schritte.length) {
      return Math.round(p.schritte.filter(s => s.erledigt).length / p.schritte.length * 100);
    }
    return p.fortschritt || 0;
  },

  // Noch wie viele Tage bis zur Deadline? (negativ = überfällig, null = keine Deadline)
  tageBisDeadline(p) {
    if (!p.deadline) return null;
    return this.tageZwischen(Datum.schluessel(Datum.heute()), p.deadline);
  },

  // Projekte mit Deadline in einem Zeitraum (für die Kalenderansichten)
  deadlines(von, bis, { auchAusgeblendete = false } = {}) {
    return this.bereich.projekte
      .filter(p => p.deadline && p.deadline >= von && p.deadline <= bis)
      .filter(p => auchAusgeblendete || this.istSichtbar(p))
      .map(p => ({ projekt: p, datum: p.deadline, kalender: this.kalenderVon(p) }));
  },


  /* ---------- Quick Add -> echter Eintrag ---------- */

  // Nimmt das Ergebnis von QuickAdd.parse() und speichert Termin bzw. Projekt
  ausQuickAdd(e) {
    const kalender = e.kategorie ? this.kalenderFuerTag(e.kategorie) : this.kalenderVon({});
    const kalenderId = kalender ? kalender.id : this.bereich.standardKalender;
    if (e.art === 'projekt') {
      return { art: 'projekt', eintrag: this.projektSpeichern({ titel: e.titel, deadline: e.datum, kalenderId }) };
    }
    return {
      art: 'termin',
      eintrag: this.terminSpeichern({
        titel: e.titel,
        datum: e.datum,
        endDatum: e.endDatum,
        ganztaegig: e.ganztaegig,
        start: e.start,
        ende: e.ende,
        wiederholung: e.wiederholung,
        ort: e.ort || '',
        kalenderId
      })
    };
  },


  /* ---------- Nach einem Import: alles vollständig machen ---------- */
  auffuellen() {
    const b = this.bereich;
    if (!Array.isArray(b.kalender) || !b.kalender.length) b.kalender = Daten.kalenderStandard().kalender;
    if (!Array.isArray(b.termine)) b.termine = [];
    if (!Array.isArray(b.projekte)) b.projekte = [];
    if (!this.kalender(b.standardKalender)) b.standardKalender = b.kalender[0].id;
    b.kalender = b.kalender.map(k => ({ farbe: 'salbei', icon: 'calendar', ausgeblendet: false, ...k }));
    b.termine = b.termine.map(t => this.terminVorlage(t));
    b.projekte = b.projekte.map(p => this.projektVorlage(p));
  }
};
