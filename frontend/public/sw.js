const CACHE_NAME = 'portfolio-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assits/Profile_Pic.png',
  '/assits/tauhidshekhar.png'
];

// Install Event - Pre-cache App Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Caching strategy
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Skip non-GET requests and API calls that shouldn't be service-worker cached
  if (req.method !== 'GET' || url.pathname.startsWith('/api/')) {
    return;
  }

  // Cache-First for static fonts & Cloudinary images (Stale-While-Revalidate fallback)
  if (
    url.hostname.includes('fonts.gstatic.com') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('res.cloudinary.com') ||
    url.pathname.includes('/assits/') ||
    url.pathname.match(/\.(?:png|jpg|jpeg|gif|svg|webp|avif|ico|css|js|woff|woff2)$/)
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(req).then((cachedResponse) => {
          const fetchPromise = fetch(req).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(req, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => null);

          // Return cached response instantly, or wait for network fetch
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // Network-First with Cache Fallback for document/page requests
  event.respondWith(
    fetch(req)
      .then((response) => {
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(req).then((cachedResponse) => {
          // If offline and request is HTML/page, return root / index shell
          if (req.headers.get('accept').includes('text/html')) {
            return caches.match('/');
          }
          return cachedResponse;
        });
      })
  );
});
