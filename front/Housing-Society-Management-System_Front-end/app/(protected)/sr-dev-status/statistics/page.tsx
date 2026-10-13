// src/app/(dashboard)/sr-dev-status/statistics/page.tsx
'use client'

import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer } from '@/components/ui/chart'
import { Progress } from '@/components/ui/progress'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import {
  DEV_CATEGORY_COLORS,
  DEV_CATEGORY_LABELS,
  DEV_PHASE_COLORS,
  DEV_PHASE_LABELS
} from '@/lib/constants/srDevStatus.constants'
import { useSrDevStatusStatistics } from '@/lib/hooks/entities/useSrDevStatus'
import { DevCategory, DevPhase } from '@/lib/types/srdevstatus'
import {
  ArrowLeft,
  BarChart3,
  CheckCircle,
  Clock,
  TrendingUp,
  XCircle
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { StatsPageSkeleton } from '@/components/shared/PageSkeleton'
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
interface CategoryStats {
  total: number
  active: number
  avgPercentage: number
}

interface PhaseStats {
  total: number
  active: number
  avgPercentage: number
  totalDuration: number
}

export interface SrDevStatusStatistics {
  totalStatuses: number
  activeStatuses: number
  totalEstimatedDuration: number
  avgPercentageComplete: number
  byCategory: Record<DevCategory, CategoryStats>
  byPhase: Record<DevPhase, PhaseStats>
}

export default function SrDevStatusStatisticsPage () {
  const router = useRouter()
  const statistics = useSrDevStatusStatistics().data as
    | SrDevStatusStatistics
    | undefined
  const isLoading = useSrDevStatusStatistics().isLoading

  const categoryData = statistics?.byCategory
    ? Object.entries(statistics.byCategory).map(([category, stats]) => ({
        name: DEV_CATEGORY_LABELS[category as DevCategory],
        value: stats.total,
        active: stats.active,
        avgPercentage: stats.avgPercentage
      }))
    : []

  const phaseData = statistics?.byPhase
    ? Object.entries(statistics.byPhase).map(([phase, stats]) => ({
        name: DEV_PHASE_LABELS[phase as DevPhase],
        value: stats.total,
        active: stats.active,
        avgPercentage: stats.avgPercentage,
        duration: stats.totalDuration
      }))
    : []

  const activityData = [
    {
      name: 'Active',
      value: statistics?.activeStatuses || 0,
      color: '#10B981'
    },
    {
      name: 'Inactive',
      value:
        (statistics?.totalStatuses || 0) - (statistics?.activeStatuses || 0),
      color: '#EF4444'
    }
  ]

  if (isLoading) {
    return <StatsPageSkeleton />
  }

  return (

        <div className='p-6'>
          <div className='mb-6'>
            <Button
              variant='ghost'
              onClick={() => router.push('/sr-dev-status')}
              className='mb-4'
            >
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Development Statuses
            </Button>

            <h1 className='text-3xl font-bold'>
              Development Status Statistics
            </h1>
            <p className='text-gray-500 mt-2'>
              Analytics and insights about development phases and progress
            </p>
          </div>

          {/* Summary Cards */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Total Statuses
                </CardTitle>
                <BarChart3 className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {statistics?.totalStatuses || 0}
                </div>
                <p className='text-xs text-muted-foreground'>
                  All development phases
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Active Statuses
                </CardTitle>
                <CheckCircle className='h-4 w-4 text-green-500' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {statistics?.activeStatuses || 0}
                </div>
                <p className='text-xs text-muted-foreground'>
                  {statistics
                    ? Math.round(
                        (statistics.activeStatuses / statistics.totalStatuses) *
                          100
                      )
                    : 0}
                  % of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Avg. Progress
                </CardTitle>
                <TrendingUp className='h-4 w-4 text-blue-500' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {statistics?.avgPercentageComplete?.toFixed(1) || 0}%
                </div>
                <Progress
                  value={statistics?.avgPercentageComplete || 0}
                  className='h-2 mt-2'
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Total Duration
                </CardTitle>
                <Clock className='h-4 w-4 text-orange-500' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {statistics?.totalEstimatedDuration || 0}
                </div>
                <p className='text-xs text-muted-foreground'>
                  Estimated days for all phases
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Status Distribution by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  className='h-[300px]'
                  config={{
                    revenue: { label: 'Revenue', color: '#0088FE' },
                    sales: { label: 'Sales', color: '#00C49F' },
                    profit: { label: 'Profit', color: '#FFBB28' }
                  }}
                >
                  <ResponsiveContainer width='100%' height='100%'>
                    <BarChart data={categoryData}>
                      <XAxis
                        dataKey='name'
                        stroke='#888888'
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke='#888888'
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={value => `${value}`}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload
                            return (
                              <div className='rounded-lg border bg-background p-4 shadow-sm'>
                                <div className='space-y-2'>
                                  <div className='flex items-center gap-2'>
                                    <div
                                      className='w-3 h-3 rounded-full'
                                      style={{
                                        backgroundColor:
                                          DEV_CATEGORY_COLORS[
                                            data.category as DevCategory
                                          ]
                                      }}
                                    />
                                    <span className='font-bold'>
                                      {data.name}
                                    </span>
                                  </div>
                                  <div className='grid grid-cols-2 gap-2'>
                                    <div className='text-sm'>
                                      <span className='text-muted-foreground'>
                                        Total:
                                      </span>
                                      <span className='ml-2 font-medium'>
                                        {data.value}
                                      </span>
                                    </div>
                                    <div className='text-sm'>
                                      <span className='text-muted-foreground'>
                                        Active:
                                      </span>
                                      <span className='ml-2 font-medium text-green-600'>
                                        {data.active}
                                      </span>
                                    </div>
                                    <div className='text-sm col-span-2'>
                                      <span className='text-muted-foreground'>
                                        Avg. Progress:
                                      </span>
                                      <span className='ml-2 font-medium'>
                                        {data.avgPercentage}%
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Bar
                        dataKey='value'
                        fill='currentColor'
                        radius={[4, 4, 0, 0]}
                        className='fill-primary'
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Phase Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Status Distribution by Phase</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  className='h-[300px]'
                  config={{
                    revenue: { label: 'Revenue', color: '#0088FE' },
                    sales: { label: 'Sales', color: '#00C49F' },
                    profit: { label: 'Profit', color: '#FFBB28' }
                  }}
                >
                  <ResponsiveContainer width='100%' height='100%'>
                    <RechartsPieChart>
                      <Pie
                        data={phaseData}
                        cx='50%'
                        cy='50%'
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill='#8884d8'
                        dataKey='value'
                      >
                        {phaseData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              DEV_PHASE_COLORS[
                                Object.keys(DEV_PHASE_COLORS)[index] as DevPhase
                              ] || '#8884d8'
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload
                            return (
                              <div className='rounded-lg border bg-background p-4 shadow-sm'>
                                <div className='space-y-2'>
                                  <div className='font-bold'>{data.name}</div>
                                  <div className='grid grid-cols-2 gap-2'>
                                    <div className='text-sm'>
                                      <span className='text-muted-foreground'>
                                        Statuses:
                                      </span>
                                      <span className='ml-2 font-medium'>
                                        {data.value}
                                      </span>
                                    </div>
                                    <div className='text-sm'>
                                      <span className='text-muted-foreground'>
                                        Active:
                                      </span>
                                      <span className='ml-2 font-medium text-green-600'>
                                        {data.active}
                                      </span>
                                    </div>
                                    <div className='text-sm'>
                                      <span className='text-muted-foreground'>
                                        Avg. Progress:
                                      </span>
                                      <span className='ml-2 font-medium'>
                                        {data.avgPercentage}%
                                      </span>
                                    </div>
                                    <div className='text-sm'>
                                      <span className='text-muted-foreground'>
                                        Duration:
                                      </span>
                                      <span className='ml-2 font-medium'>
                                        {data.duration} days
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Statistics */}
          <Card className='mb-8'>
            <CardHeader>
              <CardTitle>Detailed Statistics by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead>
                    <tr className='border-b'>
                      <th className='text-left py-3 px-4'>Category</th>
                      <th className='text-right py-3 px-4'>Total</th>
                      <th className='text-right py-3 px-4'>Active</th>
                      <th className='text-right py-3 px-4'>Inactive</th>
                      <th className='text-right py-3 px-4'>Avg. Progress</th>
                      <th className='text-right py-3 px-4'>% of Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryData.map((category, index) => {
                      const percentOfTotal = statistics?.totalStatuses
                        ? Math.round(
                            (category.value / statistics.totalStatuses) * 100
                          )
                        : 0

                      return (
                        <tr key={index} className='border-b hover:bg-gray-50'>
                          <td className='py-3 px-4'>
                            <div className='flex items-center gap-2'>
                              <div
                                className='w-3 h-3 rounded-full'
                                style={{
                                  backgroundColor:
                                    DEV_CATEGORY_COLORS[
                                      Object.keys(DEV_CATEGORY_LABELS)[
                                        index
                                      ] as DevCategory
                                    ]
                                }}
                              />
                              {category.name}
                            </div>
                          </td>
                          <td className='text-right py-3 px-4'>
                            {category.value}
                          </td>
                          <td className='text-right py-3 px-4'>
                            <div className='flex items-center justify-end gap-1'>
                              <CheckCircle className='h-4 w-4 text-green-500' />
                              {category.active}
                            </div>
                          </td>
                          <td className='text-right py-3 px-4'>
                            <div className='flex items-center justify-end gap-1'>
                              <XCircle className='h-4 w-4 text-red-500' />
                              {category.value - category.active}
                            </div>
                          </td>
                          <td className='text-right py-3 px-4'>
                            <div className='flex items-center justify-end gap-2'>
                              <div className='w-20 bg-gray-200 rounded-full h-2'>
                                <div
                                  className='bg-blue-500 h-2 rounded-full'
                                  style={{
                                    width: `${category.avgPercentage}%`
                                  }}
                                />
                              </div>
                              {category.avgPercentage}%
                            </div>
                          </td>
                          <td className='text-right py-3 px-4'>
                            <div className='flex items-center justify-end gap-2'>
                              <div className='w-20 bg-gray-200 rounded-full h-2'>
                                <div
                                  className='bg-green-500 h-2 rounded-full'
                                  style={{ width: `${percentOfTotal}%` }}
                                />
                              </div>
                              {percentOfTotal}%
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Phase Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Phase-wise Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead>
                    <tr className='border-b'>
                      <th className='text-left py-3 px-4'>Phase</th>
                      <th className='text-right py-3 px-4'>Total Statuses</th>
                      <th className='text-right py-3 px-4'>Active</th>
                      <th className='text-right py-3 px-4'>Avg. Progress</th>
                      <th className='text-right py-3 px-4'>Total Duration</th>
                      <th className='text-right py-3 px-4'>
                        Avg. Duration/Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {phaseData.map((phase, index) => {
                      const avgDuration =
                        phase.value > 0
                          ? Math.round(phase.duration / phase.value)
                          : 0

                      return (
                        <tr key={index} className='border-b hover:bg-gray-50'>
                          <td className='py-3 px-4'>
                            <div className='flex items-center gap-2'>
                              <div
                                className='w-3 h-3 rounded-full'
                                style={{
                                  backgroundColor:
                                    DEV_PHASE_COLORS[
                                      Object.keys(DEV_PHASE_LABELS)[
                                        index
                                      ] as DevPhase
                                    ]
                                }}
                              />
                              {phase.name}
                            </div>
                          </td>
                          <td className='text-right py-3 px-4'>
                            {phase.value}
                          </td>
                          <td className='text-right py-3 px-4'>
                            <div className='flex items-center justify-end gap-1'>
                              <CheckCircle className='h-4 w-4 text-green-500' />
                              {phase.active}
                            </div>
                          </td>
                          <td className='text-right py-3 px-4'>
                            <div className='flex items-center justify-end gap-2'>
                              <div className='w-20 bg-gray-200 rounded-full h-2'>
                                <div
                                  className='bg-blue-500 h-2 rounded-full'
                                  style={{ width: `${phase.avgPercentage}%` }}
                                />
                              </div>
                              {phase.avgPercentage}%
                            </div>
                          </td>
                          <td className='text-right py-3 px-4'>
                            <div className='flex items-center justify-end gap-1'>
                              <Clock className='h-4 w-4 text-orange-500' />
                              {phase.duration} days
                            </div>
                          </td>
                          <td className='text-right py-3 px-4'>
                            {avgDuration} days
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
     
  )
}
