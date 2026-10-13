'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { useProjectStatistics } from '@/lib/hooks/entities/useProject'
import { Calendar, Home, Users } from 'lucide-react'
import { DetailPageSkeleton } from '@/components/shared/PageSkeleton'

export default function LifecyclePage () {
  const { data: stats, isLoading } = useProjectStatistics()

  const byStatus: Record<string, number> = (stats?.byStatus as Record<string, number>) ?? {}
  const totalProjects = stats?.totalProjects ?? 0

  // Map project statuses to lifecycle stages with colors
  const lifecycleStages = [
    { stage: 'Planning', statusKey: 'PLANNING', color: 'bg-blue-500' },
    { stage: 'Approved', statusKey: 'APPROVED', color: 'bg-purple-500' },
    { stage: 'In Progress', statusKey: 'IN_PROGRESS', color: 'bg-yellow-500' },
    { stage: 'Under Construction', statusKey: 'UNDER_CONSTRUCTION', color: 'bg-orange-500' },
    { stage: 'Completed', statusKey: 'COMPLETED', color: 'bg-green-500' },
    { stage: 'On Hold', statusKey: 'ON_HOLD', color: 'bg-gray-500' },
    { stage: 'Cancelled', statusKey: 'CANCELLED', color: 'bg-red-500' }
  ]

  // Get count for a status key, trying multiple case variations
  const getStatusCount = (key: string): number => {
    if (byStatus[key] !== undefined) return byStatus[key]
    const lower = key.toLowerCase()
    const entry = Object.entries(byStatus).find(([k]) => k.toLowerCase() === lower || k.toLowerCase().replace(/[_\s-]/g, '') === lower.replace(/[_\s-]/g, ''))
    return entry ? (entry[1] as number) : 0
  }

  const stages = lifecycleStages
    .map(s => ({ ...s, count: getStatusCount(s.statusKey) }))
    .filter(s => s.count > 0)

  // Also include any statuses from backend that don't match our predefined stages
  const knownKeys = new Set(lifecycleStages.map(s => s.statusKey.toLowerCase().replace(/[_\s-]/g, '')))
  const extraStages = Object.entries(byStatus)
    .filter(([k]) => !knownKeys.has(k.toLowerCase().replace(/[_\s-]/g, '')))
    .map(([k, v]) => ({ stage: k.replace(/_/g, ' '), statusKey: k, color: 'bg-indigo-500', count: v as number }))

  const allStages = [...stages, ...extraStages]

  // Summary cards: group into 3 categories
  const planningCount = allStages.filter(s => ['PLANNING', 'APPROVED'].includes(s.statusKey)).reduce((acc, s) => acc + s.count, 0)
  const activeCount = allStages.filter(s => ['IN_PROGRESS', 'UNDER_CONSTRUCTION'].includes(s.statusKey)).reduce((acc, s) => acc + s.count, 0)
  const completedCount = allStages.filter(s => ['COMPLETED'].includes(s.statusKey)).reduce((acc, s) => acc + s.count, 0)

  if (isLoading) {
    return <DetailPageSkeleton />
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold'>Lifecycle Management</h1>
        <p className='text-muted-foreground'>
          Manage the complete lifecycle of housing society projects
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Planning Phase
            </CardTitle>
            <Calendar className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{planningCount} Projects</div>
            <p className='text-xs text-muted-foreground'>In planning stage</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Active Construction</CardTitle>
            <Home className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{activeCount} Projects</div>
            <p className='text-xs text-muted-foreground'>Under construction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Completed</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{completedCount} Projects</div>
            <p className='text-xs text-muted-foreground'>
              Completed & handed over
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lifecycle Stages</CardTitle>
          <CardDescription>
            Track your projects through different lifecycle stages ({totalProjects} total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {allStages.length > 0 ? (
              allStages.map((item, index) => (
                <div key={index} className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className='capitalize'>{item.stage.toLowerCase()}</span>
                  </div>
                  <div className='flex items-center gap-3'>
                    <span className='font-medium'>{item.count} projects</span>
                    {totalProjects > 0 && (
                      <span className='text-xs text-muted-foreground'>
                        ({Math.round((item.count / totalProjects) * 100)}%)
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className='text-sm text-muted-foreground text-center py-4'>
                No project data available
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
