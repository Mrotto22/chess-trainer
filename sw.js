// Service worker: precache every asset (incl. all puzzle shards and the engine) for full offline use
const VERSION = '24560afde8';
const CACHE = 'chess-trainer-' + VERSION;
const ASSETS = ["./","./app.js","./assets/pieces/bB.svg","./assets/pieces/bK.svg","./assets/pieces/bN.svg","./assets/pieces/bP.svg","./assets/pieces/bQ.svg","./assets/pieces/bR.svg","./assets/pieces/wB.svg","./assets/pieces/wK.svg","./assets/pieces/wN.svg","./assets/pieces/wP.svg","./assets/pieces/wQ.svg","./assets/pieces/wR.svg","./data/lessons.js","./data/puzzle-meta.js","./data/puzzles/p1000.js","./data/puzzles/p1100.js","./data/puzzles/p1200.js","./data/puzzles/p1300.js","./data/puzzles/p1400.js","./data/puzzles/p1500.js","./data/puzzles/p1600.js","./data/puzzles/p1700.js","./data/puzzles/p1800.js","./data/puzzles/p1900.js","./data/puzzles/p2000.js","./data/puzzles/p2100.js","./data/puzzles/p2200.js","./data/puzzles/p2300.js","./data/puzzles/p2400.js","./data/puzzles/p2500.js","./data/puzzles/p2600.js","./data/puzzles/p2700.js","./data/puzzles/p2800.js","./data/puzzles/p600.js","./data/puzzles/p700.js","./data/puzzles/p800.js","./data/puzzles/p900.js","./engine/engine-data.js","./icons/icon-180.png","./icons/icon-192.png","./icons/icon-512.png","./icons/icon-maskable-512.png","./index.html","./manifest.webmanifest","./style.css"];
self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    // add in small batches so a phone doesn't choke
    for (let i = 0; i < ASSETS.length; i += 8) await c.addAll(ASSETS.slice(i, i + 8).map(u => new Request(u, { cache: 'reload' })));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith('chess-trainer-') && k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url); if (url.origin !== location.origin) return;
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    let hit = await c.match(req, { ignoreSearch: true });
    if (!hit && req.mode === 'navigate') hit = await c.match('./index.html') || await c.match('./');
    if (hit) return hit;
    try { const res = await fetch(req); if (res.ok) c.put(req, res.clone()); return res; }
    catch (err) { return new Response('Offline and not cached', { status: 503 }); }
  })());
});
self.addEventListener('message', e => { if (e.data === 'status') caches.open(CACHE).then(c => c.keys()).then(k => e.source.postMessage({ type: 'status', cached: k.length, total: ASSETS.length, version: VERSION })); });
