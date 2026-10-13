// src/app/(dashboard)/installments/view/[id]/page.tsx
'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useInstallment } from '@/lib/hooks/entities/useInstallment'
import { InstallmentStatus } from '@/lib/types/installment'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  FileText,
  Home,
  User
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { DetailPageSkeleton } from '@/components/shared/PageSkeleton'

export default function ViewInstallmentPage () {
  const router = useRouter()
  const params = useParams()

  const id = params.id as string
  const { data: installment, isLoading } = useInstallment(id)

  if (isLoading) {
    return <DetailPageSkeleton />
  }

  if (!installment) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Installment Not Found</CardTitle>
            <CardDescription>
              The requested installment does not exist or has been deleted.
            </CardDescription>
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

  const statusColors = {
    [InstallmentStatus.UNPAID]: 'bg-yellow-100 text-yellow-800',
    [InstallmentStatus.PARTIALLY_PAID]: 'bg-blue-100 text-blue-800',
    [InstallmentStatus.PAID]: 'bg-green-100 text-green-800',
    [InstallmentStatus.OVERDUE]: 'bg-red-100 text-red-800',
    [InstallmentStatus.CANCELLED]: 'bg-gray-100 text-gray-800',
    [InstallmentStatus.REFUNDED]: 'bg-purple-100 text-purple-800'
  }

  const paymentPercentage =
    (installment.amountPaid / installment.totalPayable) * 100

  return (
    <div className='p-6'>
      <Button variant='ghost' onClick={() => router.back()} className='mb-6'>
        <ArrowLeft className='mr-2 h-4 w-4' />
        Back
      </Button>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Main Installment Card */}
        <div className='lg:col-span-2'>
          <Card className='mb-6'>
            <CardHeader>
              <div className='flex justify-between items-start'>
                <div>
                  <CardTitle className='text-2xl'>
                    {installment.installmentTitle}
                  </CardTitle>
                  <CardDescription>
                    Installment #{installment.installmentNo}
                  </CardDescription>
                </div>
                <div className='flex gap-2'>
                  <Badge className={statusColors[installment.status]}>
                    {installment.status}
                  </Badge>
                  <Badge variant='outline'>{installment.installmentType}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Payment Progress */}
              <div className='space-y-4'>
                <div className='flex justify-between'>
                  <div>
                    <div className='text-sm text-gray-500'>
                      Payment Progress
                    </div>
                    <div className='text-2xl font-bold'>
                      {paymentPercentage.toFixed(1)}%
                    </div>
                  </div>
                  <div className='text-right'>
                    <div className='text-sm text-gray-500'>Balance</div>
                    <div className='text-2xl font-bold text-red-600'>
                      {formatCurrency(installment.balanceAmount)}
                    </div>
                  </div>
                </div>
                <Progress value={paymentPercentage} className='h-3' />
                <div className='flex justify-between text-sm'>
                  <span>Paid: {formatCurrency(installment.amountPaid)}</span>
                  <span>Total: {formatCurrency(installment.totalPayable)}</span>
                </div>
              </div>

              {/* Amount Details */}
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                <div className='p-4 bg-blue-50 rounded-lg'>
                  <div className='text-sm text-gray-500'>Amount Due</div>
                  <div className='text-xl font-bold'>
                    {formatCurrency(installment.amountDue)}
                  </div>
                </div>
                <div className='p-4 bg-green-50 rounded-lg'>
                  <div className='text-sm text-gray-500'>Amount Paid</div>
                  <div className='text-xl font-bold text-green-600'>
                    {formatCurrency(installment.amountPaid)}
                  </div>
                </div>
                <div className='p-4 bg-red-50 rounded-lg'>
                  <div className='text-sm text-gray-500'>Balance</div>
                  <div className='text-xl font-bold text-red-600'>
                    {formatCurrency(installment.balanceAmount)}
                  </div>
                </div>
                <div className='p-4 bg-yellow-50 rounded-lg'>
                  <div className='text-sm text-gray-500'>Late Fee</div>
                  <div className='text-xl font-bold'>
                    {formatCurrency(installment.lateFeeSurcharge || 0)}
                  </div>
                </div>
              </div>

              {/* Due Date Information */}
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-gray-500'>
                  <Calendar className='h-4 w-4' />
                  <span className='text-sm font-medium'>
                    Due Date Information
                  </span>
                </div>
                <div className='grid grid-cols-2 gap-4 pl-6'>
                  <div>
                    <div className='text-sm text-gray-600'>Due Date</div>
                    <div className='font-medium'>
                      {formatDate(installment.dueDate)}
                    </div>
                  </div>
                  {installment.paidDate && (
                    <div>
                      <div className='text-sm text-gray-600'>Paid Date</div>
                      <div className='font-medium text-green-600'>
                        {formatDate(installment.paidDate)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Information */}
              {installment.paymentMode && (
                <div className='space-y-2'>
                  <div className='flex items-center gap-2 text-gray-500'>
                    <CreditCard className='h-4 w-4' />
                    <span className='text-sm font-medium'>
                      Payment Information
                    </span>
                  </div>
                  <div className='grid grid-cols-2 gap-4 pl-6'>
                    <div>
                      <div className='text-sm text-gray-600'>Payment Mode</div>
                      <div className='font-medium'>
                        {installment.paymentMode}
                      </div>
                    </div>
                    {installment.transactionRefNo && (
                      <div>
                        <div className='text-sm text-gray-600'>
                          Transaction Ref
                        </div>
                        <div className='font-medium'>
                          {installment.transactionRefNo}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Remarks */}
              {installment.installmentRemarks && (
                <div className='space-y-2'>
                  <div className='flex items-center gap-2 text-gray-500'>
                    <FileText className='h-4 w-4' />
                    <span className='text-sm font-medium'>Remarks</span>
                  </div>
                  <p className='text-gray-800 pl-6'>
                    {installment.installmentRemarks}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className='space-y-6'>
          {/* Member Information */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Member Information</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-blue-100 rounded-full'>
                  <User className='h-5 w-5 text-blue-600' />
                </div>
                <div>
                  <div className='font-semibold'>
                    {typeof installment.memId === 'object'
                      ? installment.memId.memName
                      : 'Member'}
                  </div>
                  {typeof installment.memId === 'object' &&
                    installment.memId.memNic
 && (
                      <div className='text-sm text-gray-500'>
                        CNIC: {installment.memId.memNic
}
                      </div>
                    )}
                </div>
              </div>
            </CardContent>
          </Card>
          {/* File Information */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>File Information</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-green-100 rounded-full'>
                  <FileText className='h-5 w-5 text-green-600' />
                </div>
                <div>
                  <div className='font-semibold'>
                    File #
                    {typeof installment.fileId === 'object'
                      ? installment.fileId.fileRegNo
                      : 'File'}
                  </div>
                  {typeof installment.fileId === 'object' &&
                    installment.fileId.fileBarCode && (
                      <div className='text-sm text-gray-500'>
                        Barcode: {installment.fileId.fileBarCode}
                      </div>
                    )}
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Plot Information */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Plot Information</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-purple-100 rounded-full'>
                  <Home className='h-5 w-5 text-purple-600' />
                </div>
                <div>
                  <div className='font-semibold'>
                    Plot #
                    {typeof installment.plotId === 'object'
                      ? installment.plotId.plotNo
                      : 'Plot'}
                  </div>
                  {typeof installment.plotId === 'object' && (
                    <div className='text-sm text-gray-500'>
                      {installment.plotId.plotSize && (
                        <span>Size: {installment.plotId.plotSize} sq.yd</span>
                      )}
                      {installment.plotId.blockNo && (
                        <span className='ml-2'>
                          Block: {installment.plotId.blockNo}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
