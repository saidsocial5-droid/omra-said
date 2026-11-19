/* عمرة سعيد — Service Worker مع تحديث تلقائي
   الإصدار يُستبدل تلقائياً عند كل نشر عبر GitHub Actions */
const VERSION = '__BUILD__';
const CACHE = 'omra-said-' + VERSION;
const FILES = ['./', './index.html', './manifest.json', './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png', './telecom.json', './flights.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, {cache: 'reload'})))));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
/* الشبكة أولاً (لجلب أحدث نسخة)، ثم الذاكرة المؤقتة عند انقطاع الإنترنت */
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request, {cache: 'no-cache'}).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request, {ignoreSearch: true}).then(r => r || caches.match('./index.html')))
  );
});
