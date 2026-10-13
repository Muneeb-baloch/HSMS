// src/lib/constants/srDevStatusColumns.constants.ts
import { TableColumn } from '@/components/shared/DataTable/DataTable'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { SrDevStatus } from '@/lib/types/srdevstatus'
import { DEV_CATEGORY_LABELS, DEV_PHASE_LABELS } from './srDevStatus.constants'

export const srDevStatusColumns: TableColumn<SrDevStatus>[] = [
  {
    id: 'srDevStatName',
    header: 'Status Name',
    accessorKey: 'srDevStatName',
    sortable: true,
    width: '200px',
    cell: (row: SrDevStatus) => (
      <div className='flex items-center gap-3'>
        <div
          className='w-3 h-3 rounded-full'
          style={{ backgroundColor: row.colorCode }}
        />
        <div>
          <div className='font-medium'>{row.srDevStatName}</div>
          <div className='text-xs text-gray-500'>{row.srDevStatCode}</div>
        </div>
      </div>
    )
  },
  {
    id: 'devCategory',
    header: 'Category',
    accessorKey: 'devCategory',
    sortable: true,
    width: '120px',
    cell: (row: SrDevStatus) => (
      <Badge
        variant='outline'
        className='capitalize'
        style={{ borderColor: row.colorCode }}
      >
        {DEV_CATEGORY_LABELS[row.devCategory]}
      </Badge>
    )
  },
  {
    id: 'devPhase',
    header: 'Phase',
    accessorKey: 'devPhase',
    sortable: true,
    width: '120px',
    cell: (row: SrDevStatus) => (
      <Badge
        variant='outline'
        className='capitalize'
        style={{
          borderColor: row.colorCode,
          backgroundColor: `${row.colorCode}20`
        }}
      >
        {DEV_PHASE_LABELS[row.devPhase]}
      </Badge>
    )
  },
  {
    id: 'isActive',
    header: 'Active',
    accessorKey: 'isActive',
    sortable: true,
    width: '80px',
    cell: (row: SrDevStatus) => (
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
    id: 'requiresDocumentation',
    header: 'Documentation',
    accessorKey: 'requiresDocumentation',
    sortable: true,
    width: '100px',
    cell: (row: SrDevStatus) => (
      <div className='flex justify-center'>
        <Switch
          checked={row.requiresDocumentation}
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
    width: '100px',
    cell: (row: SrDevStatus) => (
      <div className='text-sm'>
        {new Date(row.createdAt).toLocaleDateString()}
      </div>
    )
  }
]
