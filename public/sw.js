const CACHE_NAME = "applyflow-v1";
const STATIC_ASSETS = [
  "/",
  "/dashboard",
  "/jobs",
  "/settings",
  "/manifest.json",
  "/icon.svg",
  "/globals.css" // Approximate, Next.js hashes files so we can't precache everything easily without a build plugin.
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Just cache known static routes for basic shell
      return cache.addAll(["/icon.svg", "/manifest.json"]);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // 1. API / Next.js internals: Network Only (let Next handle it or fail)
  if (url.pathname.startsWith("/_next/")) {
     return; 
  }

  // 2. Navigation (HTML): Network first, then Cache, then Offline Fallback?
  // Since this is an SPA-like PWA with Dexie, we mainly need the app shell.
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  // 3. Static Assets (Images, Manifest, etc): Cache First
  if (url.pathname.includes("icon.svg") || url.pathname.includes("manifest")) {
     event.respondWith(
       caches.match(event.request).then((cached) => {
         return cached || fetch(event.request);
       })
     );
     return;
  }
});
