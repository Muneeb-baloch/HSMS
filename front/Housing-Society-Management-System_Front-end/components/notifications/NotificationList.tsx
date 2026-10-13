'use client'

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { notificationsApi } from '@/lib/API/notifications-api'
import { useSocket } from '@/lib/providers/SocketProvider'
import { NotificationItemComponent } from './NotificationItem'

interface NotificationListProps {
  onMarkRead: (id: string) => void
}

export function NotificationList({ onMarkRead }: NotificationListProps) {
  const { notifications: live } = useSocket()
  const { data, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await notificationsApi.getList({ limit: 20 })
      return res.data
    },
  })

  useEffect(() => {
    if (live.length) refetch()
  }, [live.length, refetch])

  const items = data?.data ?? []
  const unreadCount = data?.unreadCount ?? 0

  return (
    <div className="max-h-[320px] overflow-y-auto">
      {items.length === 0 && live.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-500">No notifications yet</div>
      ) : (
        <div className="space-y-0.5 p-2">
          {items.map((n) => (
            <NotificationItemComponent
              key={n._id}
              id={n._id}
              type={n.type}
              title={n.title}
              message={n.message}
              read={n.read}
              createdAt={n.createdAt}
              data={n.data}
              onMarkRead={onMarkRead}
            />
          ))}
        </div>
      )}
    </div>
  )
}
