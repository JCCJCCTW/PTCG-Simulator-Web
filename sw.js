const CACHE_NAME = "ptcg-v1";
const CORE_ASSETS = [
  "./index.html",
  "./app.js",
  "./styles.css",
  "./assets/app-icon.png",
  "./assets/pokemon-card-back.png",
  "./wallpapers/mega_greninja.jpg",
  "./deck-builder-data/cards.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // 卡片圖片：network first, cache fallback
  if (url.hostname === "asia.pokemon-card.com" || url.pathname.includes("/images/")) {
    event.respondWith(
      fetch(event.request)
        .then((resp) => {
          if (resp.ok) {
            const clone = resp.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return resp;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // 核心檔案：cache first, network fallback
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
