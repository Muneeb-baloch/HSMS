// src/app/(dashboard)/plotsizes/view/[id]/page.tsx
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
import {
  usePlotSize,
  usePriceBreakdown
} from '@/lib/hooks/entities/usePlotSize'
import { formatDate } from '@/lib/utils/format'
import {
  ArrowLeft,
  Calculator,
  Calendar,
  DollarSign,
  Ruler,
  User
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { DetailPageSkeleton } from '@/components/shared/PageSkeleton'

export default function ViewPlotSizePage () {
  const router = useRouter()
  const params = useParams()

  const id = params.id as string
  const { data: plotSize, isLoading } = usePlotSize(id)
  const { data: breakdown } = usePriceBreakdown(id)

  if (isLoading) {
    return <DetailPageSkeleton />
  }

  if (!plotSize) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Plot Size Not Found</CardTitle>
            <CardDescription>
              The requested plot size does not exist or has been deleted.
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

  const createdBy =
    typeof plotSize.createdBy === 'object'
      ? `${plotSize.createdBy.firstName} ${plotSize.createdBy.lastName}`
      : 'System'

  const updatedBy =
    plotSize.updatedBy && typeof plotSize.updatedBy === 'object'
      ? `${plotSize.updatedBy.firstName} ${plotSize.updatedBy.lastName}`
      : 'N/A'

  return (
    <div className='p-6'>
      <Button variant='ghost' onClick={() => router.back()} className='mb-6'>
        <ArrowLeft className='mr-2 h-4 w-4' />
        Back
      </Button>

      <Card className='mb-6'>
        <CardHeader>
          <div className='flex justify-between items-start'>
            <div>
              <CardTitle className='text-2xl'>
                {plotSize.plotSizeName}
              </CardTitle>
              <CardDescription>Plot Size Details</CardDescription>
            </div>
            <Badge variant='outline' className='text-lg'>
              {plotSize.totalArea} {plotSize.areaUnit.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Price Information */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg'>
            <div className='text-center'>
              <div className='text-sm text-gray-500'>Rate Per Unit</div>
              <div className='text-xl font-bold text-blue-700'>
                {plotSize.formattedRate ||
                  `PKR ${plotSize.ratePerUnit.toLocaleString()}`}
              </div>
              <div className='text-xs text-gray-500'>
                per {plotSize.areaUnit}
              </div>
            </div>
            <div className='text-center'>
              <div className='text-sm text-gray-500'>Total Area</div>
              <div className='text-xl font-bold'>
                {plotSize.totalArea} {plotSize.areaUnit}
              </div>
              <div className='text-xs text-gray-500'>Plot Size</div>
            </div>
            <div className='text-center'>
              <div className='text-sm text-gray-500'>Total Price</div>
              <div className='text-2xl font-bold text-green-700'>
                {plotSize.formattedPrice ||
                  `PKR ${plotSize.standardBasePrice.toLocaleString()}`}
              </div>
              <div className='text-xs text-gray-500'>Standard Base Price</div>
            </div>
          </div>

          {/* Price Breakdown */}
          {breakdown && (
            <div className='p-4 bg-gray-50 rounded-lg'>
              <div className='flex items-center gap-2 mb-3'>
                <Calculator className='h-5 w-5 text-gray-500' />
                <h3 className='font-semibold'>Price Calculation</h3>
              </div>
              <div className='text-sm font-mono bg-white p-3 rounded border'>
                {breakdown.breakdown.calculation}
              </div>
            </div>
          )}

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-gray-500'>
                  <Ruler className='h-4 w-4' />
                  <span className='text-sm font-medium'>Area Unit</span>
                </div>
                <Badge className='text-base'>
                  {plotSize.areaUnit.toUpperCase()}
                </Badge>
              </div>

              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-gray-500'>
                  <User className='h-4 w-4' />
                  <span className='text-sm font-medium'>Created By</span>
                </div>
                <p className='font-medium pl-6'>{createdBy}</p>
              </div>

              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-gray-500'>
                  <Calendar className='h-4 w-4' />
                  <span className='text-sm font-medium'>Created Date</span>
                </div>
                <p className='font-medium pl-6'>
                  {formatDate(plotSize.createdAt)}
                </p>
              </div>
            </div>

            <div className='space-y-4'>
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-gray-500'>
                  <DollarSign className='h-4 w-4' />
                  <span className='text-sm font-medium'>Rate Calculation</span>
                </div>
                <p className='font-medium pl-6'>
                  {plotSize.ratePerUnit.toLocaleString()} × {plotSize.totalArea}{' '}
                  = {plotSize.standardBasePrice.toLocaleString()}
                </p>
              </div>

              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-gray-500'>
                  <User className='h-4 w-4' />
                  <span className='text-sm font-medium'>Last Updated By</span>
                </div>
                <p className='font-medium pl-6'>{updatedBy}</p>
              </div>

              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-gray-500'>
                  <Calendar className='h-4 w-4' />
                  <span className='text-sm font-medium'>Last Updated</span>
                </div>
                <p className='font-medium pl-6'>
                  {formatDate(plotSize.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className='flex gap-4'>
        <Button
          onClick={() => router.push(`/plotsizes/edit/${id}`)}
          className='flex-1'
        >
          Edit Plot Size
        </Button>
        <Button
          variant='outline'
          onClick={() => router.push('/plotsizes')}
          className='flex-1'
        >
          Back to List
        </Button>
        <Button
          variant='outline'
          onClick={() => router.push(`/plotsizes/breakdown/${id}`)}
        >
          Detailed Breakdown
        </Button>
      </div>
    </div>
  )
}
