import { TableColumn } from '@/components/shared/DataTable/DataTable'

import { Status } from '../types/status'
import { formatDate } from '../utils/format'

export const statusColumns: TableColumn<Status>[] = [
  {
    id: 'statusName',
    header: 'Status Name',
    accessorKey: 'statusName',
    sortable: true,
    width: '150'
  },
  {
    id: 'statusDescription',
    header: 'Description',
    cell: row => (
      <div className='max-w-xs truncate' title={row.statusDescription}>
        {row.statusDescription || 'N/A'}
      </div>
    ),
    width: '200'
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
    id: 'updatedAt',
    header: 'Updated',
    accessorKey: 'updatedAt',
    cell: row => formatDate(row.updatedAt),
    sortable: true,
    width: '120'
  }
]
