// src/app/(dashboard)/sales-status/view/[id]/page.tsx
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
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import { STATUS_TYPE_LABELS } from '@/lib/constants/salesStatus.constants'
import { useSalesStatus } from '@/lib/hooks/entities/useSalesStatus'
import { useAuth } from '@/lib/hooks/useAuth'
import { SalesStatusType } from '@/lib/types/salesStatus'
import { format } from 'date-fns'
import { ArrowLeft, Calendar, CheckCircle, Edit, Tag, User } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { DetailPageSkeleton } from '@/components/shared/PageSkeleton'

export default function ViewSalesStatusPage () {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()

  const id = params.id as string
  const { data: status, isLoading, error } = useSalesStatus(id)

  const canUpdate =
    user &&
    hasPermission(
      user.role as UserRole,
      [UserRole.ADMIN, UserRole.SUPER_ADMIN] as UserRole[]
    )

  useEffect(() => {
    if (error) {
      console.error('Error loading sales status:', error)
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
              Failed to load sales status. The status may not exist or you
              don&apos;t have permission to view it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/sales-status')}>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Sales Statuses
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
          <Button variant='ghost' onClick={() => router.push('/sales-status')}>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back to Sales Statuses
          </Button>

          {canUpdate && (
            <Button
              onClick={() => router.push(`/sales-status/edit/${id}`)}
              className='ml-auto'
            >
              <Edit className='mr-2 h-4 w-4' />
              Edit Status
            </Button>
          )}
        </div>

        <div className='flex items-start justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>{status.statusName}</h1>
            <div className='flex items-center gap-4 mt-2'>
              <div className='flex items-center gap-2'>
                <Tag className='h-4 w-4 text-gray-500' />
                <span className='text-gray-600'>{status.statusCode}</span>
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
            <CardTitle>Status Details</CardTitle>
            <CardDescription>
              Complete information about this sales status
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-4'>
                <div>
                  <h3 className='text-sm font-medium text-gray-500 mb-1'>
                    Status Type
                  </h3>
                  <Badge variant='outline'>
                    {STATUS_TYPE_LABELS[status.statusType as SalesStatusType]}
                  </Badge>
                </div>

                <div>
                  <h3 className='text-sm font-medium text-gray-500 mb-1'>
                    Display Sequence
                  </h3>
                  <p className='text-lg font-medium'>{status.sequence}</p>
                </div>

                <div>
                  <h3 className='text-sm font-medium text-gray-500 mb-1'>
                    Description
                  </h3>
                  <p className='text-gray-700'>
                    {status.description || 'No description provided'}
                  </p>
                </div>
              </div>

              <div className='space-y-4'>
                <div>
                  <h3 className='text-sm font-medium text-gray-500 mb-1'>
                    Business Rules
                  </h3>
                  <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <span>Allows Sales</span>
                      {getBooleanIcon(status.allowsSale)}
                    </div>
                    <div className='flex items-center justify-between'>
                      <span>Requires Approval</span>
                      {getBooleanIcon(status.requiresApproval)}
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className='text-sm font-medium text-gray-500 mb-1'>
                    Notification Template
                  </h3>
                  <div className='p-3 bg-gray-50 rounded-md text-sm'>
                    {status.notificationTemplate || 'No template defined'}
                  </div>
                </div>
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

      {/* Workflow Information */}
      <Card className='mt-6'>
        <CardHeader>
          <CardTitle>Workflow Information</CardTitle>
          <CardDescription>
            Status transitions and business workflow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div>
              <h3 className='text-sm font-medium text-gray-500 mb-2'>
                Allowed Transitions
              </h3>
              {status.allowedTransitions &&
              status.allowedTransitions.length > 0 ? (
                <div className='flex flex-wrap gap-2'>
                  {status.allowedTransitions.map((transition: any) => (
                    <Badge key={transition} variant='outline'>
                      {STATUS_TYPE_LABELS[transition as SalesStatusType]}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className='text-gray-500 text-sm'>
                  No specific transition rules defined. All status transitions
                  may be allowed based on business rules.
                </p>
              )}
            </div>

            <div>
              <h3 className='text-sm font-medium text-gray-500 mb-2'>
                Usage Guidelines
              </h3>
              <ul className='list-disc list-inside text-sm text-gray-600 space-y-1'>
                <li>
                  Use this status for plots that are{' '}
                  {status.statusType.replace('_', ' ').toLowerCase()}
                </li>
                {status.allowsSale && (
                  <li>Plots in this status can be sold to customers</li>
                )}
                {status.requiresApproval && (
                  <li>
                    Changing to this status requires administrative approval
                  </li>
                )}
                {status.isDefault && (
                  <li>This is the default status for new plots</li>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
