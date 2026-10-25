/* =========================================================
   data.js – Speichern & Laden

   Alle deine Daten liegen in EINEM Objekt: Daten.zustand
     - einstellungen: Hell/Dunkel, Wochenstart
     - kategorien:    Liste der Kategorien (Reihenfolge = Anzeige)
     - gewohnheiten:  Liste aller Gewohnheiten (Reihenfolge = Anzeige)
     - eintraege:     was du an welchem Tag erledigt hast
   Der Browser merkt es sich im "localStorage" – das ist ein
   kleiner Speicher im Browser, der auch nach dem Schließen bleibt.

   Außerdem hier: Helfer für Datumsangaben (deutsches Format).
   ========================================================= */

const Daten = {
  // Hier liegen alle Daten, solange die App offen ist
  zustand: null,

  // So sehen die Daten aus, wenn die App zum ersten Mal startet
  standard() {
    return {
      version: 1,
      einstellungen: {
        design: 'system',    // 'system', 'hell' oder 'dunkel'
        wochenstart: 1,      // 1 = Montag, 0 = Sonntag
        letztesBackup: null  // Datum der letzten Sicherung, z. B. "2026-10-25"
      },
      ...this.startdaten(),
      eintraege: {}
    };
  },

  // Baut aus den Start-Kategorien in config.js echte Daten (mit IDs)
  startdaten() {
    const kategorien = [];
    const gewohnheiten = [];
    KONFIG.startKategorien.forEach(vorlage => {
      const id = this.neueId();
      kategorien.push({ id, name: vorlage.name, farbe: vorlage.farbe, icon: vorlage.icon, ausgeblendet: false });
      vorlage.gewohnheiten.forEach(g => {
        gewohnheiten.push(this.gewohnheitVorlage({ ...g, id: this.neueId(), kategorieId: id }));
      });
    });
    return { kategorien, gewohnheiten };
  },

  // Holt die gespeicherten Daten aus dem Browser
  laden() {
    const standard = this.standard();
    try {
      const roh = localStorage.getItem(KONFIG.speicherSchluessel);
      const gespeichert = roh ? JSON.parse(roh) : {};
      // Gespeichertes mit den Standardwerten mischen,
      // damit neue Bereiche automatisch einen Wert haben
      this.zustand = {
        ...standard,
        ...gespeichert,
        einstellungen: { ...standard.einstellungen, ...gespeichert.einstellungen }
      };
      // Beim allerersten Start die Startdaten gleich festhalten
      if (!gespeichert.kategorien) this.speichern();
    } catch (fehler) {
      console.warn('Daten konnten nicht geladen werden:', fehler);
      this.zustand = standard;
    }
  },

  // Schreibt die aktuellen Daten in den Browser-Speicher
  speichern() {
    try {
      localStorage.setItem(KONFIG.speicherSchluessel, JSON.stringify(this.zustand));
    } catch (fehler) {
      console.warn('Daten konnten nicht gespeichert werden:', fehler);
    }
  },

  /* ---------- Backup (Export/Import) & Zurücksetzen ---------- */

  // Alles, was in die Sicherungsdatei kommt
  exportDaten() {
    return {
      app: 'habit-tracker',
      exportiertAm: new Date().toISOString(),
      daten: this.zustand
    };
  },

  // Liest eine Sicherungsdatei ein und ERSETZT alle aktuellen Daten.
  // Wirft einen Fehler mit verständlicher Meldung, wenn die Datei nicht passt.
  importieren(inhalt) {
    const d = inhalt && inhalt.daten ? inhalt.daten : inhalt;
    if (!d || !Array.isArray(d.kategorien) || !Array.isArray(d.gewohnheiten) || typeof d.eintraege !== 'object') {
      throw new Error('Das ist keine gültige Sicherungsdatei dieser App.');
    }
    const standard = this.standard();
    this.zustand = {
      ...standard,
      ...d,
      einstellungen: { ...standard.einstellungen, ...d.einstellungen },
      // Fehlende Felder (z. B. aus älteren Versionen) mit Standardwerten auffüllen
      kategorien: d.kategorien.map(k => ({ farbe: 'salbei', icon: 'star', ausgeblendet: false, ...k })),
      gewohnheiten: d.gewohnheiten.map(g => this.gewohnheitVorlage(g)),
      eintraege: d.eintraege || {}
    };
    this.speichern();
  },

  // Alles löschen und mit den Start-Kategorien neu beginnen
  zuruecksetzen() {
    this.zustand = this.standard();
    this.speichern();
  },

  // Erzeugt eine eindeutige Kennung für neue Kategorien/Gewohnheiten
  _zaehler: 0,
  neueId() {
    this._zaehler += 1;
    return Date.now().toString(36) + this._zaehler.toString(36) + Math.random().toString(36).slice(2, 6);
  },


  /* ---------- Einstellungen ---------- */

  // Eine Einstellung lesen, z. B. Daten.einstellung('design')
  einstellung(name) {
    return this.zustand.einstellungen[name];
  },

  // Eine Einstellung ändern und sofort speichern
  einstellungSetzen(name, wert) {
    this.zustand.einstellungen[name] = wert;
    this.speichern();
  },


  /* ---------- Kategorien ---------- */

  kategorie(id) {
    return this.zustand.kategorien.find(k => k.id === id);
  },

  // Neue Kategorie anlegen (ohne id) oder vorhandene ändern (mit id)
  kategorieSpeichern(kategorie) {
    const vorhanden = kategorie.id && this.kategorie(kategorie.id);
    if (vorhanden) Object.assign(vorhanden, kategorie);
    else this.zustand.kategorien.push({ ...kategorie, id: this.neueId() });
    this.speichern();
  },

  // Löscht eine Kategorie MIT allen ihren Gewohnheiten und Einträgen
  kategorieLoeschen(id) {
    this.gewohnheitenVon(id).forEach(g => this._gewohnheitEntfernen(g.id));
    this.zustand.kategorien = this.zustand.kategorien.filter(k => k.id !== id);
    this.speichern();
  },


  /* ---------- Gewohnheiten ---------- */

  gewohnheit(id) {
    return this.zustand.gewohnheiten.find(g => g.id === id);
  },

  gewohnheitenVon(kategorieId) {
    return this.zustand.gewohnheiten.filter(g => g.kategorieId === kategorieId);
  },

  // Eine vollständige Gewohnheit mit allen Standardwerten
  gewohnheitVorlage(werte = {}) {
    const standardHaeufigkeit = { art: 'taeglich', tage: [1, 2, 3, 4, 5, 6, 0], anzahl: 3 };
    return {
      id: null,
      kategorieId: null,
      name: '',
      icon: 'check',
      typ: 'janein',        // 'janein', 'zaehler' oder 'zahl'
      ziel: null,           // Tagesziel bzw. Höchstwert
      einheit: '',
      richtung: 'positiv',  // 'positiv' (mache ich) oder 'negativ' (vermeide ich)
      ausgeblendet: false,
      erstellt: Datum.schluessel(new Date()),
      ...werte,
      haeufigkeit: { ...standardHaeufigkeit, ...(werte.haeufigkeit || {}) }
    };
  },

  // Neue Gewohnheit anlegen (ohne id) oder vorhandene ändern (mit id)
  gewohnheitSpeichern(gewohnheit) {
    const vorhanden = gewohnheit.id && this.gewohnheit(gewohnheit.id);
    if (vorhanden) Object.assign(vorhanden, gewohnheit);
    else this.zustand.gewohnheiten.push({ ...gewohnheit, id: this.neueId() });
    this.speichern();
  },

  // Löscht eine Gewohnheit und alle ihre Einträge
  gewohnheitLoeschen(id) {
    this._gewohnheitEntfernen(id);
    this.speichern();
  },

  _gewohnheitEntfernen(id) {
    this.zustand.gewohnheiten = this.zustand.gewohnheiten.filter(g => g.id !== id);
    const eintraege = this.zustand.eintraege;
    Object.keys(eintraege).forEach(tag => {
      delete eintraege[tag][id];
      if (Object.keys(eintraege[tag]).length === 0) delete eintraege[tag];
    });
  },


  /* ---------- Reihenfolge (nach Drag & Drop) ----------
     kategorienIds: IDs der Kategorien in der neuen Reihenfolge
     zuordnung:     [{ id, kategorieId }] aller Gewohnheiten in der neuen Reihenfolge */
  reihenfolgeUebernehmen(kategorienIds, zuordnung) {
    const sortieren = (liste, ids) => {
      const nachId = new Map(liste.map(e => [e.id, e]));
      const neu = ids.map(id => nachId.get(id)).filter(Boolean);
      // Sicherheitsnetz: nichts darf verloren gehen
      return neu.concat(liste.filter(e => !ids.includes(e.id)));
    };
    this.zustand.kategorien = sortieren(this.zustand.kategorien, kategorienIds);
    zuordnung.forEach(({ id, kategorieId }) => {
      const g = this.gewohnheit(id);
      if (g) g.kategorieId = kategorieId;
    });
    this.zustand.gewohnheiten = sortieren(this.zustand.gewohnheiten, zuordnung.map(z => z.id));
    this.speichern();
  },


  /* ---------- Einträge (was an welchem Tag erledigt wurde) ----------
     Gespeichert als eintraege["2026-10-25"][gewohnheitId] = { wert, notiz }
     - wert: Abhaken → 1 (erledigt), Zähler/Zahl → die Zahl
     - notiz: kurzer Text zu diesem Tag (optional) */

  eintrag(tag, gewohnheitId) {
    return (this.zustand.eintraege[tag] || {})[gewohnheitId];
  },

  // Der eingetragene Wert oder null, wenn nichts eingetragen ist
  wert(tag, gewohnheitId) {
    const e = this.eintrag(tag, gewohnheitId);
    return e && typeof e.wert === 'number' ? e.wert : null;
  },

  wertSetzen(tag, gewohnheitId, wert) {
    this._eintragAendern(tag, gewohnheitId, { wert });
  },

  notizSetzen(tag, gewohnheitId, notiz) {
    this._eintragAendern(tag, gewohnheitId, { notiz });
  },

  _eintragAendern(tag, gewohnheitId, aenderung) {
    const eintraege = this.zustand.eintraege;
    const tagDaten = eintraege[tag] || (eintraege[tag] = {});
    const e = { ...tagDaten[gewohnheitId], ...aenderung };
    if (e.wert == null) delete e.wert;
    if (!e.notiz) delete e.notiz;
    // Leere Einträge gar nicht erst aufheben
    if (Object.keys(e).length) tagDaten[gewohnheitId] = e;
    else delete tagDaten[gewohnheitId];
    if (Object.keys(tagDaten).length === 0) delete eintraege[tag];
    this.speichern();
  },


  /* ---------- Auswertung ---------- */

  // Hat man die Gewohnheit an diesem Tag geschafft?
  istErledigt(g, tag) {
    const w = this.wert(tag, g.id);
    if (w === null) return false;
    if (g.typ === 'janein') return w >= 1;                   // abgehakt (bzw. vermieden)
    if (g.richtung === 'negativ') return w <= (g.ziel ?? 0); // nicht über dem Höchstwert
    return g.ziel != null ? w >= g.ziel : w > 0;             // Ziel erreicht (ohne Ziel: irgendwas eingetragen)
  },

  // Wie weit ist man an diesem Tag? 0 bis 1 (für den Fortschrittsring)
  // Bei Zählern/Zahlen mit Ziel zählt auch Teil-Fortschritt, z. B. 6 von 8 Gläsern = 0,75
  fortschritt(g, tag) {
    if (this.istErledigt(g, tag)) return 1;
    const w = this.wert(tag, g.id);
    if (g.typ !== 'janein' && g.richtung === 'positiv' && g.ziel && w) return Math.min(w / g.ziel, 1);
    return 0;
  },

  // Wie oft wurde die Gewohnheit in der Woche dieses Datums geschafft?
  wochenErledigt(g, datum, ohneTag = null) {
    return Datum.wocheVon(datum)
      .map(d => Datum.schluessel(d))
      .filter(tag => tag !== ohneTag && this.istErledigt(g, tag))
      .length;
  },

  // Ist die Gewohnheit an diesem Datum dran?
  istFaellig(g, datum) {
    const kategorie = this.kategorie(g.kategorieId);
    if (g.ausgeblendet || !kategorie || kategorie.ausgeblendet) return false;
    const h = g.haeufigkeit;
    if (h.art === 'wochentage') return h.tage.includes(datum.getDay());
    if (h.art === 'proWoche') {
      // Jeden Tag zeigen, bis das Wochenziel erreicht ist (an erledigten Tagen immer)
      const tag = Datum.schluessel(datum);
      return this.istErledigt(g, tag) || this.wochenErledigt(g, datum, tag) < h.anzahl;
    }
    return true;
  }
};


/* ---------- Datums-Helfer (deutsches Format) ---------- */
const Datum = {
  // Kurznamen der Wochentage. 0 = Sonntag, 1 = Montag ... 6 = Samstag
  WOCHENTAGE_KURZ: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],

  // Wochentage in der richtigen Reihenfolge (je nach Wochenstart)
  wochenReihenfolge() {
    const start = Daten.einstellung('wochenstart');
    return [0, 1, 2, 3, 4, 5, 6].map(i => (start + i) % 7);
  },

  // Heute, 0:00 Uhr
  heute() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  },

  // Datum + n Tage (n darf auch negativ sein)
  plusTage(datum, n) {
    const d = new Date(datum);
    d.setDate(d.getDate() + n);
    return d;
  },

  // Die 7 Tage der Woche, in der das Datum liegt (ab Wochenstart)
  wocheVon(datum) {
    const versatz = (datum.getDay() - Daten.einstellung('wochenstart') + 7) % 7;
    const start = this.plusTage(datum, -versatz);
    return [0, 1, 2, 3, 4, 5, 6].map(i => this.plusTage(start, i));
  },

  // Aus "2026-10-25" wieder ein Datum machen
  ausSchluessel(schluessel) {
    const [j, m, t] = schluessel.split('-').map(Number);
    return new Date(j, m - 1, t);
  },

  // "Schlüssel" für einen Tag, z. B. "2026-10-25" (zum Speichern)
  schluessel(datum) {
    const j = datum.getFullYear();
    const m = String(datum.getMonth() + 1).padStart(2, '0');
    const t = String(datum.getDate()).padStart(2, '0');
    return `${j}-${m}-${t}`;
  },

  // Kurz: "25.10.2026"
  kurz(datum) {
    return datum.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  },

  // Lang: "Sonntag, 25.10.2026"
  lang(datum) {
    return datum.toLocaleDateString('de-DE', {
      weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
    });
  }
};


// Beim Start sofort laden (erst hier unten, weil dafür auch "Datum" gebraucht wird)
Daten.laden();
