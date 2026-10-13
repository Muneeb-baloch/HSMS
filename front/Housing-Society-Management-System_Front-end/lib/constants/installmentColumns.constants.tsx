// src/lib/constants/installmentColumns.constants.tsx
import { TableColumn } from '@/components/shared/DataTable/DataTable'
import { Badge } from '@/components/ui/badge'
import {
  Installment,
  InstallmentStatus,
  InstallmentType
} from '@/lib/types/installment'
import { formatCurrency, formatDate } from '@/lib/utils/format'

export const installmentColumns: TableColumn<Installment>[] = [
  {
    id: 'installmentNo',
    header: 'No.',
    accessorKey: 'installmentNo',
    sortable: true,
    cell: row => (
      <div className='font-bold text-center'>#{row.installmentNo}</div>
    ),
    width: '80'
  },
  {
    id: 'installmentTitle',
    header: 'Installment',
    accessorKey: 'installmentTitle',
    sortable: true,
    cell: row => (
      <div>
        <div className='font-semibold'>{row.installmentTitle}</div>
        <div className='text-sm text-gray-500'>
          {row.installmentCategory
            ? typeof row.installmentCategory === 'object'
              ? row.installmentCategory.instCatName
              : 'Category'
            : 'Category'}
        </div>
      </div>
    ),
    width: '200'
  },
  {
    id: 'member',
    header: 'Member',
    cell: row => {
      const member = typeof row.memId === 'object' ? row.memId : null
      const file = typeof row.fileId === 'object' ? row.fileId : null

      return (
        <div>
          <div className='font-medium'>{member?.memName
 || 'Member'}</div>
          <div className='text-sm text-gray-500'>
            File: {file?.fileRegNo || 'File'}
          </div>
        </div>
      )
    },
    width: '180'
  },
  {
    id: 'dueDate',
    header: 'Due Date',
    accessorKey: 'dueDate',
    sortable: true,
    cell: row => {
      const today = new Date()
      const dueDate = new Date(row.dueDate)
      const isOverdue =
        dueDate < today && row.status !== 'Paid' && row.status !== 'Cancelled'

      return (
        <div className={isOverdue ? 'text-red-600 font-medium' : ''}>
          {formatDate(row.dueDate)}
          {isOverdue && <div className='text-xs text-red-500'>Overdue</div>}
        </div>
      )
    },
    width: '120'
  },
  {
    id: 'amounts',
    header: 'Amounts',
    cell: row => (
      <div className='space-y-1'>
        <div className='flex justify-between'>
          <span className='text-sm text-gray-500'>Due:</span>
          <span className='font-medium'>{formatCurrency(row.amountDue)}</span>
        </div>
        <div className='flex justify-between'>
          <span className='text-sm text-gray-500'>Paid:</span>
          <span className='font-medium text-green-600'>
            {formatCurrency(row.amountPaid)}
          </span>
        </div>
        <div className='flex justify-between'>
          <span className='text-sm text-gray-500'>Balance:</span>
          <span
            className={`font-medium ${
              row.balanceAmount > 0 ? 'text-red-600' : 'text-green-600'
            }`}
          >
            {formatCurrency(row.balanceAmount)}
          </span>
        </div>
      </div>
    ),
    width: '150'
  },
  {
    id: 'status',
    header: 'Status',
    accessorKey: 'status',
    sortable: true,
    cell: row => {
      const statusColors = {
        [InstallmentStatus.UNPAID]: 'bg-yellow-100 text-yellow-800',
        [InstallmentStatus.PARTIALLY_PAID]: 'bg-blue-100 text-blue-800',
        [InstallmentStatus.PAID]: 'bg-green-100 text-green-800',
        [InstallmentStatus.OVERDUE]: 'bg-red-100 text-red-800',
        [InstallmentStatus.CANCELLED]: 'bg-gray-100 text-gray-800',
        [InstallmentStatus.REFUNDED]: 'bg-purple-100 text-purple-800'
      }

      const statusLabels = {
        [InstallmentStatus.UNPAID]: 'Unpaid',
        [InstallmentStatus.PARTIALLY_PAID]: 'Partially Paid',
        [InstallmentStatus.PAID]: 'Paid',
        [InstallmentStatus.OVERDUE]: 'Overdue',
        [InstallmentStatus.CANCELLED]: 'Cancelled',
        [InstallmentStatus.REFUNDED]: 'Refunded'
      }

      return (
        <Badge
          className={statusColors[row.status] || 'bg-gray-100 text-gray-800'}
        >
          {statusLabels[row.status]}
        </Badge>
      )
    },
    width: '120'
  },
  {
    id: 'installmentType',
    header: 'Type',
    cell: row => {
      const typeLabels = {
        [InstallmentType.MONTHLY]: 'Monthly',
        [InstallmentType.QUARTERLY]: 'Quarterly',
        [InstallmentType.HALF_YEARLY]: 'Half-Yearly',
        [InstallmentType.YEARLY]: 'Yearly',
        [InstallmentType.BALLOON]: 'Balloon',
        [InstallmentType.DOWN_PAYMENT]: 'Down Payment',
        [InstallmentType.POSSESSION_FEE]: 'Possession Fee',
        [InstallmentType.BALLOTING_FEE]: 'Balloting Fee',
        [InstallmentType.UTILITY_CHARGES]: 'Utility',
        [InstallmentType.DEVELOPMENT_CHARGES]: 'Development',
        [InstallmentType.LEGAL_FEE]: 'Legal',
        [InstallmentType.TRANSFER_FEE]: 'Transfer',
        [InstallmentType.OTHER]: 'Other'
      }

      return <Badge variant='outline'>{typeLabels[row.installmentType]}</Badge>
    },
    width: '100'
  },
  {
    id: 'paidDate',
    header: 'Paid Date',
    cell: row => (
      <div>
        {row.paidDate ? formatDate(row.paidDate) : '-'}
        {row.paymentMode && (
          <div className='text-xs text-gray-500'>{row.paymentMode}</div>
        )}
      </div>
    ),
    width: '120'
  },
  {
    id: 'createdAt',
    header: 'Created',
    accessorKey: 'createdAt',
    sortable: true,
    cell: row => formatDate(row.createdAt),
    width: '120'
  }
]
