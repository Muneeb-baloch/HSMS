// src/app/(dashboard)/complain-categories/page.tsx
'use client'

import { ActionBar } from '@/components/shared/PageTemplate'
import { SummaryCard } from '@/components/shared/SummaryCard'
import { EnhancedDataTable as DataTable } from '@/components/shared/DataTable/DataTable'
import { Button } from '@/components/ui/button'
import { complaintCategoryColumns } from '@/lib/constants/complaintCategoryColumns.constants'
import { hasPermission, UserRole as UserRoleEnum } from '@/lib/constants/roles'
import {
  useBulkUpdateCategoryStatus,
  useDeleteSrComplaintCategory,
  useSrComplaintCategories,
  useToggleCategoryStatus
} from '@/lib/hooks/entities/useSrComplaintCategory'
import { useAuth } from '@/lib/hooks/useAuth'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { setFilters } from '@/lib/store/slices/complaintCategorySlice'
import { SrComplaintCategoryType } from '@/lib/types/srComplaintCategory'
import {
  AlertTriangle,
  ArrowUpDown,
  BarChart3,
  Download,
  FileUp,
  Filter,
  Plus,
  RefreshCw,
  ShieldAlert,
  Trash2,
  Upload
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useConfirm } from "@/components/shared/ConfirmDialog";

export default function ComplaintCategoriesPage () {
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const router = useRouter()

  const filters = useAppSelector(
    state => state.complaintCategories?.filters || {}
  )
  const [searchValue, setSearchValue] = useState('')
  const { confirm, alert } = useConfirm();
  const [selectedRows, setSelectedRows] = useState<string[]>([])

  const { data, isLoading, refetch } = useSrComplaintCategories(filters)
  const deleteMutation = useDeleteSrComplaintCategory()
  const toggleStatusMutation = useToggleCategoryStatus()
  const bulkUpdateMutation = useBulkUpdateCategoryStatus()

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
    router.push('/complain-categories/create')
  }

  const handleEdit = (id: string) => {
    router.push(`/complain-categories/edit/${id}`)
  }

  const handleView = (id: string) => {
    router.push(`/complain-categories/view/${id}`)
  }

  const handleDelete = async (id: string) => {
    if (
      canDelete &&
      await confirm({ title: "Delete", description: 'Are you sure you want to delete this complaint category?', variant: "destructive" })
    ) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const handleToggleStatus = async (id: string) => {
    if (
      canUpdate &&
      await confirm({ title: "Confirm", description: 'Are you sure you want to toggle the status of this complaint category?' })
    ) {
      await toggleStatusMutation.mutateAsync(id)
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

  const handlePriorityFilter = (minPriority: string) => {
    if (minPriority) {
      const min = parseInt(minPriority)
      dispatch(setFilters({ minPriority: min, maxPriority: 10, page: 1 }))
    } else {
      const { minPriority: _, maxPriority: __, ...rest } = filters
      dispatch(setFilters({ ...rest, page: 1 }))
    }
  }

  const handleSlaFilter = (maxSla: string) => {
    if (maxSla) {
      const max = parseInt(maxSla)
      dispatch(setFilters({ maxSlaHours: max, page: 1 }))
    } else {
      const { maxSlaHours: _, ...rest } = filters
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
        sortBy: 'priorityLevel',
        sortOrder: 'asc'
      })
    )
    setSearchValue('')
    setSelectedRows([])
  }

  const handleBulkActivate = async () => {
    if (selectedRows.length === 0) {
      await alert({ description: 'Please select categories to activate' })
      return
    }

    if (await confirm({ title: "Activate", description: `Activate ${selectedRows.length} selected categories?` })) {
      try {
        await bulkUpdateMutation.mutateAsync({
          categoryIds: selectedRows,
          isActive: true
        })
        setSelectedRows([])
      } catch (error) {
        console.error('Failed to activate categories:', error)
      }
    }
  }

  const handleBulkDeactivate = async () => {
    if (selectedRows.length === 0) {
      await alert({ description: 'Please select categories to deactivate' })
      return
    }

    if (await confirm({ title: "Deactivate", description: `Deactivate ${selectedRows.length} selected categories?` })) {
      try {
        await bulkUpdateMutation.mutateAsync({
          categoryIds: selectedRows,
          isActive: false
        })
        setSelectedRows([])
      } catch (error) {
        console.error('Failed to deactivate categories:', error)
      }
    }
  }

  const handleRowSelection = (rows: SrComplaintCategoryType[]) => {
    setSelectedRows(rows.map(row => row._id))
  }

  const handleImport = () => {
    router.push('/complain-categories/import')
  }

  const handleExport = async () => {
    // Implement export functionality
    await alert({ description: 'Export functionality coming soon' })
  }

  const getPriorityColor = (priority: number) => {
    if (priority <= 3) return 'text-red-600 bg-red-50'
    if (priority <= 6) return 'text-yellow-600 bg-yellow-50'
    return 'text-green-600 bg-green-50'
  }

  const getSlaColor = (slaHours?: number) => {
    if (!slaHours) return 'text-gray-600 bg-gray-50'
    if (slaHours <= 24) return 'text-red-600 bg-red-50'
    if (slaHours <= 48) return 'text-orange-600 bg-orange-50'
    return 'text-blue-600 bg-blue-50'
  }

  const tableConfig = {
    columns: complaintCategoryColumns,
    filters: [
      {
        id: 'isActive',
        label: 'Status',
        type: 'select' as const,
        options: [
          { label: 'Active Only', value: 'true' },
          { label: 'Inactive Only', value: 'false' }
        ],
        onChange: handleActiveFilter
      },
      {
        id: 'priority',
        label: 'Priority Level',
        type: 'select' as const,
        options: [
          { label: 'Critical (1-3)', value: '3' },
          { label: 'Medium (4-6)', value: '6' },
          { label: 'Low (7-10)', value: '10' }
        ],
        onChange: handlePriorityFilter
      },
      {
        id: 'sla',
        label: 'SLA Hours',
        type: 'select' as const,
        options: [
          { label: 'Urgent (<24h)', value: '24' },
          { label: 'Standard (<72h)', value: '72' },
          { label: 'Extended (>72h)', value: '1000' }
        ],
        onChange: handleSlaFilter
      },
      {
        id: 'sortBy',
        label: 'Sort By',
        type: 'select' as const,
        options: [
          { label: 'Priority', value: 'priorityLevel' },
          { label: 'Category Name', value: 'categoryName' },
          { label: 'SLA Hours', value: 'slaHours' },
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
          { label: 'Ascending', value: 'asc' },
          { label: 'Descending', value: 'desc' }
        ],
        onChange: (value: 'asc' | 'desc') =>
          dispatch(setFilters({ sortOrder: value, page: 1 }))
      }
    ],
    enableActions: true,
    enableSelection: !!canUpdate,
    onRowSelection: handleRowSelection,
    actions: {
      onEdit: canUpdate ? handleEdit : undefined,
      onDelete: canDelete ? handleDelete : undefined,
      customActions: [
        {
          label: 'View Details',
          icon: <span>👁️</span>,
          onClick: (row: SrComplaintCategoryType) => handleView(row._id),
          variant: 'outline' as const
        },
        {
          label: 'Toggle Status',
          icon: <span>🔄</span>,
          onClick: (row: SrComplaintCategoryType) =>
            handleToggleStatus(row._id),
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
        <h1 className='text-2xl font-bold text-foreground'>
          Complaint Categories
        </h1>
        <p className='mt-1 text-muted-foreground'>
          Manage and categorize complaint types with priorities and SLAs
        </p>
      </div>

      {data?.summary && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <SummaryCard
            title='Total Categories'
            value={data.summary.totalCategories}
            icon={FileUp}
            iconBgClassName='bg-blue-500/20'
            iconClassName='text-blue-400'
            gradient='from-blue-500/10 to-transparent'
          />
          <SummaryCard
            title='Active Categories'
            value={data.summary.activeCategories}
            icon={ShieldAlert}
            iconBgClassName='bg-emerald-500/20'
            iconClassName='text-emerald-400'
            gradient='from-emerald-500/10 to-transparent'
          />
          <SummaryCard
            title='Critical Priority'
            value={
              (data.summary.byPriority[1] || 0) +
              (data.summary.byPriority[2] || 0) +
              (data.summary.byPriority[3] || 0)
            }
            icon={AlertTriangle}
            iconBgClassName='bg-red-500/20'
            iconClassName='text-red-400'
            gradient='from-red-500/10 to-transparent'
          />
          <SummaryCard
            title='Avg. SLA (h)'
            value={Math.round(
              data.complaintCategories.reduce(
                (acc: number, cat: { slaHours?: number }) =>
                  acc + (cat.slaHours || 0),
                0
              ) / (data.complaintCategories.length || 1)
            )}
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
              onClick={() => router.push('/complain-categories/statistics')}
            >
              <BarChart3 className='size-4' />
              Statistics
            </Button>
            <Button
              variant='glass'
              size='sm'
              onClick={() =>
                router.push('/complain-categories/priority-analysis')
              }
            >
              <ArrowUpDown className='size-4' />
              Priority Analysis
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
                  <ShieldAlert className='size-4' />
                  Activate
                </Button>
                <Button
                  variant='glass'
                  size='sm'
                  onClick={handleBulkDeactivate}
                  disabled={bulkUpdateMutation.isPending}
                >
                  <Filter className='size-4' />
                  Deactivate
                </Button>
                <Button
                  variant='glass'
                  size='sm'
                  onClick={async () => {
                    if (
                      await confirm({ title: "Delete", description: `Delete ${selectedRows.length} selected categories?`, variant: "destructive" })
                    ) {
                      // TODO: implement bulk delete
                    }
                  }}
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
          <>
            <Button variant='glass' size='sm' onClick={handleImport}>
              <Upload className='size-4' />
              Import
            </Button>
            <Button variant='glass' size='sm' onClick={handleExport}>
              <Download className='size-4' />
              Export
            </Button>
            {canCreate && (
              <Button variant='primary' size='sm' onClick={handleCreate}>
                <Plus className='size-4' />
                Add Category
              </Button>
            )}
          </>
        }
      />

      <div>
        {/* Priority Distribution */}
        {data?.summary?.byPriority && (
          <div className='mb-6'>
            <h3 className='text-lg font-medium mb-3'>Priority Distribution</h3>
            <div className='grid grid-cols-5 gap-2'>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(priority => {
                const count = data.summary.byPriority[priority] || 0
                const percentage = (count / data.summary.totalCategories) * 100
                const priorityLabels = [
                  'C1',
                  'C2',
                  'C3',
                  'H4',
                  'H5',
                  'M6',
                  'M7',
                  'M8',
                  'L9',
                  'L10'
                ]
                const colors = [
                  'bg-red-500',
                  'bg-red-400',
                  'bg-red-300',
                  'bg-orange-500',
                  'bg-orange-400',
                  'bg-yellow-500',
                  'bg-yellow-400',
                  'bg-green-500',
                  'bg-green-400',
                  'bg-green-300'
                ]

                return (
                  <div key={priority} className='text-center'>
                    <div className='text-xs font-medium mb-1'>
                      {priorityLabels[priority - 1]}
                    </div>
                    <div className='h-2 bg-gray-200 rounded-full overflow-hidden'>
                      <div
                        className={`h-full ${colors[priority - 1]}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className='text-xs text-gray-500 mt-1'>{count}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <DataTable
          data={data?.complaintCategories || []}
          config={tableConfig}
          isLoading={isLoading}
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
        />
      </div>
    </div>
  )
}
