// Mana Palle Fresh - Service Worker Cache for Instant Offline & PWA Performance
const CACHE_NAME = "mana-palle-cache-v1";
const STATIC_ASSETS = [
  "./",
  "index.html",
  "manifest.json",
  "css/app.css",
  "js/translations.js",
  "js/data.js",
  "js/store.js",
  "js/customer.js",
  "js/admin.js",
  "js/delivery.js",
  "assets/logo.jpg",
  "assets/mutton.jpg",
  "assets/fish.jpg",
  "assets/dairy.jpg",
  "assets/vegetables.jpg",
  "assets/grains.jpg"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => {
      return res || fetch(e.request).catch(() => caches.match("index.html"));
    })
  );
});
