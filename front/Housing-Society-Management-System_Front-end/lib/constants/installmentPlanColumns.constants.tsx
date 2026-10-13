// src/lib/constants/installmentPlanColumns.constants.tsx
import { TableColumn } from '@/components/shared/DataTable/DataTable'
import { Badge } from '@/components/ui/badge'
import { InstallmentPlan } from '@/lib/types/installmentPlan'
import { formatCurrency, formatDate } from '@/lib/utils/format'

export const installmentPlanColumns: TableColumn<InstallmentPlan>[] = [
  {
    id: 'planName',
    header: 'Plan Name',
    accessorKey: 'planName',
    sortable: true,
    cell: row => (
      <div className='font-semibold'>{row.planName}</div>
    ),
    width: '200',
  },
  {
    id: 'projId',
    header: 'Project',
    accessorKey: 'projId',
    cell: row => (
      <div className='text-sm'>
        {typeof row.projId === 'object' && row.projId !== null
          ? (row.projId as { projName?: string }).projName || '—'
          : '—'}
      </div>
    ),
    width: '180',
  },
  {
    id: 'totalMonths',
    header: 'Total Months',
    accessorKey: 'totalMonths',
    sortable: true,
    cell: row => <div className='font-medium'>{row.totalMonths}</div>,
    width: '120',
  },
  {
    id: 'totalAmount',
    header: 'Total Amount',
    accessorKey: 'totalAmount',
    sortable: true,
    cell: row => (
      <div className='font-medium text-green-600 dark:text-green-400'>
        {formatCurrency(row.totalAmount)}
      </div>
    ),
    width: '140',
  },
  {
    id: 'isActive',
    header: 'Active',
    cell: row => (
      <Badge
        className={
          row.isActive
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        }
      >
        {row.isActive ? 'Active' : 'Inactive'}
      </Badge>
    ),
    width: '100',
  },
  {
    id: 'createdAt',
    header: 'Created',
    cell: row => (
      <div className='text-sm text-muted-foreground'>
        {formatDate(row.createdAt)}
      </div>
    ),
    width: '120',
  },
]
