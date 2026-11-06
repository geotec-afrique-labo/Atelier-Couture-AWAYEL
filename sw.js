/* Atelier Couture — fonctionnement hors ligne (cache des fichiers de l'application) */
const VERSION = 'atelier-v1';
const FILES = ['./', './index.html', './manifest.webmanifest', './css/style.css',
  './js/silhouettes.js', './js/fabrics.js', './js/modules.js', './js/assist.js', './js/engine.js', './js/export.js', './js/ui.js',
  './icons/icon-180.png', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
/* Cache d'abord (démarrage instantané, même sans réseau), mise à jour en arrière-plan */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.open(VERSION).then(async c => {
    const hit = await c.match(e.request, { ignoreSearch: true });
    const net = fetch(e.request).then(r => { if (r && r.ok) c.put(e.request, r.clone()); return r; }).catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }
    return (await net) || (await c.match('./index.html')) || Response.error();
  }));
});
