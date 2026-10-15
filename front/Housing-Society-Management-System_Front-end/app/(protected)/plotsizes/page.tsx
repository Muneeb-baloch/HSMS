// src/app/(dashboard)/plotsizes/page.tsx
'use client'

import { ActionBar } from '@/components/shared/PageTemplate'
import { SummaryCard } from '@/components/shared/SummaryCard'
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
  useDeletePlotSize,
  usePlotSizes
} from '@/lib/hooks/entities/usePlotSize'
import { useProjects } from '@/lib/hooks/entities/useProject'
import { useAuth } from '@/lib/hooks/useAuth'
import { PlotSize } from '@/lib/types/plotsize'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { resetFilters, setFilters } from '@/lib/store/slices/plotsizeSlice'
import {
  Calculator,
  ChevronDown,
  ChevronRight,
  Plus,
  RefreshCw,
  Search
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { useConfirm } from '@/components/shared/ConfirmDialog'

export default function PlotSizesPage () {
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const router = useRouter()
  const { confirm } = useConfirm()

  const filters = useAppSelector(state => state.plotSizes?.filters || {})

  const { data: projectsData } = useProjects({ limit: 100 })
  const projectOptions = useMemo(
    () =>
      projectsData?.items?.map(p => ({ label: p.projName, value: p._id })) ||
      [],
    [projectsData?.items]
  )

  // Grouping by project replaces row-level pagination, so fetch as many rows
  // as the backend allows in one page rather than paginating raw rows, which
  // would split a project's group across pages.
  const { data, isLoading } = usePlotSizes({ ...filters, limit: 200 })
  const deleteMutation = useDeletePlotSize()

  const canCreate =
    user &&
    hasPermission(user.role as UserRole, [
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN
    ] as UserRole[])
  const canUpdate = canCreate
  const canDelete = canCreate

  // Collapsed-by-user-choice set — everything is expanded by default (a
  // project isn't in this set) so nothing is hidden without an explicit click.
  const [collapsedProjectIds, setCollapsedProjectIds] = useState<Set<string>>(
    new Set()
  )
  const toggleProject = (projectId: string) =>
    setCollapsedProjectIds(prev => {
      const next = new Set(prev)
      next.has(projectId) ? next.delete(projectId) : next.add(projectId)
      return next
    })

  // Group the (already server-filtered) rows by project, so the project name
  // is shown once as a group header instead of needing a separate lookup to
  // tell which project a given plot size belongs to.
  const groupedByProject = useMemo(() => {
    const items = data?.items || []
    const groups = new Map<
      string,
      { projectId: string; projectName: string; projectCode?: string; rows: PlotSize[] }
    >()
    for (const item of items) {
      const projObj =
        typeof item.projectId === 'object' && item.projectId !== null
          ? (item.projectId as { _id: string; projName: string; projCode: string })
          : null
      const projectId = projObj?._id || (item.projectId as string) || 'unassigned'
      const projectName = projObj?.projName || 'Unassigned / Legacy'
      if (!groups.has(projectId)) {
        groups.set(projectId, {
          projectId,
          projectName,
          projectCode: projObj?.projCode,
          rows: []
        })
      }
      groups.get(projectId)!.rows.push(item)
    }
    for (const group of groups.values()) {
      group.rows.sort((a, b) => a.plotSizeName.localeCompare(b.plotSizeName))
    }
    return [...groups.values()].sort((a, b) => {
      if (a.projectId === 'unassigned') return 1
      if (b.projectId === 'unassigned') return -1
      return a.projectName.localeCompare(b.projectName)
    })
  }, [data?.items])

  const handleCreate = () => router.push('/plotsizes/create')
  const handleEdit = (id: string) => router.push(`/plotsizes/edit/${id}`)
  const handleView = (id: string) => router.push(`/plotsizes/view/${id}`)

  const handleDelete = async (id: string) => {
    if (
      canDelete &&
      (await confirm({
        title: 'Delete',
        description: 'Are you sure you want to delete this plot size?',
        variant: 'destructive'
      }))
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

  const handleProjectFilter = (projectId: string) => {
    dispatch(setFilters({ projectId: projectId || undefined, page: 1 }))
  }

  const handleAreaUnitFilter = (areaUnit: string) => {
    dispatch(setFilters({ areaUnit: areaUnit || undefined, page: 1 }))
  }

  const summary = data?.summary

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-foreground'>Plot Sizes</h1>
        <p className='mt-1 text-muted-foreground'>
          Manage plot sizes, areas, and pricing — grouped by project
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

      <Card>
        <CardHeader>
          <CardTitle>All Plot Sizes</CardTitle>
          <div className='flex flex-col sm:flex-row gap-3 pt-2'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search...'
                defaultValue={filters.search || ''}
                onChange={e => handleSearch(e.target.value)}
                className='pl-9'
              />
            </div>
            <Select
              value={filters.projectId || 'all'}
              onValueChange={v => handleProjectFilter(v === 'all' ? '' : v)}
            >
              <SelectTrigger className='w-full sm:w-[200px]'>
                <SelectValue placeholder='All Projects' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Projects</SelectItem>
                {projectOptions.map(p => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.areaUnit || 'all'}
              onValueChange={v => handleAreaUnitFilter(v === 'all' ? '' : v)}
            >
              <SelectTrigger className='w-full sm:w-[160px]'>
                <SelectValue placeholder='All Units' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Units</SelectItem>
                <SelectItem value='marla'>Marla</SelectItem>
                <SelectItem value='sqft'>Square Feet</SelectItem>
                <SelectItem value='sqm'>Square Meter</SelectItem>
                <SelectItem value='acre'>Acre</SelectItem>
                <SelectItem value='hectare'>Hectare</SelectItem>
                <SelectItem value='kanal'>Kanal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className='space-y-3'>
          {isLoading ? (
            <p className='text-sm text-muted-foreground py-8 text-center'>
              Loading...
            </p>
          ) : groupedByProject.length === 0 ? (
            <p className='text-sm text-muted-foreground py-8 text-center'>
              No plot sizes found.
            </p>
          ) : (
            groupedByProject.map(group => {
              const isCollapsed = collapsedProjectIds.has(group.projectId)
              const totalValue = group.rows.reduce(
                (sum, r) => sum + (r.standardBasePrice || 0),
                0
              )
              const isRealProject = group.projectId !== 'unassigned'
              return (
                <div
                  key={group.projectId}
                  className='border rounded-lg overflow-hidden'
                >
                  <button
                    type='button'
                    onClick={() => toggleProject(group.projectId)}
                    className='w-full flex items-center justify-between gap-3 px-4 py-3 bg-muted/40 hover:bg-muted/70 transition-colors text-left'
                  >
                    <div className='flex items-center gap-2 min-w-0'>
                      {isCollapsed ? (
                        <ChevronRight className='h-4 w-4 shrink-0 text-muted-foreground' />
                      ) : (
                        <ChevronDown className='h-4 w-4 shrink-0 text-muted-foreground' />
                      )}
                      {isRealProject ? (
                        <Link
                          href={`/projects/view/${group.projectId}`}
                          onClick={e => e.stopPropagation()}
                          className='font-semibold truncate hover:underline'
                        >
                          {group.projectName}
                          {group.projectCode && (
                            <span className='text-muted-foreground font-normal'>
                              {' '}
                              ({group.projectCode})
                            </span>
                          )}
                        </Link>
                      ) : (
                        <span className='font-semibold truncate text-muted-foreground'>
                          {group.projectName}
                        </span>
                      )}
                    </div>
                    <div className='flex items-center gap-2 shrink-0'>
                      <Badge variant='outline'>
                        {group.rows.length} size
                        {group.rows.length !== 1 ? 's' : ''}
                      </Badge>
                      <Badge className='bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'>
                        PKR {totalValue.toLocaleString()}
                      </Badge>
                    </div>
                  </button>
                  {!isCollapsed && (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Plot Size</TableHead>
                          <TableHead>Area</TableHead>
                          <TableHead className='text-right'>
                            Rate/Unit
                          </TableHead>
                          <TableHead className='text-right'>
                            Total Price
                          </TableHead>
                          {(canUpdate || canDelete) && (
                            <TableHead className='text-right'>
                              Actions
                            </TableHead>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.rows.map(row => (
                          <TableRow
                            key={row._id}
                            className='cursor-pointer'
                            onClick={() => handleView(row._id)}
                          >
                            <TableCell className='font-medium'>
                              {row.plotSizeName}
                            </TableCell>
                            <TableCell>
                              <div className='flex items-center gap-2'>
                                {row.totalArea} {row.areaUnit}
                                <Badge variant='outline'>
                                  {row.areaUnit.toUpperCase()}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className='text-right'>
                              {row.formattedRate ||
                                `PKR ${row.ratePerUnit.toLocaleString()}`}
                            </TableCell>
                            <TableCell className='text-right font-bold text-green-700'>
                              {row.formattedPrice ||
                                `PKR ${row.standardBasePrice.toLocaleString()}`}
                            </TableCell>
                            {(canUpdate || canDelete) && (
                              <TableCell
                                className='text-right'
                                onClick={e => e.stopPropagation()}
                              >
                                <div className='flex justify-end gap-2'>
                                  <ActionIcon
                                    actionType='view'
                                    onClick={() => handleView(row._id)}
                                    title='View Details'
                                  />
                                  {canUpdate && (
                                    <ActionIcon
                                      actionType='edit'
                                      onClick={() => handleEdit(row._id)}
                                      title='Edit'
                                    />
                                  )}
                                  {canDelete && (
                                    <ActionIcon
                                      actionType='delete'
                                      onClick={() => handleDelete(row._id)}
                                      title='Delete'
                                    />
                                  )}
                                </div>
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
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
