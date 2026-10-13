'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import { useAuth } from '@/lib/hooks/useAuth'
import { useProjectStatistics } from '@/lib/hooks/entities/useProject'
import { usePlotStatistics } from '@/lib/hooks/entities/usePlot'
import { useBillDashboardSummary } from '@/lib/hooks/entities/useBillInfo'
import { useMembers } from '@/lib/hooks/entities/useMember'
import { useDefaulterStatistics } from '@/lib/hooks/entities/useDefaulter'
import {
import { InlineSkeleton } from '@/components/shared/PageSkeleton'
  BarChart3,
  Building,
  DollarSign,
  LineChart,
  PieChart,
  TrendingUp,
  Users
} from 'lucide-react'

export default function AnalyticsPage () {
  const { user } = useAuth()
  const { data: projectStats, isLoading: projectsLoading } = useProjectStatistics()
  const { data: plotStats, isLoading: plotsLoading } = usePlotStatistics()
  const { data: billSummary, isLoading: billsLoading } = useBillDashboardSummary()
  const { data: membersData, isLoading: membersLoading } = useMembers({ page: 1, limit: 1 })
  const { data: defaulterStats, isLoading: defaultersLoading } = useDefaulterStatistics()

  const isLoading = projectsLoading || plotsLoading || billsLoading || membersLoading || defaultersLoading

  const totalMembers = membersData?.pagination?.total ?? 0
  const totalPlots = plotStats?.total ?? 0
  const plotsSold = plotStats?.sold ?? 0
  const plotsAvailable = plotStats?.available ?? 0
  const totalValue = plotStats?.totalValue ?? 0
  const totalProjects = projectStats?.totalProjects ?? 0
  const billsPending = (billSummary as any)?.statistics?.totalPending ?? 0
  const billsOverdue = (billSummary as any)?.statistics?.totalOverdue ?? 0

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold'>Analytics Dashboard</h1>
        <p className='text-muted-foreground'>
          Comprehensive analytics for housing society management
        </p>
      </div>

      {isLoading ? (
            <InlineSkeleton />
          ) : (
        <>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Total Value</CardTitle>
                <TrendingUp className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{formatCurrency(totalValue)}</div>
                <p className='text-xs text-muted-foreground'>
                  Plot inventory value
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Bills Pending</CardTitle>
                <LineChart className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{billsPending}</div>
                <p className='text-xs text-muted-foreground'>
                  {billsOverdue} overdue
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Members</CardTitle>
                <PieChart className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{totalMembers.toLocaleString()}</div>
                <p className='text-xs text-muted-foreground'>
                  Registered members
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Projects</CardTitle>
                <BarChart3 className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{totalProjects}</div>
                <p className='text-xs text-muted-foreground'>
                  Total projects
                </p>
              </CardContent>
            </Card>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle>Plot Inventory</CardTitle>
                <CardDescription>
                  Overview of plot availability and sales
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-muted-foreground'>Total Plots</span>
                    <span className='font-bold'>{totalPlots}</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-muted-foreground'>Available</span>
                    <span className='font-bold text-green-600'>{plotsAvailable}</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-muted-foreground'>Sold</span>
                    <span className='font-bold text-blue-600'>{plotsSold}</span>
                  </div>
                  <div className='pt-4'>
                    <div className='h-2 bg-gray-200 rounded-full overflow-hidden'>
                      <div
                        className='h-full bg-blue-500'
                        style={{
                          width: `${totalPlots ? (plotsSold / totalPlots) * 100 : 0}%`
                        }}
                      />
                    </div>
                    <div className='flex justify-between text-xs text-muted-foreground mt-2'>
                      <span>Available: {plotsAvailable}</span>
                      <span>Sold: {plotsSold} ({totalPlots ? Math.round((plotsSold / totalPlots) * 100) : 0}%)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Plot Distribution by Type</CardTitle>
                <CardDescription>Breakdown of plots by their types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {plotStats?.byType && Object.entries(plotStats.byType).map(([type, count]) => (
                    <div key={type} className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <Building className='h-4 w-4 text-muted-foreground' />
                        <span className='text-sm capitalize'>{type.replace('_', ' ')}</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <span className='font-medium'>{count as number}</span>
                        <span className='text-xs text-muted-foreground'>
                          ({totalPlots ? Math.round(((count as number) / totalPlots) * 100) : 0}%)
                        </span>
                      </div>
                    </div>
                  ))}
                  {(!plotStats?.byType || Object.keys(plotStats.byType).length === 0) && (
                    <p className='text-sm text-muted-foreground text-center py-4'>No type data available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {projectStats?.byStatus && (
            <Card>
              <CardHeader>
                <CardTitle>Projects by Status</CardTitle>
                <CardDescription>Distribution of projects across different statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                  {Object.entries(projectStats.byStatus).map(([status, count]) => (
                    <div key={status} className='p-4 border rounded-lg'>
                      <p className='text-sm text-muted-foreground capitalize'>{status.replace('_', ' ')}</p>
                      <p className='text-2xl font-bold mt-1'>{count}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
