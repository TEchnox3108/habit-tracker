/* =========================================================
   data.js – Speichern & Laden

   Alle deine Daten liegen in EINEM Objekt: Daten.zustand
     - einstellungen: Hell/Dunkel, Wochenstart
     - kategorien:    Liste der Kategorien (Reihenfolge = Anzeige)
     - gewohnheiten:  Liste aller Gewohnheiten (Reihenfolge = Anzeige)
     - eintraege:     was du an welchem Tag erledigt hast (ab Phase 3)
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
        design: 'system', // 'system', 'hell' oder 'dunkel'
        wochenstart: 1    // 1 = Montag, 0 = Sonntag
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
