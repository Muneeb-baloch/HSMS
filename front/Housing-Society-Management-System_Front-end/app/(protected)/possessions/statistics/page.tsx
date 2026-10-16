'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { usePossessionStatistics } from '@/lib/hooks/entities/usePossession'
import { PossessionStatistics } from '@/lib/types/possession'
import {
  ArrowLeft,
  CheckCircle,
  ClipboardCheck,
  Clock,
  PieChart as PieChartIcon
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { StatsPageSkeleton } from '@/components/shared/PageSkeleton'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export default function PossessionsStatisticsPage () {
  const router = useRouter()
  const { data, isLoading } = usePossessionStatistics()
  const stats = data as PossessionStatistics | undefined

  if (isLoading) {
    return <StatsPageSkeleton />
  }

  const byStatusData = stats
    ? Object.entries(stats.byStatus).map(([name, value]) => ({ name, value }))
    : []

  const handedOverCount = stats?.byStatus?.handed_over || 0
  const completionRate =
    stats && stats.totalCount > 0
      ? ((handedOverCount / stats.totalCount) * 100).toFixed(1)
      : '0.0'

  return (
    <div className='space-y-1'>
      <Button variant='ghost' onClick={() => router.back()} className='mb-6'>
        <ArrowLeft className='mr-2 h-4 w-4' />
        Back
      </Button>

      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2'>Possession Statistics</h1>
        <p className='text-gray-600'>
          Overview of possession requests by status and processing time
        </p>
      </div>

      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <div className='text-sm text-gray-500'>Total Possessions</div>
                <div className='text-3xl font-bold'>{stats?.totalCount || 0}</div>
              </div>
              <div className='p-3 bg-blue-100 rounded-full'>
                <ClipboardCheck className='h-6 w-6 text-blue-600' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <div className='text-sm text-gray-500'>Pending</div>
                <div className='text-3xl font-bold'>{stats?.pendingCount || 0}</div>
              </div>
              <div className='p-3 bg-amber-100 rounded-full'>
                <Clock className='h-6 w-6 text-amber-600' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <div className='text-sm text-gray-500'>Letters Collected</div>
                <div className='text-3xl font-bold'>{stats?.collectedCount || 0}</div>
              </div>
              <div className='p-3 bg-purple-100 rounded-full'>
                <PieChartIcon className='h-6 w-6 text-purple-600' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <div className='text-sm text-gray-500'>Handover Rate</div>
                <div className='text-3xl font-bold'>{completionRate}%</div>
              </div>
              <div className='p-3 bg-green-100 rounded-full'>
                <CheckCircle className='h-6 w-6 text-green-600' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>Possessions by Status</CardTitle>
            <CardDescription>Count of possession requests at each status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='h-80'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={byStatusData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='name' />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey='value' fill='#8884d8' />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
            <CardDescription>Share of possessions in each status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='h-80'>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={byStatusData}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                    label={entry => `${entry.name}: ${entry.value}`}
                    outerRadius={100}
                    fill='#8884d8'
                    dataKey='value'
                  >
                    {byStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Processing Times */}
      <Card className='mt-6'>
        <CardHeader>
          <CardTitle>Processing Time (Handed Over Possessions)</CardTitle>
          <CardDescription>
            Days between application date and handover date
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='text-center p-4 bg-gray-50 rounded-lg'>
              <div className='text-2xl font-bold'>
                {stats?.processingTimes?.avgProcessingDays
                  ? stats.processingTimes.avgProcessingDays.toFixed(1)
                  : 0}
              </div>
              <div className='text-sm text-gray-600'>Average Days</div>
            </div>
            <div className='text-center p-4 bg-gray-50 rounded-lg'>
              <div className='text-2xl font-bold'>
                {stats?.processingTimes?.minProcessingDays?.toFixed(0) ?? 0}
              </div>
              <div className='text-sm text-gray-600'>Fastest (Days)</div>
            </div>
            <div className='text-center p-4 bg-gray-50 rounded-lg'>
              <div className='text-2xl font-bold'>
                {stats?.processingTimes?.maxProcessingDays?.toFixed(0) ?? 0}
              </div>
              <div className='text-sm text-gray-600'>Slowest (Days)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Stats Table */}
      <Card className='mt-6'>
        <CardHeader>
          <CardTitle>Detailed Statistics by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {stats?.detailedStats?.map(item => (
              <div key={item._id} className='text-center p-4 bg-gray-50 rounded-lg'>
                <div className='text-2xl font-bold'>{item.count}</div>
                <div className='text-sm text-gray-600 capitalize'>
                  {item._id.replace('_', ' ')}
                </div>
                {item.avgDurationDays != null && (
                  <div className='text-xs text-gray-400 mt-1'>
                    Avg {item.avgDurationDays.toFixed(1)} days
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
