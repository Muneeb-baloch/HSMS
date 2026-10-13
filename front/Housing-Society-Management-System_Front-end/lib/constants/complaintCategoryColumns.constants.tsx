// src/lib/constants/complaintCategoryColumns.constants.tsx
import { TableColumn } from '@/components/shared/DataTable/DataTable'
import { Badge } from '@/components/ui/badge'
import { SrComplaintCategory } from '@/lib/types/srComplaintCategory'

export const complaintCategoryColumns: TableColumn<SrComplaintCategory>[] = [
  {
    id: 'categoryName',
    header: 'Category',
    accessorKey: 'categoryName',
    sortable: true,
    cell: row => (
      <div>
        <div className='font-semibold'>{row.categoryName}</div>
        <div className='text-sm text-gray-500'>{row.categoryCode}</div>
      </div>
    ),
    width: '200'
  },
  {
    id: 'priority',
    header: 'Priority',
    accessorKey: 'priorityLevel',
    sortable: true,
    cell: row => {
      const getPriorityColor = (priority: number) => {
        if (priority <= 3) return 'bg-red-100 text-red-800'
        if (priority <= 6) return 'bg-yellow-100 text-yellow-800'
        return 'bg-green-100 text-green-800'
      }

      const getPriorityLabel = (priority: number) => {
        if (priority <= 3) return 'Critical'
        if (priority <= 6) return 'Medium'
        return 'Low'
      }

      return (
        <div className='space-y-1'>
          <Badge className={getPriorityColor(row.priorityLevel)}>
            Level {row.priorityLevel}
          </Badge>
          <div className='text-xs text-gray-500'>
            {getPriorityLabel(row.priorityLevel)}
          </div>
        </div>
      )
    },
    width: '120'
  },
  {
    id: 'sla',
    header: 'SLA',
    cell: row => {
      const getSlaColor = (slaHours?: number) => {
        if (!slaHours) return 'bg-gray-100 text-gray-800'
        if (slaHours <= 24) return 'bg-red-100 text-red-800'
        if (slaHours <= 48) return 'bg-orange-100 text-orange-800'
        return 'bg-blue-100 text-blue-800'
      }

      const getSlaLabel = (slaHours?: number) => {
        if (!slaHours) return 'No SLA'
        if (slaHours < 24) return `${slaHours}h`
        const days = Math.ceil(slaHours / 24)
        return `${days}d`
      }

      return (
        <Badge className={getSlaColor(row.slaHours)}>
          {getSlaLabel(row.slaHours)}
        </Badge>
      )
    },
    width: '80'
  },
  {
    id: 'escalation',
    header: 'Escalation',
    cell: row => (
      <div className='text-sm'>
        <span className='font-medium'>{row.escalationLevels?.length || 0}</span>
        <span className='text-gray-500'> levels</span>
      </div>
    ),
    width: '100'
  },
  {
    id: 'description',
    header: 'Description',
    cell: row => (
      <div className='text-sm text-gray-600 line-clamp-2'>
        {row.description || 'No description'}
      </div>
    ),
    width: '200'
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
    width: '80'
  },
  {
    id: 'createdAt',
    header: 'Created',
    accessorKey: 'createdAt',
    cell: row => new Date(row.createdAt).toLocaleDateString(),
    sortable: true,
    width: '100'
  }
]
