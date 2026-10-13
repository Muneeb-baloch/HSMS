'use client'

import { ActionBar } from '@/components/shared/PageTemplate'
import { EnhancedDataTable as DataTable } from '@/components/shared/DataTable/DataTable'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { announcementCategoryColumns } from '@/lib/constants/announcementCategoryColumns.constants'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import {
  useAnnouncementCategories,
  useAnnouncementCategoryStatistics,
  useDeleteAnnouncementCategory
} from '@/lib/hooks/entities/useAnnouncementCategory'
import { useAuth } from '@/lib/hooks/useAuth'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import {
  resetFilters,
  setFilters
} from '@/lib/store/slices/announcementCategorySlice'
import { Download, Plus, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { customToast } from '@/lib/utils/customToast'
import { useConfirm } from "@/components/shared/ConfirmDialog";

export default function AnnouncementCategoriesPage () {
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const router = useRouter()

  const filters = useAppSelector(
    state => state.announcementCategories?.filters || {}
  )
  const [searchValue, setSearchValue] = useState('')
  const { confirm } = useConfirm();
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const { data, isLoading, refetch } = useAnnouncementCategories(filters)
  const { data: statistics } = useAnnouncementCategoryStatistics()
  const deleteMutation = useDeleteAnnouncementCategory()

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

  const handleCreate = () => router.push('/announcementcategory/create')

  const handleEdit = (id: string) =>
    router.push(`/announcementcategory/edit/${id}`)

  const handleView = (id: string) =>
    router.push(`/announcementcategory/view/${id}`)

  const handleDelete = async (id: string) => {
    if (
      canDelete &&
      await confirm({ title: "Delete", description: 'Are you sure you want to delete this category?', variant: "destructive" })
    ) {
      try {
        await deleteMutation.mutateAsync(id)
      } catch (err: any) {
        customToast.error(err.message || 'Failed to delete category')
      }
    }
  }

  const handleSearch = (search: string) => {
    setSearchValue(search)
    dispatch(setFilters({ search, page: 1 }))
  }

  const handleFilterChange = (newFilters: Record<string, unknown>) => {
    dispatch(setFilters({ ...newFilters, page: 1 }))
  }

  const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    dispatch(setFilters({ sortBy, sortOrder, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    dispatch(setFilters({ page }))
  }

  const handleResetFilters = () => {
    dispatch(resetFilters())
    setSearchValue('')
    setSelectedIds([])
  }

  const handleSelectionChange = (ids: string[]) => setSelectedIds(ids)

  const handleExport = () => {
    const items = data?.announcementCategories
    if (!items?.length) {
      customToast.error('No data to export')
      return
    }

    const rows = items.map((cat: any) => ({
      'Category Name': cat.categoryName || '',
      'Description': cat.description || '',
      'Active': cat.isActive ? 'Yes' : 'No',
      'Created At': cat.createdAt ? new Date(cat.createdAt).toLocaleDateString() : '',
    }))

    const headers = Object.keys(rows[0])
    const csvContent = [
      headers.join(','),
      ...rows.map((row: any) => headers.map(h => `"${String(row[h]).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `announcement-categories-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
    customToast.success('Export completed')
  }

  const tableConfig = {
    columns: announcementCategoryColumns,
    onRowClick: handleView,
    onEdit: canUpdate ? handleEdit : undefined,
    onDelete: canDelete ? handleDelete : undefined,
    enableRowSelection: canDelete,
    enableSorting: true,
    enablePagination: true,
    enableSearch: true,
    enableFilters: true,
    pagination: data?.pagination
      ? {
          currentPage: data.pagination.page,
          totalPages: data.pagination.pages,
          pageSize: data.pagination.limit,
          totalItems: data.pagination.total,
          onPageChange: handlePageChange,
          onPageSizeChange: (size: number) =>
            dispatch(setFilters({ limit: size, page: 1 })),
        }
      : undefined,
  }

  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-2xl font-bold text-white'>Announcement Categories</h1>
        <p className='text-muted-foreground mt-1'>
          Manage announcement grouping categories
        </p>
      </div>

      {/* Quick Stats */}
      {statistics && (
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <Card>
            <CardContent className='pt-6'>
              <div className='text-sm text-gray-500'>Total Categories</div>
              <div className='text-2xl font-bold mt-1'>
                {statistics.totalCategories}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-6'>
              <div className='text-sm text-gray-500'>Active Categories</div>
              <div className='text-2xl font-bold mt-1 text-green-600'>
                {statistics.activeCategories}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-6'>
              <div className='text-sm text-gray-500'>System Categories</div>
              <div className='text-2xl font-bold mt-1 text-purple-600'>
                {statistics.systemCategories}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
              New Category
            </Button>
          )
        }
      />

      {/* Main Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={data?.announcementCategories || []}
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
