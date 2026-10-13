// src/app/(dashboard)/plotsizes/calculator/page.tsx
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  useAreaUnits,
  useCalculatePrice,
  useConvertArea
} from '@/lib/hooks/entities/usePlotSize'
import { ArrowLeft, Calculator, DollarSign, Repeat, Ruler } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useConfirm } from "@/components/shared/ConfirmDialog";

export default function PlotSizeCalculatorsPage () {
  const router = useRouter()
  const { data: areaUnits = [] } = useAreaUnits()

  const { alert } = useConfirm();

  // Price Calculator State
  const [priceData, setPriceData] = useState({
    totalArea: '',
    areaUnit: 'marla',
    ratePerUnit: ''
  })

  // Area Converter State
  const [converterData, setConverterData] = useState({
    value: '',
    fromUnit: 'marla',
    toUnit: 'sqft'
  })

  const {
    mutateAsync: calculatePrice,
    isPending: calculatingPrice,
    data: priceResult
  } = useCalculatePrice()
  const {
    mutateAsync: convertArea,
    isPending: convertingArea,
    data: conversionResult
  } = useConvertArea()

  const handlePriceCalculate = async () => {
    if (!priceData.totalArea || !priceData.ratePerUnit) {
      await alert({ description: 'Please enter total area and rate per unit' })
      return
    }

    await calculatePrice({
      totalArea: parseFloat(priceData.totalArea),
      areaUnit: priceData.areaUnit,
      ratePerUnit: parseFloat(priceData.ratePerUnit)
    })
  }

  const handleAreaConvert = async () => {
    if (!converterData.value) {
      await alert({ description: 'Please enter a value to convert' })
      return
    }

    await convertArea({
      value: parseFloat(converterData.value),
      fromUnit: converterData.fromUnit,
      toUnit: converterData.toUnit
    })
  }

  const resetPriceCalculator = () => {
    setPriceData({
      totalArea: '',
      areaUnit: 'marla',
      ratePerUnit: ''
    })
  }

  const resetAreaConverter = () => {
    setConverterData({
      value: '',
      fromUnit: 'marla',
      toUnit: 'sqft'
    })
  }

  const swapUnits = () => {
    setConverterData(prev => ({
      ...prev,
      fromUnit: prev.toUnit,
      toUnit: prev.fromUnit
    }))
  }

  return (
    <div className='p-6'>
      <Button variant='ghost' onClick={() => router.back()} className='mb-6'>
        <ArrowLeft className='mr-2 h-4 w-4' />
        Back
      </Button>

      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2'>Plot Size Calculators</h1>
        <p className='text-gray-600'>
          Useful calculators for plot size calculations and conversions
        </p>
      </div>

      <Tabs defaultValue='price' className='w-full'>
        <TabsList className='grid w-full grid-cols-2 mb-6'>
          <TabsTrigger value='price' className='flex items-center gap-2'>
            <DollarSign className='h-4 w-4' />
            Price Calculator
          </TabsTrigger>
          <TabsTrigger value='converter' className='flex items-center gap-2'>
            <Ruler className='h-4 w-4' />
            Area Converter
          </TabsTrigger>
        </TabsList>

        <TabsContent value='price'>
          <Card>
            <CardHeader>
              <div className='flex items-center gap-2'>
                <Calculator className='h-5 w-5' />
                <CardTitle>Price Calculator</CardTitle>
              </div>
              <CardDescription>
                Calculate total price based on area and rate per unit
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='totalArea'>Total Area *</Label>
                  <Input
                    id='totalArea'
                    type='number'
                    placeholder='Enter area'
                    value={priceData.totalArea}
                    className='enhanced-input h-11'
                    onChange={e =>
                      setPriceData({
                        ...priceData,
                        totalArea: e.target.value
                      })
                    }
                    min='0.01'
                    step='0.01'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='areaUnit'>Area Unit *</Label>
                  <Select
                    value={priceData.areaUnit}
                    onValueChange={value =>
                      setPriceData({ ...priceData, areaUnit: value })
                    }
                  >
                    <SelectTrigger className='h-11 enhanced-input'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {areaUnits.map(unit => (
                        <SelectItem key={unit} value={unit}>
                          {unit.charAt(0).toUpperCase() + unit.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='ratePerUnit'>Rate Per Unit *</Label>
                  <Input
                    id='ratePerUnit'
                    type='number'
                    placeholder='Enter rate'
                    value={priceData.ratePerUnit}
                    className='enhanced-input h-11'
                    onChange={e =>
                      setPriceData({
                        ...priceData,
                        ratePerUnit: e.target.value
                      })
                    }
                    min='0'
                    step='0.01'
                  />
                </div>
              </div>

              <div className='flex gap-3'>
                <Button
                  onClick={handlePriceCalculate}
                  disabled={
                    calculatingPrice ||
                    !priceData.totalArea ||
                    !priceData.ratePerUnit
                  }
                  className='flex-1'
                >
                  {calculatingPrice ? 'Calculating...' : 'Calculate Price'}
                </Button>
                <Button
                  variant='outline'
                  onClick={resetPriceCalculator}
                  disabled={!priceData.totalArea && !priceData.ratePerUnit}
                >
                  Reset
                </Button>
              </div>

              {priceResult && (
                <div className='mt-6 p-4 bg-green-50 rounded-lg border border-green-200'>
                  <h4 className='font-semibold text-green-800 mb-2'>
                    Calculation Result:
                  </h4>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-1'>
                      <div className='text-sm text-gray-600'>Total Area</div>
                      <div className='text-lg font-bold'>
                        {priceResult.totalArea} {priceResult.areaUnit}
                      </div>
                    </div>
                    <div className='space-y-1'>
                      <div className='text-sm text-gray-600'>Rate Per Unit</div>
                      <div className='text-lg font-bold'>
                        PKR {priceResult.ratePerUnit.toLocaleString()}
                      </div>
                    </div>
                    <div className='col-span-2 pt-2 border-t'>
                      <div className='space-y-1'>
                        <div className='text-sm text-gray-600'>Total Price</div>
                        <div className='text-2xl font-bold text-green-700'>
                          PKR {priceResult.calculatedPrice.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='mt-3 text-sm text-gray-500 font-mono'>
                    Formula: {priceResult.calculation}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='converter'>
          <Card>
            <CardHeader>
              <div className='flex items-center gap-2'>
                <Ruler className='h-5 w-5' />
                <CardTitle>Area Unit Converter</CardTitle>
              </div>
              <CardDescription>
                Convert area between different measurement units
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='value'>Value *</Label>
                  <Input
                    id='value'
                    type='number'
                    placeholder='Enter value'
                    value={converterData.value}
                    className='enhanced-input h-11'
                    onChange={e =>
                      setConverterData({
                        ...converterData,
                        value: e.target.value
                      })
                    }
                    min='0.01'
                    step='0.01'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='fromUnit'>From Unit *</Label>
                  <Select
                    value={converterData.fromUnit}
                    onValueChange={value =>
                      setConverterData({
                        ...converterData,
                        fromUnit: value
                      })
                    }
                  >
                    <SelectTrigger className='h-11 enhanced-input'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {areaUnits.map(unit => (
                        <SelectItem key={unit} value={unit}>
                          {unit.charAt(0).toUpperCase() + unit.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='toUnit'>To Unit *</Label>
                  <div className='flex gap-2'>
                    <Select
                      value={converterData.toUnit}
                      onValueChange={value =>
                        setConverterData({
                          ...converterData,
                          toUnit: value
                        })
                      }
                    >
                      <SelectTrigger className='h-11 enhanced-input'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {areaUnits.map(unit => (
                          <SelectItem key={unit} value={unit}>
                            {unit.charAt(0).toUpperCase() + unit.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type='button'
                      variant='outline'
                      size='icon'
                      onClick={swapUnits}
                      title='Swap units'
                    >
                      <Repeat className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              </div>

              <div className='flex gap-3'>
                <Button
                  onClick={handleAreaConvert}
                  disabled={convertingArea || !converterData.value}
                  className='flex-1'
                >
                  {convertingArea ? 'Converting...' : 'Convert Area'}
                </Button>
                <Button
                  variant='outline'
                  onClick={resetAreaConverter}
                  disabled={!converterData.value}
                >
                  Reset
                </Button>
              </div>

              {conversionResult && (
                <div className='mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200'>
                  <h4 className='font-semibold text-blue-800 mb-2'>
                    Conversion Result:
                  </h4>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-1'>
                      <div className='text-sm text-gray-600'>
                        Original Value
                      </div>
                      <div className='text-lg font-bold'>
                        {conversionResult.original.value}{' '}
                        {conversionResult.original.unit}
                      </div>
                    </div>
                    <div className='space-y-1'>
                      <div className='text-sm text-gray-600'>
                        Converted Value
                      </div>
                      <div className='text-lg font-bold text-blue-700'>
                        {conversionResult.converted.value.toFixed(4)}{' '}
                        {conversionResult.converted.unit}
                      </div>
                    </div>
                  </div>
                  <div className='mt-3 text-sm text-gray-500 font-mono'>
                    {conversionResult.conversion}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Statistics Card */}
      <Card className='mt-6'>
        <CardHeader>
          <CardTitle className='text-lg'>Common Area Conversions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='text-center p-3 bg-gray-50 rounded'>
              <div className='font-semibold'>1 Marla</div>
              <div className='text-sm text-gray-600'>= 225 sqft</div>
            </div>
            <div className='text-center p-3 bg-gray-50 rounded'>
              <div className='font-semibold'>1 Kanal</div>
              <div className='text-sm text-gray-600'>= 20 Marla</div>
            </div>
            <div className='text-center p-3 bg-gray-50 rounded'>
              <div className='font-semibold'>1 Acre</div>
              <div className='text-sm text-gray-600'>= 8 Kanal</div>
            </div>
            <div className='text-center p-3 bg-gray-50 rounded'>
              <div className='font-semibold'>1 Hectare</div>
              <div className='text-sm text-gray-600'>= 2.47 Acres</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
