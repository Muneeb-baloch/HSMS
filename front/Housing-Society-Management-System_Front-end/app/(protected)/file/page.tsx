// src/app/(dashboard)/files/page.tsx
'use client'

import { ActionBar } from '@/components/shared/PageTemplate'
import { EnhancedDataTable as DataTable } from '@/components/shared/DataTable/DataTable'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fileColumns } from '@/lib/constants/fileColumns.constants'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import {
  useDeleteFile,
  useFiles,
  useFileSummary,
  useRecentFiles
} from '@/lib/hooks/entities/useFile'
import { useInstallmentPlans } from '@/lib/hooks/entities/useInstallmentPlan'
import { useAuth } from '@/lib/hooks/useAuth'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { resetFilters, setFilters } from '@/lib/store/slices/fileSlice'
import {
  BarChart,
  Download,
  FilePlus,
  Plus,
  RefreshCw,
  TrendingUp
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useConfirm } from "@/components/shared/ConfirmDialog";

export default function FilesPage () {
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const router = useRouter()

  const filters = useAppSelector(state => state.files?.filters || {})
  const [searchValue, setSearchValue] = useState('')
  const { confirm } = useConfirm();
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const { data, isLoading, refetch } = useFiles(filters)
  const { data: summary } = useFileSummary()
  const { data: plansData } = useInstallmentPlans({ limit: 100, isActive: true })
  const { data: recentFiles } = useRecentFiles(5)
  const deleteMutation = useDeleteFile()

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
    router.push('/file/create')
  }

  const handleEdit = (id: string) => {
    router.push(`/file/${id}/edit`)
  }

  const handleView = (id: string) => {
    router.push(`/file/${id}`)
  }

  const handleDelete = async (id: string) => {
    if (canDelete && await confirm({ title: "Delete", description: 'Are you sure you want to delete this file?', variant: "destructive" })) {
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

  const handleDateFilter = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      dispatch(setFilters({ fromDate: value || undefined, page: 1 }))
    } else {
      dispatch(setFilters({ toDate: value || undefined, page: 1 }))
    }
  }

  const handlePlanFilter = (planId: string) => {
    dispatch(setFilters({ planId: planId || undefined, page: 1 }))
  }

  const handleStatusFilter = (status: string) => {
    if (status === 'all') {
      dispatch(setFilters({ status: undefined, page: 1 }))
    } else {
      dispatch(setFilters({ status, page: 1 }))
    }
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
        'File No',
        'Barcode',
        'Member',
        'Project',
        'Plot',
        'Total Amount',
        'Down Payment',
        'Payment Mode',
        'Status',
        'Booking Date',
        'Created Date'
      ],
      ...(data?.items || []).map(item => [
        item.fileRegNo,
        item.fileBarCode,
        item.member?.memName ?? 'Unknown',
        item.project?.projName ?? '-',
        item.plot?.plotNo ?? '-',
        item.totalAmount,
        item.downPayment,
        item.paymentMode,
        item.status,
        new Date(item.bookingDate).toLocaleDateString(),
        new Date(item.createdAt).toLocaleDateString()
      ])
    ]

    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `files-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const planOptions = (plansData?.items || []).map(p => ({
    label: `${p.planName} (${p.totalMonths} mo)`,
    value: p.id || p._id
  }))

  const tableConfig = {
    columns: fileColumns,
    filters: [
      {
        id: 'planId',
        label: 'Installment Plan',
        type: 'select' as const,
        options: [
          { label: 'All Plans', value: '' },
          ...planOptions
        ],
        value: filters.planId || '',
        onChange: handlePlanFilter
      },
      {
        id: 'status',
        label: 'Status',
        type: 'select' as const,
        options: [
          { label: 'All Status', value: 'all' },
          { label: 'Active', value: 'Active' },
          { label: 'Pending', value: 'Pending' },
          { label: 'Cancelled', value: 'Cancelled' },
          { label: 'Closed', value: 'Closed' },
          { label: 'Transferred', value: 'Transferred' }
        ],
        onChange: handleStatusFilter
      },
      {
        id: 'fromDate',
        label: 'From Date',
        type: 'date' as const,
        placeholder: 'Start date',
        onChange: (value: string) => handleDateFilter('start', value)
      },
      {
        id: 'toDate',
        label: 'To Date',
        type: 'date' as const,
        placeholder: 'End date',
        onChange: (value: string) => handleDateFilter('end', value)
      },
      {
        id: 'sortBy',
        label: 'Sort By',
        type: 'select' as const,
        options: [
          { label: 'File No', value: 'fileRegNo' },
          { label: 'Booking Date', value: 'bookingDate' },
          { label: 'Total Amount', value: 'totalAmount' },
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
          handleSortChange(filters.sortBy || 'bookingDate', value)
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

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold'>Files</h1>
        <p className='text-muted-foreground'>
          Manage and track files in the system
        </p>
      </div>

      {/* Statistics Cards */}
      {summary && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-sm text-gray-500'>Total Files</div>
                  <div className='text-2xl font-bold'>{summary.totalFiles}</div>
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
                  <div className='text-sm text-gray-500'>Active Files</div>
                  <div className='text-2xl font-bold text-green-600'>
                    {summary.activeFiles}
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
                  <div className='text-sm text-gray-500'>Pending Files</div>
                  <div className='text-2xl font-bold text-yellow-600'>
                    {summary.pendingFiles}
                  </div>
                </div>
                <div className='p-3 bg-yellow-100 rounded-full'>
                  <TrendingUp className='h-6 w-6 text-yellow-600' />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-sm text-gray-500'>Total Revenue</div>
                  <div className='text-2xl font-bold text-purple-600'>
                    ${summary.totalRevenue.toLocaleString()}
                  </div>
                </div>
                <div className='p-3 bg-purple-100 rounded-full'>
                  <BarChart className='h-6 w-6 text-purple-600' />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Files */}
      {recentFiles && recentFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {recentFiles.map(file => (
                <div
                  key={file._id}
                  className='flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50'
                >
                  <div>
                    <div className='font-medium'>{file.fileRegNo}</div>
                    <div className='text-sm text-gray-500'>
                      {file.member?.memName ?? '—'} •
                    </div>
                  </div>
                  <Button
                    size='sm'
                    variant='ghost'
                    onClick={() => handleView(file._id)}
                  >
                    View
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
              Add File
            </Button>
          )
        }
      />

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Files</CardTitle>
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
