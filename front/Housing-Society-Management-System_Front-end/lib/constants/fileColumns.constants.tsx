// src/lib/constants/fileColumns.constants.tsx
import { TableColumn } from '@/components/shared/DataTable/DataTable'
import { Badge } from '@/components/ui/badge'
import { File } from '@/lib/types/file'
import { formatCurrency, formatDate } from '@/lib/utils/format'

export const fileColumns: TableColumn<File>[] = [
  {
    id: 'fileRegNo',
    header: 'File No',
    accessorKey: 'fileRegNo',
    sortable: true,
    cell: row => (
      <div>
        <div className='font-semibold'>{row.fileRegNo}</div>
        {row.fileBarCode && (
          <div className='text-xs text-gray-500'>
            Barcode: {row.fileBarCode}
          </div>
        )}
      </div>
    ),
    width: '150'
  },
  {
    id: 'member',
    header: 'Member',
    cell: row => {
      const member =
        row.member || (typeof row.memId === 'object' ? row.memId : null)
      return (
        <div>
          <div className='font-medium'>{member?.memName || 'Unknown'}</div>
          {member?.memNic && (
            <div className='text-sm text-gray-500'>NIC: {member.memNic}</div>
          )}
        </div>
      )
    },
    width: '180'
  },
  {
    id: 'plan',
    header: 'Installment Plan',
    cell: row => {
      const plan =
        row.plan || (typeof row.planId === 'object' ? row.planId : null)
      return (
        <div>
          <div className='font-medium'>
            {plan?.planName || 'N/A'}
          </div>
          {plan && (
            <div className='text-sm text-gray-500'>
              {plan.totalMonths} mo · {plan.totalAmount?.toLocaleString?.() ?? plan.totalAmount} PKR
            </div>
          )}
        </div>
      )
    },
    width: '160'
  },
  {
    id: 'project',
    header: 'Project',
    cell: row => {
      const plot =
        row.plot || (typeof row.plotId === 'object' ? row.plotId : null)
      const project =
        plot?.projectId ||
        row.project ||
        (typeof row.projId === 'object' ? row.projId : null)
      return (
        <div>
          <div className='font-medium'>
            {project?.projName || project?.projectName || 'Unknown'}
          </div>
          {(project?.projCode || project?.projectCode) && (
            <div className='text-sm text-gray-500'>
              Code: {project.projCode || project.projectCode}
            </div>
          )}
        </div>
      )
    },
    width: '150'
  },
  {
    id: 'plot',
    header: 'Plot',
    cell: row => {
      const plot =
        row.plot || (typeof row.plotId === 'object' ? row.plotId : null)
      return plot ? (
        <div>
          <div className='font-medium'>Plot #{plot.plotNo}</div>
          {plot.plotBlockId?.plotBlockName && (
            <div className='text-sm text-gray-500'>
              Block: {plot.plotBlockId.plotBlockName}
            </div>
          )}
          {plot.plotSizeId?.plotSizeName && (
            <div className='text-sm text-gray-500'>
              Size: {plot.plotSizeId.plotSizeName}
            </div>
          )}
        </div>
      ) : (
        <span className='text-gray-400'>-</span>
      )
    },
    width: '120'
  },
  {
    id: 'amounts',
    header: 'Amounts',
    cell: row => (
      <div>
        <div className='font-medium'>{formatCurrency(row.totalAmount)}</div>
        <div className='text-sm text-gray-500'>
          Down: {formatCurrency(row.downPayment)}
        </div>
        {row.balanceAmount !== undefined && (
          <div className='text-sm text-gray-500'>
            Balance: {formatCurrency(row.balanceAmount)}
          </div>
        )}
      </div>
    ),
    width: '140'
  },
  {
    id: 'paymentMode',
    header: 'Payment Mode',
    accessorKey: 'paymentMode',
    cell: row => <div className='text-sm'>{row.paymentMode}</div>,
    width: '100'
  },
  {
    id: 'bookingDate',
    header: 'Booking Date',
    accessorKey: 'bookingDate',
    sortable: true,
    cell: row => (
      <div className='font-medium'>{formatDate(row.bookingDate)}</div>
    ),
    width: '120'
  },
  {
    id: 'status',
    header: 'Status',
    cell: row => {
      const getStatusColor = (status: string, isActive: boolean) => {
        if (!isActive) return 'bg-gray-100 text-gray-800'
        switch (status) {
          case 'Active':
            return 'bg-green-100 text-green-800'
          case 'Pending':
            return 'bg-yellow-100 text-yellow-800'
          case 'Cancelled':
            return 'bg-red-100 text-red-800'
          case 'Closed':
            return 'bg-blue-100 text-blue-800'
          case 'Transferred':
            return 'bg-purple-100 text-purple-800'
          default:
            return 'bg-gray-100 text-gray-800'
        }
      }

      return (
        <Badge className={getStatusColor(row.status, row.isActive)}>
          {row.status}
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
  }
]
