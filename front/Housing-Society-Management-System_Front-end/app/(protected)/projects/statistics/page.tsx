// src/app/(dashboard)/projects/statistics/page.tsx
'use client'

import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { useProjectStatistics } from '@/lib/hooks/entities/useProject'
import { ProjectStatus, ProjectType } from '@/lib/types/project'
import {
  ArrowLeft,
  BarChart3,
  Calendar,
  DollarSign,
  Home,
  MapPin,
  PieChart,
  TrendingUp,
  Users
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { StatsPageSkeleton } from '@/components/shared/PageSkeleton'

export default function ProjectStatisticsPage () {
  const router = useRouter()
  const { data: stats, isLoading } = useProjectStatistics()

  if (isLoading) {
    return <StatsPageSkeleton />
  }

  return (

        <div className='p-6'>
          <Button
            variant='ghost'
            onClick={() => router.back()}
            className='mb-6'
          >
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back
          </Button>

          <div className='mb-8'>
            <h1 className='text-3xl font-bold mb-2'>Project Statistics</h1>
            <p className='text-gray-600'>
              Comprehensive overview of all projects and their performance
              metrics
            </p>
          </div>

          {/* Summary Cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
            <Card>
              <CardContent className='pt-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <div className='text-sm text-gray-500'>Total Projects</div>
                    <div className='text-3xl font-bold'>
                      {stats?.totalProjects || 0}
                    </div>
                  </div>
                  <div className='p-3 bg-blue-100 rounded-full'>
                    <Home className='h-6 w-6 text-blue-600' />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='pt-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <div className='text-sm text-gray-500'>Total Plots</div>
                    <div className='text-3xl font-bold'>
                      {stats?.totalPlots?.toLocaleString() || 0}
                    </div>
                  </div>
                  <div className='p-3 bg-green-100 rounded-full'>
                    <PieChart className='h-6 w-6 text-green-600' />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='pt-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <div className='text-sm text-gray-500'>Plots Sold</div>
                    <div className='text-3xl font-bold'>
                      {stats?.plotsSold?.toLocaleString() || 0}
                    </div>
                  </div>
                  <div className='p-3 bg-orange-100 rounded-full'>
                    <DollarSign className='h-6 w-6 text-orange-600' />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='pt-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <div className='text-sm text-gray-500'>Avg Progress</div>
                    <div className='text-3xl font-bold'>
                      {stats?.averageProgress || 0}%
                    </div>
                  </div>
                  <div className='p-3 bg-purple-100 rounded-full'>
                    <TrendingUp className='h-6 w-6 text-purple-600' />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <BarChart3 className='h-5 w-5' />
                  Projects by Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {Object.entries(stats?.byStatus || {}).map(
                    ([status, count]) => {
                      const total = stats?.totalProjects || 1
                      const percentage = Math.round((count / total) * 100)
                      const statusLabels = {
                        [ProjectStatus.PLANNING]: 'Planning',
                        [ProjectStatus.UNDER_DEVELOPMENT]: 'Under Development',
                        [ProjectStatus.COMPLETED]: 'Completed',
                        [ProjectStatus.ON_HOLD]: 'On Hold',
                        [ProjectStatus.CANCELLED]: 'Cancelled'
                      }

                      const statusColors = {
                        [ProjectStatus.PLANNING]: 'bg-blue-500',
                        [ProjectStatus.UNDER_DEVELOPMENT]: 'bg-orange-500',
                        [ProjectStatus.COMPLETED]: 'bg-green-500',
                        [ProjectStatus.ON_HOLD]: 'bg-yellow-500',
                        [ProjectStatus.CANCELLED]: 'bg-red-500'
                      }

                      return (
                        <div key={status} className='space-y-2'>
                          <div className='flex justify-between'>
                            <div className='flex items-center gap-2'>
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  statusColors[status as ProjectStatus] ||
                                  'bg-gray-500'
                                }`}
                              ></div>
                              <span>
                                {statusLabels[status as ProjectStatus] ||
                                  status}
                              </span>
                            </div>
                            <div className='font-medium'>
                              {count} ({percentage}%)
                            </div>
                          </div>
                          <div className='w-full bg-gray-200 rounded-full h-2'>
                            <div
                              className={`h-2 rounded-full ${
                                statusColors[status as ProjectStatus] ||
                                'bg-gray-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      )
                    }
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <PieChart className='h-5 w-5' />
                  Projects by Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {Object.entries(stats?.byType || {}).map(([type, count]) => {
                    const total = stats?.totalProjects || 1
                    const percentage = Math.round((count / total) * 100)
                    const typeLabels = {
                      [ProjectType.RESIDENTIAL]: 'Residential',
                      [ProjectType.COMMERCIAL]: 'Commercial',
                      [ProjectType.INDUSTRIAL]: 'Industrial',
                      [ProjectType.MIXED_USE]: 'Mixed Use',
                      [ProjectType.AGRICULTURAL]: 'Agricultural'
                    }

                    const typeColors = {
                      [ProjectType.RESIDENTIAL]: 'bg-blue-500',
                      [ProjectType.COMMERCIAL]: 'bg-green-500',
                      [ProjectType.INDUSTRIAL]: 'bg-purple-500',
                      [ProjectType.MIXED_USE]: 'bg-yellow-500',
                      [ProjectType.AGRICULTURAL]: 'bg-red-500'
                    }

                    return (
                      <div key={type} className='space-y-2'>
                        <div className='flex justify-between'>
                          <div className='flex items-center gap-2'>
                            <div
                              className={`w-3 h-3 rounded-full ${
                                typeColors[type as ProjectType] || 'bg-gray-500'
                              }`}
                            ></div>
                            <span>
                              {typeLabels[type as ProjectType] || type}
                            </span>
                          </div>
                          <div className='font-medium'>
                            {count} ({percentage}%)
                          </div>
                        </div>
                        <div className='w-full bg-gray-200 rounded-full h-2'>
                          <div
                            className={`h-2 rounded-full ${
                              typeColors[type as ProjectType] || 'bg-gray-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* City Distribution */}
            {stats?.byCity && Object.keys(stats.byCity).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <MapPin className='h-5 w-5' />
                    Top Cities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {Object.entries(stats.byCity)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 5)
                      .map(([city, count]) => (
                        <div key={city} className='space-y-2'>
                          <div className='flex justify-between'>
                            <span>{city}</span>
                            <div className='font-medium'>{count} projects</div>
                          </div>
                          <div className='w-full bg-gray-200 rounded-full h-2'>
                            <div
                              className='h-2 rounded-full bg-indigo-500'
                              style={{
                                width: `${
                                  (count /
                                    Math.max(...Object.values(stats.byCity))) *
                                  100
                                }%`
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Projects */}
            {stats?.recentProjects && stats.recentProjects.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Calendar className='h-5 w-5' />
                    Recent Projects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {stats.recentProjects.map(project => (
                      <div
                        key={project._id}
                        className='p-3 border rounded-lg hover:bg-gray-50 cursor-pointer'
                        onClick={() =>
                          router.push(`/projects/view/${project._id}`)
                        }
                      >
                        <div className='flex justify-between items-start'>
                          <div>
                            <div className='font-medium'>
                              {project.projName}
                            </div>
                            <div className='text-sm text-gray-500'>
                              {project.projLocation}
                            </div>
                          </div>
                          <div className='text-sm text-gray-500'>
                            {project.progressPercentage || 0}%
                          </div>
                        </div>
                        <div className='mt-2 flex items-center justify-between text-sm'>
                          <div className='flex items-center gap-2'>
                            <Users className='h-3 w-3' />
                            <span>
                              {(project.plotsSold ?? 0) +
                                (project.plotsReserved ?? 0)}
                              /{project.totalPlots ?? 0} plots
                            </span>
                          </div>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              project.projStatus === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : project.projStatus === 'under_development'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {project.projStatus === 'completed'
                              ? 'Completed'
                              : project.projStatus === 'under_development'
                              ? 'In Progress'
                              : 'Planning'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Additional Statistics */}
          <Card className='mt-6'>
            <CardHeader>
              <CardTitle className='text-lg'>Plot Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <div className='text-center p-4 bg-gray-50 rounded-lg'>
                  <div className='text-2xl font-bold text-green-600'>
                    {stats?.plotsSold?.toLocaleString() || 0}
                  </div>
                  <div className='text-sm text-gray-600'>Plots Sold</div>
                  <div className='text-xs text-gray-500 mt-1'>
                    {stats?.totalPlots
                      ? Math.round((stats.plotsSold / stats.totalPlots) * 100)
                      : 0}
                    % of total
                  </div>
                </div>

                <div className='text-center p-4 bg-gray-50 rounded-lg'>
                  <div className='text-2xl font-bold text-yellow-600'>
                    {stats?.plotsReserved?.toLocaleString() || 0}
                  </div>
                  <div className='text-sm text-gray-600'>Plots Reserved</div>
                  <div className='text-xs text-gray-500 mt-1'>
                    {stats?.totalPlots
                      ? Math.round(
                          (stats.plotsReserved / stats.totalPlots) * 100
                        )
                      : 0}
                    % of total
                  </div>
                </div>

                <div className='text-center p-4 bg-gray-50 rounded-lg'>
                  <div className='text-2xl font-bold text-blue-600'>
                    {stats?.plotsAvailable?.toLocaleString() || 0}
                  </div>
                  <div className='text-sm text-gray-600'>Plots Available</div>
                  <div className='text-xs text-gray-500 mt-1'>
                    {stats?.totalPlots
                      ? Math.round(
                          (stats.plotsAvailable / stats.totalPlots) * 100
                        )
                      : 0}
                    % of total
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
   
  )
}
