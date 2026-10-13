// src/app/(dashboard)/installments/bulk-create/page.tsx
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
import { bulkInstallmentFormFields } from '@/lib/constants/installmentForm.constants'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import { useCreateBulkInstallments } from '@/lib/hooks/entities/useInstallment'
import { useAuth } from '@/lib/hooks/useAuth'
import { bulkInstallmentSchema } from '@/lib/schemas/installment.schema'
import { BulkInstallmentCreationDto } from '@/lib/types/installment'
import { ArrowLeft, Calculator } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { customToast } from "@/lib/utils/customToast"

export default function BulkCreateInstallmentsPage () {
  const router = useRouter()
  const { user } = useAuth()
  const createBulkMutation = useCreateBulkInstallments()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [totalAmount, setTotalAmount] = useState(0)

  const canCreate =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

  const handleCalculateTotal = (data: any) => {
    const totalInstallments = Number(data.totalInstallments) || 0
    const amountPerInstallment = Number(data.amountPerInstallment) || 0
    setTotalAmount(totalInstallments * amountPerInstallment)
  }

  const customFields = bulkInstallmentFormFields.map(field => {
    if (
      field.name === 'totalInstallments' ||
      field.name === 'amountPerInstallment'
    ) {
      return {
        ...field,
        onChange: (value: any, form: any) => {
          if (field.onChange) field.onChange(value, form)
          const formData = form.getValues()
          handleCalculateTotal(formData)
        }
      }
    }
    return field
  })

  if (!canCreate) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to create bulk installments.
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
      const formData = data as BulkInstallmentCreationDto

      const submitData = {
        ...formData,
        startDate: new Date(formData.startDate),
        totalInstallments: Number(formData.totalInstallments),
        amountPerInstallment: Number(formData.amountPerInstallment)
      }

      await createBulkMutation.mutateAsync(submitData)
      customToast.success('Bulk installments created successfully')
      router.push('/installments')
    } catch (error) {
      customToast.error(
        'Failed to create bulk installments' +
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

        <h1 className='text-3xl font-bold'>Create Bulk Installments</h1>
        <p className='text-gray-500 mt-2'>
          Create multiple installments for a member at once
        </p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2'>
          <Card>
            <CardContent className='pt-6'>
              <EntityForm
                schema={bulkInstallmentSchema}
                fields={customFields}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                submitLabel='Create Installments'
                cancelLabel='Cancel'
                isLoading={isSubmitting}
              />
            </CardContent>
          </Card>
        </div>

        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Calculator className='h-5 w-5' />
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-3'>
                <div className='flex justify-between'>
                  <span className='text-sm text-gray-500'>
                    Total Installments:
                  </span>
                  <span className='font-medium'>
                    {Math.min(
                      totalAmount > 0
                        ? Math.ceil(
                            totalAmount /
                              (Number(
                                bulkInstallmentFormFields.find(
                                  f => f.name === 'amountPerInstallment'
                                )?.defaultValue
                              ) || 1)
                          )
                        : 0,
                      360
                    )}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm text-gray-500'>
                    Amount per Installment:
                  </span>
                  <span className='font-medium'>
                    Rs.{' '}
                    {(
                      Number(
                        bulkInstallmentFormFields.find(
                          f => f.name === 'amountPerInstallment'
                        )?.defaultValue
                      ) || 0
                    ).toLocaleString()}
                  </span>
                </div>
                <div className='border-t pt-3'>
                  <div className='flex justify-between text-lg font-bold'>
                    <span>Total Amount:</span>
                    <span className='text-blue-600'>
                      Rs. {totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Frequency Details</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='text-sm text-gray-600'>
                <div className='font-medium mb-2'>Payment Schedule:</div>
                <ul className='space-y-1 list-disc pl-4'>
                  <li>Monthly: Payments every month</li>
                  <li>Quarterly: Payments every 3 months</li>
                  <li>Half-Yearly: Payments every 6 months</li>
                  <li>Yearly: Payments every 12 months</li>
                </ul>
              </div>
              <div className='text-sm text-gray-600'>
                <div className='font-medium mb-1'>Note:</div>
                <p>
                  Installments will be automatically generated based on the
                  start date and frequency.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
