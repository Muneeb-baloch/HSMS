// src/lib/constants/plotcolum.constants.tsx
import { TableColumn } from '@/components/shared/DataTable/DataTable'
import { Plot, PlotType } from '@/lib/types/plot'
import { formatDate } from '@/lib/utils/format'

const getPlotTypeColor = (type: PlotType | string) => {
  if (!type) return 'bg-gray-100 text-gray-800'

  const colors = {
    [PlotType.RESIDENTIAL]: 'bg-blue-100 text-blue-800',
    [PlotType.COMMERCIAL]: 'bg-purple-100 text-purple-800',
    [PlotType.INDUSTRIAL]: 'bg-gray-100 text-gray-800',
    [PlotType.AGRICULTURAL]: 'bg-green-100 text-green-800',
    [PlotType.CORNER]: 'bg-yellow-100 text-yellow-800',
    [PlotType.PARK_FACING]: 'bg-teal-100 text-teal-800',
    [PlotType.MAIN_BOULEVARD]: 'bg-pink-100 text-pink-800',
    [PlotType.STANDARD]: 'bg-indigo-100 text-indigo-800'
  }
  return colors[type as PlotType] || 'bg-gray-100 text-gray-800'
}

const getStatusColor = (status: any) => {
  if (!status) return 'bg-gray-100 text-gray-800'
  if (typeof status === 'object' && status.colorCode) {
    return `bg-${status.colorCode}-100 text-${status.colorCode}-800`
  }
  return 'bg-gray-100 text-gray-800'
}

export const plotColumns: TableColumn<Plot>[] = [
  {
    id: 'plotNo',
    header: 'Plot No.',
    accessorKey: 'plotNo',
    sortable: true,
    width: '120',
    cell: row => row.plotNo || 'N/A'
  },
  {
    id: 'plotRegistrationNo',
    header: 'Reg. No.',
    cell: row => row.plotRegistrationNo || 'N/A',
    width: '150'
  },
  {
    id: 'project',
    header: 'Project',
    cell: row => {
      if (!row.projectId) return 'N/A'

      if (typeof row.projectId === 'object') {
        return (
          <div>
            <div className='font-medium'>{row.projectId.projName || 'N/A'}</div>
            {row.projectId.projCode && (
              <div className='text-sm text-gray-500'>
                {row.projectId.projCode}
              </div>
            )}
          </div>
        )
      }
      return 'N/A'
    },
    width: '180',
    hideOnMobile: true
  },
  {
    id: 'block',
    header: 'Block',
    cell: row => {
      if (!row.plotBlockId) return 'N/A'

      if (typeof row.plotBlockId === 'object') {
        return row.plotBlockId.plotBlockName || 'N/A'
      }
      return 'N/A'
    },
    width: '120'
  },
  {
    id: 'size',
    header: 'Size',
    cell: row => {
      if (!row.plotSizeId) return 'N/A'

      if (typeof row.plotSizeId === 'object') {
        // Calculate dimensions from length and width if available
        const dimensions = row.plotLength && row.plotWidth
          ? `${row.plotLength}×${row.plotWidth}`
          : row.plotDimensions || 'N/A'

        return (
          <div>
            <div className='font-medium'>
              {row.plotSizeId.totalArea || 0}{' '}
              {row.plotSizeId.areaUnit || 'sqft'}
            </div>
            <div className='text-sm text-gray-500'>
              {dimensions}
            </div>
          </div>
        )
      }
      return `${row.plotArea || 0} ${row.plotAreaUnit || 'sqft'}`
    },
    width: '140'
  },
  {
    id: 'type',
    header: 'Type',
    cell: row => {
      // Fix: Add defensive check for plotType
      const plotType = row.plotType

      if (!plotType) {
        return (
          <span className='px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800'>
            N/A
          </span>
        )
      }

      // Convert to string if it's not already
      const plotTypeStr =
        typeof plotType === 'string' ? plotType : String(plotType)

      // Format the display text
      let displayText = plotTypeStr
      try {
        displayText =
          plotTypeStr.charAt(0).toUpperCase() +
          plotTypeStr.slice(1).replace('_', ' ')
      } catch (error) {
        console.error('Error formatting plot type:', error)
        displayText = plotTypeStr
      }

      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getPlotTypeColor(
            plotTypeStr
          )}`}
        >
          {displayText}
        </span>
      )
    },
    sortable: true,
    width: '130'
  },
  {
    id: 'salesStatus',
    header: 'Status',
    cell: row => {
      if (!row.salesStatusId) return 'N/A'

      if (typeof row.salesStatusId === 'object') {
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
              row.salesStatusId
            )}`}
          >
            {row.salesStatusId.statusName || 'N/A'}
          </span>
        )
      }
      return 'N/A'
    },
    sortable: true,
    width: '140'
  },
  {
    id: 'price',
    header: 'Price',
    cell: row => {
      const totalAmount = row.plotTotalAmount || 0
      const basePrice = row.plotBasePrice || 0
      const surchargeAmount = row.surchargeAmount || 0
      const discountAmount = row.discountAmount || 0

      return (
        <div>
          <div className='font-medium'>
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'PKR',
              minimumFractionDigits: 0
            }).format(totalAmount)}
          </div>
          {discountAmount > 0 && (
            <div className='text-xs text-red-600 line-through'>
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'PKR',
                minimumFractionDigits: 0
              }).format(basePrice + surchargeAmount)}
            </div>
          )}
        </div>
      )
    },
    width: '150',
    hideOnMobile: true
  },
  {
    id: 'customer',
    header: 'Customer',
    cell: row => {
      if (!row.fileId) return row.fileId ? 'Assigned' : 'Available'

      if (typeof row.fileId === 'object') {
        return (
          <div>
            <div className='font-medium'>
              {row.fileId.customerName || 'N/A'}
            </div>
            <div className='text-sm text-gray-500'>
              {row.fileId.fileNumber || 'N/A'}
            </div>
          </div>
        )
      }
      return row.fileId ? 'Assigned' : 'Available'
    },
    width: '180'
  },
  {
    id: 'possessionReady',
    header: 'Possession',
    cell: row => (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.isPossessionReady
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}
      >
        {row.isPossessionReady ? 'Ready' : 'Not Ready'}
      </span>
    ),
    width: '100'
  },
  {
    id: 'createdAt',
    header: 'Created',
    accessorKey: 'createdAt',
    cell: row => (row.createdAt ? formatDate(row.createdAt) : 'N/A'),
    sortable: true,
    width: '120',
    hideOnMobile: true
  }
]
