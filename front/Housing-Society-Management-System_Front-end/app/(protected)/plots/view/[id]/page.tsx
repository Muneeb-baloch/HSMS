// src/app/(dashboard)/plots/view/[id]/page.tsx
'use client'

import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { usePlot } from '@/lib/hooks/entities/usePlot'
import { formatDate } from '@/lib/utils/format'
import {
  ArrowLeft,
  Building,
  Calculator,
  Calendar,
  CheckCircle,
  FileText,
  MapPin,
  Ruler,
  Tag,
  User,
  XCircle
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { DetailPageSkeleton } from '@/components/shared/PageSkeleton'

export default function ViewPlotPage () {
  const router = useRouter()
  const params = useParams()

  const id = params.id as string
  const { data: plot, isLoading } = usePlot(id)

  if (isLoading) {
    return <DetailPageSkeleton />
  }

  if (!plot) {
    return (

          <div className='p-6'>
            <Card>
              <CardHeader>
                <CardTitle>Plot Not Found</CardTitle>
                <CardDescription>
                  The requested plot does not exist or has been deleted.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => router.push('/plots')}>
                  <ArrowLeft className='mr-2 h-4 w-4' />
                  Back to Plots
                </Button>
              </CardContent>
            </Card>
          </div>

    )
  }

  const getPlotTypeColor = (type: string) => {
    const colors = {
      residential: 'bg-blue-100 text-blue-800',
      commercial: 'bg-purple-100 text-purple-800',
      industrial: 'bg-gray-100 text-gray-800',
      agricultural: 'bg-green-100 text-green-800',
      corner: 'bg-yellow-100 text-yellow-800',
      park_facing: 'bg-teal-100 text-teal-800',
      main_boulevard: 'bg-pink-100 text-pink-800',
      standard: 'bg-indigo-100 text-indigo-800'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (

        <div className='p-6'>
          <Button
            variant='ghost'
            onClick={() => router.back()}
            className='mb-6'
          >
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back
          </Button>

          <Card className='mb-6'>
            <CardHeader>
              <div className='flex justify-between items-start'>
                <div>
                  <CardTitle className='text-2xl flex items-center gap-2'>
                    <Building className='h-6 w-6' />
                    Plot {plot.plotNo}
                    {plot.plotRegistrationNo && (
                      <span className='text-lg text-gray-500'>
                        ({plot.plotRegistrationNo})
                      </span>
                    )}
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getPlotTypeColor(
                        plot.plotType
                      )}`}
                    >
                      {plot.plotType.charAt(0).toUpperCase() +
                        plot.plotType.slice(1).replace('_', ' ')}
                    </span>
                  </CardTitle>
                  <CardDescription>
                    Plot Details and Specifications
                  </CardDescription>
                </div>
                {plot.isDeleted && (
                  <span className='px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full'>
                    Deleted
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Basic Information */}
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-gray-500'>
                  <Building className='h-4 w-4' />
                  <span className='text-sm font-medium'>Basic Information</span>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 pl-6'>
                  <div>
                    <span className='text-sm text-gray-500'>Project:</span>
                    <p className='font-medium'>
                      {typeof plot.projectId === 'object'
                        ? `${plot.projectId.projName}${
                            plot.projectId.projCode
                              ? ` (${plot.projectId.projCode})`
                              : ''
                          }`
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className='text-sm text-gray-500'>Block:</span>
                    <p className='font-medium'>
                      {typeof plot.plotBlockId === 'object'
                        ? plot.plotBlockId.plotBlockName
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className='text-sm text-gray-500'>Status:</span>
                    <p className='font-medium'>
                      {typeof plot.salesStatusId === 'object'
                        ? plot.salesStatusId.statusName
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dimensions and Area */}
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-gray-500'>
                  <Ruler className='h-4 w-4' />
                  <span className='text-sm font-medium'>Dimensions & Area</span>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-4 gap-4 pl-6'>
                  <div>
                    <span className='text-sm text-gray-500'>Length:</span>
                    <p className='font-medium'>{plot.plotLength} ft</p>
                  </div>
                  <div>
                    <span className='text-sm text-gray-500'>Width:</span>
                    <p className='font-medium'>{plot.plotWidth} ft</p>
                  </div>
                  <div>
                    <span className='text-sm text-gray-500'>Area:</span>
                    <p className='font-medium'>
                      {plot.formattedArea ||
                        `${plot.plotArea} ${plot.plotAreaUnit}`}
                    </p>
                  </div>
                  <div>
                    <span className='text-sm text-gray-500'>Dimensions:</span>
                    <p className='font-medium'>
                      {plot.dimensionsWithUnit || plot.plotDimensions || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pricing Information */}
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-gray-500'>
                  <Tag className='h-4 w-4' />
                  <span className='text-sm font-medium'>
                    Pricing Information
                  </span>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-4 gap-4 pl-6'>
                  <div>
                    <span className='text-sm text-gray-500'>Base Price:</span>
                    <p className='font-medium'>
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'PKR'
                      }).format(plot.plotBasePrice)}
                    </p>
                  </div>
                  <div>
                    <span className='text-sm text-gray-500'>Surcharge:</span>
                    <p className='font-medium'>
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'PKR'
                      }).format(plot.surchargeAmount)}
                    </p>
                  </div>
                  <div>
                    <span className='text-sm text-gray-500'>Discount:</span>
                    <p className='font-medium text-red-600'>
                      -
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'PKR'
                      }).format(plot.discountAmount)}
                    </p>
                  </div>
                  <div>
                    <span className='text-sm text-gray-500'>Total Amount:</span>
                    <p className='font-bold text-green-600'>
                      {plot.formattedTotalAmount ||
                        new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'PKR'
                        }).format(plot.plotTotalAmount)}
                    </p>
                  </div>
                </div>
                {plot.discountPercentage && (
                  <div className='pl-6'>
                    <span className='text-sm text-gray-500'>
                      Discount Percentage:
                    </span>
                    <p className='font-medium'>
                      {plot.discountPercentage.toFixed(2)}%
                    </p>
                  </div>
                )}
              </div>

              {/* Category and Type */}
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-gray-500'>
                  <Tag className='h-4 w-4' />
                  <span className='text-sm font-medium'>Category & Type</span>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 pl-6'>
                  <div>
                    <span className='text-sm text-gray-500'>
                      Plot Category:
                    </span>
                    <p className='font-medium'>
                      {typeof plot.plotCategoryId === 'object'
                        ? plot.plotCategoryId.categoryName
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className='text-sm text-gray-500'>
                      Development Status:
                    </span>
                    <p className='font-medium'>
                      {typeof plot.srDevStatId === 'object'
                        ? plot.srDevStatId.srDevStatName
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              {plot.fileId && (
                <div className='space-y-2'>
                  <div className='flex items-center gap-2 text-gray-500'>
                    <User className='h-4 w-4' />
                    <span className='text-sm font-medium'>
                      Customer Information
                    </span>
                  </div>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4 pl-6'>
                    <div>
                      <span className='text-sm text-gray-500'>Customer:</span>
                      <p className='font-medium'>
                        {typeof plot.fileId === 'object'
                          ? plot.fileId.customerName
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className='text-sm text-gray-500'>
                        File Number:
                      </span>
                      <p className='font-medium'>
                        {typeof plot.fileId === 'object'
                          ? plot.fileId.fileNumber
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className='text-sm text-gray-500'>CNIC:</span>
                      <p className='font-medium'>
                        {typeof plot.fileId === 'object'
                          ? plot.fileId.customerCnic
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Location Information */}
              {(plot.plotStreet || plot.plotLatitude || plot.plotLongitude) && (
                <div className='space-y-2'>
                  <div className='flex items-center gap-2 text-gray-500'>
                    <MapPin className='h-4 w-4' />
                    <span className='text-sm font-medium'>
                      Location Information
                    </span>
                  </div>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4 pl-6'>
                    {plot.plotStreet && (
                      <div>
                        <span className='text-sm text-gray-500'>Street:</span>
                        <p className='font-medium'>{plot.plotStreet}</p>
                      </div>
                    )}
                  </div>
                  {(plot.plotLatitude || plot.plotLongitude) && (
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 pl-6'>
                      <div>
                        <span className='text-sm text-gray-500'>Latitude:</span>
                        <p className='font-medium'>
                          {plot.plotLatitude || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className='text-sm text-gray-500'>
                          Longitude:
                        </span>
                        <p className='font-medium'>
                          {plot.plotLongitude || 'N/A'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Status and Dates */}
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-gray-500'>
                  <Calendar className='h-4 w-4' />
                  <span className='text-sm font-medium'>Status & Dates</span>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 pl-6'>
                  <div>
                    <span className='text-sm text-gray-500'>
                      Possession Ready:
                    </span>
                    <div className='flex items-center gap-2'>
                      {plot.isPossessionReady ? (
                        <CheckCircle className='h-4 w-4 text-green-500' />
                      ) : (
                        <XCircle className='h-4 w-4 text-red-500' />
                      )}
                      <span
                        className={`font-medium ${
                          plot.isPossessionReady
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {plot.isPossessionReady ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className='text-sm text-gray-500'>Created Date:</span>
                    <p className='font-medium'>{formatDate(plot.createdAt)}</p>
                  </div>
                  <div>
                    <span className='text-sm text-gray-500'>Last Updated:</span>
                    <p className='font-medium'>{formatDate(plot.updatedAt)}</p>
                  </div>
                </div>
                {plot.discountDate && (
                  <div className='pl-6'>
                    <span className='text-sm text-gray-500'>
                      Discount Date:
                    </span>
                    <p className='font-medium'>
                      {formatDate(plot.discountDate)}
                    </p>
                  </div>
                )}
              </div>

              {/* Remarks */}
              {plot.plotRemarks && (
                <div className='space-y-2'>
                  <div className='flex items-center gap-2 text-gray-500'>
                    <FileText className='h-4 w-4' />
                    <span className='text-sm font-medium'>Remarks</span>
                  </div>
                  <p className='text-gray-800 pl-6'>{plot.plotRemarks}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className='flex gap-4'>
            <Button
              onClick={() => router.push(`/plots/edit/${id}`)}
              className='flex-1'
            >
              Edit Plot
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant='outline' className='flex-1'>
                  Quick Actions
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Plot Actions</DialogTitle>
                </DialogHeader>
                <div className='space-y-3'>
                  {!plot.fileId && (
                    <Button
                      onClick={() => router.push(`/plots/assign/${id}`)}
                      className='w-full'
                    >
                      Assign to Customer
                    </Button>
                  )}
                  {plot.fileId && !plot.isPossessionReady && (
                    <Button
                      onClick={() =>
                        router.push(`/plots/possession-ready/${id}`)
                      }
                      variant='outline'
                      className='w-full'
                    >
                      Mark Possession Ready
                    </Button>
                  )}
                  <Button
                    onClick={() => router.push(`/plots/documents/${id}`)}
                    variant='outline'
                    className='w-full'
                  >
                    Manage Documents
                  </Button>
                  <Button
                    onClick={() => router.push(`/plots/calculate/${id}`)}
                    variant='outline'
                    className='w-full'
                  >
                    <Calculator className='mr-2 h-4 w-4' />
                    Recalculate Price
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              variant='outline'
              onClick={() => router.push('/plots')}
              className='flex-1'
            >
              Back to List
            </Button>
          </div>
        </div>
      
  )
}
