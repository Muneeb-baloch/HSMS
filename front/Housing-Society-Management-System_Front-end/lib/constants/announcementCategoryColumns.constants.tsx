// src/lib/constants/announcementCategoryColumns.constants.tsx
import { TableColumn } from '@/components/shared/DataTable/DataTable'
import { Badge } from '@/components/ui/badge'
import { AnnouncementCategory } from '@/lib/types/announcementCategory'
import { formatDate } from '@/lib/utils/format'

export const announcementCategoryColumns: TableColumn<AnnouncementCategory>[] =
  [
    {
      id: 'categoryName',
      header: 'Category',
      accessorKey: 'categoryName',
      sortable: true,
      cell: row => (
        <div className='flex items-center gap-3'>
          {row.color && (
            <div
              className='w-6 h-6 rounded-full border border-gray-200'
              style={{ backgroundColor: row.color }}
            />
          )}
          <div>
            <div className='font-semibold'>{row.categoryName}</div>
            {row.description && (
              <div className='text-sm text-gray-500 line-clamp-1'>
                {row.description}
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      id: 'icon',
      header: 'Icon',
      cell: row => row.icon && <span className='text-xl'>{row.icon}</span>,
      width: '80'
    },
    {
      id: 'isActive',
      header: 'Status',
      cell: row => (
        <Badge variant={row.isActive ? 'success' : 'secondary'}>
          {row.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
      width: '100'
    },
    {
      id: 'isSystem',
      header: 'System',
      cell: row =>
        row.isSystem ? <Badge variant='outline'>System</Badge> : '-',
      width: '80'
    },
    {
      id: 'priority',
      header: 'Priority',
      accessorKey: 'priority',
      sortable: true,
      width: '90'
    },
    {
      id: 'announcementCount',
      header: 'Announcements',
      cell: row => row.announcementCount ?? 0,
      width: '120'
    },
    {
      id: 'createdAt',
      header: 'Created',
      accessorKey: 'createdAt',
      sortable: true,
      cell: row => (
        <div className='text-sm text-gray-500'>{formatDate(row.createdAt)}</div>
      ),
      width: '120'
    }
  ]
