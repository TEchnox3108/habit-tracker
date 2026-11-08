/* =========================================================
   calendar-reminders.js – Erinnerungen an Termine

   So funktioniert es:
   Jeder Termin kann „erinnerung“ haben (Minuten vorher, z. B. 15).
   Solange die App offen ist (auch im Hintergrund-Tab am Laptop),
   schaut sie alle 30 Sekunden nach, ob eine Erinnerung fällig ist,
   und zeigt dann
     - eine Benachrichtigung des Systems (wenn erlaubt) und
     - einen Hinweis oben in der App.

   Grenze (ehrlich): Ist die App komplett geschlossen, kann sie nicht
   erinnern – dafür bräuchte man einen eigenen Server. Für sichere
   Erinnerungen am Handy gibt es deshalb den .ics-Export
   (calendar-ics.js): Damit landet der Termin samt Erinnerung in der
   Kalender-App des Handys.

   Ganztägige Termine: Die Erinnerung bezieht sich auf 9:00 Uhr.
   ========================================================= */

const Erinnerungen = {
  SPEICHER: 'habit-tracker-erinnert', // welche Erinnerungen schon gezeigt wurden (nur technisch)
  GANZTAGS_UHRZEIT: '09:00',

  // Auswahl im Formular
  OPTIONEN: [
    { wert: '', text: 'Keine' },
    { wert: 0, text: 'Zum Beginn' },
    { wert: 5, text: '5 Minuten vorher' },
    { wert: 10, text: '10 Minuten vorher' },
    { wert: 15, text: '15 Minuten vorher' },
    { wert: 30, text: '30 Minuten vorher' },
    { wert: 60, text: '1 Stunde vorher' },
    { wert: 120, text: '2 Stunden vorher' },
    { wert: 1440, text: '1 Tag vorher' },
    { wert: 2880, text: '2 Tage vorher' },
    { wert: 10080, text: '1 Woche vorher' }
  ],

  // 90 → „1 Std 30 Min vorher“, 0 → „zum Beginn“
  text(min) {
    if (min === null || min === undefined) return '';
    if (min === 0) return 'Zum Beginn';
    const option = this.OPTIONEN.find(o => o.wert === min);
    if (option) return option.text;
    const t = Math.floor(min / 1440), h = Math.floor((min % 1440) / 60), m = min % 60;
    return [t ? `${t} Tag${t > 1 ? 'e' : ''}` : '', h ? `${h} Std` : '', m ? `${m} Min` : ''].filter(Boolean).join(' ') + ' vorher';
  },

  unterstuetzt() {
    return 'Notification' in window;
  },

  // 'granted' (erlaubt), 'denied' (abgelehnt), 'default' (noch nicht gefragt) oder 'fehlt'
  erlaubnis() {
    return this.unterstuetzt() ? Notification.permission : 'fehlt';
  },

  // Fragt den Browser um Erlaubnis (nur nach einem Klick möglich)
  async anfragen() {
    if (!this.unterstuetzt() || Notification.permission !== 'default') return this.erlaubnis();
    try {
      return await Notification.requestPermission();
    } catch (fehler) {
      return this.erlaubnis();
    }
  },

  // Zeitpunkt (als Date) des Beginns eines Vorkommens
  beginn(t, tag) {
    const d = Datum.ausSchluessel(tag);
    const [h, m] = (t.ganztaegig ? this.GANZTAGS_UHRZEIT : t.start).split(':').map(Number);
    d.setHours(h, m, 0, 0);
    return d;
  },

  gemerkt() {
    try { return JSON.parse(localStorage.getItem(this.SPEICHER)) || {}; } catch (f) { return {}; }
  },

  merken(liste) {
    // Einträge älter als 10 Tage wegräumen, damit der Speicher klein bleibt
    const grenze = Date.now() - 10 * 86400000;
    Object.keys(liste).forEach(k => { if (liste[k] < grenze) delete liste[k]; });
    try { localStorage.setItem(this.SPEICHER, JSON.stringify(liste)); } catch (f) { /* egal */ }
  },

  // Schaut nach, ob gerade eine Erinnerung fällig ist
  pruefen() {
    if (!Daten.zustand || !Daten.zustand.kalender) return;
    const jetzt = Date.now();
    const heute = Datum.heute();
    const von = Datum.schluessel(Datum.plusTage(heute, -1));
    const bis = Datum.schluessel(Datum.plusTage(heute, 8)); // „1 Woche vorher“ braucht 7 Tage Vorlauf
    const gemerkt = this.gemerkt();
    let neu = false;

    KalenderDaten.vorkommen(von, bis).forEach(v => {
      const t = v.termin;
      if (t.erinnerung === null || t.erinnerung === undefined) return;
      const schluessel = `${t.id}@${v.datum}`;
      if (gemerkt[schluessel]) return;
      const beginn = this.beginn(t, v.datum).getTime();
      const wann = beginn - t.erinnerung * 60000;
      // fällig – und nicht schon ewig her (App war vielleicht zu); spätestens 15 Min nach Beginn
      if (wann <= jetzt && jetzt - wann < 60 * 60000 && jetzt < beginn + 15 * 60000) {
        gemerkt[schluessel] = jetzt;
        neu = true;
        this.zeigen(t, v);
      }
    });
    if (neu) this.merken(gemerkt);
  },

  // „Heute, 14:30 – 15:30 · Praxis“
  wannText(t, v) {
    const heute = Datum.schluessel(Datum.heute());
    const morgen = Datum.schluessel(Datum.plusTage(Datum.heute(), 1));
    const tag = v.datum === heute ? 'Heute' : v.datum === morgen ? 'Morgen' : Projekte.datumText(v.datum);
    const teile = [`${tag}, ${t.ganztaegig ? 'ganztägig' : `${t.start} – ${t.ende}`}`];
    if (t.ort) teile.push(t.ort);
    return teile.join(' · ');
  },

  async zeigen(t, v) {
    const text = this.wannText(t, v);
    this.hinweisZeigen(t, v, text);

    if (this.erlaubnis() !== 'granted') return;
    const optionen = {
      body: text,
      icon: 'icons/icon-192.png',
      badge: 'icons/icon-192.png',
      tag: `${t.id}@${v.datum}`,
      data: { url: './#kalender' }
    };
    try {
      // Am Handy (Android) geht es nur über den Service Worker
      const reg = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration() : null;
      if (reg) await reg.showNotification(`🔔 ${t.titel}`, optionen);
      else new Notification(`🔔 ${t.titel}`, optionen);
    } catch (fehler) {
      console.warn('Benachrichtigung nicht möglich:', fehler);
    }
  },

  // Hinweis oben in der App (bleibt 15 Sekunden, mit „Ansehen“)
  hinweisZeigen(t, v, text) {
    document.querySelectorAll('.kal-erinnerung').forEach(el => el.remove());
    const k = KalenderDaten.kalenderVon(t);
    const el = document.createElement('div');
    el.className = 'kal-erinnerung';
    el.setAttribute('role', 'alert');
    el.style.setProperty('--kat', `var(--farbe-${k ? k.farbe : 'salbei'})`);
    el.innerHTML = `
      <span class="icon-feld">${icon('bell-ring')}</span>
      <span class="titel-text"><strong>${esc(t.titel)}</strong><small>${esc(text)}</small></span>
      <button type="button" class="knopf zweit klein" data-ansehen>Ansehen</button>
      <button type="button" class="icon-knopf" data-zu aria-label="Schließen">${icon('x')}</button>`;
    document.body.appendChild(el);
    iconsZeichnen();
    const weg = () => { el.classList.add('weg'); setTimeout(() => el.remove(), 300); };
    el.querySelector('[data-zu]').onclick = weg;
    el.querySelector('[data-ansehen]').onclick = () => {
      weg();
      location.hash = 'kalender';
      setTimeout(() => TerminDetail.oeffnen(t.id, v.datum), 50);
    };
    setTimeout(weg, 15000);
  },

  start() {
    setTimeout(() => this.pruefen(), 2000);
    setInterval(() => this.pruefen(), 30000);
    // Beim Zurückkehren in die App sofort nachsehen
    document.addEventListener('visibilitychange', () => { if (!document.hidden) this.pruefen(); });
  }
};

Erinnerungen.start();
