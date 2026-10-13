'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

export interface IncomingNotification {
  id: string
  type: string
  title: string
  message: string
  data?: Record<string, unknown>
  createdAt: string
}

interface SocketContextValue {
  socket: Socket | null
  connected: boolean
  notifications: IncomingNotification[]
  unreadCount: number
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>
  addNotification: (n: IncomingNotification) => void
  clearUnread: () => void
  decrementUnread: () => void
}

const SocketContext = createContext<SocketContextValue | null>(null)

export function useSocket() {
  const ctx = useContext(SocketContext)
  if (!ctx) {
    throw new Error('useSocket must be used within SocketProvider')
  }
  return ctx
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [notifications, setNotifications] = useState<IncomingNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const addNotification = useCallback((n: IncomingNotification) => {
    setNotifications((prev) => [n, ...prev].slice(0, 50))
    setUnreadCount((c) => c + 1)
  }, [])

  const clearUnread = useCallback(() => setUnreadCount(0), [])
  const decrementUnread = useCallback(() => {
    setUnreadCount((c) => Math.max(0, c - 1))
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const token = localStorage.getItem('accessToken')
    if (!token) return

    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
    const socketUrl = base.replace(/\/api\/?$/, '')

    const s = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
    })

    s.on('connect', () => setConnected(true))
    s.on('disconnect', () => setConnected(false))
    s.on('notification', (payload: IncomingNotification) => {
      addNotification(payload)
    })

    setSocket(s)
    return () => {
      s.disconnect()
      setSocket(null)
      setConnected(false)
    }
  }, [addNotification])

  const value: SocketContextValue = {
    socket,
    connected,
    notifications,
    unreadCount,
    setUnreadCount,
    addNotification,
    clearUnread,
    decrementUnread,
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}
