// Service Worker for PWA Push Notifications
self.addEventListener('push', (event) => {
  if (!event.data) return
  let data = {}
  try {
    data = event.data.json()
  } catch {
    data = { title: 'HSMS', body: event.data.text() || 'New notification' }
  }
  const { title = 'HSMS', body = '', icon = '/icons/icon-192x192.png', data: payload = {} } = data
  const options = {
    body,
    icon,
    badge: '/icons/badge-72x72.png',
    data: payload,
    tag: payload.notificationId || `notif-${Date.now()}`,
    renotify: true,
    requireInteraction: false,
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const data = event.notification.data || {}
  const url = data.url || data.announcementId ? `/announcements/${data.announcementId}` : null
  if (url) {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.navigate(url).then((c) => c?.focus())
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(`${self.location.origin}${url}`)
        }
      })
    )
  }
})
