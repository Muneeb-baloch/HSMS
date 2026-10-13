// src/app/(dashboard)/plotsizes/page.tsx
'use client'

import { ActionBar } from '@/components/shared/PageTemplate'
import { SummaryCard } from '@/components/shared/SummaryCard'
import { EnhancedDataTable as DataTable } from '@/components/shared/DataTable/DataTable'
import { Button } from '@/components/ui/button'
import { plotSizeColumns } from '@/lib/constants/plotsizecolum.constants'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import {
  useDeletePlotSize,
  usePlotSizes
} from '@/lib/hooks/entities/usePlotSize'
import { useProjects } from '@/lib/hooks/entities/useProject'
import { useAuth } from '@/lib/hooks/useAuth'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { setFilters } from '@/lib/store/slices/plotsizeSlice'
import { Calculator, Plus, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useMemo } from 'react'
import { useConfirm } from "@/components/shared/ConfirmDialog";

export default function PlotSizesPage () {
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const router = useRouter()

  const filters = useAppSelector(state => state.plotSizes?.filters || {})
  const [searchValue, setSearchValue] = useState('')
  const { confirm } = useConfirm();

  const { data: projectsData } = useProjects({ limit: 100 })
  const projectOptions = useMemo(() =>
    projectsData?.items?.map(p => ({ label: p.projName, value: p._id })) || [],
    [projectsData?.items]
  )

  const { data, isLoading, refetch } = usePlotSizes(filters)
  const deleteMutation = useDeletePlotSize()

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
    router.push('/plotsizes/create')
  }

  const handleEdit = (id: string) => {
    router.push(`/plotsizes/edit/${id}`)
  }

  const handleView = (id: string) => {
    router.push(`/plotsizes/view/${id}`)
  }

  const handleDelete = async (id: string) => {
    if (
      canDelete &&
      await confirm({ title: "Delete", description: 'Are you sure you want to delete this plot size?', variant: "destructive" })
    ) {
      await deleteMutation.mutateAsync(id)
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

  const handleResetFilters = () => {
    dispatch(
      setFilters({
        page: 1,
        limit: 10,
        search: '',
        sortBy: 'totalArea',
        sortOrder: 'asc',
        minPrice: undefined,
        maxPrice: undefined,
        areaUnit: undefined,
        minArea: undefined,
        maxArea: undefined
      })
    )
    setSearchValue('')
  }

  const tableConfig = {
    columns: plotSizeColumns,
    filters: [
      {
        id: 'projectId',
        label: 'Project',
        type: 'select' as const,
        options: projectOptions,
        placeholder: 'Filter by project'
      },
      {
        id: 'areaUnit',
        label: 'Area Unit',
        type: 'select' as const,
        options: [
          { label: 'Marla', value: 'marla' },
          { label: 'Square Feet', value: 'sqft' },
          { label: 'Square Meter', value: 'sqm' },
          { label: 'Acre', value: 'acre' },
          { label: 'Hectare', value: 'hectare' },
          { label: 'Kanal', value: 'kanal' }
        ]
      },
      {
        id: 'minPrice',
        label: 'Min Price',
        type: 'text' as const,
        placeholder: 'Min price'
      },
      {
        id: 'maxPrice',
        label: 'Max Price',
        type: 'text' as const,
        placeholder: 'Max price'
      },
      {
        id: 'minArea',
        label: 'Min Area',
        type: 'text' as const,
        placeholder: 'Min area'
      },
      {
        id: 'maxArea',
        label: 'Max Area',
        type: 'text' as const,
        placeholder: 'Max area'
      },
      {
        id: 'sortBy',
        label: 'Sort By',
        type: 'select' as const,
        options: [
          { label: 'Total Area', value: 'totalArea' },
          { label: 'Price', value: 'standardBasePrice' },
          { label: 'Name', value: 'plotSizeName' },
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
          label: 'Price Breakdown',
          icon: <span>💰</span>,
          onClick: (row: any) => router.push(`/plotsizes/breakdown/${row._id}`),
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

  const summary = data?.summary

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-foreground'>Plot Sizes</h1>
        <p className='mt-1 text-muted-foreground'>
          Manage plot sizes, areas, and pricing
        </p>
      </div>

      {summary && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <SummaryCard
            title='Total Sizes'
            value={summary.totalSizes}
            icon={Calculator}
            iconBgClassName='bg-blue-500/20'
            iconClassName='text-blue-400'
            gradient='from-blue-500/10 to-transparent'
          />
          <SummaryCard
            title='Min Price'
            value={`PKR ${(summary.minPrice ?? 0).toLocaleString()}`}
            icon={Calculator}
            iconBgClassName='bg-emerald-500/20'
            iconClassName='text-emerald-400'
            gradient='from-emerald-500/10 to-transparent'
          />
          <SummaryCard
            title='Max Price'
            value={`PKR ${(summary.maxPrice ?? 0).toLocaleString()}`}
            icon={Calculator}
            iconBgClassName='bg-amber-500/20'
            iconClassName='text-amber-400'
            gradient='from-amber-500/10 to-transparent'
          />
          <SummaryCard
            title='Avg Price'
            value={`PKR ${(summary.averagePrice ?? 0).toLocaleString()}`}
            icon={Calculator}
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
              onClick={() => router.push('/plotsizes/calculator')}
            >
              <Calculator className='size-4' />
              Calculators
            </Button>
          </>
        }
        right={
          canCreate && (
            <Button variant='primary' size='sm' onClick={handleCreate}>
              <Plus className='size-4' />
              Add Plot Size
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
