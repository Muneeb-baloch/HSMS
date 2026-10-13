// src/app/(dashboard)/plotcategories/page.tsx
'use client'

import { ActionBar } from '@/components/shared/PageTemplate'
import { SummaryCard } from '@/components/shared/SummaryCard'
import { EnhancedDataTable as DataTable } from '@/components/shared/DataTable/DataTable'
import { Button } from '@/components/ui/button'
import { plotCategoryColumns } from '@/lib/constants/plotcategorycolum.constants'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import {
  useDeletePlotCategory,
  usePlotCategories,
  useToggleCategoryStatus
} from '@/lib/hooks/entities/usePlotCategory'
import { useAuth } from '@/lib/hooks/useAuth'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { setFilters } from '@/lib/store/slices/plotcategorySlice'
import { Folder, Plus, Ruler } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useConfirm } from "@/components/shared/ConfirmDialog";

export default function PlotCategoriesPage () {
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const router = useRouter()

  const filters = useAppSelector(state => state.plotCategories?.filters || {})
  const [searchValue, setSearchValue] = useState('')
  const { confirm } = useConfirm();

  const { data, isLoading, refetch } = usePlotCategories(filters)
  const deleteMutation = useDeletePlotCategory()
  const toggleStatusMutation = useToggleCategoryStatus()

  const canCreate =
    user &&
    hasPermission(
      user.role as UserRole,
      [UserRole.ADMIN, UserRole.SUPER_ADMIN] as UserRole[]
    )

  const canUpdate =
    user &&
    hasPermission(
      user.role as UserRole,
      [UserRole.ADMIN, UserRole.SUPER_ADMIN] as UserRole[]
    )

  const canDelete =
    user &&
    hasPermission(
      user.role as UserRole,
      [UserRole.ADMIN, UserRole.SUPER_ADMIN] as UserRole[]
    )

  useEffect(() => {
    refetch()
  }, [filters, refetch])

  const handleCreate = () => {
    router.push('/plotcategories/create')
  }

  const handleEdit = (id: string) => {
    router.push(`/plotcategories/edit/${id}`)
  }

  const handleView = (id: string) => {
    router.push(`/plotcategories/view/${id}`)
  }

  const handleDelete = async (id: string) => {
    if (
      canDelete &&
      await confirm({ title: "Delete", description: 'Are you sure you want to delete this plot category?', variant: "destructive" })
    ) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const handleToggleStatus = async (id: string) => {
    if (canUpdate) {
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

  const handlePageChange = (page: number) => {
    dispatch(setFilters({ page }))
  }

  const tableConfig = {
    columns: plotCategoryColumns,
    filters: [
      {
        id: 'isActive',
        label: 'Status',
        type: 'select' as const,
        options: [

          { label: 'Active', value: 'true' },
          { label: 'Inactive', value: 'false' }
        ]
      },
      {
        id: 'surchargeType',
        label: 'Surcharge Type',
        type: 'select' as const,
        options: [

          { label: 'Percentage', value: 'percentage' },
          { label: 'Fixed', value: 'fixed' },
          { label: 'None', value: 'none' }
        ]
      },
      {
        id: 'sortBy',
        label: 'Sort By',
        type: 'select' as const,
        options: [
          { label: 'Name', value: 'categoryName' },
          { label: 'Created Date', value: 'createdAt' },
          { label: 'Updated Date', value: 'updatedAt' }
        ]
      },
      {
        id: 'sortOrder',
        label: 'Order',
        type: 'select' as const,
        options: [
          { label: 'Ascending', value: 'asc' },
          { label: 'Descending', value: 'desc' }
        ]
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
          label: 'Toggle Status',
          icon: <span>🔄</span>,
          onClick: (row: any) => handleToggleStatus(row._id),
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

  const total = data?.items?.length ?? data?.pagination?.total ?? 0

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-foreground'>Plot Categories</h1>
        <p className='mt-1 text-muted-foreground'>
          Manage plot categories and their surcharges
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <SummaryCard
          title='Total Categories'
          value={total}
          icon={Folder}
          iconBgClassName='bg-blue-500/20'
          iconClassName='text-blue-400'
          gradient='from-blue-500/10 to-transparent'
        />
      </div>

      <ActionBar
        left={
          <Button
            variant='glass'
            size='sm'
            onClick={() => router.push('/plotcategories/calculator')}
          >
            <Ruler className='size-4' />
            Price Calculator
          </Button>
        }
        right={
          canCreate && (
            <Button variant='primary' size='sm' onClick={handleCreate}>
              <Plus className='size-4' />
              Add Category
            </Button>
          )
        }
      />

      <DataTable
        data={data?.items || []}
        config={tableConfig}
        isLoading={isLoading}
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
      />
    </div>
  )
}
