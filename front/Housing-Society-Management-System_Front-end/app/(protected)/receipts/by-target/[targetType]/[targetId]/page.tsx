'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { usePaymentsByTarget } from '@/lib/hooks/entities/usePayment'
import { ArrowLeft } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ReceiptResolverPage() {
  const router = useRouter()
  const params = useParams()
  const targetType = params.targetType as 'installment' | 'bill' | 'transfer'
  const targetId = params.targetId as string

  const { data: receipts, isLoading } = usePaymentsByTarget(targetType, targetId)

  useEffect(() => {
    if (receipts && receipts.length > 0) {
      router.replace(`/receipts/${receipts[0]._id}`)
    }
  }, [receipts, router])

  if (isLoading) {
    return <div className='p-6 text-sm text-muted-foreground'>Looking up receipt...</div>
  }

  if (!receipts || receipts.length === 0) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>No Receipt Found</CardTitle>
            <CardDescription>
              This payment has no associated receipt - it may predate the receipt system and
              hasn&apos;t been backfilled, or no payment has actually been recorded yet.
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

  return <div className='p-6 text-sm text-muted-foreground'>Redirecting to receipt...</div>
}
