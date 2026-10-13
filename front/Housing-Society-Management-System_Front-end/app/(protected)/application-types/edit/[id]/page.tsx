// src/app/(dashboard)/application-types/edit/[id]/page.tsx
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
import { hasPermission, UserRole } from '@/lib/constants/roles'
import { updateSrApplicationTypeFormFields } from '@/lib/constants/srApplicationTypeForm.constants'
import {
  useSrApplicationType,
  useUpdateSrApplicationType
} from '@/lib/hooks/entities/useSrApplicationType'
import { useAuth } from '@/lib/hooks/useAuth'
import { updateSrApplicationTypeSchema } from '@/lib/schemas/srApplicationType.schema'
import { UpdateSrApplicationTypeDto } from '@/lib/types/srApplicationType'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { customToast } from "@/lib/utils/customToast"
import { FormPageSkeleton } from '@/components/shared/PageSkeleton'

export default function EditSrApplicationTypePage () {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const updateMutation = useUpdateSrApplicationType()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const id = params.id as string
  const { data: applicationType, isLoading, error } = useSrApplicationType(id)

  const canUpdate =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

  if (!canUpdate) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to edit SR Application Types.
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

  if (error || !applicationType) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              Failed to load SR application type data.
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

  const defaultValues = {
    applicationName: applicationType.applicationName,
    applicationDesc: applicationType.applicationDesc || '',
    applicationFee: applicationType.applicationFee
  }

  const handleSubmit = async (data: unknown) => {
    try {
      setIsSubmitting(true)
      const formData = data as UpdateSrApplicationTypeDto

      const submitData: any = {}
      Object.keys(formData).forEach(key => {
        if (formData[key as keyof UpdateSrApplicationTypeDto] !== undefined) {
          const value = formData[key as keyof UpdateSrApplicationTypeDto]
          if (key === 'applicationFee') {
            submitData[key] = Number(value)
          } else {
            submitData[key] = value
          }
        }
      })

      await updateMutation.mutateAsync({
        id,
        data: submitData
      })

      customToast.success('SR Application Type updated successfully')
      router.push('/application-types')
    } catch (error) {
      customToast.error(
        'Failed to update SR Application Type' +
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
          Back to SR Application Types
        </Button>

        <h1 className='text-3xl font-bold'>Edit SR Application Type</h1>
        <p className='text-gray-500 mt-2'>
          Update application type information.
        </p>
        <div className='mt-2 flex items-center gap-2'>
          <span className='text-sm font-medium'>Current Name:</span>
          <span className='text-sm bg-gray-100 px-2 py-1 rounded'>
            {applicationType.applicationName}
          </span>
          <span className='text-sm font-medium'>Current Fee:</span>
          <span className='text-sm bg-gray-100 px-2 py-1 rounded'>
            Rs. {applicationType.applicationFee.toLocaleString()}
          </span>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2'>
          <Card>
            <CardContent className='pt-6'>
              <EntityForm
                schema={updateSrApplicationTypeSchema}
                fields={updateSrApplicationTypeFormFields}
                defaultValues={defaultValues}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                submitLabel='Update Application Type'
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
                  <span className='text-gray-600'>Application Name:</span>
                  <span className='font-medium'>
                    {applicationType.applicationName}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Description:</span>
                  <span className='font-medium'>
                    {applicationType.applicationDesc || 'No description'}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Current Fee:</span>
                  <span className='font-medium text-green-600'>
                    Rs. {applicationType.applicationFee.toLocaleString()}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Status:</span>
                  <span
                    className={`font-medium ${
                      applicationType.isDeleted
                        ? 'text-red-600'
                        : 'text-green-600'
                    }`}
                  >
                    {applicationType.isDeleted ? 'Deleted' : 'Active'}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Created:</span>
                  <span className='font-medium'>
                    {new Date(applicationType.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Last Updated:</span>
                  <span className='font-medium'>
                    {new Date(applicationType.updatedAt).toLocaleDateString()}
                  </span>
                </div>
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
                  <li>Changing the name will update all references</li>
                  <li>Fee changes will affect future applications only</li>
                  <li>Existing applications will retain the old fee</li>
                  <li>Deleted types cannot be restored</li>
                  <li>
                    Consider creating a new type instead of editing heavily used
                    ones
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
