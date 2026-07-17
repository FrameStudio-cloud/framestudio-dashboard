import { clientsClaim } from 'workbox-core'
import { registerRoute, setCatchHandler, setDefaultHandler } from 'workbox-routing'
import {
  NetworkFirst,
  StaleWhileRevalidate,
  CacheFirst,
  NetworkOnly,
} from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { BackgroundSyncPlugin } from 'workbox-background-sync'
import { precacheAndRoute, matchPrecache } from 'workbox-precaching'

const CACHE_VERSION = 'fs-v2'
const API_CACHE = `api-${CACHE_VERSION}`
const IMAGE_CACHE = `images-${CACHE_VERSION}`
const FONT_CACHE = `fonts-${CACHE_VERSION}`
const NAV_CACHE = `nav-${CACHE_VERSION}`

precacheAndRoute(self.__WB_MANIFEST)

const mutationSync = new BackgroundSyncPlugin('fs-mutations', {
  maxRetentionTime: 24 * 60,
})

registerRoute(
  ({ request }) => request.destination === 'font',
  new CacheFirst({
    cacheName: FONT_CACHE,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxAgeSeconds: 365 * 24 * 60 * 60 }),
    ],
  })
)

registerRoute(
  ({ request }) => request.destination === 'image',
  new StaleWhileRevalidate({
    cacheName: IMAGE_CACHE,
    plugins: [
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 }),
    ],
  })
)

registerRoute(
  ({ url, request }) => {
    if (request.method !== 'GET') return false
    const isSupabase = url.hostname.includes('supabase.co')
    const isApi = url.pathname.startsWith('/api/') || url.pathname.startsWith('/rest/')
    return isSupabase || isApi
  },
  new NetworkFirst({
    cacheName: API_CACHE,
    fetchOptions: { mode: 'cors' },
    plugins: [
      new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 24 * 60 * 60 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
)

registerRoute(
  ({ request }) => request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE' || request.method === 'PATCH',
  new NetworkOnly({ plugins: [mutationSync] })
)

registerRoute(
  ({ request }) => request.destination === 'document',
  new NetworkFirst({ cacheName: NAV_CACHE, plugins: [new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 24 * 60 * 60 })] })
)

setDefaultHandler(new NetworkFirst({ cacheName: `default-${CACHE_VERSION}` }))

setCatchHandler(async ({ request }) => {
  if (request.destination === 'document') {
    const cached = await matchPrecache('/offline.html')
    if (cached) return cached
    return new Response(
      `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline — FrameStudio</title><style>body{font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#0f172a;color:#e2e8f0;text-align:center;padding:2rem}h1{font-size:1.5rem;margin-bottom:0.5rem}p{color:#94a3b8;font-size:0.875rem}</style></head><body><div><h1>You're offline</h1><p>FrameStudio Dashboard is cached, but this page needs the network.<br>Check your connection and try again.</p></div></body></html>`,
      { headers: { 'Content-Type': 'text/html; charset=utf-8' }, status: 503 }
    )
  }
  return new Response(JSON.stringify({ offline: true }), {
    headers: { 'Content-Type': 'application/json' }, status: 503,
  })
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
  if (event.data?.type === 'CLEAR_CACHES') {
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
  }
})

self.addEventListener('push', (event) => {
  if (!event.data) return
  let data
  try { data = event.data.json() } catch { data = { title: 'FrameStudio', body: event.data.text() } }
  event.waitUntil(
    self.registration.showNotification(data.title || 'FrameStudio', {
      body: data.body || '',
      icon: '/pwa-192x192.png',
      badge: '/badge-icon.png',
      vibrate: [100, 50, 100],
      data: { url: data.url || '/' },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus()
          client.navigate(url)
          return
        }
      }
      if (clients.openWindow) clients.openWindow(url)
    })
  )
})

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'fs-daily-sync') {
    event.waitUntil(refreshDashboardData())
  }
})

async function refreshDashboardData() {
  const urls = ['/', '/clients', '/links', '/finances', '/focus', '/timeline', '/analytics', '/keel']
  const cache = await caches.open(NAV_CACHE)
  await Promise.allSettled(
    urls.map(async (url) => {
      try {
        const res = await fetch(url)
        if (res.ok) cache.put(url, res.clone())
      } catch {}
    })
  )
}

clientsClaim()
