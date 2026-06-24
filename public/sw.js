// TechRadar Togo - Service Worker
const CACHE_NAME = "techradar-v1";
const OFFLINE_URL = "/";

// Assets to pre-cache on install
const PRECACHE_ASSETS = [
  "/",
  "/manifest.json",
  "/favicon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") return;

  // Skip API and Firestore requests (always fetch fresh)
  const url = new URL(event.request.url);
  if (
    url.pathname.startsWith("/api/") ||
    url.hostname.includes("firestore") ||
    url.hostname.includes("algolia") ||
    url.hostname.includes("firebase")
  ) {
    return;
  }

  // Strategy: Network first, then cache fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Serve from cache when offline
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          // Fallback to home page for navigation requests
          if (event.request.mode === "navigate") {
            return caches.match(OFFLINE_URL);
          }
        });
      })
  );
});
