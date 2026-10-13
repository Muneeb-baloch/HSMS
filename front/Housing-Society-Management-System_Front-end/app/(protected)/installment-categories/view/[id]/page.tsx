// src/app/(dashboard)/installment-categories/view/[id]/page.tsx
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
import { useInstallmentCategory } from '@/lib/hooks/entities/useInstallmentCategory'
import { formatDate } from '@/lib/utils/format'
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  Shield,
  Tag
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { DetailPageSkeleton } from '@/components/shared/PageSkeleton'

export default function ViewInstallmentCategoryPage () {
  const router = useRouter()
  const params = useParams()

  const id = params.id as string
  const { data: category, isLoading } = useInstallmentCategory(id)

  if (isLoading) {
    return <DetailPageSkeleton />
  }

  if (!category) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Category Not Found</CardTitle>
            <CardDescription>
              The requested category does not exist or has been deleted.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/installment-categories')}>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Categories
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='p-6'>
      <Button variant='ghost' onClick={() => router.back()} className='mb-6'>
        <ArrowLeft className='mr-2 h-4 w-4' />
        Back
      </Button>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Main Category Card */}
        <div className='lg:col-span-2'>
          <Card className='mb-6'>
            <CardHeader>
              <div className='flex justify-between items-start'>
                <div>
                  <CardTitle className='text-2xl'>
                    {category.instCatName}
                  </CardTitle>
                  <CardDescription>
                    Sequence Order: {category.sequenceOrder}
                  </CardDescription>
                </div>
                <div className='flex gap-2'>
                  <Badge
                    className={
                      category.isRefundable
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }
                  >
                    {category.isRefundable ? 'Refundable' : 'Non-Refundable'}
                  </Badge>
                  <Badge
                    className={
                      category.isMandatory
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }
                  >
                    {category.isMandatory ? 'Mandatory' : 'Optional'}
                  </Badge>
                  <Badge
                    className={
                      category.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }
                  >
                    {category.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Category Description */}
              {category.instCatDescription && (
                <div className='space-y-2'>
                  <div className='flex items-center gap-2 text-gray-500'>
                    <Tag className='h-4 w-4' />
                    <span className='text-sm font-medium'>Description</span>
                  </div>
                  <p className='text-gray-800 pl-6'>
                    {category.instCatDescription}
                  </p>
                </div>
              )}

              {/* Created Information */}
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-gray-500'>
                  <CheckCircle className='h-4 w-4' />
                  <span className='text-sm font-medium'>
                    Created Information
                  </span>
                </div>
                <div className='pl-6 space-y-2'>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm text-gray-600'>Created By:</span>
                    <span className='font-medium'>
                      {category.createdBy?.fullName ||
                        category.createdBy?.userName ||
                        'System'}
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Calendar className='h-4 w-4 text-gray-400' />
                    <span className='text-sm text-gray-600'>
                      Created: {formatDate(category.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Modified Information */}
              {category.modifiedBy && (
                <div className='space-y-2'>
                  <div className='flex items-center gap-2 text-gray-500'>
                    <Edit className='h-4 w-4' />
                    <span className='text-sm font-medium'>Last Modified</span>
                  </div>
                  <div className='pl-6 space-y-2'>
                    <div className='flex items-center gap-2'>
                      <span className='text-sm text-gray-600'>
                        Modified By:
                      </span>
                      <span className='font-medium'>
                        {category.modifiedBy?.fullName ||
                          category.modifiedBy?.userName ||
                          'System'}
                      </span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Clock className='h-4 w-4 text-gray-400' />
                      <span className='text-sm text-gray-600'>
                        Last Updated: {formatDate(category.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Stats */}
        <div className='space-y-6'>
          {/* Category Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Category Details</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-3'>
                <div className='flex justify-between items-center'>
                  <div className='flex items-center gap-2 text-gray-600'>
                    <Tag className='h-4 w-4' />
                    <span className='text-sm'>Sequence Order</span>
                  </div>
                  <div className='font-semibold text-lg'>
                    {category.sequenceOrder}
                  </div>
                </div>

                <div className='flex justify-between items-center'>
                  <div className='flex items-center gap-2 text-gray-600'>
                    <Shield className='h-4 w-4' />
                    <span className='text-sm'>Category Type</span>
                  </div>
                  <div className='font-semibold'>
                    {category.isMandatory ? 'Mandatory' : 'Optional'}
                  </div>
                </div>

                <div className='flex justify-between items-center'>
                  <div className='flex items-center gap-2 text-gray-600'>
                    <CheckCircle className='h-4 w-4' />
                    <span className='text-sm'>Refund Status</span>
                  </div>
                  <div className='font-semibold'>
                    {category.isRefundable ? 'Refundable' : 'Non-Refundable'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className='flex flex-col gap-3'>
            <Button
              onClick={() => router.push(`/installment-categories/edit/${id}`)}
              className='w-full'
            >
              Edit Category
            </Button>
            <Button
              variant='outline'
              onClick={() => router.push('/installment-categories')}
              className='w-full'
            >
              Back to Categories
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
