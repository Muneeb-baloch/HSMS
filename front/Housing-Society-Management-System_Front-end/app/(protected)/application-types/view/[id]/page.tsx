// src/app/(dashboard)/application-types/view/[id]/page.tsx
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
import { useSrApplicationType } from '@/lib/hooks/entities/useSrApplicationType'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Edit,
  FileText,
  User
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { DetailPageSkeleton } from '@/components/shared/PageSkeleton'

export default function ViewSrApplicationTypePage () {
  const router = useRouter()
  const params = useParams()

  const id = params.id as string
  const { data: applicationType, isLoading } = useSrApplicationType(id)

  if (isLoading) {
    return <DetailPageSkeleton />
  }

  if (!applicationType) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Application Type Not Found</CardTitle>
            <CardDescription>
              The requested SR application type does not exist or has been
              deleted.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/application-types')}>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to SR Application Types
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='p-6'>
      <div className='flex justify-between items-start mb-6'>
        <Button variant='ghost' onClick={() => router.back()}>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back
        </Button>
        <Button onClick={() => router.push(`/application-types/edit/${id}`)}>
          <Edit className='mr-2 h-4 w-4' />
          Edit Application Type
        </Button>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Main Application Type Card */}
        <div className='lg:col-span-2'>
          <Card className='mb-6'>
            <CardHeader>
              <div className='flex justify-between items-start'>
                <div>
                  <CardTitle className='text-2xl'>
                    {applicationType.applicationName}
                  </CardTitle>
                  {applicationType.applicationDesc && (
                    <CardDescription>
                      {applicationType.applicationDesc}
                    </CardDescription>
                  )}
                </div>
                <div className='flex gap-2'>
                  <Badge
                    className={
                      applicationType.isDeleted
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }
                  >
                    {applicationType.isDeleted ? 'Deleted' : 'Active'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Basic Information */}
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <div className='flex items-center gap-2 text-gray-500'>
                    <DollarSign className='h-4 w-4' />
                    <span className='text-sm font-medium'>Fee Information</span>
                  </div>
                  <div className='pl-6'>
                    <div className='text-3xl font-bold text-green-600'>
                      {formatCurrency(applicationType.applicationFee)}
                    </div>
                    <div className='text-sm text-gray-500 mt-1'>
                      Application Fee
                    </div>
                  </div>
                </div>

                {/* Created Information */}
                {applicationType.createdBy && (
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-gray-500'>
                      <User className='h-4 w-4' />
                      <span className='text-sm font-medium'>
                        Created Information
                      </span>
                    </div>
                    <div className='grid grid-cols-2 gap-4 pl-6'>
                      <div>
                        <div className='text-sm text-gray-600'>Created By</div>
                        <div className='font-medium'>
                          {applicationType.createdBy.firstName}{' '}
                          {applicationType.createdBy.lastName}
                        </div>
                      </div>
                      <div>
                        <div className='text-sm text-gray-600'>
                          Created Email
                        </div>
                        <div className='font-medium'>
                          {applicationType.createdBy.email}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Updated Information */}
                {applicationType.updatedBy && (
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-gray-500'>
                      <User className='h-4 w-4' />
                      <span className='text-sm font-medium'>
                        Updated Information
                      </span>
                    </div>
                    <div className='grid grid-cols-2 gap-4 pl-6'>
                      <div>
                        <div className='text-sm text-gray-600'>Updated By</div>
                        <div className='font-medium'>
                          {applicationType.updatedBy.firstName}{' '}
                          {applicationType.updatedBy.lastName}
                        </div>
                      </div>
                      <div>
                        <div className='text-sm text-gray-600'>
                          Updated Email
                        </div>
                        <div className='font-medium'>
                          {applicationType.updatedBy.email}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Timestamps */}
                <div className='space-y-2'>
                  <div className='flex items-center gap-2 text-gray-500'>
                    <Calendar className='h-4 w-4' />
                    <span className='text-sm font-medium'>Timestamps</span>
                  </div>
                  <div className='grid grid-cols-2 gap-4 pl-6'>
                    <div>
                      <div className='text-sm text-gray-600'>Created At</div>
                      <div className='font-medium'>
                        {formatDate(applicationType.createdAt)}
                      </div>
                    </div>
                    <div>
                      <div className='text-sm text-gray-600'>Last Updated</div>
                      <div className='font-medium'>
                        {formatDate(applicationType.updatedAt)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Information */}
                {applicationType.isDeleted && (
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-gray-500'>
                      <FileText className='h-4 w-4' />
                      <span className='text-sm font-medium'>
                        Status Information
                      </span>
                    </div>
                    <div className='p-4 bg-red-50 border border-red-200 rounded-lg pl-6'>
                      <div className='text-sm text-red-600'>
                        This application type has been deleted and is not
                        available for new applications.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className='space-y-6'>
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <Button
                variant='outline'
                className='w-full justify-start'
                onClick={() => router.push(`/application-types/edit/${id}`)}
              >
                <Edit className='mr-2 h-4 w-4' />
                Edit Application Type
              </Button>
              <Button
                variant='outline'
                className='w-full justify-start'
                onClick={() => router.push('/application-types')}
              >
                <ArrowLeft className='mr-2 h-4 w-4' />
                Back to All Types
              </Button>
              <Button
                variant='outline'
                className='w-full justify-start'
                onClick={() => router.push('/applications')}
              >
                <FileText className='mr-2 h-4 w-4' />
                View SR Applications
              </Button>
            </CardContent>
          </Card>

          {/* Usage Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Usage Information</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 text-sm text-gray-600'>
              <div className='space-y-2'>
                <div className='font-medium'>Application Type Details:</div>
                <ul className='space-y-1'>
                  <li className='flex justify-between'>
                    <span>Status:</span>
                    <Badge
                      className={
                        applicationType.isDeleted
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }
                    >
                      {applicationType.isDeleted ? 'Deleted' : 'Active'}
                    </Badge>
                  </li>
                  <li className='flex justify-between'>
                    <span>Application Fee:</span>
                    <span className='font-medium text-green-600'>
                      {formatCurrency(applicationType.applicationFee)}
                    </span>
                  </li>
                  <li className='flex justify-between'>
                    <span>Created:</span>
                    <span>{formatDate(applicationType.createdAt)}</span>
                  </li>
                  <li className='flex justify-between'>
                    <span>Last Updated:</span>
                    <span>{formatDate(applicationType.updatedAt)}</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Fee Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Fee Comparison</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 text-sm text-gray-600'>
              <div className='space-y-2'>
                <div className='font-medium'>Comparison with Common Fees:</div>
                <ul className='space-y-2'>
                  <li className='flex justify-between'>
                    <span>Standard Registration:</span>
                    <span className='font-medium'>Rs. 5,000 - 10,000</span>
                  </li>
                  <li className='flex justify-between'>
                    <span>Plot Transfer:</span>
                    <span className='font-medium'>Rs. 10,000 - 25,000</span>
                  </li>
                  <li className='flex justify-between'>
                    <span>This Type:</span>
                    <span
                      className={`font-bold ${
                        applicationType.applicationFee < 5000
                          ? 'text-green-600'
                          : applicationType.applicationFee > 25000
                          ? 'text-red-600'
                          : 'text-blue-600'
                      }`}
                    >
                      {formatCurrency(applicationType.applicationFee)}
                    </span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
