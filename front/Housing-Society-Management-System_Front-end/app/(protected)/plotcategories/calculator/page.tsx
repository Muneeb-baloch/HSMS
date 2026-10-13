// src/app/(dashboard)/plotcategories/calculator/page.tsx
'use client'

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  useActivePlotCategories,
  useCalculatePrice
} from '@/lib/hooks/entities/usePlotCategory'
import { ArrowLeft, Calculator, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useConfirm } from "@/components/shared/ConfirmDialog";

export default function PriceCalculatorPage () {
  const router = useRouter()
  const [basePrice, setBasePrice] = useState('')
  const { alert } = useConfirm();
  const [categoryId, setCategoryId] = useState('')

  const { data: categories = [], isLoading: categoriesLoading } =
    useActivePlotCategories()
  const {
    mutateAsync: calculatePrice,
    isPending: calculating,
    data: result
  } = useCalculatePrice()

  const handleCalculate = async () => {
    if (!basePrice || !categoryId) {
      await alert({ description: 'Please enter base price and select a category' })
      return
    }

    await calculatePrice({
      basePrice: parseFloat(basePrice),
      categoryId
    })
  }

  const handleReset = () => {
    setBasePrice('')
    setCategoryId('')
  }

  return (
    <div className='p-6'>
      <Button variant='ghost' onClick={() => router.back()} className='mb-6'>
        <ArrowLeft className='mr-2 h-4 w-4' />
        Back
      </Button>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <div className='flex items-center gap-2'>
              <Calculator className='h-5 w-5' />
              <CardTitle>Price Calculator</CardTitle>
            </div>
            <CardDescription>
              Calculate final price with category surcharge
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='basePrice'>Base Price *</Label>
                <Input
                  id='basePrice'
                  type='number'
                  placeholder='Enter base price'
                  value={basePrice}
                  onChange={e => setBasePrice(e.target.value)}
                  className='enhanced-input h-11'
                  min='0'
                  step='0.01'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='category'>Category *</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder='Select a category' />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriesLoading ? (
                      <SelectItem value='loading' disabled>
                        <Loader2 className='h-4 w-4 animate-spin mr-2' />
                        Loading categories...
                      </SelectItem>
                    ) : (
                      categories.map(cat => (
                        <SelectItem key={cat._id} value={cat._id}>
                          {cat.categoryName} (
                          {cat.formattedSurcharge || 'No surcharge'})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='flex gap-3'>
              <Button
                onClick={handleCalculate}
                disabled={calculating || !basePrice || !categoryId}
                className='flex-1'
              >
                {calculating ? (
                  <>
                    <Loader2 className='h-4 w-4 animate-spin mr-2' />
                    Calculating...
                  </>
                ) : (
                  'Calculate Price'
                )}
              </Button>
              <Button
                variant='outline'
                onClick={handleReset}
                disabled={!basePrice && !categoryId}
              >
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Calculation Result</CardTitle>
            <CardDescription>
              {result
                ? 'Price calculation details'
                : 'Enter values to see calculation'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-1'>
                    <div className='text-sm text-gray-500'>Base Price</div>
                    <div className='text-lg font-semibold'>{basePrice}</div>
                  </div>
                  <div className='space-y-1'>
                    <div className='text-sm text-gray-500'>Surcharge Type</div>
                    <div className='text-lg font-semibold capitalize'>
                      {result.type}
                    </div>
                  </div>
                </div>

                {result.type !== 'none' && (
                  <>
                    <div className='grid grid-cols-2 gap-4'>
                      <div className='space-y-1'>
                        <div className='text-sm text-gray-500'>
                          Surcharge Value
                        </div>
                        <div className='text-lg font-semibold'>
                          {result.formattedValue}
                        </div>
                      </div>
                      <div className='space-y-1'>
                        <div className='text-sm text-gray-500'>
                          Surcharge Amount
                        </div>
                        <div className='text-lg font-semibold'>
                          {result.surchargeAmount.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className='pt-4 border-t'>
                  <div className='space-y-1'>
                    <div className='text-sm text-gray-500'>Final Price</div>
                    <div className='text-2xl font-bold text-green-600'>
                      {result.finalPrice.toFixed(2)}
                    </div>
                  </div>
                </div>

                {result.type !== 'none' && (
                  <div className='pt-2 text-sm text-gray-500'>
                    Formula: {basePrice} + {result.surchargeAmount.toFixed(2)} ={' '}
                    {result.finalPrice.toFixed(2)}
                  </div>
                )}
              </div>
            ) : (
              <div className='h-40 flex flex-col items-center justify-center text-gray-400'>
                <Calculator className='h-12 w-12 mb-3' />
                <p>Enter base price and select a category</p>
                <p className='text-sm'>to see the calculated price</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className='mt-6'>
        <CardHeader>
          <CardTitle className='text-lg'>How it works</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className='space-y-2 text-sm text-gray-600'>
            <li className='flex items-start gap-2'>
              <div className='mt-1 h-2 w-2 rounded-full bg-blue-500'></div>
              <span>
                <strong>Percentage Surcharge:</strong> Base Price + (Base Price
                × Percentage ÷ 100)
              </span>
            </li>
            <li className='flex items-start gap-2'>
              <div className='mt-1 h-2 w-2 rounded-full bg-green-500'></div>
              <span>
                <strong>Fixed Amount Surcharge:</strong> Base Price + Fixed
                Amount
              </span>
            </li>
            <li className='flex items-start gap-2'>
              <div className='mt-1 h-2 w-2 rounded-full bg-gray-500'></div>
              <span>
                <strong>No Surcharge:</strong> Final Price = Base Price
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
