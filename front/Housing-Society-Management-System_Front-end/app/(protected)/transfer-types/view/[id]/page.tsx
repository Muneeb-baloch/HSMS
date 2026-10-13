// src/app/(dashboard)/transfer-types/view/[id]/page.tsx
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
import { Separator } from '@/components/ui/separator'
import {
  useCalculateFee,
  useTransferType
} from '@/lib/hooks/entities/useTransferType'
import { formatDate } from '@/lib/utils/format'
import {
  Activity,
  ArrowLeft,
  Calculator,
  DollarSign,
  Edit,
  FileText,
  Tag,
  User
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { DetailPageSkeleton } from '@/components/shared/PageSkeleton'
import { useConfirm } from "@/components/shared/ConfirmDialog";

export default function ViewTransferTypePage () {
  const router = useRouter()
  const params = useParams()

  const id = params.id as string
  const { data: transferType, isLoading } = useTransferType(id)
  const [propertyValue, setPropertyValue] = useState<string>('')
  const { alert } = useConfirm();
  const [discountPercentage, setDiscountPercentage] = useState<string>('')

  const { data: feeCalculation, isLoading: calculating } = useCalculateFee(
    id,
    propertyValue
      ? {
          propertyValue: parseFloat(propertyValue),
          applyDiscount: !!discountPercentage,
          discountPercentage: discountPercentage
            ? parseFloat(discountPercentage)
            : undefined
        }
      : undefined
  )

  if (isLoading) {
    return <DetailPageSkeleton />
  }

  if (!transferType) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Transfer Type Not Found</CardTitle>
            <CardDescription>
              The requested transfer type does not exist or has been deleted.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/transfer-types')}>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Transfer Types
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='p-6'>
      <div className='flex justify-between items-start mb-6'>
        <Button variant='ghost' onClick={() => router.back()}>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back
        </Button>
        <Button onClick={() => router.push(`/transfer-types/edit/${id}`)}>
          <Edit className='mr-2 h-4 w-4' />
          Edit Transfer Type
        </Button>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Main Transfer Type Card */}
        <div className='lg:col-span-2'>
          <Card className='mb-6'>
            <CardHeader>
              <div className='flex justify-between items-start'>
                <div>
                  <CardTitle className='text-2xl'>
                    Transfer Type Details
                  </CardTitle>
                </div>
                <div className='flex gap-2'>
                  {transferType.isDeleted ? (
                    <Badge className='bg-red-100 text-red-800'>Deleted</Badge>
                  ) : (
                    <Badge
                      className={
                        transferType.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }
                    >
                      {transferType.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Basic Information */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-1'>
                  <div className='flex items-center gap-2 text-gray-500'>
                    <Tag className='h-4 w-4' />
                    <span className='text-sm font-medium'>Transfer Type</span>
                  </div>
                  <div className='text-lg font-semibold'>
                    {transferType.typeName}
                  </div>
                </div>

                <div className='space-y-1'>
                  <div className='flex items-center gap-2 text-gray-500'>
                    <DollarSign className='h-4 w-4' />
                    <span className='text-sm font-medium'>Standard Fee</span>
                  </div>
                  <div className='text-lg font-semibold text-green-600'>
                    Rs. {transferType.transferFee.toLocaleString()}
                  </div>
                </div>

                <div className='space-y-1'>
                  <div className='flex items-center gap-2 text-gray-500'>
                    <Activity className='h-4 w-4' />
                    <span className='text-sm font-medium'>Usage Count</span>
                  </div>
                  <div className='text-lg font-semibold'>
                    {transferType.transferCount || 0} transfers
                  </div>
                </div>

                <div className='space-y-1'>
                  <div className='flex items-center gap-2 text-gray-500'>
                    <FileText className='h-4 w-4' />
                    <span className='text-sm font-medium'>Status</span>
                  </div>
                  <div className='text-lg font-semibold'>
                    {transferType.isDeleted
                      ? 'Deleted'
                      : transferType.isActive
                      ? 'Active'
                      : 'Inactive'}
                  </div>
                </div>
              </div>

              {/* Description */}
              {transferType.description && (
                <div className='space-y-2'>
                  <div className='flex items-center gap-2 text-gray-500'>
                    <FileText className='h-4 w-4' />
                    <span className='text-sm font-medium'>Description</span>
                  </div>
                  <div className='p-4 bg-gray-50 rounded-lg'>
                    <p className='text-gray-800 whitespace-pre-wrap'>
                      {transferType.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Fee Calculator */}
              <div className='space-y-4'>
                <div className='flex items-center gap-2 text-gray-500'>
                  <Calculator className='h-4 w-4' />
                  <span className='text-sm font-medium'>Fee Calculator</span>
                </div>

                <Card>
                  <CardContent className='pt-4'>
                    <div className='space-y-4'>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                          <label className='text-sm font-medium mb-1 block'>
                            Property Value (Optional)
                          </label>
                          <input
                            type='number'
                            value={propertyValue}
                            onChange={e => setPropertyValue(e.target.value)}
                            placeholder='Enter property value'
                            className='w-full p-2 border rounded'
                            min='0'
                            step='1000'
                          />
                        </div>
                        <div>
                          <label className='text-sm font-medium mb-1 block'>
                            Discount % (Optional)
                          </label>
                          <input
                            type='number'
                            value={discountPercentage}
                            onChange={e =>
                              setDiscountPercentage(e.target.value)
                            }
                            placeholder='Discount percentage'
                            className='w-full p-2 border rounded'
                            min='0'
                            max='100'
                            step='0.1'
                          />
                        </div>
                      </div>

                      {feeCalculation && (
                        <div className='mt-4 p-4 bg-blue-50 rounded-lg'>
                          <h4 className='font-medium mb-2'>Fee Calculation</h4>
                          <div className='space-y-2'>
                            <div className='flex justify-between'>
                              <span className='text-gray-600'>Base Fee:</span>
                              <span className='font-medium'>
                                Rs. {feeCalculation.baseFee.toLocaleString()}
                              </span>
                            </div>
                            {feeCalculation.discountAmount > 0 && (
                              <div className='flex justify-between'>
                                <span className='text-gray-600'>Discount:</span>
                                <span className='font-medium text-red-600'>
                                  - Rs.{' '}
                                  {feeCalculation.discountAmount.toLocaleString()}
                                </span>
                              </div>
                            )}
                            <Separator />
                            <div className='flex justify-between'>
                              <span className='text-gray-600 font-medium'>
                                Total Fee:
                              </span>
                              <span className='font-bold text-lg text-green-600'>
                                Rs. {feeCalculation.totalFee.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {calculating && (
                        <div className='text-center py-4'>
                          <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto'></div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Created Information */}
              {transferType.createdBy && (
                <div className='space-y-2'>
                  <div className='flex items-center gap-2 text-gray-500'>
                    <User className='h-4 w-4' />
                    <span className='text-sm font-medium'>
                      Created Information
                    </span>
                  </div>
                  <div className='grid grid-cols-2 gap-4 pl-6'>
                    <div>
                      <div className='text-sm text-gray-600'>Created By</div>
                      <div className='font-medium'>
                        {transferType.createdBy.userName}
                        {transferType.createdBy.fullName &&
                          ` (${transferType.createdBy.fullName})`}
                      </div>
                    </div>
                    <div>
                      <div className='text-sm text-gray-600'>Created At</div>
                      <div className='font-medium'>
                        {formatDate(transferType.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Modified Information */}
              {transferType.modifiedBy && (
                <div className='space-y-2'>
                  <div className='flex items-center gap-2 text-gray-500'>
                    <User className='h-4 w-4' />
                    <span className='text-sm font-medium'>Last Modified</span>
                  </div>
                  <div className='grid grid-cols-2 gap-4 pl-6'>
                    <div>
                      <div className='text-sm text-gray-600'>Modified By</div>
                      <div className='font-medium'>
                        {transferType.modifiedBy.userName}
                        {transferType.modifiedBy.fullName &&
                          ` (${transferType.modifiedBy.fullName})`}
                      </div>
                    </div>
                    <div>
                      <div className='text-sm text-gray-600'>Modified At</div>
                      <div className='font-medium'>
                        {formatDate(transferType.updatedAt)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className='space-y-6'>
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <Button
                variant='outline'
                className='w-full justify-start'
                onClick={() => router.push(`/transfer-types/edit/${id}`)}
              >
                <Edit className='mr-2 h-4 w-4' />
                Edit Transfer Type
              </Button>
              <Button
                variant='outline'
                className='w-full justify-start'
                onClick={() => router.push('/transfer-types')}
              >
                <ArrowLeft className='mr-2 h-4 w-4' />
                Back to All Types
              </Button>
              <Button
                variant='outline'
                className='w-full justify-start'
                onClick={() => {
                  navigator.clipboard.writeText(transferType.typeName)
                  await alert({ description: 'Type name copied to clipboard!' })
                }}
              >
                <FileText className='mr-2 h-4 w-4' />
                Copy Type Name
              </Button>
            </CardContent>
          </Card>

          {/* Transfer Type Information */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Type Information</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 text-sm text-gray-600'>
              <div className='space-y-2'>
                <div className='font-medium'>Quick Stats:</div>
                <ul className='space-y-1'>
                  <li className='flex justify-between'>
                    <span>Type:</span>
                    <span className='font-medium'>{transferType.typeName}</span>
                  </li>
                  <li className='flex justify-between'>
                    <span>Fee:</span>
                    <span className='font-medium'>
                      Rs. {transferType.transferFee.toLocaleString()}
                    </span>
                  </li>
                  <li className='flex justify-between'>
                    <span>Status:</span>
                    <Badge
                      className={
                        transferType.isDeleted
                          ? 'bg-red-100 text-red-800'
                          : transferType.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }
                    >
                      {transferType.isDeleted
                        ? 'Deleted'
                        : transferType.isActive
                        ? 'Active'
                        : 'Inactive'}
                    </Badge>
                  </li>
                  <li className='flex justify-between'>
                    <span>Created:</span>
                    <span>{formatDate(transferType.createdAt)}</span>
                  </li>
                  <li className='flex justify-between'>
                    <span>Last Updated:</span>
                    <span>{formatDate(transferType.updatedAt)}</span>
                  </li>
                  {transferType.transferCount !== undefined && (
                    <li className='flex justify-between'>
                      <span>Times Used:</span>
                      <span className='font-medium'>
                        {transferType.transferCount}
                      </span>
                    </li>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Status Information */}
          {transferType.isDeleted && (
            <Card className='border-red-200 bg-red-50'>
              <CardHeader>
                <CardTitle className='text-lg text-red-800'>Archived</CardTitle>
              </CardHeader>
              <CardContent className='text-sm text-red-700'>
                This transfer type has been deleted and is archived in the
                system. It cannot be used for new transfers.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
