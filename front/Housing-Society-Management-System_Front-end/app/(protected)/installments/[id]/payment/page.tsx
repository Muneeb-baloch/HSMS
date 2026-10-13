// src/app/(dashboard)/installments/[id]/payment/page.tsx
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
import { paymentFormFields } from '@/lib/constants/installmentForm.constants'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import {
  useInstallment,
  useRecordPayment,
  useValidatePayment
} from '@/lib/hooks/entities/useInstallment'
import { useAuth } from '@/lib/hooks/useAuth'
import { paymentSchema } from '@/lib/schemas/installment.schema'
import { RecordPaymentDto } from '@/lib/types/installment'
import { formatCurrency } from '@/lib/utils/format'
import { ArrowLeft, Calculator, CheckCircle, Loader2 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { customToast } from "@/lib/utils/customToast"
import { DetailPageSkeleton } from '@/components/shared/PageSkeleton'

export default function RecordPaymentPage () {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const recordPaymentMutation = useRecordPayment()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState<number>(0)

  const id = params.id as string
  const { data: installment, isLoading } = useInstallment(id)
  const { data: validation, refetch: validatePayment } = useValidatePayment(
    id,
    paymentAmount
  )

  const canUpdate =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

  const customFields = paymentFormFields.map(field => {
    if (field.name === 'amountPaid') {
      return {
        ...field,
        onChange: (value: any) => {
          const amount = Number(value) || 0
          setPaymentAmount(amount)
          if (amount > 0) {
            setTimeout(() => validatePayment(), 500)
          }
        }
      }
    }
    return field
  })

  if (!canUpdate) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to record payments.
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
    return <DetailPageSkeleton />
  }

  if (!installment) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Installment not found.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/installments')}>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Installments
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const defaultValues = {
    amountPaid: 0,
    paidDate: new Date(),
    paymentMode: 'Cash',
    transactionRefNo: '',
    remarks: ''
  }

  const handleSubmit = async (data: unknown) => {
    try {
      setIsSubmitting(true)
      const formData = data as RecordPaymentDto

      // Validate payment amount
      if (!validation?.isValid) {
        customToast.error(validation?.message || 'Invalid payment amount')
        return
      }

      const submitData = {
        ...formData,
        paidDate: new Date(formData.paidDate),
        amountPaid: Number(formData.amountPaid)
      }

      await recordPaymentMutation.mutateAsync({
        id,
        data: submitData
      })

      customToast.success('Payment recorded successfully')
      router.push('/installments')
    } catch (error) {
      customToast.error(
        'Failed to record payment' +
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

        <h1 className='text-3xl font-bold'>Record Payment</h1>
        <p className='text-gray-500 mt-2'>Record payment for installment.</p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2'>
          <Card>
            <CardContent className='pt-6'>
              <EntityForm
                schema={paymentSchema}
                fields={customFields}
                defaultValues={defaultValues}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                submitLabel='Record Payment'
                cancelLabel='Cancel'
                isLoading={isSubmitting}
              />
            </CardContent>
          </Card>
        </div>

        <div className='space-y-6'>
          {/* Installment Summary */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Calculator className='h-5 w-5' />
                Installment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-3'>
                <div className='flex justify-between'>
                  <span className='text-sm text-gray-500'>Installment:</span>
                  <span className='font-medium'>
                    {installment.installmentTitle}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm text-gray-500'>Due Date:</span>
                  <span className='font-medium'>
                    {new Date(installment.dueDate).toLocaleDateString()}
                  </span>
                </div>
                <div className='border-t pt-3'>
                  <div className='space-y-2'>
                    <div className='flex justify-between'>
                      <span className='text-sm text-gray-500'>Amount Due:</span>
                      <span className='font-medium'>
                        {formatCurrency(installment.amountDue)}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-sm text-gray-500'>
                        Amount Paid:
                      </span>
                      <span className='font-medium text-green-600'>
                        {formatCurrency(installment.amountPaid)}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-sm text-gray-500'>Balance:</span>
                      <span className='font-medium text-red-600'>
                        {formatCurrency(installment.balanceAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Validation */}
          {paymentAmount > 0 && validation && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <CheckCircle className='h-5 w-5' />
                  Payment Validation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`p-4 rounded-lg ${
                    validation.isValid
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <div className='flex items-start gap-3'>
                    <div
                      className={`p-2 rounded-full ${
                        validation.isValid ? 'bg-green-100' : 'bg-red-100'
                      }`}
                    >
                      <CheckCircle
                        className={`h-5 w-5 ${
                          validation.isValid ? 'text-green-600' : 'text-red-600'
                        }`}
                      />
                    </div>
                    <div>
                      <h3
                        className={`font-semibold ${
                          validation.isValid ? 'text-green-800' : 'text-red-800'
                        }`}
                      >
                        {validation.isValid
                          ? 'Payment Valid'
                          : 'Payment Invalid'}
                      </h3>
                      <p
                        className={`text-sm mt-1 ${
                          validation.isValid ? 'text-green-700' : 'text-red-700'
                        }`}
                      >
                        {validation.message ||
                          (validation.isValid
                            ? 'Payment amount is valid'
                            : 'Please check the payment amount')}
                      </p>
                      {validation.maxPaymentAllowed && (
                        <p className='text-sm text-gray-600 mt-2'>
                          Maximum allowed:{' '}
                          {formatCurrency(validation.maxPaymentAllowed)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Amount Buttons */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Quick Amounts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 gap-2'>
                {[
                  installment.balanceAmount,
                  installment.amountDue,
                  installment.balanceAmount / 2,
                  installment.balanceAmount / 4
                ]
                  .filter(amount => amount > 0)
                  .map((amount, index) => (
                    <Button
                      key={index}
                      variant='outline'
                      onClick={() => setPaymentAmount(amount)}
                      className='justify-start'
                    >
                      {formatCurrency(amount)}
                    </Button>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
