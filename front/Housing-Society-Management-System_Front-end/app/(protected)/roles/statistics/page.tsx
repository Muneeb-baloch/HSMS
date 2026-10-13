// src/app/(protected)/roles/statistics/page.tsx
'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useUserRoleStatistics } from '@/lib/hooks/entities/useUserRole'
import {
  ArrowLeft,
  BarChart3,
  Lock,
  Shield,
  TrendingUp,
  Users
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { StatsPageSkeleton } from '@/components/shared/PageSkeleton'

export default function RoleStatisticsPage () {
  const router = useRouter()
  const { data: stats, isLoading } = useUserRoleStatistics()

  if (isLoading) {
    return <StatsPageSkeleton />
  }

  return (
    <div className='space-y-6 p-4 sm:p-6 md:p-8'>
      <div className='flex items-center gap-4'>
        <Button variant='ghost' size='sm' onClick={() => router.push('/roles')}>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back to Roles
        </Button>
        <div>
          <h1 className='text-3xl font-bold'>Role Statistics</h1>
          <p className='text-muted-foreground'>
            Overview of role distribution and usage
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Roles</CardTitle>
            <Shield className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats?.totalRoles || 0}</div>
            <p className='text-xs text-muted-foreground'>All defined roles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Active Roles</CardTitle>
            <TrendingUp className='h-4 w-4 text-green-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats?.activeRoles || 0}</div>
            <p className='text-xs text-muted-foreground'>Currently in use</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>System Roles</CardTitle>
            <Lock className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats?.systemRoles || 0}</div>
            <p className='text-xs text-muted-foreground'>Protected roles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Users</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {stats?.totalUsersWithRoles || 0}
            </div>
            <p className='text-xs text-muted-foreground'>Assigned to roles</p>
          </CardContent>
        </Card>
      </div>

      {/* By Role Level */}
      <Card>
        <CardHeader>
          <CardTitle>Roles by Level</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {stats?.byRoleLevel &&
              Object.entries(stats.byRoleLevel).map(([level, count]) => (
                <div key={level} className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <div className='h-2 w-2 rounded-full bg-blue-500' />
                    <span className='text-sm font-medium'>{level}</span>
                  </div>
                  <span className='text-sm text-muted-foreground'>
                    {String(count)} roles
                  </span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Roles by User Count */}
      <Card>
        <CardHeader>
          <CardTitle>Most Assigned Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {stats?.topRolesByUserCount?.map((role: any) => (
              <div
                key={role.roleName}
                className='flex items-center justify-between'
              >
                <div className='flex items-center gap-2'>
                  <div className='h-2 w-2 rounded-full bg-green-500' />
                  <span className='text-sm font-medium'>{role.roleName}</span>
                </div>
                <span className='text-sm text-muted-foreground'>
                  {role.userCount} users
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
