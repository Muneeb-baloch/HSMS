// src/app/(dashboard)/userstaff/page.tsx
'use client'

import { ActionBar } from '@/components/shared/PageTemplate'
import { SummaryCard } from '@/components/shared/SummaryCard'
import { EnhancedDataTable as DataTable } from '@/components/shared/DataTable/DataTable'
import { Button } from '@/components/ui/button'
import { hasPermission, UserRole as UserRoleEnum } from '@/lib/constants/roles'
import { userStaffColumns } from '@/lib/constants/userstaffColumns.constants'
import {
  useBulkUpdateUserStatus,
  useDeleteUserStaff,
  useToggleUserStatus,
  useUserStaffs
} from '@/lib/hooks/entities/useUserStaff'
import { useActiveRoles } from '@/lib/hooks/entities/useUserRole'
import { useCities } from '@/lib/hooks/entities/useCity'
import { useAuth } from '@/lib/hooks/useAuth'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { resetFilters, setFilters } from '@/lib/store/slices/userStaffSlice'
import { ConfirmModal } from '@/components/ui/confirm'
import {
  BarChart3,
  Lock,
  LockOpen,
  RefreshCw,
  Shield,
  Trash2,
  UserPlus,
  Users
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { customToast } from "@/lib/utils/customToast"

export default function UserStaffPage () {
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const router = useRouter()

  const filters = useAppSelector(state => state.userStaff?.filters || {})
  const [searchValue, setSearchValue] = useState('')
  const [selectedRows, setSelectedRows] = useState<string[]>([])

  const { data, isLoading, refetch } = useUserStaffs(filters)
  const deleteMutation = useDeleteUserStaff()
  const toggleStatusMutation = useToggleUserStatus()
  const bulkUpdateMutation = useBulkUpdateUserStatus()

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
    router.push('/userstaff/create')
  }

  const handleEdit = (id: string) => {
    router.push(`/userstaff/edit/${id}`)
  }

  const handleView = (id: string) => {
    router.push(`/userstaff/view/${id}`)
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

  const handleRoleFilter = (roleId: string) => {
    if (roleId) {
      dispatch(setFilters({ roleId, page: 1 }))
    } else {
      const { roleId: _, ...rest } = filters
      dispatch(setFilters({ ...rest, page: 1 }))
    }
  }

  const handleCityFilter = (cityId: string) => {
    if (cityId) {
      dispatch(setFilters({ cityId, page: 1 }))
    } else {
      const { cityId: _, ...rest } = filters
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
        roleId: '',
        cityId: '',
        designation: '',
        sortBy: 'createdAt',
        sortOrder: 'desc'
      })
    )
    setSearchValue('')
    setSelectedRows([])
  }

  const [showBulkActivateModal, setShowBulkActivateModal] = useState(false)
  const [showBulkDeactivateModal, setShowBulkDeactivateModal] = useState(false)
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)
  const handleBulkActivate = () => {
    if (selectedRows.length === 0) {
      customToast.error('Please select users to activate')
      return
    }
    setShowBulkActivateModal(true)
  }
  const handleBulkActivateConfirm = async () => {
    try {
      await bulkUpdateMutation.mutateAsync({
        userIds: selectedRows,
        isActive: true
      })
      setSelectedRows([])
      setShowBulkActivateModal(false)
    } catch (error) {
      console.error('Failed to activate users:', error)
    }
  }
  const handleBulkDeactivate = () => {
    if (selectedRows.length === 0) {
      customToast.error('Please select users to deactivate')
      return
    }
    setShowBulkDeactivateModal(true)
  }
  const handleBulkDeactivateConfirm = async () => {
    try {
      await bulkUpdateMutation.mutateAsync({
        userIds: selectedRows,
        isActive: false
      })
      setSelectedRows([])
      setShowBulkDeactivateModal(false)
    } catch (error) {
      console.error('Failed to deactivate users:', error)
    }
  }
  const handleBulkDelete = () => setShowBulkDeleteModal(true)
  const handleBulkDeleteConfirm = async () => {
    // TODO: implement bulk delete when API exists
    setSelectedRows([])
    setShowBulkDeleteModal(false)
  }

  const handleRowSelection = (rows: any[]) => {
    setSelectedRows(rows.map(row => row._id))
  }

  const { data: activeRoles } = useActiveRoles()
  const { data: citiesData } = useCities({ limit: 100 })

  const roleOptions = [
    { label: 'All Roles', value: '' },
    ...(activeRoles?.map((r: any) => ({ label: r.roleName, value: r._id })) || [])
  ]
  const cityOptions = [
    { label: 'All Cities', value: '' },
    ...(citiesData?.items?.map((c: any) => ({ label: c.cityName, value: c._id })) || [])
  ]

  const tableConfig = {
    columns: userStaffColumns,
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
        id: 'roleId',
        label: 'Role',
        type: 'select' as const,
        options: roleOptions,
        onChange: handleRoleFilter
      },
      {
        id: 'cityId',
        label: 'City',
        type: 'select' as const,
        options: cityOptions,
        onChange: handleCityFilter
      },
      {
        id: 'sortBy',
        label: 'Sort By',
        type: 'select' as const,
        options: [
          { label: 'Created Date', value: 'createdAt' },
          { label: 'Full Name', value: 'fullName' },
          { label: 'Username', value: 'userName' },
          { label: 'Last Login', value: 'lastLogin' }
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
    enableSelection: canUpdate,
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
        },
        {
          label: 'Reset Password',
          icon: <Shield className='h-4 w-4 mr-2' />,
          onClick: (row: any) =>
            router.push(`/userstaff/reset-password/${row._id}`),
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
        <h1 className='text-2xl font-bold text-foreground'>User Staff</h1>
        <p className='mt-1 text-muted-foreground'>
          Manage system users and their permissions
        </p>
      </div>

      {summary && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <SummaryCard
            title='Total Users'
            value={summary.totalUsers}
            icon={Users}
            iconBgClassName='bg-blue-500/20'
            iconClassName='text-blue-400'
            gradient='from-blue-500/10 to-transparent'
          />
          <SummaryCard
            title='Active Users'
            value={summary.activeUsers}
            icon={LockOpen}
            iconBgClassName='bg-emerald-500/20'
            iconClassName='text-emerald-400'
            gradient='from-emerald-500/10 to-transparent'
          />
          <SummaryCard
            title='Roles'
            value={summary.totalRoles ?? Object.keys(summary.byRole || {}).length}
            icon={Shield}
            iconBgClassName='bg-purple-500/20'
            iconClassName='text-purple-400'
            gradient='from-purple-500/10 to-transparent'
          />
          <SummaryCard
            title='Cities'
            value={Object.keys(summary.byCity || {}).length}
            icon={BarChart3}
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
              onClick={() => router.push('/userstaff/statistics')}
            >
              <BarChart3 className='size-4' />
              Statistics
            </Button>
            <Button
              variant='glass'
              size='sm'
              onClick={() => router.push('/userstaff/activity')}
            >
              <Users className='size-4' />
              Activity
            </Button>
            {selectedRows.length > 0 && canUpdate && (
              <>
                <span className='text-xs text-muted-foreground self-center'>
                  {selectedRows.length} selected
                </span>
                <Button
                  variant='glass'
                  size='sm'
                  onClick={handleBulkActivate}
                  disabled={bulkUpdateMutation.isPending}
                >
                  <LockOpen className='size-4' />
                  Activate
                </Button>
                <Button
                  variant='glass'
                  size='sm'
                  onClick={handleBulkDeactivate}
                  disabled={bulkUpdateMutation.isPending}
                >
                  <Lock className='size-4' />
                  Deactivate
                </Button>
                <Button
                  variant='glass'
                  size='sm'
                  onClick={handleBulkDelete}
                  className='text-red-500 hover:text-red-400'
                >
                  <Trash2 className='size-4' />
                  Delete
                </Button>
              </>
            )}
          </>
        }
        right={
          canCreate && (
            <Button variant='primary' size='sm' onClick={handleCreate}>
              <UserPlus className='size-4' />
              Add User
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

      <ConfirmModal
        open={!!pendingToggleId}
        onOpenChange={(open) => !open && setPendingToggleId(null)}
        title='Toggle User Status'
        description='Are you sure you want to toggle the status of this user?'
        confirmLabel='Toggle'
        variant='default'
        showIcon={false}
        onConfirm={handleToggleStatusConfirm}
      />
      <ConfirmModal
        open={showBulkActivateModal}
        onOpenChange={setShowBulkActivateModal}
        title='Activate Users'
        description={`Activate ${selectedRows.length} selected user(s)?`}
        confirmLabel='Activate'
        variant='default'
        showIcon={false}
        onConfirm={handleBulkActivateConfirm}
      />
      <ConfirmModal
        open={showBulkDeactivateModal}
        onOpenChange={setShowBulkDeactivateModal}
        title='Deactivate Users'
        description={`Deactivate ${selectedRows.length} selected user(s)?`}
        confirmLabel='Deactivate'
        variant='default'
        showIcon={false}
        onConfirm={handleBulkDeactivateConfirm}
      />
      <ConfirmModal
        open={showBulkDeleteModal}
        onOpenChange={setShowBulkDeleteModal}
        title='Delete Users'
        description={`Delete ${selectedRows.length} selected user(s)? This cannot be undone.`}
        confirmLabel='Delete Permanently'
        variant='danger'
        onConfirm={handleBulkDeleteConfirm}
      />
    </div>
  )
}
