// src/app/(dashboard)application-types/page.tsx
'use client'

import { ActionBar } from '@/components/shared/PageTemplate'
import { EnhancedDataTable as DataTable } from '@/components/shared/DataTable/DataTable'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import { srApplicationTypeColumns } from '@/lib/constants/srApplicationTypeColumns.constants'
import {
  useDeleteSrApplicationType,
  useSrApplicationTypes
} from '@/lib/hooks/entities/useSrApplicationType'
import { useAuth } from '@/lib/hooks/useAuth'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import {
  resetFilters,
  setFilters
} from '@/lib/store/slices/srApplicationTypeSlice'
import { Download, FilePlus, Plus, RefreshCw, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useConfirm } from "@/components/shared/ConfirmDialog";

export default function SrApplicationTypesPage () {
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const router = useRouter()

  const filters = useAppSelector(
    state => state.srApplicationTypes?.filters || {}
  )
  const [searchValue, setSearchValue] = useState('')
  const { confirm } = useConfirm();
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const { data, isLoading, refetch } = useSrApplicationTypes(filters)

  const deleteMutation = useDeleteSrApplicationType()

  const canCreate =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN])
  const canUpdate =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN])
  const canDelete =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

  const handleCreate = () => {
    router.push('application-types/create')
  }

  const handleEdit = (id: string) => {
    router.push(`application-types/edit/${id}`)
  }

  const handleView = (id: string) => {
    router.push(`application-types/view/${id}`)
  }

  const handleDelete = async (id: string) => {
    if (
      canDelete &&
      await confirm({ title: "Delete", description: 'Are you sure you want to delete this application type?', variant: "destructive" })
    ) {
      await deleteMutation.mutateAsync(id)
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

  const handleSelectionChange = (selectedIds: string[]) => {
    setSelectedIds(selectedIds)
  }

  const handleExportReport = () => {
    const csvData = [
      [
        'Application Name',
        'Description',
        'Application Fee',
        'Created At',
        'Status'
      ],
      ...(data?.items || []).map(item => [
        item.applicationName,
        item.applicationDesc || '',
        item.applicationFee.toString(),
        new Date(item.createdAt).toLocaleDateString(),
        item.isDeleted ? 'Deleted' : 'Active'
      ])
    ]

    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sr-application-types-${
      new Date().toISOString().split('T')[0]
    }.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const tableConfig = {
    columns: srApplicationTypeColumns,
    filters: [
      {
        id: 'sortBy',
        label: 'Sort By',
        type: 'select' as const,
        options: [
          { label: 'Application Name', value: 'applicationName' },
          { label: 'Application Fee', value: 'applicationFee' },
          { label: 'Created Date', value: 'createdAt' },
          { label: 'Updated Date', value: 'updatedAt' }
        ],
        onChange: (value: string) =>
          handleSortChange(value, filters.sortOrder || 'desc')
      },
      {
        id: 'sortOrder',
        label: 'Sort Order',
        type: 'select' as const,
        options: [
          { label: 'Ascending', value: 'asc' },
          { label: 'Descending', value: 'desc' }
        ],
        onChange: (value: 'asc' | 'desc') =>
          handleSortChange(filters.sortBy || 'createdAt', value)
      }
    ],
    enableActions: true,
    enableSelection: true,
    actions: {
      onEdit: canUpdate ? handleEdit : undefined,
      onDelete: canDelete ? handleDelete : undefined,
      customActions: [
        {
          label: 'View Details',
          icon: <span>👁️</span>,
          onClick: (row: any) => handleView(row._id),
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

  // Calculate statistics
  const totalFee =
    data?.items.reduce((sum, item) => sum + item.applicationFee, 0) || 0
  const averageFee = data?.items.length ? totalFee / data.items.length : 0
  const activeCount = data?.items.filter(item => !item.isDeleted).length || 0
  const deletedCount = data?.items.filter(item => item.isDeleted).length || 0

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold'>SR Application Types</h1>
        <p className='text-muted-foreground'>
          Manage different types of SR (Sales/Registration) applications
        </p>
      </div>

      {/* Statistics Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <div className='text-sm text-gray-500'>Total Types</div>
                <div className='text-2xl font-bold'>
                  {data?.items.length || 0}
                </div>
              </div>
              <div className='p-3 bg-blue-100 rounded-full'>
                <FilePlus className='h-6 w-6 text-blue-600' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <div className='text-sm text-gray-500'>Active Types</div>
                <div className='text-2xl font-bold text-green-600'>
                  {activeCount}
                </div>
              </div>
              <div className='p-3 bg-green-100 rounded-full'>
                <TrendingUp className='h-6 w-6 text-green-600' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <div className='text-sm text-gray-500'>Average Fee</div>
                <div className='text-2xl font-bold text-purple-600'>
                  Rs. {averageFee.toFixed(2)}
                </div>
              </div>
              <div className='p-3 bg-purple-100 rounded-full'>
                <TrendingUp className='h-6 w-6 text-purple-600' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <div className='text-sm text-gray-500'>Total Fee Value</div>
                <div className='text-2xl font-bold text-orange-600'>
                  Rs. {totalFee.toLocaleString()}
                </div>
              </div>
              <div className='p-3 bg-orange-100 rounded-full'>
                <TrendingUp className='h-6 w-6 text-orange-600' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <ActionBar
        left={
          <>
            {Object.keys(filters).length > 5 && (
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
            <Button variant='glass' size='sm' onClick={handleExportReport}>
              <Download className='size-4' />
              Export Report
            </Button>
          </>
        }
        right={
          canCreate && (
            <Button variant='primary' size='sm' onClick={handleCreate}>
              <Plus className='size-4' />
              Add Application Type
            </Button>
          )
        }
      />

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>SR Application Types</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={data?.items || []}
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
