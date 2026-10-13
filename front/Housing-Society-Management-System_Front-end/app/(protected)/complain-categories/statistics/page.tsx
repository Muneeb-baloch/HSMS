// src/app/(dashboard)/complaincatg/statistics/page.tsx
'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSrComplaintCategoryStatistics } from '@/lib/hooks/entities/useSrComplaintCategory'
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { StatsPageSkeleton } from '@/components/shared/PageSkeleton'

export default function ComplaintCategoryStatisticsPage () {
  const router = useRouter()
  const { data: statistics, isLoading } = useSrComplaintCategoryStatistics()

  if (isLoading) {
    return <StatsPageSkeleton />
  }

  const priorityLabels: Record<number, string> = {
    1: 'Critical',
    2: 'High',
    3: 'High',
    4: 'Medium',
    5: 'Medium',
    6: 'Medium',
    7: 'Low',
    8: 'Low',
    9: 'Very Low',
    10: 'Very Low'
  }

  const priorityColors: Record<number, string> = {
    1: 'bg-red-500',
    2: 'bg-red-400',
    3: 'bg-red-300',
    4: 'bg-orange-500',
    5: 'bg-orange-400',
    6: 'bg-yellow-500',
    7: 'bg-yellow-400',
    8: 'bg-green-500',
    9: 'bg-green-400',
    10: 'bg-green-300'
  }

  return (
    <div className='space-y-1'>
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-2'>
          <Button variant='ghost' size='sm' onClick={() => router.back()}>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back
          </Button>
        </div>
      </div>

      <div>
        <h1 className='text-2xl font-bold mb-2'>Category Statistics</h1>
        <p className='text-muted-foreground mb-6'>
          Comprehensive analytics and insights about complaint categories
        </p>
      </div>

      {/* Overview Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Total Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold'>
              {statistics?.totalCategories || 0}
            </div>
            <p className='text-sm text-muted-foreground mt-1'>
              All defined categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Active Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold text-green-600'>
              {statistics?.activeCategories || 0}
            </div>
            <p className='text-sm text-muted-foreground mt-1'>
              {statistics
                ? statistics.totalCategories - statistics.activeCategories
                : 0}{' '}
              inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Avg. Priority Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold text-blue-600'>
              {statistics?.avgPriorityLevel?.toFixed(1) || '0.0'}
            </div>
            <p className='text-sm text-muted-foreground mt-1'>
              Lower is more critical
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Avg. SLA Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold text-purple-600'>
              {statistics?.avgSlaHours?.toFixed(0) || '0'}h
            </div>
            <p className='text-sm text-muted-foreground mt-1'>
              Average resolution time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Priority Distribution */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <AlertTriangle className='h-5 w-5' />
              Priority Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statistics?.byPriority && (
              <div className='space-y-4'>
                {Object.entries(statistics.byPriority)
                  .sort(([a], [b]) => parseInt(a) - parseInt(b))
                  .map(([priority, data]) => (
                    <div key={priority} className='space-y-2'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          <div
                            className={`w-3 h-3 rounded-full ${
                              priorityColors[parseInt(priority)]
                            }`}
                          />
                          <span className='font-medium'>
                            {priorityLabels[parseInt(priority)]} (Level{' '}
                            {priority})
                          </span>
                        </div>
                        <div className='flex items-center gap-4'>
                          <span className='text-sm text-green-600'>
                            <CheckCircle className='inline h-3 w-3 mr-1' />
                            {data.active}
                          </span>
                          <span className='text-sm text-red-600'>
                            <XCircle className='inline h-3 w-3 mr-1' />
                            {data.total - data.active}
                          </span>
                          <span className='font-medium'>{data.total}</span>
                        </div>
                      </div>
                      <div className='h-2 bg-gray-100 rounded-full overflow-hidden'>
                        <div
                          className={`h-full ${
                            priorityColors[parseInt(priority)]
                          }`}
                          style={{
                            width: `${
                              (data.total / statistics.totalCategories) * 100
                            }%`
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <BarChart3 className='h-5 w-5' />
              Priority Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='h-64'>
              {statistics?.byPriority && (
                <div className='h-full flex items-end gap-1'>
                  {Object.entries(statistics.byPriority)
                    .sort(([a], [b]) => parseInt(a) - parseInt(b))
                    .map(([priority, data]) => {
                      const height =
                        (data.total / statistics.totalCategories) * 100
                      const activeHeight = (data.active / data.total) * height

                      return (
                        <div
                          key={priority}
                          className='flex-1 flex flex-col items-center'
                        >
                          <div className='w-full relative'>
                            <div
                              className='w-full bg-gray-200 rounded-t-lg'
                              style={{ height: `${height}%` }}
                            >
                              <div
                                className={`w-full ${
                                  priorityColors[parseInt(priority)]
                                } rounded-t-lg`}
                                style={{ height: `${activeHeight}%` }}
                              />
                            </div>
                          </div>
                          <div className='text-xs text-muted-foreground mt-2 truncate w-full text-center'>
                            L{priority}
                          </div>
                          <div className='text-xs font-medium mt-1'>
                            {data.total}
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SLA Analysis */}
      <Card className='mb-8'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Clock className='h-5 w-5' />
            SLA Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='text-center p-4 border rounded-lg'>
              <div className='text-2xl font-bold text-red-600'>Urgent</div>
              <div className='text-sm text-muted-foreground mt-1'>
                SLA &lt; 24 hours
              </div>
              <div className='mt-2 text-lg font-semibold'>
                {statistics?.avgSlaHours && statistics.avgSlaHours < 24
                  ? 'Yes'
                  : 'No'}
              </div>
            </div>

            <div className='text-center p-4 border rounded-lg'>
              <div className='text-2xl font-bold text-yellow-600'>Standard</div>
              <div className='text-sm text-muted-foreground mt-1'>
                SLA 24-72 hours
              </div>
              <div className='mt-2 text-lg font-semibold'>
                {statistics?.avgSlaHours &&
                statistics.avgSlaHours >= 24 &&
                statistics.avgSlaHours <= 72
                  ? 'Yes'
                  : 'No'}
              </div>
            </div>

            <div className='text-center p-4 border rounded-lg'>
              <div className='text-2xl font-bold text-green-600'>Extended</div>
              <div className='text-sm text-muted-foreground mt-1'>
                SLA &gt; 72 hours
              </div>
              <div className='mt-2 text-lg font-semibold'>
                {statistics?.avgSlaHours && statistics.avgSlaHours > 72
                  ? 'Yes'
                  : 'No'}
              </div>
            </div>
          </div>

          <div className='mt-6 p-4 bg-blue-50 rounded-lg'>
            <h4 className='font-medium text-blue-800 mb-2'>Recommendations:</h4>
            <ul className='text-sm text-blue-700 space-y-1'>
              {statistics?.avgPriorityLevel &&
                statistics.avgPriorityLevel <= 3 && (
                  <li>
                    • Consider adding more escalation levels for critical
                    priorities
                  </li>
                )}
              {statistics?.avgSlaHours && statistics.avgSlaHours > 72 && (
                <li>• Review SLA times for process optimization</li>
              )}
              {statistics?.activeCategories &&
                statistics.activeCategories / statistics.totalCategories <
                  0.5 && (
                  <li>
                    • Many categories are inactive - consider reviewing or
                    removing them
                  </li>
                )}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
