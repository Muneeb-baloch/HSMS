// src/app/(protected)/installment-plan-details/page.tsx
'use client'

import { ActionBar } from '@/components/shared/PageTemplate'
import { ActionIcon } from '@/components/ui/ActionIcon/ActionIcon'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import {
  BarChart3,
  ChevronDown,
  ChevronRight,
  Percent,
  Plus,
  RefreshCw,
  Search,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
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
  // Grouping by plan replaces row-level pagination, so fetch as many rows as
  // the backend allows in one page (its validator caps limit at 100) rather
  // than paginating raw detail rows, which would split a plan's group across
  // pages. If a deployment ever has >100 total detail rows across all plans,
  // this will need real pagination (or a higher backend cap) revisited.
  const { data, isLoading } = useInstallmentPlanDetails({ ...filters, limit: 100 })
  const { data: summary } = useInstallmentPlanDetailSummary()
  const deleteMutation = useDeleteInstallmentPlanDetail()

  // Collapsed-by-user-choice set — everything is expanded by default (a plan
  // isn't in this set) so nothing is hidden without an explicit click; toggling
  // a group adds/removes its planId here.
  const [collapsedPlanIds, setCollapsedPlanIds] = useState<Set<string>>(
    new Set()
  )
  const togglePlan = (planId: string) =>
    setCollapsedPlanIds(prev => {
      const next = new Set(prev)
      next.has(planId) ? next.delete(planId) : next.add(planId)
      return next
    })

  // Group the (already server-filtered/searched) rows by plan, sorted by
  // occurrence within each plan — this is the actual fix for "which rows
  // belong to which plan": the plan name is shown once, as a group header,
  // instead of repeated on every row.
  type DetailRow = NonNullable<typeof data>['items'][number]
  const groupedByPlan = useMemo(() => {
    const items = data?.items || []
    const groups = new Map<
      string,
      { planId: string; planName: string; rows: DetailRow[] }
    >()
    for (const item of items) {
      const planObj =
        typeof item.planId === 'object' && item.planId !== null
          ? (item.planId as { _id: string; planName: string })
          : null
      const planId = planObj?._id || String(item.planId)
      const planName = planObj?.planName || 'Unknown Plan'
      if (!groups.has(planId)) {
        groups.set(planId, { planId, planName, rows: [] })
      }
      groups.get(planId)!.rows.push(item)
    }
    for (const group of groups.values()) {
      group.rows.sort((a, b) => a.occurrence - b.occurrence)
    }
    return [...groups.values()].sort((a, b) =>
      a.planName.localeCompare(b.planName)
    )
  }, [data?.items])

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

  const handleResetFilters = () => {
    dispatch(resetFilters())
  }

  const handlePlanFilter = (planId: string) => {
    dispatch(setFilters({ planId: planId || undefined, page: 1 }))
  }

  const handleCategoryFilter = (instCatId: string) => {
    dispatch(setFilters({ instCatId: instCatId || undefined, page: 1 }))
  }

  const planOptions = (plans?.items || []).map((p) => ({
    label: p.planName,
    value: p._id,
  }))

  const categoryOptions = (categories?.items || []).map((c) => ({
    label: c.instCatName,
    value: c._id,
  }))

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
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
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                defaultValue={filters.search || ''}
                onChange={e => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={filters.planId || 'all'}
              onValueChange={v => handlePlanFilter(v === 'all' ? '' : v)}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Plans" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                {planOptions.map(p => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.instCatId || 'all'}
              onValueChange={v => handleCategoryFilter(v === 'all' ? '' : v)}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categoryOptions.map(c => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Loading...
            </p>
          ) : groupedByPlan.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No plan details found.
            </p>
          ) : (
            groupedByPlan.map(group => {
              const isCollapsed = collapsedPlanIds.has(group.planId)
              const totalPercent = group.rows.reduce(
                (sum, r) => sum + (r.percentageAmount || 0),
                0
              )
              return (
                <div
                  key={group.planId}
                  className="border rounded-lg overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => togglePlan(group.planId)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-muted/40 hover:bg-muted/70 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {isCollapsed ? (
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                      <Link
                        href={`/installment-plans/view/${group.planId}`}
                        onClick={e => e.stopPropagation()}
                        className="font-semibold truncate hover:underline"
                      >
                        {group.planName}
                      </Link>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline">
                        {group.rows.length} row
                        {group.rows.length !== 1 ? 's' : ''}
                      </Badge>
                      <Badge
                        className={
                          totalPercent === 100
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }
                      >
                        {totalPercent}%
                      </Badge>
                    </div>
                  </button>
                  {!isCollapsed && (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Occurrence</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead className="text-right">
                            Percentage
                          </TableHead>
                          <TableHead className="text-right">
                            Fixed Amount
                          </TableHead>
                          {(canUpdate || canDelete) && (
                            <TableHead className="text-right">
                              Actions
                            </TableHead>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.rows.map(row => {
                          const category =
                            typeof row.instCatId === 'object' &&
                            row.instCatId !== null
                              ? (row.instCatId as { instCatName?: string })
                                  .instCatName
                              : '—'
                          return (
                            <TableRow
                              key={row._id}
                              className="cursor-pointer"
                              onClick={() => handleView(row._id)}
                            >
                              <TableCell className="font-medium">
                                #{row.occurrence}
                              </TableCell>
                              <TableCell>{category || '—'}</TableCell>
                              <TableCell className="text-right">
                                {row.percentageAmount > 0
                                  ? `${row.percentageAmount}%`
                                  : '—'}
                              </TableCell>
                              <TableCell className="text-right">
                                {row.fixedAmount > 0
                                  ? formatCurrency(row.fixedAmount)
                                  : '—'}
                              </TableCell>
                              {(canUpdate || canDelete) && (
                                <TableCell
                                  className="text-right"
                                  onClick={e => e.stopPropagation()}
                                >
                                  <div className="flex justify-end gap-2">
                                    {canUpdate && (
                                      <ActionIcon
                                        actionType="edit"
                                        onClick={() => handleEdit(row._id)}
                                        title="Edit"
                                      />
                                    )}
                                    {canDelete && (
                                      <ActionIcon
                                        actionType="delete"
                                        onClick={() => handleDelete(row._id)}
                                        title="Delete"
                                      />
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
        </CardContent>
      </Card>
    </div>
  )
}
