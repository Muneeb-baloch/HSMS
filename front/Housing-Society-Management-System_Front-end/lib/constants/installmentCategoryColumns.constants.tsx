// src/lib/constants/installmentCategoryColumns.constants.tsx
import { TableColumn } from '@/components/shared/DataTable/DataTable'
import { Badge } from '@/components/ui/badge'
import { InstallmentCategory } from '@/lib/types/installmentCategory'
import { formatDate } from '@/lib/utils/format'

export const installmentCategoryColumns: TableColumn<InstallmentCategory>[] = [
  {
    id: 'sequenceOrder',
    header: 'Order',
    accessorKey: 'sequenceOrder',
    sortable: true,
    cell: row => (
      <div className='font-bold text-center'>{row.sequenceOrder}</div>
    ),
    width: '80'
  },
  {
    id: 'instCatName',
    header: 'Category Name',
    accessorKey: 'instCatName',
    sortable: true,
    cell: row => (
      <div>
        <div className='font-semibold'>{row.instCatName}</div>
        {row.instCatDescription && (
          <div className='text-sm text-gray-500 truncate max-w-md'>
            {row.instCatDescription}
          </div>
        )}
      </div>
    ),
    width: '250'
  },
  {
    id: 'isRefundable',
    header: 'Refundable',
    cell: row => (
      <Badge
        className={
          row.isRefundable
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }
      >
        {row.isRefundable ? 'Yes' : 'No'}
      </Badge>
    ),
    width: '100'
  },
  {
    id: 'isMandatory',
    header: 'Mandatory',
    cell: row => (
      <Badge
        className={
          row.isMandatory
            ? 'bg-blue-100 text-blue-800'
            : 'bg-gray-100 text-gray-800'
        }
      >
        {row.isMandatory ? 'Yes' : 'No'}
      </Badge>
    ),
    width: '100'
  },
  {
    id: 'createdBy',
    header: 'Created By',
    cell: row => (
      <div className='text-sm'>
        {row.createdBy?.fullName || row.createdBy?.userName || 'System'}
        <div className='text-xs text-gray-500'>{formatDate(row.createdAt)}</div>
      </div>
    ),
    width: '150'
  },
  {
    id: 'isActive',
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
  }
]
