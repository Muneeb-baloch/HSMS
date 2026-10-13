// src/lib/constants/projectcolum.constants.tsx
import { TableColumn } from '@/components/shared/DataTable/DataTable'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Project, ProjectStatus, ProjectType } from '@/lib/types/project'
import { formatDate } from '@/lib/utils/format'

export const projectColumns: TableColumn<Project>[] = [
  {
    id: 'projName',
    header: 'Project Name',
    accessorKey: 'projName',
    sortable: true,
    cell: row => (
      <div>
        <div className='font-semibold'>{row.projName}</div>
        <div className='text-sm text-gray-500'>{row.projCode}</div>
      </div>
    ),
    width: '200'
  },
  {
    id: 'location',
    header: 'Location',
    cell: row => (
      <div>
        <div className='font-medium'>{row.projLocation}</div>
        <div className='text-sm text-gray-500'>
          {row.cityName ||
            (typeof row.cityId === 'string'
              ? row.cityId
              : row.cityId?.cityName)}
        </div>
      </div>
    ),
    width: '180'
  },
  {
    id: 'projStatus',
    header: 'Status',
    cell: row => {
      const statusColors = {
        [ProjectStatus.PLANNING]: 'bg-blue-100 text-blue-800',
        [ProjectStatus.UNDER_DEVELOPMENT]: 'bg-orange-100 text-orange-800',
        [ProjectStatus.COMPLETED]: 'bg-green-100 text-green-800',
        [ProjectStatus.ON_HOLD]: 'bg-yellow-100 text-yellow-800',
        [ProjectStatus.CANCELLED]: 'bg-red-100 text-red-800'
      }

      const statusLabels = {
        [ProjectStatus.PLANNING]: 'Planning',
        [ProjectStatus.UNDER_DEVELOPMENT]: 'Under Dev',
        [ProjectStatus.COMPLETED]: 'Completed',
        [ProjectStatus.ON_HOLD]: 'On Hold',
        [ProjectStatus.CANCELLED]: 'Cancelled'
      }

      return (
        <Badge
          className={`${
            statusColors[row.projStatus] || 'bg-gray-100 text-gray-800'
          }`}
        >
          {statusLabels[row.projStatus]}
        </Badge>
      )
    },
    sortable: true,
    width: '120'
  },
  {
    id: 'progress',
    header: 'Progress',
    cell: row => {
      const progress = row.progressPercentage || 0
      const plotsText = `${row.plotsSold + row.plotsReserved}/${
        row.totalPlots
      } plots`

      return (
        <div className='space-y-2'>
          <div className='flex justify-between text-sm'>
            <span>{progress}%</span>
            <span className='text-gray-500'>{plotsText}</span>
          </div>
          <Progress value={progress} className='h-2' />
        </div>
      )
    },
    width: '180'
  },
  {
    id: 'totalArea',
    header: 'Area',
    cell: row => (
      <div className='font-medium'>
        {row.formattedArea ||
          `${(row.totalArea ?? 0).toLocaleString()} ${row.areaUnit}`}
      </div>
    ),
    width: '120'
  },
  {
    id: 'projType',
    header: 'Type',
    cell: row => {
      const typeLabels = {
        [ProjectType.RESIDENTIAL]: 'Residential',
        [ProjectType.COMMERCIAL]: 'Commercial',
        [ProjectType.INDUSTRIAL]: 'Industrial',
        [ProjectType.MIXED_USE]: 'Mixed Use',
        [ProjectType.AGRICULTURAL]: 'Agricultural'
      }

      return <Badge variant='outline'>{typeLabels[row.projType]}</Badge>
    },
    width: '120'
  },
  {
    id: 'launchDate',
    header: 'Launch Date',
    accessorKey: 'launchDate',
    cell: row => formatDate(row.launchDate),
    sortable: true,
    width: '120'
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
  }
]
