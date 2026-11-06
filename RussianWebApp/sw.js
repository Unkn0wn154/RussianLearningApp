// Bump CACHE on every deploy so phones pick up the new files.
const CACHE = 'ru-daily-2';
const FILES = ['./', 'index.html', 'style.css', 'app.js', 'lessons.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png',
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => `words/${n}.js`),
  'ru/verbs.js', 'ru/decl.js', 'ru/drills.js', 'ru/phrases.js', 'ru/texts.js', 'ru/texts2.js', 'ru/reading.js'];

self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(r => r || fetch(e.request)));
});
