/* =========================================================
   data.js – Speichern & Laden

   Alle deine Daten liegen in EINEM Objekt: Daten.zustand
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
      }
    };
  },

  // Holt die gespeicherten Daten aus dem Browser
  laden() {
    const standard = this.standard();
    try {
      const roh = localStorage.getItem(KONFIG.speicherSchluessel);
      const gespeichert = roh ? JSON.parse(roh) : {};
      // Gespeichertes mit den Standardwerten mischen,
      // damit neue Einstellungen automatisch einen Wert haben
      this.zustand = {
        ...standard,
        ...gespeichert,
        einstellungen: { ...standard.einstellungen, ...gespeichert.einstellungen }
      };
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

  // Eine Einstellung lesen, z. B. Daten.einstellung('design')
  einstellung(name) {
    return this.zustand.einstellungen[name];
  },

  // Eine Einstellung ändern und sofort speichern
  einstellungSetzen(name, wert) {
    this.zustand.einstellungen[name] = wert;
    this.speichern();
  }
};

// Beim Start sofort laden
Daten.laden();


/* ---------- Datums-Helfer (deutsches Format) ---------- */
const Datum = {
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
