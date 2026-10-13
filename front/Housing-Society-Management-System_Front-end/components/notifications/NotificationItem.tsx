'use client'

import { cn } from '@/lib/utils'
import { Bell, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'

interface NotificationItemProps {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
  data?: Record<string, unknown>
  onMarkRead: (id: string) => void
}

const typeIcons: Record<string, React.ReactNode> = {
  announcement: <Bell className="h-4 w-4" />,
  complaint: <FileText className="h-4 w-4" />,
  bill: <FileText className="h-4 w-4" />,
  payment: <FileText className="h-4 w-4" />,
  transfer: <FileText className="h-4 w-4" />,
  possession: <FileText className="h-4 w-4" />,
}

export function NotificationItemComponent({
  id,
  type,
  title,
  message,
  read,
  createdAt,
  data,
  onMarkRead,
}: NotificationItemProps) {
  const router = useRouter()
  const icon = typeIcons[type] ?? <Bell className="h-4 w-4" />
  const url = (data?.url as string) || (data?.complaintId ? `/complaints/${data.complaintId}` : null)

  const handleClick = () => {
    if (!read) onMarkRead(id)
    if (url) router.push(url)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      className={cn(
        'flex gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
        read ? 'bg-transparent' : 'bg-white/5',
        'hover:bg-white/10 cursor-pointer'
      )}
    >
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
          read ? 'bg-white/10 text-gray-400' : 'bg-blue-500/30 text-blue-300'
        )}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn('truncate text-sm font-medium', read ? 'text-gray-400' : 'text-white')}>
          {title}
        </p>
        <p className="truncate text-xs text-gray-500">{message}</p>
        <p className="mt-0.5 text-xs text-gray-600">
          {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
        </p>
      </div>
    </div>
  )
}
