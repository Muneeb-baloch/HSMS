// src/app/(dashboard)/projects/view/[id]/page.tsx
'use client'

import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { useProject, useProjectTimeline } from '@/lib/hooks/entities/useProject'
import { ProjectStatus, ProjectType } from '@/lib/types/project'
import { formatDate } from '@/lib/utils/format'
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Globe,
  Home,
  Mail,
  MapPin,
  Phone,
  Ruler,
  TrendingUp,
  Users
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { Key } from 'react'
import { DetailPageSkeleton } from '@/components/shared/PageSkeleton'

export default function ViewProjectPage () {
  const router = useRouter()
  const params = useParams()

  const id = params.id as string
  const { data: project, isLoading } = useProject(id)
  const { data: timeline } = useProjectTimeline(id)

  if (isLoading) {
    return <DetailPageSkeleton />
  }

  if (!project) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Project Not Found</CardTitle>
            <CardDescription>
              The requested project does not exist or has been deleted.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/projects')}>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Projects
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusColors = {
    [ProjectStatus.PLANNING]: 'bg-blue-100 text-blue-800',
    [ProjectStatus.UNDER_DEVELOPMENT]: 'bg-orange-100 text-orange-800',
    [ProjectStatus.COMPLETED]: 'bg-green-100 text-green-800',
    [ProjectStatus.ON_HOLD]: 'bg-yellow-100 text-yellow-800',
    [ProjectStatus.CANCELLED]: 'bg-red-100 text-red-800'
  }

  const statusLabels = {
    [ProjectStatus.PLANNING]: 'Planning',
    [ProjectStatus.UNDER_DEVELOPMENT]: 'Under Development',
    [ProjectStatus.COMPLETED]: 'Completed',
    [ProjectStatus.ON_HOLD]: 'On Hold',
    [ProjectStatus.CANCELLED]: 'Cancelled'
  }

  const typeLabels = {
    [ProjectType.RESIDENTIAL]: 'Residential',
    [ProjectType.COMMERCIAL]: 'Commercial',
    [ProjectType.INDUSTRIAL]: 'Industrial',
    [ProjectType.MIXED_USE]: 'Mixed Use',
    [ProjectType.AGRICULTURAL]: 'Agricultural'
  }

  const progress = project.progressPercentage || 0
  const soldPercentage =
    project.totalPlots > 0 ? (project.plotsSold / project.totalPlots) * 100 : 0
  const reservedPercentage =
    project.totalPlots > 0
      ? (project.plotsReserved / project.totalPlots) * 100
      : 0
  const availablePercentage =
    project.totalPlots > 0
      ? (project.plotsAvailable / project.totalPlots) * 100
      : 0

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

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* Main Project Card */}
            <div className='lg:col-span-2'>
              <Card className='mb-6'>
                <CardHeader>
                  <div className='flex justify-between items-start'>
                    <div>
                      <CardTitle className='text-2xl'>
                        {project.projName}
                      </CardTitle>
                      <CardDescription>
                        {project.projLocation} •{' '}
                        {project.cityName || 'Unknown City'}
                        {project.stateName && `, ${project.stateName}`}
                      </CardDescription>
                    </div>
                    <div className='flex gap-2'>
                      <Badge
                        className={
                          statusColors[project.projStatus as ProjectStatus]
                        }
                      >
                        {statusLabels[project.projStatus as ProjectStatus]}
                      </Badge>
                      <Badge variant='outline'>
                        {typeLabels[project.projType as ProjectType]}
                      </Badge>
                      <Badge
                        className={
                          project.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }
                      >
                        {project.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='space-y-6'>
                  {/* Project Description */}
                  {project.projDescription && (
                    <div className='space-y-2'>
                      <div className='flex items-center gap-2 text-gray-500'>
                        <Home className='h-4 w-4' />
                        <span className='text-sm font-medium'>Description</span>
                      </div>
                      <p className='text-gray-800 pl-6'>
                        {project.projDescription}
                      </p>
                    </div>
                  )}

                  {/* Contact Information */}
                  {(project.website ||
                    project.contactEmail ||
                    project.contactPhone) && (
                    <div className='space-y-3'>
                      <div className='text-sm font-medium text-gray-500'>
                        Contact Information
                      </div>
                      <div className='grid grid-cols-1 md:grid-cols-3 gap-3 pl-6'>
                        {project.website && (
                          <div className='flex items-center gap-2'>
                            <Globe className='h-4 w-4 text-gray-400' />
                            <a
                              href={project.website}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='text-blue-600 hover:underline'
                            >
                              {project.website
                                .replace('https://', '')
                                .replace('http://', '')}
                            </a>
                          </div>
                        )}
                        {project.contactEmail && (
                          <div className='flex items-center gap-2'>
                            <Mail className='h-4 w-4 text-gray-400' />
                            <a
                              href={`mailto:${project.contactEmail}`}
                              className='text-blue-600 hover:underline'
                            >
                              {project.contactEmail}
                            </a>
                          </div>
                        )}
                        {project.contactPhone && (
                          <div className='flex items-center gap-2'>
                            <Phone className='h-4 w-4 text-gray-400' />
                            <a
                              href={`tel:${project.contactPhone}`}
                              className='text-blue-600 hover:underline'
                            >
                              {project.contactPhone}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Address */}
                  {project.address && (
                    <div className='space-y-2'>
                      <div className='flex items-center gap-2 text-gray-500'>
                        <MapPin className='h-4 w-4' />
                        <span className='text-sm font-medium'>Address</span>
                      </div>
                      <p className='text-gray-800 pl-6'>{project.address}</p>
                    </div>
                  )}

                  {/* Plot Statistics */}
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <div className='text-sm font-medium'>
                        Plot Distribution
                      </div>
                      <div className='text-sm text-gray-500'>
                        {project.plotsSold + project.plotsReserved} of{' '}
                        {project.totalPlots} plots assigned
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <div className='flex justify-between text-sm'>
                        <div className='flex items-center gap-2'>
                          <div className='w-3 h-3 rounded-full bg-green-500'></div>
                          <span>Sold ({project.plotsSold})</span>
                        </div>
                        <span>{soldPercentage.toFixed(1)}%</span>
                      </div>
                      <Progress value={soldPercentage} className='h-2' />
                    </div>

                    <div className='space-y-2'>
                      <div className='flex justify-between text-sm'>
                        <div className='flex items-center gap-2'>
                          <div className='w-3 h-3 rounded-full bg-yellow-500'></div>
                          <span>Reserved ({project.plotsReserved})</span>
                        </div>
                        <span>{reservedPercentage.toFixed(1)}%</span>
                      </div>
                      <Progress value={reservedPercentage} className='h-2' />
                    </div>

                    <div className='space-y-2'>
                      <div className='flex justify-between text-sm'>
                        <div className='flex items-center gap-2'>
                          <div className='w-3 h-3 rounded-full bg-blue-500'></div>
                          <span>Available ({project.plotsAvailable})</span>
                        </div>
                        <span>{availablePercentage.toFixed(1)}%</span>
                      </div>
                      <Progress value={availablePercentage} className='h-2' />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Timeline */}
              {timeline && timeline.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                      <Clock className='h-5 w-5' />
                      Project Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-4'>
                      {timeline.map((event: any, index: number) => (
                        <div key={index} className='flex items-start gap-4'>
                          <div className='flex flex-col items-center'>
                            <div
                              className={`w-3 h-3 rounded-full ${
                                event.status === 'completed'
                                  ? 'bg-green-500'
                                  : 'bg-gray-300'
                              }`}
                            ></div>
                            {index < timeline.length - 1 && (
                              <div className='w-px h-8 bg-gray-300 mt-2'></div>
                            )}
                          </div>
                          <div className='flex-1'>
                            <div className='flex justify-between'>
                              <div className='font-medium'>{event.event}</div>
                              <div className='text-sm text-gray-500'>
                                {event.date ? formatDate(event.date) : 'TBD'}
                              </div>
                            </div>
                            <div className='text-sm text-gray-500 mt-1'>
                              Status:{' '}
                              <span
                                className={
                                  event.status === 'completed'
                                    ? 'text-green-600'
                                    : 'text-yellow-600'
                                }
                              >
                                {event.status === 'completed'
                                  ? 'Completed'
                                  : 'Upcoming'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar Stats */}
            <div className='space-y-6'>
              {/* Project Stats Card */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>Project Statistics</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='space-y-3'>
                    <div className='flex justify-between items-center'>
                      <div className='flex items-center gap-2 text-gray-600'>
                        <Ruler className='h-4 w-4' />
                        <span className='text-sm'>Total Area</span>
                      </div>
                      <div className='font-semibold'>
                        {project.formattedArea ||
                          `${project.totalArea.toLocaleString()} ${
                            project.areaUnit
                          }`}
                      </div>
                    </div>

                    <div className='flex justify-between items-center'>
                      <div className='flex items-center gap-2 text-gray-600'>
                        <Home className='h-4 w-4' />
                        <span className='text-sm'>Total Plots</span>
                      </div>
                      <div className='font-semibold'>
                        {project.totalPlots.toLocaleString()}
                      </div>
                    </div>

                    <div className='flex justify-between items-center'>
                      <div className='flex items-center gap-2 text-gray-600'>
                        <DollarSign className='h-4 w-4' />
                        <span className='text-sm'>Plots Sold</span>
                      </div>
                      <div className='font-semibold'>
                        {project.plotsSold.toLocaleString()}
                      </div>
                    </div>

                    <div className='flex justify-between items-center'>
                      <div className='flex items-center gap-2 text-gray-600'>
                        <Users className='h-4 w-4' />
                        <span className='text-sm'>Plots Reserved</span>
                      </div>
                      <div className='font-semibold'>
                        {project.plotsReserved.toLocaleString()}
                      </div>
                    </div>

                    <div className='flex justify-between items-center'>
                      <div className='flex items-center gap-2 text-gray-600'>
                        <TrendingUp className='h-4 w-4' />
                        <span className='text-sm'>Available Plots</span>
                      </div>
                      <div className='font-semibold text-green-600'>
                        {project.plotsAvailable.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className='pt-4 border-t'>
                    <div className='text-center'>
                      <div className='text-3xl font-bold text-blue-600'>
                        {progress}%
                      </div>
                      <div className='text-sm text-gray-500'>
                        Overall Progress
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Project Details Card */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>Project Details</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-gray-600'>
                      <Calendar className='h-4 w-4' />
                      <span className='text-sm'>Launch Date</span>
                    </div>
                    <div className='font-medium pl-6'>
                      {formatDate(project.launchDate)}
                    </div>
                  </div>

                  {project.completionDate && (
                    <div className='space-y-2'>
                      <div className='flex items-center gap-2 text-gray-600'>
                        <CheckCircle className='h-4 w-4' />
                        <span className='text-sm'>Completion Date</span>
                      </div>
                      <div className='font-medium pl-6'>
                        {formatDate(project.completionDate)}
                      </div>
                    </div>
                  )}

                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-gray-600'>
                      <Globe className='h-4 w-4' />
                      <span className='text-sm'>Country</span>
                    </div>
                    <div className='font-medium pl-6'>{project.country}</div>
                  </div>

                  {project.nextPlotNumber && (
                    <div className='space-y-2'>
                      <div className='flex items-center gap-2 text-gray-600'>
                        <Home className='h-4 w-4' />
                        <span className='text-sm'>Next Plot Number</span>
                      </div>
                      <div className='font-medium pl-6'>
                        {project.nextPlotNumber}
                      </div>
                    </div>
                  )}

                  {project.projectAgeMonths !== undefined && (
                    <div className='space-y-2'>
                      <div className='flex items-center gap-2 text-gray-600'>
                        <Clock className='h-4 w-4' />
                        <span className='text-sm'>Project Age</span>
                      </div>
                      <div className='font-medium pl-6'>
                        {project.projectAgeMonths} month
                        {project.projectAgeMonths !== 1 ? 's' : ''}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Amenities Card */}
              {project.amenities && project.amenities.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg'>Amenities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='flex flex-wrap gap-2'>
                      {project.amenities.map(
                        (amenity: string, index: Key | null | undefined) => (
                          <Badge key={index} variant='secondary'>
                            {amenity
                              .replace('_', ' ')
                              .replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className='flex flex-col gap-3'>
                <Button
                  onClick={() => router.push(`/projects/edit/${id}`)}
                  className='w-full'
                >
                  Edit Project
                </Button>
                <Button
                  variant='outline'
                  onClick={() => router.push(`/projects/${id}/plots`)}
                  className='w-full'
                >
                  Manage Plots
                </Button>
                <Button
                  variant='outline'
                  onClick={() => router.push('/projects')}
                  className='w-full'
                >
                  Back to Projects
                </Button>
              </div>
            </div>
          </div>
        </div>
   
  )
}
