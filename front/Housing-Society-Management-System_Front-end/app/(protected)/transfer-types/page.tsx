// src/app/(dashboard)/transfer-types/page.tsx
'use client'

import { ActionBar } from '@/components/shared/PageTemplate'
import { EnhancedDataTable as DataTable } from '@/components/shared/DataTable/DataTable'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import { transferTypeColumns } from '@/lib/constants/transferTypeColumns.constants'
import {
  useCommonTransferTypes,
  useDeleteTransferType,
  useTransferTypes,
  useTransferTypeStatistics,
  useTransferTypeSummary
} from '@/lib/hooks/entities/useTransferType'
import { useAuth } from '@/lib/hooks/useAuth'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { resetFilters, setFilters } from '@/lib/store/slices/transferTypeSlice'
import {
  BarChart,
  Calculator,
  Download,
  List,
  Percent,
  Plus,
  RefreshCw,
  TrendingUp
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { customToast } from "@/lib/utils/customToast"
import { useConfirm } from "@/components/shared/ConfirmDialog";

export default function TransferTypesPage () {
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const router = useRouter()

  const filters = useAppSelector(state => state.transferTypes?.filters || {})
  const [searchValue, setSearchValue] = useState('')
  const { confirm } = useConfirm();
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const { data, isLoading, refetch } = useTransferTypes(filters)
  const { data: summary } = useTransferTypeSummary()
  const { data: statistics } = useTransferTypeStatistics()
  const { data: commonTypes } = useCommonTransferTypes()

  const deleteMutation = useDeleteTransferType()

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
    router.push('/transfer-types/create')
  }

  const handleEdit = (id: string) => {
    router.push(`/transfer-types/edit/${id}`)
  }

  const handleView = (id: string) => {
    router.push(`/transfer-types/view/${id}`)
  }

  const handleCalculateFee = (id: string) => {
    router.push(`/transfer-types/calculate/${id}`)
  }

  const handleDelete = async (id: string) => {
    if (
      canDelete &&
      await confirm({ title: "Delete", description: 'Are you sure you want to delete this transfer type?', variant: "destructive" })
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

  const handleFeeFilter = (type: 'min' | 'max', value: string) => {
    const numValue = value ? parseFloat(value) : undefined
    if (type === 'min') {
      dispatch(setFilters({ minFee: numValue, page: 1 }))
    } else {
      dispatch(setFilters({ maxFee: numValue, page: 1 }))
    }
  }

  const handleStatusFilter = (status: string) => {
    if (status === 'all') {
      dispatch(setFilters({ isActive: undefined, page: 1 }))
    } else {
      dispatch(setFilters({ isActive: status === 'active', page: 1 }))
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
        'Transfer Type',
        'Description',
        'Fee (Rs)',
        'Status',
        'Created Date',
        'Transfers Count'
      ],
      ...(data?.items || []).map(item => [
        item.typeName,
        item.description || '',
        item.transferFee.toLocaleString(),
        item.isActive ? 'Active' : 'Inactive',
        new Date(item.createdAt).toLocaleDateString(),
        item.transferCount || 0
      ])
    ]

    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transfer-types-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const tableConfig = {
    columns: transferTypeColumns,
    filters: [
      {
        id: 'status',
        label: 'Status',
        type: 'select' as const,
        options: [
          { label: 'Status', value: 'all' },
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' }
        ],
        onChange: handleStatusFilter
      },
      {
        id: 'minFee',
        label: 'Min Fee',
        type: 'number' as const,
        placeholder: 'Minimum fee',
        onChange: (value: string) => handleFeeFilter('min', value)
      },
      {
        id: 'maxFee',
        label: 'Max Fee',
        type: 'number' as const,
        placeholder: 'Maximum fee',
        onChange: (value: string) => handleFeeFilter('max', value)
      },
      {
        id: 'sortBy',
        label: 'Sort By',
        type: 'select' as const,
        options: [
          { label: 'Type Name', value: 'typeName' },
          { label: 'Fee', value: 'transferFee' },
          { label: 'Created Date', value: 'createdAt' },
          { label: 'Updated Date', value: 'updatedAt' }
        ],
        onChange: (value: string) =>
          handleSortChange(value, filters.sortOrder || 'asc')
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
          handleSortChange(filters.sortBy || 'typeName', value)
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
        },
        {
          label: 'Calculate Fee',
          icon: <Calculator className='h-4 w-4' />,
          onClick: (row: any) => handleCalculateFee(row._id),
          variant: 'outline' as const,
          showIf: (row: any) => row.isActive && !row.isDeleted
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
        <h1 className='text-2xl font-bold'>Transfer Types</h1>
        <p className='text-muted-foreground'>
          Manage property transfer types and their associated fees
        </p>
      </div>

      {/* Statistics Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <div className='text-sm text-gray-500'>
                  Total Transfer Types
                </div>
                <div className='text-2xl font-bold'>
                  {summary?.totalTypes || 0}
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
                <div className='text-sm text-gray-500'>Active Types</div>
                <div className='text-2xl font-bold text-green-600'>
                  {summary?.activeTypes || 0}
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
                <div className='text-sm text-gray-500'>Total Transfers</div>
                <div className='text-2xl font-bold text-orange-600'>
                  {statistics?.totalTransfers || 0}
                </div>
              </div>
              <div className='p-3 bg-orange-100 rounded-full'>
                <BarChart className='h-6 w-6 text-orange-600' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <div className='text-sm text-gray-500'>Revenue Generated</div>
                <div className='text-2xl font-bold text-purple-600'>
                  Rs. {statistics?.totalFeeGenerated?.toLocaleString() || '0'}
                </div>
              </div>
              <div className='p-3 bg-purple-100 rounded-full'>
                <Percent className='h-6 w-6 text-purple-600' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Common Transfer Types */}
      {commonTypes && commonTypes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Common Transfer Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {commonTypes.slice(0, 6).map((type, index) => (
                <Card key={index} className='border'>
                  <CardContent className='pt-4'>
                    <div className='flex justify-between items-start mb-2'>
                      <h3 className='font-semibold'>{type.name}</h3>
                      <Badge variant='outline' className='bg-blue-50'>
                        Rs. {type.typicalFee.toLocaleString()}
                      </Badge>
                    </div>
                    <p className='text-sm text-gray-600 mb-3'>
                      {type.description}
                    </p>
                    <div className='text-xs text-gray-500'>
                      <div className='font-medium mb-1'>
                        Required Documents:
                      </div>
                      <ul className='space-y-1'>
                        {type.requiresDocuments.slice(0, 3).map((doc, i) => (
                          <li key={i} className='truncate'>
                            • {doc}
                          </li>
                        ))}
                        {type.requiresDocuments.length > 3 && (
                          <li className='text-blue-600'>
                            +{type.requiresDocuments.length - 3} more
                          </li>
                        )}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
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
              <div className='flex gap-2 items-center'>
                <span className='text-xs text-muted-foreground'>
                  {selectedIds.length} selected
                </span>
                <Button
                  variant='glass'
                  size='sm'
                  onClick={() => customToast.info('Bulk actions coming soon')}
                >
                  Bulk Actions
                </Button>
              </div>
            )}
            <Button variant='glass' size='sm' onClick={handleExportReport}>
              <Download className='size-4' />
              Export Report
            </Button>
          </>
        }
        right={
          <>
            {canCreate && (
              <Button variant='primary' size='sm' onClick={handleCreate}>
                <Plus className='size-4' />
                Add Transfer Type
              </Button>
            )}
            {canUpdate && (
              <Button
                variant='glass'
                size='sm'
                onClick={() => router.push('/transfer-types/update-fees')}
              >
                <Percent className='size-4' />
                Update Fees
              </Button>
            )}
          </>
        }
      />

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transfer Types</CardTitle>
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
