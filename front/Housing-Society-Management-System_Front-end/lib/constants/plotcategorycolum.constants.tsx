// src/lib/constants/plotcategorycolum.constants.tsx
import { TableColumn } from '@/components/shared/DataTable/DataTable'
import { Badge } from '@/components/ui/badge'
import { PlotCategory } from '@/lib/types/plotcategory'
import { formatDate } from '@/lib/utils/format'

export const plotCategoryColumns: TableColumn<PlotCategory>[] = [
  {
    id: 'categoryName',
    header: 'Category Name',
    accessorKey: 'categoryName',
    sortable: true,
    width: '200'
  },
  {
    id: 'surchargeType',
    header: 'Surcharge Type',
    cell: row => {
      const surchargeType = row.surchargeType || 'none'
      const variants = {
        percentage: { label: 'Percentage', color: 'bg-blue-100 text-blue-800' },
        fixed: { label: 'Fixed', color: 'bg-green-100 text-green-800' },
        none: { label: 'None', color: 'bg-gray-100 text-gray-800' }
      }
      const variant = variants[surchargeType]
      return (
        <Badge className={variant.color}>
          {variant.label}
          {surchargeType === 'percentage' && row.surchargePercentage
            ? ` (${row.surchargePercentage}%)`
            : ''}
          {surchargeType === 'fixed' && row.surchargeFixedAmount
            ? ` (${row.surchargeFixedAmount})`
            : ''}
        </Badge>
      )
    },
    width: '150'
  },
  {
    id: 'formattedSurcharge',
    header: 'Surcharge',
    cell: row => row.formattedSurcharge || 'None',
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
  },
  {
    id: 'categoryDesc',
    header: 'Description',
    cell: row => (
      <div className='max-w-xs truncate' title={row.categoryDesc}>
        {row.categoryDesc || 'N/A'}
      </div>
    ),
    width: '300'
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
