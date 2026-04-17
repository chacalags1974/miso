const CACHE_NAME = 'miso-v1';
const urlsToCache = [
  'index.html',
  'manifest.json',
  'assets/style.css',
  'assets/script.js',
  'icon-512.png',
  // Incluye tus apps preinstaladas si quieres que funcionen offline:
  'apps/calculadora.html',
  'apps/notas.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

