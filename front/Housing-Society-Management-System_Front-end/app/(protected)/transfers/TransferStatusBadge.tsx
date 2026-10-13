import { Badge } from '@/components/ui/badge'
import { TransferStatus } from '@/lib/types/transfer.types'
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  DollarSign
} from 'lucide-react'

interface TransferStatusBadgeProps {
  status: TransferStatus
  showIcon?: boolean
}

export function TransferStatusBadge ({
  status,
  showIcon = true
}: TransferStatusBadgeProps) {
  const getStatusConfig = (status: TransferStatus) => {
    switch (status) {
      case 'Pending':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Clock
        }
      case 'Under Review':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: AlertCircle
        }
      case 'Approved':
        return {
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: CheckCircle
        }
      case 'Rejected':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle
        }
      case 'Completed':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle
        }
      case 'Cancelled':
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: XCircle
        }
      case 'On Hold':
        return {
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: Clock
        }
      case 'Documents Required':
        return {
          color: 'bg-pink-100 text-pink-800 border-pink-200',
          icon: AlertCircle
        }
      case 'Fee Pending':
        return {
          color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
          icon: DollarSign
        }
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Clock
        }
    }
  }

  const config = getStatusConfig(status)
  const Icon = config.icon

  return (
    <Badge className={`${config.color} border flex items-center gap-1`}>
      {showIcon && <Icon className='h-3 w-3' />}
      {status}
    </Badge>
  )
}
