// Self-destructive Service Worker to clean up old caches and unregister
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map(key => caches.delete(key)));
    })
    .then(() => self.registration.unregister())
    .then(() => self.clients.matchAll())
    .then((clients) => {
      clients.forEach(client => {
        try {
          client.navigate(client.url);
        } catch (_) {
          // Fallback if navigate is not supported
        }
      });
    })
  );
});
