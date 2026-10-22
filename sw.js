// Service worker Data GTK — hanya meng-cache aplikasi (shell), BUKAN data GTK.
const V = 'gtk-v2';
const SHELL = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  // API Apps Script (data pribadi) selalu langsung ke jaringan, tidak pernah disimpan
  if (r.method !== 'GET' || /^script\.google(usercontent)?\.com$/.test(u.hostname)) return;
  const simpan = x => { if (x.ok || x.type === 'opaque') { const c = x.clone(); caches.open(V).then(h => h.put(r, c)); } return x; };
  if (r.mode === 'navigate') { // halaman: jaringan dulu, cadangan dari cache saat offline
    e.respondWith(fetch(r).then(simpan).catch(() => caches.match(r).then(m => m || caches.match('index.html'))));
    return;
  }
  e.respondWith(caches.match(r).then(m => m || fetch(r).then(simpan)));
});
