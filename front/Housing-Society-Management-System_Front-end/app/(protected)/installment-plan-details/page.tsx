// src/app/(protected)/installment-plan-details/page.tsx
'use client'

import { ActionBar } from '@/components/shared/PageTemplate'
import { EnhancedDataTable as DataTable } from '@/components/shared/DataTable/DataTable'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { installmentPlanDetailColumns } from '@/lib/constants/installmentPlanDetailColumns.constants'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import { useInstallmentCategories } from '@/lib/hooks/entities/useInstallmentCategory'
import {
  useDeleteInstallmentPlanDetail,
  useInstallmentPlanDetails,
  useInstallmentPlanDetailSummary,
} from '@/lib/hooks/entities/useInstallmentPlanDetail'
import { useInstallmentPlans } from '@/lib/hooks/entities/useInstallmentPlan'
import { useAuth } from '@/lib/hooks/useAuth'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import {
  resetFilters,
  setFilters,
} from '@/lib/store/slices/installmentPlanDetailSlice'
import { formatCurrency } from '@/lib/utils/format'
import { BarChart3, Percent, Plus, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useConfirm } from "@/components/shared/ConfirmDialog";

export default function InstallmentPlanDetailsPage() {
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const router = useRouter()
  const { confirm } = useConfirm();

  const filters = useAppSelector(
    (state) => state.installmentPlanDetails?.filters || {}
  )

  const { data: plans } = useInstallmentPlans({ limit: 100 })
  const { data: categories } = useInstallmentCategories({ limit: 100 })
  const { data, isLoading } = useInstallmentPlanDetails(filters)
  const { data: summary } = useInstallmentPlanDetailSummary()
  const deleteMutation = useDeleteInstallmentPlanDetail()

  const canCreate =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN])
  const canUpdate = canCreate
  const canDelete = canCreate

  const handleCreate = () => router.push('/installment-plan-details/create')

  const handleEdit = (id: string) =>
    router.push(`/installment-plan-details/edit/${id}`)

  const handleView = (id: string) =>
    router.push(`/installment-plan-details/view/${id}`)

  const handleDelete = async (id: string) => {
    if (
      canDelete &&
      await confirm({ title: "Delete", description: 'Are you sure you want to delete this plan detail?', variant: "destructive" })
    ) {
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

  const handlePlanFilter = (planId: string) => {
    dispatch(setFilters({ planId: planId || undefined, page: 1 }))
  }

  const handleCategoryFilter = (instCatId: string) => {
    dispatch(setFilters({ instCatId: instCatId || undefined, page: 1 }))
  }

  const handleOccurrenceFilter = (occurrence: string) => {
    const num = occurrence ? parseInt(occurrence, 10) : undefined
    dispatch(setFilters({ occurrence: num, page: 1 }))
  }

  const planOptions = (plans?.items || []).map((p) => ({
    label: p.planName,
    value: p._id,
  }))

  const categoryOptions = (categories?.items || []).map((c) => ({
    label: c.instCatName,
    value: c._id,
  }))

  const tableConfig = {
    columns: installmentPlanDetailColumns,
    onRowClick: handleView,
    filters: [
      {
        id: 'planId',
        label: 'Plan',
        type: 'select' as const,
        options: [{ label: 'All Plans', value: '' }, ...planOptions],
        value: filters.planId || '',
        onChange: handlePlanFilter,
      },
      {
        id: 'instCatId',
        label: 'Category',
        type: 'select' as const,
        options: [{ label: 'All Categories', value: '' }, ...categoryOptions],
        value: filters.instCatId || '',
        onChange: handleCategoryFilter,
      },
      {
        id: 'occurrence',
        label: 'Occurrence',
        type: 'select' as const,
        options: [
          { label: 'All', value: '' },
          ...Array.from({ length: 24 }, (_, i) => ({
            label: String(i + 1),
            value: String(i + 1),
          })),
        ],
        value: filters.occurrence !== undefined ? String(filters.occurrence) : '',
        onChange: handleOccurrenceFilter,
      },
    ],
    actions: {
      onEdit: canUpdate ? handleEdit : undefined,
      onDelete: canDelete ? handleDelete : undefined,
    },
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
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Installment Plan Details
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage plan breakdown by category and occurrence
        </p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">
                    Total Details
                  </div>
                  <div className="text-2xl font-bold">
                    {summary.totalDetails}
                  </div>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">
                    Total % Sum
                  </div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {summary.totalPercentageSum}%
                  </div>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <Percent className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">
                    Total Fixed Sum
                  </div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(summary.totalFixedSum)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">
                    Plans with Details
                  </div>
                  <div className="text-2xl font-bold">
                    {summary.byPlan?.length ?? 0}
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
            <Button variant="glass" size="sm" onClick={handleResetFilters}>
              <RefreshCw className="size-4" />
              Reset Filters
            </Button>
          ) : null
        }
        right={
          canCreate && (
            <Button variant="primary" size="sm" onClick={handleCreate}>
              <Plus className="size-4" />
              Add Installment Plan Detail
            </Button>
          )
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>All Plan Details</CardTitle>
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
