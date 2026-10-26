// ==============================================================================
// SONARA X TZIONX — PWA PRODUCTION SERVICE WORKER (v1.0.0)
// ==============================================================================
// Safe caching architecture:
// • Precaches App Shell & Offline Shell Assets
// • Stale-While-Revalidate for local JS/CSS/Fonts/Assets
// • Network-Only for /api/youtube/* (Returns structured offline JSON on loss of network)
// • Completely bypasses third-party media & IFrame streams (YouTube / GoogleVideo)
// ==============================================================================

const CACHE_VERSION = 'sonara-v1-shell';
const MAX_DYNAMIC_ENTRIES = 60;

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/manifest.json',
  '/favicon.svg',
  '/icons/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-192.png',
  '/icons/icon-maskable-512.png',
  '/icons/apple-touch-icon.png',
  '/cinema/og-pawan-kalyan.jpg',
  '/cinema/prabhas-baahubali.jpg',
  '/cinema/nani-jersey.jpg',
  '/cinema/allu-arjun-pushpa.jpg',
  '/cinema/anirudh-rockstar.jpg',
  '/cinema/retro-comic.jpg',
];

// 1. Install Phase — Precache App Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => {
        // Individual precaching so one missing asset does not abort entire install
        return Promise.allSettled(
          PRECACHE_ASSETS.map((url) =>
            fetch(url, { cache: 'no-cache' })
              .then((response) => {
                if (response && response.status === 200) {
                  return cache.put(url, response);
                }
              })
              .catch((err) => {
                console.warn('[Sonara SW] Precache missed optional asset:', url, err);
              })
          )
        );
      })
      .then(() => {
        // Do not force skipWaiting automatically during install so active playback isn't interrupted
      })
  );
});

// 2. Activate Phase — Clean old cache generations
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_VERSION) {
              console.log('[Sonara SW] Clearing outdated cache generation:', name);
              return caches.delete(name);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// 3. User & Client Lifecycle Messages
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data.type === 'GET_VERSION') {
    event.ports?.[0]?.postMessage({ version: CACHE_VERSION });
  }
});

// Helper: Trim dynamic cache to bounded size
async function trimCache(cacheName, maxItems) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length > maxItems) {
      // Evict oldest non-precached items
      const deleteCount = keys.length - maxItems;
      for (let i = 0; i < deleteCount; i++) {
        const itemUrl = new URL(keys[i].url).pathname;
        if (!PRECACHE_ASSETS.includes(itemUrl)) {
          await cache.delete(keys[i]);
        }
      }
    }
  } catch (err) {
    // Ignore cache trimming errors
  }
}

// 4. Fetch Strategy
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // A. Strictly Bypass Third-Party Media, Video & Audio Streams
  if (
    url.hostname.includes('youtube.com') ||
    url.hostname.includes('googlevideo.com') ||
    url.hostname.includes('ytimg.com') ||
    url.hostname.includes('doubleclick.net') ||
    url.hostname.includes('ggpht.com')
  ) {
    return;
  }

  // B. Live Music API Requests (/api/youtube/*)
  // Strictly Network-Only. Never cache live search results indefinitely in Service Worker.
  // When offline, gracefully catch network error and return structured offline JSON.
  if (url.pathname.startsWith('/api/youtube/')) {
    event.respondWith(
      fetch(req).catch(() => {
        return new Response(
          JSON.stringify({
            configured: true,
            tracks: [],
            totalResults: 0,
            error: 'You are currently offline. Live cinema search and category streams require an active internet connection.',
            code: 'OFFLINE',
            offline: true,
          }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      })
    );
    return;
  }

  // C. HTML Navigation Requests (App Shell)
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((response) => {
          if (response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
          }
          return response;
        })
        .catch(async () => {
          // Offline navigation fallback: serve cached index.html
          const cached = await caches.match('/index.html');
          if (cached) return cached;
          const rootCached = await caches.match('/');
          if (rootCached) return rootCached;
          return new Response('Sonara is offline. Please reconnect to launch application.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' },
          });
        })
    );
    return;
  }

  // D. Same-Origin Static Assets & Fonts (JS, CSS, Images, Icons, Audio)
  if (url.origin === self.location.origin || url.hostname.includes('fonts.gstatic.com') || url.hostname.includes('fonts.googleapis.com')) {
    event.respondWith(
      caches.match(req).then((cachedResponse) => {
        const fetchPromise = fetch(req)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const copy = networkResponse.clone();
              caches.open(CACHE_VERSION).then((cache) => {
                cache.put(req, copy);
                trimCache(CACHE_VERSION, MAX_DYNAMIC_ENTRIES);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // Network failed, return cached if available
            return cachedResponse;
          });

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }
});
