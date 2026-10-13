'use client'

import { apiClient } from '@/lib/API/client'
import { useCallback, useEffect, useState } from 'react'

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function usePushSubscription() {
  const [status, setStatus] = useState<'idle' | 'requesting' | 'subscribed' | 'denied' | 'error'>('idle')

  const subscribe = useCallback(async () => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('error')
      return
    }
    setStatus('requesting')
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setStatus('denied')
        return
      }

      const reg = await navigator.serviceWorker.ready
      const keyRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:5000'}/api/vapid-public-key`,
        { headers: { Accept: 'application/json' } }
      )
      const keyData = await keyRes.json()
      const publicKey = keyData?.data?.publicKey
      if (!publicKey) {
        setStatus('error')
        return
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      })

      const subscription = sub.toJSON()
      if (!subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
        setStatus('error')
        return
      }

      await apiClient.updateProfile({
        pushSubscription: {
          endpoint: subscription.endpoint,
          keys: { p256dh: subscription.keys.p256dh, auth: subscription.keys.auth },
          userAgent: navigator.userAgent,
        },
      })
      setStatus('subscribed')
    } catch {
      setStatus('error')
    }
  }, [])

  return { subscribe, status }
}
