// src/app/(dashboard)/applications/edit/[id]/page.tsx
'use client'

import { EntityForm } from '@/components/shared/EntityForm/EntityForm'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { updateApplicationFormFields } from '@/lib/constants/applicationForm.constants'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import {
  useApplication,
  useUpdateApplication
} from '@/lib/hooks/entities/useApplication'
import { useStatus } from '@/lib/hooks/entities/useStatus'
import { useAuth } from '@/lib/hooks/useAuth'
import { updateApplicationSchema } from '@/lib/schemas/application.schema'
import { UpdateApplicationDto } from '@/lib/types/application'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { customToast } from "@/lib/utils/customToast"
import { FormPageSkeleton } from '@/components/shared/PageSkeleton'

export default function EditApplicationPage () {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const updateMutation = useUpdateApplication()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const id = params.id as string
  const { data: application, isLoading, error } = useApplication(id)
  const statusIdValue =
    typeof application?.statusId === 'object'
      ? application?.statusId?._id
      : application?.statusId
  const { data: statusData } = useStatus(statusIdValue || '')

  // Modify form fields to use the actual application ID for file uploads
  const modifiedFormFields = updateApplicationFormFields.map(field => {
    if (field.name === 'attachmentPath' && field.uploadConfig) {
      return {
        ...field,
        uploadConfig: {
          ...field.uploadConfig,
          entityId: id
        }
      }
    }
    return field
  })

  const canUpdate =
    user &&
    hasPermission(user.role as UserRole, [
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
      UserRole.MODERATOR
    ])

  if (!canUpdate) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to edit applications.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.back()}>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return <FormPageSkeleton />
  }

  if (error || !application) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Failed to load application data.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.back()}>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const defaultValues = {
    applicationTypeID:
      typeof application.applicationTypeID === 'object'
        ? application.applicationTypeID._id
        : application.applicationTypeID,
    memId:
      typeof application.memId === 'object'
        ? application.memId._id
        : application.memId,
    plotId: application.plotId
      ? typeof application.plotId === 'object'
        ? application.plotId._id
        : application.plotId
      : '',
    applicationDate: application.applicationDate
      ? new Date(application.applicationDate).toISOString().split('T')[0]
      : '',
    statusId:
      typeof application.statusId === 'object'
        ? application.statusId?._id || ''
        : application.statusId || '',
    remarks: application.remarks || '',
    attachmentPath: application.attachmentPath || ''
  }

  const handleSubmit = async (data: unknown) => {
    try {
      setIsSubmitting(true)
      const formData = data as UpdateApplicationDto

      await updateMutation.mutateAsync({
        id,
        data: formData
      })

      customToast.success('Application updated successfully')
      router.push('/applications')
    } catch (error) {
      customToast.error(
        'Failed to update application' +
          (error instanceof Error ? `: ${error.message}` : '')
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className='p-6'>
      <div className='mb-6'>
        <Button variant='ghost' onClick={() => router.back()} className='mb-4'>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back to Applications
        </Button>

        <h1 className='text-3xl font-bold'>Edit Application</h1>
        <p className='text-gray-500 mt-2'>Update application information.</p>
        <div className='mt-2 flex items-center gap-2'>
          <span className='text-sm font-medium'>Application No:</span>
          <span className='text-sm bg-gray-100 px-2 py-1 rounded font-mono'>
            {application.applicationNo}
          </span>
          <span className='text-sm font-medium'>Current Status:</span>
          <span className='text-sm bg-gray-100 px-2 py-1 rounded'>
            {typeof application.statusId === 'object'
              ? application.statusId?.statusName ||
                statusData?.statusName ||
                'Unknown'
              : statusData?.statusName || 'Unknown'}
          </span>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2'>
          <Card>
            <CardContent className='pt-6'>
              <EntityForm
                schema={updateApplicationSchema}
                fields={modifiedFormFields}
                defaultValues={defaultValues}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                submitLabel='Update Application'
                cancelLabel='Cancel'
                isLoading={isSubmitting}
              />
            </CardContent>
          </Card>
        </div>

        <div className='space-y-6'>
          {/* Current Information */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Current Information</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 text-sm'>
              <div className='space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Application No:</span>
                  <span className='font-medium font-mono'>
                    {application.applicationNo}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Application Type:</span>
                  <span className='font-medium'>
                    {typeof application.applicationTypeID === 'object'
                      ? application.applicationTypeID.applicationName
                      : 'Unknown'}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Member:</span>
                  <span className='font-medium'>
                    {typeof application.memId === 'object'
                      ? application.memId.memName
                      : 'Unknown'}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Plot:</span>
                  <span className='font-medium'>
                    {application.plotId
                      ? typeof application.plotId === 'object'
                        ? `Plot #${application.plotId.plotNo}`
                        : 'Unknown'
                      : '-'}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Application Date:</span>
                  <span className='font-medium'>
                    {new Date(application.applicationDate).toLocaleDateString()}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Status:</span>
                  <span
                    className={`font-medium ${(() => {
                      const statusName =
                        typeof application.statusId === 'object'
                          ? application.statusId?.statusName
                          : statusData?.statusName
                      if (statusName === 'approved') return 'text-green-600'
                      if (statusName === 'rejected') return 'text-red-600'
                      if (statusName === 'pending') return 'text-yellow-600'
                      return 'text-gray-600'
                    })()}`}
                  >
                    {typeof application.statusId === 'object'
                      ? application.statusId?.statusName ||
                        statusData?.statusName ||
                        'Unknown'
                      : statusData?.statusName || 'Unknown'}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Created:</span>
                  <span className='font-medium'>
                    {new Date(application.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Last Updated:</span>
                  <span className='font-medium'>
                    {new Date(application.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                {application.remarks && (
                  <div className='flex flex-col'>
                    <span className='text-gray-600'>Remarks:</span>
                    <span className='font-medium mt-1'>
                      {application.remarks}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Edit Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Edit Guidelines</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 text-sm text-gray-600'>
              <div className='space-y-2'>
                <div className='font-medium'>Important Notes:</div>
                <ul className='space-y-1 list-disc pl-4'>
                  <li>
                    Changing the application type may affect categorization
                  </li>
                  <li>Updating the member will change the application owner</li>
                  <li>Status changes should follow workflow rules</li>
                  <li>Consider if changes affect related records</li>
                  <li>Deleted applications cannot be restored</li>
                  <li>Application number cannot be changed</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
