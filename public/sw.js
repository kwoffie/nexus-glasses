// Service Worker for caching videos and static assets
const CACHE_NAME = 'nexus-spectacle-v1'
const VIDEO_CACHE_NAME = 'nexus-videos-v1'

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== VIDEO_CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

// Fetch event - cache strategy
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Video caching strategy: Cache First, then Network
  if (request.destination === 'video' || url.pathname.match(/\.(mp4|webm|ogg)$/)) {
    event.respondWith(
      caches.open(VIDEO_CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse
          }
          return fetch(request).then((networkResponse) => {
            // Cache the video if it's a valid response
            if (networkResponse.status === 200) {
              cache.put(request, networkResponse.clone())
            }
            return networkResponse
          }).catch(() => {
            // If network fails, try to return a cached version
            return cache.match(request)
          })
        })
      })
    )
    return
  }

  // Static assets: Cache First, then Network
  if (request.destination === 'image' || request.destination === 'script' || request.destination === 'style') {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse
          }
          return fetch(request).then((networkResponse) => {
            if (networkResponse.status === 200) {
              cache.put(request, networkResponse.clone())
            }
            return networkResponse
          })
        })
      })
    )
    return
  }

  // Default: Network First, then Cache
  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request)
    })
  )
})