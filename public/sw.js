const CACHE_NAME = 'upz-portal-v1';
const PRECACHE_ASSETS = [
    '/',
    '/UPZ_polbeng.webp',
    '/favicon.svg',
    '/favicon.ico'
];

// Install: Simpan shell aset penting
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(PRECACHE_ASSETS).catch((err) => {
                console.warn('Pre-caching assets failed:', err);
            });
        })
    );
    self.skipWaiting();
});

// Activate: Bersihkan cache lama
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch: Jangan cache API calls, cache static assets
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Abaikan request non-GET atau request ke API
    if (request.method !== 'GET' || url.pathname.startsWith('/api/')) {
        return;
    }

    // Strategi untuk Navigasi Halaman HTML: Network First, Fallback to Cache
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request).catch(() => {
                return caches.match('/') || caches.match(request);
            })
        );
        return;
    }

    // Strategi untuk Static Assets (JS, CSS, Images, Fonts): Stale-While-Revalidate
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            const fetchPromise = fetch(request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseToCache);
                    });
                }
                return networkResponse;
            }).catch(() => cachedResponse);

            return cachedResponse || fetchPromise;
        })
    );
});
