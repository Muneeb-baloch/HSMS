// src/app/(dashboard)/plots/page.tsx
'use client'

import { EnhancedDataTable as DataTable } from '@/components/shared/DataTable/DataTable'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { plotColumns } from '@/lib/constants/plotcolum.constants'
import { UserRole, hasPermission } from '@/lib/constants/roles'
import {
  useDeletePlot,
  useMarkPossessionReady,
  usePlotStatistics,
  usePlots
} from '@/lib/hooks/entities/usePlot'
import { useAuth } from '@/lib/hooks/useAuth'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { setFilters } from '@/lib/store/slices/plotSlice'
import { PlotType } from '@/lib/types/plot'
import { customToast } from '@/lib/utils/customToast'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useConfirm } from "@/components/shared/ConfirmDialog";

export default function PlotsPage () {
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const router = useRouter()

  const filters = useAppSelector(state => state.plots?.filters || {})
  const [searchValue, setSearchValue] = useState('')
  const { confirm } = useConfirm();

  const { data, isLoading, refetch } = usePlots(filters)
  const { data: statistics } = usePlotStatistics(filters.projectId)
  const deleteMutation = useDeletePlot()
  const markPossessionMutation = useMarkPossessionReady()

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
    router.push('/plots/create')
  }

  const handleEdit = (id: string) => {
    router.push(`/plots/edit/${id}`)
  }

  const handleView = (id: string) => {
    router.push(`/plots/view/${id}`)
  }

  const handleDelete = async (id: string) => {
    if (
      canDelete &&
      await confirm({ title: "Delete", description: 'Are you sure you want to delete this plot? This action cannot be undone.', variant: "destructive" })
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

  const handleAssignPlot = (row: any) => {
    router.push(`/plots/assign/${row._id}`)
  }

  const handleMarkPossessionReady = async (row: any) => {
    if (await confirm({ title: "Confirm", description: 'Mark this plot as possession ready?' })) {
      try {
        await markPossessionMutation.mutateAsync(row._id)
      } catch (error) {
        // Error toast is handled by the mutation's onError
      }
    }
  }

  const tableConfig = {
    columns: plotColumns,
    filters: [
      {
        id: 'projectId',
        label: 'Project',
        type: 'relationship' as const,
        placeholder: 'Select project',
        relationship: {
          endpoint: '/projects',
          labelField: 'projName',
          valueField: '_id',
          searchable: true
        }
      },
      {
        id: 'plotBlockId',
        label: 'Block',
        type: 'relationship' as const,
        placeholder: 'Select block',
        relationship: {
          endpoint: '/plotblocks',
          labelField: 'plotBlockName',
          valueField: '_id',
          searchable: true
        }
      },
      {
        id: 'plotType',
        label: 'Plot Type',
        type: 'select' as const,
        options: [
          { label: 'Residential', value: PlotType.RESIDENTIAL },
          { label: 'Commercial', value: PlotType.COMMERCIAL },
          { label: 'Industrial', value: PlotType.INDUSTRIAL },
          { label: 'Agricultural', value: PlotType.AGRICULTURAL },
          { label: 'Corner', value: PlotType.CORNER },
          { label: 'Park Facing', value: PlotType.PARK_FACING },
          { label: 'Main Boulevard', value: PlotType.MAIN_BOULEVARD },
          { label: 'Standard', value: PlotType.STANDARD }
        ]
      },
      {
        id: 'isAvailable',
        label: 'Availability',
        type: 'select' as const,
        options: [
          { label: 'Available', value: 'true' },
          { label: 'Sold/Assigned', value: 'false' }
        ]
      },
      {
        id: 'isPossessionReady',
        label: 'Possession Ready',
        type: 'select' as const,
        options: [
          { label: 'Ready', value: 'true' },
          { label: 'Not Ready', value: 'false' }
        ]
      },
      {
        id: 'sortBy',
        label: 'Sort By',
        type: 'select' as const,
        options: [
          { label: 'Plot Number', value: 'plotNo' },
          { label: 'Registration No.', value: 'plotRegistrationNo' },
          { label: 'Price', value: 'plotTotalAmount' },
          { label: 'Area', value: 'plotArea' },
          { label: 'Created Date', value: 'createdAt' }
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
          label: 'Assign to Customer',
          icon: <span>👤</span>,
          onClick: (row: any) => handleAssignPlot(row),
          variant: 'secondary' as const,
          showWhen: (row: any) => !row.fileId && canUpdate
        },
        {
          label: 'Mark Possession Ready',
          icon: <span>✅</span>,
          onClick: (row: any) => handleMarkPossessionReady(row),
          variant: 'secondary' as const,
          showWhen: (row: any) =>
            !row.isPossessionReady && row.fileId && canUpdate
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
    <>
      <div>
        <h1 className='text-2xl font-bold'>Plots</h1>
        <p className='text-muted-foreground'>
          Manage plots, assignments, and possession status
        </p>
      </div>

      <div className='flex justify-around flex-col gap-5  w-full mb-6'>
        {/* Statistics Cards */}
        {(statistics || data?.summary) && (
          <div className='flex gap-8 '>
            <Card
              className='w-56
'
            >
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium text-muted-foreground'>
                  Total Plots
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {statistics?.total || data?.summary?.totalPlots || 0}
                </div>
              </CardContent>
            </Card>
            <Card
              className='w-56

'
            >
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium text-muted-foreground'>
                  Available
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold text-green-600'>
                  {statistics?.available || data?.summary?.availablePlots || 0}
                </div>
              </CardContent>
            </Card>
            <Card
              className='w-56

'
            >
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium text-muted-foreground'>
                  Sold
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold text-blue-600'>
                  {statistics?.sold || data?.summary?.soldPlots || 0}
                </div>
              </CardContent>
            </Card>
            <Card
              className='w-56

'
            >
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium text-muted-foreground'>
                  Total Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-xl font-bold'>
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'PKR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(
                    statistics?.totalValue || data?.summary?.totalValue || 0
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Create Button */}
        {canCreate && (
          <div className='w-full flex gap-2 justify-between'>
            <div className="flex gap-2">
              <Button
                variant='outline'
                onClick={() => router.push('/plots/statistics')}
              >
                Statistics
              </Button>
              <Button
                variant='outline'
                onClick={() => router.push('/plots/map')}
              >
                Map View
              </Button>
            </div>
            <div>
              <Button onClick={handleCreate}>
                <Plus className='mr-2 h-4 w-4' />
                Add Plot
              </Button>
            </div>
          </div>
        )}
      </div>

      <DataTable
        data={data?.items || []}
        config={tableConfig}
        isLoading={isLoading}
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
      />
    </>
  )
}
