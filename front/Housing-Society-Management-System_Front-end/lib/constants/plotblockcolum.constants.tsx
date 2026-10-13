import { TableColumn } from '@/components/shared/DataTable/DataTable'
import { PlotBlock } from '@/lib/types/plotblock'
import { formatDate } from '@/lib/utils/format'

export const plotBlockColumns: TableColumn<PlotBlock>[] = [
  {
    id: 'plotBlockName',
    header: 'Plot Block Name',
    accessorKey: 'plotBlockName',
    sortable: true,
    width: '200'
  },
  {
    id: 'plotBlockDesc',
    header: 'Description',
    cell: row => (
      <div className='max-w-xs truncate' title={row.plotBlockDesc}>
        {row.plotBlockDesc || 'N/A'}
      </div>
    ),
    width: '300'
  },
  {
    id: 'projId',
    header: 'Project',
    cell: row => {
      if (row.projectId && typeof row.projectId === 'object') {
        return (
          <div>
            <div className='font-medium'>{row.projectId.projName || 'Unknown'}</div>
            {row.projectId.projCode && (
              <div className='text-sm text-gray-500'>
                {row.projectId.projCode}
              </div>
            )}
          </div>
        )
      }
      return 'N/A'
    },
    width: '200'
  },
  {
    id: 'blockTotalArea',
    header: 'Area',
    cell: row => (
      <div>
        {row.blockTotalArea
          ? `${row.blockTotalArea} ${row.blockAreaUnit || 'acres'}`
          : 'N/A'}
      </div>
    ),
    width: '120'
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
