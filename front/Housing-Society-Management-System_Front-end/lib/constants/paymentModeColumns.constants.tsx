// src/lib/constants/paymentModeColumns.constants.tsx
import { TableColumn } from '@/components/shared/DataTable/DataTable'
import { Badge } from '@/components/ui/badge'
import { PaymentMode } from '@/lib/types/paymentMode'
import { formatDate } from '@/lib/utils/format'

export const paymentModeColumns: TableColumn<PaymentMode>[] = [
  {
    id: 'paymentModeName',
    header: 'Payment Mode',
    accessorKey: 'paymentModeName',
    sortable: true,
    cell: row => (
      <div className='flex items-center gap-2'>
        <div className='p-1.5 bg-gray-100 rounded'>
          {row.paymentModeName === 'cash' ? (
            <span className='text-green-600'>💵</span>
          ) : (
            <span className='text-blue-600'>💳</span>
          )}
        </div>
        <div>
          <div className='font-semibold'>{row.paymentModeName}</div>
          {row.description && (
            <div className='text-xs text-gray-500 truncate max-w-[200px]'>
              {row.description}
            </div>
          )}
        </div>
      </div>
    ),
    width: '200'
  },
  {
    id: 'status',
    header: 'Status',
    cell: row => (
      <Badge
        className={
          row.isActive
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }
      >
        {row.isActive ? 'Active' : 'Inactive'}
      </Badge>
    ),
    width: '100'
  },
  {
    id: 'createdBy',
    header: 'Created By',
    cell: row => (
      <div className='text-sm'>
        {row.createdBy && typeof row.createdBy === 'object' ? (
          <div>
            <div className='font-medium'>
              {(row.createdBy as any).firstName}{' '}
              {(row.createdBy as any).lastName}
            </div>
            <div className='text-gray-500 text-xs'>
              {(row.createdBy as any).email}
            </div>
          </div>
        ) : (
          <span className='text-gray-500'>Unknown</span>
        )}
      </div>
    ),
    width: '150'
  },
  {
    id: 'createdAt',
    header: 'Created',
    accessorKey: 'createdAt',
    cell: row => formatDate(row.createdAt),
    sortable: true,
    width: '120'
  },
  {
    id: 'modifiedOn',
    header: 'Last Modified',
    cell: row => (
      <div className='text-sm'>
        {row.modifiedOn ? (
          formatDate(row.modifiedOn)
        ) : (
          <span className='text-gray-500'>Never modified</span>
        )}
      </div>
    ),
    width: '140'
  }
]
