// src/app/(dashboard)/plots/create/page.tsx
'use client'

import { EntityForm } from '@/components/shared/EntityForm/EntityForm'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { plotFormFields } from '@/lib/constants/plotForm.constants'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import {
  useCreatePlot,
  usePlotPriceCalculation
} from '@/lib/hooks/entities/usePlot'
import { useBlockAreaSummary } from '@/lib/hooks/entities/usePlotBlock'
import { useAuth } from '@/lib/hooks/useAuth'
import { plotSchema } from '@/lib/schemas/plot.schema'
import { CreatePlotDto } from '@/lib/types/plot'
import { ArrowLeft, Calculator } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { customToast } from '@/lib/utils/customToast'
import { apiClient } from '@/lib/API/client'

export default function CreatePlotPage () {
  const router = useRouter()
  const { user } = useAuth()
  const createMutation = useCreatePlot()
  const calculatePrice = usePlotPriceCalculation()
  const [societyId, setSocietyId] = useState<string | null>(null)

  useEffect(() => {
    const society = localStorage.getItem('selectedSociety')
    if (society) {
      try {
        const societyData = JSON.parse(society)
        setSocietyId(societyData._id || societyData.id)
      } catch (e) {
        setSocietyId(society)
      }
    }
  }, [])

  const [calculatedPrice, setCalculatedPrice] = useState<{
    basePrice: number
    surchargeAmount: number
    discountAmount: number
    totalAmount: number
    pricePerUnit: number
  } | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [selectedBlockId, setSelectedBlockId] = useState<string>('')
  const { data: blockAreaSummary } = useBlockAreaSummary(selectedBlockId || undefined)

  const canCreate =
    user &&
    hasPermission(
      user.role as UserRole,
      [UserRole.ADMIN, UserRole.SUPER_ADMIN] as UserRole[]
    )

  if (!canCreate) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to create plots.
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

  const handleCalculatePrice = async (data: any) => {
    if (
      !data.plotSizeId ||
      !data.plotCategoryId ||
      !data.plotType ||
      !data.plotLength ||
      !data.plotWidth
    ) {
      customToast.error('Please fill in all required fields to calculate price')
      return
    }

    setIsCalculating(true)
    try {
      const result = await calculatePrice.mutateAsync({
        plotSizeId: data.plotSizeId,
        plotCategoryId: data.plotCategoryId,
        plotType: data.plotType,
        plotLength: Number(data.plotLength),
        plotWidth: Number(data.plotWidth),
        discountAmount: data.discountAmount ? Number(data.discountAmount) : 0
      })

      setCalculatedPrice(result)
      customToast.success('Price calculated successfully')
    } catch (error) {
      customToast.error('Failed to calculate price')
    } finally {
      setIsCalculating(false)
    }
  }

  const handleSubmit = async (data: unknown) => {
    try {
      const plotData = data as CreatePlotDto & { societyId?: string }

      // Get societyId from the selected project
      if (plotData.projectId) {
        try {
          const projectResponse = await apiClient.get(`/projects/${plotData.projectId}`)
          if (projectResponse.data.success && projectResponse.data.data.societyId) {
            plotData.societyId = projectResponse.data.data.societyId
          }
        } catch (e) {
          console.error('Failed to fetch project societyId:', e)
        }
      }

      // Fallback to localStorage societyId if project fetch fails
      if (!plotData.societyId && societyId) {
        plotData.societyId = societyId
      }

      if (!plotData.societyId) {
        customToast.error('Society information is missing. Please select a valid project.')
        return
      }

      // Use calculated price if available
      if (calculatedPrice && !plotData.plotTotalAmount) {
        plotData.plotTotalAmount = calculatedPrice.totalAmount
        plotData.plotBasePrice = calculatedPrice.basePrice
        plotData.surchargeAmount = calculatedPrice.surchargeAmount
        plotData.discountAmount = calculatedPrice.discountAmount
      }
      await createMutation.mutateAsync(plotData)
      customToast.success('Plot created successfully')
      router.push('/plots')
    } catch (error) {
      customToast.error(
        'Failed to create plot' +
          (error instanceof Error ? `: ${error.message}` : '')
      )
    }
  }

  const handlePlotSizeChange = async (plotSizeId: string, form: any) => {
    if (!plotSizeId) return
    try {
      const response = await apiClient.get(`/plotsizes/${plotSizeId}`)
      if (response.data.success) {
        const plotSize = response.data.data
        form.setValue('plotLength', plotSize.sizeLength)
        form.setValue('plotWidth', plotSize.sizeWidth)
        form.setValue('plotAreaUnit', plotSize.areaUnit)
        form.setValue('plotBasePrice', plotSize.standardBasePrice)
      }
    } catch (error) {
      console.error('Failed to fetch plot size:', error)
    }
  }

  const handlePlotCategoryChange = async (categoryId: string, form: any) => {
    if (!categoryId) return
    try {
      const response = await apiClient.get(`/plotcategories/${categoryId}`)
      if (response.data.success) {
        const category = response.data.data
        // Set surcharge based on type (fixed or percentage)
        if (category.surchargeFixedAmount) {
          form.setValue('surchargeAmount', category.surchargeFixedAmount)
        } else if (category.surchargePercentage) {
          form.setValue('surchargeAmount', category.surchargePercentage)
        }
      }
    } catch (error) {
      console.error('Failed to fetch plot category:', error)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  const customFields = [...plotFormFields].map((field) => {
    if (field.name === 'plotSizeId') {
      return {
        ...field,
        onChange: handlePlotSizeChange
      }
    }
    if (field.name === 'plotCategoryId') {
      return {
        ...field,
        onChange: handlePlotCategoryChange
      }
    }
    if (field.name === 'plotBlockId') {
      return {
        ...field,
        onChange: (value: unknown) => {
          setSelectedBlockId(typeof value === 'string' ? value : '')
        }
      }
    }
    return field
  })

  // Add price calculation button after form fields
  return (
    <>
      <div className='p-6 w-[75vw] relative flex flex-1 flex-col gap-6'>
        <div className='float-left'>
          <Button
            variant='ghost'
            onClick={() => router.back()}
            className='mb-4'
          >
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back to Plots
          </Button>
        </div>
        <h1 className='text-3xl font-bold'>Create New Plot</h1>
        <p className='text-gray-500 mt-2'>
          Fill in all the required information to create a new plot.
        </p>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <Card className='lg:col-span-2'>
            <CardHeader>
              <CardTitle>Plot Information</CardTitle>
              <CardDescription>
                Enter plot details and specifications
              </CardDescription>
            </CardHeader>
            <CardContent className='pt-6'>
              <EntityForm
                schema={plotSchema}
                fields={customFields}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                submitLabel='Create Plot'
                cancelLabel='Cancel'
                isLoading={createMutation.isPending}
              />
            </CardContent>
          </Card>

          <div className='space-y-6'>
            {/* Price Calculation Card */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Calculator className='h-5 w-5' />
                  Price Calculator
                </CardTitle>
                <CardDescription>
                  Calculate plot price based on size and category
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <Button
                  type='button'
                  variant='outline'
                  className='w-full'
                  onClick={() => {
                    // This would trigger calculation based on form values
                    // In a real implementation, you would get form values from context
                    customToast.info('Fill in the form and then calculate price')
                  }}
                  disabled={isCalculating}
                >
                  {isCalculating ? 'Calculating...' : 'Calculate Price'}
                </Button>

                {calculatedPrice && (
                  <div className='space-y-3 pt-4 border-t'>
                    <div className='flex justify-between'>
                      <span className='text-sm text-gray-500'>Base Price:</span>
                      <span className='font-medium'>
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'PKR'
                        }).format(calculatedPrice.basePrice)}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-sm text-gray-500'>Surcharge:</span>
                      <span className='font-medium'>
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'PKR'
                        }).format(calculatedPrice.surchargeAmount)}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-sm text-gray-500'>Discount:</span>
                      <span className='font-medium text-red-600'>
                        -
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'PKR'
                        }).format(calculatedPrice.discountAmount)}
                      </span>
                    </div>
                    <div className='flex justify-between pt-2 border-t'>
                      <span className='text-sm font-medium'>Total Amount:</span>
                      <span className='text-lg font-bold text-green-600'>
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'PKR'
                        }).format(calculatedPrice.totalAmount)}
                      </span>
                    </div>
                    <div className='text-xs text-gray-500'>
                      Price per unit: {calculatedPrice.pricePerUnit.toFixed(2)}
                      /unit
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Information</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3 text-sm'>
                {blockAreaSummary && (
                  <div className='rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-900 space-y-1'>
                    <div className='flex justify-between'>
                      <span>Block capacity:</span>
                      <strong>{blockAreaSummary.area} {blockAreaSummary.areaUnit}</strong>
                    </div>
                    <div className='flex justify-between'>
                      <span>Already allocated:</span>
                      <strong>{blockAreaSummary.allocated} {blockAreaSummary.areaUnit}</strong>
                    </div>
                    <div className='flex justify-between'>
                      <span>Remaining:</span>
                      <strong>{blockAreaSummary.remaining} {blockAreaSummary.areaUnit}</strong>
                    </div>
                  </div>
                )}
                <div className='flex justify-between'>
                  <span className='text-gray-500'>Plot Area:</span>
                  <span className='font-medium'>Auto-calculated</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-500'>Registration No:</span>
                  <span className='font-medium'>Auto-generated</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-500'>Dimensions:</span>
                  <span className='font-medium'>Auto-generated</span>
                </div>
                <div className='pt-3 border-t'>
                  <p className='text-gray-500 text-xs'>
                    Note: Plot registration number will be automatically
                    generated based on project, block, and plot number.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
