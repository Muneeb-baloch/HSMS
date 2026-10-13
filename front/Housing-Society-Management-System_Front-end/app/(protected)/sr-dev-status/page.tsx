// src/app/(dashboard)/sr-dev-status/page.tsx
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
import {
  DEV_CATEGORY_COLORS,
  DEV_CATEGORY_LABELS,
  DEV_PHASE_COLORS,
  DEV_PHASE_LABELS
} from '@/lib/constants/srDevStatus.constants'
import { srDevStatusColumns } from '@/lib/constants/srDevStatusColumns.constants'
import {
  useBulkUpdateStatuses,
  useDeleteSrDevStatus,
  useSrDevStatuses,
  useToggleStatusActive
} from '@/lib/hooks/entities/useSrDevStatus'
import { useAuth } from '@/lib/hooks/useAuth'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { setFilters } from '@/lib/store/slices/srDevStatusSlice'
import { DevCategory, DevPhase } from '@/lib/types/srdevstatus'
import {
  BarChart3,
  Filter,
  Plus,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  TrendingUp
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useConfirm } from "@/components/shared/ConfirmDialog";

export default function SrDevStatusPage () {
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const router = useRouter()

  const filters = useAppSelector(state => state.srDevStatus?.filters || {})
  const [searchValue, setSearchValue] = useState('')
  const { confirm } = useConfirm();
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [phaseFilter, setPhaseFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [docsFilter, setDocsFilter] = useState<string>('')

  const { data, isLoading, refetch } = useSrDevStatuses(filters)
  const deleteMutation = useDeleteSrDevStatus()
  const toggleStatusMutation = useToggleStatusActive()
  const bulkUpdateMutation = useBulkUpdateStatuses()

  interface SrDevStatusResponse {
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
      byCategory: Record<DevCategory, number>
      byPhase: Record<DevPhase, number>
      averagePercentage: number
    }
  }

  const typedData = data as SrDevStatusResponse | undefined

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
    router.push('/sr-dev-status/create')
  }

  const handleEdit = (id: string) => {
    router.push(`/sr-dev-status/edit/${id}`)
  }

  const handleView = (id: string) => {
    router.push(`/sr-dev-status/view/${id}`)
  }

  const handleDelete = async (id: string) => {
    if (canDelete && await confirm({ title: "Delete", description: 'Are you sure you want to delete this status?', variant: "destructive" })) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const handleToggleStatus = async (id: string) => {
    if (canUpdate) {
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

  const handleCategoryFilter = (category: string) => {
    setCategoryFilter(category)
    if (category) {
      dispatch(
        setFilters({
          devCategory: [category as DevCategory],
          page: 1
        })
      )
    } else {
      const { devCategory: _, ...rest } = filters
      dispatch(setFilters({ ...rest, page: 1 }))
    }
  }

  const handlePhaseFilter = (phase: string) => {
    setPhaseFilter(phase)
    if (phase) {
      dispatch(
        setFilters({
          devPhase: [phase as DevPhase],
          page: 1
        })
      )
    } else {
      const { devPhase: _, ...rest } = filters
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

  const handleDocsFilter = (requiresDocumentation: string) => {
    setDocsFilter(requiresDocumentation)
    if (requiresDocumentation === 'true') {
      dispatch(setFilters({ requiresDocumentation: true, page: 1 }))
    } else if (requiresDocumentation === 'false') {
      dispatch(setFilters({ requiresDocumentation: false, page: 1 }))
    } else {
      const { requiresDocumentation: _, ...rest } = filters
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
        sortBy: 'srDevStatName',
        sortOrder: 'asc'
      })
    )
    setSearchValue('')
    setCategoryFilter('')
    setPhaseFilter('')
    setStatusFilter('')
    setDocsFilter('')
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
    columns: srDevStatusColumns,
    filters: [],
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
          label: 'Next Statuses',
          icon: <TrendingUp className='h-4 w-4' />,
          onClick: (row: any) =>
            router.push(`/sr-dev-status/${row._id}/workflow`),
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
        <h1 className='text-2xl font-bold text-foreground'>
          Development Statuses
        </h1>
        <p className='mt-1 text-muted-foreground'>
          Manage development phases and progress tracking
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
        </div>
      )}

      <ActionBar
        left={
          <>
            {(Object.keys(filters).length > 2) && (
              <Button variant='glass' size='sm' onClick={handleResetFilters}>
                <RefreshCw className='size-4' />
                Reset Filters
              </Button>
            )}
            <Button
              variant='glass'
              size='sm'
              onClick={() => router.push('/sr-dev-status/statistics')}
            >
              <BarChart3 className='size-4' />
              Statistics
            </Button>
            <Button
              variant='glass'
              size='sm'
              onClick={() => router.push('/sr-dev-status/workflow')}
            >
              <TrendingUp className='size-4' />
              Workflow
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

      <DataTable
          data={typedData?.items || []}
          config={tableConfig}
          isLoading={isLoading}
          onSearch={handleSearch}
        />
    </div>
  )
}
