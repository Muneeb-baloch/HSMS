// src/app/(dashboard)/plotsizes/breakdown/[id]/page.tsx
'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { usePriceBreakdown } from '@/lib/hooks/entities/usePlotSize'
import { ArrowLeft, Calculator, Download, Printer } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { DetailPageSkeleton } from '@/components/shared/PageSkeleton'

export default function PlotSizeBreakdownPage () {
  const router = useRouter()
  const params = useParams()

  const id = params.id as string
  const { data: breakdown, isLoading } = usePriceBreakdown(id)

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // Create a simple text file with the breakdown
    const content = `
Plot Size Price Breakdown
=========================
Plot Size: ${breakdown?.plotSize.plotSizeName}
Area: ${breakdown?.breakdown.totalArea} ${breakdown?.breakdown.areaUnit}
Rate per Unit: PKR ${breakdown?.breakdown.ratePerUnit.toLocaleString()} per ${
      breakdown?.breakdown.areaUnit
    }
Total Price: PKR ${breakdown?.breakdown.totalPrice.toLocaleString()}

Calculation: ${breakdown?.breakdown.calculation}

Generated on: ${new Date().toLocaleDateString()}
    `.trim()

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `plot-size-breakdown-${breakdown?.plotSize.plotSizeName}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return <DetailPageSkeleton />
  }

  if (!breakdown) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Breakdown Not Found</CardTitle>
            <CardDescription>
              Unable to load price breakdown for this plot size.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/plotsizes')}>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Plot Sizes
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='p-6 print:p-0'>
      <div className='flex justify-between items-center mb-6 print:hidden'>
        <Button variant='ghost' onClick={() => router.back()}>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back
        </Button>
        <div className='flex gap-2'>
          <Button variant='outline' onClick={handleDownload}>
            <Download className='mr-2 h-4 w-4' />
            Download
          </Button>
          <Button variant='outline' onClick={handlePrint}>
            <Printer className='mr-2 h-4 w-4' />
            Print
          </Button>
        </div>
      </div>

      <Card className='mb-6 print:border-none print:shadow-none'>
        <CardHeader className='print:border-b print:pb-4'>
          <div className='flex justify-between items-start'>
            <div>
              <CardTitle className='text-3xl print:text-2xl'>
                Price Breakdown
              </CardTitle>
              <CardDescription>
                Detailed calculation for {breakdown.plotSize.plotSizeName}
              </CardDescription>
            </div>
            <div className='text-right'>
              <div className='text-sm text-gray-500'>Reference</div>
              <div className='font-mono'>
                PS-{breakdown.plotSize._id.slice(-6)}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-8'>
          {/* Plot Size Information */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-4'>
              <div>
                <h3 className='text-lg font-semibold mb-2'>
                  Plot Size Details
                </h3>
                <div className='space-y-2'>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Name:</span>
                    <span className='font-semibold'>
                      {breakdown.plotSize.plotSizeName}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Area:</span>
                    <span className='font-semibold'>
                      {breakdown.breakdown.totalArea}{' '}
                      {breakdown.breakdown.areaUnit}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Unit:</span>
                    <span className='font-semibold'>
                      {breakdown.breakdown.areaUnit.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className='space-y-4'>
              <div>
                <h3 className='text-lg font-semibold mb-2'>Pricing Details</h3>
                <div className='space-y-2'>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Rate per Unit:</span>
                    <span className='font-semibold'>
                      PKR {breakdown.breakdown.ratePerUnit.toLocaleString()}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Base Price:</span>
                    <span className='font-semibold'>
                      PKR {breakdown.breakdown.totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Calculation Breakdown */}
          <div className='p-6 bg-gray-50 rounded-lg print:bg-white print:border'>
            <div className='flex items-center gap-3 mb-4'>
              <Calculator className='h-6 w-6 text-blue-600' />
              <h3 className='text-xl font-bold'>Calculation Breakdown</h3>
            </div>

            <div className='space-y-4'>
              <div className='text-center text-lg font-semibold'>
                Total Price = Area × Rate per Unit
              </div>

              <div className='grid grid-cols-3 gap-4 text-center'>
                <div className='p-4 bg-white rounded border'>
                  <div className='text-3xl font-bold text-blue-600'>
                    {breakdown.breakdown.totalArea}
                  </div>
                  <div className='text-sm text-gray-600'>
                    Area ({breakdown.breakdown.areaUnit})
                  </div>
                </div>

                <div className='p-4 flex items-center justify-center'>
                  <div className='text-2xl font-bold'>×</div>
                </div>

                <div className='p-4 bg-white rounded border'>
                  <div className='text-3xl font-bold text-green-600'>
                    PKR {breakdown.breakdown.ratePerUnit.toLocaleString()}
                  </div>
                  <div className='text-sm text-gray-600'>Rate per Unit</div>
                </div>
              </div>

              <div className='flex justify-center'>
                <div className='text-2xl font-bold'>=</div>
              </div>

              <div className='text-center'>
                <div className='text-4xl font-bold text-green-700'>
                  PKR {breakdown.breakdown.totalPrice.toLocaleString()}
                </div>
                <div className='text-sm text-gray-600 mt-2'>
                  Total Base Price
                </div>
              </div>
            </div>

            <div className='mt-6 pt-6 border-t text-center'>
              <div className='text-sm text-gray-500'>Formula:</div>
              <div className='font-mono text-lg'>
                {breakdown.breakdown.calculation}
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 print:text-sm'>
            <div className='p-4 bg-blue-50 rounded-lg print:bg-white print:border'>
              <h4 className='font-semibold mb-2 text-blue-700'>Notes</h4>
              <ul className='space-y-1 text-gray-600'>
                <li>• This is the standard base price calculation</li>
                <li>
                  • Additional charges may apply based on location and amenities
                </li>
                <li>• Prices are subject to change without notice</li>
                <li>• Contact sales for the most current pricing</li>
              </ul>
            </div>

            <div className='p-4 bg-green-50 rounded-lg print:bg-white print:border'>
              <h4 className='font-semibold mb-2 text-green-700'>
                Generated Information
              </h4>
              <div className='space-y-2 text-gray-600'>
                <div className='flex justify-between'>
                  <span>Generated On:</span>
                  <span className='font-medium'>
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span>Plot Size ID:</span>
                  <span className='font-medium'>
                    {breakdown.plotSize._id.slice(-8)}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span>Calculation Method:</span>
                  <span className='font-medium'>Standard Base Price</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className='flex justify-center gap-4 print:hidden'>
        <Button
          onClick={() => router.push(`/plotsizes/edit/${id}`)}
          variant='outline'
        >
          Edit Plot Size
        </Button>
        <Button onClick={() => router.push('/plotsizes')}>
          Back to Plot Sizes
        </Button>
      </div>
    </div>
  )
}
