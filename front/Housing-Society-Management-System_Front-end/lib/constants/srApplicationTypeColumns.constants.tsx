// src/lib/constants/srApplicationTypeColumns.constants.tsx
import { TableColumn } from '@/components/shared/DataTable/DataTable'
import { Badge } from '@/components/ui/badge'
import { SrApplicationType } from '@/lib/types/srApplicationType'
import { formatCurrency, formatDate } from '@/lib/utils/format'

export const srApplicationTypeColumns: TableColumn<SrApplicationType>[] = [
  {
    id: 'applicationName',
    header: 'Application Name',
    accessorKey: 'applicationName',
    sortable: true,
    cell: row => (
      <div>
        <div className='font-semibold'>{row.applicationName}</div>
        {row.applicationDesc && (
          <div className='text-sm text-gray-500 truncate max-w-xs'>
            {row.applicationDesc}
          </div>
        )}
      </div>
    ),
    width: '250'
  },
  {
    id: 'applicationFee',
    header: 'Application Fee',
    accessorKey: 'applicationFee',
    sortable: true,
    cell: row => (
      <div className='font-bold text-green-600'>
        {formatCurrency(row.applicationFee)}
      </div>
    ),
    width: '120'
  },
  {
    id: 'createdBy',
    header: 'Created By',
    cell: row => (
      <div>
        {row.createdBy && (
          <div className='font-medium'>
            {row.createdBy.firstName} {row.createdBy.lastName}
          </div>
        )}
        <div className='text-sm text-gray-500'>{formatDate(row.createdAt)}</div>
      </div>
    ),
    width: '150'
  },
  {
    id: 'updatedBy',
    header: 'Updated By',
    cell: row => (
      <div>
        {row.updatedBy ? (
          <>
            <div className='font-medium'>
              {row.updatedBy.firstName} {row.updatedBy.lastName}
            </div>
            <div className='text-sm text-gray-500'>
              {formatDate(row.updatedAt)}
            </div>
          </>
        ) : (
          <span className='text-gray-400'>-</span>
        )}
      </div>
    ),
    width: '150'
  },
  {
    id: 'status',
    header: 'Status',
    cell: row => (
      <Badge
        className={
          row.isDeleted
            ? 'bg-red-100 text-red-800'
            : 'bg-green-100 text-green-800'
        }
      >
        {row.isDeleted ? 'Deleted' : 'Active'}
      </Badge>
    ),
    width: '80'
  }
]
