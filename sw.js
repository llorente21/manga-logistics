const CACHE = 'manga-v2.1';
const ASSETS = ['/manga-logistics/', '/manga-logistics/index.html'];

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if(e.request.url.includes('firestore') || e.request.url.includes('firebase')){
    return;
  }
  // ALWAYS network first - no caching of app files during active dev
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
