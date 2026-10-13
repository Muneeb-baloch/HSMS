'use client'

import {
  EntityForm,
  FieldConfig
} from '@/components/shared/EntityForm/EntityForm'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import {
  useRecordFeePayment,
  useTransferById
} from '@/lib/hooks/entities/useTransfer'
import { useAuth } from '@/lib/hooks/useAuth'
import {
  FeePaymentFormData,
  feePaymentSchema
} from '@/lib/schemas/transfer.schema'
import { RecordFeePaymentDto } from '@/lib/types/transfer.types'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { customToast } from "@/lib/utils/customToast"
import { DetailPageSkeleton } from '@/components/shared/PageSkeleton'

const feePaymentFields: FieldConfig<FeePaymentFormData>[] = [
  {
    name: 'amount',
    label: 'Amount',
    type: 'number',
    required: true,
    placeholder: 'Enter amount'
  },
  {
    name: 'paymentDate',
    label: 'Payment Date',
    type: 'date',
    required: true
  },
  {
    name: 'paymentMethod',
    label: 'Payment Method',
    type: 'select',
    required: true,
    options: [
      { label: 'Cash', value: 'Cash' },
      { label: 'Bank Transfer', value: 'Bank Transfer' },
      { label: 'Cheque', value: 'Cheque' },
      { label: 'Online Payment', value: 'Online Payment' }
    ]
  },
  {
    name: 'transactionId',
    label: 'Transaction ID',
    type: 'text',
    required: false,
    placeholder: 'Enter transaction ID'
  },
  {
    name: 'receiptNumber',
    label: 'Receipt Number',
    type: 'text',
    required: false,
    placeholder: 'Enter receipt number'
  }
]

export default function FeePaymentPage () {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()

  const id = params.id as string
  const { data: transfer, isLoading } = useTransferById(id)
  const recordPaymentMutation = useRecordFeePayment()

  const canUpdate =
    user &&
    hasPermission(
      user.role as UserRole,
      [UserRole.ADMIN, UserRole.SUPER_ADMIN] as UserRole[]
    )

  if (!canUpdate) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to record fee payments.
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

  if (!transfer) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Transfer Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/transfers')}>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Transfers
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (transfer.transferFeePaid) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Fee Already Paid</CardTitle>
            <CardDescription>
              The transfer fee has already been recorded as paid.
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

  const defaultValues: FeePaymentFormData = {
    amount: transfer.transferFeeAmount || 0,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash',
    transactionId: '',
    receiptNumber: ''
  }

  const handleSubmit = async (data: FeePaymentFormData) => {
    try {
      const paymentData: RecordFeePaymentDto = {
        ...data,
        paymentDate: new Date(data.paymentDate).toISOString()
      }

      await recordPaymentMutation.mutateAsync({ id, data: paymentData })
      customToast.success('Fee payment recorded successfully')
      router.push(`/transfers/view/${id}`)
    } catch (error: any) {
      customToast.error(
        error.response?.data?.message || 'Failed to record fee payment'
      )
    }
  }

  const handleCancel = () => {
    router.back()
  }

  const seller =
    typeof transfer.sellerMemId === 'object' ? transfer.sellerMemId : null
  const buyer =
    typeof transfer.buyerMemId === 'object' ? transfer.buyerMemId : null

  return (
    <div className='p-6 space-y-6'>
      <div>
        <Button variant='ghost' onClick={() => router.back()} className='mb-4'>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back to Transfer
        </Button>

        <h1 className='text-3xl font-bold'>Record Fee Payment</h1>
        <p className='text-gray-500 mt-2'>
          Record payment for transfer from {seller?.memName || 'Seller'} to{' '}
          {buyer?.memName || 'Buyer'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transfer Information</CardTitle>
          <CardDescription>
            Transfer Fee:{' '}
            {transfer.transferFeeAmount
              ? `Rs. ${transfer.transferFeeAmount.toLocaleString()}`
              : 'Not set'}
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className='pt-6'>
          <EntityForm
            schema={feePaymentSchema}
            fields={feePaymentFields}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel='Record Payment'
            cancelLabel='Cancel'
            isLoading={recordPaymentMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  )
}
