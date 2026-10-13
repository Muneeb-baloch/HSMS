'use client'

import { ActionBar } from '@/components/shared/PageTemplate'
import { EnhancedDataTable as DataTable } from '@/components/shared/DataTable/DataTable'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  useDeleteAnnouncementMutation,
  useGetAnnouncementsQuery
} from '@/lib/API/announcementApi'
import { announcementColumns } from '@/lib/constants/announcementColumns.constants'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import { useAuth } from '@/lib/hooks/useAuth'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { resetFilters, setFilters } from '@/lib/store/slices/announcementSlice'
import { Announcement } from '@/lib/types/announcement'
import { Download, Plus, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { customToast } from '@/lib/utils/customToast'
import { useConfirm } from "@/components/shared/ConfirmDialog";

export default function AnnouncementsPage () {
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const router = useRouter()

  const filters = useAppSelector(state => state.announcements?.filters || {})
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const { confirm } = useConfirm();

  const { data, isLoading } = useGetAnnouncementsQuery(filters)
  const [deleteAnnouncement] = useDeleteAnnouncementMutation()

  const canCreate =
    user &&
    hasPermission(user.role as UserRole, [
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
      UserRole.MODERATOR
    ])
  const canUpdate = canCreate
  const canDelete =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

  const handleCreate = () => router.push('/announcements/create')

  const handleEdit = (id: string) => router.push(`/announcements/edit/${id}`)

  const handleView = (id: string) => router.push(`/announcements/view/${id}`)

  const handleDelete = async (id: string) => {
    if (!canDelete) return
    if (!await confirm({ title: "Delete", description: 'Are you sure you want to delete this announcement?', variant: "destructive" })) return

    try {
      await deleteAnnouncement(id).unwrap()
      customToast.success('Announcement deleted successfully')
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } }
      customToast.error(error?.data?.message || 'Failed to delete announcement')
    }
  }

  const handleSearch = (search: string) => {
    dispatch(setFilters({ search, page: 1 }))
  }

  const handleFilterChange = (newFilters: Record<string, unknown>) => {
    dispatch(setFilters({ ...newFilters, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    dispatch(setFilters({ page }))
  }

  const handleResetFilters = () => {
    dispatch(resetFilters())
    setSelectedIds([])
  }

  const handleSelectionChange = (ids: string[]) => setSelectedIds(ids)

  const handleExport = () => {
    customToast.info('Export functionality coming soon')
    // You can implement CSV export here later
  }

  const pagination = data?.data?.pagination
    ? {
        currentPage: data.data.pagination.page || 1,
        totalPages: data.data.pagination.pages || 1,
        onPageChange: handlePageChange,
        pageSize: data.data.pagination.limit || 15,
        onPageSizeChange: (size: number) =>
          dispatch(setFilters({ limit: size, page: 1 })),
        totalItems: data.data.pagination.total || 0
      }
    : undefined

  const tableConfig = {
    columns: announcementColumns,
    enableActions: true,
    enableSelection: !!canDelete,
    actions: {
      onEdit: canUpdate ? handleEdit : undefined,
      onDelete: canDelete ? handleDelete : undefined,
      customActions: [
        {
          label: 'View Details',
          icon: <span>👁️</span>,
          onClick: (row: Announcement) => handleView(row._id),
          variant: 'outline' as const
        }
      ]
    },
    pagination
  }

  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-2xl font-bold text-white'>Announcements</h1>
        <p className='text-muted-foreground mt-1'>
          Manage system-wide announcements and notifications
        </p>
      </div>

      {/* Quick Stats (you can expand this later with real stats) */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-sm text-gray-500'>Total Announcements</div>
            <div className='text-2xl font-bold mt-1'>
              {data?.data?.pagination?.total || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-sm text-gray-500'>Published</div>
            <div className='text-2xl font-bold mt-1 text-green-600'>
              {data?.data?.announcements?.filter(
                (a: Announcement) => a.status === 'Published'
              ).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-sm text-gray-500'>High Priority</div>
            <div className='text-2xl font-bold mt-1 text-red-600'>
              {data?.data?.announcements?.filter(
                (a: Announcement) => a.priorityLevel === 3
              ).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <ActionBar
        left={
          <>
            {Object.keys(filters).length > 4 && (
              <Button variant='glass' size='sm' onClick={handleResetFilters}>
                <RefreshCw className='size-4' />
                Reset Filters
              </Button>
            )}
            {selectedIds.length > 0 && (
              <span className='text-xs text-muted-foreground self-center'>
                {selectedIds.length} selected
              </span>
            )}
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
              New Announcement
            </Button>
          )
        }
      />

      {/* Main Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={data?.data?.announcements || []}
            config={tableConfig}
            isLoading={isLoading}
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
            onSelectionChange={handleSelectionChange}
          />
        </CardContent>
      </Card>
    </div>
  )
}
