/*
 * Offline support without a build plugin.
 *
 * Vite hashes every asset filename, so a precache list would have to be
 * generated at build time. This caches on demand instead: whatever you have
 * opened once keeps working with the network off. That is the honest version of
 * the promise anyway — a tool you have never opened was never downloaded.
 *
 * Nothing here talks to any server but the one that served the page.
 */

const CACHE = 'quiverkit-v1'

self.addEventListener('install', () => {
  // Take over as soon as possible; there is no old data to migrate.
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys()
      await Promise.all(names.filter((name) => name !== CACHE).map((name) => caches.delete(name)))
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // A navigation must fall back to the cached shell, otherwise refreshing any
  // deep link while offline shows the browser's error page.
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request)
          const cache = await caches.open(CACHE)
          void cache.put('/index.html', fresh.clone())
          return fresh
        } catch {
          const cached = await caches.match('/index.html')
          return cached ?? Response.error()
        }
      })(),
    )
    return
  }

  event.respondWith(
    (async () => {
      const cached = await caches.match(request)
      // Hashed assets never change under the same name, so a hit is always safe
      // to serve immediately.
      if (cached) return cached

      const response = await fetch(request)
      if (response.ok) {
        const cache = await caches.open(CACHE)
        void cache.put(request, response.clone())
      }

      return response
    })(),
  )
})
