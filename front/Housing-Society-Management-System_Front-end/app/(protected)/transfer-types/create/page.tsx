// src/app/(dashboard)/transfer-types/create/page.tsx
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
import { transferTypeFormFields } from '@/lib/constants/transferTypeForm.constants'
import { useCreateTransferType } from '@/lib/hooks/entities/useTransferType'
import { useAuth } from '@/lib/hooks/useAuth'
import { transferTypeSchema } from '@/lib/schemas/transfer-type.schema'
import { CreateTransferTypeDto } from '@/lib/types/transfer-type'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { customToast } from "@/lib/utils/customToast"

export default function CreateTransferTypePage () {
  const router = useRouter()
  const { user } = useAuth()
  const createMutation = useCreateTransferType()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canCreate =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

  const handleSubmit = async (data: unknown) => {
    try {
      setIsSubmitting(true)
      const formData = data as CreateTransferTypeDto

      await createMutation.mutateAsync(formData)
      customToast.success('Transfer type created successfully')
      router.push('/transfer-types')
    } catch (error) {
      customToast.error(
        'Failed to create transfer type' +
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
              You don&apos;t have permission to create transfer types.
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
          Back to Transfer Types
        </Button>

        <h1 className='text-3xl font-bold'>Create Transfer Type</h1>
        <p className='text-gray-500 mt-2'>
          Add a new transfer type to the system
        </p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2'>
          <Card>
            <CardContent className='pt-6'>
              <EntityForm
                schema={transferTypeSchema}
                fields={transferTypeFormFields}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                submitLabel='Create Transfer Type'
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
                <div className='font-medium'>About Transfer Types:</div>
                <ul className='space-y-1 list-disc pl-4'>
                  <li>
                    Transfer types define different property transfer methods
                  </li>
                  <li>Each type has a specific fee structure</li>
                  <li>Used to categorize property transfers</li>
                  <li>Can be marked as active or inactive</li>
                  <li>Deleted types are archived in the system</li>
                </ul>
              </div>
              <div className='border-t pt-3'>
                <div className='font-medium'>Best Practices:</div>
                <ul className='space-y-1 list-disc pl-4'>
                  <li>Use clear, descriptive names</li>
                  <li>Set appropriate fees based on market rates</li>
                  <li>Include helpful descriptions</li>
                  <li>Keep common types always active</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Required Fields */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Required Information</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 text-sm text-gray-600'>
              <div className='space-y-2'>
                <div className='font-medium'>What to include:</div>
                <ul className='space-y-1'>
                  <li className='flex items-start gap-2'>
                    <span className='text-red-500 mt-1'>•</span>
                    <span>Clear transfer type name (e.g., "Sale", "Gift")</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='text-red-500 mt-1'>•</span>
                    <span>Accurate transfer fee amount</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='text-blue-500 mt-1'>•</span>
                    <span>Optional: Description of when to use this type</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='text-gray-500 mt-1'>•</span>
                    <span>Consider typical document requirements</span>
                  </li>
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
                <div className='font-medium'>Typical Fee Ranges:</div>
                <ul className='space-y-2'>
                  <li className='flex justify-between'>
                    <span>Sale/Resale:</span>
                    <span className='font-medium'>Rs. 50,000+</span>
                  </li>
                  <li className='flex justify-between'>
                    <span>Gift/Hiba:</span>
                    <span className='font-medium'>Rs. 25,000-35,000</span>
                  </li>
                  <li className='flex justify-between'>
                    <span>Inheritance:</span>
                    <span className='font-medium'>Rs. 15,000-25,000</span>
                  </li>
                  <li className='flex justify-between'>
                    <span>Mortgage:</span>
                    <span className='font-medium'>Rs. 20,000-30,000</span>
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
