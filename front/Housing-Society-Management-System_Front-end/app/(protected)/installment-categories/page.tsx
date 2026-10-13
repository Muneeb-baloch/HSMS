// src/app/(dashboard)/installment-categories/page.tsx
'use client'

import { ActionBar } from '@/components/shared/PageTemplate'
import { SummaryCard } from '@/components/shared/SummaryCard'
import { EnhancedDataTable as DataTable } from '@/components/shared/DataTable/DataTable'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { installmentCategoryColumns } from '@/lib/constants/installmentCategoryColumns.constants'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import {
    useDeleteInstallmentCategory,
    useInstallmentCategories,
    useInstallmentCategoryStatistics,
    useSeedDefaultCategories,
    useToggleInstallmentCategoryStatus
} from '@/lib/hooks/entities/useInstallmentCategory'
import { useAuth } from '@/lib/hooks/useAuth'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import {
    resetFilters,
    setFilters
} from '@/lib/store/slices/installmentCategorySlice'
import { BarChart3, Database, Leaf, Plus, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useConfirm } from "@/components/shared/ConfirmDialog";

export default function InstallmentCategoriesPage () {
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const router = useRouter()

  const filters = useAppSelector(
    state => state.installmentCategories?.filters || {}
  )
  const [searchValue, setSearchValue] = useState('')
  const { confirm } = useConfirm();
  const [refundableFilter, setRefundableFilter] = useState<string>('')
  const [mandatoryFilter, setMandatoryFilter] = useState<string>('')
  const [activeFilter, setActiveFilter] = useState<string>('true')

  const { data, isLoading, refetch } = useInstallmentCategories(filters)
  const { data: statistics, refetch: refetchStats } =
    useInstallmentCategoryStatistics()
  const deleteMutation = useDeleteInstallmentCategory()
  const toggleStatusMutation = useToggleInstallmentCategoryStatus()
  const seedMutation = useSeedDefaultCategories()

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
    router.push('/installment-categories/create')
  }

  const handleEdit = (id: string) => {
    router.push(`/installment-categories/edit/${id}`)
  }

  const handleView = (id: string) => {
    router.push(`/installment-categories/view/${id}`)
  }

  const handleDelete = async (id: string) => {
    if (
      canDelete &&
      await confirm({ title: "Delete", description: 'Are you sure you want to delete this category?', variant: "destructive" })
    ) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    if (
      canUpdate &&
      await confirm({ title: "Deactivate", description: `Are you sure you want to ${
          isActive ? 'deactivate' : 'activate'
        } this category?` })
    ) {
      await toggleStatusMutation.mutateAsync({ id, isActive: !isActive })
    }
  }

  const handleSeedDefault = async () => {
    if (
      await confirm({ title: "Confirm", description: 'This will create default categories. Existing inactive categories will be updated. Continue?' })
    ) {
      await seedMutation.mutateAsync()
    }
  }

  const handleSearch = (search: string) => {
    setSearchValue(search)
    dispatch(setFilters({ search, page: 1 }))
  }

  const handleRefundableFilter = (value: string) => {
    setRefundableFilter(value)
    if (value === 'true') {
      dispatch(setFilters({ isRefundable: true, page: 1 }))
    } else if (value === 'false') {
      dispatch(setFilters({ isRefundable: false, page: 1 }))
    } else {
      dispatch(setFilters({ isRefundable: undefined, page: 1 }))
    }
  }

  const handleMandatoryFilter = (value: string) => {
    setMandatoryFilter(value)
    if (value === 'true') {
      dispatch(setFilters({ isMandatory: true, page: 1 }))
    } else if (value === 'false') {
      dispatch(setFilters({ isMandatory: false, page: 1 }))
    } else {
      dispatch(setFilters({ isMandatory: undefined, page: 1 }))
    }
  }

  const handleActiveFilter = (value: string) => {
    setActiveFilter(value)
    if (value === 'true') {
      dispatch(setFilters({ isActive: true, page: 1 }))
    } else if (value === 'false') {
      dispatch(setFilters({ isActive: false, page: 1 }))
    } else {
      dispatch(setFilters({ isActive: undefined, page: 1 }))
    }
  }

  const handlePageChange = (page: number) => {
    dispatch(setFilters({ page }))
  }

  const handleResetFilters = () => {
    dispatch(resetFilters())
    setSearchValue('')
    setRefundableFilter('')
    setMandatoryFilter('')
    setActiveFilter('true')
  }

  const handleSortChange = (sortBy: string, sortOrder: "asc" | "desc") => {
    dispatch(setFilters({ sortBy, sortOrder }))
  }

  const tableConfig = {
    columns: installmentCategoryColumns,
    filters: [
      {
        id: 'search',
        label: 'Search',
        type: 'text' as const,
        placeholder: 'Search categories...'
      },
      {
        id: 'isRefundable',
        label: 'Refundable',
        type: 'select' as const,
        options: [

          { label: 'Refundable', value: 'true' },
          { label: 'Non-Refundable', value: 'false' }
        ],
        value: refundableFilter,
        onChange: handleRefundableFilter
      },
      {
        id: 'isMandatory',
        label: 'Mandatory',
        type: 'select' as const,
        options: [

          { label: 'Mandatory', value: 'true' },
          { label: 'Optional', value: 'false' }
        ],
        value: mandatoryFilter,
        onChange: handleMandatoryFilter
      },
      {
        id: 'isActive',
        label: 'Status',
        type: 'select' as const,
        options: [

          { label: 'Active', value: 'true' },
          { label: 'Inactive', value: 'false' }
        ],
        value: activeFilter,
        onChange: handleActiveFilter
      },
      {
        id: 'sortBy',
        label: 'Sort By',
        type: 'select' as const,
        options: [
          { label: 'Sequence', value: 'sequenceOrder' },
          { label: 'Name', value: 'instCatName' },
          { label: 'Created Date', value: 'createdAt' }
        ],
        onChange: (value: string) =>
          handleSortChange(value, filters.sortOrder || 'asc')
      },
      {
        id: 'sortOrder',
        label: 'Order',
        type: 'select' as const,
        options: [
          { label: 'Ascending', value: 'asc' },
          { label: 'Descending', value: 'desc' }
        ],
        onChange: (value: string) =>
          handleSortChange(filters.sortBy || 'sequenceOrder', value as "asc" | "desc")
      }
    ],
    enableActions: true,
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
          label: (row: any) => (row.isActive ? 'Deactivate' : 'Activate'),
          icon: (row: any) => <span>{row.isActive ? '❌' : '✅'}</span>,
          onClick: (row: any) => handleToggleStatus(row._id, row.isActive),
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
        <h1 className='text-2xl font-bold'>Installment Categories</h1>
        <p className='text-muted-foreground'>
          Manage payment categories for installment plans
        </p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-sm text-gray-500'>Total Categories</div>
                  <div className='text-2xl font-bold'>
                    {statistics.totalCategories}
                  </div>
                </div>
                <div className='p-3 bg-blue-100 rounded-full'>
                  <Database className='h-6 w-6 text-blue-600' />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-sm text-gray-500'>Active Categories</div>
                  <div className='text-2xl font-bold'>
                    {statistics.activeCategories}
                  </div>
                </div>
                <div className='p-3 bg-green-100 rounded-full'>
                  <BarChart3 className='h-6 w-6 text-green-600' />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-sm text-gray-500'>
                    Mandatory Categories
                  </div>
                  <div className='text-2xl font-bold'>
                    {statistics.mandatoryCategories}
                  </div>
                </div>
                <div className='p-3 bg-orange-100 rounded-full'>
                  <Database className='h-6 w-6 text-orange-600' />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-sm text-gray-500'>
                    Refundable Categories
                  </div>
                  <div className='text-2xl font-bold'>
                    {statistics.refundableCategories}
                  </div>
                </div>
                <div className='p-3 bg-purple-100 rounded-full'>
                  <Database className='h-6 w-6 text-purple-600' />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <ActionBar
        left={
          <>
            {Object.keys(filters).length > 5 && (
              <Button variant='glass' size='sm' onClick={handleResetFilters}>
                <RefreshCw className='size-4' />
                Reset Filters
              </Button>
            )}
            <Button
              variant='glass'
              size='sm'
              onClick={handleSeedDefault}
              disabled={seedMutation.isPending}
            >
              <Leaf className='size-4' />
              Seed Default
            </Button>
          </>
        }
        right={
          canCreate && (
            <Button
              variant='primary'
              size='sm'
              onClick={handleCreate}
              disabled={isLoading}
            >
              <Plus className='size-4' />
              Add Category
            </Button>
          )
        }
      />

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Installment Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={data?.items || []}
            config={tableConfig}
            isLoading={isLoading}
            onSearch={handleSearch}
          />
        </CardContent>
      </Card>
    </div>
  )
}
