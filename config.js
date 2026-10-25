/* =========================================================
   config.js – Grundeinstellungen der App

   Hier stehen Dinge, die du später leicht ändern kannst:
   - der Name der App
   - die Auswahl an Farben für Kategorien
   (Ab Phase 2 kommen hier auch die Start-Kategorien,
    Beispiel-Gewohnheiten und die Icon-Auswahl dazu.)
   ========================================================= */

const KONFIG = {
  // Name der App (erscheint z. B. im Browser-Tab)
  appName: 'Habit Tracker',

  // Unter diesem Namen speichert der Browser deine Daten.
  // NICHT ändern – sonst findet die App deine alten Daten nicht mehr!
  speicherSchluessel: 'habit-tracker-daten',

  // Version der App (steht unten in den Einstellungen)
  version: '0.1 (Phase 1)',

  // Farbauswahl für Kategorien.
  // "id" verweist auf die Farbe in styles.css (z. B. --farbe-salbei),
  // "name" ist das, was du in der App siehst.
  farben: [
    { id: 'salbei', name: 'Salbeigrün' },
    { id: 'terrakotta', name: 'Terrakotta' },
    { id: 'staubblau', name: 'Staubblau' },
    { id: 'sand', name: 'Sand' },
    { id: 'pflaume', name: 'Pflaume' },
    { id: 'ocker', name: 'Ocker' },
    { id: 'moos', name: 'Moosgrün' },
    { id: 'rose', name: 'Altrosa' },
    { id: 'petrol', name: 'Petrol' },
    { id: 'lavendel', name: 'Lavendel' },
    { id: 'ton', name: 'Tonbraun' },
    { id: 'schiefer', name: 'Schiefer' },
    { id: 'koralle', name: 'Koralle' },
    { id: 'minze', name: 'Minze' }
  ]
};
