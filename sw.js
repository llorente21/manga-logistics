// MANGA Service Worker - NETWORK ONLY para HTML (siempre fresco)
const CACHE = 'manga-v2.6';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = e.request.url;

  // No interceptar Firebase
  if(url.includes('firestore') || url.includes('firebase')){
    return;
  }

  // HTML e index: SIEMPRE de la red, nunca caché
  if(e.request.mode === 'navigate' || url.endsWith('/') || url.endsWith('index.html')){
    e.respondWith(
      fetch(e.request, {cache: 'no-store'}).catch(() => caches.match(e.request))
    );
    return;
  }

  // Otros recursos: red primero
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
