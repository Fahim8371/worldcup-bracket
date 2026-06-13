// Minimal offline service worker: network-first, with a cache fallback so the
// app still opens (showing the last-seen data) when you have no connection.
const CACHE = 'wc2026-v1'

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  event.respondWith(
    fetch(request)
      .then((res) => {
        const copy = res.clone()
        caches.open(CACHE).then((c) => c.put(request, copy))
        return res
      })
      .catch(async () => {
        const cached = await caches.match(request)
        if (cached) return cached
        // For navigations, fall back to the cached app shell.
        if (request.mode === 'navigate') {
          const shell = await caches.match('index.html')
          if (shell) return shell
        }
        throw new Error('offline and not cached')
      })
  )
})
