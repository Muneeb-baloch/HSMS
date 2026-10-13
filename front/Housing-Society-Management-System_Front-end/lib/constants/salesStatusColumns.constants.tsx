// src/lib/constants/salesStatusColumns.constants.ts
import { TableColumn } from '@/components/shared/DataTable/DataTable'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { SalesStatus } from '@/lib/types/salesStatus'
import {
  STATUS_TYPE_BADGE_VARIANTS,
  STATUS_TYPE_LABELS
} from './salesStatus.constants'

export const salesStatusColumns: TableColumn<SalesStatus>[] = [
  {
    id: 'statusName',
    header: 'Status Name',
    accessorKey: 'statusName',
    sortable: true,
    width: '200px',
    cell: (row: SalesStatus) => (
      <div className='flex items-center gap-3'>
        <div
          className='w-3 h-3 rounded-full'
          style={{ backgroundColor: row.colorCode }}
        />
        <div>
          <div className='font-medium'>{row.statusName}</div>
          <div className='text-xs text-gray-500'>{row.statusCode}</div>
        </div>
      </div>
    )
  },
  {
    id: 'statusType',
    header: 'Type',
    accessorKey: 'statusType',
    sortable: true,
    width: '120px',
    cell: (row: SalesStatus) => (
      <Badge variant={STATUS_TYPE_BADGE_VARIANTS[row.statusType] as any}>
        {STATUS_TYPE_LABELS[row.statusType]}
      </Badge>
    )
  },
  {
    id: 'sequence',
    header: 'Sequence',
    accessorKey: 'sequence',
    sortable: true,
    width: '100px',
    cell: (row: SalesStatus) => (
      <div className='text-center font-medium'>{row.sequence}</div>
    )
  },
  {
    id: 'isActive',
    header: 'Active',
    accessorKey: 'isActive',
    sortable: true,
    width: '80px',
    cell: (row: SalesStatus) => (
      <div className='flex justify-center'>
        <Switch
          checked={row.isActive}
          disabled
          className='data-[state=checked]:bg-primary'
        />
      </div>
    )
  },
  {
    id: 'isDefault',
    header: 'Default',
    accessorKey: 'isDefault',
    sortable: true,
    width: '80px',
    cell: (row: SalesStatus) => (
      <div className='flex justify-center'>
        <Switch
          checked={row.isDefault}
          disabled
          className='data-[state=checked]:bg-primary'
        />
      </div>
    )
  },
  {
    id: 'allowsSale',
    header: 'Sale Allowed',
    accessorKey: 'allowsSale',
    sortable: true,
    width: '100px',
    cell: (row: SalesStatus) => (
      <div className='flex justify-center'>
        <Switch
          checked={row.allowsSale}
          disabled
          className='data-[state=checked]:bg-primary'
        />
      </div>
    )
  },
  {
    id: 'requiresApproval',
    header: 'Approval Required',
    accessorKey: 'requiresApproval',
    sortable: true,
    width: '120px',
    cell: (row: SalesStatus) => (
      <div className='flex justify-center'>
        <Switch
          checked={row.requiresApproval}
          disabled
          className='data-[state=checked]:bg-primary'
        />
      </div>
    )
  },
  {
    id: 'createdAt',
    header: 'Created',
    accessorKey: 'createdAt',
    sortable: true,
    width: '120px',
    cell: (row: SalesStatus) => (
      <div className='text-sm'>
        {new Date(row.createdAt).toLocaleDateString()}
      </div>
    )
  }
]
