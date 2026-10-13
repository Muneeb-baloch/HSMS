// src/app/(dashboard)/paymentmodes/page.tsx
'use client'

import { ActionBar } from '@/components/shared/PageTemplate'
import { SummaryCard } from '@/components/shared/SummaryCard'
import { EnhancedDataTable as DataTable } from '@/components/shared/DataTable/DataTable'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { paymentModeColumns } from '@/lib/constants/paymentModeColumns.constants'
import { hasPermission, UserRole as UserRoleEnum } from '@/lib/constants/roles'
import {
  useDeletePaymentMode,
  usePaymentModes,
  useTogglePaymentModeStatus
} from '@/lib/hooks/entities/usePaymentMode'
import { useAuth } from '@/lib/hooks/useAuth'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { setFilters } from '@/lib/store/slices/paymentModeSlice'
import {
  BarChart3,
  CreditCard,
  Download,
  Filter,
  Plus,
  RefreshCw,
  Upload,
  Wallet
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useConfirm } from "@/components/shared/ConfirmDialog";

export default function PaymentModesPage () {
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const router = useRouter()

  const filters = useAppSelector(state => state.paymentModes?.filters || {})
  const [searchValue, setSearchValue] = useState('')
  const { confirm, alert } = useConfirm();
  const [selectedRows, setSelectedRows] = useState<string[]>([])

  const { data, isLoading, refetch } = usePaymentModes(filters)
  const deleteMutation = useDeletePaymentMode()
  const toggleStatusMutation = useTogglePaymentModeStatus()

  const canCreate =
    user &&
    hasPermission(
      user.role as UserRoleEnum,
      [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN] as UserRoleEnum[]
    )

  const canUpdate =
    user &&
    hasPermission(
      user.role as UserRoleEnum,
      [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN] as UserRoleEnum[]
    )

  const canDelete =
    user &&
    hasPermission(
      user.role as UserRoleEnum,
      [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN] as UserRoleEnum[]
    )

  useEffect(() => {
    refetch()
  }, [filters, refetch])

  const handleCreate = () => {
    router.push('/paymentmodes/create')
  }

  const handleEdit = (id: string) => {
    router.push(`/paymentmodes/edit/${id}`)
  }

  const handleView = (id: string) => {
    router.push(`/paymentmodes/view/${id}`)
  }

  const handleDelete = async (id: string) => {
    if (
      canDelete &&
      await confirm({ title: "Delete", description: 'Are you sure you want to delete this payment mode?', variant: "destructive" })
    ) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const handleToggleStatus = async (id: string) => {
    if (
      canUpdate &&
      await confirm({ title: "Confirm", description: 'Are you sure you want to toggle the status of this payment mode?' })
    ) {
      await toggleStatusMutation.mutateAsync(id)
    }
  }

  const handleSearch = (search: string) => {
    setSearchValue(search)
    dispatch(
      setFilters({
        search,
        page: 1
      })
    )
  }

  const handleFilterChange = (newFilters: Record<string, unknown>) => {
    dispatch(setFilters({ ...newFilters, page: 1 }))
  }

  const handleActiveFilter = (isActive: string) => {
    if (isActive === 'true') {
      dispatch(setFilters({ isActive: true, page: 1 }))
    } else if (isActive === 'false') {
      dispatch(setFilters({ isActive: false, page: 1 }))
    } else {
      const { isActive: _, ...rest } = filters
      dispatch(setFilters({ ...rest, page: 1 }))
    }
  }

  const handlePageChange = (page: number) => {
    dispatch(setFilters({ page }))
  }

  const handleResetFilters = () => {
    dispatch(
      setFilters({
        page: 1,
        limit: 20,
        search: '',
        sortBy: 'createdAt',
        sortOrder: 'desc'
      })
    )
    setSearchValue('')
    setSelectedRows([])
  }

  const handleRowSelection = (rows: any[]) => {
    setSelectedRows(rows.map(row => row._id))
  }

  const handleImport = () => {
    router.push('/paymentmodes/import')
  }

  const handleExport = async () => {
    // Implement export functionality
    await alert({ description: 'Export functionality coming soon' })
  }

  const getPaymentModeIcon = (modeName: string) => {
    switch (modeName.toLowerCase()) {
      case 'cash':
        return <Wallet className='h-4 w-4' />
      case 'bank transfer':
        return <CreditCard className='h-4 w-4' />
      case 'check':
        return <CreditCard className='h-4 w-4' />
      case 'p/0':
        return <CreditCard className='h-4 w-4' />
      default:
        return <Wallet className='h-4 w-4' />
    }
  }

  const tableConfig = {
    columns: paymentModeColumns,
    filters: [
      {
        id: 'isActive',
        label: 'Status',
        type: 'select' as const,
        options: [
          { label: 'Active Only', value: 'true' },
          { label: 'Inactive Only', value: 'false' }
        ],
        onChange: handleActiveFilter
      },
      {
        id: 'sortBy',
        label: 'Sort By',
        type: 'select' as const,
        options: [
          { label: 'Created Date', value: 'createdAt' },
          { label: 'Payment Mode', value: 'paymentModeName' },
          { label: 'Last Modified', value: 'modifiedOn' }
        ],
        onChange: (value: string) =>
          dispatch(setFilters({ sortBy: value, page: 1 }))
      },
      {
        id: 'sortOrder',
        label: 'Order',
        type: 'select' as const,
        options: [
          { label: 'Descending', value: 'desc' },
          { label: 'Ascending', value: 'asc' }
        ],
        onChange: (value: 'asc' | 'desc') =>
          dispatch(setFilters({ sortOrder: value, page: 1 }))
      }
    ],
    enableActions: true,
    enableSelection: !!canUpdate,
    onRowSelection: handleRowSelection,
    actions: {
      onEdit: canUpdate ? handleEdit : undefined,
      onDelete: canDelete ? handleDelete : undefined,
      customActions: [
        {
          label: 'View Details',
          icon: <span>👁️</span>,
          onClick: (row: any) => handleView(row._id),
          variant: 'outline' as const
        },
        {
          label: 'Toggle Status',
          icon: <span>🔄</span>,
          onClick: (row: any) => handleToggleStatus(row._id),
          variant: 'outline' as const
        }
      ]
    },
    pagination: data?.pagination
      ? {
          currentPage: data.pagination.page,
          totalPages: data.pagination.pages,
          onPageChange: handlePageChange,
          pageSize: data.pagination.limit,
          onPageSizeChange: (size: number) =>
            dispatch(setFilters({ limit: size, page: 1 })),
          totalItems: data.pagination.total
        }
      : undefined,
    responsive: {
      showMobileView: true,
      stickyHeader: true
    }
  }

  // Get payment mode summary from data or use default
  const summary = {
    total: data?.paymentModes?.length || 0,
    active:
      data?.paymentModes?.filter((mode: any) => mode.isActive).length || 0,
    inactive:
      data?.paymentModes?.filter((mode: any) => !mode.isActive).length || 0
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-foreground'>Payment Modes</h1>
        <p className='mt-1 text-muted-foreground'>
          Manage payment methods and transaction types
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <SummaryCard
          title='Total Modes'
          value={summary.total}
          icon={Wallet}
          iconBgClassName='bg-blue-500/20'
          iconClassName='text-blue-400'
          gradient='from-blue-500/10 to-transparent'
        />
        <SummaryCard
          title='Active'
          value={summary.active}
          icon={CreditCard}
          iconBgClassName='bg-emerald-500/20'
          iconClassName='text-emerald-400'
          gradient='from-emerald-500/10 to-transparent'
        />
        <SummaryCard
          title='Inactive'
          value={summary.inactive}
          icon={Filter}
          iconBgClassName='bg-rose-500/20'
          iconClassName='text-rose-400'
          gradient='from-rose-500/10 to-transparent'
        />
      </div>

      <ActionBar
        left={
          <>
            {Object.keys(filters).length > 2 && (
              <Button variant='glass' size='sm' onClick={handleResetFilters}>
                <RefreshCw className='size-4' />
                Reset Filters
              </Button>
            )}
            <Button
              variant='glass'
              size='sm'
              onClick={() => router.push('/paymentmodes/summary')}
            >
              <BarChart3 className='size-4' />
              Summary
            </Button>
            <Button
              variant='glass'
              size='sm'
              onClick={() => router.push('/paymentmodes/analysis')}
            >
              <Filter className='size-4' />
              Analysis
            </Button>
            {selectedRows.length > 0 && (
              <span className='text-xs text-muted-foreground self-center'>
                {selectedRows.length} selected
              </span>
            )}
            <Button variant='glass' size='sm' onClick={handleImport}>
              <Upload className='size-4' />
              Import
            </Button>
            <Button variant='glass' size='sm' onClick={handleExport}>
              <Download className='size-4' />
              Export
            </Button>
          </>
        }
        right={
          canCreate && (
            <Button variant='primary' size='sm' onClick={handleCreate}>
              <Plus className='size-4' />
              Add Payment Mode
            </Button>
          )
        }
      />

      {/* Payment Mode Distribution */}
        {data?.paymentModes && data.paymentModes.length > 0 && (
          <div className='mb-6'>
            <h3 className='text-lg font-medium mb-3'>
              Payment Mode Distribution
            </h3>
            <div className='flex flex-wrap gap-2'>
              {data.paymentModes.slice(0, 8).map((mode: any) => (
                <Badge
                  key={mode._id}
                  variant='outline'
                  className='flex items-center gap-1 px-3 py-1.5'
                >
                  {getPaymentModeIcon(mode.paymentModeName)}
                  <span className='ml-1'>{mode.paymentModeName}</span>
                  <span className='ml-2 text-xs bg-gray-100 px-1.5 py-0.5 rounded'>
                    {mode.isActive ? 'Active' : 'Inactive'}
                  </span>
                </Badge>
              ))}
              {data.paymentModes.length > 8 && (
                <Badge variant='outline' className='px-3 py-1.5'>
                  +{data.paymentModes.length - 8} more
                </Badge>
              )}
            </div>
          </div>
        )}

      <DataTable
        data={data?.paymentModes || []}
        config={tableConfig}
        isLoading={isLoading}
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
      />
    </div>
  )
}
