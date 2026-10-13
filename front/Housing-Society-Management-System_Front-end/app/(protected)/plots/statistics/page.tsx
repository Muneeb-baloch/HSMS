// src/app/(dashboard)/plots/statistics/page.tsx
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { usePlotStatistics } from '@/lib/hooks/entities/usePlot'
import { PlotType } from '@/lib/types/plot'
import { useActiveProjects } from '@/lib/hooks/entities/useProject'
import {
  ArrowLeft,
  BarChart3,
  Building,
  DollarSign,
  Map,
  PieChart,
  TrendingUp
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { InlineSkeleton } from '@/components/shared/PageSkeleton'

export default function PlotStatisticsPage () {
  const router = useRouter()
  const [projectId, setProjectId] = useState<string>('')

  const { data: statistics, isLoading } = usePlotStatistics(
    projectId || undefined
  )

  const { data: projects } = useActiveProjects()

  const getPlotTypeColor = (type: PlotType) => {
    const colors = {
      [PlotType.RESIDENTIAL]: 'text-blue-600 bg-blue-100',
      [PlotType.COMMERCIAL]: 'text-purple-600 bg-purple-100',
      [PlotType.INDUSTRIAL]: 'text-gray-600 bg-gray-100',
      [PlotType.AGRICULTURAL]: 'text-green-600 bg-green-100',
      [PlotType.CORNER]: 'text-yellow-600 bg-yellow-100',
      [PlotType.PARK_FACING]: 'text-teal-600 bg-teal-100',
      [PlotType.MAIN_BOULEVARD]: 'text-pink-600 bg-pink-100',
      [PlotType.STANDARD]: 'text-indigo-600 bg-indigo-100'
    }
    return colors[type] || 'text-gray-600 bg-gray-100'
  }

  return (
    <div className='p-6'>
      <div className='mb-6'>
        <Button variant='ghost' onClick={() => router.back()} className='mb-4'>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back to Plots
        </Button>

        <div className='flex justify-between items-start'>
          <div>
            <h1 className='text-3xl font-bold flex items-center gap-2'>
              <BarChart3 className='h-8 w-8' />
              Plot Statistics
            </h1>
            <p className='text-gray-500 mt-2'>
              Analytics and insights about plot inventory
            </p>
          </div>

          <div className='flex gap-4'>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger className='h-11 enhanced-input'>
                <SelectValue placeholder='Filter by Project' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Projects</SelectItem>
                {projects?.map((project) => (
                  <SelectItem key={project._id} value={project._id}>
                    {project.projName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant='outline' onClick={() => router.push('/plots/map')}>
              <Map className='mr-2 h-4 w-4' />
              Map View
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
            <InlineSkeleton />
          ) : (
        <Card>
          <CardContent className='p-12 text-center'>
            <p className='text-gray-500'>No statistics data available</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
