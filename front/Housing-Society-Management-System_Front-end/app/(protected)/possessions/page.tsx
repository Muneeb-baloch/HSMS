'use client'

import { ActionBar } from '@/components/shared/PageTemplate'
import { SummaryCard } from '@/components/shared/SummaryCard'
import {
  EnhancedDataTable as DataTable,
  TableColumn
} from '@/components/shared/DataTable/DataTable'
import { Button } from '@/components/ui/button'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import { useDeletePossession, usePossessions } from '@/lib/hooks/entities/usePossession'
import { useAuth } from '@/lib/hooks/useAuth'
import { formatDate } from '@/lib/utils/format'
import { Possession, PossessionStatus } from '@/lib/types/possession'
import { BarChart3, ClipboardCheck, Plus, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useConfirm } from '@/components/shared/ConfirmDialog'

const getStatusColor = (status: PossessionStatus) => {
  const colors: Record<string, string> = {
    [PossessionStatus.REQUESTED]: 'bg-blue-100 text-blue-800',
    [PossessionStatus.SURVEYED]: 'bg-orange-100 text-orange-800',
    [PossessionStatus.READY]: 'bg-green-100 text-green-800',
    [PossessionStatus.HANDED_OVER]: 'bg-purple-100 text-purple-800',
    [PossessionStatus.CANCELLED]: 'bg-red-100 text-red-800',
    [PossessionStatus.ON_HOLD]: 'bg-yellow-100 text-yellow-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

const possessionColumns: TableColumn<Possession>[] = [
  {
    id: 'possessionCode',
    header: 'Code',
    accessorKey: 'possessionCode',
    sortable: true,
    width: '150'
  },
  {
    id: 'fileNumber',
    header: 'File No',
    cell: row =>
      typeof row.fileId === 'object' ? row.fileId.fileNumber || 'N/A' : 'N/A',
    width: '130'
  },
  {
    id: 'member',
    header: 'Member',
    cell: row =>
      typeof row.fileId === 'object' ? row.fileId.customerName || 'N/A' : 'N/A',
    width: '160'
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
              <div className='text-sm text-gray-500'>{row.plotId.blockName}</div>
            )}
          </div>
        )
      }
      return 'N/A'
    },
    width: '150'
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
    width: '140'
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
    id: 'possessionHandoverDate',
    header: 'Handover Date',
    cell: row =>
      row.possessionHandoverDate ? formatDate(row.possessionHandoverDate) : 'N/A',
    width: '130'
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

export default function PossessionsPage () {
  const router = useRouter()
  const { user } = useAuth()
  const { confirm } = useConfirm()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)

  const { data, isLoading } = usePossessions({
    page,
    limit,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  const deleteMutation = useDeletePossession()

  const canCreate =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN] as UserRole[])

  const canUpdate =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN] as UserRole[])

  const canDelete =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN] as UserRole[])

  const handleCreate = () => router.push('/possessions/create')
  const handleEdit = (id: string) => router.push(`/possessions/edit/${id}`)
  const handleView = (id: string) => router.push(`/possessions/view/${id}`)

  const handleDelete = async (id: string) => {
    if (
      canDelete &&
      (await confirm({
        title: 'Delete',
        description: 'Are you sure you want to delete this possession request?',
        variant: 'destructive'
      }))
    ) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const summary = data?.summary

  const tableConfig = {
    columns: possessionColumns,
    enableActions: true,
    actions: {
      onEdit: canUpdate ? handleEdit : undefined,
      onDelete: canDelete ? handleDelete : undefined,
      customActions: [
        {
          label: 'View',
          actionType: 'view',
          onClick: (row: Possession) => handleView(row._id),
          variant: 'outline' as const
        }
      ]
    },
    pagination: data?.pagination
      ? {
          currentPage: data.pagination.page,
          totalPages: data.pagination.pages,
          onPageChange: (newPage: number) => setPage(newPage),
          pageSize: data.pagination.limit,
          onPageSizeChange: (size: number) => {
            setLimit(size)
            setPage(1)
          },
          totalItems: data.pagination.total
        }
      : undefined,
    responsive: {
      showMobileView: true,
      stickyHeader: true
    }
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-foreground'>Possessions</h1>
        <p className='mt-1 text-muted-foreground'>
          Manage plot possession requests, surveys and handovers
        </p>
      </div>

      {summary && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <SummaryCard
            title='Total Possessions'
            value={summary.totalPossessions}
            icon={ClipboardCheck}
            iconBgClassName='bg-blue-500/20'
            iconClassName='text-blue-400'
            gradient='from-blue-500/10 to-transparent'
          />
          <SummaryCard
            title='Pending'
            value={summary.pendingCount}
            icon={RefreshCw}
            iconBgClassName='bg-amber-500/20'
            iconClassName='text-amber-400'
            gradient='from-amber-500/10 to-transparent'
          />
          <SummaryCard
            title='Handed Over'
            value={summary.byStatus?.[PossessionStatus.HANDED_OVER] || 0}
            icon={ClipboardCheck}
            iconBgClassName='bg-emerald-500/20'
            iconClassName='text-emerald-400'
            gradient='from-emerald-500/10 to-transparent'
          />
          <SummaryCard
            title='Letters Collected'
            value={summary.collectedCount}
            icon={BarChart3}
            iconBgClassName='bg-purple-500/20'
            iconClassName='text-purple-400'
            gradient='from-purple-500/10 to-transparent'
          />
        </div>
      )}

      <ActionBar
        left={
          <Button
            variant='glass'
            size='sm'
            onClick={() => router.push('/possessions/statistics')}
          >
            <BarChart3 className='size-4' />
            Statistics
          </Button>
        }
        right={
          canCreate && (
            <Button variant='primary' size='sm' onClick={handleCreate}>
              <Plus className='size-4' />
              Request Possession
            </Button>
          )
        }
      />

      <DataTable data={data?.items || []} config={tableConfig} isLoading={isLoading} />
    </div>
  )
}
