// src/lib/constants/userroleColumns.constants.tsx
import { TableColumn } from '@/components/shared/DataTable/DataTable'
import { Badge } from '@/components/ui/badge'
import { RoleLevel, UserRole } from '@/lib/types/userrole'
import { formatDate } from '@/lib/utils/format'

export const userRoleColumns: TableColumn<UserRole>[] = [
  {
    id: 'roleName',
    header: 'Role Name',
    accessorKey: 'roleName',
    sortable: true,
    cell: row => (
      <div>
        <div className='font-semibold'>{row.roleName}</div>
        <div className='text-sm text-gray-500'>{row.roleCode}</div>
      </div>
    ),
    width: '200'
  },
  {
    id: 'roleLevel',
    header: 'Level',
    cell: row => {
      const roleLevel = row.roleLevel || RoleLevel.BASIC

      const levelColors = {
        [RoleLevel.SYSTEM]: 'bg-purple-100 text-purple-800',
        [RoleLevel.ADMINISTRATIVE]: 'bg-red-100 text-red-800',
        [RoleLevel.MANAGERIAL]: 'bg-orange-100 text-orange-800',
        [RoleLevel.OPERATIONAL]: 'bg-blue-100 text-blue-800',
        [RoleLevel.STAFF]: 'bg-green-100 text-green-800',
        [RoleLevel.BASIC]: 'bg-gray-100 text-gray-800'
      }

      return (
        <Badge
          className={levelColors[roleLevel] || 'bg-gray-100 text-gray-800'}
        >
          {roleLevel}
        </Badge>
      )
    },
    width: '140'
  },
  {
    id: 'priority',
    header: 'Priority',
    accessorKey: 'priority',
    sortable: true,
    cell: row => <div className='font-medium'>{row.priority}</div>,
    width: '100'
  },
  {
    id: 'usage',
    header: 'Usage',
    cell: row => (
      <div className='space-y-1'>
        <div className='text-sm'>
          <span className='font-medium'>{row.userCount || 0}</span>
          <span className='text-gray-500'> users</span>
        </div>
        <div className='text-sm'>
          <span className='font-medium'>{row.permissionCount || 0}</span>
          <span className='text-gray-500'> permissions</span>
        </div>
      </div>
    ),
    width: '150'
  },
  {
    id: 'isSystem',
    header: 'System',
    cell: row => (
      <Badge
        className={
          row.isSystem
            ? 'bg-purple-100 text-purple-800'
            : 'bg-gray-100 text-gray-800'
        }
      >
        {row.isSystem ? 'Yes' : 'No'}
      </Badge>
    ),
    width: '80'
  },
  {
    id: 'isActive',
    header: 'Active',
    cell: row => (
      <Badge
        className={
          row.isActive
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }
      >
        {row.isActive ? 'Yes' : 'No'}
      </Badge>
    ),
    width: '80'
  },
  {
    id: 'createdAt',
    header: 'Created',
    accessorKey: 'createdAt',
    cell: row => formatDate(row.createdAt),
    sortable: true,
    width: '120'
  }
]
