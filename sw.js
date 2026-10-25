/* =========================================================
   sw.js – Service Worker (für die installierte Handy-App)

   Speichert alle Dateien der App auf dem Gerät, damit sie
   auch ohne Internet startet. Läuft nur, wenn die App über
   eine Internetadresse (https://) geöffnet wird.

   WICHTIG nach Änderungen an der App: VERSION unten um eins
   erhöhen. Dann holt sich das Handy die neuen Dateien.
   ========================================================= */

const VERSION = 'v2';
const SPEICHER = `habit-tracker-${VERSION}`;

// Die eigenen Dateien der App
const APP_DATEIEN = [
  './',
  './index.html',
  './styles.css',
  './config.js',
  './data.js',
  './app.js',
  './habits.js',
  './today.js',
  './stats.js',
  './wisdom.js',
  './wisdom-page.js',
  './settings.js',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

// Beim Installieren: alle App-Dateien speichern
self.addEventListener('install', ereignis => {
  ereignis.waitUntil(
    caches.open(SPEICHER)
      .then(speicher => speicher.addAll(APP_DATEIEN))
      .then(() => self.skipWaiting())
  );
});

// Beim Aktivieren: alte Versionen aufräumen
self.addEventListener('activate', ereignis => {
  ereignis.waitUntil(
    caches.keys()
      .then(namen => Promise.all(namen
        .filter(name => name.startsWith('habit-tracker-') && name !== SPEICHER)
        .map(name => caches.delete(name))))
      .then(() => self.clients.claim())
  );
});

// Bei jeder Anfrage
self.addEventListener('fetch', ereignis => {
  const anfrage = ereignis.request;
  if (anfrage.method !== 'GET') return;
  const eigene = new URL(anfrage.url).origin === self.location.origin;

  ereignis.respondWith(
    caches.open(SPEICHER).then(async speicher => {
      const gespeichert = await speicher.match(anfrage, { ignoreSearch: eigene });

      // Bibliotheken aus dem Internet (Icons, Diagramme, Schrift) haben feste
      // Versionen → einmal gespeichert, immer aus dem Speicher nehmen.
      if (!eigene && gespeichert) return gespeichert;

      // Eigene Dateien: sofort die gespeicherte Version zeigen und im
      // Hintergrund nach einer neueren schauen ("stale-while-revalidate").
      const ausDemNetz = fetch(anfrage)
        .then(antwort => {
          if (antwort && (antwort.ok || antwort.type === 'opaque')) speicher.put(anfrage, antwort.clone());
          return antwort;
        })
        .catch(() => gespeichert);

      return gespeichert || ausDemNetz;
    })
  );
});
