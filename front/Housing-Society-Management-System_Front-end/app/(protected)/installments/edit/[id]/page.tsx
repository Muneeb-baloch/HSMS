// src/app/(dashboard)/installments/edit/[id]/page.tsx
'use client'

import { EntityForm } from '@/components/shared/EntityForm/EntityForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { updateInstallmentFormFields } from '@/lib/constants/installmentForm.constants'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import {
  useInstallment,
  useUpdateInstallment,
} from '@/lib/hooks/entities/useInstallment'
import { useAuth } from '@/lib/hooks/useAuth'
import { updateInstallmentSchema } from '@/lib/schemas/installment.schema'
import { UpdateInstallmentDto } from '@/lib/types/installment'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { customToast } from "@/lib/utils/customToast"
import { FormPageSkeleton } from '@/components/shared/PageSkeleton'

export default function EditInstallmentPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const updateMutation = useUpdateInstallment()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const id = params.id as string
  const { data: installment, isLoading, error } = useInstallment(id)

  const canUpdate = user && hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

  if (!canUpdate) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to edit installments.
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

  if (error || !installment) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Failed to load installment data.</CardDescription>
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
    installmentNo: installment.installmentNo,
    installmentTitle: installment.installmentTitle,
    installmentType: installment.installmentType,
    dueDate: new Date(installment.dueDate),
    amountDue: installment.amountDue,
    lateFeeSurcharge: installment.lateFeeSurcharge || 0,
    amountPaid: installment.amountPaid,
    paidDate: installment.paidDate ? new Date(installment.paidDate) : undefined,
    paymentMode: installment.paymentMode,
    transactionRefNo: installment.transactionRefNo || '',
    status: installment.status,
    installmentRemarks: installment.installmentRemarks || '',
  }

  const handleSubmit = async (data: unknown) => {
    try {
      setIsSubmitting(true)
      const formData = data as UpdateInstallmentDto

      const submitData: any = {}

      Object.keys(formData).forEach(key => {
        if (formData[key as keyof UpdateInstallmentDto] !== undefined) {
          const value = formData[key as keyof UpdateInstallmentDto]

          if (key === 'dueDate' || key === 'paidDate') {
            submitData[key] = value ? new Date(value as string) : undefined
          } else if (key === 'amountDue' || key === 'lateFeeSurcharge' || key === 'amountPaid') {
            submitData[key] = Number(value)
          } else {
            submitData[key] = value
          }
        }
      })

      await updateMutation.mutateAsync({
        id,
        data: submitData,
      })

      customToast.success('Installment updated successfully')
      router.push('/installments')
    } catch (error) {
      customToast.error(
        'Failed to update installment' +
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

        <h1 className='text-3xl font-bold'>Edit Installment</h1>
        <p className='text-gray-500 mt-2'>Update installment information.</p>
        <div className='mt-2 flex items-center gap-2'>
          <span className='text-sm font-medium'>Installment:</span>
          <span className='text-sm bg-gray-100 px-2 py-1 rounded'>
            {installment.installmentTitle}
          </span>
          <span className='text-sm font-medium'>Member:</span>
          <span className='text-sm bg-gray-100 px-2 py-1 rounded'>
            {typeof installment.memId === 'object' ? installment.memId.memName
 : 'Member'}
          </span>
        </div>
      </div>

      <Card>
        <CardContent className='pt-6'>
          <EntityForm
            schema={updateInstallmentSchema}
            fields={updateInstallmentFormFields}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel='Update Installment'
            cancelLabel='Cancel'
            isLoading={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  )
}
