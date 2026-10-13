import { TableColumn } from '@/components/shared/DataTable/DataTable';
import { InstallmentPlanDetail } from '@/lib/types/installmentPlanDetail';
import { formatCurrency, formatDate } from '@/lib/utils/format';

export const installmentPlanDetailColumns: TableColumn<InstallmentPlanDetail>[] = [
  {
    id: 'planId',
    header: 'Plan',
    accessorKey: 'planId',
    cell: (row) => (
      <div className="text-sm font-medium">
        {typeof row.planId === 'object' && row.planId !== null
          ? (row.planId as { planName?: string }).planName || '—'
          : '—'}
      </div>
    ),
    width: '180',
  },
  {
    id: 'instCatId',
    header: 'Category',
    accessorKey: 'instCatId',
    cell: (row) => (
      <div className="text-sm">
        {typeof row.instCatId === 'object' && row.instCatId !== null
          ? (row.instCatId as { instCatName?: string }).instCatName || '—'
          : '—'}
      </div>
    ),
    width: '180',
  },
  {
    id: 'occurrence',
    header: 'Occurrence',
    accessorKey: 'occurrence',
    sortable: true,
    cell: (row) => <div className="font-medium">{row.occurrence}</div>,
    width: '100',
  },
  {
    id: 'percentageAmount',
    header: 'Percentage (%)',
    accessorKey: 'percentageAmount',
    sortable: true,
    cell: (row) => (
      <div className="text-sm">
        {row.percentageAmount > 0 ? `${row.percentageAmount}%` : '—'}
      </div>
    ),
    width: '120',
  },
  {
    id: 'fixedAmount',
    header: 'Fixed Amount',
    accessorKey: 'fixedAmount',
    sortable: true,
    cell: (row) => (
      <div className="text-sm font-medium text-green-600 dark:text-green-400">
        {row.fixedAmount > 0 ? formatCurrency(row.fixedAmount) : '—'}
      </div>
    ),
    width: '140',
  },
  {
    id: 'createdAt',
    header: 'Created',
    cell: (row) => (
      <div className="text-sm text-muted-foreground">
        {formatDate(row.createdAt)}
      </div>
    ),
    width: '120',
  },
];
