// src/components/plot-category/PriceCalculator.tsx
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
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useConfirm } from "@/components/shared/ConfirmDialog";

export function PriceCalculator () {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Price Calculator</CardTitle>
        <CardDescription>
          Calculate final price with category surcharge
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label htmlFor='basePrice'>Base Price</Label>
            <Input
              id='basePrice'
              type='number'
              placeholder='Enter base price'
              value={basePrice}
              onChange={e => setBasePrice(e.target.value)}
              min='0'
              step='0.01'
              className='enhanced-input h-11'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='category'>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className='h-11 enhanced-input'>
                <SelectValue placeholder='Select category' />
              </SelectTrigger>
              <SelectContent>
                {categoriesLoading ? (
                  <SelectItem value='loading' disabled>
                    <Loader2 className='h-4 w-4 animate-spin mr-2' />
                    Loading...
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

        <Button
          onClick={handleCalculate}
          disabled={calculating || !basePrice || !categoryId}
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

        {result && (
          <div className='mt-6 p-4 bg-gray-50 rounded-lg'>
            <h4 className='font-semibold mb-2'>Calculation Result:</h4>
            <div className='grid grid-cols-2 gap-2 text-sm'>
              <div>Base Price:</div>
              <div className='font-medium'>{basePrice}</div>

              <div>Surcharge Type:</div>
              <div className='font-medium capitalize'>{result.type}</div>

              {result.type !== 'none' && (
                <>
                  <div>Surcharge Value:</div>
                  <div className='font-medium'>{result.formattedValue}</div>

                  <div>Surcharge Amount:</div>
                  <div className='font-medium'>{result.surchargeAmount}</div>
                </>
              )}

              <div className='font-semibold text-lg pt-2 border-t'>
                Final Price:
              </div>
              <div className='font-bold text-lg pt-2 border-t'>
                {result.finalPrice}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
