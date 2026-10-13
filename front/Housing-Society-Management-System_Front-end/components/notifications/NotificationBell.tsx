'use client'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { Bell } from 'lucide-react'
import { useCallback } from 'react'
import { notificationsApi } from '@/lib/API/notifications-api'
import { useSocket } from '@/lib/providers/SocketProvider'
import { NotificationList } from './NotificationList'

export function NotificationBell() {
  const { unreadCount, setUnreadCount } = useSocket()
  const queryClient = useQueryClient()

  const { data: countRes } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: async () => {
      const res = await notificationsApi.getUnreadCount()
      return res.data
    },
  })
  const apiUnread = countRes?.data?.count ?? 0

  useEffect(() => {
    if (apiUnread > 0) setUnreadCount(apiUnread)
  }, [apiUnread, setUnreadCount])

  const displayCount = Math.max(unreadCount, apiUnread)

  const handleMarkRead = useCallback(
    async (id: string) => {
      try {
        await notificationsApi.markAsRead(id)
        queryClient.invalidateQueries({ queryKey: ['notifications'] })
        queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] })
      } catch {
        // ignore
      }
    },
    [queryClient]
  )


  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full"
        >
          <Bell className="h-5 w-5" />
          {displayCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
              {displayCount > 99 ? '99+' : displayCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 rounded-xl border border-white/10 bg-gray-900/95 p-0 shadow-xl backdrop-blur-xl"
        align="end"
        sideOffset={8}
      >
        <div className="border-b border-white/10 px-3 py-2.5">
          <h3 className="text-sm font-medium text-white">Notifications</h3>
        </div>
        <NotificationList onMarkRead={handleMarkRead} />
      </PopoverContent>
    </Popover>
  )
}
