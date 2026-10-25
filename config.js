/* =========================================================
   config.js – Grundeinstellungen der App

   Hier stehen Dinge, die du später leicht ändern kannst:
   - der Name der App
   - die Auswahl an Farben und Icons
   - die Kategorien und Gewohnheiten, mit denen die App startet
   ========================================================= */

const KONFIG = {
  // Name der App (erscheint z. B. im Browser-Tab)
  appName: 'Habit Tracker',

  // Unter diesem Namen speichert der Browser deine Daten.
  // NICHT ändern – sonst findet die App deine alten Daten nicht mehr!
  speicherSchluessel: 'habit-tracker-daten',

  // Version der App (steht unten in den Einstellungen)
  version: '0.3 (Phase 3)',

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
  ],

  // Icon-Auswahl für Kategorien und Gewohnheiten.
  // Weitere Namen findest du auf https://lucide.dev/icons
  icons: [
    // Sport & Körper
    'activity', 'dumbbell', 'footprints', 'person-standing', 'bike', 'heart-pulse', 'trophy', 'mountain', 'waves',
    // Essen & Trinken
    'apple', 'carrot', 'salad', 'beef', 'egg', 'glass-water', 'coffee', 'cookie', 'utensils',
    // Schlaf & Tageszeit
    'moon', 'moon-star', 'sun', 'sunrise', 'bed-double', 'alarm-clock', 'clock',
    // Lernen & Arbeit
    'graduation-cap', 'book-open', 'book', 'notebook-pen', 'notebook', 'languages', 'pencil', 'calculator',
    'lightbulb', 'briefcase', 'laptop', 'list-todo', 'target', 'timer', 'calendar', 'mail',
    // Geld
    'wallet', 'piggy-bank', 'coins', 'receipt', 'shopping-cart',
    // Pflege & Gesundheit
    'sparkles', 'smile', 'droplet', 'bath', 'scissors', 'pill',
    // Kopf & Gefühl
    'brain', 'heart', 'flower-2', 'leaf', 'star', 'flame',
    // Menschen
    'users', 'message-circle', 'phone', 'gift', 'dog',
    // Zuhause
    'house', 'sofa', 'shirt', 'washing-machine', 'trash-2',
    // Freizeit & Digitales
    'music', 'palette', 'camera', 'gamepad-2', 'tv', 'plane',
    'smartphone', 'monitor', 'wifi-off', 'ban', 'check'
  ],

  /* -------------------------------------------------------
     Start-Kategorien mit Beispiel-Gewohnheiten.
     Diese werden nur beim allerersten Start angelegt.
     Danach änderst du alles direkt in der App.

     Felder einer Gewohnheit:
     - typ:      'janein' (abhaken), 'zaehler' (+/-) oder 'zahl' (Zahl eintragen)
     - ziel:     Tagesziel (bei "vermeide ich": Höchstwert), leer = kein Ziel
     - einheit:  z. B. 'Gläser', 'Min', '€'
     - richtung: 'positiv' (mache ich) oder 'negativ' (vermeide ich)
     - haeufigkeit: { art: 'taeglich' }
                    { art: 'wochentage', tage: [1, 3, 5] }  (0 = So, 1 = Mo ... 6 = Sa)
                    { art: 'proWoche', anzahl: 3 }
     ------------------------------------------------------- */
  startKategorien: [
    {
      name: 'Fitness & Sport', farbe: 'salbei', icon: 'activity',
      gewohnheiten: [
        { name: 'Training', icon: 'dumbbell', haeufigkeit: { art: 'wochentage', tage: [1, 3, 5] } },
        { name: 'Schritte', icon: 'footprints', typ: 'zahl', ziel: 8000, einheit: 'Schritte' },
        { name: 'Dehnen', icon: 'person-standing' }
      ]
    },
    {
      name: 'Ernährung', farbe: 'terrakotta', icon: 'apple',
      gewohnheiten: [
        { name: 'Wasser trinken', icon: 'glass-water', typ: 'zaehler', ziel: 8, einheit: 'Gläser' },
        { name: 'Protein-Ziel', icon: 'beef', typ: 'zahl', ziel: 120, einheit: 'g' },
        { name: 'Obst & Gemüse', icon: 'carrot', typ: 'zaehler', ziel: 5, einheit: 'Portionen' }
      ]
    },
    {
      name: 'Schlaf', farbe: 'lavendel', icon: 'moon',
      gewohnheiten: [
        { name: 'Schlafenszeit eingehalten', icon: 'alarm-clock' },
        { name: 'Schlafstunden', icon: 'bed-double', typ: 'zahl', ziel: 8, einheit: 'Std' }
      ]
    },
    {
      name: 'Schule & Lernen', farbe: 'staubblau', icon: 'graduation-cap',
      gewohnheiten: [
        { name: 'Lernzeit', icon: 'timer', typ: 'zahl', ziel: 60, einheit: 'Min' },
        { name: 'Hausaufgaben', icon: 'notebook-pen', haeufigkeit: { art: 'wochentage', tage: [1, 2, 3, 4, 5] } },
        { name: 'Vokabeln', icon: 'languages' }
      ]
    },
    {
      name: 'Finanzen', farbe: 'moos', icon: 'wallet',
      gewohnheiten: [
        { name: 'Ausgaben eingetragen', icon: 'receipt' },
        { name: 'Kein Impulskauf', icon: 'shopping-cart', richtung: 'negativ' },
        { name: 'Betrag gespart', icon: 'piggy-bank', typ: 'zahl', ziel: 5, einheit: '€' }
      ]
    },
    {
      name: 'Arbeit & Produktivität', farbe: 'schiefer', icon: 'briefcase',
      gewohnheiten: [
        { name: 'To-dos erledigt', icon: 'list-todo', typ: 'zaehler', ziel: 3, einheit: 'To-dos' },
        { name: 'Fokuszeit', icon: 'target', typ: 'zahl', ziel: 90, einheit: 'Min' }
      ]
    },
    {
      name: 'Körperpflege', farbe: 'rose', icon: 'sparkles',
      gewohnheiten: [
        { name: 'Skincare morgens', icon: 'sun' },
        { name: 'Skincare abends', icon: 'moon-star' },
        { name: 'Zähne putzen', icon: 'smile', typ: 'zaehler', ziel: 2, einheit: 'mal' }
      ]
    },
    {
      name: 'Mental & Achtsamkeit', farbe: 'pflaume', icon: 'brain',
      gewohnheiten: [
        { name: 'Tagebuch', icon: 'notebook' },
        { name: 'Meditation', icon: 'flower-2', typ: 'zahl', ziel: 10, einheit: 'Min' },
        { name: 'Stimmung des Tages', icon: 'heart', typ: 'zahl', einheit: 'von 5' }
      ]
    },
    {
      name: 'Soziales', farbe: 'ocker', icon: 'users',
      gewohnheiten: [
        { name: 'Freunde/Familie kontaktiert', icon: 'message-circle' },
        { name: 'Zeit mit Freunden', icon: 'users', haeufigkeit: { art: 'proWoche', anzahl: 2 } }
      ]
    },
    {
      name: 'Ordnung & Haushalt', farbe: 'sand', icon: 'house',
      gewohnheiten: [
        { name: 'Zimmer aufgeräumt', icon: 'sofa' },
        { name: 'Wäsche', icon: 'washing-machine', haeufigkeit: { art: 'proWoche', anzahl: 1 } }
      ]
    },
    {
      name: 'Lesen & Weiterbildung', farbe: 'petrol', icon: 'book-open',
      gewohnheiten: [
        { name: 'Seiten gelesen', icon: 'book', typ: 'zahl', ziel: 20, einheit: 'Seiten' },
        { name: 'Etwas Neues gelernt', icon: 'lightbulb' }
      ]
    },
    {
      name: 'Digitale Gewohnheiten', farbe: 'minze', icon: 'smartphone',
      gewohnheiten: [
        { name: 'Bildschirmzeit', icon: 'monitor', typ: 'zahl', ziel: 180, einheit: 'Min', richtung: 'negativ' },
        { name: 'Kein Handy im Bett', icon: 'ban', richtung: 'negativ' }
      ]
    }
  ]
};
