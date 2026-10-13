// src/app/(dashboard)/paymentmodes/create/page.tsx
'use client'

import { EntityForm } from '@/components/shared/EntityForm/EntityForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { paymentModeFormFields } from '@/lib/constants/paymentModeForm.constants'
import { hasPermission, UserRole as UserRoleEnum } from '@/lib/constants/roles'
import { useCreatePaymentMode } from '@/lib/hooks/entities/usePaymentMode'
import { useAuth } from '@/lib/hooks/useAuth'
import { paymentModeSchema } from '@/lib/schemas/paymentMode.schema'
import { CreatePaymentModeDto } from '@/lib/types/paymentMode'
import { ArrowLeft, Info } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function CreatePaymentModePage () {
  const router = useRouter()
  const { user } = useAuth()
  const createMutation = useCreatePaymentMode()

  const canCreate =
    user &&
    hasPermission(
      user.role as UserRoleEnum,
      [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN] as UserRoleEnum[]
    )

  useEffect(() => {
    if (!canCreate) {
      router.push('/paymentmodes')
    }
  }, [canCreate, router])

  if (!canCreate) {
    return null
  }

  const handleSubmit = async (data: CreatePaymentModeDto) => {
    try {
      await createMutation.mutateAsync(data)
      router.push('/paymentmodes')
    } catch (error) {
      console.error('Failed to create payment mode:', error)
    }
  }

  const handleCancel = () => {
    router.push('/paymentmodes')
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
              <CardTitle className='text-2xl'>
                Create New Payment Mode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EntityForm
                schema={paymentModeSchema}
                fields={paymentModeFormFields}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={createMutation.isPending}
                submitLabel='Create Payment Mode'
                cancelLabel='Cancel'
              />
            </CardContent>
          </Card>
        </div>

        <div className='space-y-6'>
          {/* Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Guidelines</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              <div className='text-sm'>
                <p className='font-medium mb-1'>Payment Mode Name:</p>
                <ul className='text-xs text-gray-500 space-y-1 list-disc pl-5'>
                  <li>Add any payment method name (e.g. Cash, Bank Transfer, Online Payment)</li>
                  <li>Must be unique across the system</li>
                  <li>Use descriptive, clear names (max 100 characters)</li>
                </ul>
              </div>

              <div className='text-sm mt-3'>
                <p className='font-medium mb-1'>Description:</p>
                <ul className='text-xs text-gray-500 space-y-1 list-disc pl-5'>
                  <li>Optional but recommended</li>
                  <li>Describe when this payment mode is used</li>
                  <li>Include any special instructions</li>
                  <li>Max 500 characters</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
