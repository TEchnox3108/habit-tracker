/* =========================================================
   calendar-parser.js – "Quick Add": Termine aus einem Satz

   Du schreibst z. B. „Zahnarzt morgen 14:30 1h“ und
   QuickAdd.parse() macht daraus:
     { art: 'termin', titel: 'Zahnarzt', datum: '2026-11-09',
       start: '14:30', ende: '15:30', ganztaegig: false, … }

   So funktioniert es (Schritt für Schritt):
   Der Satz wird nacheinander nach bekannten Mustern durchsucht
   (#Tag, Wiederholung, Datum, Uhrzeit, Dauer …). Jedes gefundene
   Stück wird aus dem Satz „herausgeschnitten“. Was am Ende übrig
   bleibt, ist der Titel.

   Diese Datei braucht nichts anderes aus der App – deshalb kann
   die Testseite (tests/parser-tests.html) sie allein laden.
   Neue Regeln: in parse() an passender Stelle ergänzen und in
   tests/parser-tests.js einen Beispielsatz dazuschreiben.
   ========================================================= */

const QuickAdd = (() => {

  /* ---------- Wörter, die der Parser kennt ---------- */

  const WOCHENTAGE = ['sonntag', 'montag', 'dienstag', 'mittwoch', 'donnerstag', 'freitag', 'samstag'];
  const WT_ANZEIGE = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  const MONATE_ANZEIGE = ['Jan', 'Feb', 'März', 'Apr', 'Mai', 'Juni', 'Juli', 'Aug', 'Sept', 'Okt', 'Nov', 'Dez'];
  // Monatsnamen als Suchmuster (lang und kurz, mit/ohne Umlaut)
  const MONAT_MUSTER = [
    'jan(?:uar)?', 'feb(?:ruar)?', 'm(?:ä|ae)r(?:z)?', 'apr(?:il)?', 'mai', 'jun(?:i)?',
    'jul(?:i)?', 'aug(?:ust)?', 'sep(?:t(?:ember)?)?', 'okt(?:ober)?', 'nov(?:ember)?', 'dez(?:ember)?'
  ];
  const ZAHLWOERTER = {
    ein: 1, eine: 1, einen: 1, einem: 1, einer: 1, zwei: 2, drei: 3, vier: 4, 'fünf': 5, fuenf: 5,
    sechs: 6, sieben: 7, acht: 8, neun: 9, zehn: 10, elf: 11, 'zwölf': 12, zwoelf: 12
  };
  const ZAHL = '(\\d+|' + Object.keys(ZAHLWOERTER).join('|') + ')';

  // Grenzen: davor/danach darf kein Buchstabe und keine Ziffer stehen
  // (normales \b kennt keine Umlaute – „übermorgen“ würde sonst nicht gefunden)
  const L = '(?<![\\p{L}\\p{N}])';
  const R = '(?![\\p{L}\\p{N}])';

  // Wochentag: ganz ausgeschrieben – oder kurz („Mo“), dann aber nur mit Punkt,
  // Komma oder Zahl dahinter, damit z. B. das Wort „so“ kein Sonntag wird
  const WT_LANG = '(?:montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag)';
  const WT_KURZ = '(?:mo|di|mi|do|fr|sa|so)';
  const WT = `(?:${WT_LANG}|${WT_KURZ}(?=\\.|,|\\s+\\d))\\.?`;
  const WT_IN_LISTE = `(?:${WT_LANG}|${WT_KURZ}\\.?)`; // in „jeden Mo und Mi“ sind Kürzel eindeutig

  // Uhrzeit: „14“, „14:30“, „14.30“
  const T = '(\\d{1,2})(?:[:.](\\d{2}))?';

  const rx = muster => new RegExp(muster, 'iu');
  const rxAlle = muster => new RegExp(muster, 'giu');


  /* ---------- Datums-Helfer ---------- */

  const tag = (j, m, t) => new Date(j, m, t);
  const plusTage = (d, n) => tag(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const schluessel = d =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const ausSchluessel = s => { const [j, m, t] = s.split('-').map(Number); return tag(j, m - 1, t); };
  const zeitText = min => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

  function zahl(text) {
    const t = String(text).toLowerCase();
    return /^\d+$/.test(t) ? Number(t) : (ZAHLWOERTER[t] || null);
  }

  // „Mo“, „montag“, „Montags“ -> 1
  function wochentagNr(text) {
    const kurz = String(text).toLowerCase().slice(0, 2);
    return ['so', 'mo', 'di', 'mi', 'do', 'fr', 'sa'].indexOf(kurz);
  }

  function monatNr(text) {
    const t = String(text).toLowerCase().replace(/\.$/, '');
    return MONAT_MUSTER.findIndex(m => rx('^' + m + '$').test(t));
  }

  // Prüft, ob Tag/Monat/Jahr ein echtes Datum ergeben (kein 31.02.)
  function gueltig(j, m, t) {
    if (m < 0 || m > 11 || t < 1 || t > 31) return null;
    const d = tag(j, m, t);
    return d.getMonth() === m ? d : null;
  }

  // Jahr aus „26“ oder „2026“; ohne Jahr: das nächste passende (nicht in der Vergangenheit)
  function mitJahr(jahrText, m, t, heute) {
    if (jahrText) {
      let j = Number(jahrText);
      if (j < 100) j += 2000;
      return gueltig(j, m, t);
    }
    let d = gueltig(heute.getFullYear(), m, t);
    if (d && d < heute) d = gueltig(heute.getFullYear() + 1, m, t);
    return d;
  }

  // Montag der Woche, in der d liegt
  const montagVon = d => plusTage(d, -((d.getDay() + 6) % 7));


  /* =========================================================
     parse(satz, bezug)
     bezug = „jetzt“ (für Tests fest einstellbar)
     ========================================================= */
  function parse(eingabe, bezug = new Date()) {
    const jetzt = new Date(bezug);
    const heute = tag(jetzt.getFullYear(), jetzt.getMonth(), jetzt.getDate());
    const jetztMin = jetzt.getHours() * 60 + jetzt.getMinutes();

    // Arbeitskopie des Satzes. Gefundenes wird durch Leerzeichen ersetzt.
    let rest = ' ' + String(eingabe || '').replace(/\s+/g, ' ').trim() + ' ';

    // Sucht das erste Vorkommen eines Musters. Gibt „pruefen“ etwas zurück,
    // wird das Stück herausgeschnitten und der Wert zurückgegeben.
    function nimm(muster, pruefen = m => m) {
      for (const m of rest.matchAll(rxAlle(muster))) {
        const wert = pruefen(m);
        if (wert !== null && wert !== undefined && wert !== false) {
          rest = rest.slice(0, m.index) + ' '.repeat(m[0].length) + rest.slice(m.index + m[0].length);
          return wert;
        }
      }
      return null;
    }

    let art = 'termin';
    let kategorie = null;
    let ort = '';
    let datum = null;      // Date
    let endDatum = null;   // Date (mehrtägig)
    let start = null;      // Minuten
    let ende = null;       // Minuten
    let dauer = null;      // Minuten
    let ganztaegig = false;
    let tageszeit = null;  // „abends“ usw. (nur wenn keine echte Uhrzeit dasteht)
    const wdh = { art: 'keine', tage: [], intervall: 1, bis: null };
    const annahmen = [];   // was der Parser selbst ergänzt hat


    /* ---------- 1. #Kategorie und @Ort ---------- */
    nimm('(?<=^|\\s)#([\\p{L}\\p{N}_\\-]+)', m => { if (!kategorie) kategorie = m[1]; return true; });
    while (nimm('(?<=^|\\s)#([\\p{L}\\p{N}_\\-]+)', () => true)); // weitere Tags entfernen
    // @"Ort mit Leerzeichen" sofort; @Ort ohne Anführungszeichen erst ganz am Ende (Schritt 12),
    // dann gehört alles hinter dem @ zum Ort („@Praxis Dr. Klein“)
    nimm('(?<=^|\\s)@"([^"]+)"', m => { ort = m[1]; return true; });


    /* ---------- 2. Projekt? („Projekt Leporello bis 08.12.“) ---------- */
    if (nimm('^\\s*projekt\\s*:?\\s+')) art = 'projekt';


    /* ---------- 3. ganztägig ---------- */
    if (nimm(`${L}(?:ganzt(?:ä|ae)gig|ganztags|den ganzen tag)${R}`)) ganztaegig = true;


    /* ---------- 4. Wiederholung ---------- */
    // „jeden Montag“, „jeden Mo und Mi“
    nimm(`${L}(?:jeden|jede|jeder|immer)\\s+(${WT_IN_LISTE}(?:\\s*(?:,|und|&|\\+)\\s*${WT_IN_LISTE})*)(?![\\p{L}])`, m => {
      wdh.art = 'woechentlich';
      wdh.tage = [...m[1].matchAll(rxAlle(WT_IN_LISTE))].map(x => wochentagNr(x[0]));
      return true;
    });
    // „montags“, „montags und donnerstags“
    if (wdh.art === 'keine') {
      const WTS = '(?:montags|dienstags|mittwochs|donnerstags|freitags|samstags|sonntags)';
      nimm(`${L}(${WTS}(?:\\s*(?:,|und|&)\\s*${WTS})*)${R}`, m => {
        wdh.art = 'woechentlich';
        wdh.tage = [...m[1].matchAll(rxAlle(WTS))].map(x => wochentagNr(x[0]));
        return true;
      });
    }
    if (wdh.art === 'keine' && nimm(`${L}(?:werktags|wochentags|jeden werktag|an werktagen)${R}`)) {
      wdh.art = 'woechentlich'; wdh.tage = [1, 2, 3, 4, 5];
    }
    if (wdh.art === 'keine' && nimm(`${L}(?:jedes wochenende|wochenends|an wochenenden)${R}`)) {
      wdh.art = 'woechentlich'; wdh.tage = [6, 0];
    }
    if (wdh.art === 'keine') {
      nimm(`${L}alle\\s+${ZAHL}\\s+tage${R}`, m => { wdh.art = 'taeglich'; wdh.intervall = zahl(m[1]); return true; });
    }
    if (wdh.art === 'keine' && nimm(`${L}(?:t(?:ä|ae)glich|tagt(?:ä|ae)glich|jeden tag)${R}`)) wdh.art = 'taeglich';
    if (wdh.art === 'keine') {
      nimm(`${L}alle\\s+${ZAHL}\\s+wochen${R}`, m => { wdh.art = 'woechentlich'; wdh.intervall = zahl(m[1]); return true; });
    }
    if (wdh.art === 'keine' && nimm(`${L}(?:jede\\s+(?:zweite|2\\.)\\s+woche|14-t(?:ä|ae)gig|vierzehnt(?:ä|ae)gig|zweiw(?:ö|oe)chentlich)${R}`)) {
      wdh.art = 'woechentlich'; wdh.intervall = 2;
    }
    if (wdh.art === 'keine' && nimm(`${L}(?:w(?:ö|oe)chentlich|jede woche)${R}`)) wdh.art = 'woechentlich';
    if (wdh.art === 'keine' && nimm(`${L}(?:monatlich|jeden monat)${R}`)) wdh.art = 'monatlich';
    if (wdh.art === 'keine' && nimm(`${L}(?:j(?:ä|ae)hrlich|jedes jahr)${R}`)) wdh.art = 'jaehrlich';


    /* ---------- 5. Datums-Muster (werden mehrfach gebraucht) ---------- */
    // Jedes Muster liefert ein Date oder null.
    const DATUM_MUSTER = [
      // 2026-12-08
      [`(?<![\\d.])(\\d{4})-(\\d{1,2})-(\\d{1,2})(?![\\d])`,
        m => gueltig(Number(m[1]), Number(m[2]) - 1, Number(m[3]))],
      // 12.12. / 12.12 / 12.12.2026 / 12.12.26  (aber nicht „10.15 Uhr“)
      [`(?<![\\d.:,])(\\d{1,2})\\.(\\d{1,2})(?:\\.((?:\\d{4}|\\d{2})(?!\\d))?)?(?![\\d:])(?!\\s*uhr)`,
        m => mitJahr(m[3], Number(m[2]) - 1, Number(m[1]), heute)],
      // 12. Dezember / 12. Dez. 2026 / 12 Dezember
      [`(?<![\\d.:,])(\\d{1,2})\\.?\\s*(${MONAT_MUSTER.join('|')})\\.?(?:\\s+(\\d{4}))?${R}`,
        m => mitJahr(m[3], monatNr(m[2]), Number(m[1]), heute)]
    ];

    // Sucht ein festes Datum (mit erlaubten Wörtern davor, z. B. „am“, „bis“)
    function festesDatum(davor = '(?:(?:am|bis|zum|den|ab|vom|für|an)\\s+)?') {
      for (const [muster, wandeln] of DATUM_MUSTER) {
        const d = nimm(L + davor + muster, wandeln);
        if (d) return d;
      }
      return null;
    }

    // Ende einer Wiederholung: „jeden Dienstag bis 15.12.“
    if (wdh.art !== 'keine') {
      const bis = festesDatum('(?:bis|einschließlich|einschliesslich)\\s+(?:zum\\s+)?');
      if (bis) wdh.bis = schluessel(bis);
    }


    /* ---------- 6. „in 2 Stunden“ / „in 30 Minuten“ ---------- */
    nimm(`${L}in\\s+${ZAHL}\\s+(stunden?|std\\.?|minuten?|min\\.?)${R}`, m => {
      const n = zahl(m[1]);
      if (!n) return null;
      const min = /^st/i.test(m[2]) ? n * 60 : n;
      let ziel = jetztMin + min;
      ziel = Math.ceil(ziel / 5) * 5; // auf 5 Minuten runden
      datum = plusTage(heute, Math.floor(ziel / 1440));
      start = ziel % 1440;
      return true;
    });


    /* ---------- 7. Zeitraum über mehrere Tage: „27.12. bis 3.1.“, „vom 12.-14.12.“ ---------- */
    if (!datum) {
      nimm(`${L}(?:vom\\s+)?(?<![\\d.])(\\d{1,2})\\.(?:(\\d{1,2})\\.?)?(?:(\\d{4}|\\d{2})(?!\\d))?\\s*(?:-|–|bis(?:\\s+zum)?)\\s*(\\d{1,2})\\.(\\d{1,2})\\.?(?:(\\d{4}|\\d{2})(?!\\d))?(?![\\d:])`, m => {
        const m2 = Number(m[5]) - 1;
        const m1 = m[2] ? Number(m[2]) - 1 : m2;
        const d2 = mitJahr(m[6], m2, Number(m[4]), heute);
        if (!d2) return null;
        let d1 = m[3] ? mitJahr(m[3], m1, Number(m[1]), heute) : gueltig(d2.getFullYear(), m1, Number(m[1]));
        if (d1 && d1 > d2) d1 = gueltig(d2.getFullYear() - 1, m1, Number(m[1])); // über Silvester
        if (!d1) return null;
        datum = d1; endDatum = d2;
        return true;
      });
    }


    /* ---------- 8. Tageszeit-Wörter: „heute Abend“, „morgen früh“, „abends“ ---------- */
    const TAGESZEITEN = { 'früh': 8 * 60, frueh: 8 * 60, morgens: 8 * 60, vormittag: 10 * 60, vormittags: 10 * 60,
      mittag: 12 * 60, mittags: 12 * 60, nachmittag: 15 * 60, nachmittags: 15 * 60,
      abend: 19 * 60, abends: 19 * 60, nachts: 22 * 60 };
    nimm(`${L}(heute|morgen|(?:ü|ue)bermorgen)\\s+(fr(?:ü|ue)h|vormittag|mittag|nachmittag|abend)${R}`, m => {
      const w = m[1].toLowerCase();
      datum = plusTage(heute, w === 'heute' ? 0 : w === 'morgen' ? 1 : 2);
      tageszeit = TAGESZEITEN[m[2].toLowerCase().replace('ue', 'ü')] ?? TAGESZEITEN[m[2].toLowerCase()];
      return true;
    });
    if (tageszeit === null) {
      nimm(`${L}(morgens|vormittags|mittags|nachmittags|abends|nachts)${R}`, m => {
        tageszeit = TAGESZEITEN[m[1].toLowerCase()];
        return true;
      });
    }


    /* ---------- 9. Datum ---------- */
    const DAVOR = '(?:(?:am|bis|zum|ab|für|an)\\s+)?';

    if (!datum) datum = festesDatum();

    // „am 12.“ (nur der Tag: dieser oder nächster Monat)
    if (!datum) {
      datum = nimm(`${L}(?:am|zum|bis)\\s+(\\d{1,2})\\.(?![\\d])`, m => {
        const t = Number(m[1]);
        let d = gueltig(heute.getFullYear(), heute.getMonth(), t);
        if (!d || d < heute) d = gueltig(heute.getFullYear(), heute.getMonth() + 1, t);
        return d;
      });
    }

    // heute, morgen, übermorgen, gestern
    if (!datum) {
      datum = nimm(`${L}${DAVOR}((?:ü|ue)bermorgen|morgen|heute|vorgestern|gestern)${R}`, m => {
        const w = m[1].toLowerCase();
        const n = { heute: 0, morgen: 1, 'übermorgen': 2, uebermorgen: 2, gestern: -1, vorgestern: -2 }[w];
        return plusTage(heute, n);
      });
    }

    // in 3 Tagen / in einer Woche / in 2 Monaten
    if (!datum) {
      datum = nimm(`${L}in\\s+${ZAHL}\\s+(tag(?:en)?|woche(?:n)?|monat(?:en)?)${R}`, m => {
        const n = zahl(m[1]);
        if (!n) return null;
        const einheit = m[2].toLowerCase();
        if (einheit.startsWith('tag')) return plusTage(heute, n);
        if (einheit.startsWith('woche')) return plusTage(heute, n * 7);
        return gueltig(heute.getFullYear(), heute.getMonth() + n, heute.getDate())
          || tag(heute.getFullYear(), heute.getMonth() + n + 1, 0); // 31. -> letzter Tag
      });
    }

    // „nächste Woche Freitag“ / „Freitag nächste Woche“ / „übernächste Woche Montag“
    const NAECHSTE_WOCHE = '((?:(?:ü|ue)ber)?n(?:ä|ae)chste[nr]?\\s+woche)';
    const wocheVersatz = text => (/^(ü|ue)ber/i.test(text) ? 14 : 7);
    if (!datum) {
      datum = nimm(`${L}${DAVOR}${NAECHSTE_WOCHE}\\s+(?:am\\s+)?(${WT})`, m =>
        plusTage(montagVon(heute), wocheVersatz(m[1]) + (wochentagNr(m[2]) + 6) % 7));
    }
    if (!datum) {
      datum = nimm(`${L}${DAVOR}(${WT})\\s+(?:in\\s+der\\s+)?${NAECHSTE_WOCHE}${R}`, m =>
        plusTage(montagVon(heute), wocheVersatz(m[2]) + (wochentagNr(m[1]) + 6) % 7));
    }

    // „Freitag“, „am Freitag“, „nächsten Freitag“, „Fr.“
    if (!datum) {
      datum = nimm(`${L}${DAVOR}(?:(n(?:ä|ae)chste[nrs]?|kommende[nrs]?|diese[nrs]?)\\s+)?(${WT})(?![\\p{L}])`, m => {
        let abstand = (wochentagNr(m[2]) - heute.getDay() + 7) % 7;
        if (abstand === 0 && m[1] && /^n|^k/i.test(m[1])) abstand = 7; // „nächsten Sonntag“ am Sonntag
        return plusTage(heute, abstand);
      });
    } else {
      // Datum steht schon fest („Mo, 16.11.“) – Wochentag nur noch entfernen
      nimm(`${L}${DAVOR}(${WT})(?![\\p{L}])`, () => true);
    }

    // „nächste Woche“ allein -> Montag der nächsten Woche; „am Wochenende“ -> Samstag
    if (!datum) {
      datum = nimm(`${L}${DAVOR}${NAECHSTE_WOCHE}${R}`, m => plusTage(montagVon(heute), wocheVersatz(m[1])));
    }
    if (!datum) {
      datum = nimm(`${L}(?:am\\s+|dieses\\s+|n(?:ä|ae)chstes\\s+)?wochenende${R}`, m => {
        // Ist gerade Wochenende, meint „am Wochenende“ heute, „nächstes Wochenende“ den kommenden Samstag.
        // Unter der Woche meinen beide den kommenden Samstag.
        const naechstes = /n(ä|ae)chstes/i.test(m[0]);
        const istWochenende = heute.getDay() === 0 || heute.getDay() === 6;
        if (istWochenende && !naechstes) return heute;
        return plusTage(heute, (6 - heute.getDay() + 7) % 7 || 7);
      });
    }


    /* ---------- 10. Uhrzeit ---------- */
    // Prüft Stunden/Minuten und gibt Minuten seit Mitternacht zurück
    const alsMinuten = (h, m) => {
      const std = Number(h);
      const min = m ? Number(m) : 0;
      if (std > 24 || min > 59 || (std === 24 && min > 0)) return null;
      return std * 60 + min;
    };

    // Von–bis: „10-16 Uhr“, „8:00 bis 9:30“, „von 10 bis 16“, „14:00 - 15:30“
    nimm(`${L}(?:(?:von|ab|um)\\s+)?(?<![\\d.:,])${T}\\s*(?:uhr\\s*)?(?:-|–|bis)\\s*${T}\\s*(?:uhr${R})?(?![\\d])`, m => {
      // „3 bis 4“ ohne Uhr/Minuten/„von“ ist zu unsicher (z. B. „Kapitel 3 bis 5“)
      if (!/uhr|von|[:.]|-|–/i.test(m[0])) return null;
      const a = alsMinuten(m[1], m[2]);
      const b = alsMinuten(m[3], m[4]);
      if (a === null || b === null) return null;
      start = a; ende = b;
      return true;
    });

    // Einzelne Uhrzeit: „14:30“, „15.30 Uhr“, „18 Uhr“, „um 18“
    if (start === null) {
      start = nimm(`(?:${L}(?:um|ab|gegen)\\s+)?(?<![\\d.:,])(\\d{1,2})[:.](\\d{2})(?:\\s*uhr${R})?(?![\\d])`, m => alsMinuten(m[1], m[2]))
        ?? nimm(`(?:${L}(?:um|ab|gegen)\\s+)?(?<![\\d.:,])(\\d{1,2})\\s*uhr${R}`, m => alsMinuten(m[1]))
        ?? nimm(`${L}(?:um|ab|gegen)\\s+(\\d{1,2})(?![\\d.:,])(?!\\s*(?:min|h${R}|std|stunde|tag|woch|monat))`, m => alsMinuten(m[1]));
    }

    // Endzeit: „bis 16 Uhr“, „bis 17:45“
    if (ende === null) {
      ende = nimm(`${L}bis\\s+${T}\\s*(uhr${R})?`, m => (m[2] || m[3] ? alsMinuten(m[1], m[2]) : null));
    }


    /* ---------- 11. Dauer: „1h“, „90 min“, „1,5 Std“, „1h 30min“, „eine halbe Stunde“ ---------- */
    let gefunden;
    const dauerDazu = n => { dauer = (dauer || 0) + n; return true; };
    do {
      gefunden = nimm(`${L}(?:f(?:ü|ue)r\\s+)?(\\d+(?:[.,]\\d+)?)\\s*(?:h|std\\.?|stunden?)(?![\\p{L}\\p{N}])`,
        m => dauerDazu(Math.round(parseFloat(m[1].replace(',', '.')) * 60)))
        || nimm(`${L}(?:f(?:ü|ue)r\\s+)?(\\d+)\\s*(?:min|mins|minuten?)\\.?(?![\\p{L}\\p{N}])`,
          m => dauerDazu(Number(m[1])))
        || nimm(`${L}(?:f(?:ü|ue)r\\s+)?(?:eine\\s+)?halbe\\s+stunde${R}`, () => dauerDazu(30))
        || nimm(`${L}(?:f(?:ü|ue)r\\s+)?(?:eine\\s+)?viertelstunde${R}`, () => dauerDazu(15))
        || nimm(`${L}(?:f(?:ü|ue)r\\s+)?(?:anderthalb|eineinhalb)\\s+stunden${R}`, () => dauerDazu(90))
        || nimm(`${L}(?:f(?:ü|ue)r\\s+)?(eine|zwei|drei|vier|fünf)\\s+stunden?${R}`, m => dauerDazu(zahl(m[1]) * 60));
    } while (gefunden);


    /* ---------- 12. Titel = was übrig bleibt ---------- */
    const STOPP_VORNE = /^(?:am|um|ab|von|vom|bis|den|zum|uhr|und|,|-|–|:)$/i;
    const STOPP_HINTEN = /^(?:am|um|ab|von|vom|bis|den|zum|zur|uhr|und|für|in|im|an|,|-|–|:)$/i;

    // @Ort: alles ab dem @ (Datum, Zeit usw. sind schon herausgeschnitten)
    const atStelle = rest.search(/(?<=^|\s)@\S/);
    if (!ort && atStelle >= 0) {
      const ortWoerter = rest.slice(atStelle + 1).replace(/\s+/g, ' ').trim().split(' ');
      while (ortWoerter.length && STOPP_HINTEN.test(ortWoerter[ortWoerter.length - 1])) ortWoerter.pop();
      ort = ortWoerter.join(' ').replace(/[,;:]+$/, '');
      rest = rest.slice(0, atStelle);
    }
    const woerter = rest.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
    while (woerter.length && STOPP_VORNE.test(woerter[0])) woerter.shift();
    while (woerter.length && STOPP_HINTEN.test(woerter[woerter.length - 1])) woerter.pop();
    let titel = woerter.join(' ')
      .replace(/\s+([,;!?])/g, '$1')
      .replace(/[,;:\-–]+$/, '')
      .trim();
    if (!titel) titel = art === 'projekt' ? 'Neues Projekt' : 'Neuer Termin';


    /* ---------- 13. Fehlendes sinnvoll ergänzen ---------- */
    if (start === null && tageszeit !== null && !ganztaegig) start = tageszeit;

    // Wiederholung ohne Datum: erster passender Tag ab heute
    if (!datum && wdh.art === 'woechentlich' && wdh.tage.length) {
      for (let i = 0; i < 7; i++) {
        const d = plusTage(heute, i);
        if (wdh.tage.includes(d.getDay())) { datum = d; break; }
      }
    }

    if (!datum && art === 'termin') {
      if (start !== null && wdh.art === 'keine' && start <= jetztMin && ende === null) {
        datum = plusTage(heute, 1);
        annahmen.push('Uhrzeit heute schon vorbei → morgen');
      } else {
        datum = heute;
        if (wdh.art === 'keine') annahmen.push('kein Datum → heute');
      }
    }

    // Wöchentlich ohne Tage („wöchentlich“) -> Wochentag des Datums
    if (wdh.art === 'woechentlich' && !wdh.tage.length && datum) wdh.tage = [datum.getDay()];
    // „Training Montag wöchentlich“ – Datum passt dann sowieso
    if (wdh.art === 'woechentlich') wdh.tage = [...new Set(wdh.tage)].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7));

    if (ganztaegig || (start === null && ende === null)) {
      if (!ganztaegig && art === 'termin') annahmen.push('keine Uhrzeit → ganztägig');
      if (dauer !== null && art === 'termin') annahmen.push('Dauer ohne Uhrzeit wird ignoriert');
      ganztaegig = true;
      start = null; ende = null;
    } else {
      if (start === null) start = Math.max(0, ende - (dauer || 60));
      // „24 Uhr“ als Beginn = 0:00 Uhr am nächsten Tag
      if (start >= 1440 && datum) {
        start -= 1440;
        if (ende !== null) ende = Math.max(0, ende - 1440);
        datum = plusTage(datum, 1);
      }
      if (ende === null) {
        if (dauer === null) annahmen.push('keine Dauer → 1 Stunde');
        ende = start + (dauer || 60);
      }
      // Ende nach Mitternacht (z. B. „22-6 Uhr“)
      if (ende <= start && !endDatum) {
        ende += 1440;
      }
      if (ende >= 1440) {
        endDatum = plusTage(datum, Math.floor(ende / 1440));
        ende = ende % 1440;
      }
    }

    return {
      art,
      titel,
      datum: datum ? schluessel(datum) : null,
      endDatum: datum ? schluessel(endDatum || datum) : null,
      ganztaegig: art === 'projekt' ? true : ganztaegig,
      start: art === 'projekt' || start === null ? null : zeitText(start),
      ende: art === 'projekt' || ende === null ? null : zeitText(ende),
      wiederholung: art === 'projekt' ? { art: 'keine', tage: [], intervall: 1, bis: null } : wdh,
      kategorie,
      ort,
      annahmen: art === 'projekt' ? [] : annahmen
    };
  }


  /* =========================================================
     Texte für die Vorschau, z. B. „Mo, 9. Nov, 14:30–15:30“
     ========================================================= */

  // „Mo, 9. Nov“ (+ Jahr, wenn nicht dieses Jahr)
  function datumText(s, bezug = new Date()) {
    const d = ausSchluessel(s);
    const jahr = d.getFullYear() !== new Date(bezug).getFullYear() ? ' ' + d.getFullYear() : '';
    return `${WT_ANZEIGE[d.getDay()]}, ${d.getDate()}. ${MONATE_ANZEIGE[d.getMonth()]}${jahr}`;
  }

  // „jeden Montag“, „täglich“, „alle 2 Wochen (Sa)“ …
  function wiederholungText(w) {
    if (!w || w.art === 'keine') return '';
    const n = Math.max(1, w.intervall || 1);
    const namen = (w.tage || []).map(t => WOCHENTAGE[t].charAt(0).toUpperCase() + WOCHENTAGE[t].slice(1));
    let text;
    if (w.art === 'taeglich') text = n > 1 ? `alle ${n} Tage` : 'täglich';
    else if (w.art === 'woechentlich') {
      const werktags = w.tage.length === 5 && [1, 2, 3, 4, 5].every(t => w.tage.includes(t));
      if (n > 1) text = `alle ${n} Wochen` + (namen.length ? ` (${w.tage.map(t => WT_ANZEIGE[t]).join(', ')})` : '');
      else if (werktags) text = 'werktags';
      else if (namen.length > 1) text = 'jeden ' + namen.slice(0, -1).join(', ') + ' und ' + namen[namen.length - 1];
      else if (namen.length === 1) text = 'jeden ' + namen[0];
      else text = 'wöchentlich';
    } else if (w.art === 'monatlich') text = n > 1 ? `alle ${n} Monate` : 'monatlich';
    else text = n > 1 ? `alle ${n} Jahre` : 'jährlich';
    if (w.bis) {
      const d = ausSchluessel(w.bis);
      text += ` bis ${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
    }
    return text;
  }

  // Ganze Vorschau-Zeile für ein parse()-Ergebnis
  function beschreibung(e, bezug = new Date()) {
    if (e.art === 'projekt') return `Projekt ${e.titel} – ${wannText(e, bezug)}`;
    return `${e.titel} – ${wannText(e, bezug)}`;
  }

  // Nur der Zeit-Teil: „Mo, 9. Nov, 14:30–15:30 · jeden Montag“
  function wannText(e, bezug = new Date()) {
    if (e.art === 'projekt') {
      if (!e.datum) return 'ohne Deadline';
      const heute = new Date(bezug); heute.setHours(0, 0, 0, 0);
      const tage = Math.round((ausSchluessel(e.datum) - heute) / 86400000);
      const noch = tage === 0 ? 'heute' : tage === 1 ? 'noch 1 Tag' : tage > 1 ? `noch ${tage} Tage` : `${-tage} Tage überfällig`;
      return `Deadline ${datumText(e.datum, bezug)} (${noch})`;
    }
    let zeit;
    if (e.ganztaegig) {
      zeit = e.endDatum && e.endDatum !== e.datum
        ? `${datumText(e.datum, bezug)} – ${datumText(e.endDatum, bezug)}, ganztägig`
        : `${datumText(e.datum, bezug)}, ganztägig`;
    } else if (e.endDatum && e.endDatum !== e.datum) {
      zeit = `${datumText(e.datum, bezug)}, ${e.start} – ${datumText(e.endDatum, bezug)}, ${e.ende}`;
    } else {
      zeit = `${datumText(e.datum, bezug)}, ${e.start}–${e.ende}`;
    }
    const wdh = wiederholungText(e.wiederholung);
    return `${zeit}${wdh ? ' · ' + wdh : ''}`;
  }

  return { parse, beschreibung, wannText, datumText, wiederholungText, WT_ANZEIGE, MONATE_ANZEIGE };
})();
