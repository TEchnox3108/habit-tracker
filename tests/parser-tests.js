/* =========================================================
   parser-tests.js – Testfälle für den Quick-Add-Parser

   Jeder Test: ein Satz + was dabei herauskommen MUSS.
   Alle Tests rechnen so, als wäre „jetzt“ immer:
       Sonntag, 08.11.2026, 10:00 Uhr
   (sonst würden sich „morgen“ & Co. jeden Tag ändern).

   Neuen Test hinzufügen: einfach eine Zeile nach dem Muster
   unten ergänzen. Nur die Felder angeben, die geprüft werden
   sollen. Mögliche Felder:
     titel, art ('termin'/'projekt'), datum, endDatum,
     start, ende, ganztaegig, kategorie, ort,
     wdh ('keine'/'taeglich'/'woechentlich'/'monatlich'/'jaehrlich'),
     tage ([0–6], 0 = So), intervall, bis
   ========================================================= */

const TEST_JETZT = new Date(2026, 10, 8, 10, 0); // So, 08.11.2026, 10:00

const TESTFAELLE = [
  // --- Deine Beispiele ---
  { satz: 'Zahnarzt morgen 14:30 1h', titel: 'Zahnarzt', datum: '2026-11-09', start: '14:30', ende: '15:30', ganztaegig: false },
  { satz: 'Mathe-Klausur 12.12. 8:00 bis 9:30', titel: 'Mathe-Klausur', datum: '2026-12-12', start: '08:00', ende: '09:30' },
  { satz: 'Training jeden Montag 18 Uhr 90 min', titel: 'Training', datum: '2026-11-09', start: '18:00', ende: '19:30', wdh: 'woechentlich', tage: [1] },
  { satz: 'Projekt Leporello Abgabe 08.12. ganztägig #Schule', art: 'projekt', titel: 'Leporello Abgabe', datum: '2026-12-08', kategorie: 'Schule' },
  { satz: 'Arbeit Getränkemarkt Samstag 10-16 Uhr', titel: 'Arbeit Getränkemarkt', datum: '2026-11-14', start: '10:00', ende: '16:00' },
  { satz: 'Projekt Leporello bis 08.12. #Schule', art: 'projekt', titel: 'Leporello', datum: '2026-12-08', kategorie: 'Schule' },

  // --- Datum in Worten ---
  { satz: 'Arzt heute 16 Uhr', titel: 'Arzt', datum: '2026-11-08', start: '16:00', ende: '17:00' },
  { satz: 'Kino übermorgen 20:15', titel: 'Kino', datum: '2026-11-10', start: '20:15', ende: '21:15' },
  { satz: 'Oma besuchen nächste Woche Freitag', titel: 'Oma besuchen', datum: '2026-11-13', ganztaegig: true },
  { satz: 'Kino Freitag nächste Woche 20 Uhr', titel: 'Kino', datum: '2026-11-13', start: '20:00' },
  { satz: 'Urlaub übernächste Woche', titel: 'Urlaub', datum: '2026-11-16', ganztaegig: true },
  { satz: 'Friseur in 3 Tagen 11 Uhr', titel: 'Friseur', datum: '2026-11-11', start: '11:00', ende: '12:00' },
  { satz: 'Zahnreinigung in 2 Wochen', titel: 'Zahnreinigung', datum: '2026-11-22', ganztaegig: true },
  { satz: 'Lerngruppe in einer Woche 15 Uhr', titel: 'Lerngruppe', datum: '2026-11-15', start: '15:00' },
  { satz: 'Elternabend nächsten Dienstag 19:30', titel: 'Elternabend', datum: '2026-11-10', start: '19:30', ende: '20:30' },
  { satz: 'Treffen mit Anna morgen um 18', titel: 'Treffen mit Anna', datum: '2026-11-09', start: '18:00', ende: '19:00' },
  { satz: 'Party Sa 21 Uhr', titel: 'Party', datum: '2026-11-14', start: '21:00' },
  { satz: 'Klausur Bio Do 8 Uhr', titel: 'Klausur Bio', datum: '2026-11-12', start: '08:00' },
  { satz: 'Kapitel 3 lesen Freitag', titel: 'Kapitel 3 lesen', datum: '2026-11-13', ganztaegig: true },
  { satz: 'Ausflug am Wochenende', titel: 'Ausflug', datum: '2026-11-08' },
  { satz: 'Ausflug nächstes Wochenende', titel: 'Ausflug', datum: '2026-11-14' },

  // --- Datum in Zahlen ---
  { satz: 'Geburtstag Lisa 12.12.2026 ganztägig', titel: 'Geburtstag Lisa', datum: '2026-12-12', ganztaegig: true },
  { satz: 'Abgabe 3.1.', titel: 'Abgabe', datum: '2027-01-03' },
  { satz: 'Arzt 12.12', titel: 'Arzt', datum: '2026-12-12' },
  { satz: 'Abschlussfeier 1.7.27', titel: 'Abschlussfeier', datum: '2027-07-01' },
  { satz: 'Flug 2026-12-20 6:45', titel: 'Flug', datum: '2026-12-20', start: '06:45' },
  { satz: 'Konzert am 5. Dezember 20 Uhr', titel: 'Konzert', datum: '2026-12-05', start: '20:00', ende: '21:00' },
  { satz: 'Treffen 12. Dez. 18 Uhr', titel: 'Treffen', datum: '2026-12-12', start: '18:00' },
  { satz: 'Zahnarzt Mo, 16.11. 9:30', titel: 'Zahnarzt', datum: '2026-11-16', start: '09:30' },
  { satz: 'Hausaufgaben 10.11. 15-17', titel: 'Hausaufgaben', datum: '2026-11-10', start: '15:00', ende: '17:00' },
  { satz: 'Vortrag am 20. um 10 Uhr', titel: 'Vortrag', datum: '2026-11-20', start: '10:00' },

  // --- Mehrere Tage ---
  { satz: 'Skiurlaub 27.12. bis 3.1.', titel: 'Skiurlaub', datum: '2026-12-27', endDatum: '2027-01-03', ganztaegig: true },
  { satz: 'Feier vom 24.12. bis 26.12.', titel: 'Feier', datum: '2026-12-24', endDatum: '2026-12-26', ganztaegig: true },
  { satz: 'Messe 12.-14.3.', titel: 'Messe', datum: '2027-03-12', endDatum: '2027-03-14' },
  { satz: 'Spätschicht Freitag 22-6 Uhr', titel: 'Spätschicht', datum: '2026-11-13', start: '22:00', endDatum: '2026-11-14', ende: '06:00' },

  // --- Uhrzeiten & Dauer ---
  { satz: 'Lernen 14:00 bis 16 Uhr #Schule', titel: 'Lernen', datum: '2026-11-08', start: '14:00', ende: '16:00', kategorie: 'Schule' },
  { satz: 'Call 9 Uhr', titel: 'Call', datum: '2026-11-09', start: '09:00' },
  { satz: 'Termin beim Amt 15.30 Uhr morgen', titel: 'Termin beim Amt', datum: '2026-11-09', start: '15:30' },
  { satz: 'Nachhilfe Montag 16.45 Uhr', titel: 'Nachhilfe', datum: '2026-11-09', start: '16:45' },
  { satz: 'Arbeit Getränkemarkt Samstag von 10 bis 16 Uhr', titel: 'Arbeit Getränkemarkt', datum: '2026-11-14', start: '10:00', ende: '16:00' },
  { satz: 'Klavier heute 17:00 - 17:45', titel: 'Klavier', start: '17:00', ende: '17:45' },
  { satz: 'Meeting Freitag 9-10:30', titel: 'Meeting', datum: '2026-11-13', start: '09:00', ende: '10:30' },
  { satz: 'Präsentation Mittwoch 1,5h 14 Uhr', titel: 'Präsentation', datum: '2026-11-11', start: '14:00', ende: '15:30' },
  { satz: 'Workshop 9:00 1h 30min übermorgen', titel: 'Workshop', datum: '2026-11-10', start: '09:00', ende: '10:30' },
  { satz: 'Besprechung morgen 11 Uhr eine halbe Stunde', titel: 'Besprechung', start: '11:00', ende: '11:30' },
  { satz: 'Sport morgen 17 Uhr bis 18:30', titel: 'Sport', start: '17:00', ende: '18:30' },
  { satz: 'Pause in 2 Stunden', titel: 'Pause', datum: '2026-11-08', start: '12:00', ende: '13:00' },
  { satz: 'Abendessen heute Abend', titel: 'Abendessen', datum: '2026-11-08', start: '19:00' },
  { satz: 'Joggen morgen früh', titel: 'Joggen', datum: '2026-11-09', start: '08:00' },
  { satz: 'Mittagessen mittags', titel: 'Mittagessen', datum: '2026-11-08', start: '12:00' },

  // --- Wiederholungen ---
  { satz: 'Laufen täglich 7:00 30 min', titel: 'Laufen', datum: '2026-11-08', start: '07:00', ende: '07:30', wdh: 'taeglich' },
  { satz: 'Joggen jeden Tag 6 Uhr', titel: 'Joggen', wdh: 'taeglich', start: '06:00' },
  { satz: 'Vokabeln lernen jeden Mo und Mi 17 Uhr', titel: 'Vokabeln lernen', datum: '2026-11-09', start: '17:00', wdh: 'woechentlich', tage: [1, 3] },
  { satz: 'Fußball dienstags 19 Uhr', titel: 'Fußball', datum: '2026-11-10', wdh: 'woechentlich', tage: [2] },
  { satz: 'Bandprobe wöchentlich Donnerstag 18:30 2h', titel: 'Bandprobe', datum: '2026-11-12', start: '18:30', ende: '20:30', wdh: 'woechentlich', tage: [4] },
  { satz: 'Yoga werktags 6:30 1 Std', titel: 'Yoga', datum: '2026-11-09', start: '06:30', ende: '07:30', wdh: 'woechentlich', tage: [1, 2, 3, 4, 5] },
  { satz: 'Physio jeden Dienstag bis 15.12. 8 Uhr', titel: 'Physio', datum: '2026-11-10', start: '08:00', wdh: 'woechentlich', tage: [2], bis: '2026-12-15' },
  { satz: 'Lauftreff alle 2 Wochen Samstag 9 Uhr', titel: 'Lauftreff', datum: '2026-11-14', wdh: 'woechentlich', tage: [6], intervall: 2 },
  { satz: 'Teammeeting alle 2 Wochen', titel: 'Teammeeting', datum: '2026-11-08', wdh: 'woechentlich', intervall: 2, ganztaegig: true },
  { satz: 'Miete zahlen monatlich 1.12.', titel: 'Miete zahlen', datum: '2026-12-01', wdh: 'monatlich', ganztaegig: true },
  { satz: 'Hochzeitstag jährlich 20.5.', titel: 'Hochzeitstag', datum: '2027-05-20', wdh: 'jaehrlich' },
  { satz: 'Steuer jedes Jahr 31.7.', titel: 'Steuer', datum: '2027-07-31', wdh: 'jaehrlich' },
  { satz: 'Training jeden Montag 18 Uhr 90 min #Fitness', titel: 'Training', kategorie: 'Fitness', wdh: 'woechentlich', tage: [1] },

  // --- Projekte, Kategorien, Ort ---
  { satz: 'Projekt Referat Geschichte bis nächsten Freitag #Schule', art: 'projekt', titel: 'Referat Geschichte', datum: '2026-11-13', kategorie: 'Schule' },
  { satz: 'Projekt Garten aufräumen', art: 'projekt', titel: 'Garten aufräumen', datum: null },
  { satz: 'Abgabe in 3 Tagen ganztägig #Schule', titel: 'Abgabe', datum: '2026-11-11', ganztaegig: true, kategorie: 'Schule' },
  { satz: 'Geschenk kaufen morgen #privat', titel: 'Geschenk kaufen', datum: '2026-11-09', kategorie: 'privat' },
  { satz: 'Bewerbungsgespräch 10.12. um 10:15 45 min @Rathaus', titel: 'Bewerbungsgespräch', datum: '2026-12-10', start: '10:15', ende: '11:00', ort: 'Rathaus' },

  // --- Gemischte Schreibweisen ---
  { satz: 'Zahnarzt am 9.11. um 14 Uhr für 2 Stunden', titel: 'Zahnarzt', datum: '2026-11-09', start: '14:00', ende: '16:00' },
  { satz: 'Mo 9-12 Uni', titel: 'Uni', datum: '2026-11-09', start: '09:00', ende: '12:00' },
  { satz: 'Fahrstunde Fr 16:00-17:30 @Fahrschule', titel: 'Fahrstunde', datum: '2026-11-13', start: '16:00', ende: '17:30', ort: 'Fahrschule' },
  { satz: 'Geburtstag Papa 3. März jährlich', titel: 'Geburtstag Papa', datum: '2027-03-03', wdh: 'jaehrlich', ganztaegig: true },
  { satz: 'Deadline Bewerbung 30.11.2026', titel: 'Deadline Bewerbung', datum: '2026-11-30' },
  { satz: 'Gitarre jeden Di, Do 17:30 45min', titel: 'Gitarre', datum: '2026-11-10', start: '17:30', ende: '18:15', wdh: 'woechentlich', tage: [2, 4] },
  { satz: 'Treffen um 7 morgen', titel: 'Treffen', datum: '2026-11-09', start: '07:00' },
  { satz: 'Arbeit 14-22', titel: 'Arbeit', datum: '2026-11-08', start: '14:00', ende: '22:00' },
  { satz: 'Kino heute 23 Uhr 3h', titel: 'Kino', datum: '2026-11-08', start: '23:00', endDatum: '2026-11-09', ende: '02:00' },
  { satz: 'Einkaufen in 30 Minuten', titel: 'Einkaufen', datum: '2026-11-08', start: '10:30' },
  { satz: 'Projekt: Website bis 31.12. #Arbeit', art: 'projekt', titel: 'Website', datum: '2026-12-31', kategorie: 'Arbeit' },
  { satz: 'Lernen 2h morgen', titel: 'Lernen', datum: '2026-11-09', ganztaegig: true },
  { satz: 'Silvester-Countdown 31.12. 24 Uhr', titel: 'Silvester-Countdown', datum: '2027-01-01', start: '00:00', ende: '01:00' },
  { satz: 'Zahnarzt Dienstag den 10.11. um 8.15', titel: 'Zahnarzt', datum: '2026-11-10', start: '08:15' },

  { satz: 'Zahnarzt Do 14:30 1h @Praxis Dr. Klein', titel: 'Zahnarzt', datum: '2026-11-12', ort: 'Praxis Dr. Klein' },
  { satz: 'Treffen mit Tom @Café Central morgen 15 Uhr', titel: 'Treffen mit Tom', ort: 'Café Central', start: '15:00' },
  { satz: 'Probe @"Aula der Schule" Freitag 16 Uhr #Schule', titel: 'Probe', ort: 'Aula der Schule', kategorie: 'Schule' },

  // --- Dinge, die NICHT als Datum/Zeit erkannt werden dürfen ---
  { satz: 'Lesen', titel: 'Lesen', datum: '2026-11-08', ganztaegig: true },
  { satz: 'Mach es so wie besprochen', titel: 'Mach es so wie besprochen', datum: '2026-11-08' },
  { satz: 'Morgenroutine planen', titel: 'Morgenroutine planen', datum: '2026-11-08' },
  { satz: 'Monatsbericht schreiben morgen', titel: 'Monatsbericht schreiben', datum: '2026-11-09' },
  { satz: 'Seite 3 bis 5 lesen morgen', titel: 'Seite 3 bis 5 lesen', datum: '2026-11-09', ganztaegig: true },
  { satz: 'Sonntagsbraten vorbereiten Samstag', titel: 'Sonntagsbraten vorbereiten', datum: '2026-11-14' }
];


/* ---------- Tests ausführen ---------- */

// Vergleicht ein Ergebnis mit dem erwarteten Wert und gibt eine Liste der Abweichungen zurück
function testPruefen(fall) {
  const e = QuickAdd.parse(fall.satz, TEST_JETZT);
  const ist = {
    titel: e.titel, art: e.art, datum: e.datum, endDatum: e.endDatum,
    start: e.start, ende: e.ende, ganztaegig: e.ganztaegig,
    kategorie: e.kategorie, ort: e.ort,
    wdh: e.wiederholung.art, tage: e.wiederholung.tage,
    intervall: e.wiederholung.intervall, bis: e.wiederholung.bis
  };
  const fehler = [];
  Object.keys(fall).filter(k => k !== 'satz').forEach(k => {
    if (JSON.stringify(ist[k]) !== JSON.stringify(fall[k])) {
      fehler.push(`${k}: erwartet ${JSON.stringify(fall[k])}, erkannt ${JSON.stringify(ist[k])}`);
    }
  });
  return { ergebnis: e, fehler };
}
