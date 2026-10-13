// src/lib/constants/userpermissionColumns.constants.tsx
import { TableColumn } from '@/components/shared/DataTable/DataTable'
import { Badge } from '@/components/ui/badge'
import { AccessType, UserPermission } from '@/lib/types/userpermission'
import { formatDate } from '@/lib/utils/format'

export const userPermissionColumns: TableColumn<UserPermission>[] = [
  {
    id: 'moduleName',
    header: 'Module',
    accessorKey: 'moduleName',
    sortable: true,
    cell: row => {
      const moduleName =
        row.moduleName ||
        (typeof row.srModuleId === 'object' ? row.srModuleId.moduleName : '')
      const moduleCode =
        typeof row.srModuleId === 'object' ? row.srModuleId.moduleCode : ''

      return (
        <div>
          <div className='font-semibold'>{moduleName}</div>
          {moduleCode && (
            <div className='text-sm text-gray-500'>{moduleCode}</div>
          )}
        </div>
      )
    },
    width: '200'
  },
  {
    id: 'roleName',
    header: 'Role',
    cell: row => {
      const roleName =
        typeof row.roleId === 'object' ? row.roleId.roleName : 'Unknown Role'
      const roleCode = typeof row.roleId === 'object' ? row.roleId.roleCode : ''

      return (
        <div>
          <div className='font-medium'>{roleName}</div>
          {roleCode && <div className='text-sm text-gray-500'>{roleCode}</div>}
        </div>
      )
    },
    width: '180'
  },
  {
    id: 'accessType',
    header: 'Access Level',
    cell: row => {
      const accessType = row.accessType || AccessType.NO_ACCESS

      const badgeColors = {
        [AccessType.NO_ACCESS]: 'bg-red-100 text-red-800',
        [AccessType.VIEW_ONLY]: 'bg-yellow-100 text-yellow-800',
        [AccessType.LIMITED_ACCESS]: 'bg-blue-100 text-blue-800',
        [AccessType.FULL_ACCESS]: 'bg-green-100 text-green-800'
      }

      return (
        <Badge
          className={badgeColors[accessType] || 'bg-gray-100 text-gray-800'}
        >
          {accessType}
        </Badge>
      )
    },
    width: '140'
  },
  {
    id: 'permissions',
    header: 'Permissions',
    cell: row => {
      const permissions = []
      if (row.canRead) permissions.push('Read')
      if (row.canCreate) permissions.push('Create')
      if (row.canUpdate) permissions.push('Update')
      if (row.canDelete) permissions.push('Delete')
      if (row.canExport) permissions.push('Export')
      if (row.canImport) permissions.push('Import')
      if (row.canApprove) permissions.push('Approve')
      if (row.canVerify) permissions.push('Verify')

      return (
        <div className='flex flex-wrap gap-1'>
          {permissions.map(perm => (
            <Badge key={perm} variant='outline' className='text-xs'>
              {perm}
            </Badge>
          ))}
        </div>
      )
    },
    width: '200'
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
