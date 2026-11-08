/* =========================================================
   projects.js – Projekte im Kalender

   Projekte haben eine Deadline, optionale Teilschritte
   (Checkliste) und einen Fortschritt in Prozent.
   - Projekte.listeHtml()       Übersicht (im Kalender unter „Projekte“)
   - ProjektDetail.oeffnen(id)  Fenster mit Checkliste & Fortschritt
   - ProjektFormular.oeffnen()  Anlegen / Bearbeiten

   Die Daten selbst liegen in KalenderDaten (calendar-data.js).
   Deadlines erscheinen außerdem im Kalender (calendar-page.js).
   ========================================================= */

const Projekte = {
  // „noch 30 Tage“, „heute fällig“, „3 Tage überfällig“ + passende Stufe für die Farbe
  frist(p) {
    const tage = KalenderDaten.tageBisDeadline(p);
    if (p.erledigt) return { text: 'erledigt', stufe: 'fertig' };
    if (tage === null) return { text: 'ohne Deadline', stufe: '' };
    if (tage < 0) return { text: tage === -1 ? '1 Tag überfällig' : `${-tage} Tage überfällig`, stufe: 'ueberfaellig' };
    if (tage === 0) return { text: 'heute fällig', stufe: 'bald' };
    if (tage === 1) return { text: 'morgen fällig', stufe: 'bald' };
    return { text: `noch ${tage} Tage`, stufe: tage <= 3 ? 'bald' : '' };
  },

  // „Di, 08.12.2026“
  datumText(schluessel) {
    const d = Datum.ausSchluessel(schluessel);
    return `${Datum.WOCHENTAGE_KURZ[d.getDay()]}, ${Datum.kurz(d)}`;
  },

  // Fortschrittsbalken
  balkenHtml(prozent) {
    return `<span class="kal-balken" role="img" aria-label="${prozent} Prozent"><i style="width:${prozent}%"></i></span>`;
  },

  // Sortierung: nach Deadline (ohne Deadline ans Ende), dann Name
  sortiert(liste) {
    return [...liste].sort((a, b) =>
      (a.deadline || '9999').localeCompare(b.deadline || '9999') || a.titel.localeCompare(b.titel));
  },

  karteHtml(p) {
    const k = KalenderDaten.kalenderVon(p);
    const f = this.frist(p);
    const prozent = KalenderDaten.projektFortschritt(p);
    const fertig = p.schritte.filter(s => s.erledigt).length;
    const unter = [`${prozent} %`];
    if (p.schritte.length) unter.push(`${fertig}/${p.schritte.length} Teilschritte`);
    return `
      <button type="button" class="kal-projekt ${p.erledigt ? 'erledigt' : ''}" style="${Kalender.farbe(k)}" data-projekt="${p.id}">
        <span class="icon-feld">${icon(p.erledigt ? 'check' : (k ? k.icon : 'folder-kanban'))}</span>
        <span class="kal-projekt-text">
          <strong>${esc(p.titel)}</strong>
          <small class="kal-frist ${f.stufe}">${p.deadline ? `${this.datumText(p.deadline)} · ` : ''}${f.text}</small>
          ${this.balkenHtml(prozent)}
          <small>${unter.join(' · ')}</small>
        </span>
      </button>`;
  },

  listeHtml() {
    const alle = KalenderDaten.bereich.projekte;
    const offen = this.sortiert(alle.filter(p => !p.erledigt));
    const erledigt = this.sortiert(alle.filter(p => p.erledigt)).reverse();
    const neu = `<button type="button" class="knopf gestrichelt breit" data-aktion="projekt-neu">${icon('plus')}<span>Neues Projekt</span></button>`;
    if (!alle.length) {
      return neu + platzhalter('folder-kanban', 'Noch keine Projekte',
        'Leg eins an oder schreib oben z. B. „Projekt Referat bis 12.12. #Schule“.');
    }
    return `
      ${neu}
      ${offen.length ? `<div class="kal-projekte">${offen.map(p => this.karteHtml(p)).join('')}</div>`
        : '<p class="seiten-hinweis">Alle Projekte sind erledigt. 🎉</p>'}
      ${erledigt.length ? `
        <h2 class="kal-abschnitt">Erledigt (${erledigt.length})</h2>
        <div class="kal-projekte">${erledigt.map(p => this.karteHtml(p)).join('')}</div>` : ''}`;
  }
};


/* =========================================================
   Detail: Checkliste abhaken, Fortschritt einstellen
   ========================================================= */
const ProjektDetail = {
  oeffnen(id, { fokusNeu = false } = {}) {
    const p = KalenderDaten.projekt(id);
    if (!p) return;
    const k = KalenderDaten.kalenderVon(p);
    const f = Projekte.frist(p);
    const prozent = KalenderDaten.projektFortschritt(p);

    const schritte = p.schritte.map(s => `
      <div class="kal-schritt ${s.erledigt ? 'fertig' : ''}">
        <label>
          <input type="checkbox" data-schritt="${s.id}" ${s.erledigt ? 'checked' : ''}>
          <span>${esc(s.text)}</span>
        </label>
        <button type="button" class="icon-knopf" data-schritt-weg="${s.id}" aria-label="Teilschritt löschen">${icon('x')}</button>
      </div>`).join('');

    const dialog = Dialog.oeffnen('Projekt', `
      <div class="kal-detail" style="${Kalender.farbe(k)}">
        <div class="kal-detail-kopf">
          <span class="kal-strich"></span>
          <div>
            <h3>${esc(p.titel)}</h3>
            <span class="kal-chip"><i></i>${esc(k ? k.name : '')}</span>
          </div>
        </div>

        <ul class="kal-detail-liste">
          <li>${icon('flag')}<span>${p.deadline ? `Deadline ${Datum.lang(Datum.ausSchluessel(p.deadline))}<br>` : ''}<span class="kal-frist ${f.stufe}">${f.text}</span></span></li>
          ${p.notiz ? `<li>${icon('notebook')}<span class="kal-notiz">${esc(p.notiz)}</span></li>` : ''}
        </ul>

        <div class="kal-projekt-stand">
          <strong>${prozent} %</strong>
          ${Projekte.balkenHtml(prozent)}
        </div>

        ${p.schritte.length ? '' : `
          <label class="feld">
            <span class="feld-titel">Fortschritt einstellen</span>
            <input type="range" class="kal-regler" name="fortschritt" min="0" max="100" step="5" value="${p.fortschritt || 0}" ${p.erledigt ? 'disabled' : ''}>
            <small class="hinweis">Oder füge Teilschritte hinzu – dann rechnet die App den Fortschritt selbst aus.</small>
          </label>`}

        <div class="feld">
          <span class="feld-titel">Teilschritte</span>
          ${schritte ? `<div class="kal-schritte">${schritte}</div>` : ''}
          <form class="kal-schritt-neu" autocomplete="off">
            <input class="eingabe" name="text" maxlength="120" placeholder="Teilschritt hinzufügen">
            <button type="submit" class="icon-knopf" aria-label="Hinzufügen">${icon('plus')}</button>
          </form>
        </div>

        <div class="formular-knoepfe kal-detail-knoepfe">
          <button type="button" class="knopf gefahr" data-loeschen aria-label="Löschen" title="Löschen">${icon('trash-2')}<span>Löschen</span></button>
          <button type="button" class="knopf zweit" data-bearbeiten aria-label="Bearbeiten" title="Bearbeiten">${icon('pencil')}<span>Bearbeiten</span></button>
          <button type="button" class="knopf" data-erledigt>${icon(p.erledigt ? 'rotate-ccw' : 'check')}<span>${p.erledigt ? 'Wieder öffnen' : 'Erledigt'}</span></button>
        </div>
      </div>`);

    // Nach jeder Änderung: speichern, Fenster und Kalender neu zeichnen
    const neu = (optionen) => { this.oeffnen(id, optionen); Kalender.neuZeichnen(); };

    dialog.querySelectorAll('[data-schritt]').forEach(el => {
      el.onchange = () => { KalenderDaten.schrittUmschalten(id, el.dataset.schritt); neu(); };
    });
    dialog.querySelectorAll('[data-schritt-weg]').forEach(el => {
      el.onclick = () => { KalenderDaten.schrittLoeschen(id, el.dataset.schrittWeg); neu(); };
    });
    const neuForm = dialog.querySelector('.kal-schritt-neu');
    neuForm.onsubmit = e => {
      e.preventDefault();
      const text = neuForm.elements.text.value.trim();
      if (!text) return;
      KalenderDaten.schrittHinzufuegen(id, text);
      neu({ fokusNeu: true });
    };
    if (fokusNeu) neuForm.elements.text.focus();

    const regler = dialog.querySelector('[name="fortschritt"]');
    if (regler) {
      // beim Ziehen nur die Anzeige ändern, beim Loslassen speichern
      regler.oninput = () => {
        dialog.querySelector('.kal-projekt-stand strong').textContent = `${regler.value} %`;
        dialog.querySelector('.kal-projekt-stand .kal-balken i').style.width = `${regler.value}%`;
      };
      regler.onchange = () => {
        KalenderDaten.projektSpeichern({ id, fortschritt: Number(regler.value) });
        Kalender.neuZeichnen();
      };
    }

    dialog.querySelector('[data-erledigt]').onclick = () => {
      KalenderDaten.projektSpeichern({ id, erledigt: !p.erledigt });
      Kalender.neuZeichnen();
      if (!p.erledigt) { Dialog.schliessen(); meldung(`„${p.titel}“ erledigt 🎉`); }
      else this.oeffnen(id);
    };
    dialog.querySelector('[data-bearbeiten]').onclick = () => ProjektFormular.oeffnen({ id });
    dialog.querySelector('[data-loeschen]').onclick = () => this.loeschen(id);
  },

  async loeschen(id) {
    const p = KalenderDaten.projekt(id);
    if (!p) return;
    if (!await bestaetigen(`Projekt „${p.titel}“ mit allen Teilschritten löschen? Das lässt sich nicht rückgängig machen.`)) return;
    KalenderDaten.projektLoeschen(id);
    Dialog.schliessen();
    Kalender.neuZeichnen();
    meldung('Gelöscht');
  }
};


/* =========================================================
   Formular: Projekt anlegen / bearbeiten
   ========================================================= */
const ProjektFormular = {
  oeffnen({ id = null, werte = {} } = {}) {
    const vorhanden = id ? KalenderDaten.projekt(id) : null;
    const p = vorhanden || KalenderDaten.projektVorlage(werte);
    const kalId = KalenderDaten.kalender(p.kalenderId) ? p.kalenderId : KalenderDaten.kalenderVon({}).id;
    const k = KalenderDaten.kalender(kalId);

    const dialog = Dialog.oeffnen(vorhanden ? 'Projekt bearbeiten' : 'Neues Projekt', `
      <form class="formular kal-formular" style="--kat: var(--farbe-${k ? k.farbe : 'salbei'})" novalidate>
        <label class="feld">
          <span class="feld-titel">Titel</span>
          <input class="eingabe" name="titel" maxlength="80" value="${esc(p.titel)}" placeholder="z. B. Leporello" autocomplete="off">
        </label>
        <label class="feld">
          <span class="feld-titel">Deadline</span>
          <input class="eingabe" type="date" name="deadline" value="${p.deadline || ''}">
          <small class="hinweis">Leer lassen = ohne Deadline</small>
        </label>
        <div class="feld">
          <span class="feld-titel">Kalender</span>
          ${kalenderWahlHtml(kalId)}
        </div>
        ${vorhanden ? '' : `
          <label class="feld">
            <span class="feld-titel">Teilschritte (einer pro Zeile)</span>
            <textarea class="eingabe textfeld" name="schritte" rows="4" placeholder="Ideen sammeln&#10;Entwurf&#10;Abgeben"></textarea>
          </label>`}
        <label class="feld">
          <span class="feld-titel">Notizen</span>
          <textarea class="eingabe textfeld" name="notiz" rows="3" maxlength="1000" placeholder="optional">${esc(p.notiz)}</textarea>
        </label>
        <p class="fehler" hidden></p>
        ${formularKnoepfe(!!vorhanden)}
      </form>`);

    const form = dialog.querySelector('form');
    const f = form.elements;
    form.addEventListener('change', e => {
      if (e.target.name === 'kalender') {
        const g = KalenderDaten.kalender(e.target.value);
        form.style.setProperty('--kat', `var(--farbe-${g ? g.farbe : 'salbei'})`);
      }
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      const titel = f.titel.value.trim();
      if (!titel) return formularFehler(form, 'Bitte gib einen Titel ein.');
      const daten = {
        id: vorhanden ? vorhanden.id : null,
        titel,
        deadline: f.deadline.value || null,
        kalenderId: f.kalender.value,
        notiz: f.notiz.value.trim()
      };
      if (!vorhanden) {
        daten.schritte = f.schritte.value.split('\n').map(s => s.trim()).filter(Boolean)
          .map(text => ({ id: Daten.neueId(), text, erledigt: false }));
      }
      const gespeichert = KalenderDaten.projektSpeichern(daten);
      meldung(vorhanden ? 'Gespeichert' : `Projekt „${titel}“ angelegt`);
      Kalender.projektGezeigt(gespeichert);
      ProjektDetail.oeffnen(gespeichert.id);
    });

    const loeschen = form.querySelector('[data-loeschen]');
    if (loeschen) loeschen.addEventListener('click', () => ProjektDetail.loeschen(id));
  }
};
