// src/app/(dashboard)/permissions/page.tsx
'use client'

import { ActionBar } from '@/components/shared/PageTemplate'
import { SummaryCard } from '@/components/shared/SummaryCard'
import { EnhancedDataTable as DataTable } from '@/components/shared/DataTable/DataTable'
import { Button } from '@/components/ui/button'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import { userPermissionColumns } from '@/lib/constants/userpermissionColumns.constants'
import {
  useDeleteUserPermission,
  useInitializeDefaultPermissions,
  useTogglePermissionStatus,
  useUserPermissions
} from '@/lib/hooks/entities/useUserPermission'
import { useAuth } from '@/lib/hooks/useAuth'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { resetFilters, setFilters } from '@/lib/store/slices/userpermissionSlice'
import { AccessType, UserPermission } from '@/lib/types/userpermission'
import { BarChart3, Copy, Plus, RefreshCw, Shield } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useConfirm } from "@/components/shared/ConfirmDialog";

export default function PermissionsPage () {
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const router = useRouter()

  const filters = useAppSelector(state => state.userPermissions?.filters || {})
  const [searchValue, setSearchValue] = useState('')
  const { confirm } = useConfirm();

  const { data, isLoading, refetch } = useUserPermissions(filters)
  const deleteMutation = useDeleteUserPermission()
  const toggleStatusMutation = useTogglePermissionStatus()
  const initializeDefaultsMutation = useInitializeDefaultPermissions()

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
    router.push('/permissions/create')
  }

  const handleEdit = (id: string) => {
    router.push(`/permissions/edit/${id}`)
  }

  const handleView = (id: string) => {
    router.push(`/permissions/view/${id}`)
  }

  const handleDelete = async (id: string) => {
    if (
      canDelete &&
      await confirm({ title: "Delete", description: 'Are you sure you want to delete this permission?', variant: "destructive" })
    ) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const handleToggleStatus = async (id: string) => {
    if (
      canUpdate &&
      await confirm({ title: "Confirm", description: 'Are you sure you want to toggle the status of this permission?' })
    ) {
      await toggleStatusMutation.mutateAsync(id)
    }
  }

  const handleInitializeDefaults = async () => {
    if (await confirm({ title: "Confirm", description: 'Initialize default permissions for all roles and modules?' })) {
      await initializeDefaultsMutation.mutateAsync()
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

  const handleModuleFilter = (srModuleId: string) => {
    if (srModuleId) {
      dispatch(
        setFilters({
          srModuleId,
          page: 1
        })
      )
    } else {
      const { srModuleId: _, ...rest } = filters
      dispatch(setFilters({ ...rest, page: 1 }))
    }
  }

  const handleRoleFilter = (roleId: string) => {
    if (roleId) {
      dispatch(
        setFilters({
          roleId,
          page: 1
        })
      )
    } else {
      const { roleId: _, ...rest } = filters
      dispatch(setFilters({ ...rest, page: 1 }))
    }
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

  const handleAccessFilter = (hasAccess: string) => {
    if (hasAccess === 'true') {
      dispatch(setFilters({ hasAccess: true, page: 1 }))
    } else if (hasAccess === 'false') {
      dispatch(setFilters({ hasAccess: false, page: 1 }))
    } else {
      const { hasAccess: _, ...rest } = filters
      dispatch(setFilters({ ...rest, page: 1 }))
    }
  }

  const handlePageChange = (page: number) => {
    dispatch(setFilters({ page }))
  }

  const handleResetFilters = () => {
    dispatch(resetFilters())
    setSearchValue('')
  }

  const tableConfig = {
    columns: userPermissionColumns,
    filters: [
      {
        id: 'srModuleId',
        label: 'Module',
        type: 'select' as const,
        options: [
          { label: 'Modules', value: 'all' }
          // This would be populated dynamically from API
        ],
        onChange: handleModuleFilter
      },
      {
        id: 'roleId',
        label: 'Role',
        type: 'select' as const,
        options: [
          { label: 'Roles', value: 'all' }
          // This would be populated dynamically from API
        ],
        onChange: handleRoleFilter
      },
      {
        id: 'accessType',
        label: 'Access Level',
        type: 'select' as const,
        options: [
          { label: 'No Access', value: AccessType.NO_ACCESS },
          { label: 'View Only', value: AccessType.VIEW_ONLY },
          { label: 'Limited Access', value: AccessType.LIMITED_ACCESS },
          { label: 'Full Access', value: AccessType.FULL_ACCESS }
        ]
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
        id: 'hasAccess',
        label: 'Has Access',
        type: 'select' as const,
        options: [
          { label: 'Has Access', value: 'true' },
          { label: 'No Access', value: 'false' }
        ],
        onChange: handleAccessFilter
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
          onClick: (row: UserPermission) => handleView(row._id),
          variant: 'outline' as const
        },
        {
          label: 'Toggle Active',
          icon: <span>🔄</span>,
          onClick: (row: UserPermission) => handleToggleStatus(row._id),
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
        <h1 className='text-2xl font-bold text-foreground'>Permissions</h1>
        <p className='mt-1 text-muted-foreground'>
          Manage role-based access control and permissions
        </p>
      </div>

      {summary && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <SummaryCard
            title='Total Permissions'
            value={summary.totalPermissions}
            icon={Shield}
            iconBgClassName='bg-blue-500/20'
            iconClassName='text-blue-400'
            gradient='from-blue-500/10 to-transparent'
          />
          <SummaryCard
            title='Active Permissions'
            value={summary.activePermissions}
            icon={BarChart3}
            iconBgClassName='bg-emerald-500/20'
            iconClassName='text-emerald-400'
            gradient='from-emerald-500/10 to-transparent'
          />
          <SummaryCard
            title='Full Access'
            value={summary.byAccessType?.[AccessType.FULL_ACCESS] || 0}
            icon={Copy}
            iconBgClassName='bg-purple-500/20'
            iconClassName='text-purple-400'
            gradient='from-purple-500/10 to-transparent'
          />
          <SummaryCard
            title='No Access'
            value={summary.byAccessType?.[AccessType.NO_ACCESS] || 0}
            icon={Shield}
            iconBgClassName='bg-amber-500/20'
            iconClassName='text-amber-400'
            gradient='from-amber-500/10 to-transparent'
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
              onClick={() => router.push('/permissions/statistics')}
            >
              <BarChart3 className='size-4' />
              Statistics
            </Button>
            <Button
              variant='glass'
              size='sm'
              onClick={() => router.push('/permissions/role-map')}
            >
              <Shield className='size-4' />
              Role Maps
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
              Add Permission
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
