// src/app/(dashboard)/sales-status/statistics/page.tsx
'use client'

import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip } from '@/components/ui/chart'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { STATUS_TYPE_LABELS } from '@/lib/constants/salesStatus.constants'
import { useSalesStatusStatistics } from '@/lib/hooks/entities/useSalesStatus'
import { SalesStatusType } from '@/lib/types/salesStatus'
import {
  ArrowLeft,
  BarChart3,
  CheckCircle,
  Clock,
  TrendingUp,
  XCircle
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
import { StatsPageSkeleton } from '@/components/shared/PageSkeleton'
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  XAxis,
  YAxis
} from 'recharts'
type ChartColor =
  | {
      label?: React.ReactNode
      icon?: React.ComponentType
      color?: string
      theme?: undefined
    }
  | {
      label?: React.ReactNode
      icon?: React.ComponentType
      color?: undefined
      theme: { light: string; dark: string }
    }

type ChartConfig = {
  colors: ChartColor[]
  type: 'bar' | 'pie' | 'line' // union of allowed chart types
  // margin does NOT exist
}

export default function SalesStatusStatisticsPage () {
  const router = useRouter()
  const { data: statistics, isLoading } = useSalesStatusStatistics()

  const COLORS = [
    '#0088FE',
    '#00C49F',
    '#FFBB28',
    '#FF8042',
    '#8884D8',
    '#82CA9D',
    '#FFC658',
    '#FF7F50',
    '#6495ED',
    '#DC143C'
  ]

  const typeData = statistics?.byType
    ? Object.entries(statistics.byType).map(([type, stats]) => ({
        name: STATUS_TYPE_LABELS[type as SalesStatusType],
        value: stats?.total || 0,
        active: stats?.active || 0
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
              onClick={() => router.push('/sales-status')}
              className='mb-4'
            >
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Sales Statuses
            </Button>

            <h1 className='text-3xl font-bold'>Sales Status Statistics</h1>
            <p className='text-gray-500 mt-2'>
              Analytics and insights about sales statuses
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
                  All status types
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
                  Sales Allowed
                </CardTitle>
                <TrendingUp className='h-4 w-4 text-blue-500' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {statistics?.salesAllowedCount || 0}
                </div>
                <p className='text-xs text-muted-foreground'>
                  Statuses that allow plot sales
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Approval Required
                </CardTitle>
                <Clock className='h-4 w-4 text-orange-500' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {statistics?.approvalRequiredCount || 0}
                </div>
                <p className='text-xs text-muted-foreground'>
                  Statuses requiring approval
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            {/* Status Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Status Type Distribution</CardTitle>
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
                    <BarChart data={typeData}>
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
                      <ChartTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className='rounded-lg border bg-background p-2 shadow-sm'>
                                <div className='grid grid-cols-2 gap-2'>
                                  <div className='flex flex-col'>
                                    <span className='text-[0.70rem] uppercase text-muted-foreground'>
                                      Total
                                    </span>
                                    <span className='font-bold'>
                                      {payload[0].value}
                                    </span>
                                  </div>
                                  <div className='flex flex-col'>
                                    <span className='text-[0.70rem] uppercase text-muted-foreground'>
                                      Active
                                    </span>
                                    <span className='font-bold text-green-600'>
                                      {payload[0].payload.active}
                                    </span>
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

            {/* Activity Status */}
            <Card>
              <CardHeader>
                <CardTitle>Activity Status</CardTitle>
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
                        data={activityData}
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
                        {activityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className='rounded-lg border bg-background p-2 shadow-sm'>
                                <div className='flex flex-col gap-1'>
                                  <span className='text-[0.70rem] uppercase text-muted-foreground'>
                                    {payload[0].payload.name}
                                  </span>
                                  <span className='font-bold'>
                                    {payload[0].value} statuses
                                  </span>
                                </div>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Statistics */}
          {statistics?.byType && (
            <Card className='mt-8'>
              <CardHeader>
                <CardTitle>Detailed Statistics by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='overflow-x-auto'>
                  <table className='w-full'>
                    <thead>
                      <tr className='border-b'>
                        <th className='text-left py-3 px-4'>Status Type</th>
                        <th className='text-right py-3 px-4'>Total</th>
                        <th className='text-right py-3 px-4'>Active</th>
                        <th className='text-right py-3 px-4'>Inactive</th>
                        <th className='text-right py-3 px-4'>% Active</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(statistics.byType).map(
                        ([type, stats], index) => {
                          const percentActive =
                            stats.total > 0
                              ? Math.round((stats.active / stats.total) * 100)
                              : 0

                          return (
                            <tr
                              key={type}
                              className='border-b hover:bg-gray-50'
                            >
                              <td className='py-3 px-4'>
                                <div className='flex items-center gap-2'>
                                  <div
                                    className='w-3 h-3 rounded-full'
                                    style={{
                                      backgroundColor:
                                        COLORS[index % COLORS.length]
                                    }}
                                  />
                                  {STATUS_TYPE_LABELS[type as SalesStatusType]}
                                </div>
                              </td>
                              <td className='text-right py-3 px-4'>
                                {stats.total}
                              </td>
                              <td className='text-right py-3 px-4'>
                                <div className='flex items-center justify-end gap-1'>
                                  <CheckCircle className='h-4 w-4 text-green-500' />
                                  {stats.active}
                                </div>
                              </td>
                              <td className='text-right py-3 px-4'>
                                <div className='flex items-center justify-end gap-1'>
                                  <XCircle className='h-4 w-4 text-red-500' />
                                  {stats.total - stats.active}
                                </div>
                              </td>
                              <td className='text-right py-3 px-4'>
                                <div className='flex items-center justify-end gap-2'>
                                  <div className='w-20 bg-gray-200 rounded-full h-2'>
                                    <div
                                      className='bg-green-500 h-2 rounded-full'
                                      style={{ width: `${percentActive}%` }}
                                    />
                                  </div>
                                  {percentActive}%
                                </div>
                              </td>
                            </tr>
                          )
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
     
  )
}
