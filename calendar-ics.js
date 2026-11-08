/* =========================================================
   calendar-ics.js – Termine als .ics-Datei exportieren

   .ics ist das Standard-Format für Kalender. Öffnest du so eine
   Datei am iPhone/Android oder am Laptop, bietet die Kalender-App
   an, die Termine zu übernehmen – inklusive Wiederholung und
   Erinnerung. Damit erinnert dich das Handy zuverlässig, auch wenn
   der Habit Tracker geschlossen ist.

   IcsExport.termin(id)  – ein Termin
   IcsExport.alle()      – alle Termine + Projekt-Deadlines
   ========================================================= */

const IcsExport = {
  WOCHENTAGE: ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'],
  FREQ: { taeglich: 'DAILY', woechentlich: 'WEEKLY', monatlich: 'MONTHLY', jaehrlich: 'YEARLY' },

  // Sonderzeichen so schreiben, wie .ics es verlangt
  text(wert) {
    return String(wert || '')
      .replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
  },

  // Lange Zeilen umbrechen (max. 75 Zeichen, Fortsetzung beginnt mit Leerzeichen)
  falten(zeile) {
    const teile = [];
    let rest = zeile;
    while (rest.length > 73) { teile.push(rest.slice(0, 73)); rest = rest.slice(73); }
    teile.push(rest);
    return teile.join('\r\n ');
  },

  datum(schluessel) { return schluessel.replace(/-/g, ''); },
  datumZeit(schluessel, zeit) { return `${this.datum(schluessel)}T${zeit.replace(':', '')}00`; },

  stempel() {
    return new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  },

  // Dauer für die Erinnerung, z. B. -PT15M (15 Minuten vorher) oder PT9H (9:00 Uhr am Tag)
  dauer(minuten) {
    const vorzeichen = minuten < 0 ? '-' : '';
    let m = Math.abs(minuten);
    const t = Math.floor(m / 1440); m -= t * 1440;
    const h = Math.floor(m / 60); m -= h * 60;
    let text = `${vorzeichen}P${t ? `${t}D` : ''}`;
    if (h || m || !t) text += `T${h ? `${h}H` : ''}${m || (!h) ? `${m}M` : ''}`;
    return text;
  },

  vevent(t) {
    const z = [
      'BEGIN:VEVENT',
      `UID:${t.id}@habit-tracker`,
      `DTSTAMP:${this.stempel()}`,
      `SUMMARY:${this.text(t.titel)}`
    ];
    if (t.ganztaegig) {
      z.push(`DTSTART;VALUE=DATE:${this.datum(t.datum)}`);
      z.push(`DTEND;VALUE=DATE:${this.datum(KalenderDaten.plusTage(t.endDatum, 1))}`); // Ende zählt nicht mit
    } else {
      z.push(`DTSTART:${this.datumZeit(t.datum, t.start)}`);
      z.push(`DTEND:${this.datumZeit(t.endDatum, t.ende)}`);
    }
    if (t.ort) z.push(`LOCATION:${this.text(t.ort)}`);
    if (t.notiz) z.push(`DESCRIPTION:${this.text(t.notiz)}`);
    const k = KalenderDaten.kalenderVon(t);
    if (k) z.push(`CATEGORIES:${this.text(k.name)}`);

    // Wiederholung
    const w = t.wiederholung;
    if (w.art !== 'keine' && this.FREQ[w.art]) {
      let regel = `RRULE:FREQ=${this.FREQ[w.art]}`;
      if (w.intervall > 1) regel += `;INTERVAL=${w.intervall}`;
      if (w.art === 'woechentlich' && w.tage.length) regel += `;BYDAY=${w.tage.map(d => this.WOCHENTAGE[d]).join(',')}`;
      if (w.bis) regel += `;UNTIL=${t.ganztaegig ? this.datum(w.bis) : `${this.datum(w.bis)}T235959`}`;
      z.push(regel);
      w.ausnahmen.forEach(a => {
        z.push(t.ganztaegig ? `EXDATE;VALUE=DATE:${this.datum(a)}` : `EXDATE:${this.datumZeit(a, t.start)}`);
      });
    }

    // Erinnerung (ganztägig: bezogen auf 9:00 Uhr)
    if (t.erinnerung !== null && t.erinnerung !== undefined) {
      const versatz = t.ganztaegig ? 9 * 60 - t.erinnerung : -t.erinnerung;
      z.push('BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${this.text(t.titel)}`, `TRIGGER:${this.dauer(versatz)}`, 'END:VALARM');
    }
    z.push('END:VEVENT');
    return z;
  },

  // Projekt-Deadline als ganztägiger Termin
  deadlineEvent(p) {
    return [
      'BEGIN:VEVENT',
      `UID:projekt-${p.id}@habit-tracker`,
      `DTSTAMP:${this.stempel()}`,
      `SUMMARY:${this.text('Deadline: ' + p.titel)}`,
      `DTSTART;VALUE=DATE:${this.datum(p.deadline)}`,
      `DTEND;VALUE=DATE:${this.datum(KalenderDaten.plusTage(p.deadline, 1))}`,
      ...(p.notiz ? [`DESCRIPTION:${this.text(p.notiz)}`] : []),
      'END:VEVENT'
    ];
  },

  datei(name, events) {
    const zeilen = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Habit Tracker//Kalender//DE',
      'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
      ...events.flat(),
      'END:VCALENDAR'
    ];
    const inhalt = zeilen.map(z => this.falten(z)).join('\r\n') + '\r\n';
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([inhalt], { type: 'text/calendar;charset=utf-8' }));
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 4000);
    return inhalt;
  },

  // Dateiname aus dem Titel: „Mathe-Klausur“ → mathe-klausur.ics
  dateiname(titel) {
    const sauber = String(titel).toLowerCase()
      .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return (sauber || 'termin') + '.ics';
  },

  termin(id) {
    const t = KalenderDaten.termin(id);
    if (!t) return null;
    const inhalt = this.datei(this.dateiname(t.titel), [this.vevent(t)]);
    meldung('.ics-Datei erstellt – öffne sie, um den Termin zu übernehmen');
    return inhalt;
  },

  alle() {
    const b = KalenderDaten.bereich;
    const events = [
      ...b.termine.map(t => this.vevent(t)),
      ...b.projekte.filter(p => p.deadline && !p.erledigt).map(p => this.deadlineEvent(p))
    ];
    if (!events.length) { meldung('Noch keine Termine zum Exportieren'); return null; }
    const inhalt = this.datei(`kalender-${Datum.schluessel(Datum.heute())}.ics`, events);
    meldung(`${events.length} Einträge als .ics exportiert`);
    return inhalt;
  }
};
