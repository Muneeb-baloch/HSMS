// src/app/(dashboard)/projects/page.tsx
'use client'

import { ActionBar } from '@/components/shared/PageTemplate'
import { SummaryCard } from '@/components/shared/SummaryCard'
import {
  EnhancedDataTable as DataTable,
  type TableConfig
} from '@/components/shared/DataTable/DataTable'
import { Button } from '@/components/ui/button'
import { projectColumns } from '@/lib/constants/projectcolum.constants'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import {
  useDeleteProject,
  useProjects,
  useToggleProjectStatus
} from '@/lib/hooks/entities/useProject'
import { useAuth } from '@/lib/hooks/useAuth'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { resetFilters, setFilters } from '@/lib/store/slices/projectSlice'
import { ProjectStatus, ProjectType, type Project } from '@/lib/types/project'
import type { ActionType } from '@/lib/utils/actionColors'
import { ConfirmModal } from '@/components/ui/confirm'
import { BarChart3, MapPin, Plus, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ProjectsPage () {
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const router = useRouter()

  const filters = useAppSelector(state => state.projects?.filters || {})
  const [searchValue, setSearchValue] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')

  const { data, isLoading, refetch } = useProjects(filters)
  const deleteMutation = useDeleteProject()
  const toggleStatusMutation = useToggleProjectStatus()

  interface ProjectsResponse {
    items: Project[]
    pagination: {
      page: number
      pages: number
      limit: number
      total: number
    }
    summary: {
      totalProjects: number
      totalPlots: number
      totalArea: number
      averageProgress: number
    }
  }

  const typedData = data as ProjectsResponse | undefined

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
    router.push('/projects/create')
  }

  const handleEdit = (id: string) => {
    router.push(`/projects/edit/${id}`)
  }

  const handleView = (id: string) => {
    router.push(`/projects/view/${id}`)
  }

  const handleDelete = async (id: string) => {
    if (canDelete) await deleteMutation.mutateAsync(id)
  }

  const [pendingToggleId, setPendingToggleId] = useState<string | null>(null)
  const handleToggleStatus = (id: string) => setPendingToggleId(id)
  const handleToggleStatusConfirm = async () => {
    if (pendingToggleId && canUpdate) {
      await toggleStatusMutation.mutateAsync(pendingToggleId)
      setPendingToggleId(null)
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

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    if (status) {
      dispatch(
        setFilters({
          status: [status as ProjectStatus],
          page: 1
        })
      )
    } else {
      // Clear status filter by setting it to undefined
      dispatch(setFilters({ status: undefined, page: 1 }))
    }
  }

  const handleTypeFilter = (type: string) => {
    setTypeFilter(type)
    if (type) {
      dispatch(
        setFilters({
          type: [type as ProjectType],
          page: 1
        })
      )
    } else {
      // Clear type filter by setting it to undefined
      dispatch(setFilters({ type: undefined, page: 1 }))
    }
  }

  const handleActiveFilter = (isActive: string) => {
    if (isActive === 'true') {
      dispatch(setFilters({ isActive: true, page: 1 }))
    } else if (isActive === 'false') {
      dispatch(setFilters({ isActive: false, page: 1 }))
    } else {
      // Clear isActive filter by setting it to undefined
      dispatch(setFilters({ isActive: undefined, page: 1 }))
    }
  }

  const handlePageChange = (page: number) => {
    dispatch(setFilters({ page }))
  }

  const handleResetFilters = () => {
    // Use resetFilters action to completely clear all filters
    dispatch(resetFilters())
    setSearchValue('')
    setStatusFilter('')
    setTypeFilter('')
  }

  const projectCustomActions: NonNullable<
    NonNullable<TableConfig<Project>['actions']>['customActions']
  > = [
    {
      label: 'View Details',
      actionType: 'view' as ActionType,
      onClick: (row: Project) => handleView(row._id),
      variant: 'outline'
    },
    {
      label: 'Toggle Active',
      actionType: 'toggle' as ActionType,
      onClick: (row: Project) => handleToggleStatus(row._id),
      variant: 'outline'
    }
  ]

  const tableConfig = {
    columns: projectColumns,
    filters: [
      {
        id: 'status',
        label: 'Status',
        type: 'select' as const,
        options: [
          { label: 'Planning', value: 'planning' },
          { label: 'Under Development', value: 'under_development' },
          { label: 'Completed', value: 'completed' },
          { label: 'On Hold', value: 'on_hold' },
          { label: 'Cancelled', value: 'cancelled' }
        ],
        value: statusFilter,
        onChange: handleStatusFilter
      },
      {
        id: 'type',
        label: 'Type',
        type: 'select' as const,
        options: [

          { label: 'Residential', value: 'residential' },
          { label: 'Commercial', value: 'commercial' },
          { label: 'Industrial', value: 'industrial' },
          { label: 'Mixed Use', value: 'mixed_use' },
          { label: 'Agricultural', value: 'agricultural' }
        ],
        value: typeFilter,
        onChange: handleTypeFilter
      },
      {
        id: 'isActive',
        label: 'Active',
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
          { label: 'Launch Date', value: 'launchDate' },
          { label: 'Project Name', value: 'projName' },
          { label: 'Total Area', value: 'totalArea' },
          { label: 'Total Plots', value: 'totalPlots' }
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
    actions: {
      onEdit: canUpdate ? handleEdit : undefined,
      onDelete: canDelete ? handleDelete : undefined,
      customActions: projectCustomActions
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
  const projectRows: Project[] = typedData?.items ?? []

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-foreground'>Projects</h1>
        <p className='mt-1 text-muted-foreground'>
          Manage all housing society projects
        </p>
      </div>

      {summary && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <SummaryCard
            title='Total Projects'
            value={summary.totalProjects}
            icon={BarChart3}
            iconBgClassName='bg-blue-500/20'
            iconClassName='text-blue-400'
            gradient='from-blue-500/10 to-transparent'
          />
          <SummaryCard
            title='Total Plots'
            value={(summary.totalPlots ?? 0).toLocaleString()}
            icon={MapPin}
            iconBgClassName='bg-emerald-500/20'
            iconClassName='text-emerald-400'
            gradient='from-emerald-500/10 to-transparent'
          />
          <SummaryCard
            title='Total Area'
            value={(summary.totalArea ?? 0).toLocaleString()}
            icon={BarChart3}
            iconBgClassName='bg-amber-500/20'
            iconClassName='text-amber-400'
            gradient='from-amber-500/10 to-transparent'
          />
          <SummaryCard
            title='Avg Progress'
            value={`${summary.averageProgress ?? 0}%`}
            icon={BarChart3}
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
              onClick={() => router.push('/projects/statistics')}
            >
              <BarChart3 className='size-4' />
              Statistics
            </Button>
            <Button
              variant='glass'
              size='sm'
              onClick={() => router.push('/projects/map')}
            >
              <MapPin className='size-4' />
              Map View
            </Button>
          </>
        }
        right={
          canCreate && (
            <Button
              variant='default'
              size='sm'
              onClick={handleCreate}
              className='bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white border-0 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all duration-200'
            >
              <Plus className='size-4' />
              Add Project
            </Button>
          )
        }
      />

      <DataTable<Project>
        data={projectRows}
        config={tableConfig as TableConfig<Project>}
        isLoading={isLoading}
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
      />

      <ConfirmModal
        open={!!pendingToggleId}
        onOpenChange={(open) => !open && setPendingToggleId(null)}
        title="Toggle Project Status"
        description="Are you sure you want to toggle the active status of this project?"
        confirmLabel="Toggle"
        variant="default"
        showIcon={false}
        onConfirm={handleToggleStatusConfirm}
      />
    </div>
  )
}
