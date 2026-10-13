// src/app/(dashboard)/applications/create/page.tsx
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
import { applicationFormFields } from '@/lib/constants/applicationForm.constants'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import { useCreateApplication } from '@/lib/hooks/entities/useApplication'
import { useAuth } from '@/lib/hooks/useAuth'
import { applicationSchema } from '@/lib/schemas/application.schema'
import { CreateApplicationDto } from '@/lib/types/application'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { customToast } from '@/lib/utils/customToast'

export default function CreateApplicationPage () {
  const router = useRouter()
  const { user } = useAuth()
  const createMutation = useCreateApplication()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canCreate =
    user &&
    hasPermission(user.role as UserRole, [
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
      UserRole.MODERATOR
    ])

  const handleSubmit = async (data: unknown) => {
    try {
      setIsSubmitting(true)
      const formData = data as CreateApplicationDto

      await createMutation.mutateAsync(formData)
      customToast.success('Application created successfully')
      router.push('/applications')
    } catch (error) {
      customToast.error(
        'Failed to create application' +
          (error instanceof Error ? `: ${error.message}` : '')
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  if (!canCreate) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to create applications.
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

  return (
    <div className='p-6'>
      <div className='mb-6'>
        <Button variant='ghost' onClick={() => router.back()} className='mb-4'>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back to Applications
        </Button>

        <h1 className='text-3xl font-bold'>Create Application</h1>
        <p className='text-gray-500 mt-2'>
          Add a new application to the system
        </p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2'>
          <Card>
            <CardContent className='pt-6'>
              <EntityForm
                schema={applicationSchema}
                fields={applicationFormFields}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                submitLabel='Create Application'
                cancelLabel='Cancel'
                isLoading={isSubmitting}
              />
            </CardContent>
          </Card>
        </div>

        <div className='space-y-6'>
          {/* Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Information</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 text-sm text-gray-600'>
              <div className='space-y-2'>
                <div className='font-medium'>About Applications:</div>
                <ul className='space-y-1 list-disc pl-4'>
                  <li>Applications represent formal requests or submissions</li>
                  <li>Each application is associated with a member</li>
                  <li>Applications can be linked to specific plots</li>
                  <li>
                    Applications have defined statuses (Pending, Approved,
                    Rejected)
                  </li>
                  <li>Application numbers are auto-generated</li>
                  <li>Deleted applications are archived</li>
                </ul>
              </div>
              <div className='border-t pt-3'>
                <div className='font-medium'>Required Information:</div>
                <ul className='space-y-1 list-disc pl-4'>
                  <li>Application Type (required)</li>
                  <li>Member (required)</li>
                  <li>Application Date (required)</li>
                  <li>Status (required)</li>
                  <li>Plot (optional)</li>
                  <li>Remarks (optional)</li>
                  <li>Attachment (optional)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Important Notes */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Important Notes</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 text-sm text-gray-600'>
              <div className='space-y-2'>
                <ul className='space-y-1'>
                  <li className='flex items-start gap-2'>
                    <span className='text-red-500 mt-1'>•</span>
                    <span>
                      Application numbers are auto-generated in the format
                      APP-YYYY-NNN
                    </span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='text-red-500 mt-1'>•</span>
                    <span>Ensure all required fields are filled</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='text-blue-500 mt-1'>•</span>
                    <span>
                      Attachments must be uploaded to Cloudinary first
                    </span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='text-blue-500 mt-1'>•</span>
                    <span>Date format: YYYY-MM-DD</span>
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
