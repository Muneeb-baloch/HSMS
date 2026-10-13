// src/lib/constants/plotsizecolum.constants.tsx
import { TableColumn } from '@/components/shared/DataTable/DataTable'
import { Badge } from '@/components/ui/badge'
import { PlotSize } from '@/lib/types/plotsize'
import { formatDate } from '@/lib/utils/format'

export const plotSizeColumns: TableColumn<PlotSize>[] = [
  {
    id: 'plotSizeName',
    header: 'Plot Size',
    accessorKey: 'plotSizeName',
    sortable: true,
    width: '150'
  },
  {
    id: 'totalArea',
    header: 'Area',
    cell: row => (
      <div className='font-medium'>
        {row.totalArea} {row.areaUnit}
      </div>
    ),
    sortable: true,
    width: '120'
  },
  {
    id: 'ratePerUnit',
    header: 'Rate/Unit',
    cell: row => (
      <div className='font-medium'>
        {row.formattedRate || `PKR ${row.ratePerUnit.toLocaleString()}`}
      </div>
    ),
    width: '120'
  },
  {
    id: 'standardBasePrice',
    header: 'Total Price',
    cell: row => (
      <div className='font-bold text-green-700'>
        {row.formattedPrice || `PKR ${row.standardBasePrice.toLocaleString()}`}
      </div>
    ),
    sortable: true,
    width: '150'
  },
  {
    id: 'areaUnit',
    header: 'Unit',
    cell: row => <Badge variant='outline'>{row.areaUnit.toUpperCase()}</Badge>,
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
