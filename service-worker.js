const CACHE_NAME = "team10479-nexus-v1";

const PRECACHE = [
  "./index.html",
  "./manifest.webmanifest",
  "./favicon.png",
  "./pwa-icon-192.png",
  "./pwa-icon-512.png",
  "./assets/10479-3d-viewer.bundle.js",
  "./assets/10479-site.css",
  "./assets/10479-site.js",
  "./assets/main-CNRF1Wgj.css",
  "./fonts/google-fonts.css",
  "./fonts/font-00.ttf",
  "./fonts/font-01.ttf",
  "./fonts/font-02.ttf",
  "./fonts/font-03.ttf",
  "./fonts/font-04.ttf",
  "./fonts/font-05.ttf",
  "./fonts/font-06.ttf",
  "./fonts/font-07.ttf",
  "./fonts/font-08.ttf",
  "./fonts/mokoto.ttf",
  "./fonts/open-sans-400.ttf",
  "./fonts/open-sans-600.ttf",
  "./fonts/open-sans-700.ttf",
  "./binder_assets/10479/3d/nexus-web.glb",
  "./binder_assets/10479/chassis.webp",
  "./binder_assets/10479/cover-hero.webp",
  "./binder_assets/10479/glb-viewer.webp",
  "./binder_assets/10479/indexer.webp",
  "./binder_assets/10479/intake.webp",
  "./binder_assets/10479/nexus-render-square.webp",
  "./binder_assets/10479/nexus-sketch-square.webp",
  "./binder_assets/10479/powerscout.webp",
  "./binder_assets/10479/robot-angle.webp",
  "./binder_assets/10479/robot-hero.webp",
  "./binder_assets/10479/shooter.webp",
  "./binder_assets/10479/simulator-field.webp",
  "./binder_assets/10479/simulator.webp",
  "./binder_assets/10479/site-qr.png",
  "./binder_assets/10479/software-dynamic-solver.webp",
  "./binder_assets/10479/software-shot-readiness.webp",
  "./binder_assets/10479/swerve.webp",
  "./binder_assets/10479/team-logo.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const url of PRECACHE) {
        const response = await fetch(url, { cache: "reload" });
        if (!response.ok) throw new Error(`Unable to cache ${url}`);
        await cache.put(url, response);
      }
      await self.skipWaiting();
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(async (keys) => {
      await Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)));
      await self.clients.claim();
    })
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("./index.html"))
    );
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
