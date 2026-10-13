// src/components/plots/PriceCalculator.tsx
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
import { usePlotPriceCalculation } from '@/lib/hooks/entities/usePlot'
import { PlotType } from '@/lib/types/plot'
import { Calculator, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { customToast } from '@/lib/utils/customToast'

interface PriceCalculatorProps {
  projectId?: string
  onCalculate?: (result: any) => void
}

export function PriceCalculator ({
  projectId,
  onCalculate
}: PriceCalculatorProps) {
  const calculatePrice = usePlotPriceCalculation()
  const [isCalculating, setIsCalculating] = useState(false)

  const [formData, setFormData] = useState({
    plotSizeId: '',
    plotCategoryId: '',
    plotType: PlotType.RESIDENTIAL,
    plotLength: '',
    plotWidth: '',
    discountAmount: ''
  })

  const handleCalculate = async () => {
    if (
      !formData.plotSizeId ||
      !formData.plotCategoryId ||
      !formData.plotType ||
      !formData.plotLength ||
      !formData.plotWidth
    ) {
      customToast.error('Please fill in all required fields')
      return
    }

    setIsCalculating(true)
    try {
      const result = await calculatePrice.mutateAsync({
        plotSizeId: formData.plotSizeId,
        plotCategoryId: formData.plotCategoryId,
        plotType: formData.plotType,
        plotLength: Number(formData.plotLength),
        plotWidth: Number(formData.plotWidth),
        discountAmount: formData.discountAmount
          ? Number(formData.discountAmount)
          : 0
      })

      customToast.success('Price calculated successfully')
      if (onCalculate) {
        onCalculate(result)
      }
    } catch (error) {
      customToast.error('Failed to calculate price')
    } finally {
      setIsCalculating(false)
    }
  }

  const resetCalculator = () => {
    setFormData({
      plotSizeId: '',
      plotCategoryId: '',
      plotType: PlotType.RESIDENTIAL,
      plotLength: '',
      plotWidth: '',
      discountAmount: ''
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Calculator className='h-5 w-5' />
          Price Calculator
        </CardTitle>
        <CardDescription>
          Calculate plot price based on size, category, and type
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Plot Type */}
        <div className='space-y-2'>
          <Label htmlFor='plotType'>Plot Type</Label>
          <Select
            value={formData.plotType}
            onValueChange={value =>
              setFormData({ ...formData, plotType: value as PlotType })
            }
          >
            <SelectTrigger className='h-11 enhanced-input'>
              <SelectValue placeholder='Select plot type' />
            </SelectTrigger>
            <SelectContent>
              {Object.values(PlotType).map(type => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() +
                    type.slice(1).replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Plot Size */}
        <div className='space-y-2'>
          <Label htmlFor='plotSizeId'>Plot Size</Label>
          <Select
            value={formData.plotSizeId}
            onValueChange={value =>
              setFormData({ ...formData, plotSizeId: value })
            }
          >
            <SelectTrigger className='h-11 enhanced-input'>
              <SelectValue placeholder='Select plot size' />
            </SelectTrigger>
            <SelectContent>
              {/* Size options would be fetched from API */}
              <SelectItem value='size1'>30x60 (1800 sqft)</SelectItem>
              <SelectItem value='size2'>40x80 (3200 sqft)</SelectItem>
              <SelectItem value='size3'>50x100 (5000 sqft)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Plot Category */}
        <div className='space-y-2'>
          <Label htmlFor='plotCategoryId'>Plot Category</Label>
          <Select
            value={formData.plotCategoryId}
            onValueChange={value =>
              setFormData({ ...formData, plotCategoryId: value })
            }
          >
             <SelectTrigger className='h-11 enhanced-input' >
              <SelectValue placeholder='Select category' />
            </SelectTrigger>
            <SelectContent>
              {/* Category options would be fetched from API */}
              <SelectItem value='cat1'>Premium</SelectItem>
              <SelectItem value='cat2'>Standard</SelectItem>
              <SelectItem value='cat3'>Economy</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Dimensions */}
        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label htmlFor='plotLength'>Length (ft)</Label>
            <Input
              id='plotLength'
              type='number'
              min='1'
              step='0.01'
              value={formData.plotLength}
              className='enhanced-input h-11'
              onChange={e =>
                setFormData({ ...formData, plotLength: e.target.value })
              }
              placeholder='Enter length'
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='plotWidth'>Width (ft)</Label>
            <Input
              id='plotWidth'
              type='number'
              min='1'
              step='0.01'
              value={formData.plotWidth}
              className='enhanced-input h-11'
              onChange={e =>
                setFormData({ ...formData, plotWidth: e.target.value })
              }
              placeholder='Enter width'
            />
          </div>
        </div>

        {/* Discount Amount */}
        <div className='space-y-2'>
          <Label htmlFor='discountAmount'>Discount Amount (Optional)</Label>
          <Input
            id='discountAmount'
            type='number'
            min='0'
            step='0.01'
            value={formData.discountAmount}
            className='enhanced-input h-11'
            onChange={e =>
              setFormData({ ...formData, discountAmount: e.target.value })
            }
            placeholder='Enter discount amount'
          />
        </div>

        {/* Calculate Button */}
        <Button
          onClick={handleCalculate}
          disabled={isCalculating}
          className='w-full'
        >
          {isCalculating ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Calculating...
            </>
          ) : (
            <>
              <Calculator className='mr-2 h-4 w-4' />
              Calculate Price
            </>
          )}
        </Button>

        {/* Reset Button */}
        <Button
          type='button'
          variant='outline'
          onClick={resetCalculator}
          className='w-full'
          disabled={isCalculating}
        >
          Reset Calculator
        </Button>

        {/* Note */}
        <p className='text-xs text-gray-500 text-center'>
          Note: This calculation uses current rate cards. Final prices may vary.
        </p>
      </CardContent>
    </Card>
  )
}
