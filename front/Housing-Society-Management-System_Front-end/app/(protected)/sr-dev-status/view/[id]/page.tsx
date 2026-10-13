// src/app/(dashboard)/sr-dev-status/view/[id]/page.tsx
'use client'

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
import { Separator } from '@/components/ui/separator'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import {
  DEV_PHASE_COLORS,
  DEV_PHASE_LABELS
} from '@/lib/constants/srDevStatus.constants'
import { useSrDevStatus } from '@/lib/hooks/entities/useSrDevStatus'
import { useAuth } from '@/lib/hooks/useAuth'
import { DevPhase } from '@/lib/types/srdevstatus'
import { format } from 'date-fns'
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  FileText,
  TrendingUp,
  User
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { DetailPageSkeleton } from '@/components/shared/PageSkeleton'

export default function ViewSrDevStatusPage () {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()

  const id = params.id as string
  const { data: status, isLoading, error } = useSrDevStatus(id)

  const canUpdate =
    user &&
    hasPermission(
      user.role as UserRole,
      [UserRole.ADMIN, UserRole.SUPER_ADMIN] as UserRole[]
    )

  useEffect(() => {
    if (error) {
      console.error('Error loading development status:', error)
    }
  }, [error])

  if (isLoading) {
    return <DetailPageSkeleton />
  }

  if (error || !status) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              Failed to load development status. The status may not exist or you
              don&apos;t have permission to view it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/sr-dev-status')}>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Development Statuses
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  const getBooleanIcon = (value: boolean) => {
    return value ? (
      <CheckCircle className='h-4 w-4 text-green-500' />
    ) : (
      <span className='h-4 w-4 text-red-500'>✗</span>
    )
  }

  return (
    <div className='p-6'>
      <div className='mb-6'>
        <div className='flex items-center justify-between mb-4'>
          <Button variant='ghost' onClick={() => router.push('/sr-dev-status')}>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back to Development Statuses
          </Button>

          {canUpdate && (
            <Button
              onClick={() => router.push(`/sr-dev-status/edit/${id}`)}
              className='ml-auto'
            >
              <Edit className='mr-2 h-4 w-4' />
              Edit Status
            </Button>
          )}
        </div>

        <div className='flex items-start justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>{status.srDevStatName}</h1>
            <div className='flex items-center gap-4 mt-2'>
              <div className='flex items-center gap-2'>
                <span className='text-gray-600 font-medium'>
                  {status.srDevStatCode}
                </span>
              </div>
              <Badge
                className={getStatusColor(status.isActive)}
                variant='outline'
              >
                {status.isActive ? 'Active' : 'Inactive'}
              </Badge>
              {status.isDefault && (
                <Badge variant='secondary'>Default Status</Badge>
              )}
            </div>
          </div>

          <div
            className='w-12 h-12 rounded-lg border'
            style={{ backgroundColor: status.colorCode }}
            title={`Color: ${status.colorCode}`}
          />
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Main Details Card */}
        <Card className='lg:col-span-2'>
          <CardHeader>
            <CardTitle>Development Status Details</CardTitle>
            <CardDescription>
              Complete information about this development phase
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-4'>
                <div>
                  <h3 className='text-sm font-medium text-gray-500 mb-1'>
                    Development Category
                  </h3>
                  <Badge
                    variant='outline'
                    style={{
                      borderColor:
                        DEV_PHASE_COLORS[status.devPhase as DevPhase],
                      backgroundColor: `${
                        DEV_PHASE_COLORS[status.devPhase as DevPhase]
                      }20`
                    }}
                  >
                    {DEV_PHASE_LABELS[status.devPhase as DevPhase]}
                  </Badge>
                </div>

                <div>
                  <h3 className='text-sm font-medium text-gray-500 mb-1'>
                    Development Phase
                  </h3>
                  <Badge
                    variant='outline'
                    style={{
                      borderColor:
                        DEV_PHASE_COLORS[status.devPhase as DevPhase],
                      backgroundColor: `${
                        DEV_PHASE_COLORS[status.devPhase as DevPhase]
                      }20`
                    }}
                  >
                    {DEV_PHASE_LABELS[status.devPhase as DevPhase]}
                  </Badge>
                </div>

                <div>
                  <h3 className='text-sm font-medium text-gray-500 mb-1'>
                    Progress
                  </h3>
                  <div className='space-y-2'>
                    <Progress
                      value={status.percentageComplete}
                      className='h-3'
                      style={{
                        backgroundColor: `${status.colorCode}20`,
                        ['--progress-fill' as string]:
                          status.progressColor || status.colorCode
                      }}
                    />
                    <div className='flex justify-between text-sm'>
                      <span className='text-gray-600'>
                        {status.percentageComplete}% Complete
                      </span>
                      {status.estimatedDurationDays > 0 && (
                        <span className='text-gray-500'>
                          <Clock className='inline h-3 w-3 mr-1' />
                          {status.estimatedCompletionText}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className='space-y-4'>
                <div>
                  <h3 className='text-sm font-medium text-gray-500 mb-1'>
                    Configuration
                  </h3>
                  <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <span>Sequence</span>
                      <span className='font-medium'>{status.sequence}</span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span>Requires Documentation</span>
                      {getBooleanIcon(status.requiresDocumentation)}
                    </div>
                    {status.estimatedDurationDays > 0 && (
                      <div className='flex items-center justify-between'>
                        <span>Estimated Duration</span>
                        <span className='font-medium'>
                          {status.estimatedDurationDays} days
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className='text-sm font-medium text-gray-500 mb-1'>
                    Description
                  </h3>
                  <p className='text-gray-700'>
                    {status.description || 'No description provided'}
                  </p>
                </div>

                {status.icon && (
                  <div>
                    <h3 className='text-sm font-medium text-gray-500 mb-1'>
                      Icon
                    </h3>
                    <code className='text-sm bg-gray-100 p-2 rounded'>
                      {status.icon}
                    </code>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metadata Card */}
        <Card>
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
            <CardDescription>Audit and system information</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <h3 className='text-sm font-medium text-gray-500 mb-1'>
                <Calendar className='inline h-4 w-4 mr-2' />
                Created
              </h3>
              <p className='text-sm'>
                {format(new Date(status.createdAt), 'PPpp')}
              </p>
              {status.createdBy && typeof status.createdBy === 'object' && (
                <div className='flex items-center gap-2 mt-1'>
                  <User className='h-3 w-3' />
                  <span className='text-xs text-gray-500'>
                    by {status.createdBy.firstName} {status.createdBy.lastName}
                  </span>
                </div>
              )}
            </div>

            {status.updatedAt && (
              <div>
                <h3 className='text-sm font-medium text-gray-500 mb-1'>
                  <Calendar className='inline h-4 w-4 mr-2' />
                  Last Updated
                </h3>
                <p className='text-sm'>
                  {format(new Date(status.updatedAt), 'PPpp')}
                </p>
                {status.updatedBy && typeof status.updatedBy === 'object' && (
                  <div className='flex items-center gap-2 mt-1'>
                    <User className='h-3 w-3' />
                    <span className='text-xs text-gray-500'>
                      by {status.updatedBy.firstName}{' '}
                      {status.updatedBy.lastName}
                    </span>
                  </div>
                )}
              </div>
            )}

            <Separator />

            <div>
              <h3 className='text-sm font-medium text-gray-500 mb-2'>
                Status ID
              </h3>
              <code className='text-xs bg-gray-100 p-2 rounded block break-all'>
                {status._id}
              </code>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Allowed Transitions */}
      {status.allowedTransitions && status.allowedTransitions.length > 0 && (
        <Card className='mt-6'>
          <CardHeader>
            <CardTitle>
              <TrendingUp className='inline h-5 w-5 mr-2' />
              Allowed Transitions
            </CardTitle>
            <CardDescription>
              Next possible development statuses from this phase
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {status.allowedTransitions.map((transition: any) => (
                <Card key={transition._id} className='hover:bg-gray-50'>
                  <CardContent className='p-4'>
                    <div className='flex items-start justify-between mb-2'>
                      <div>
                        <h4 className='font-medium'>
                          {transition.srDevStatName}
                        </h4>
                        <p className='text-xs text-gray-500'>
                          {transition.srDevStatCode}
                        </p>
                      </div>
                      <Badge
                        variant='outline'
                        className='text-xs'
                        style={{
                          borderColor:
                            DEV_PHASE_COLORS[transition.devPhase as DevPhase]
                        }}
                      >
                        {DEV_PHASE_LABELS[transition.devPhase as DevPhase]}
                      </Badge>
                    </div>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-gray-600'>
                        Seq: {transition.sequence}
                      </span>
                      <Progress
                        value={transition.percentageComplete}
                        className='w-20 h-2'
                      />
                      <span>{transition.percentageComplete}%</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documentation Requirements */}
      {status.requiresDocumentation && (
        <Card className='mt-6'>
          <CardHeader>
            <CardTitle>
              <FileText className='inline h-5 w-5 mr-2' />
              Documentation Requirements
            </CardTitle>
            <CardDescription>
              Documents required when transitioning to this status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              <div className='p-3 bg-blue-50 rounded-lg'>
                <h4 className='font-medium mb-1'>Required Documents</h4>
                <ul className='list-disc list-inside text-sm text-gray-600 space-y-1'>
                  <li>Progress Report</li>
                  <li>Inspection Certificate</li>
                  <li>Quality Assurance Checklist</li>
                  <li>Photographic Evidence</li>
                </ul>
              </div>
              <div className='text-sm text-gray-500'>
                <strong>Note:</strong> All documents must be uploaded and
                approved before proceeding to the next development phase.
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
