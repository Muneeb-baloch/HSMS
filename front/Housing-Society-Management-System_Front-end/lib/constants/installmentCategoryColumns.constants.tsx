// src/lib/constants/installmentCategoryColumns.constants.tsx
import { TableColumn } from '@/components/shared/DataTable/DataTable'
import { Badge } from '@/components/ui/badge'
import {
  INSTALLMENT_CATEGORY_KIND_LABELS,
  InstallmentCategory,
  InstallmentCategoryKind,
} from '@/lib/types/installmentCategory'
import { formatDate } from '@/lib/utils/format'

// kind drives whether this category's amount counts toward the plot-price
// reconciliation (down_payment/installment) or is a separate charge excluded
// from it (everything else) — same color coding as the File page's balance
// split, so it reads consistently across the app.
const KIND_BADGE_CLASS: Record<InstallmentCategoryKind, string> = {
  [InstallmentCategoryKind.DOWN_PAYMENT]: 'bg-green-100 text-green-800',
  [InstallmentCategoryKind.INSTALLMENT]: 'bg-green-100 text-green-800',
  [InstallmentCategoryKind.POSSESSION_FEE]: 'bg-orange-100 text-orange-800',
  [InstallmentCategoryKind.LEGAL_FEE]: 'bg-orange-100 text-orange-800',
  [InstallmentCategoryKind.APPLICATION_FEE]: 'bg-blue-100 text-blue-800',
  [InstallmentCategoryKind.NOC_FEE]: 'bg-blue-100 text-blue-800',
  [InstallmentCategoryKind.REGISTRY_FEE]: 'bg-blue-100 text-blue-800',
  [InstallmentCategoryKind.OTHER]: 'bg-gray-100 text-gray-800',
}

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
    id: 'kind',
    header: 'Kind',
    accessorKey: 'kind',
    sortable: true,
    cell: row => (
      <Badge className={KIND_BADGE_CLASS[row.kind] || 'bg-gray-100 text-gray-800'}>
        {INSTALLMENT_CATEGORY_KIND_LABELS[row.kind] || row.kind}
      </Badge>
    ),
    width: '130'
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
