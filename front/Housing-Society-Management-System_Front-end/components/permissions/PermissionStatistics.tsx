'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface PermissionStatistics {
  totalPermissions: number
  activePermissions: number
  inactivePermissions: number
  totalModules: number
  totalRoles: number
  totalUsers: number
}

interface PermissionStatisticsProps {
  statistics: PermissionStatistics | null
  loading?: boolean
}

export function PermissionStatistics({ statistics, loading }: PermissionStatisticsProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    )
  }

  const stats = statistics || {
    totalPermissions: 0,
    activePermissions: 0,
    inactivePermissions: 0,
    totalModules: 0,
    totalRoles: 0,
    totalUsers: 0,
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Statistics Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Roles</p>
              <p className="text-2xl font-bold">{stats.totalRoles}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
