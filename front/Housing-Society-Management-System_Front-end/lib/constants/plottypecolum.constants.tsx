// src/lib/constants/plottypecolum.constants.tsx
import { TableColumn } from '@/components/shared/DataTable/DataTable'
import { formatDate } from '@/lib/utils/format'
import { PlotTypes } from '../types/plottypes'

export const plotTypeColumns: TableColumn<PlotTypes>[] = [
  {
    id: 'plotTypeName',
    header: 'Plot Type Name',
    accessorKey: 'plotTypeName',
    sortable: true,
    width: '200'
  },
  {
    id: 'createdBy',
    header: 'Created By',
    cell: row => {
      if (typeof row.createdBy === 'object') {
        return `${row.createdBy.firstName} ${row.createdBy.lastName}`
      }
      return 'N/A'
    },
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
    id: 'updatedAt',
    header: 'Updated',
    accessorKey: 'updatedAt',
    cell: row => formatDate(row.updatedAt),
    sortable: true,
    width: '120'
  }
]
