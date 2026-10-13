// src/app/(dashboard)/plotblocks/page.tsx
'use client'

import { ActionBar } from '@/components/shared/PageTemplate'
import { SummaryCard } from '@/components/shared/SummaryCard'
import { EnhancedDataTable as DataTable } from '@/components/shared/DataTable/DataTable'
import { Button } from '@/components/ui/button'
import { plotBlockColumns } from '@/lib/constants/plotblockcolum.constants'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import {
  useDeletePlotBlock,
  usePlotBlocks
} from '@/lib/hooks/entities/usePlotBlock'
import { useProjects } from '@/lib/hooks/entities/useProject'
import { useAuth } from '@/lib/hooks/useAuth'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { setFilters } from '@/lib/store/slices/plotblockSlice'
import { LayoutGrid, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useMemo } from 'react'
import { useConfirm } from "@/components/shared/ConfirmDialog";

export default function PlotBlocksPage () {
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const router = useRouter()

  const filters = useAppSelector(state => state.plotBlocks?.filters || {})
  const [searchValue, setSearchValue] = useState('')
  const { confirm } = useConfirm();

  const { data: projectsData } = useProjects({ limit: 100 })
  const projectOptions = useMemo(() =>
    projectsData?.items?.map(p => ({ label: p.projName, value: p._id })) || [],
    [projectsData?.items]
  )

  const { data, isLoading, refetch } = usePlotBlocks(filters)
  const deleteMutation = useDeletePlotBlock()

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
    router.push('/plotblocks/create')
  }

  const handleEdit = (id: string) => {
    router.push(`/plotblocks/edit/${id}`)
  }

  const handleView = (id: string) => {
    router.push(`/plotblocks/view/${id}`)
  }

  const handleDelete = async (id: string) => {
    if (
      canDelete &&
      await confirm({ title: "Delete", description: 'Are you sure you want to delete this plot block?', variant: "destructive" })
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

  const tableConfig = {
    columns: plotBlockColumns,
    filters: [
      {
        id: 'projectId',
        label: 'Project',
        type: 'select' as const,
        options: projectOptions,
        placeholder: 'Filter by project'
      },
      {
        id: 'sortBy',
        label: 'Sort By',
        type: 'select' as const,
        options: [
          { label: 'Name', value: 'plotBlockName' },
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
        <h1 className='text-2xl font-bold text-foreground'>Plot Blocks</h1>
        <p className='mt-1 text-muted-foreground'>
          Manage plot blocks and their information
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <SummaryCard
          title='Total Blocks'
          value={total}
          icon={LayoutGrid}
          iconBgClassName='bg-blue-500/20'
          iconClassName='text-blue-400'
          gradient='from-blue-500/10 to-transparent'
        />
      </div>

      <ActionBar
        right={
          canCreate && (
            <Button variant='primary' size='sm' onClick={handleCreate}>
              <Plus className='size-4' />
              Add Plot Block
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
