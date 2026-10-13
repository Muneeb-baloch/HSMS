import { TableColumn } from '@/components/shared/DataTable/DataTable'

import { State } from '../types/state'
import { formatDate } from '../utils/format'

export const stateColumns: TableColumn<State>[] = [
  {
    id: 'stateName',
    header: 'State Name',
    accessorKey: 'stateName',
    sortable: true,
    width: '150'
  },
  {
    id: 'stateDescription',
    header: 'Description',
    cell: row => (
      <div className='max-w-xs truncate' title={row.stateDescription}>
        {row.stateDescription || 'N/A'}
      </div>
    ),
    width: '200'
  },
  {
    id: 'cityCount',
    header: 'Cities',
    cell: row => row.cityCount || 0,
    width: '80'
  },
  {
    id: 'statusId',
    header: 'Status',
    cell: row => {
      const statusName =
        typeof row.statusId === 'object' && row.statusId !== null
          ? row.statusId.statusName
          : row.statusId || 'Active'

      return (
        <span
          className={`px-2 py-1 rounded text-xs ${
            statusName?.toLowerCase() === 'active'
              ? 'bg-green-100 text-green-800'
              : statusName?.toLowerCase() === 'inactive'
              ? 'bg-red-100 text-red-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {statusName || 'N/A'}
        </span>
      )
    },
    width: '100'
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
