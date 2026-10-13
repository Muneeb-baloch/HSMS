import { TableColumn } from '@/components/shared/DataTable/DataTable'
import { Badge } from '@/components/ui/badge'
import { Announcement } from '@/lib/types/announcement'
import { formatDate } from '@/lib/utils/format'

export const announcementColumns: TableColumn<Announcement>[] = [
  {
    id: 'title',
    header: 'Title',
    accessorKey: 'title',
    sortable: true,
    cell: row => (
      <div>
        <div className='font-medium line-clamp-2'>{row.title}</div>
        {row.shortDescription && (
          <div className='text-sm text-gray-500 line-clamp-1'>
            {row.shortDescription}
          </div>
        )}
      </div>
    )
  },
  {
    id: 'category',
    header: 'Category',
    cell: row => {
      const cat = typeof row.categoryId === 'object' ? row.categoryId : null
      return cat ? (
        <div className='flex items-center gap-2'>
          {cat.color && (
            <div
              className='w-4 h-4 rounded-full'
              style={{ backgroundColor: cat.color }}
            />
          )}
          <span>{cat.categoryName}</span>
        </div>
      ) : (
        '-'
      )
    }
  },
  {
    id: 'priority',
    header: 'Priority',
    cell: row => {
      const getVariant = (
        level: number
      ): 'secondary' | 'warning' | 'destructive' => {
        if (level === 1) return 'secondary'
        if (level === 2) return 'warning'
        return 'destructive'
      }
      return (
        <Badge variant={getVariant(row.priorityLevel)}>
          {row.priorityLabel || row.priorityLevel}
        </Badge>
      )
    }
  },
  {
    id: 'status',
    header: 'Status',
    cell: row => (
      <Badge
        variant={
          row.status === 'Published'
            ? 'success'
            : row.status === 'Draft'
            ? 'warning'
            : 'secondary'
        }
      >
        {row.status}
      </Badge>
    )
  },
  {
    id: 'expiresAt',
    header: 'Expires',
    cell: row => (row.expiresAt ? formatDate(row.expiresAt) : 'Never')
  },
  {
    id: 'publishedAt',
    header: 'Published',
    cell: row => (row.publishedAt ? formatDate(row.publishedAt) : '-')
  },
  {
    id: 'attachment',
    header: 'Attachment',
    cell: row =>
      row.attachmentURL ? (
        <a
          href={row.attachmentURL}
          target='_blank'
          rel='noopener noreferrer'
          className='text-blue-600 hover:underline'
        >
          View
        </a>
      ) : (
        '-'
      )
  }
]
