const CACHE = 'open-eskd-__BUILD_HASH__';
const ASSETS = [
  './',
  './index.html',
  './app.js',
  './app.css',
  './manifest.webmanifest',
  './assets/icon.svg',
];
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting()),
  );
});
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith('open-eskd-') && key !== CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (
    request.method !== 'GET' ||
    new URL(request.url).origin !== self.location.origin
  )
    return;
  // Bundles belong to the installed worker, so an update never mixes old and new assets.
  const asset = ASSETS.some(
    (name) => new URL(name, self.registration.scope).href === request.url,
  );
  if (!asset) return;
  // Development previews always show the current local build.
  if (['localhost', '127.0.0.1', '[::1]'].includes(self.location.hostname)) {
    event.respondWith(
      fetch(request).catch(() =>
        caches.open(CACHE).then((cache) => cache.match(request)),
      ),
    );
    return;
  }
  event.respondWith(
    caches
      .open(CACHE)
      .then(async (cache) => (await cache.match(request)) || fetch(request)),
  );
});
