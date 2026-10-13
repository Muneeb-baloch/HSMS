// src/app/(dashboard)/sales-status/page.tsx
'use client'

import { ActionBar } from '@/components/shared/PageTemplate'
import { SummaryCard } from '@/components/shared/SummaryCard'
import { EnhancedDataTable as DataTable } from '@/components/shared/DataTable/DataTable'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import { STATUS_TYPE_LABELS } from '@/lib/constants/salesStatus.constants'
import { salesStatusColumns } from '@/lib/constants/salesStatusColumns.constants'
import {
  useBulkUpdateStatuses,
  useDeleteSalesStatus,
  useSalesStatuses,
  useToggleStatusActive
} from '@/lib/hooks/entities/useSalesStatus'
import { useAuth } from '@/lib/hooks/useAuth'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { setFilters } from '@/lib/store/slices/salesStatusSlice'
import { SalesStatusType } from '@/lib/types/salesStatus'
import {
  BarChart3,
  Filter,
  Plus,
  RefreshCw,
  Settings,
  ToggleLeft,
  ToggleRight
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useConfirm } from "@/components/shared/ConfirmDialog";

export default function SalesStatusPage () {
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const router = useRouter()

  const filters = useAppSelector(state => state.salesStatus?.filters || {})
  const [searchValue, setSearchValue] = useState('')
  const { confirm } = useConfirm();
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [salesFilter, setSalesFilter] = useState<string>('')
  const [approvalFilter, setApprovalFilter] = useState<string>('')

  const { data, isLoading, refetch } = useSalesStatuses(filters)
  const deleteMutation = useDeleteSalesStatus()
  const toggleStatusMutation = useToggleStatusActive()
  const bulkUpdateMutation = useBulkUpdateStatuses()

  interface SalesStatusResponse {
    items: any[]
    pagination: {
      page: number
      pages: number
      limit: number
      total: number
    }
    summary: {
      totalStatuses: number
      activeStatuses: number
      salesAllowedCount: number
      byType: Record<SalesStatusType, number>
    }
  }

  const typedData = data as SalesStatusResponse | undefined

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

  useEffect(() => {
    refetch()
  }, [filters, refetch])

  const handleCreate = () => {
    router.push('/sales-status/create')
  }

  const handleEdit = (id: string) => {
    router.push(`/sales-status/edit/${id}`)
  }

  const handleView = (id: string) => {
    router.push(`/sales-status/view/${id}`)
  }

  const handleDelete = async (id: string) => {
    if (canDelete && await confirm({ title: "Delete", description: 'Are you sure you want to delete this status?', variant: "destructive" })) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const handleToggleStatus = async (id: string) => {
    if (canUpdate && await confirm({ title: "Confirm", description: 'Are you sure you want to toggle the status?' })) {
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

  const handleTypeFilter = (type: string) => {
    setTypeFilter(type)
    if (type) {
      dispatch(
        setFilters({
          statusType: type
            ? ([type as SalesStatusType] as SalesStatusType[])
            : undefined,
          page: 1
        })
      )
    } else {
      const { statusType: _, ...rest } = filters
      dispatch(setFilters({ ...rest, page: 1 }))
    }
  }

  const handleStatusFilter = (isActive: string) => {
    setStatusFilter(isActive)
    if (isActive === 'true') {
      dispatch(setFilters({ isActive: true, page: 1 }))
    } else if (isActive === 'false') {
      dispatch(setFilters({ isActive: false, page: 1 }))
    } else {
      const { isActive: _, ...rest } = filters
      dispatch(setFilters({ ...rest, page: 1 }))
    }
  }

  const handleSalesFilter = (allowsSale: string) => {
    setSalesFilter(allowsSale)
    if (allowsSale === 'true') {
      dispatch(setFilters({ allowsSale: true, page: 1 }))
    } else if (allowsSale === 'false') {
      dispatch(setFilters({ allowsSale: false, page: 1 }))
    } else {
      const { allowsSale: _, ...rest } = filters
      dispatch(setFilters({ ...rest, page: 1 }))
    }
  }

  const handleApprovalFilter = (requiresApproval: string) => {
    setApprovalFilter(requiresApproval)
    if (requiresApproval === 'true') {
      dispatch(setFilters({ requiresApproval: true, page: 1 }))
    } else if (requiresApproval === 'false') {
      dispatch(setFilters({ requiresApproval: false, page: 1 }))
    } else {
      const { requiresApproval: _, ...rest } = filters
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
        limit: 10,
        search: '',
        sortBy: 'sequence',
        sortOrder: 'asc'
      })
    )
    setSearchValue('')
    setTypeFilter('')
    setStatusFilter('')
    setSalesFilter('')
    setApprovalFilter('')
  }

  const handleBulkActivate = async () => {
    const selectedIds: string[] = [] // Get from selection
    if (selectedIds.length > 0 && await confirm({ title: "Activate", description: 'Activate selected statuses?' })) {
      await bulkUpdateMutation.mutateAsync({
        statusIds: selectedIds,
        field: 'isActive',
        value: true
      })
    }
  }

  const handleBulkDeactivate = async () => {
    const selectedIds: string[] = [] // Get from selection
    if (selectedIds.length > 0 && await confirm({ title: "Deactivate", description: 'Deactivate selected statuses?' })) {
      await bulkUpdateMutation.mutateAsync({
        statusIds: selectedIds,
        field: 'isActive',
        value: false
      })
    }
  }

  const tableConfig = {
    columns: salesStatusColumns,
    filters: [
      {
        id: 'statusType',
        label: 'Type',
        type: 'select' as const,
        options: [
          ...Object.values(SalesStatusType).map(type => ({
            label: STATUS_TYPE_LABELS[type],
            value: type
          }))
        ],
        value: typeFilter,
        onChange: handleTypeFilter
      },
      {
        id: 'isActive',
        label: 'Status',
        type: 'select' as const,
        options: [
          { label: 'Active', value: 'true' },
          { label: 'Inactive', value: 'false' }
        ],
        value: statusFilter,
        onChange: handleStatusFilter
      },
      {
        id: 'allowsSale',
        label: 'Sale Allowed',
        type: 'select' as const,
        options: [
          { label: 'Sale Allowed', value: 'true' },
          { label: 'Sale Not Allowed', value: 'false' }
        ],
        value: salesFilter,
        onChange: handleSalesFilter
      },
      {
        id: 'requiresApproval',
        label: 'Approval',
        type: 'select' as const,
        options: [
          { label: 'Approval Required', value: 'true' },
          { label: 'No Approval Required', value: 'false' }
        ],
        value: approvalFilter,
        onChange: handleApprovalFilter
      },
      {
        id: 'sortBy',
        label: 'Sort By',
        type: 'select' as const,
        options: [
          { label: 'Sequence', value: 'sequence' },
          { label: 'Name', value: 'statusName' },
          { label: 'Type', value: 'statusType' },
          { label: 'Created Date', value: 'createdAt' }
        ]
      },
      {
        id: 'sortOrder',
        label: 'Order',
        type: 'select' as const,
        options: [
          { label: 'Ascending', value: 'asc' },
          { label: 'Descending', value: 'desc' }
        ]
      }
    ],
    enableActions: true,
    enableSelection: !!canUpdate,
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
          label: 'Toggle Active',
          icon: <span>🔄</span>,
          onClick: (row: any) => handleToggleStatus(row._id),
          variant: 'outline' as const
        },
        {
          label: 'Workflow',
          icon: <Settings className='h-4 w-4' />,
          onClick: (row: any) =>
            router.push(`/sales-status/${row._id}/workflow`),
          variant: 'outline' as const
        }
      ]
    },
    pagination: typedData?.pagination
      ? {
          currentPage: typedData.pagination.page,
          totalPages: typedData.pagination.pages,
          onPageChange: handlePageChange,
          pageSize: typedData.pagination.limit,
          onPageSizeChange: (size: number) =>
            dispatch(setFilters({ limit: size, page: 1 })),
          totalItems: typedData.pagination.total
        }
      : undefined,
    responsive: {
      showMobileView: true,
      stickyHeader: true
    }
  }

  const summary = typedData?.summary

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-foreground'>Sales Statuses</h1>
        <p className='mt-1 text-muted-foreground'>
          Manage sales statuses and workflow
        </p>
      </div>

      {summary && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <SummaryCard
            title='Total Statuses'
            value={summary.totalStatuses}
            icon={BarChart3}
            iconBgClassName='bg-blue-500/20'
            iconClassName='text-blue-400'
            gradient='from-blue-500/10 to-transparent'
          />
          <SummaryCard
            title='Active'
            value={summary.activeStatuses}
            icon={ToggleRight}
            iconBgClassName='bg-emerald-500/20'
            iconClassName='text-emerald-400'
            gradient='from-emerald-500/10 to-transparent'
          />
          <SummaryCard
            title='Sale Allowed'
            value={summary.salesAllowedCount ?? 0}
            icon={Settings}
            iconBgClassName='bg-amber-500/20'
            iconClassName='text-amber-400'
            gradient='from-amber-500/10 to-transparent'
          />
          <SummaryCard
            title='Types'
            value={Object.keys(summary.byType || {}).length}
            icon={Filter}
            iconBgClassName='bg-purple-500/20'
            iconClassName='text-purple-400'
            gradient='from-purple-500/10 to-transparent'
          />
        </div>
      )}

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
              onClick={() => router.push('/sales-status/statistics')}
            >
              <BarChart3 className='size-4' />
              Statistics
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' size='sm'>
                  <Filter className='h-4 w-4 mr-2' />
                  Bulk Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleBulkActivate}>
                  <ToggleRight className='mr-2 h-4 w-4' />
                  Activate Selected
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleBulkDeactivate}>
                  <ToggleLeft className='mr-2 h-4 w-4' />
                  Deactivate Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
        right={
          canCreate && (
            <Button variant='primary' size='sm' onClick={handleCreate}>
              <Plus className='size-4' />
              Add Status
            </Button>
          )
        }
      />

      {typedData?.summary?.byType && (
        <div className='glass rounded-xl border border-white/5 p-4 backdrop-blur-sm'>
          <h3 className='mb-3 text-sm font-medium text-muted-foreground'>
            Type Distribution
          </h3>
          <div className='grid grid-cols-2 gap-2 md:grid-cols-5'>
            {Object.entries(typedData.summary.byType)
              .filter(([_, count]) => count > 0)
              .map(([type, count]) => (
                <div
                  key={type}
                  className='rounded-lg border border-white/5 bg-white/5 p-3 text-center'
                >
                  <Badge variant='outline' className='mb-2 text-xs capitalize'>
                    {type.replace('_', ' ')}
                  </Badge>
                  <div className='text-lg font-bold'>{count}</div>
                  <div className='text-xs text-muted-foreground'>statuses</div>
                </div>
              ))}
          </div>
        </div>
      )}

      <DataTable
        data={typedData?.items || []}
        config={tableConfig}
        isLoading={isLoading}
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
      />
    </div>
  )
}
