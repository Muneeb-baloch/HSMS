// src/lib/constants/nomineeColumns.constants.tsx
import { TableColumn } from '@/components/shared/DataTable/DataTable'
import { Badge } from '@/components/ui/badge'
import { Nominee, RelationType } from '@/lib/types/nominee'
import { formatDate } from '@/lib/utils/format'

export const nomineeColumns: TableColumn<Nominee>[] = [
  {
    id: 'nomineeName',
    header: 'Nominee',
    accessorKey: 'nomineeName',
    sortable: true,
    cell: row => (
      <div>
        <div className='font-semibold'>{row.nomineeName}</div>
        <div className='text-sm text-gray-500'>{row.nomineeCNIC}</div>
      </div>
    ),
    width: '180'
  },
  {
    id: 'member',
    header: 'Member',
    cell: row => {
      const member = typeof row.memId === 'object' ? row.memId : null

      return (
        <div>
          <div className='font-medium'>{member?.memName || 'Member'}</div>
          {member?.memNic && (
            <div className='text-sm text-gray-500'>CNIC: {member.memNic}</div>
          )}
        </div>
      )
    },
    width: '180'
  },
  {
    id: 'relation',
    header: 'Relation',
    accessorKey: 'relationWithMember',
    sortable: true,
    cell: row => {
      const relationColors = {
        [RelationType.SON]: 'bg-blue-100 text-blue-800',
        [RelationType.DAUGHTER]: 'bg-pink-100 text-pink-800',
        [RelationType.WIFE]: 'bg-red-100 text-red-800',
        [RelationType.HUSBAND]: 'bg-cyan-100 text-cyan-800',
        [RelationType.FATHER]: 'bg-orange-100 text-orange-800',
        [RelationType.MOTHER]: 'bg-green-100 text-green-800',
        [RelationType.BROTHER]: 'bg-gray-100 text-gray-800',
        [RelationType.SISTER]: 'bg-purple-100 text-purple-800',
        [RelationType.UNCLE]: 'bg-yellow-100 text-yellow-800',
        [RelationType.AUNT]: 'bg-indigo-100 text-indigo-800',
        [RelationType.GRANDFATHER]: 'bg-amber-100 text-amber-800',
        [RelationType.GRANDMOTHER]: 'bg-teal-100 text-teal-800',
        [RelationType.OTHER]: 'bg-gray-100 text-gray-800'
      }

      return (
        <Badge
          className={
            relationColors[row.relationWithMember] ||
            'bg-gray-100 text-gray-800'
          }
        >
          {row.relationWithMember}
        </Badge>
      )
    },
    width: '120'
  },
  {
    id: 'contact',
    header: 'Contact',
    cell: row => (
      <div>
        <div>{row.nomineeContact}</div>
        {row.nomineeEmail && (
          <div className='text-sm text-gray-500'>{row.nomineeEmail}</div>
        )}
      </div>
    ),
    width: '150'
  },
  {
    id: 'share',
    header: 'Share',
    cell: row => (
      <div className='text-center'>
        <div
          className={`text-lg font-bold ${
            row.nomineeSharePercentage === 100
              ? 'text-green-600'
              : 'text-blue-600'
          }`}
        >
          {row.nomineeSharePercentage}%
        </div>
        {row.nomineeSharePercentage === 100 && (
          <div className='text-xs text-green-500'>Primary</div>
        )}
      </div>
    ),
    width: '80'
  },
  {
    id: 'status',
    header: 'Status',
    cell: row => (
      <Badge
        className={
          row.isActive
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }
      >
        {row.isActive ? 'Active' : 'Inactive'}
      </Badge>
    ),
    width: '80'
  },
  {
    id: 'createdAt',
    header: 'Created',
    accessorKey: 'createdAt',
    sortable: true,
    cell: row => formatDate(row.createdAt),
    width: '120'
  }
]
