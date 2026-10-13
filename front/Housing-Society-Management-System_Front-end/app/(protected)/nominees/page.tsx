// src/app/(dashboard)/nominees/page.tsx
'use client'

import { ActionBar } from '@/components/shared/PageTemplate'
import { EnhancedDataTable as DataTable } from '@/components/shared/DataTable/DataTable'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { nomineeColumns } from '@/lib/constants/nomineeColumns.constants'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import {
  useBulkUpdateStatus,
  useDeleteNominee,
  useNominees,
  useNomineeStatistics,
  useNomineeSummary,
  useToggleNomineeStatus
} from '@/lib/hooks/entities/useNominee'
import { useAuth } from '@/lib/hooks/useAuth'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { resetFilters, setFilters } from '@/lib/store/slices/nomineeSlice'
import { Nominee, RelationType } from '@/lib/types/nominee'
import {
  Download,
  PieChart,
  Plus,
  RefreshCw,
  TrendingUp,
  Users
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { customToast } from "@/lib/utils/customToast"
import { useConfirm } from "@/components/shared/ConfirmDialog";

export default function NomineesPage () {
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const router = useRouter()

  const filters = useAppSelector(state => state.nominees?.filters || {})
  const [searchValue, setSearchValue] = useState('')
  const { confirm } = useConfirm();
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const { data, isLoading, refetch } = useNominees(filters)
  const { data: statistics } = useNomineeStatistics()
  const { data: summary } = useNomineeSummary()

  const deleteMutation = useDeleteNominee()
  const toggleStatusMutation = useToggleNomineeStatus()
  const bulkUpdateMutation = useBulkUpdateStatus()

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
    router.push('/nominees/create')
  }

  const handleEdit = (id: string) => {
    router.push(`/nominees/edit/${id}`)
  }

  const handleView = (id: string) => {
    router.push(`/nominees/view/${id}`)
  }

  const handleDelete = async (id: string) => {
    if (canDelete && await confirm({ title: "Delete", description: 'Are you sure you want to delete this nominee?', variant: "destructive" })) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    if (
      canUpdate &&
      await confirm({ title: "Deactivate", description: `Are you sure you want to ${
          isActive ? 'activate' : 'deactivate'
        } this nominee?` })
    ) {
      await toggleStatusMutation.mutateAsync({ id, isActive: !isActive })
    }
  }

  const handleSearch = (search: string) => {
    setSearchValue(search)
    dispatch(setFilters({ search, page: 1 }))
  }

  const handleFilterChange = (newFilters: Record<string, unknown>) => {
    dispatch(setFilters({ ...newFilters, page: 1 }))
  }

  const handleStatusFilter = (status: string) => {
    if (status === 'all') {
      dispatch(setFilters({ isActive: undefined, page: 1 }))
    } else if (status === 'active') {
      dispatch(setFilters({ isActive: true, page: 1 }))
    } else {
      dispatch(setFilters({ isActive: false, page: 1 }))
    }
  }

  const handleRelationFilter = (relation: string) => {
    if (relation === 'all') {
      dispatch(setFilters({ relationWithMember: undefined, page: 1 }))
    } else {
      dispatch(
        setFilters({ relationWithMember: relation as RelationType, page: 1 })
      )
    }
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

  const handleBulkStatusUpdate = async (isActive: boolean) => {
    if (selectedIds.length === 0) {
      customToast.error('Please select nominees to update')
      return
    }

    if (
      await confirm({ title: "Deactivate", description: `${isActive ? 'Activate' : 'Deactivate'} ${
          selectedIds.length
        } nominees?` })
    ) {
      try {
        await bulkUpdateMutation.mutateAsync({
          nomineeIds: selectedIds,
          isActive
        })
        setSelectedIds([])
      } catch (error) {
        customToast.error('Failed to update status')
      }
    }
  }

  const handleExportReport = () => {
    const csvData = [
      [
        'Nominee Name',
        'CNIC',
        'Member',
        'Relation',
        'Contact',
        'Email',
        'Share %',
        'Status',
        'Created Date'
      ],
      ...(data?.items || []).map(item => [
        item.nomineeName,
        item.nomineeCNIC,
        typeof item.memId === 'object' ? item.memId.memName : 'Member',
        item.relationWithMember,
        item.nomineeContact,
        item.nomineeEmail || '',
        item.nomineeSharePercentage.toString(),
        item.isActive ? 'Active' : 'Inactive',
        new Date(item.createdAt).toLocaleDateString()
      ])
    ]

    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nominees-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const tableConfig = {
    columns: nomineeColumns,
    filters: [
      {
        id: 'status',
        label: 'Status',
        type: 'select' as const,
        options: [
          { label: 'Active Only', value: 'active' },
          { label: 'Inactive Only', value: 'inactive' }
        ],
        onChange: handleStatusFilter
      },
      {
        id: 'relation',
        label: 'Relation',
        type: 'select' as const,
        options: [
          { label: ' Relations', value: 'all' },
          ...Object.values(RelationType).map(relation => ({
            label: relation,
            value: relation
          }))
        ],
        onChange: handleRelationFilter
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
          onClick: (row: Nominee) => handleView(row._id),
          variant: 'outline' as const
        },
        {
          label: (row: Nominee) => (row.isActive ? 'Deactivate' : 'Activate'),
          icon: (row: Nominee) => <span>{row.isActive ? '❌' : '✅'}</span>,
          onClick: (row: Nominee) => handleToggleStatus(row._id, row.isActive),
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
        <h1 className='text-2xl font-bold'>Nominees</h1>
        <p className='text-muted-foreground'>
          Manage member nominees and their share distribution
        </p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-sm text-gray-500'>Total Nominees</div>
                  <div className='text-2xl font-bold'>
                    {statistics.totalNominees}
                  </div>
                </div>
                <div className='p-3 bg-blue-100 rounded-full'>
                  <Users className='h-6 w-6 text-blue-600' />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-sm text-gray-500'>Active Nominees</div>
                  <div className='text-2xl font-bold text-green-600'>
                    {statistics.activeNominees}
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
                  <div className='text-sm text-gray-500'>Primary Nominees</div>
                  <div className='text-2xl font-bold text-orange-600'>
                    {summary?.primaryNominees || 0}
                  </div>
                </div>
                <div className='p-3 bg-orange-100 rounded-full'>
                  <PieChart className='h-6 w-6 text-orange-600' />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-sm text-gray-500'>Average Share</div>
                  <div className='text-2xl font-bold text-purple-600'>
                    {statistics.averageSharePercentage.toFixed(1)}%
                  </div>
                </div>
                <div className='p-3 bg-purple-100 rounded-full'>
                  <PieChart className='h-6 w-6 text-purple-600' />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
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
              <div className='flex gap-2 items-center'>
                <span className='text-xs text-muted-foreground'>
                  {selectedIds.length} selected
                </span>
                <Button
                  variant='glass'
                  size='sm'
                  onClick={() => handleBulkStatusUpdate(true)}
                  disabled={bulkUpdateMutation.isPending}
                >
                  Activate
                </Button>
                <Button
                  variant='glass'
                  size='sm'
                  onClick={() => handleBulkStatusUpdate(false)}
                  disabled={bulkUpdateMutation.isPending}
                >
                  Deactivate
                </Button>
              </div>
            )}
            <Button variant='glass' size='sm' onClick={handleExportReport}>
              <Download className='size-4' />
              Export Report
            </Button>
            <Button
              variant='glass'
              size='sm'
              onClick={() => router.push('/nominees/statistics')}
            >
              <PieChart className='size-4' />
              View Statistics
            </Button>
          </>
        }
        right={
          canCreate && (
            <Button variant='primary' size='sm' onClick={handleCreate}>
              <Plus className='size-4' />
              Add Nominee
            </Button>
          )
        }
      />

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Nominees</CardTitle>
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
