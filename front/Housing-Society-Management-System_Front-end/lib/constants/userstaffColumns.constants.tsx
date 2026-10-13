// src/lib/constants/userstaffColumns.constants.tsx
import { TableColumn } from '@/components/shared/DataTable/DataTable'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { UserStaff } from '@/lib/types/userStaff'
import { formatDate } from '@/lib/utils/format'

export const userStaffColumns: TableColumn<UserStaff>[] = [
  {
    id: 'user',
    header: 'User',
    accessorKey: 'userName',
    sortable: true,
    cell: row => {
      const role = (row as any).roleId
      const city = (row as any).cityId

      return (
        <div className='flex items-center gap-3'>
          <Avatar className='h-9 w-9'>
            <AvatarFallback>
              {row.fullName
                ?.split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .substring(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className='font-semibold'>{row.fullName}</div>
            <div className='text-sm text-gray-500'>@{row.userName}</div>
            {role && (
              <div className='text-xs text-gray-400 mt-0.5'>
                {role.roleName} • {city?.cityName || 'Unknown City'}
              </div>
            )}
          </div>
        </div>
      )
    },
    width: '250'
  },
  {
    id: 'contact',
    header: 'Contact',
    cell: row => (
      <div className='space-y-1'>
        {row.email && (
          <div className='text-sm'>
            <span className='font-medium'>{row.email}</span>
          </div>
        )}
        {row.mobileNo && (
          <div className='text-sm'>
            <span className='text-gray-500'>Phone:</span>{' '}
            <span className='font-medium'>{row.mobileNo}</span>
          </div>
        )}
        <div className='text-sm'>
          <span className='text-gray-500'>CNIC:</span>{' '}
          <span className='font-medium'>{row.cnic}</span>
        </div>
      </div>
    ),
    width: '200'
  },
  {
    id: 'designation',
    header: 'Designation',
    accessorKey: 'designation',
    cell: row => (
      <div className='font-medium'>{row.designation || 'Not specified'}</div>
    ),
    width: '150'
  },
  {
    id: 'status',
    header: 'Status',
    cell: row => (
      <div className='space-y-2'>
        <Badge
          className={
            row.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }
        >
          {row.isActive ? 'Active' : 'Inactive'}
        </Badge>
        {(row as any).lockUntil &&
          new Date((row as any).lockUntil) > new Date() && (
            <Badge className='bg-yellow-100 text-yellow-800 text-xs'>
              Locked
            </Badge>
          )}
      </div>
    ),
    width: '120'
  },
  {
    id: 'lastLogin',
    header: 'Last Login',
    cell: row => (
      <div className='text-sm'>
        {row.lastLogin ? (
          <>
            <div className='font-medium'>{formatDate(row.lastLogin)}</div>
            <div className='text-gray-500'>Active</div>
          </>
        ) : (
          <div className='text-gray-500'>Never logged in</div>
        )}
      </div>
    ),
    width: '140'
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
