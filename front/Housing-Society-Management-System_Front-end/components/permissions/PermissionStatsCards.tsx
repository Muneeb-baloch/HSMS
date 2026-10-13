// components/permissions/PermissionStatsCards.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Lock, Shield, Zap } from 'lucide-react'

interface PermissionStatistics {
  totalPermissions: number
  activePermissions: number
  inactivePermissions: number
  totalModules: number
  totalRoles: number
  totalUsers: number
}

interface PermissionStatsCardsProps {
  statistics: PermissionStatistics | null
  isLoading?: boolean
}

export function PermissionStatsCards ({
  statistics,
  isLoading = false
}: PermissionStatsCardsProps) {
  if (isLoading) {
    return (
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <div className='h-4 w-24 animate-pulse rounded bg-muted' />
              <div className='h-4 w-4 animate-pulse rounded bg-muted' />
            </CardHeader>
            <CardContent>
              <div className='h-8 w-16 animate-pulse rounded bg-muted' />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const stats = statistics || {
    totalPermissions: 0,
    activePermissions: 0,
    inactivePermissions: 0,
    totalModules: 0,
    totalRoles: 0,
    totalUsers: 0
  }

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>
            Total Permissions
          </CardTitle>
          <Shield className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.totalPermissions}</div>
          <p className='text-xs text-muted-foreground'>
            {stats.activePermissions} active, {stats.inactivePermissions}{' '}
            inactive
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>
            Active Permissions
          </CardTitle>
          <CheckCircle2 className='h-4 w-4 text-green-500' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.activePermissions}</div>
          <p className='text-xs text-muted-foreground'>Currently in use</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Modules</CardTitle>
          <Zap className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.totalModules}</div>
          <p className='text-xs text-muted-foreground'>Permission groups</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Roles</CardTitle>
          <Lock className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.totalRoles}</div>
          <p className='text-xs text-muted-foreground'>
            With assigned permissions
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
