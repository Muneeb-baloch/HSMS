// src/app/(dashboard)/userstaff/statistics/page.tsx
'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useUserStaffStatistics } from '@/lib/hooks/entities/useUserStaff'
import { ArrowLeft, BarChart3, TrendingUp, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { StatsPageSkeleton } from '@/components/shared/PageSkeleton'

export default function UserStaffStatisticsPage () {
  const router = useRouter()
  const { data: statistics, isLoading } = useUserStaffStatistics()

  if (isLoading) {
    return <StatsPageSkeleton />
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
        <h1 className='text-2xl font-bold mb-2'>User Statistics</h1>
        <p className='text-muted-foreground mb-6'>
          Comprehensive analytics and insights about system users
        </p>
      </div>

      {/* Overview Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold'>
              {statistics?.totalUsers || 0}
            </div>
            <p className='text-sm text-muted-foreground mt-1'>
              All registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold text-green-600'>
              {statistics?.activeUsers || 0}
            </div>
            <p className='text-sm text-muted-foreground mt-1'>
              {statistics?.inactiveUsers || 0} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Locked Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold text-yellow-600'>
              {statistics?.lockedUsers || 0}
            </div>
            <p className='text-sm text-muted-foreground mt-1'>
              Accounts temporarily locked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Email Verified
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold text-blue-600'>
              {statistics?.usersWithEmail || 0}
            </div>
            <p className='text-sm text-muted-foreground mt-1'>
              {statistics?.usersWithoutEmail || 0} without email
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Charts */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* By Role */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Users className='h-5 w-5' />
              Users by Role
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statistics?.byRole && Object.keys(statistics.byRole).length > 0 ? (
              <div className='space-y-3'>
                {Object.entries(statistics.byRole).map(([role, count]) => {
                  const percentage = (
                    (count / statistics.totalUsers) *
                    100
                  ).toFixed(1)
                  return (
                    <div key={role} className='space-y-1'>
                      <div className='flex justify-between text-sm'>
                        <span className='font-medium'>{role}</span>
                        <span>
                          {count} ({percentage}%)
                        </span>
                      </div>
                      <div className='h-2 bg-gray-100 rounded-full overflow-hidden'>
                        <div
                          className='h-full bg-blue-500 rounded-full'
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className='text-center py-8 text-muted-foreground'>
                No role data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* By City */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <BarChart3 className='h-5 w-5' />
              Users by City
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statistics?.byCity && Object.keys(statistics.byCity).length > 0 ? (
              <div className='space-y-3'>
                {Object.entries(statistics.byCity)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 8)
                  .map(([city, count]) => {
                    const percentage = (
                      (count / statistics.totalUsers) *
                      100
                    ).toFixed(1)
                    return (
                      <div key={city} className='space-y-1'>
                        <div className='flex justify-between text-sm'>
                          <span className='font-medium'>{city}</span>
                          <span>
                            {count} ({percentage}%)
                          </span>
                        </div>
                        <div className='h-2 bg-gray-100 rounded-full overflow-hidden'>
                          <div
                            className='h-full bg-green-500 rounded-full'
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
              </div>
            ) : (
              <div className='text-center py-8 text-muted-foreground'>
                No city data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Growth */}
      {statistics?.monthlyGrowth && statistics.monthlyGrowth.length > 0 && (
        <Card className='mt-6'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <TrendingUp className='h-5 w-5' />
              Monthly User Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='h-64 flex items-end gap-2'>
              {statistics.monthlyGrowth.map((item, index) => {
                const maxCount = Math.max(
                  ...statistics.monthlyGrowth.map(m => m.count)
                )
                const height = (item.count / maxCount) * 100
                return (
                  <div
                    key={index}
                    className='flex-1 flex flex-col items-center'
                  >
                    <div
                      className='w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-lg'
                      style={{ height: `${height}%` }}
                    />
                    <div className='text-xs text-muted-foreground mt-2 truncate w-full text-center'>
                      {item.month}
                    </div>
                    <div className='text-xs font-medium mt-1'>{item.count}</div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
