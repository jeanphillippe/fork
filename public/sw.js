/* Fork · service worker
   Guarda las pantallas para que abran aunque se corte internet.
   Siempre intenta traer la versión nueva primero; si no hay red, usa la guardada. */
const CACHE = 'fork-v3';
const ARCHIVOS = ['./', 'index.html', 'hub.js', 'qr.js', 'icon.svg', 'manifest.json',
  'tiendas/humo-burgers.js', 'tiendas/empanadas-arabes.js', 'tiendas/blue-sushi.js'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin || u.pathname.startsWith('/api/')) return;
  e.respondWith(
    fetch(e.request).then((r) => {
      if (r.ok) { const copia = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copia)); }
      return r;
    }).catch(() => caches.match(e.request).then((r) => r || caches.match('index.html')))
  );
});
