// src/app/(protected)/installment-plans/page.tsx
'use client'

import { ActionBar } from '@/components/shared/PageTemplate'
import { EnhancedDataTable as DataTable } from '@/components/shared/DataTable/DataTable'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { installmentPlanColumns } from '@/lib/constants/installmentPlanColumns.constants'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import { useActiveProjects } from '@/lib/hooks/entities/useProject'
import {
  useDeleteInstallmentPlan,
  useInstallmentPlanDashboardSummary,
  useInstallmentPlans,
} from '@/lib/hooks/entities/useInstallmentPlan'
import { useAuth } from '@/lib/hooks/useAuth'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import {
  resetFilters,
  setFilters,
} from '@/lib/store/slices/installmentPlanSlice'
import { formatCurrency } from '@/lib/utils/format'
import { BarChart3, Calendar, Plus, RefreshCw, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useConfirm } from "@/components/shared/ConfirmDialog";

export default function InstallmentPlansPage () {
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const router = useRouter()
  const { confirm } = useConfirm();

  const filters = useAppSelector(
    state => state.installmentPlans?.filters || {}
  )

  const { data: projects } = useActiveProjects()
  const { data, isLoading } = useInstallmentPlans(filters)
  const { data: dashboardSummary } = useInstallmentPlanDashboardSummary()
  const deleteMutation = useDeleteInstallmentPlan()

  const canCreate =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN])
  const canUpdate = canCreate
  const canDelete = canCreate

  const handleCreate = () => router.push('/installment-plans/create')

  const handleCreateInstallment = () => router.push('/installments/create')

  const handleEdit = (id: string) =>
    router.push(`/installment-plans/edit/${id}`)

  const handleView = (id: string) =>
    router.push(`/installment-plans/view/${id}`)

  const handleDelete = async (id: string) => {
    if (canDelete && await confirm({ title: "Delete", description: 'Are you sure you want to delete this plan?', variant: "destructive" })) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const handleSearch = (search: string) => {
    dispatch(setFilters({ search, page: 1 }))
  }

  const handleFilterChange = (newFilters: Record<string, unknown>) => {
    dispatch(setFilters({ ...newFilters, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    dispatch(setFilters({ page }))
  }

  const handleResetFilters = () => {
    dispatch(resetFilters())
  }

  const handleProjectFilter = (projectId: string) => {
    dispatch(setFilters({ projectId: projectId || undefined, page: 1 }))
  }

  const projectOptions = (projects || []).map(p => ({
    label: p.projName,
    value: p._id,
  }))

  const tableConfig = {
    columns: installmentPlanColumns,
    onRowClick: handleView,
    filters: [
      {
        id: 'projectId',
        label: 'Project',
        type: 'select' as const,
        options: [{ label: 'All Projects', value: '' }, ...projectOptions],
        value: filters.projectId || '',
        onChange: handleProjectFilter,
      },
      {
        id: 'isActive',
        label: 'Status',
        type: 'select' as const,
        options: [
          { label: 'All', value: '' },
          { label: 'Active', value: 'true' },
          { label: 'Inactive', value: 'false' },
        ],
        value: filters.isActive !== undefined ? String(filters.isActive) : '',
        onChange: (v: string) =>
          dispatch(
            setFilters({
              isActive: v === '' ? undefined : v === 'true',
              page: 1,
            })
          ),
      },
    ],
    actions: {
      onEdit: canUpdate ? handleEdit : undefined,
      onDelete: canDelete ? handleDelete : undefined,
    },
    enableActions: true,
    enableRowSelection: false,
    enableSorting: true,
    enablePagination: true,
    enableSearch: true,
    enableFilters: true,
    responsive: { showMobileView: true, stickyHeader: true },
    pagination: data?.pagination
      ? {
          currentPage: data.pagination.page,
          totalPages: data.pagination.pages,
          pageSize: data.pagination.limit,
          totalItems: data.pagination.total,
          onPageChange: handlePageChange,
          onPageSizeChange: (size: number) =>
            dispatch(setFilters({ limit: size, page: 1 })),
        }
      : undefined,
  }

  return (
    <div className='p-6 space-y-6'>
      <div>
        <h1 className='text-2xl font-bold'>Installment Plans</h1>
        <p className='text-muted-foreground mt-1'>
          Manage installment plans per project
        </p>
      </div>

      {/* Dashboard Summary */}
      {dashboardSummary && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-sm text-muted-foreground'>Total Plans</div>
                  <div className='text-2xl font-bold'>
                    {dashboardSummary.totalPlans}
                  </div>
                </div>
                <div className='p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full'>
                  <BarChart3 className='h-6 w-6 text-blue-600 dark:text-blue-400' />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-sm text-muted-foreground'>Active Plans</div>
                  <div className='text-2xl font-bold text-green-600 dark:text-green-400'>
                    {dashboardSummary.activePlans}
                  </div>
                </div>
                <div className='p-3 bg-green-100 dark:bg-green-900/30 rounded-full'>
                  <TrendingUp className='h-6 w-6 text-green-600 dark:text-green-400' />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-sm text-muted-foreground'>Avg Months</div>
                  <div className='text-2xl font-bold'>
                    {dashboardSummary.avgTotalMonths}
                  </div>
                </div>
                <div className='p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full'>
                  <Calendar className='h-6 w-6 text-orange-600 dark:text-orange-400' />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-sm text-muted-foreground'>Total Amount</div>
                  <div className='text-2xl font-bold text-green-600 dark:text-green-400'>
                    {formatCurrency(dashboardSummary.totalAmountAllPlans)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <ActionBar
        left={
          Object.keys(filters).length > 4 ? (
            <Button variant='glass' size='sm' onClick={handleResetFilters}>
              <RefreshCw className='size-4' />
              Reset Filters
            </Button>
          ) : null
        }
        right={
          canCreate && (
            <div className='flex gap-2'>
              <Button variant='secondary' size='sm' onClick={handleCreateInstallment}>
                <Plus className='size-4' />
                Create Bill/Installment
              </Button>
              <Button variant='primary' size='sm' onClick={handleCreate}>
                <Plus className='size-4' />
                Add Installment Plan
              </Button>
            </div>
          )
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>All Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={data?.items || []}
            config={tableConfig}
            isLoading={isLoading}
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
          />
        </CardContent>
      </Card>
    </div>
  )
}
