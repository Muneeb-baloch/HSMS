// src/app/(dashboard)/roles/page.tsx
'use client'

import { ActionBar } from '@/components/shared/PageTemplate'
import { SummaryCard } from '@/components/shared/SummaryCard'
import { EnhancedDataTable as DataTable } from '@/components/shared/DataTable/DataTable'
import { Button } from '@/components/ui/button'
import { hasPermission, UserRole as UserRoleEnum } from '@/lib/constants/roles'
import { userRoleColumns } from '@/lib/constants/userroleColumns.constants'
import {
  useDeleteUserRole,
  useInitializeDefaultRoles,
  useToggleRoleStatus,
  useUserRoles
} from '@/lib/hooks/entities/useUserRole'
import { useAuth } from '@/lib/hooks/useAuth'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { resetFilters, setFilters } from '@/lib/store/slices/userroleSlice'
import { ConfirmModal } from '@/components/ui/confirm'
import { BarChart3, Copy, Plus, RefreshCw, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function RolesPage () {
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const router = useRouter()

  const filters = useAppSelector(state => state.userRoles?.filters || {})
  const [searchValue, setSearchValue] = useState('')

  const { data, isLoading, refetch } = useUserRoles(filters)
  const deleteMutation = useDeleteUserRole()
  const toggleStatusMutation = useToggleRoleStatus()
  const initializeDefaultsMutation = useInitializeDefaultRoles()

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
    router.push('/roles/create')
  }

  const handleEdit = (id: string) => {
    router.push(`/roles/edit/${id}`)
  }

  const handleView = (id: string) => {
    router.push(`/roles/view/${id}`)
  }

  const handleDelete = async (id: string) => {
    if (canDelete) await deleteMutation.mutateAsync(id)
  }

  const [pendingToggleId, setPendingToggleId] = useState<string | null>(null)
  const [showInitModal, setShowInitModal] = useState(false)
  const handleToggleStatus = (id: string) => setPendingToggleId(id)
  const handleToggleStatusConfirm = async () => {
    if (pendingToggleId && canUpdate) {
      await toggleStatusMutation.mutateAsync(pendingToggleId)
      setPendingToggleId(null)
    }
  }
  const handleInitializeDefaults = () => setShowInitModal(true)
  const handleInitializeDefaultsConfirm = async () => {
    await initializeDefaultsMutation.mutateAsync()
    setShowInitModal(false)
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
        sortBy: 'priority',
        sortOrder: 'desc'
      })
    )
    setSearchValue('')
  }

  const tableConfig = {
    columns: userRoleColumns,
    filters: [
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
          { label: 'Priority', value: 'priority' },
          { label: 'Role Name', value: 'roleName' },
          { label: 'Created Date', value: 'createdAt' }
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
          label: 'View Users',
          icon: <Users className='h-4 w-4 mr-2' />,
          onClick: (row: any) => router.push(`/users?roleId=${row._id}`),
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

  const summary = data?.summary

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-foreground'>User Roles</h1>
        <p className='mt-1 text-muted-foreground'>
          Manage user roles and access levels
        </p>
      </div>

      {summary && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <SummaryCard
            title='Total Roles'
            value={summary.totalRoles}
            icon={Users}
            iconBgClassName='bg-blue-500/20'
            iconClassName='text-blue-400'
            gradient='from-blue-500/10 to-transparent'
          />
          <SummaryCard
            title='Active Roles'
            value={summary.activeRoles}
            icon={BarChart3}
            iconBgClassName='bg-emerald-500/20'
            iconClassName='text-emerald-400'
            gradient='from-emerald-500/10 to-transparent'
          />
          <SummaryCard
            title='System Roles'
            value={summary.systemRoles ?? 0}
            icon={Copy}
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
              onClick={() => router.push('/roles/statistics')}
            >
              <BarChart3 className='size-4' />
              Statistics
            </Button>
            <Button
              variant='glass'
              size='sm'
              onClick={() => router.push('/roles/hierarchy')}
            >
              <Users className='size-4' />
              Hierarchy
            </Button>
            {canCreate && (
              <Button
                variant='glass'
                size='sm'
                onClick={handleInitializeDefaults}
                disabled={initializeDefaultsMutation.isPending}
              >
                <Copy className='size-4' />
                Initialize Defaults
              </Button>
            )}
          </>
        }
        right={
          canCreate && (
            <Button variant='primary' size='sm' onClick={handleCreate}>
              <Plus className='size-4' />
              Add Role
            </Button>
          )
        }
      />

      <DataTable
        data={data?.items || []}
        config={tableConfig}
        isLoading={isLoading}
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
      />
    </div>
  )
}
