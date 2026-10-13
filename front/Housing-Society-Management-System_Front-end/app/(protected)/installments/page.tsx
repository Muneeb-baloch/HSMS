// src/app/(dashboard)/installments/page.tsx
'use client'

import { EnhancedDataTable as DataTable } from '@/components/shared/DataTable/DataTable'
import { ActionBar } from '@/components/shared/PageTemplate'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { installmentColumns } from '@/lib/constants/installmentColumns.constants'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import {
  useBulkUpdateStatus,
  useDashboardSummary,
  useDeleteInstallment,
  useInstallments,
  useToggleInstallmentStatus
} from '@/lib/hooks/entities/useInstallment'
import { useAuth } from '@/lib/hooks/useAuth'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { resetFilters, setFilters } from '@/lib/store/slices/installmentSlice'
import {
  InstallmentStatus,
  InstallmentType,
  type Installment
} from '@/lib/types/installment'
import {
  BarChart3,
  Calendar,
  Download,
  FilePlus,
  Plus,
  RefreshCw,
  TrendingUp,
  Users
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { customToast } from "@/lib/utils/customToast"
import { useConfirm } from "@/components/shared/ConfirmDialog";
import { generateInstallmentInvoice } from "@/lib/utils/installmentPdf";

export default function InstallmentsPage () {
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const router = useRouter()

  const filters = useAppSelector(state => state.installments?.filters || {})
  const [searchValue, setSearchValue] = useState('')
  const { confirm } = useConfirm();
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const { data, isLoading, refetch } = useInstallments(filters)
  const { data: dashboardSummary } = useDashboardSummary()
  const deleteMutation = useDeleteInstallment()
  const toggleStatusMutation = useToggleInstallmentStatus()
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
    router.push('/installments/create')
  }

  const handleBulkCreate = () => {
    router.push('/installments/bulk-create')
  }

  const handleEdit = (id: string) => {
    router.push(`/installments/edit/${id}`)
  }

  const handleView = (id: string) => {
    router.push(`/installments/view/${id}`)
  }

  const handleRecordPayment = (id: string) => {
    router.push(`/installments/${id}/payment`)
  }

  const handleDownloadInvoice = (installment: Installment) => {
    try {
      generateInstallmentInvoice(installment)
      customToast.success('Invoice downloaded successfully')
    } catch (error) {
      customToast.error('Failed to download invoice')
    }
  }

  const handleDelete = async (id: string) => {
    if (
      canDelete &&
      await confirm({ title: "Delete", description: 'Are you sure you want to delete this installment?', variant: "destructive" })
    ) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const handleToggleStatus = async (id: string, status: string) => {
    if (canUpdate && await confirm({ title: "Confirm", description: `Are you sure you want to update the status?` })) {
      await toggleStatusMutation.mutateAsync({ id, status })
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
      dispatch(setFilters({ status: undefined, page: 1 }))
    } else {
      dispatch(setFilters({ status: status as InstallmentStatus, page: 1 }))
    }
  }

  const handleTypeFilter = (type: string) => {
    if (type === 'all') {
      dispatch(setFilters({ installmentType: undefined, page: 1 }))
    } else {
      dispatch(
        setFilters({ installmentType: type as InstallmentType, page: 1 })
      )
    }
  }

  const handleOverdueFilter = (overdue: string) => {
    if (overdue === 'all') {
      dispatch(setFilters({ overdue: undefined, page: 1 }))
    } else if (overdue === 'true') {
      dispatch(setFilters({ overdue: true, page: 1 }))
    } else {
      dispatch(setFilters({ overdue: false, page: 1 }))
    }
  }

  const handleDateFilter = (type: 'from' | 'to', value: string) => {
    if (type === 'from') {
      dispatch(setFilters({ fromDate: value || undefined, page: 1 }))
    } else {
      dispatch(setFilters({ toDate: value || undefined, page: 1 }))
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

  const handleBulkStatusUpdate = async (status: InstallmentStatus) => {
    if (selectedIds.length === 0) {
      customToast.error('Please select installments to update')
      return
    }

    if (await confirm({ title: "Confirm", description: `Update ${selectedIds.length} installments to ${status}?` })) {
      try {
        await bulkUpdateMutation.mutateAsync({
          installmentIds: selectedIds,
          status
        })
        setSelectedIds([])
      } catch (error) {
        customToast.error('Failed to update status')
      }
    }
  }

  const handleExportReport = () => {
    const startDate =
      filters.fromDate ||
      new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]
    const endDate = filters.toDate || new Date().toISOString().split('T')[0]

    const params = new URLSearchParams({
      startDate,
      endDate,
      ...(filters.fileId && { fileId: filters.fileId }),
      ...(filters.memId && { memId: filters.memId }),
      ...(filters.status && { status: filters.status })
    })

    router.push(`/installments/report?${params.toString()}`)
  }

  const tableConfig = {
    columns: installmentColumns,
    filters: [
      {
        id: 'status',
        label: 'Status',
        type: 'select' as const,
        options: [
          { label: 'Unpaid', value: 'Unpaid' },
          { label: 'Partially Paid', value: 'Partially Paid' },
          { label: 'Paid', value: 'Paid' },
          { label: 'Overdue', value: 'Overdue' },
          { label: 'Cancelled', value: 'Cancelled' }
        ],
        onChange: handleStatusFilter
      },
      {
        id: 'type',
        label: 'Type',
        type: 'select' as const,
        options: [
          { label: 'Monthly', value: 'Monthly' },
          { label: 'Quarterly', value: 'Quarterly' },
          { label: 'Half-Yearly', value: 'Half-Yearly' },
          { label: 'Yearly', value: 'Yearly' },
          { label: 'Balloon', value: 'Balloon' },
          { label: 'Down Payment', value: 'Down Payment' }
        ],
        onChange: handleTypeFilter
      },
      {
        id: 'overdue',
        label: 'Overdue',
        type: 'select' as const,
        options: [
          { label: 'Overdue Only', value: 'true' },
          { label: 'Not Overdue', value: 'false' }
        ],
        onChange: handleOverdueFilter
      },
      {
        id: 'fromDate',
        label: 'From Date',
        type: 'date' as const,
        placeholder: 'Start date',
        onChange: (value: string) => handleDateFilter('from', value)
      },
      {
        id: 'toDate',
        label: 'To Date',
        type: 'date' as const,
        placeholder: 'End date',
        onChange: (value: string) => handleDateFilter('to', value)
      }
    ],
    enableActions: true,
    enableSelection: true,
    actions: {
      onEdit: canUpdate ? handleEdit : undefined,
      onDelete: canDelete ? handleDelete : undefined,
      customActions: [
        {
          label: 'Download Invoice',
          icon: <Download className='h-4 w-4' />,
          onClick: (row: Installment) => handleDownloadInvoice(row),
          variant: 'outline' as const
        },
        {
          label: 'View Details',
          icon: <span>👁️</span>,
          onClick: (row: Installment) => handleView(row._id),
          variant: 'outline' as const
        },
        {
          label: 'Record Payment',
          icon: <span>💰</span>,
          onClick: (row: Installment) => handleRecordPayment(row._id),
          variant: 'outline' as const
        },
        {
          label: 'Toggle Paid Status',
          icon: <span>✅</span>,
          onClick: (row: Installment) =>
            handleToggleStatus(
              row._id,
              row.status === InstallmentStatus.PAID
                ? InstallmentStatus.UNPAID
                : InstallmentStatus.PAID
            ),
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
        <h1 className='text-2xl font-bold'>Installments</h1>
        <p className='text-muted-foreground'>
          Manage member installment payments and schedules
        </p>
      </div>

      {/* Dashboard Summary */}
      {dashboardSummary && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-sm text-gray-500'>Total Outstanding</div>
                  <div className='text-2xl font-bold text-red-600'>
                    Rs. {dashboardSummary.totalOutstanding.toLocaleString()}
                  </div>
                </div>
                <div className='p-3 bg-red-100 rounded-full'>
                  <TrendingUp className='h-6 w-6 text-red-600' />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-sm text-gray-500'>Paid Today</div>
                  <div className='text-2xl font-bold text-green-600'>
                    Rs. {dashboardSummary.totalPaidToday.toLocaleString()}
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
                  <div className='text-sm text-gray-500'>Due Today</div>
                  <div className='text-2xl font-bold text-orange-600'>
                    Rs. {dashboardSummary.totalDueToday.toLocaleString()}
                  </div>
                </div>
                <div className='p-3 bg-orange-100 rounded-full'>
                  <Calendar className='h-6 w-6 text-orange-600' />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-sm text-gray-500'>Total Overdue</div>
                  <div className='text-2xl font-bold text-red-600'>
                    Rs. {dashboardSummary.totalOverdue.toLocaleString()}
                  </div>
                </div>
                <div className='p-3 bg-red-100 rounded-full'>
                  <Users className='h-6 w-6 text-red-600' />
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
              <>
                <span className='text-xs text-muted-foreground self-center'>
                  {selectedIds.length} selected
                </span>
                <Button
                  variant='glass'
                  size='sm'
                  onClick={() => handleBulkStatusUpdate(InstallmentStatus.PAID)}
                  disabled={bulkUpdateMutation.isPending}
                >
                  Mark as Paid
                </Button>
                <Button
                  variant='glass'
                  size='sm'
                  onClick={() =>
                    handleBulkStatusUpdate(InstallmentStatus.CANCELLED)
                  }
                  disabled={bulkUpdateMutation.isPending}
                >
                  Cancel
                </Button>
              </>
            )}
            <Button variant='glass' size='sm' onClick={handleExportReport}>
              <Download className='size-4' />
              Export Report
            </Button>
          </>
        }
        right={
          canCreate && (
            <>
              <Button variant='primary' size='sm' onClick={handleCreate}>
                <Plus className='size-4' />
                Add Installment
              </Button>
              <Button variant='glass' size='sm' onClick={handleBulkCreate}>
                <FilePlus className='size-4' />
                Bulk Create
              </Button>
            </>
          )
        }
      />

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Installments</CardTitle>
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
