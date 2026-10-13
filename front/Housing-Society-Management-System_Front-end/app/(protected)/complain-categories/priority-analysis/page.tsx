// src/app/(dashboard)/complaincatg/priority-analysis/page.tsx
'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSrComplaintCategories } from '@/lib/hooks/entities/useSrComplaintCategory'
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Clock,
  Download,
  Filter,
  TrendingUp
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { DetailPageSkeleton } from '@/components/shared/PageSkeleton'

export default function PriorityAnalysisPage () {
  const router = useRouter()
  const [priorityFilter, setPriorityFilter] = useState<string>('all')

  const handleExportAnalysis = () => {
    if (!categories?.complaintCategories?.length) return

    const rows = categories.complaintCategories.map(cat => ({
      'Category Name': cat.categoryName,
      'Category Code': cat.categoryCode,
      'Priority Level': cat.priorityLevel,
      'Priority': cat.priorityLevel <= 3 ? 'Critical' : cat.priorityLevel <= 6 ? 'Medium' : 'Low',
      'SLA Hours': cat.slaHours || 'N/A',
      'Active': cat.isActive ? 'Yes' : 'No',
      'Escalation Levels': cat.escalationLevels?.length || 0,
      'Description': cat.description || ''
    }))

    const headers = Object.keys(rows[0])
    const csvContent = [
      headers.join(','),
      ...rows.map(row => headers.map(h => `"${String(row[h as keyof typeof row]).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `priority-analysis-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const { data: categories, isLoading } = useSrComplaintCategories({
    sortBy: 'priorityLevel',
    sortOrder: 'asc'
  })

  if (isLoading) {
    return <DetailPageSkeleton />
  }

  const filteredCategories = categories?.complaintCategories.filter(
    category => {
      if (priorityFilter === 'critical') return category.priorityLevel <= 3
      if (priorityFilter === 'medium')
        return category.priorityLevel > 3 && category.priorityLevel <= 6
      if (priorityFilter === 'low') return category.priorityLevel > 6
      return true
    }
  )

  const getPriorityStats = () => {
    const stats = {
      critical: { count: 0, avgSla: 0, active: 0 },
      medium: { count: 0, avgSla: 0, active: 0 },
      low: { count: 0, avgSla: 0, active: 0 }
    }

    categories?.complaintCategories.forEach(category => {
      if (category.priorityLevel <= 3) {
        stats.critical.count++
        stats.critical.avgSla += category.slaHours || 0
        if (category.isActive) stats.critical.active++
      } else if (category.priorityLevel <= 6) {
        stats.medium.count++
        stats.medium.avgSla += category.slaHours || 0
        if (category.isActive) stats.medium.active++
      } else {
        stats.low.count++
        stats.low.avgSla += category.slaHours || 0
        if (category.isActive) stats.low.active++
      }
    })

    if (stats.critical.count > 0) stats.critical.avgSla /= stats.critical.count
    if (stats.medium.count > 0) stats.medium.avgSla /= stats.medium.count
    if (stats.low.count > 0) stats.low.avgSla /= stats.low.count

    return stats
  }

  const stats = getPriorityStats()

  const getPriorityColor = (priority: number) => {
    if (priority <= 3) return 'bg-red-100 text-red-800'
    if (priority <= 6) return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  const getPriorityLabel = (priority: number) => {
    if (priority <= 3) return 'Critical'
    if (priority <= 6) return 'Medium'
    return 'Low'
  }

  const getSlaColor = (slaHours?: number) => {
    if (!slaHours) return 'bg-gray-100 text-gray-800'
    if (slaHours <= 24) return 'bg-red-100 text-red-800'
    if (slaHours <= 48) return 'bg-orange-100 text-orange-800'
    return 'bg-blue-100 text-blue-800'
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
        <Button variant='outline' size='sm' onClick={handleExportAnalysis}>
          <Download className='mr-2 h-4 w-4' />
          Export Analysis
        </Button>
      </div>

      <div>
        <h1 className='text-2xl font-bold mb-2'>Priority Analysis</h1>
        <p className='text-muted-foreground mb-6'>
          Detailed analysis of complaint categories by priority level
        </p>
      </div>

      {/* Priority Summary */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Critical Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold text-red-600'>
              {stats.critical.count}
            </div>
            <div className='text-sm text-muted-foreground mt-1'>
              {stats.critical.active} active • Avg. SLA:{' '}
              {stats.critical.avgSla.toFixed(0)}h
            </div>
            <div className='mt-3 text-xs'>
              <Badge className='bg-red-100 text-red-800'>
                Immediate attention required
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Medium Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold text-yellow-600'>
              {stats.medium.count}
            </div>
            <div className='text-sm text-muted-foreground mt-1'>
              {stats.medium.active} active • Avg. SLA:{' '}
              {stats.medium.avgSla.toFixed(0)}h
            </div>
            <div className='mt-3 text-xs'>
              <Badge className='bg-yellow-100 text-yellow-800'>
                Standard resolution timeline
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Low Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold text-green-600'>
              {stats.low.count}
            </div>
            <div className='text-sm text-muted-foreground mt-1'>
              {stats.low.active} active • Avg. SLA:{' '}
              {stats.low.avgSla.toFixed(0)}h
            </div>
            <div className='mt-3 text-xs'>
              <Badge className='bg-green-100 text-green-800'>
                Flexible resolution timeline
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className='mb-6'>
        <CardContent className='pt-6'>
          <div className='flex flex-col md:flex-row gap-4'>
            <div className='flex-1'>
              <div className='flex items-center gap-2 mb-2'>
                <Filter className='h-4 w-4 text-muted-foreground' />
                <span className='text-sm font-medium'>Filter by Priority:</span>
              </div>
              <div className='flex gap-2'>
                {[
                  { value: 'all', label: 'All Priorities' },
                  { value: 'critical', label: 'Critical (1-3)' },
                  { value: 'medium', label: 'Medium (4-6)' },
                  { value: 'low', label: 'Low (7-10)' }
                ].map(filter => (
                  <Button
                    key={filter.value}
                    variant={
                      priorityFilter === filter.value ? 'default' : 'outline'
                    }
                    size='sm'
                    onClick={() => setPriorityFilter(filter.value)}
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Priority Analysis Chart */}
      <Card className='mb-8'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <BarChart3 className='h-5 w-5' />
            Priority Distribution Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='h-64 flex items-end gap-2'>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(priority => {
              const count =
                categories?.complaintCategories.filter(
                  cat => cat.priorityLevel === priority
                ).length || 0
              const maxCount = Math.max(
                ...Array.from(
                  { length: 10 },
                  (_, i) =>
                    categories?.complaintCategories.filter(
                      cat => cat.priorityLevel === i + 1
                    ).length || 0
                )
              )
              const height = (count / maxCount) * 100
              const color =
                priority <= 3
                  ? 'bg-red-500'
                  : priority <= 6
                  ? 'bg-yellow-500'
                  : 'bg-green-500'

              return (
                <div
                  key={priority}
                  className='flex-1 flex flex-col items-center'
                >
                  <div
                    className={`w-full ${color} rounded-t-lg`}
                    style={{ height: `${height}%` }}
                  />
                  <div className='text-xs text-muted-foreground mt-2'>
                    L{priority}
                  </div>
                  <div className='text-xs font-medium mt-1'>{count}</div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Categories List */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <AlertTriangle className='h-5 w-5' />
            Categories by Priority
            <Badge variant='outline' className='ml-2'>
              {filteredCategories?.length || 0} categories
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCategories && filteredCategories.length > 0 ? (
            <div className='space-y-4'>
              {filteredCategories.map(category => (
                <div
                  key={category._id}
                  className='border rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer'
                  onClick={() =>
                    router.push(`/complaincatg/view/${category._id}`)
                  }
                >
                  <div className='flex items-center justify-between mb-3'>
                    <div>
                      <h4 className='font-medium'>{category.categoryName}</h4>
                      <p className='text-sm text-muted-foreground'>
                        Code: {category.categoryCode}
                      </p>
                    </div>
                    <div className='flex gap-2'>
                      <Badge
                        className={getPriorityColor(category.priorityLevel)}
                      >
                        Level {category.priorityLevel}
                      </Badge>
                      <Badge className={getSlaColor(category.slaHours)}>
                        SLA: {category.slaHours || 'N/A'}h
                      </Badge>
                      <Badge
                        variant={category.isActive ? 'default' : 'outline'}
                      >
                        {category.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>

                  <p className='text-sm text-gray-600 line-clamp-2 mb-3'>
                    {category.description || 'No description'}
                  </p>

                  <div className='flex items-center justify-between text-sm'>
                    <div className='flex items-center gap-2'>
                      <Clock className='h-3 w-3' />
                      <span>
                        Escalation Levels:{' '}
                        {category.escalationLevels?.length || 0}
                      </span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <TrendingUp className='h-3 w-3' />
                      <span>
                        Priority: {getPriorityLabel(category.priorityLevel)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='text-center py-8 text-muted-foreground'>
              No categories found with the selected filter
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
