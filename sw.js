const CACHE = 'manga-v1.5';
const ASSETS = ['/manga-logistics/', '/manga-logistics/index.html', '/manga-logistics/icon-192.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(()=>{}));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Network first for API calls, cache first for assets
  if(e.request.url.includes('firestore') || e.request.url.includes('firebase')){
    return; // Don't intercept Firebase calls
  }
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
