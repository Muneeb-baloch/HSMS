'use client'

import { useToast } from '@/components/context/ToastContext'
import { PermissionFilters } from '@/components/permissions/PermissionFilters'
import { PermissionsTable } from '@/components/permissions/PermissionsTable'
import { PermissionStatsCards } from '@/components/permissions/PermissionStatsCards'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useDeletePermission, usePermissions } from '@/lib/hooks/usePermissions'
import { useAppDispatch } from '@/lib/store/hooks'
import { setSelectedPermission } from '@/lib/store/slices/permissionSlice'
import {
  UserPermission,
  UserPermissionQueryParams
} from '@/lib/types/permissions'
import { BarChart3, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

export default function PermissionsPage () {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { showToast } = useToast()
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [modules, setModules] = useState<any[]>([])
  const [roles, setRoles] = useState<any[]>([])

  const {
    permissions,
    filters,
    total,
    pages,
    isLoading,
    error,
    summary,
    fetchPermissions,
    updateFilters,
    changePage,
    changeSearch
  } = usePermissions()

  const { deletePermission } = useDeletePermission()

  const updateFiltersAndFetch = useCallback(
    (newFilters: Partial<UserPermissionQueryParams>) => {
      updateFilters(newFilters)
      // Fetch with a small delay to ensure filters are updated
      setTimeout(() => fetchPermissions(), 0)
    },
    [updateFilters, fetchPermissions]
  )

  // Initial data fetch
  useEffect(() => {
    fetchPermissions()
  }, [fetchPermissions])

  // Handle errors
  useEffect(() => {
    if (error) {
      showToast(error, 'error')
    }
  }, [error, showToast])

  const handleEdit = (id: string) => {
    const permission = permissions.find(p => p._id === id)
    if (permission) dispatch(setSelectedPermission(permission))
    router.push(`/permissions/${id}/edit`)
  }

  const handleView = (id: string) => {
    const permission = permissions.find(p => p._id === id)
    if (permission) dispatch(setSelectedPermission(permission))
    router.push(`/permissions/${id}`)
  }

  const handleDelete = async (id: string) => {
    const result = await deletePermission(id)
    if (result?.success) {
      showToast('Permission deleted successfully', 'success')
      fetchPermissions()
    } else if (result) {
      showToast(result.error || 'Failed to delete permission', 'error')
    }
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pages) {
      changePage(newPage)
      setTimeout(() => fetchPermissions(), 0)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className='flex-1 space-y-4 p-4 sm:p-6 md:p-8'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Permissions</h1>
          <p className='mt-1 text-sm text-gray-600'>
            Manage role-based permissions and access control
          </p>
        </div>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            onClick={() => router.push('/permissions/analytics')}
          >
            <BarChart3 className='mr-2 h-4 w-4' />
            Analytics
          </Button>
          <Button onClick={() => router.push('/permissions/create')}>
            <Plus className='mr-2 h-4 w-4' />
            Add Permission
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <PermissionStatsCards statistics={null} isLoading={isLoading} />

      {/* Filters and Search */}
      <PermissionFilters
        filters={filters}
        onFiltersChange={updateFiltersAndFetch}
        onReset={() => {
          updateFilters({
            search: '',
            isActive: undefined,
            hasAccess: undefined,
            roleId: undefined,
            srModuleId: undefined,
            page: 1
          })
          fetchPermissions()
        }}
        modules={modules}
        roles={roles}
      />

      {/* Table and Actions */}
      <div className='space-y-4'>
        {selectedPermissions.length > 0 && (
          <Card className='bg-blue-50 p-4'>
            <p className='text-sm text-blue-900'>
              {selectedPermissions.length} permission
              {selectedPermissions.length !== 1 ? 's' : ''} selected
            </p>
          </Card>
        )}

        <PermissionsTable
          permissions={permissions}
          isLoading={isLoading}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          selectedPermissions={selectedPermissions}
          onSelectionChange={setSelectedPermissions}
        />
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className='flex justify-center py-4'>
          <div className='flex items-center justify-between w-full max-w-md p-2 border-t rounded-lg'>
            <span className='text-sm text-gray-600'>
              Page {filters.page} of {pages} ({total} items)
            </span>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                disabled={filters.page === 1}
                onClick={() => handlePageChange(filters.page! - 1)}
              >
                Prev
              </Button>
              <Button
                variant='outline'
                size='sm'
                disabled={filters.page === pages}
                onClick={() => handlePageChange(filters.page! + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {summary && (
        <Card className='p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>Summary</h3>
          <div className='grid grid-cols-2 gap-4 sm:grid-cols-3'>
            <div>
              <p className='text-sm text-gray-600'>Total Permissions</p>
              <p className='text-2xl font-bold text-gray-900'>
                {summary.totalPermissions}
              </p>
            </div>
            <div>
              <p className='text-sm text-gray-600'>Active</p>
              <p className='text-2xl font-bold text-gray-900'>
                {summary.activePermissions}
              </p>
            </div>
            <div>
              <p className='text-sm text-gray-600'>Showing</p>
              <p className='text-2xl font-bold text-gray-900'>
                {permissions.length} / {total}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
