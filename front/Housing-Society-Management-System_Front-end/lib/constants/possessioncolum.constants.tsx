// src/lib/constants/possessioncolum.constants.tsx
import { TableColumn } from '@/components/shared/DataTable/DataTable'
import { Possession, PossessionStatus } from '@/lib/types/possession'
import { formatDate } from '@/lib/utils/format'

const getStatusColor = (status: PossessionStatus) => {
  const colors = {
    [PossessionStatus.REQUESTED]: 'bg-blue-100 text-blue-800',
    [PossessionStatus.SURVEYED]: 'bg-orange-100 text-orange-800',
    [PossessionStatus.READY]: 'bg-green-100 text-green-800',
    [PossessionStatus.HANDED_OVER]: 'bg-purple-100 text-purple-800',
    [PossessionStatus.CANCELLED]: 'bg-red-100 text-red-800',
    [PossessionStatus.ON_HOLD]: 'bg-yellow-100 text-yellow-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export const possessionColumns: TableColumn<Possession>[] = [
  {
    id: 'possessionCode',
    header: 'Code',
    accessorKey: 'possessionCode',
    sortable: true,
    width: '150'
  },
  {
    id: 'fileNumber',
    header: 'File',
    cell: row => {
      if (typeof row.fileId === 'object') {
        return (
          <div>
            <div className='font-medium'>{row.fileId.fileNumber}</div>
            {row.fileId.customerName && (
              <div className='text-sm text-gray-500'>
                {row.fileId.customerName}
              </div>
            )}
          </div>
        )
      }
      return 'N/A'
    },
    width: '200'
  },
  {
    id: 'plotNumber',
    header: 'Plot',
    cell: row => {
      if (typeof row.plotId === 'object') {
        return (
          <div>
            <div className='font-medium'>{row.plotId.plotNumber}</div>
            {row.plotId.blockName && (
              <div className='text-sm text-gray-500'>
                {row.plotId.blockName}
                {row.plotId.projName && ` - ${row.plotId.projName}`}
              </div>
            )}
          </div>
        )
      }
      return 'N/A'
    },
    width: '200'
  },
  {
    id: 'possessionStatus',
    header: 'Status',
    cell: row => (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
          row.possessionStatus
        )}`}
      >
        {row.statusDisplayName || row.possessionStatus}
      </span>
    ),
    sortable: true,
    width: '150'
  },
  {
    id: 'possessionInitDate',
    header: 'Application Date',
    accessorKey: 'possessionInitDate',
    cell: row => formatDate(row.possessionInitDate),
    sortable: true,
    width: '140'
  },
  {
    id: 'possessionSurveyDate',
    header: 'Survey Date',
    cell: row =>
      row.possessionSurveyDate ? formatDate(row.possessionSurveyDate) : 'N/A',
    width: '120'
  },
  {
    id: 'possessionHandoverDate',
    header: 'Handover Date',
    cell: row =>
      row.possessionHandoverDate
        ? formatDate(row.possessionHandoverDate)
        : 'N/A',
    width: '120'
  },
  {
    id: 'possessionIsCollected',
    header: 'Collected',
    cell: row => (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.possessionIsCollected
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}
      >
        {row.possessionIsCollected ? 'Yes' : 'No'}
      </span>
    ),
    width: '100'
  },
  {
    id: 'possessionCollectorName',
    header: 'Collector',
    cell: row => row.possessionCollectorName || 'N/A',
    width: '150'
  },
  {
    id: 'possessionHandoverCSR',
    header: 'CSR',
    cell: row => {
      if (typeof row.possessionHandoverCSR === 'object') {
        return `${row.possessionHandoverCSR.firstName} ${row.possessionHandoverCSR.lastName}`
      }
      return 'N/A'
    },
    width: '150'
  },
  {
    id: 'createdAt',
    header: 'Created',
    accessorKey: 'createdAt',
    cell: row => formatDate(row.createdAt),
    sortable: true,
    width: '120',
    hideOnMobile: true
  }
]
