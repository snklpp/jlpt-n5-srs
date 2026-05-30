/* Minimal service worker: enables installability + offline.
   - navigations: network-first (always try fresh index, fall back to cache offline)
   - same-origin assets: cache-first (Vite hashes filenames, so they're immutable) */
const CACHE = "n5-srs-v2";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (e) => {
  e.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // let the browser handle cross-origin (fonts CDN)

  if (req.mode === "navigate") {
    e.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req);
          const c = await caches.open(CACHE);
          c.put(req, fresh.clone());
          return fresh;
        } catch (err) {
          return (await caches.match(req)) || (await caches.match("./")) || Response.error();
        }
      })()
    );
    return;
  }

  e.respondWith(
    (async () => {
      const cached = await caches.match(req);
      if (cached) return cached;
      try {
        const fresh = await fetch(req);
        if (fresh && fresh.status === 200) {
          const c = await caches.open(CACHE);
          c.put(req, fresh.clone());
        }
        return fresh;
      } catch (err) {
        return cached || Response.error();
      }
    })()
  );
});
