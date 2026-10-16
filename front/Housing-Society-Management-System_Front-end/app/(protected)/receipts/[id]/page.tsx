// src/app/(dashboard)/receipts/[id]/page.tsx
'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { useReceipt } from '@/lib/hooks/entities/usePayment'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { ArrowLeft, Download, Printer } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { DetailPageSkeleton } from '@/components/shared/PageSkeleton'

export default function ReceiptPage() {
  const router = useRouter()
  const params = useParams()

  const id = params.id as string
  const { data: receipt, isLoading } = useReceipt(id)

  // Save-as-PDF via the browser's print dialog uses the document title as
  // the default filename, so the saved file is named by receipt no without
  // needing a separate binary-download flow.
  useEffect(() => {
    if (receipt?.receiptNo) {
      document.title = receipt.receiptNo
    }
  }, [receipt?.receiptNo])

  const handlePrint = () => {
    window.print()
  }

  if (isLoading) {
    return <DetailPageSkeleton />
  }

  if (!receipt) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Receipt Not Found</CardTitle>
            <CardDescription>
              The requested receipt does not exist or has been deleted.
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

  const receivedByName =
    typeof receipt.receivedBy === 'object'
      ? receipt.receivedBy.fullName ||
        [receipt.receivedBy.firstName, receipt.receivedBy.lastName].filter(Boolean).join(' ')
      : '—'

  return (
    <div className='p-6 print:p-0'>
      <div className='flex justify-between items-center mb-6 print:hidden'>
        <Button variant='ghost' onClick={() => router.back()}>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back
        </Button>
        <div className='flex gap-2'>
          <Button variant='outline' onClick={handlePrint}>
            <Download className='mr-2 h-4 w-4' />
            Download PDF
          </Button>
          <Button variant='outline' onClick={handlePrint}>
            <Printer className='mr-2 h-4 w-4' />
            Print
          </Button>
        </div>
      </div>

      <Card className='max-w-2xl mx-auto print:border-none print:shadow-none print:max-w-none'>
        <CardHeader className='text-center border-b print:border-b print:pb-4'>
          <CardTitle className='text-2xl print:text-xl'>
            {receipt.society?.societyName || 'Housing Society'}
          </CardTitle>
          {receipt.society?.address && (
            <CardDescription>{receipt.society.address}</CardDescription>
          )}
          <div className='text-lg font-semibold tracking-wide uppercase mt-2 print:text-base'>
            Payment Receipt
          </div>
        </CardHeader>

        <CardContent className='space-y-6 pt-6 print:text-sm'>
          <div className='flex justify-between'>
            <div>
              <div className='text-sm text-gray-500'>Receipt No</div>
              <div className='font-mono font-semibold text-lg'>{receipt.receiptNo}</div>
            </div>
            <div className='text-right'>
              <div className='text-sm text-gray-500'>Date</div>
              <div className='font-medium'>{formatDate(receipt.paymentDate)}</div>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg print:bg-white print:border print:p-2'>
            <div>
              <div className='text-sm text-gray-500'>Member Name</div>
              <div className='font-medium'>{receipt.member?.memName || '—'}</div>
            </div>
            <div>
              <div className='text-sm text-gray-500'>CNIC</div>
              <div className='font-medium'>{receipt.member?.memNic || '—'}</div>
            </div>
            <div>
              <div className='text-sm text-gray-500'>File No</div>
              <div className='font-medium font-mono'>{receipt.file?.fileRegNo || '—'}</div>
            </div>
            <div>
              <div className='text-sm text-gray-500'>Plot No</div>
              <div className='font-medium'>{receipt.plot?.plotNo || '—'}</div>
            </div>
          </div>

          <div>
            <div className='text-sm text-gray-500 mb-1'>Paid Against</div>
            <div className='font-medium p-3 border rounded-lg print:p-1 print:border-none'>
              {receipt.targetDescription}
            </div>
          </div>

          <div className='p-4 border-2 rounded-lg print:border print:p-2'>
            <div className='flex justify-between items-baseline'>
              <span className='text-sm text-gray-500'>Amount Received</span>
              <span className='text-2xl font-bold print:text-xl'>
                {formatCurrency(receipt.amount)}
              </span>
            </div>
            <div className='text-sm text-gray-600 italic mt-1'>{receipt.amountInWords}</div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <div className='text-sm text-gray-500'>Payment Mode</div>
              <div className='font-medium'>{receipt.paymentMode}</div>
            </div>
            {receipt.transactionRefNo && (
              <div>
                <div className='text-sm text-gray-500'>Transaction Ref</div>
                <div className='font-medium'>{receipt.transactionRefNo}</div>
              </div>
            )}
          </div>

          {receipt.remarks && (
            <div>
              <div className='text-sm text-gray-500'>Remarks</div>
              <div className='text-sm'>{receipt.remarks}</div>
            </div>
          )}

          <div className='pt-6 flex justify-between items-end'>
            <div className='text-xs text-gray-500 italic'>
              This is a computer-generated receipt and does not require a physical signature.
              {receipt.migrated && ' (Backfilled from a payment recorded before this receipt system existed.)'}
            </div>
            <div className='text-right'>
              <div className='text-sm font-medium'>{receivedByName}</div>
              <div className='text-xs text-gray-500'>Received By</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
