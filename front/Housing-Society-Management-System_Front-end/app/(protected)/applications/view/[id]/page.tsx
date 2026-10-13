// src/app/(dashboard)/applications/view/[id]/page.tsx
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
import { useApplication } from '@/lib/hooks/entities/useApplication'
import { formatDate } from '@/lib/utils/format'
import {
  ArrowLeft,
  Calendar,
  Edit,
  FileText,
  MapPin,
  Tag,
  User,
  UserCircle
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { DetailPageSkeleton } from '@/components/shared/PageSkeleton'

export default function ViewApplicationPage () {
  const router = useRouter()
  const params = useParams()

  const id = params.id as string
  const { data: application, isLoading } = useApplication(id)

  if (isLoading) {
    return <DetailPageSkeleton />
  }

  if (!application) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Application Not Found</CardTitle>
            <CardDescription>
              The requested application does not exist or has been deleted.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/applications')}>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Applications
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
        <Button onClick={() => router.push(`/applications/edit/${id}`)}>
          <Edit className='mr-2 h-4 w-4' />
          Edit Application
        </Button>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Main Application Card */}
        <div className='lg:col-span-2'>
          <Card className='mb-6'>
            <CardHeader>
              <div className='flex justify-between items-start'>
                <div>
                  <CardTitle className='text-2xl'>
                    Application #{application.applicationNo}
                  </CardTitle>
                  <CardDescription className='mt-2'>
                    {typeof application.applicationTypeID === 'object' &&
                      application.applicationTypeID.applicationName}
                  </CardDescription>
                </div>
                <div className='flex gap-2'>
                  {(() => {
                    const statusName =
                      typeof application.statusId === 'object'
                        ? application.statusId?.statusName
                        : undefined

                    const badgeClass = application.isDeleted
                      ? 'bg-red-100 text-red-800'
                      : statusName === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : statusName === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : statusName === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'

                    return (
                      <Badge className={badgeClass}>
                        {application.isDeleted
                          ? 'Deleted'
                          : statusName || 'Unknown'}
                      </Badge>
                    )
                  })()}
                </div>
              </div>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Application Information */}
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold'>Application Details</h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-gray-500'>
                      <Tag className='h-4 w-4' />
                      <span className='text-sm font-medium'>
                        Application Type
                      </span>
                    </div>
                    <div className='pl-6'>
                      <div className='font-medium'>
                        {typeof application.applicationTypeID === 'object'
                          ? application.applicationTypeID.applicationName
                          : 'Unknown'}
                      </div>
                      {typeof application.applicationTypeID === 'object' &&
                        application.applicationTypeID.applicationFee !==
                          undefined && (
                          <div className='text-sm text-gray-600'>
                            Fee: $
                            {application.applicationTypeID.applicationFee.toFixed(
                              2
                            )}
                          </div>
                        )}
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-gray-500'>
                      <Calendar className='h-4 w-4' />
                      <span className='text-sm font-medium'>
                        Application Date
                      </span>
                    </div>
                    <div className='pl-6'>
                      <div className='font-medium'>
                        {formatDate(application.applicationDate)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Member Information */}
              {typeof application.memId === 'object' && (
                <div className='space-y-2'>
                  <div className='flex items-center gap-2 text-gray-500'>
                    <UserCircle className='h-4 w-4' />
                    <span className='text-sm font-medium'>
                      Member Information
                    </span>
                  </div>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4 pl-6'>
                    <div>
                      <div className='text-sm text-gray-600'>Member Name</div>
                      <div className='font-medium'>
                        {application.memId.memName}
                      </div>
                    </div>
                    <div>
                      <div className='text-sm text-gray-600'>NIC Number</div>
                      <div className='font-medium'>
                        {application.memId.memNic}
                      </div>
                    </div>
                    {application.memId.memRegNo && (
                      <div>
                        <div className='text-sm text-gray-600'>
                          Registration No
                        </div>
                        <div className='font-medium'>
                          {application.memId.memRegNo}
                        </div>
                      </div>
                    )}
                    {application.memId.memContMob && (
                      <div>
                        <div className='text-sm text-gray-600'>
                          Contact Mobile
                        </div>
                        <div className='font-medium'>
                          {application.memId.memContMob}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Plot Information */}
              {application.plotId && typeof application.plotId === 'object' && (
                <div className='space-y-2'>
                  <div className='flex items-center gap-2 text-gray-500'>
                    <MapPin className='h-4 w-4' />
                    <span className='text-sm font-medium'>
                      Plot Information
                    </span>
                  </div>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4 pl-6'>
                    <div>
                      <div className='text-sm text-gray-600'>Plot Number</div>
                      <div className='font-medium'>
                        {application.plotId.plotNo}
                      </div>
                    </div>
                    {application.plotId.plotRegistrationNo && (
                      <div>
                        <div className='text-sm text-gray-600'>
                          Registration No
                        </div>
                        <div className='font-medium'>
                          {application.plotId.plotRegistrationNo}
                        </div>
                      </div>
                    )}
                    {application.plotId.plotBlockId && (
                      <div>
                        <div className='text-sm text-gray-600'>Block</div>
                        <div className='font-medium'>
                          {application.plotId.plotBlockId}
                        </div>
                      </div>
                    )}
                    {application.plotId.plotSizeId && (
                      <div>
                        <div className='text-sm text-gray-600'>Size</div>
                        <div className='font-medium'>
                          {application.plotId.plotSizeId}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Remarks */}
              {application.remarks && (
                <div className='space-y-2'>
                  <div className='flex items-center gap-2 text-gray-500'>
                    <FileText className='h-4 w-4' />
                    <span className='text-sm font-medium'>Remarks</span>
                  </div>
                  <div className='p-4 bg-gray-50 rounded-lg pl-6'>
                    <p className='text-gray-800 whitespace-pre-wrap'>
                      {application.remarks}
                    </p>
                  </div>
                </div>
              )}

              {/* Attachment */}
              {application.attachmentPath && (
                <div className='space-y-2'>
                  <div className='flex items-center gap-2 text-gray-500'>
                    <FileText className='h-4 w-4' />
                    <span className='text-sm font-medium'>Attachment</span>
                  </div>
                  <div className='pl-6'>
                    <a
                      href={application.attachmentPath}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 underline'
                    >
                      <FileText className='h-4 w-4' />
                      View Attachment
                    </a>
                  </div>
                </div>
              )}

              {/* Created Information */}
              {application.createdBy && (
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
                        {application.createdBy.firstName}{' '}
                        {application.createdBy.lastName}
                      </div>
                      <div className='text-sm text-gray-500'>
                        {application.createdBy.email}
                      </div>
                    </div>
                    <div>
                      <div className='text-sm text-gray-600'>Created Date</div>
                      <div className='font-medium'>
                        {formatDate(application.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Updated Information */}
              {application.updatedBy && (
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
                        {application.updatedBy.firstName}{' '}
                        {application.updatedBy.lastName}
                      </div>
                      <div className='text-sm text-gray-500'>
                        {application.updatedBy.email}
                      </div>
                    </div>
                    <div>
                      <div className='text-sm text-gray-600'>Updated Date</div>
                      <div className='font-medium'>
                        {formatDate(application.updatedAt)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Information */}
              {application.isDeleted && (
                <div className='space-y-2'>
                  <div className='flex items-center gap-2 text-gray-500'>
                    <FileText className='h-4 w-4' />
                    <span className='text-sm font-medium'>
                      Status Information
                    </span>
                  </div>
                  <div className='p-4 bg-red-50 border border-red-200 rounded-lg pl-6'>
                    <div className='text-sm text-red-600'>
                      This application has been deleted and is archived in the
                      system.
                      {application.deletedAt && (
                        <span>
                          {' '}
                          Deleted on: {formatDate(application.deletedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
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
                onClick={() => router.push(`/applications/edit/${id}`)}
              >
                <Edit className='mr-2 h-4 w-4' />
                Edit Application
              </Button>
              {typeof application.applicationTypeID === 'object' && (
                <Button
                  variant='outline'
                  className='w-full justify-start'
                  onClick={() =>
                    router.push(
                      `/applications?applicationTypeID=${application.applicationTypeID._id}`
                    )
                  }
                >
                  <FileText className='mr-2 h-4 w-4' />
                  View Similar Applications
                </Button>
              )}
              {typeof application.memId === 'object' && (
                <Button
                  variant='outline'
                  className='w-full justify-start'
                  onClick={() =>
                    router.push(`/members/${application.memId._id}`)
                  }
                >
                  <UserCircle className='mr-2 h-4 w-4' />
                  View Member Profile
                </Button>
              )}
              <Button
                variant='outline'
                className='w-full justify-start'
                onClick={() => router.push('/applications')}
              >
                <ArrowLeft className='mr-2 h-4 w-4' />
                Back to All Applications
              </Button>
            </CardContent>
          </Card>

          {/* Application Summary */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Application Summary</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 text-sm text-gray-600'>
              <div className='space-y-2'>
                <ul className='space-y-1'>
                  <li className='flex justify-between'>
                    <span>Application No:</span>
                    <span className='font-mono font-medium'>
                      {application.applicationNo}
                    </span>
                  </li>
                  <li className='flex justify-between'>
                    <span>Type:</span>
                    <span className='font-medium'>
                      {typeof application.applicationTypeID === 'object'
                        ? application.applicationTypeID.applicationName
                        : 'Unknown'}
                    </span>
                  </li>
                  <li className='flex justify-between'>
                    <span>Member:</span>
                    <span className='font-medium truncate max-w-[150px]'>
                      {typeof application.memId === 'object'
                        ? application.memId.memName
                        : 'Unknown'}
                    </span>
                  </li>
                  <li className='flex justify-between'>
                    <span>Application Date:</span>
                    <span>{formatDate(application.applicationDate)}</span>
                  </li>
                  <li className='flex justify-between'>
                    <span>Status:</span>
                    {(() => {
                      const statusName =
                        typeof application.statusId === 'object'
                          ? application.statusId?.statusName
                          : undefined

                      const badgeClass = application.isDeleted
                        ? 'bg-red-100 text-red-800'
                        : statusName === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : statusName === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : statusName === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'

                      return (
                        <Badge className={badgeClass}>
                          {application.isDeleted
                            ? 'Deleted'
                            : statusName || 'Unknown'}
                        </Badge>
                      )
                    })()}
                  </li>
                  <li className='flex justify-between'>
                    <span>Created:</span>
                    <span>{formatDate(application.createdAt)}</span>
                  </li>
                  <li className='flex justify-between'>
                    <span>Last Updated:</span>
                    <span>{formatDate(application.updatedAt)}</span>
                  </li>
                  {application.isDeleted && application.deletedAt && (
                    <li className='flex justify-between'>
                      <span>Deleted:</span>
                      <span className='text-red-600'>
                        {formatDate(application.deletedAt)}
                      </span>
                    </li>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
