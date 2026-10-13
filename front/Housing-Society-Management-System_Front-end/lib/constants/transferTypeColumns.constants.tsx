// src/lib/constants/transferTypeColumns.constants.tsx
import { TableColumn } from '@/components/shared/DataTable/DataTable'
import { Badge } from '@/components/ui/badge'
import { TransferType } from '@/lib/types/transfer-type'
import { formatDate } from '@/lib/utils/format'

export const transferTypeColumns: TableColumn<TransferType>[] = [
  {
    id: 'typeName',
    header: 'Transfer Type',
    accessorKey: 'typeName',
    sortable: true,
    cell: row => (
      <div>
        <div className='font-semibold'>{row.typeName}</div>
        {row.description && (
          <div className='text-sm text-gray-500 truncate max-w-xs'>
            {row.description}
          </div>
        )}
      </div>
    ),
    width: '250'
  },
  {
    id: 'transferFee',
    header: 'Transfer Fee',
    cell: row => (
      <div className='font-medium'>
        Rs. {row.transferFee.toLocaleString()}
        {row.formattedFee && (
          <div className='text-sm text-gray-500'>{row.formattedFee}</div>
        )}
      </div>
    ),
    sortable: true,
    width: '120'
  },
  {
    id: 'transfers',
    header: 'Transfers',
    cell: row => (
      <div className='text-center'>
        <span className='font-semibold'>{row.transferCount || 0}</span>
        <div className='text-xs text-gray-500'>used</div>
      </div>
    ),
    width: '80'
  },
  {
    id: 'createdBy',
    header: 'Created By',
    cell: row => (
      <div>
        {row.createdBy && (
          <div className='font-medium'>{row.createdBy.userName}</div>
        )}
        <div className='text-sm text-gray-500'>{formatDate(row.createdAt)}</div>
      </div>
    ),
    width: '150'
  },
  {
    id: 'status',
    header: 'Status',
    cell: row => {
      if (row.isDeleted) {
        return <Badge className='bg-red-100 text-red-800'>Deleted</Badge>
      }

      return (
        <Badge
          className={
            row.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }
        >
          {row.isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    width: '80'
  }
]
