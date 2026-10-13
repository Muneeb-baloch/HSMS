// src/app/(dashboard)/plotcategories/view/[id]/page.tsx
'use client'

import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { usePlotCategory } from '@/lib/hooks/entities/usePlotCategory'
import { formatDate } from '@/lib/utils/format'
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  FileText,
  Percent,
  User
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { DetailPageSkeleton } from '@/components/shared/PageSkeleton'

export default function ViewPlotCategoryPage () {
  const router = useRouter()
  const params = useParams()

  const id = params.id as string
  const { data: plotCategory, isLoading } = usePlotCategory(id)

  if (isLoading) {
    return <DetailPageSkeleton />
  }

  if (!plotCategory) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Plot Category Not Found</CardTitle>
            <CardDescription>
              The requested plot category does not exist or has been deleted.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/plotcategories')}>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Categories
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const createdBy =
    typeof plotCategory.createdBy === 'object'
      ? `${plotCategory.createdBy.firstName} ${plotCategory.createdBy.lastName}`
      : 'System'

  const updatedBy =
    plotCategory.updatedBy && typeof plotCategory.updatedBy === 'object'
      ? `${plotCategory.updatedBy.firstName} ${plotCategory.updatedBy.lastName}`
      : 'N/A'

  const surchargeType =
    plotCategory.surchargeType ||
    (plotCategory.surchargePercentage && plotCategory.surchargePercentage > 0
      ? 'percentage'
      : plotCategory.surchargeFixedAmount &&
        plotCategory.surchargeFixedAmount > 0
      ? 'fixed'
      : 'none')

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
                {plotCategory.categoryName}
              </CardTitle>
              <CardDescription>Plot Category Details</CardDescription>
            </div>
            <div className='flex gap-2'>
              <Badge
                className={
                  plotCategory.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }
              >
                {plotCategory.isActive ? 'Active' : 'Inactive'}
              </Badge>
              {surchargeType !== 'none' && (
                <Badge
                  className={
                    surchargeType === 'percentage'
                      ? 'bg-blue-100 text-blue-800'
                      : surchargeType === 'fixed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }
                >
                  {surchargeType === 'percentage'
                    ? 'Percentage'
                    : surchargeType === 'fixed'
                    ? 'Fixed'
                    : 'No Surcharge'}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-6'>
          {plotCategory.categoryDesc && (
            <div className='space-y-2'>
              <div className='flex items-center gap-2 text-gray-500'>
                <FileText className='h-4 w-4' />
                <span className='text-sm font-medium'>Description</span>
              </div>
              <p className='text-gray-800 pl-6'>{plotCategory.categoryDesc}</p>
            </div>
          )}

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-gray-500'>
                  {surchargeType === 'percentage' ? (
                    <Percent className='h-4 w-4' />
                  ) : surchargeType === 'fixed' ? (
                    <DollarSign className='h-4 w-4' />
                  ) : (
                    <FileText className='h-4 w-4' />
                  )}
                  <span className='text-sm font-medium'>Surcharge</span>
                </div>
                <p className='font-medium pl-6'>
                  {plotCategory.formattedSurcharge || 'No Surcharge'}
                </p>
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
                  {formatDate(plotCategory.createdAt)}
                </p>
              </div>
            </div>

            <div className='space-y-4'>
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-gray-500'>
                  <FileText className='h-4 w-4' />
                  <span className='text-sm font-medium'>Status</span>
                </div>
                <p className='font-medium pl-6'>
                  {plotCategory.isActive ? 'Active' : 'Inactive'}
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
                  {formatDate(plotCategory.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className='flex gap-4'>
        <Button
          onClick={() => router.push(`/plotcategories/edit/${id}`)}
          className='flex-1'
        >
          Edit Category
        </Button>
        <Button
          variant='outline'
          onClick={() => router.push('/plotcategories')}
          className='flex-1'
        >
          Back to List
        </Button>
      </div>
    </div>
  )
}
