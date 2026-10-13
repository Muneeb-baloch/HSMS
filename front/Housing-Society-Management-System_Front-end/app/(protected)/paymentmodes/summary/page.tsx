// src/app/(dashboard)/paymentmodes/summary/page.tsx
'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  usePaymentModes,
  usePaymentModeSummary
} from '@/lib/hooks/entities/usePaymentMode'
import {
  ArrowLeft,
  BarChart3,
  CreditCard,
  PieChart,
  TrendingUp,
  Wallet
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { StatsPageSkeleton } from '@/components/shared/PageSkeleton'

export default function PaymentModeSummaryPage () {
  const router = useRouter()
  const { data: summary, isLoading: isLoadingSummary } = usePaymentModeSummary()
  const { data: paymentModes, isLoading: isLoadingModes } = usePaymentModes({
    limit: 100
  })

  if (isLoadingSummary || isLoadingModes) {
    return <StatsPageSkeleton />
  }

  const activePercentage = summary
    ? Math.round((summary.activePaymentModes / summary.totalPaymentModes) * 100)
    : 0

  const getPaymentModeUsage = (modeName: string) => {
    // This would typically come from transaction data
    // For now, we'll simulate some data
    const usageData: Record<string, number> = {
      cash: 45,
      'Bank transfer': 30,
      check: 20,
      'p/0': 5
    }
    return usageData[modeName] || 0
  }

  return (
    <div className='space-y-1'>
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-2'>
          <Button variant='ghost' size='sm' onClick={() => router.back()}>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back
          </Button>
        </div>
      </div>

      <div>
        <h1 className='text-2xl font-bold mb-2'>Payment Mode Summary</h1>
        <p className='text-muted-foreground mb-6'>
          Comprehensive overview of payment methods and their usage statistics
        </p>
      </div>

      {/* Overview Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Total Payment Modes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold'>
              {summary?.totalPaymentModes || 0}
            </div>
            <p className='text-sm text-muted-foreground mt-1'>
              All defined payment methods
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Active Payment Modes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold text-green-600'>
              {summary?.activePaymentModes || 0}
            </div>
            <p className='text-sm text-muted-foreground mt-1'>
              {activePercentage}% of total •{' '}
              {summary
                ? summary.totalPaymentModes - summary.activePaymentModes
                : 0}{' '}
              inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Most Used Mode
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold text-blue-600'>Cash</div>
            <p className='text-sm text-muted-foreground mt-1'>
              45% of transactions • Most popular
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Digital Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold text-purple-600'>55%</div>
            <p className='text-sm text-muted-foreground mt-1'>
              Non-cash transactions • Growing trend
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Charts */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <PieChart className='h-5 w-5' />
              Payment Mode Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {paymentModes?.paymentModes &&
            paymentModes.paymentModes.length > 0 ? (
              <div className='space-y-4'>
                {paymentModes.paymentModes.map(mode => {
                  const percentage = getPaymentModeUsage(mode.paymentModeName)
                  return (
                    <div key={mode._id} className='space-y-2'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          {mode.paymentModeName === 'cash' ? (
                            <Wallet className='h-4 w-4 text-green-600' />
                          ) : (
                            <CreditCard className='h-4 w-4 text-blue-600' />
                          )}
                          <span className='font-medium'>
                            {mode.paymentModeName}
                          </span>
                        </div>
                        <div className='flex items-center gap-4'>
                          <Badge
                            variant={mode.isActive ? 'default' : 'outline'}
                            className={
                              mode.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }
                          >
                            {mode.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <span className='font-medium'>{percentage}%</span>
                        </div>
                      </div>
                      <div className='h-2 bg-gray-100 rounded-full overflow-hidden'>
                        <div
                          className={`h-full ${
                            mode.paymentModeName === 'cash'
                              ? 'bg-green-500'
                              : mode.paymentModeName === 'Bank transfer'
                              ? 'bg-blue-500'
                              : mode.paymentModeName === 'check'
                              ? 'bg-purple-500'
                              : 'bg-orange-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className='text-center py-8 text-muted-foreground'>
                No payment mode data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <BarChart3 className='h-5 w-5' />
              Usage Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='h-64'>
              {paymentModes?.paymentModes &&
              paymentModes.paymentModes.length > 0 ? (
                <div className='h-full flex items-end gap-2'>
                  {paymentModes.paymentModes.map(mode => {
                    const usage = getPaymentModeUsage(mode.paymentModeName)
                    const height = usage

                    return (
                      <div
                        key={mode._id}
                        className='flex-1 flex flex-col items-center'
                      >
                        <div
                          className={`w-full ${
                            mode.paymentModeName === 'cash'
                              ? 'bg-green-500'
                              : mode.paymentModeName === 'Bank transfer'
                              ? 'bg-blue-500'
                              : mode.paymentModeName === 'check'
                              ? 'bg-purple-500'
                              : 'bg-orange-500'
                          } rounded-t-lg`}
                          style={{ height: `${height}%` }}
                        />
                        <div className='text-xs text-muted-foreground mt-2 truncate w-full text-center'>
                          {mode.paymentModeName}
                        </div>
                        <div className='text-xs font-medium mt-1'>{usage}%</div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className='text-center py-8 text-muted-foreground'>
                  No usage data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <TrendingUp className='h-5 w-5' />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='p-4 bg-blue-50 rounded-lg'>
              <h4 className='font-medium text-blue-800 mb-2'>
                Based on current data:
              </h4>
              <ul className='text-sm text-blue-700 space-y-1 list-disc pl-5'>
                <li>
                  Cash is the most popular payment method (45% of transactions)
                </li>
                <li>Digital payments account for 55% of total transactions</li>
                <li>Bank transfers are growing in popularity</li>
                <li>
                  Consider promoting digital payment options for efficiency
                </li>
              </ul>
            </div>

            <div className='p-4 bg-green-50 rounded-lg'>
              <h4 className='font-medium text-green-800 mb-2'>Action Items:</h4>
              <ul className='text-sm text-green-700 space-y-1 list-disc pl-5'>
                <li>Review inactive payment modes for potential removal</li>
                <li>Add new digital payment options based on market trends</li>
                <li>Monitor cash vs digital payment trends monthly</li>
                <li>Update payment mode descriptions for clarity</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
