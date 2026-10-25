// Bump CACHE on every deploy so phones pick up the new files.
const CACHE = 'ru-daily-1';
const FILES = ['./', 'index.html', 'style.css', 'app.js', 'lessons.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png',
  'words/1.js', 'words/2.js', 'words/3.js', 'words/4.js', 'words/5.js'];

self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(r => r || fetch(e.request)));
});
