// src/app/(dashboard)/transfer-types/calculate/[id]/page.tsx
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
  useCalculateFee,
  useTransferType
} from '@/lib/hooks/entities/useTransferType'
import { ArrowLeft, Calculator, DollarSign, Percent } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { customToast } from "@/lib/utils/customToast"

export default function CalculateFeePage () {
  const router = useRouter()
  const params = useParams()

  const id = params.id as string
  const { data: transferType, isLoading: loadingType } = useTransferType(id)

  const [propertyValue, setPropertyValue] = useState<string>('')
  const [applyDiscount, setApplyDiscount] = useState<boolean>(false)
  const [discountPercentage, setDiscountPercentage] = useState<string>('10')
  const [isCalculating, setIsCalculating] = useState<boolean>(false)

  const { data: feeCalculation, refetch: calculateFee } = useCalculateFee(
    id,
    propertyValue
      ? {
          propertyValue: parseFloat(propertyValue),
          applyDiscount: applyDiscount && !!discountPercentage,
          discountPercentage:
            applyDiscount && discountPercentage
              ? parseFloat(discountPercentage)
              : undefined
        }
      : undefined
  )

  const handleCalculate = async () => {
    if (!propertyValue || parseFloat(propertyValue) <= 0) {
      customToast.error('Please enter a valid property value')
      return
    }

    setIsCalculating(true)
    try {
      await calculateFee()
    } catch (error) {
      customToast.error('Failed to calculate fee')
    } finally {
      setIsCalculating(false)
    }
  }

  const handleReset = () => {
    setPropertyValue('')
    setApplyDiscount(false)
    setDiscountPercentage('10')
  }

  if (loadingType) {
    return (
      <div className='p-6 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
      </div>
    )
  }

  if (!transferType) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Transfer Type Not Found</CardTitle>
            <CardDescription>
              The requested transfer type does not exist or is inactive.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/transfer-types')}>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Transfer Types
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='p-6'>
      <div className='mb-6'>
        <Button variant='ghost' onClick={() => router.back()} className='mb-4'>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back to Transfer Type
        </Button>

        <h1 className='text-3xl font-bold'>Fee Calculator</h1>
        <p className='text-gray-500 mt-2'>
          Calculate transfer fees for {transferType.typeName}
        </p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Calculator Card */}
        <div className='lg:col-span-2'>
          <Card>
            <CardHeader>
              <CardTitle>Fee Calculator</CardTitle>
              <CardDescription>
                Enter property details to calculate the transfer fee
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Transfer Type Info */}
              <div className='p-4 bg-gray-50 rounded-lg'>
                <div className='flex justify-between items-center mb-2'>
                  <div>
                    <div className='font-semibold'>{transferType.typeName}</div>
                    {transferType.description && (
                      <div className='text-sm text-gray-600'>
                        {transferType.description}
                      </div>
                    )}
                  </div>
                  <Badge
                    className={
                      transferType.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }
                  >
                    {transferType.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className='text-sm text-gray-600'>
                  Standard Fee:{' '}
                  <span className='font-semibold'>
                    Rs. {transferType.transferFee.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Input Fields */}
              <div className='space-y-4'>
                <div>
                  <Label htmlFor='propertyValue'>Property Value (Rs)</Label>
                  <div className='relative mt-1'>
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                      <DollarSign className='h-5 w-5 text-gray-400' />
                    </div>
                    <Input
                      id='propertyValue'
                      type='number'
                      value={propertyValue}
                      onChange={e => setPropertyValue(e.target.value)}
                      placeholder='Enter property value'
                      className='pl-10'
                      min='0'
                      step='1000'
                    />
                  </div>
                  <p className='text-sm text-gray-500 mt-1'>
                    Required for percentage-based fee calculation
                  </p>
                </div>

                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <Label htmlFor='applyDiscount'>Apply Discount</Label>
                    <Switch
                      id='applyDiscount'
                      checked={applyDiscount}
                      onCheckedChange={setApplyDiscount}
                    />
                  </div>

                  {applyDiscount && (
                    <div>
                      <Label htmlFor='discountPercentage'>
                        Discount Percentage
                      </Label>
                      <div className='relative mt-1'>
                        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                          <Percent className='h-5 w-5 text-gray-400' />
                        </div>
                        <Input
                          id='discountPercentage'
                          type='number'
                          value={discountPercentage}
                          onChange={e => setDiscountPercentage(e.target.value)}
                          placeholder='Discount percentage'
                          className='pl-10'
                          min='0'
                          max='100'
                          step='0.1'
                        />
                      </div>
                      <p className='text-sm text-gray-500 mt-1'>
                        Enter discount percentage (0-100%)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className='flex gap-3'>
                <Button
                  onClick={handleCalculate}
                  disabled={
                    !propertyValue ||
                    parseFloat(propertyValue) <= 0 ||
                    isCalculating
                  }
                  className='flex-1'
                >
                  <Calculator className='mr-2 h-4 w-4' />
                  {isCalculating ? 'Calculating...' : 'Calculate Fee'}
                </Button>
                <Button
                  variant='outline'
                  onClick={handleReset}
                  disabled={isCalculating}
                >
                  Reset
                </Button>
              </div>

              {/* Calculation Result */}
              {feeCalculation && (
                <div className='mt-6'>
                  <Separator className='mb-4' />
                  <h3 className='font-semibold mb-3'>Calculation Result</h3>
                  <div className='space-y-3 p-4 bg-blue-50 rounded-lg'>
                    <div className='flex justify-between items-center'>
                      <span className='text-gray-600'>Base Fee:</span>
                      <span className='font-semibold'>
                        Rs. {feeCalculation.baseFee.toLocaleString()}
                      </span>
                    </div>

                    {feeCalculation.discountAmount > 0 && (
                      <div className='flex justify-between items-center'>
                        <span className='text-gray-600'>Discount Amount:</span>
                        <span className='font-semibold text-red-600'>
                          - Rs. {feeCalculation.discountAmount.toLocaleString()}
                        </span>
                      </div>
                    )}

                    <Separator />

                    <div className='flex justify-between items-center'>
                      <span className='text-lg font-semibold'>Total Fee:</span>
                      <span className='text-2xl font-bold text-green-600'>
                        Rs. {feeCalculation.totalFee.toLocaleString()}
                      </span>
                    </div>

                    {/* Breakdown */}
                    <div className='mt-4 pt-4 border-t'>
                      <h4 className='font-medium mb-2'>
                        Calculation Breakdown:
                      </h4>
                      <div className='text-sm text-gray-600 space-y-1'>
                        <div>
                          Transfer Type: {feeCalculation.breakdown.typeName}
                        </div>
                        <div>
                          Base Transfer Fee: Rs.{' '}
                          {feeCalculation.breakdown.baseTransferFee.toLocaleString()}
                        </div>
                        {feeCalculation.breakdown.propertyValue && (
                          <div>
                            Property Value: Rs.{' '}
                            {feeCalculation.breakdown.propertyValue.toLocaleString()}
                          </div>
                        )}
                        {feeCalculation.breakdown.discountPercentage && (
                          <div>
                            Discount:{' '}
                            {feeCalculation.breakdown.discountPercentage}%
                          </div>
                        )}
                        <div>
                          Calculation Method:{' '}
                          {feeCalculation.breakdown.calculationMethod}
                        </div>
                      </div>
                    </div>
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
                  The fee calculation depends on the transfer type and property
                  value:
                </p>
                <ul className='space-y-2 list-disc pl-4'>
                  <li>
                    <strong>Sale/Resale:</strong> 2% of property value or fixed
                    fee (whichever is higher)
                  </li>
                  <li>
                    <strong>Gift/Hiba:</strong> 1% of property value or fixed
                    fee (whichever is higher)
                  </li>
                  <li>
                    <strong>Legal Heir/Inheritance:</strong> Fixed fee only
                  </li>
                  <li>
                    <strong>Other Types:</strong> Fixed fee
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Tips</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 text-sm text-gray-600'>
              <div className='space-y-2'>
                <ul className='space-y-2 list-disc pl-4'>
                  <li>
                    Property value is required for percentage-based calculations
                  </li>
                  <li>Discounts are applied to the calculated fee</li>
                  <li>Minimum fee is always the fixed transfer fee amount</li>
                  <li>Save calculations for reference in transfer records</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <Button
                variant='outline'
                className='w-full justify-start'
                onClick={() => router.push(`/transfer-types/view/${id}`)}
              >
                <ArrowLeft className='mr-2 h-4 w-4' />
                View Transfer Type Details
              </Button>
              <Button
                variant='outline'
                className='w-full justify-start'
                onClick={() => router.push('/transfer-types')}
              >
                Browse All Types
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
