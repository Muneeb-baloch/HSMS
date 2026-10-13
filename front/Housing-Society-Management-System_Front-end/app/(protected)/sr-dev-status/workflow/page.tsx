// src/app/(dashboard)/sr-dev-status/workflow/page.tsx
'use client'

import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import {
  DEV_CATEGORY_LABELS,
  DEV_PHASE_COLORS,
  DEV_PHASE_LABELS
} from '@/lib/constants/srDevStatus.constants'
import { useDevelopmentWorkflow } from '@/lib/hooks/entities/useSrDevStatus'
import { DevCategory, DevPhase } from '@/lib/types/srdevstatus'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  ChevronRight,
  Clock,
  TrendingUp
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { DetailPageSkeleton } from '@/components/shared/PageSkeleton'
export type WorkflowStatus = {
  _id: string
  srDevStatName: string
  srDevStatCode: string
  devCategory: DevCategory
  percentageComplete: number
  estimatedDurationDays?: number
  requiresDocumentation: boolean
  colorCode: string
  progressColor?: string
}

export type WorkflowPhase = {
  phase: DevPhase
  phaseProgress: number
  totalStatuses: number
  completedStatuses: number
  estimatedDuration: number
  statuses: WorkflowStatus[]
}

// Type your API response
export type WorkflowResponse = {
  success: boolean
  message?: string
  data: WorkflowPhase[]
}

export default function DevelopmentWorkflowPage () {
  const router = useRouter()
  const { data, isLoading } = useDevelopmentWorkflow()
  const workflowData = data as WorkflowPhase[] | undefined

  if (isLoading) {
    return <DetailPageSkeleton />
  }

  return (

        <div className='p-6'>
          <div className='mb-6'>
            <Button
              variant='ghost'
              onClick={() => router.push('/sr-dev-status')}
              className='mb-4'
            >
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Development Statuses
            </Button>

            <h1 className='text-3xl font-bold'>Development Workflow</h1>
            <p className='text-gray-500 mt-2'>
              Visual representation of development phases and status progression
            </p>
          </div>

          {workflowData && workflowData.length > 0 ? (
            <div className='space-y-8'>
              {/* Overall Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <TrendingUp className='h-5 w-5' />
                    Overall Development Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                      {workflowData.map((phase: any) => (
                        <div key={phase.phase} className='text-center'>
                          <div className='text-sm font-medium text-gray-500 mb-1'>
                            {DEV_PHASE_LABELS[phase.phase as DevPhase]}
                          </div>
                          <div className='text-2xl font-bold'>
                            {phase.phaseProgress}%
                          </div>
                          <div className='text-xs text-gray-500'>
                            {phase.totalStatuses} statuses
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Workflow Timeline */}
              <div className='relative'>
                {/* Timeline Line */}
                <div className='absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gray-200'></div>

                {/* Phases */}
                {workflowData.map((phase: any, phaseIndex: number) => (
                  <div key={phase.phase} className='mb-8'>
                    {/* Phase Header */}
                    <div className='flex items-center justify-between mb-4'>
                      <div className='flex items-center gap-3'>
                        <div className='relative'>
                          <div
                            className='w-12 h-12 rounded-full flex items-center justify-center text-white font-bold'
                            style={{
                              backgroundColor:
                                DEV_PHASE_COLORS[phase.phase as DevPhase]
                            }}
                          >
                            {phaseIndex + 1}
                          </div>
                          {phaseIndex < workflowData.length - 1 && (
                            <ChevronRight className='absolute -right-4 top-1/2 transform -translate-y-1/2 text-gray-400' />
                          )}
                        </div>
                        <div>
                          <h3 className='text-xl font-bold'>
                            {DEV_PHASE_LABELS[phase.phase as DevPhase]}
                          </h3>
                          <div className='flex items-center gap-4 text-sm text-gray-600'>
                            <span className='flex items-center gap-1'>
                              <CheckCircle className='h-4 w-4' />
                              {phase.completedStatuses} of {phase.totalStatuses}{' '}
                              completed
                            </span>
                            <span className='flex items-center gap-1'>
                              <Clock className='h-4 w-4' />
                              {phase.estimatedDuration} days
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant='outline'
                        className='text-lg px-4 py-2'
                        style={{
                          borderColor:
                            DEV_PHASE_COLORS[phase.phase as DevPhase],
                          backgroundColor: `${
                            DEV_PHASE_COLORS[phase.phase as DevPhase]
                          }20`
                        }}
                      >
                        {phase.phaseProgress}% Complete
                      </Badge>
                    </div>

                    {/* Phase Progress */}
                    <div className='mb-4'>
                      <div className='flex justify-between text-sm mb-1'>
                        <span>Phase Progress</span>
                        <span>{phase.phaseProgress}%</span>
                      </div>
                      <Progress
                        value={phase.phaseProgress}
                        className='h-3'
                        style={{
                          backgroundColor: `${
                            DEV_PHASE_COLORS[phase.phase as DevPhase]
                          }20`,
                          ['--progress-fill' as string]:
                            DEV_PHASE_COLORS[phase.phase as DevPhase]
                        }}
                      />
                    </div>

                    {/* Status Cards */}
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                      {phase.statuses.map((status: any) => (
                        <Card
                          key={status._id}
                          className='hover:shadow-md transition-shadow'
                        >
                          <CardContent className='p-4'>
                            <div className='flex items-start justify-between mb-3'>
                              <div>
                                <h4 className='font-medium'>
                                  {status.srDevStatName}
                                </h4>
                                <p className='text-xs text-gray-500'>
                                  {status.srDevStatCode}
                                </p>
                              </div>
                              <Badge
                                variant='outline'
                                className='text-xs'
                                style={{ borderColor: status.colorCode }}
                              >
                               {
  DEV_CATEGORY_LABELS[status.devCategory as DevCategory]
}

                              </Badge>
                            </div>

                            <div className='space-y-3'>
                              <div>
                                <div className='flex justify-between text-sm mb-1'>
                                  <span>Progress</span>
                                  <span>{status.percentageComplete}%</span>
                                </div>
                                <Progress
                                  value={status.percentageComplete}
                                  className='h-2'
                                  style={{
                                    backgroundColor: `${status.colorCode}20`,
                                    ['--progress-fill' as string]:
                                      status.progressColor || status.colorCode
                                  }}
                                />
                              </div>

                              <div className='flex justify-between text-sm'>
                                <div className='flex items-center gap-1'>
                                  <Clock className='h-3 w-3' />
                                  <span>
                                    {status.estimatedDurationDays || 0} days
                                  </span>
                                </div>
                                <div className='flex items-center gap-1'>
                                  {status.requiresDocumentation ? (
                                    <>
                                      <AlertCircle className='h-3 w-3 text-orange-500' />
                                      <span className='text-orange-600'>
                                        Docs
                                      </span>
                                    </>
                                  ) : (
                                    <span className='text-gray-400'>
                                      No docs
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Next Phase Connector */}
                    {phaseIndex < workflowData.length - 1 && (
                      <div className='flex justify-center mt-8'>
                        <div className='w-16 h-1 bg-gray-300'></div>
                        <ChevronRight className='text-gray-400' />
                        <div className='w-16 h-1 bg-gray-300'></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Key Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Development Timeline Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                    <div className='text-center p-4 border rounded-lg'>
                      <div className='text-2xl font-bold'>
                        {workflowData.reduce(
                          (sum: number, phase: any) =>
                            sum + phase.totalStatuses,
                          0
                        )}
                      </div>
                      <div className='text-sm text-gray-500'>
                        Total Statuses
                      </div>
                    </div>
                    <div className='text-center p-4 border rounded-lg'>
                      <div className='text-2xl font-bold'>
                        {workflowData.reduce(
                          (sum: number, phase: any) =>
                            sum + phase.estimatedDuration,
                          0
                        )}
                      </div>
                      <div className='text-sm text-gray-500'>
                        Total Estimated Days
                      </div>
                    </div>
                    <div className='text-center p-4 border rounded-lg'>
                      <div className='text-2xl font-bold'>
                        {Math.round(
                          workflowData.reduce(
                            (sum: number, phase: any) =>
                              sum + phase.phaseProgress,
                            0
                          ) / workflowData.length
                        )}
                        %
                      </div>
                      <div className='text-sm text-gray-500'>
                        Average Phase Progress
                      </div>
                    </div>
                    <div className='text-center p-4 border rounded-lg'>
                      <div className='text-2xl font-bold'>
                        {workflowData.reduce(
                          (sum: number, phase: any) =>
                            sum + phase.completedStatuses,
                          0
                        )}
                      </div>
                      <div className='text-sm text-gray-500'>
                        Completed Statuses
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className='p-8 text-center'>
                <TrendingUp className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                <h3 className='text-lg font-medium mb-2'>No Workflow Data</h3>
                <p className='text-gray-500 mb-4'>
                  Development workflow data is not available. Please check if
                  development statuses are configured.
                </p>
                <Button onClick={() => router.push('/sr-dev-status/create')}>
                  Create Development Status
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

  )
}
