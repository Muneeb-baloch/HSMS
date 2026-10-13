// src/app/(dashboard)/paymentmodes/edit/[id]/page.tsx
'use client'

import { EntityForm } from '@/components/shared/EntityForm/EntityForm'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { paymentModeFormFields } from '@/lib/constants/paymentModeForm.constants'
import { hasPermission, UserRole as UserRoleEnum } from '@/lib/constants/roles'
import {
  usePaymentMode,
  useUpdatePaymentMode
} from '@/lib/hooks/entities/usePaymentMode'
import { useAuth } from '@/lib/hooks/useAuth'
import { paymentModeSchema } from '@/lib/schemas/paymentMode.schema'
import { UpdatePaymentModeDto } from '@/lib/types/paymentMode'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { FormPageSkeleton } from '@/components/shared/PageSkeleton'

interface EditPaymentModePageProps {
  params: {
    id: string
  }
}

export default function EditPaymentModePage ({
  params
}: EditPaymentModePageProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { id } = params

  const {
    data: paymentMode,
    isLoading: isLoadingMode,
    error
  } = usePaymentMode(id)
  const updateMutation = useUpdatePaymentMode()

  const canUpdate =
    user &&
    hasPermission(
      user.role as UserRoleEnum,
      [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN] as UserRoleEnum[]
    )

  useEffect(() => {
    if (!canUpdate) {
      router.push('/paymentmodes')
    }
  }, [canUpdate, router])

  if (!canUpdate) {
    return null
  }

  if (isLoadingMode) {
    return <FormPageSkeleton />
  }

  if (error || !paymentMode) {
    return (
      <div className='space-y-1'>
        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => router.back()}
            className='mb-4'
          >
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-center py-8'>
              <h3 className='text-lg font-medium mb-2'>
                Payment Mode Not Found
              </h3>
              <p className='text-muted-foreground'>
                The payment mode you&apos;re trying to edit doesn&apos;t exist
                or you don&apos;t have permission to access it.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSubmit = async (data: UpdatePaymentModeDto) => {
    try {
      await updateMutation.mutateAsync({ id, data })
      router.push('/paymentmodes')
    } catch (error) {
      console.error('Failed to update payment mode:', error)
    }
  }

  const handleCancel = () => {
    router.push('/paymentmodes')
  }

  // Prepare initial data for the form
  const initialData = {
    paymentModeName: paymentMode.paymentModeName,
    description: paymentMode.description || '',
    isActive: paymentMode.isActive
  }

  return (
    <div className='space-y-1'>
      <div className='flex items-center gap-2'>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => router.back()}
          className='mb-4'
        >
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back
        </Button>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2'>
          <Card>
            <CardHeader>
              <CardTitle className='text-2xl'>Edit Payment Mode</CardTitle>
            </CardHeader>
            <CardContent>
              <EntityForm
                schema={paymentModeSchema}
                fields={paymentModeFormFields}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={updateMutation.isPending}
                defaultValues={initialData}
                submitLabel='Update Payment Mode'
                cancelLabel='Cancel'
              />
            </CardContent>
          </Card>
        </div>

        <div className='space-y-6'>
          {/* Payment Mode Information */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>
                Payment Mode Information
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div>
                <p className='text-sm text-muted-foreground'>Current Mode</p>
                <p className='font-medium'>{paymentMode.paymentModeName}</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Created</p>
                <p className='font-medium'>
                  {new Date(paymentMode.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Last Updated</p>
                <p className='font-medium'>
                  {paymentMode.modifiedOn
                    ? new Date(paymentMode.modifiedOn).toLocaleDateString()
                    : new Date(paymentMode.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Status</p>
                <Badge
                  className={
                    paymentMode.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }
                >
                  {paymentMode.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Update Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Update Guidelines</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              <div className='text-sm'>
                <p className='font-medium mb-1'>Note:</p>
                <ul className='text-xs text-gray-500 space-y-1 list-disc pl-5'>
                  <li>
                    Changing payment mode name may affect existing transactions
                  </li>
                  <li>
                    Inactive payment modes won&apos;t be available for new
                    transactions
                  </li>
                  <li>
                    Consider the impact on reporting before making changes
                  </li>
                  <li>Test changes in a development environment first</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
