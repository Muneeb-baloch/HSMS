// src/app/(dashboard)/installments/page.tsx
'use client'

import { ActionBar } from '@/components/shared/PageTemplate'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Pagination } from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import {
  useBulkUpdateStatus,
  useDashboardSummary,
  useDeleteInstallment,
  useGroupedInstallments,
  useRecordPayment
} from '@/lib/hooks/entities/useInstallment'
import { useAuth } from '@/lib/hooks/useAuth'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { resetFilters, setFilters } from '@/lib/store/slices/installmentSlice'
import {
  Installment,
  InstallmentGroup,
  InstallmentStatus,
  InstallmentType,
  PaymentMode
} from '@/lib/types/installment'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import {
  BarChart3,
  Calendar,
  ChevronDown,
  ChevronRight,
  Download,
  FilePlus,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  TrendingUp,
  Users
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { customToast } from "@/lib/utils/customToast"
import { useConfirm } from "@/components/shared/ConfirmDialog";
import { generateInstallmentInvoice } from "@/lib/utils/installmentPdf";
import { ViewReceiptLink } from "@/components/shared/ViewReceiptLink";

const STATUS_LABELS: Record<string, string> = {
  [InstallmentStatus.UNPAID]: 'Unpaid',
  [InstallmentStatus.PARTIALLY_PAID]: 'Partially Paid',
  [InstallmentStatus.PAID]: 'Paid',
  [InstallmentStatus.OVERDUE]: 'Overdue',
  [InstallmentStatus.CANCELLED]: 'Cancelled',
  [InstallmentStatus.REFUNDED]: 'Refunded'
}

const STATUS_COLORS: Record<string, string> = {
  [InstallmentStatus.UNPAID]: 'bg-yellow-100 text-yellow-800',
  [InstallmentStatus.PARTIALLY_PAID]: 'bg-blue-100 text-blue-800',
  [InstallmentStatus.PAID]: 'bg-green-100 text-green-800',
  [InstallmentStatus.OVERDUE]: 'bg-red-100 text-red-800',
  [InstallmentStatus.CANCELLED]: 'bg-gray-100 text-gray-800',
  [InstallmentStatus.REFUNDED]: 'bg-purple-100 text-purple-800'
}

function statusSummaryText (group: InstallmentGroup): string {
  const parts: string[] = []
  const paid = group.statusCounts[InstallmentStatus.PAID] || 0
  const partial = group.statusCounts[InstallmentStatus.PARTIALLY_PAID] || 0
  const unpaid = group.statusCounts[InstallmentStatus.UNPAID] || 0
  if (paid) parts.push(`${paid} Paid`)
  if (partial) parts.push(`${partial} Partial`)
  if (unpaid) parts.push(`${unpaid} Unpaid`)
  return parts.join(' · ') || '—'
}

export default function InstallmentsPage () {
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const router = useRouter()

  const filters = useAppSelector(state => state.installments?.filters || {})
  const [searchValue, setSearchValue] = useState('')
  const { confirm } = useConfirm();
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [expandedFileIds, setExpandedFileIds] = useState<Set<string>>(new Set())

  const { data, isLoading } = useGroupedInstallments(filters)
  const { data: dashboardSummary } = useDashboardSummary()
  const deleteMutation = useDeleteInstallment()
  const recordPaymentMutation = useRecordPayment()
  const bulkUpdateMutation = useBulkUpdateStatus()

  const groups = data?.items || []

  // Groups only appear at all when they match an active search - auto-expand
  // all of them so the match is immediately visible, instead of making the
  // user re-expand every result by hand.
  useEffect(() => {
    if (filters.search) {
      setExpandedFileIds(new Set(groups.map(g => g.fileId)))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, data])

  const canCreate =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN])
  const canUpdate =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN])
  const canDelete =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

  const handleCreate = () => router.push('/installments/create')
  const handleBulkCreate = () => router.push('/installments/bulk-create')
  const handleGenerateFromPlan = () => router.push('/installments/generate-from-plan')
  const handleEdit = (id: string) => router.push(`/installments/edit/${id}`)
  const handleView = (id: string) => router.push(`/installments/view/${id}`)
  const handleRecordPayment = (id: string) => router.push(`/installments/${id}/payment`)

  const handleDownloadInvoice = (installment: Installment) => {
    try {
      generateInstallmentInvoice(installment)
      customToast.success('Invoice downloaded successfully')
    } catch {
      customToast.error('Failed to download invoice')
    }
  }

  const handleDelete = async (id: string) => {
    if (
      canDelete &&
      (await confirm({ title: "Delete", description: 'Are you sure you want to delete this installment?', variant: "destructive" }))
    ) {
      await deleteMutation.mutateAsync(id)
    }
  }

  // "Mark as Paid" records a real payment for the remaining balance (status is
  // derived from amountPaid — it is never set directly). For a partial payment
  // or a non-cash method, use "Record Payment" instead.
  const remainingBalance = (row: Installment) =>
    typeof row.balanceAmount === 'number'
      ? row.balanceAmount
      : (row.totalPayable ?? row.amountDue) - (row.amountPaid ?? 0)

  const handleMarkPaid = async (row: Installment) => {
    if (!canUpdate) return
    const balance = remainingBalance(row)
    if (balance <= 0) {
      customToast.error('This installment is already fully paid')
      return
    }
    if (
      await confirm({
        title: 'Mark as Paid',
        description: `Record a payment of Rs. ${balance.toLocaleString()} (today, Cash) for this installment? Use "Record Payment" for a partial amount or another method.`
      })
    ) {
      await recordPaymentMutation.mutateAsync({
        id: row._id,
        data: {
          amountPaid: balance,
          paidDate: new Date().toISOString(),
          paymentMode: PaymentMode.CASH
        }
      })
    }
  }

  const handleSearch = (search: string) => {
    setSearchValue(search)
    dispatch(setFilters({ search, page: 1 }))
  }

  const handleStatusFilter = (status: string) => {
    dispatch(setFilters({ status: status === 'all' ? undefined : (status as InstallmentStatus), page: 1 }))
  }

  const handleTypeFilter = (type: string) => {
    dispatch(setFilters({ installmentType: type === 'all' ? undefined : (type as InstallmentType), page: 1 }))
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

  const allRows = useMemo(
    () => groups.flatMap(g => g.installments),
    [groups]
  )

  const toggleGroup = (fileId: string) =>
    setExpandedFileIds(prev => {
      const next = new Set(prev)
      next.has(fileId) ? next.delete(fileId) : next.add(fileId)
      return next
    })

  const expandAll = () => setExpandedFileIds(new Set(groups.map(g => g.fileId)))
  const collapseAll = () => setExpandedFileIds(new Set())

  const toggleRowSelected = (id: string) =>
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )

  const handleBulkStatusUpdate = async (status: InstallmentStatus) => {
    if (selectedIds.length === 0) {
      customToast.error('Please select installments to update')
      return
    }
    if (await confirm({ title: "Confirm", description: `Update ${selectedIds.length} installments to ${status}?` })) {
      try {
        await bulkUpdateMutation.mutateAsync({ installmentIds: selectedIds, status })
        setSelectedIds([])
      } catch {
        customToast.error('Failed to update status')
      }
    }
  }

  const handleBulkMarkPaid = async () => {
    if (selectedIds.length === 0) {
      customToast.error('Please select installments to mark paid')
      return
    }
    const rows = allRows.filter(r => selectedIds.includes(r._id))
    const payable = rows.filter(r => remainingBalance(r) > 0)
    if (payable.length === 0) {
      customToast.error('All selected installments are already fully paid')
      return
    }
    if (
      await confirm({
        title: 'Mark as Paid',
        description: `Record a Cash payment (today) for the remaining balance of ${payable.length} installment(s)? Use "Record Payment" for partial amounts or other methods.`
      })
    ) {
      let ok = 0
      for (const r of payable) {
        try {
          await recordPaymentMutation.mutateAsync({
            id: r._id,
            data: {
              amountPaid: remainingBalance(r),
              paidDate: new Date().toISOString(),
              paymentMode: PaymentMode.CASH
            }
          })
          ok++
        } catch {
          /* per-row errors already surface via the mutation's onError toast */
        }
      }
      customToast.success(`Recorded payment on ${ok} of ${payable.length} installment(s)`)
      setSelectedIds([])
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
      ...(filters.status && { status: filters.status })
    })

    router.push(`/installments/report?${params.toString()}`)
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold'>Installments</h1>
        <p className='text-muted-foreground'>
          Manage member installment payments and schedules
        </p>
      </div>

      {/* Dashboard Summary - unaffected by grouping, always reflects the whole ledger */}
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
                  onClick={handleBulkMarkPaid}
                  disabled={recordPaymentMutation.isPending}
                >
                  Mark as Paid
                </Button>
                <Button
                  variant='glass'
                  size='sm'
                  onClick={() => handleBulkStatusUpdate(InstallmentStatus.CANCELLED)}
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
              <Button variant='glass' size='sm' onClick={handleGenerateFromPlan}>
                <Sparkles className='size-4' />
                Generate from Plan
              </Button>
            </>
          )
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Installments by File</CardTitle>
          <div className='flex flex-col sm:flex-row gap-3 pt-2'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search file no, member name, CNIC, plot no, or installment title...'
                value={searchValue}
                onChange={e => handleSearch(e.target.value)}
                className='pl-9'
              />
            </div>
            <Select
              value={filters.status || 'all'}
              onValueChange={handleStatusFilter}
            >
              <SelectTrigger className='w-full sm:w-[160px]'>
                <SelectValue placeholder='All Statuses' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Statuses</SelectItem>
                <SelectItem value='Unpaid'>Unpaid</SelectItem>
                <SelectItem value='Partially Paid'>Partially Paid</SelectItem>
                <SelectItem value='Paid'>Paid</SelectItem>
                <SelectItem value='Overdue'>Overdue</SelectItem>
                <SelectItem value='Cancelled'>Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.installmentType || 'all'}
              onValueChange={handleTypeFilter}
            >
              <SelectTrigger className='w-full sm:w-[160px]'>
                <SelectValue placeholder='All Types' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Types</SelectItem>
                <SelectItem value='Monthly'>Monthly</SelectItem>
                <SelectItem value='Quarterly'>Quarterly</SelectItem>
                <SelectItem value='Half-Yearly'>Half-Yearly</SelectItem>
                <SelectItem value='Yearly'>Yearly</SelectItem>
                <SelectItem value='Balloon'>Balloon</SelectItem>
                <SelectItem value='Down Payment'>Down Payment</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type='date'
              value={filters.fromDate || ''}
              onChange={e => handleDateFilter('from', e.target.value)}
              className='w-full sm:w-[150px]'
              title='From date'
            />
            <Input
              type='date'
              value={filters.toDate || ''}
              onChange={e => handleDateFilter('to', e.target.value)}
              className='w-full sm:w-[150px]'
              title='To date'
            />
          </div>
          <div className='flex gap-2 pt-2'>
            <Button variant='outline' size='sm' onClick={expandAll}>
              Expand All
            </Button>
            <Button variant='outline' size='sm' onClick={collapseAll}>
              Collapse All
            </Button>
          </div>
        </CardHeader>
        <CardContent className='space-y-3'>
          {isLoading ? (
            <p className='text-sm text-muted-foreground py-8 text-center'>
              Loading...
            </p>
          ) : groups.length === 0 ? (
            <p className='text-sm text-muted-foreground py-8 text-center'>
              No installments found.
            </p>
          ) : (
            groups.map(group => {
              const isExpanded = expandedFileIds.has(group.fileId)
              return (
                <div
                  key={group.fileId}
                  className='border rounded-lg overflow-hidden'
                >
                  <button
                    type='button'
                    onClick={() => toggleGroup(group.fileId)}
                    className='w-full flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-muted/40 hover:bg-muted/70 transition-colors text-left'
                  >
                    <div className='flex items-center gap-2 min-w-0'>
                      {isExpanded ? (
                        <ChevronDown className='h-4 w-4 shrink-0 text-muted-foreground' />
                      ) : (
                        <ChevronRight className='h-4 w-4 shrink-0 text-muted-foreground' />
                      )}
                      <div className='min-w-0'>
                        <div className='font-semibold truncate'>
                          {group.fileRegNo || '—'}
                          <span className='text-muted-foreground font-normal ml-2'>
                            {group.memberName || '—'}
                          </span>
                        </div>
                        <div className='text-xs text-muted-foreground'>
                          Plot: {group.plotNo || '—'} · {group.installmentCount} installment
                          {group.installmentCount !== 1 ? 's' : ''}
                          {' · '}
                          {statusSummaryText(group)}
                          {group.overdueCount > 0 && (
                            <span className='text-red-600 font-medium'>
                              {' '}· {group.overdueCount} overdue
                            </span>
                          )}
                          {group.nextDueDate && (
                            <span> · Next due: {formatDate(group.nextDueDate)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className='flex items-center gap-3 shrink-0 text-sm'>
                      <div className='text-right'>
                        <div className='text-xs text-muted-foreground'>Total Due</div>
                        <div className='font-medium'>{formatCurrency(group.totalDue)}</div>
                      </div>
                      <div className='text-right'>
                        <div className='text-xs text-muted-foreground'>Total Paid</div>
                        <div className='font-medium text-green-600'>
                          {formatCurrency(group.totalPaid)}
                        </div>
                      </div>
                      <div className='text-right'>
                        <div className='text-xs text-muted-foreground'>Balance</div>
                        <div
                          className={`font-medium ${group.balance > 0 ? 'text-red-600' : 'text-green-600'}`}
                        >
                          {formatCurrency(group.balance)}
                        </div>
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className='w-10' />
                          <TableHead>No.</TableHead>
                          <TableHead>Installment</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Amounts</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Paid Date</TableHead>
                          {(canUpdate || canDelete) && (
                            <TableHead className='text-right'>Actions</TableHead>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.installments.map(row => {
                          const startOfToday = new Date()
                          startOfToday.setHours(0, 0, 0, 0)
                          const dueDate = new Date(row.dueDate)
                          const isOverdue =
                            dueDate < startOfToday &&
                            row.status !== 'Paid' &&
                            row.status !== 'Cancelled'

                          return (
                            <TableRow key={row._id}>
                              <TableCell>
                                <Checkbox
                                  checked={selectedIds.includes(row._id)}
                                  onCheckedChange={() => toggleRowSelected(row._id)}
                                />
                              </TableCell>
                              <TableCell className='font-bold text-center'>
                                #{row.installmentNo}
                              </TableCell>
                              <TableCell>
                                <div className='font-semibold'>{row.installmentTitle}</div>
                                <div className='text-sm text-gray-500'>
                                  {typeof row.installmentCategory === 'object' &&
                                  row.installmentCategory
                                    ? row.installmentCategory.instCatName
                                    : 'Category'}
                                </div>
                              </TableCell>
                              <TableCell className={isOverdue ? 'text-red-600 font-medium' : ''}>
                                {formatDate(row.dueDate)}
                                {isOverdue && (
                                  <div className='text-xs text-red-500'>Overdue</div>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className='space-y-0.5 text-sm'>
                                  <div className='flex justify-between gap-2'>
                                    <span className='text-gray-500'>Due:</span>
                                    <span className='font-medium'>
                                      {formatCurrency(row.amountDue)}
                                    </span>
                                  </div>
                                  <div className='flex justify-between gap-2'>
                                    <span className='text-gray-500'>Paid:</span>
                                    <span className='font-medium text-green-600'>
                                      {formatCurrency(row.amountPaid)}
                                    </span>
                                  </div>
                                  <div className='flex justify-between gap-2'>
                                    <span className='text-gray-500'>Balance:</span>
                                    <span
                                      className={`font-medium ${
                                        row.balanceAmount > 0 ? 'text-red-600' : 'text-green-600'
                                      }`}
                                    >
                                      {formatCurrency(row.balanceAmount)}
                                    </span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={STATUS_COLORS[row.status] || 'bg-gray-100 text-gray-800'}
                                >
                                  {STATUS_LABELS[row.status] || row.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant='outline'>{row.installmentType}</Badge>
                              </TableCell>
                              <TableCell>
                                {row.paidDate ? formatDate(row.paidDate) : '-'}
                                {row.paymentMode && (
                                  <div className='text-xs text-gray-500'>{row.paymentMode}</div>
                                )}
                              </TableCell>
                              {(canUpdate || canDelete) && (
                                <TableCell className='text-right'>
                                  <div className='flex justify-end gap-1 flex-wrap'>
                                    <Button
                                      variant='outline'
                                      size='sm'
                                      onClick={() => handleView(row._id)}
                                    >
                                      View
                                    </Button>
                                    <Button
                                      variant='outline'
                                      size='sm'
                                      onClick={() => handleRecordPayment(row._id)}
                                    >
                                      Record Payment
                                    </Button>
                                    <Button
                                      variant='outline'
                                      size='sm'
                                      onClick={() => handleMarkPaid(row)}
                                    >
                                      Mark Paid
                                    </Button>
                                    <Button
                                      variant='outline'
                                      size='sm'
                                      onClick={() => handleDownloadInvoice(row)}
                                    >
                                      Invoice
                                    </Button>
                                    {row.amountPaid > 0 && (
                                      <ViewReceiptLink
                                        targetType='installment'
                                        targetId={row._id}
                                        className='inline-flex items-center gap-1 text-sm text-primary hover:underline px-2'
                                      />
                                    )}
                                    {canUpdate && (
                                      <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={() => handleEdit(row._id)}
                                      >
                                        Edit
                                      </Button>
                                    )}
                                    {canDelete && (
                                      <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={() => handleDelete(row._id)}
                                      >
                                        Delete
                                      </Button>
                                    )}
                                  </div>
                                </TableCell>
                              )}
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  )}
                </div>
              )
            })
          )}

          {data?.pagination && (
            <Pagination
              currentPage={data.pagination.page}
              totalPages={data.pagination.pages}
              pageSize={data.pagination.limit}
              totalItems={data.pagination.total}
              onPageChange={handlePageChange}
              onPageSizeChange={size => dispatch(setFilters({ limit: size, page: 1 }))}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
