// src/lib/constants/applicationColumns.constants.tsx
import { TableColumn } from '@/components/shared/DataTable/DataTable'
import { Badge } from '@/components/ui/badge'
import { Application } from '@/lib/types/application'
import { formatDate } from '@/lib/utils/format'

export const applicationColumns: TableColumn<Application>[] = [
  {
    id: 'applicationNo',
    header: 'Application No',
    accessorKey: 'applicationNo',
    sortable: true,
    cell: row => (
      <div>
        <div className='font-semibold'>{row.applicationNo}</div>
        {row.remarks && (
          <div className='text-sm text-gray-500 truncate max-w-xs'>
            {row.remarks}
          </div>
        )}
      </div>
    ),
    width: '200'
  },
  {
    id: 'applicationType',
    header: 'Application Type',
    cell: row => {
      const appType =
        typeof row.applicationTypeID === 'object' ? row.applicationTypeID : null
      return (
        <div>
          <div className='font-medium'>
            {appType?.applicationName || 'Unknown'}
          </div>
          {appType?.applicationFee !== undefined && (
            <div className='text-sm text-gray-500'>
              Fee: ${appType.applicationFee.toFixed(2)}
            </div>
          )}
        </div>
      )
    },
    width: '180'
  },
  {
    id: 'member',
    header: 'Member',
    cell: row => {
      const member = typeof row.memId === 'object' ? row.memId : null
      return (
        <div>
          <div className='font-medium'>{member?.memName || 'Unknown'}</div>
          {member?.memNic && (
            <div className='text-sm text-gray-500'>NIC: {member.memNic}</div>
          )}
        </div>
      )
    },
    width: '200'
  },
  {
    id: 'plot',
    header: 'Plot',
    cell: row => {
      const plot = typeof row.plotId === 'object' ? row.plotId : null
      return plot ? (
        <div>
          <div className='font-medium'>Plot #{plot.plotNo}</div>
          {plot.plotRegistrationNo && (
            <div className='text-sm text-gray-500'>
              Reg: {plot.plotRegistrationNo}
            </div>
          )}
        </div>
      ) : (
        <span className='text-gray-400'>-</span>
      )
    },
    width: '150'
  },
  {
    id: 'applicationDate',
    header: 'Application Date',
    accessorKey: 'applicationDate',
    sortable: true,
    cell: row => (
      <div className='font-medium'>{formatDate(row.applicationDate)}</div>
    ),
    width: '120'
  },
  {
    id: 'status',
    header: 'Status',
    cell: row => {
      const status = typeof row.statusId === 'object' ? row.statusId : null
      return (
        <Badge
          className={
            status?.statusType === 'approved'
              ? 'bg-green-100 text-green-800'
              : status?.statusType === 'rejected'
              ? 'bg-red-100 text-red-800'
              : status?.statusType === 'pending'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
          }
        >
          {status?.statusName || 'Unknown'}
        </Badge>
      )
    },
    width: '100'
  },
  {
    id: 'createdBy',
    header: 'Created By',
    cell: row => (
      <div>
        {row.createdBy && (
          <>
            <div className='font-medium'>
              {row.createdBy.firstName} {row.createdBy.lastName}
            </div>
            <div className='text-sm text-gray-500'>
              {formatDate(row.createdAt)}
            </div>
          </>
        )}
      </div>
    ),
    width: '150'
  },
  {
    id: 'attachment',
    header: 'Attachment',
    cell: row =>
      row.attachmentPath ? (
        <a
          href={row.attachmentPath}
          target='_blank'
          rel='noopener noreferrer'
          className='text-blue-600 hover:text-blue-800 underline text-sm'
        >
          View
        </a>
      ) : (
        <span className='text-gray-400'>-</span>
      ),
    width: '80'
  }
]
