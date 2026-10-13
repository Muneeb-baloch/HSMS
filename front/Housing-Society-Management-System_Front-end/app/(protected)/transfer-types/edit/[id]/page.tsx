// src/app/(dashboard)/transfer-types/edit/[id]/page.tsx
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
import { updateTransferTypeFormFields } from '@/lib/constants/transferTypeForm.constants'
import {
  useTransferType,
  useUpdateTransferType
} from '@/lib/hooks/entities/useTransferType'
import { useAuth } from '@/lib/hooks/useAuth'
import { updateTransferTypeSchema } from '@/lib/schemas/transfer-type.schema'
import { UpdateTransferTypeDto } from '@/lib/types/transfer-type'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { customToast } from "@/lib/utils/customToast"
import { FormPageSkeleton } from '@/components/shared/PageSkeleton'

export default function EditTransferTypePage () {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const updateMutation = useUpdateTransferType()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const id = params.id as string
  const { data: transferType, isLoading, error } = useTransferType(id)

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
              You don&apos;t have permission to edit transfer types.
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

  if (error || !transferType) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              Failed to load transfer type data.
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
    typeName: transferType.typeName,
    description: transferType.description || '',
    transferFee: transferType.transferFee,
    isActive: transferType.isActive
  }

  const handleSubmit = async (data: unknown) => {
    try {
      setIsSubmitting(true)
      const formData = data as UpdateTransferTypeDto

      await updateMutation.mutateAsync({
        id,
        data: formData
      })

      customToast.success('Transfer type updated successfully')
      router.push('/transfer-types')
    } catch (error) {
      customToast.error(
        'Failed to update transfer type' +
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
          Back to Transfer Types
        </Button>

        <h1 className='text-3xl font-bold'>Edit Transfer Type</h1>
        <p className='text-gray-500 mt-2'>Update transfer type information.</p>
        <div className='mt-2 flex items-center gap-2'>
          <span className='text-sm font-medium'>Current Status:</span>
          <span
            className={`text-sm px-2 py-1 rounded ${
              transferType.isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {transferType.isActive ? 'Active' : 'Inactive'}
          </span>
          <span className='text-sm font-medium'>Transfers:</span>
          <span className='text-sm bg-blue-100 px-2 py-1 rounded'>
            {transferType.transferCount || 0} uses
          </span>
          <span className='text-sm font-medium'>Created:</span>
          <span className='text-sm bg-gray-100 px-2 py-1 rounded'>
            {new Date(transferType.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2'>
          <Card>
            <CardContent className='pt-6'>
              <EntityForm
                schema={updateTransferTypeSchema}
                fields={updateTransferTypeFormFields}
                defaultValues={defaultValues}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                submitLabel='Update Transfer Type'
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
                  <span className='text-gray-600'>Transfer Type:</span>
                  <span className='font-medium'>{transferType.typeName}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Transfer Fee:</span>
                  <span className='font-medium'>
                    Rs. {transferType.transferFee.toLocaleString()}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Status:</span>
                  <span
                    className={`font-medium ${
                      transferType.isDeleted
                        ? 'text-red-600'
                        : transferType.isActive
                        ? 'text-green-600'
                        : 'text-gray-600'
                    }`}
                  >
                    {transferType.isDeleted
                      ? 'Deleted'
                      : transferType.isActive
                      ? 'Active'
                      : 'Inactive'}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Transfers Count:</span>
                  <span className='font-medium'>
                    {transferType.transferCount || 0}
                  </span>
                </div>
                {transferType.description && (
                  <div className='pt-2'>
                    <div className='text-gray-600 mb-1'>Description:</div>
                    <div className='text-gray-800 text-sm p-2 bg-gray-50 rounded'>
                      {transferType.description}
                    </div>
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
                  <li>Changing fees will affect future transfers</li>
                  <li>Deactivating prevents new transfers using this type</li>
                  <li>Cannot deactivate if active transfers exist</li>
                  <li>Consider impact on existing records</li>
                  <li>Update documentation if description changes</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Usage Warning */}
          {transferType.transferCount && transferType.transferCount > 0 && (
            <Card className='border-yellow-200 bg-yellow-50'>
              <CardHeader>
                <CardTitle className='text-lg text-yellow-800'>
                  Usage Notice
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3 text-sm text-yellow-700'>
                <p>
                  This transfer type has been used in{' '}
                  <strong>{transferType.transferCount}</strong> transfers.
                  Changing the fee or deactivating this type may affect:
                </p>
                <ul className='space-y-1 list-disc pl-4'>
                  <li>Future transfer calculations</li>
                  <li>Reporting and analytics</li>
                  <li>User expectations</li>
                </ul>
                <p className='font-medium mt-2'>
                  Consider creating a new type instead of modifying this one.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
