// src/app/(dashboard)/applications/page.tsx
'use client'

import { ActionBar } from '@/components/shared/PageTemplate'

import { EnhancedDataTable as DataTable } from '@/components/shared/DataTable/DataTable'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { applicationColumns } from '@/lib/constants/applicationColumns.constants'
import { UserRole, hasPermission } from '@/lib/constants/roles'
import {
  useApplicationSummary,
  useApplications,
  useDeleteApplication,
  useRecentApplications
} from '@/lib/hooks/entities/useApplication'
import { useAuth } from '@/lib/hooks/useAuth'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { resetFilters, setFilters } from '@/lib/store/slices/applicationSlice'
import {
  Download,
  FilePlus,
  List,
  Plus,
  RefreshCw,
  TrendingUp
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useConfirm } from "@/components/shared/ConfirmDialog";

export default function ApplicationsPage () {
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const router = useRouter()

  const filters = useAppSelector(state => state.applications?.filters || {})
  const [searchValue, setSearchValue] = useState('')
  const { confirm } = useConfirm();
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const { data, isLoading, refetch } = useApplications(filters)
  const { data: summary } = useApplicationSummary()
  const { data: recentApplications } = useRecentApplications(5)
  const deleteMutation = useDeleteApplication()

  const canCreate =
    user &&
    hasPermission(user.role as UserRole, [
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
      UserRole.MODERATOR
    ])
  const canUpdate =
    user &&
    hasPermission(user.role as UserRole, [
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
      UserRole.MODERATOR
    ])
  const canDelete =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

  const handleCreate = () => {
    router.push('/applications/create')
  }

  const handleEdit = (id: string) => {
    router.push(`/applications/edit/${id}`)
  }

  const handleView = (id: string) => {
    router.push(`/applications/view/${id}`)
  }

  const handleDelete = async (id: string) => {
    if (
      canDelete &&
      await confirm({ title: "Delete", description: 'Are you sure you want to delete this application?', variant: "destructive" })
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

  const handleDateFilter = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      dispatch(setFilters({ startDate: value || undefined, page: 1 }))
    } else {
      dispatch(setFilters({ endDate: value || undefined, page: 1 }))
    }
  }

  const handleTypeFilter = (typeId: string) => {
    if (typeId === 'all') {
      dispatch(setFilters({ applicationTypeID: undefined, page: 1 }))
    } else {
      dispatch(setFilters({ applicationTypeID: typeId, page: 1 }))
    }
  }

  const handleMemberFilter = (memId: string) => {
    if (memId === 'all') {
      dispatch(setFilters({ memId: undefined, page: 1 }))
    } else {
      dispatch(setFilters({ memId: memId, page: 1 }))
    }
  }

  const handleStatusFilter = (statusId: string) => {
    if (statusId === 'all') {
      dispatch(setFilters({ statusId: undefined, page: 1 }))
    } else {
      dispatch(setFilters({ statusId: statusId, page: 1 }))
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
        'Application No',
        'Application Type',
        'Member',
        'Plot',
        'Application Date',
        'Status',
        'Remarks',
        'Created Date'
      ],
      ...(data?.items || []).map(item => [
        item.applicationNo,
        typeof item.applicationTypeID === 'object'
          ? item.applicationTypeID.applicationName
          : 'Unknown',
        typeof item.memId === 'object' ? item.memId.memName : 'Unknown',
        typeof item.plotId === 'object' ? item.plotId.plotNo : '-',
        new Date(item.applicationDate).toLocaleDateString(),
        typeof item.statusId === 'object'
          ? item.statusId.statusName
          : 'Unknown',
        item.remarks || '',
        new Date(item.createdAt).toLocaleDateString()
      ])
    ]

    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `applications-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const tableConfig = {
    columns: applicationColumns,
    filters: [
      {
        id: 'type',
        label: 'Application Type',
        type: 'select' as const,
        options: [
          { label: 'Types', value: 'all' },
          ...(summary?.applicationsByType || []).map(type => ({
            label: type.typeName,
            value: type.typeName
          }))
        ],
        onChange: handleTypeFilter
      },
      {
        id: 'status',
        label: 'Status',
        type: 'select' as const,
        options: [
          // This would need to be populated from status API
          { label: 'Pending', value: 'pending' },
          { label: 'Approved', value: 'approved' },
          { label: 'Rejected', value: 'rejected' }
        ],
        onChange: handleStatusFilter
      },
      {
        id: 'startDate',
        label: 'From Date',
        type: 'date' as const,
        placeholder: 'Start date',
        onChange: (value: string) => handleDateFilter('start', value)
      },
      {
        id: 'endDate',
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
          { label: 'Application No', value: 'applicationNo' },
          { label: 'Application Date', value: 'applicationDate' },
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
          handleSortChange(filters.sortBy || 'applicationDate', value)
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
        <h1 className='text-2xl font-bold'>Applications</h1>
        <p className='text-muted-foreground'>
          Manage and track various applications in the system
        </p>
      </div>

      {/* Statistics Cards */}
      {summary && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-sm text-gray-500'>
                    Total Applications
                  </div>
                  <div className='text-2xl font-bold'>
                    {summary.totalApplications}
                  </div>
                </div>
                <div className='p-3 bg-blue-100 rounded-full'>
                  <List className='h-6 w-6 text-blue-600' />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-sm text-gray-500'>
                    Active Applications
                  </div>
                  <div className='text-2xl font-bold text-green-600'>
                    {summary.activeApplications}
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
                  <div className='text-sm text-gray-500'>Recent (30 days)</div>
                  <div className='text-2xl font-bold text-orange-600'>
                    {summary.recentApplications}
                  </div>
                </div>
                <div className='p-3 bg-orange-100 rounded-full'>
                  <TrendingUp className='h-6 w-6 text-orange-600' />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-sm text-gray-500'>Types Used</div>
                  <div className='text-2xl font-bold text-purple-600'>
                    {summary.applicationsByType.length}
                  </div>
                </div>
                <div className='p-3 bg-purple-100 rounded-full'>
                  <FilePlus className='h-6 w-6 text-purple-600' />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Applications */}
      {recentApplications && recentApplications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {recentApplications.map(app => (
                <div
                  key={app._id}
                  className='flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50'
                >
                  <div>
                    <div className='font-medium'>{app.applicationNo}</div>
                    <div className='text-sm text-gray-500'>
                      {typeof app.applicationTypeID === 'object' &&
                        app.applicationTypeID.applicationName}{' '}
                      • {typeof app.memId === 'object' && app.memId.memName}
                    </div>
                  </div>
                  <Button
                    size='sm'
                    variant='ghost'
                    onClick={() => handleView(app._id)}
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
              Add Application
            </Button>
          )
        }
      />

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Applications</CardTitle>
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
