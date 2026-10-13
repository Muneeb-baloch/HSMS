'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  useDashboardSummary,
  useTransferStatistics
} from '@/lib/hooks/entities/useTransfer'
import { CheckCircle, Clock, DollarSign, FileText } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884D8',
  '#82ca9d'
]

export default function TransferDashboardPage () {
  const { data: statistics, isLoading: statsLoading } = useTransferStatistics()
  const { data: dashboard, isLoading: dashboardLoading } = useDashboardSummary()

  if (statsLoading || dashboardLoading) {
    return (
      <div className='p-6 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
      </div>
    )
  }

  // Prepare data for charts
  const statusData = statistics?.byStatus
    ? Object.entries(statistics.byStatus).map(([name, value]) => ({
        name,
        value
      }))
    : []

  const typeData = statistics?.byType
    ? Object.entries(statistics.byType).map(([name, value]) => ({
        name,
        value
      }))
    : []

  const monthData = statistics?.byMonth
    ? Object.entries(statistics.byMonth).map(([name, value]) => ({
        name,
        value
      }))
    : []

  return (
    <div className='p-6 space-y-6'>
      <div>
        <h1 className='text-3xl font-bold'>Transfer Dashboard</h1>
        <p className='text-gray-500 mt-2'>Overview of all property transfers</p>
      </div>

      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Transfers
            </CardTitle>
            <FileText className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {statistics?.totalTransfers || 0}
            </div>
            <p className='text-xs text-muted-foreground'>All time transfers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Pending Transfers
            </CardTitle>
            <Clock className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {statistics?.pendingTransfers || 0}
            </div>
            <p className='text-xs text-muted-foreground'>
              + {statistics?.feePendingTransfers || 0} fee pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Completed</CardTitle>
            <CheckCircle className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {statistics?.completedTransfers || 0}
            </div>
            <p className='text-xs text-muted-foreground'>
              {(
                ((statistics?.completedTransfers || 0) /
                  (statistics?.totalTransfers || 1)) *
                100
              ).toFixed(1)}
              % completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Revenue</CardTitle>
            <DollarSign className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              Rs. {(statistics?.totalFeeCollected || 0).toLocaleString()}
            </div>
            <p className='text-xs text-muted-foreground'>From all transfers</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Transfer Status Distribution</CardTitle>
            <CardDescription>
              Distribution of transfers by status
            </CardDescription>
          </CardHeader>
          <CardContent className='h-80'>
            <ResponsiveContainer width='100%' height='100%'>
              <PieChart>
                <Pie
                  data={statusData}
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
                  {statusData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Transfer Types */}
        <Card>
          <CardHeader>
            <CardTitle>Transfer Types</CardTitle>
            <CardDescription>Breakdown by transfer type</CardDescription>
          </CardHeader>
          <CardContent className='h-80'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={typeData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='name' />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey='value'
                  fill='#8884d8'
                  name='Number of Transfers'
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Activity */}
        <Card className='lg:col-span-2'>
          <CardHeader>
            <CardTitle>Monthly Transfer Activity</CardTitle>
            <CardDescription>Transfers initiated per month</CardDescription>
          </CardHeader>
          <CardContent className='h-80'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={monthData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='name' />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey='value' fill='#82ca9d' name='Transfers' />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transfers */}
      {dashboard?.recentTransfers && dashboard.recentTransfers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Transfers</CardTitle>
            <CardDescription>Latest transfers in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {dashboard.recentTransfers.map((transfer: any) => (
                <div
                  key={transfer._id}
                  className='flex items-center justify-between p-3 border rounded-lg'
                >
                  <div>
                    <p className='font-medium'>
                      {transfer.file?.fileRegNo || 'File'} -{' '}
                      {transfer.transferType?.typeName || 'Transfer'}
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      {transfer.seller?.memName || 'Seller'} →{' '}
                      {transfer.buyer?.memName || 'Buyer'}
                    </p>
                  </div>
                  <div className='text-right'>
                    <p className='text-sm'>
                      {new Date(transfer.transferInitDate).toLocaleDateString()}
                    </p>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        transfer.status === 'Completed'
                          ? 'bg-green-100 text-green-800'
                          : transfer.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {transfer.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
