const CACHE = 'manga-v2.5';

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
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
