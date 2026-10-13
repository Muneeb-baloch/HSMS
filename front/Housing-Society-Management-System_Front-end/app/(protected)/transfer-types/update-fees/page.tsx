// src/app/(dashboard)/transfer-types/update-fees/page.tsx
'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import {
  useTransferTypes,
  useTransferTypeStatistics,
  useUpdateFeesByPercentage
} from '@/lib/hooks/entities/useTransferType'
import { useAuth } from '@/lib/hooks/useAuth'
import {
  AlertTriangle,
  ArrowLeft,
  Percent,
  TrendingDown,
  TrendingUp
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { customToast } from "@/lib/utils/customToast"
import { useConfirm } from "@/components/shared/ConfirmDialog";

export default function UpdateFeesPage () {
  const router = useRouter()
  const { user } = useAuth()
  const [percentage, setPercentage] = useState<string>('')
  const { confirm } = useConfirm();
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: transferTypes } = useTransferTypes({
    limit: 100,
    isActive: true
  })
  const { data: statistics } = useTransferTypeStatistics()
  const updateFeesMutation = useUpdateFeesByPercentage()

  const canUpdate =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

  const calculateNewFees = () => {
    if (!percentage || !transferTypes?.items) return []

    const pct = parseFloat(percentage) / 100
    return transferTypes.items.map(type => ({
      ...type,
      newFee: type.transferFee * (1 + pct)
    }))
  }

  const handleSubmit = async () => {
    if (!percentage) {
      customToast.error('Please enter a percentage value')
      return
    }

    const pct = parseFloat(percentage)
    if (pct < -100 || pct > 100) {
      customToast.error('Percentage must be between -100 and 100')
      return
    }

    if (
      !await confirm({ title: "Confirm", description: `Are you sure you want to ${
          pct >= 0 ? 'increase' : 'decrease'
        } all fees by ${Math.abs(pct)}%?` })
    ) {
      return
    }

    setIsSubmitting(true)
    try {
      const result = await updateFeesMutation.mutateAsync(pct)
      customToast.success(
        `Fees updated for ${
          result.updated
        } transfer types. New average fee: Rs. ${result.averageFee.toFixed(2)}`
      )
      setPercentage('')
    } catch (error) {
      customToast.error('Failed to update fees')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setPercentage('')
  }

  if (!canUpdate) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to update transfer fees.
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

  const newFees = calculateNewFees()
  const percentageValue = percentage ? parseFloat(percentage) : 0

  return (
    <div className='p-6'>
      <div className='mb-6'>
        <Button variant='ghost' onClick={() => router.back()} className='mb-4'>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back to Transfer Types
        </Button>

        <h1 className='text-3xl font-bold'>Update Transfer Fees</h1>
        <p className='text-gray-500 mt-2'>
          Apply percentage-based adjustments to all active transfer fees
        </p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Main Form */}
        <div className='lg:col-span-2'>
          <Card>
            <CardHeader>
              <CardTitle>Fee Adjustment</CardTitle>
              <CardDescription>
                Adjust all active transfer type fees by a percentage
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Current Statistics */}
              {statistics && (
                <div className='grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg'>
                  <div>
                    <div className='text-sm text-gray-600'>
                      Current Average Fee
                    </div>
                    <div className='text-xl font-bold'>
                      Rs. {statistics.averageFee.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className='text-sm text-gray-600'>Active Types</div>
                    <div className='text-xl font-bold'>
                      {statistics.activeTypes}
                    </div>
                  </div>
                </div>
              )}

              {/* Warning Alert */}
              <Alert className='border-yellow-200 bg-yellow-50'>
                <AlertTriangle className='h-4 w-4 text-yellow-800' />
                <AlertTitle className='text-yellow-800'>
                  Important Notice
                </AlertTitle>
                <AlertDescription className='text-yellow-700'>
                  This action will update ALL active transfer type fees. This
                  change will affect:
                  <ul className='list-disc pl-4 mt-2 space-y-1'>
                    <li>Future transfer calculations</li>
                    <li>Revenue projections</li>
                    <li>Customer pricing</li>
                    <li>Historical comparisons</li>
                  </ul>
                </AlertDescription>
              </Alert>

              {/* Percentage Input */}
              <div className='space-y-4'>
                <div>
                  <Label htmlFor='percentage'>Adjustment Percentage</Label>
                  <div className='relative mt-1'>
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                      <Percent className='h-5 w-5 text-gray-400' />
                    </div>
                    <Input
                      id='percentage'
                      type='number'
                      value={percentage}
                      onChange={e => setPercentage(e.target.value)}
                      placeholder='Enter percentage (e.g., 10 for 10% increase)'
                      className='pl-10'
                      min='-100'
                      max='100'
                      step='0.1'
                    />
                  </div>
                  <div className='flex items-center gap-4 mt-2 text-sm'>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() => setPercentage('5')}
                    >
                      +5%
                    </Button>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() => setPercentage('10')}
                    >
                      +10%
                    </Button>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() => setPercentage('-5')}
                    >
                      -5%
                    </Button>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() => setPercentage('-10')}
                    >
                      -10%
                    </Button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className='flex gap-3'>
                  <Button
                    onClick={handleSubmit}
                    disabled={!percentage || isSubmitting}
                    className='flex-1'
                    variant={percentageValue >= 0 ? 'default' : 'destructive'}
                  >
                    {percentageValue >= 0 ? (
                      <TrendingUp className='mr-2 h-4 w-4' />
                    ) : (
                      <TrendingDown className='mr-2 h-4 w-4' />
                    )}
                    {isSubmitting
                      ? 'Updating...'
                      : percentageValue >= 0
                      ? `Increase All Fees by ${Math.abs(percentageValue)}%`
                      : `Decrease All Fees by ${Math.abs(percentageValue)}%`}
                  </Button>
                  <Button
                    variant='outline'
                    onClick={handleReset}
                    disabled={isSubmitting}
                  >
                    Reset
                  </Button>
                </div>
              </div>

              {/* Preview */}
              {newFees.length > 0 && (
                <div className='mt-6'>
                  <Separator className='mb-4' />
                  <h3 className='font-semibold mb-3'>Fee Adjustment Preview</h3>
                  <div className='space-y-3 max-h-96 overflow-y-auto'>
                    {newFees.map(type => (
                      <div
                        key={type._id}
                        className='flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50'
                      >
                        <div>
                          <div className='font-medium'>{type.typeName}</div>
                          <div className='text-sm text-gray-500'>
                            {type.description || 'No description'}
                          </div>
                        </div>
                        <div className='text-right'>
                          <div className='flex items-center gap-2'>
                            <div className='text-gray-500 line-through text-sm'>
                              Rs. {type.transferFee.toLocaleString()}
                            </div>
                            <div className='font-bold text-green-600'>
                              Rs. {type.newFee.toFixed(2).toLocaleString()}
                            </div>
                          </div>
                          <Badge
                            className={`mt-1 ${
                              percentageValue >= 0
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {percentageValue >= 0 ? '+' : ''}
                            {percentageValue}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className='space-y-6'>
          {/* Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>How It Works</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 text-sm text-gray-600'>
              <div className='space-y-2'>
                <p>
                  This tool applies a percentage adjustment to ALL active
                  transfer type fees:
                </p>
                <ul className='space-y-2 list-disc pl-4'>
                  <li>Positive percentage increases fees</li>
                  <li>Negative percentage decreases fees</li>
                  <li>Changes apply immediately to active types only</li>
                  <li>Inactive or deleted types are not affected</li>
                  <li>Fees are rounded to 2 decimal places</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Impact Card */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Impact Analysis</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 text-sm text-gray-600'>
              <div className='space-y-2'>
                {statistics && percentage && (
                  <>
                    <div className='flex justify-between'>
                      <span>Current Revenue:</span>
                      <span className='font-medium'>
                        Rs. {statistics.totalFeeGenerated.toLocaleString()}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Projected Revenue:</span>
                      <span
                        className={`font-medium ${
                          percentageValue >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        Rs.{' '}
                        {(
                          statistics.totalFeeGenerated *
                          (1 + parseFloat(percentage) / 100)
                        ).toLocaleString()}
                      </span>
                    </div>
                    <Separator />
                    <div className='flex justify-between'>
                      <span>Impact:</span>
                      <span
                        className={`font-bold ${
                          percentageValue >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {percentageValue >= 0 ? '+' : ''}
                        {percentageValue}%
                      </span>
                    </div>
                  </>
                )}
                {!percentage && (
                  <p className='text-gray-500'>
                    Enter a percentage to see the projected impact
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Guidelines Card */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Guidelines</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 text-sm text-gray-600'>
              <div className='space-y-2'>
                <ul className='space-y-2 list-disc pl-4'>
                  <li>Consider market conditions before adjusting</li>
                  <li>Review impact on each transfer type</li>
                  <li>Notify stakeholders of fee changes</li>
                  <li>Document the reason for adjustment</li>
                  <li>Consider phased adjustments for large changes</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
