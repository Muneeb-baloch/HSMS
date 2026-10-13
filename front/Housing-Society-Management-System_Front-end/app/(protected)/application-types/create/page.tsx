// src/app/(dashboard)/application-types/create/page.tsx
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
import { srApplicationTypeFormFields } from '@/lib/constants/srApplicationTypeForm.constants'
import { useCreateSrApplicationType } from '@/lib/hooks/entities/useSrApplicationType'
import { useAuth } from '@/lib/hooks/useAuth'
import { srApplicationTypeSchema } from '@/lib/schemas/srApplicationType.schema'
import { CreateSrApplicationTypeDto } from '@/lib/types/srApplicationType'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { customToast } from '@/lib/utils/customToast'

export default function CreateSrApplicationTypePage () {
  const router = useRouter()
  const { user } = useAuth()
  const createMutation = useCreateSrApplicationType()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canCreate =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

  const handleSubmit = async (data: unknown) => {
    try {
      setIsSubmitting(true)
      const formData = data as CreateSrApplicationTypeDto

      const submitData = {
        ...formData,
        applicationFee: Number(formData.applicationFee)
      }

      await createMutation.mutateAsync(submitData)
      customToast.success('SR Application Type created successfully')
      router.push('/application-types')
    } catch (error) {
      customToast.error(
        'Failed to create SR Application Type' +
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
              You don&apos;t have permission to create SR Application Types.
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
          Back to SR Application Types
        </Button>

        <h1 className='text-3xl font-bold'>Create SR Application Type</h1>
        <p className='text-gray-500 mt-2'>
          Add a new type of SR (Sales/Registration) application
        </p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2'>
          <Card>
            <CardContent className='pt-6'>
              <EntityForm
                schema={srApplicationTypeSchema}
                fields={srApplicationTypeFormFields}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                submitLabel='Create Application Type'
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
                <div className='font-medium'>About SR Application Types:</div>
                <ul className='space-y-1 list-disc pl-4'>
                  <li>
                    Define different types of sales/registration applications
                  </li>
                  <li>Each type has a unique name and application fee</li>
                  <li>Used in SR application forms for fee calculation</li>
                  <li>Active types are available for selection</li>
                  <li>
                    Deleted types are archived and not available for new
                    applications
                  </li>
                </ul>
              </div>
              <div className='border-t pt-3'>
                <div className='font-medium'>Best Practices:</div>
                <ul className='space-y-1 list-disc pl-4'>
                  <li>Use clear, descriptive names</li>
                  <li>Set appropriate application fees</li>
                  <li>Add descriptions to explain the application type</li>
                  <li>Review and update fees periodically</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Fee Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Fee Guidelines</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 text-sm text-gray-600'>
              <div className='space-y-2'>
                <div className='font-medium'>Typical Application Fees:</div>
                <ul className='space-y-1'>
                  <li className='flex justify-between'>
                    <span>Basic Registration:</span>
                    <span className='font-medium'>Rs. 5,000 - 10,000</span>
                  </li>
                  <li className='flex justify-between'>
                    <span>Plot Transfer:</span>
                    <span className='font-medium'>Rs. 10,000 - 25,000</span>
                  </li>
                  <li className='flex justify-between'>
                    <span>Joint Application:</span>
                    <span className='font-medium'>Rs. 15,000 - 30,000</span>
                  </li>
                  <li className='flex justify-between'>
                    <span>Commercial Application:</span>
                    <span className='font-medium'>Rs. 25,000 - 50,000</span>
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
