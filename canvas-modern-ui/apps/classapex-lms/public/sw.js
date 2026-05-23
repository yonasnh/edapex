const CACHE_NAME = 'classapex-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/classapex_logo_transparent.png',
  '/classapex.png'
];

// Install Event - Pre-cache essential shells and assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching offline skeleton');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Hybrid Caching Strategy (Network-First with fallback for APIs, Cache-First for assets)
self.addEventListener('fetch', (event) => {
  // Only handle standard HTTP/HTTPS requests (ignores chrome-extension://, about:, data: schemas)
  if (!event.request.url.startsWith('http')) {
    return;
  }

  // Only intercept and cache GET requests (POST, PUT, DELETE, etc. must bypass PWA caching completely)
  if (event.request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(event.request.url);

  // Canvas API caching: Network-first, fallback to cache
  if (requestUrl.pathname.includes('/api/v1/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseClone).catch((err) => {
                  console.error('[Service Worker] Failed to put API response in cache:', err);
                });
              })
              .catch((err) => {
                console.error('[Service Worker] Failed to open cache for API:', err);
              });
          }
          return response;
        })
        .catch((error) => {
          console.warn('[Service Worker] Network failed for API, serving from cache:', event.request.url, error);
          const corsHeaders = {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': event.request.headers.get('Origin') || '*',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Headers': 'Authorization, Content-Type'
          };
          return caches.match(event.request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Fallback for current user profile if offline and not in cache
              if (requestUrl.pathname.includes('/users/self')) {
                console.log('[Service Worker] Returning offline fallback mock profile for /users/self');
                return new Response(JSON.stringify({
                  id: 'offline-user',
                  name: 'Offline User',
                  short_name: 'Offline User',
                  primary_email: 'offline@schoolapex.test',
                  login_id: 'offline@schoolapex.test',
                  avatar_url: null,
                  permissions: {
                    become_user: true
                  },
                  enrollments: [
                    { type: 'TeacherEnrollment' },
                    { type: 'StudentEnrollment' }
                  ],
                  locale: 'en',
                  timezone: 'UTC'
                }), {
                  status: 200,
                  headers: corsHeaders
                });
              }
              return new Response(JSON.stringify({ 
                error: 'Offline', 
                message: 'Network connection failed and no cached response is available.' 
              }), {
                status: 503,
                headers: corsHeaders
              });
            })
            .catch((cacheError) => {
              console.error('[Service Worker] Cache match failed for API:', cacheError);
              return new Response(JSON.stringify({ 
                error: 'Offline', 
                message: 'Network connection failed and cache match failed.' 
              }), {
                status: 503,
                headers: corsHeaders
              });
            });
        })
    );
    return;
  }

  // Static Assets caching: Cache-first, fallback to network
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Asynchronous background revalidation
          fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse.status === 200) {
                const responseClone = networkResponse.clone();
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(event.request, responseClone).catch((err) => {
                      console.error('[Service Worker] Background cache put failed:', err);
                    });
                  })
                  .catch((err) => {
                    console.error('[Service Worker] Background cache open failed:', err);
                  });
              }
            })
            .catch(() => { /* Ignore background network failures */ });
          return cachedResponse;
        }

        return fetch(event.request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache).catch((err) => {
                  console.error('[Service Worker] Static asset cache put failed:', err);
                });
              })
              .catch((err) => {
                console.error('[Service Worker] Static asset cache open failed:', err);
              });
            return response;
          })
          .catch((fetchErr) => {
            console.error('[Service Worker] Static asset fetch failed:', fetchErr);
            // Return a standard network error Response to prevent unhandled rejection
            return new Response('Network error', { status: 480, statusText: 'Network Error' });
          });
      })
      .catch((matchErr) => {
        console.error('[Service Worker] Static asset cache match failed:', matchErr);
        return fetch(event.request).catch((fetchErr2) => {
          console.error('[Service Worker] Static asset fallback fetch failed:', fetchErr2);
          return new Response('Network error', { status: 480, statusText: 'Network Error' });
        });
      })
  );
});

// Handle Push Notifications (Web Push API - S22-06)
self.addEventListener('push', (event) => {
  let data = { title: 'ClassApex Notification', body: 'New activity detected on Canvas.' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = { title: 'ClassApex Notification', body: event.data.text() };
    }
  }

  const options = {
    body: data.body,
    icon: '/classapex_logo_transparent.png',
    badge: '/classapex_logo_transparent.png',
    data: data.url || '/notifications',
    vibrate: [100, 50, 100],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle Notification Clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === event.notification.data && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data);
      }
    })
  );
});
