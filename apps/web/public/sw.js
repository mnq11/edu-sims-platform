/**
 * عامل الخدمة — العمل دون اتصال: تخزين مسبق للهيكل وتخزين أول-بالذاكرة
 * (cache-first) لكل الأصول، مع رجوع للصفحة الرئيسية عند انقطاع الشبكة.
 * التوجيه بالهاش يعني أن '/' واحدة تخدم كل المسارات.
 */
const CACHE = 'edusims-v2';
const PRECACHE = ['/', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ),
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(
      (hit) =>
        hit ||
        fetch(event.request)
          .then((response) => {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(event.request, copy));
            return response;
          })
          .catch(() => caches.match('/')),
    ),
  );
});
