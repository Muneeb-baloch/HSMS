// src/app/(dashboard)/installments/create/page.tsx
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
import { installmentFormFields } from '@/lib/constants/installmentForm.constants'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import { useCreateInstallment } from '@/lib/hooks/entities/useInstallment'
import { useAuth } from '@/lib/hooks/useAuth'
import { installmentSchema } from '@/lib/schemas/installment.schema'
import { CreateInstallmentDto } from '@/lib/types/installment'
import { apiClient } from '@/lib/API/client'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { customToast } from "@/lib/utils/customToast"

export default function CreateInstallmentPage () {
  const router = useRouter()
  const { user } = useAuth()
  const createMutation = useCreateInstallment()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Calculate default due date (3 days from today)
  const getDefaultDueDate = () => {
    const today = new Date()
    const dueDate = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)
    return dueDate.toISOString().split('T')[0]
  }

  // Filter out installmentNo field as it's auto-generated
  const formFields = installmentFormFields.filter(
    field => field.name !== 'installmentNo'
  )

  const canCreate =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

  if (!canCreate) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to create installments.
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

  const handleSubmit = async (data: unknown) => {
    try {
      setIsSubmitting(true)
      const formData = data as CreateInstallmentDto

      let installmentNo = formData.installmentNo || 1

      // Auto-generate installmentNo based on existing installments for the file
      if (formData.fileId) {
        try {
          const response = await apiClient.get(`/installment/by-file/${formData.fileId}`)
          if (response.data.success && response.data.data.installments) {
            const maxNo = response.data.data.installments.reduce(
              (max: number, inst: any) => Math.max(max, inst.installmentNo || 0),
              0
            )
            installmentNo = maxNo + 1
          }
        } catch (error) {
          // If no installments exist, start from 1
          installmentNo = 1
        }
      }

      const submitData = {
        ...formData,
        installmentNo,
        dueDate: new Date(formData.dueDate),
        amountDue: Number(formData.amountDue),
        lateFeeSurcharge: formData.lateFeeSurcharge
          ? Number(formData.lateFeeSurcharge)
          : 0
      }

      await createMutation.mutateAsync(submitData)
      customToast.success('Installment created successfully')
      router.push('/installments')
    } catch (error) {
      customToast.error(
        'Failed to create installment' +
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
          Back to Installments
        </Button>

        <h1 className='text-3xl font-bold'>Create Installment</h1>
        <p className='text-gray-500 mt-2'>
          Create a new installment payment for a member
        </p>
      </div>

      <Card>
        <CardContent className='pt-6'>
          <EntityForm
            schema={installmentSchema}
            fields={formFields}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel='Create Installment'
            cancelLabel='Cancel'
            isLoading={isSubmitting}
            defaultValues={{
              dueDate: getDefaultDueDate(),
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
