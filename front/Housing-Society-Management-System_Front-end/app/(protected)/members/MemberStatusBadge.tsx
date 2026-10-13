// src/components/members/MemberStatusBadge.tsx
import { cn } from '@/lib/utils'

interface MemberStatusBadgeProps {
  status?:
    | {
        _id: string
        statusName: string
      }
    | string
  className?: string
}

export function MemberStatusBadge ({
  status,
  className
}: MemberStatusBadgeProps) {
  const getStatusInfo = () => {
    if (!status) return { label: 'N/A', color: 'bg-gray-100 text-gray-800' }

    const statusName = typeof status === 'object' ? status.statusName : status

    switch (statusName.toLowerCase()) {
      case 'active':
        return { label: 'Active', color: 'bg-green-100 text-green-800' }
      case 'inactive':
        return { label: 'Inactive', color: 'bg-red-100 text-red-800' }
      case 'pending':
        return { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' }
      case 'suspended':
        return { label: 'Suspended', color: 'bg-orange-100 text-orange-800' }
      default:
        return { label: statusName, color: 'bg-gray-100 text-gray-800' }
    }
  }

  const { label, color } = getStatusInfo()

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        color,
        className
      )}
    >
      {label}
    </span>
  )
}
