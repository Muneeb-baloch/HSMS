'use client'

import { ActionBar } from '@/components/shared/PageTemplate'
import { SummaryCard } from '@/components/shared/SummaryCard'
import {
  EnhancedDataTable as DataTable,
  TableColumn
} from '@/components/shared/DataTable/DataTable'
import { Button } from '@/components/ui/button'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import {
  useDeleteTransfer,
  useTransfers
} from '@/lib/hooks/entities/useTransfer'
import { useAuth } from '@/lib/hooks/useAuth'
import { Transfer } from '@/lib/types/transfer.types'
import { ArrowLeftRight, Plus, RefreshCw, Wallet } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useConfirm } from "@/components/shared/ConfirmDialog";

const transferColumns: TableColumn<Transfer>[] = [
  {
    id: 'file',
    header: 'File No',
    cell: row =>
      row.file?.fileRegNo ?? (typeof row.fileId === 'object' ? row.fileId?.fileRegNo : null) ?? 'N/A',
    width: '120'
  },
  {
    id: 'transferType',
    header: 'Type',
    cell: row =>
      row.transferType?.typeName ?? (typeof row.transferTypeId === 'object' ? row.transferTypeId?.typeName : null) ?? 'N/A',
    width: '150'
  },
  {
    id: 'seller',
    header: 'Seller',
    cell: row =>
      row.seller?.memName ?? (typeof row.sellerMemId === 'object' ? row.sellerMemId?.memName : null) ?? 'N/A',
    width: '150'
  },
  {
    id: 'buyer',
    header: 'Buyer',
    cell: row =>
      row.buyer?.memName ?? (typeof row.buyerMemId === 'object' ? row.buyerMemId?.memName : null) ?? 'N/A',
    width: '150'
  },
  {
    id: 'transferInitDate',
    header: 'Initiated',
    accessorKey: 'transferInitDate',
    cell: row => new Date(row.transferInitDate).toLocaleDateString(),
    sortable: true,
    width: '120'
  },
  {
    id: 'transferFeeAmount',
    header: 'Fee',
    accessorKey: 'transferFeeAmount',
    cell: row =>
      row.transferFeeAmount
        ? `Rs. ${row.transferFeeAmount.toLocaleString()}`
        : 'N/A',
    width: '100'
  },
  {
    id: 'transferFeePaid',
    header: 'Fee Paid',
    accessorKey: 'transferFeePaid',
    cell: row => (
      <span
        className={`px-2 py-1 rounded text-xs ${
          row.transferFeePaid
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}
      >
        {row.transferFeePaid ? 'Yes' : 'No'}
      </span>
    ),
    width: '100'
  },
  {
    id: 'status',
    header: 'Status',
    accessorKey: 'status',
    cell: row => {
      const colors: Record<string, string> = {
        Pending: 'bg-yellow-100 text-yellow-800',
        'Under Review': 'bg-blue-100 text-blue-800',
        Approved: 'bg-purple-100 text-purple-800',
        Rejected: 'bg-red-100 text-red-800',
        Completed: 'bg-green-100 text-green-800',
        Cancelled: 'bg-gray-100 text-gray-800',
        'On Hold': 'bg-orange-100 text-orange-800',
        'Documents Required': 'bg-pink-100 text-pink-800',
        'Fee Pending': 'bg-indigo-100 text-indigo-800'
      }
      return (
        <span
          className={`px-2 py-1 rounded text-xs ${
            colors[row.status] || 'bg-gray-100'
          }`}
        >
          {row.status}
        </span>
      )
    },
    width: '140'
  },
  {
    id: 'transfIsAtt',
    header: 'Docs Attached',
    accessorKey: 'transfIsAtt',
    cell: row => (
      <span
        className={`px-2 py-1 rounded text-xs ${
          row.transfIsAtt
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}
      >
        {row.transfIsAtt ? 'Yes' : 'No'}
      </span>
    ),
    width: '120'
  },
  {
    id: 'createdAt',
    header: 'Created',
    accessorKey: 'createdAt',
    cell: row => new Date(row.createdAt).toLocaleDateString(),
    sortable: true,
    width: '120'
  }
]

export default function TransfersPage () {
  const router = useRouter()
  const { user } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { confirm } = useConfirm();

  const { data, isLoading } = useTransfers({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  const deleteMutation = useDeleteTransfer()

  const canCreate =
    user &&
    hasPermission(
      user.role as UserRole,
      [UserRole.ADMIN, UserRole.SUPER_ADMIN] as UserRole[]
    )

  const canUpdate =
    user &&
    hasPermission(
      user.role as UserRole,
      [UserRole.ADMIN, UserRole.SUPER_ADMIN] as UserRole[]
    )

  const canDelete =
    user &&
    hasPermission(
      user.role as UserRole,
      [UserRole.ADMIN, UserRole.SUPER_ADMIN] as UserRole[]
    )

  const handleCreate = () => {
    router.push('/transfers/create')
  }

  const handleEdit = (id: string) => {
    router.push(`/transfers/edit/${id}`)
  }

  const handleView = (id: string) => {
    router.push(`/transfers/view/${id}`)
  }

  const handleDelete = async (id: string) => {
    if (
      canDelete &&
      await confirm({ title: "Delete", description: 'Are you sure you want to delete this transfer?', variant: "destructive" })
    ) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const tableConfig = {
    columns: transferColumns,
    enableActions: true,
    actions: {
      onEdit: canUpdate ? handleEdit : undefined,
      onDelete: canDelete ? handleDelete : undefined,
      customActions: [
        {
          label: 'View',
          actionType: 'view',
          onClick: (row: Transfer) => handleView(row._id),
          variant: 'outline' as const
        }
      ]
    },
    pagination: data?.pagination
      ? {
          currentPage: data.pagination.page,
          totalPages: data.pagination.pages,
          onPageChange: (_page: number) => {
            // TODO: implement page change
          },
          pageSize: data.pagination.limit,
          onPageSizeChange: (_size: number) => {
            // TODO: implement page size change
          },
          totalItems: data.pagination.total
        }
      : undefined
  }

  const total = data?.pagination?.total ?? data?.items?.length ?? 0
  const pending =
    data?.items?.filter((t: Transfer) => t.status === 'Pending').length ?? 0
  const completed =
    data?.items?.filter((t: Transfer) => t.status === 'Completed').length ?? 0

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-foreground'>SR Transfers</h1>
        <p className='mt-1 text-muted-foreground'>
          Manage property transfers between members
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <SummaryCard
          title='Total Transfers'
          value={total}
          icon={ArrowLeftRight}
          iconBgClassName='bg-blue-500/20'
          iconClassName='text-blue-400'
          gradient='from-blue-500/10 to-transparent'
        />
        <SummaryCard
          title='Pending'
          value={pending}
          icon={RefreshCw}
          iconBgClassName='bg-amber-500/20'
          iconClassName='text-amber-400'
          gradient='from-amber-500/10 to-transparent'
        />
        <SummaryCard
          title='Completed'
          value={completed}
          icon={Wallet}
          iconBgClassName='bg-emerald-500/20'
          iconClassName='text-emerald-400'
          gradient='from-emerald-500/10 to-transparent'
        />
      </div>

      <ActionBar
        right={
          canCreate && (
            <Button
              variant='default'
              size='sm'
              onClick={handleCreate}
              className='bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white border-0 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all duration-200'
            >
              <Plus className='size-4' />
              Create Transfer
            </Button>
          )
        }
      />

      <DataTable
        data={data?.items || []}
        config={tableConfig}
        isLoading={isLoading}
      />
    </div>
  )
}
