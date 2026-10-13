const BUILD = '__BUILD_HASH__';
const CACHE = 'open-eskd-' + BUILD;
const ASSETS = [
  './',
  './index.html',
  './app.js',
  './app.css',
  './manifest.webmanifest',
  './assets/icon.svg',
];
function cacheURL(name) {
  const url = new URL(name, self.registration.scope);
  url.searchParams.set('build', BUILD);
  return url.href;
}
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(ASSETS.map(cacheURL)))
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
  const url = new URL(request.url);
  if (
    request.method !== 'GET' ||
    url.origin !== self.location.origin ||
    (url.search && url.search !== '?build=' + BUILD)
  )
    return;
  // Bundles belong to the installed worker, so an update never mixes old and new assets.
  const asset = ASSETS.find(
    (name) => new URL(name, self.registration.scope).pathname === url.pathname,
  );
  if (!asset) return;
  const key = cacheURL(asset);
  // Development previews always show the current local build.
  if (['localhost', '127.0.0.1', '[::1]'].includes(self.location.hostname)) {
    event.respondWith(
      fetch(request).catch(() =>
        caches.open(CACHE).then((cache) => cache.match(key)),
      ),
    );
    return;
  }
  event.respondWith(
    caches
      .open(CACHE)
      .then(async (cache) => (await cache.match(key)) || fetch(request)),
  );
});
