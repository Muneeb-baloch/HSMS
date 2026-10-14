// src/app/(dashboard)/files/[id]/page.tsx
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
import { useFile } from '@/lib/hooks/entities/useFile'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { formatPlotType } from '@/lib/utils/plotUtils'
import {
  ArrowLeft,
  Barcode,
  Building,
  Calendar,
  DollarSign,
  Edit,
  FileText,
  MapPin,
  Tag,
  User,
  UserCircle
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { DetailPageSkeleton } from '@/components/shared/PageSkeleton'

export default function ViewFilePage () {
  const router = useRouter()
  const params = useParams()

  const id = params.id as string
  const { data: file, isLoading } = useFile(id)
  if (isLoading) {
    return <DetailPageSkeleton />
  }

  if (!file) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>File Not Found</CardTitle>
            <CardDescription>
              The requested file does not exist or has been deleted.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/file')}>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Files
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getStatusColor = (status: string, isActive: boolean) => {
    if (!isActive) return 'bg-gray-100 text-gray-800'
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'Cancelled':
        return 'bg-red-100 text-red-800'
      case 'Closed':
        return 'bg-blue-100 text-blue-800'
      case 'Transferred':
        return 'bg-purple-100 text-purple-800'
      case 'Disputed':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className='p-6'>
      <div className='flex justify-between items-start mb-6'>
        <Button variant='ghost' onClick={() => router.back()}>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back
        </Button>
        <Button onClick={() => router.push(`/file/${id}/edit`)}>
          <Edit className='mr-2 h-4 w-4' />
          Edit File
        </Button>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Main File Card */}
        <div className='lg:col-span-2'>
          <Card className='mb-6'>
            <CardHeader>
              <div className='flex justify-between items-start'>
                <div>
                  <CardTitle className='text-2xl'>
                    File #{file.fileRegNo}
                  </CardTitle>
                  <CardDescription className='mt-2'>
                    {file.project?.projName ||
                      (typeof file.plot?.projectId === 'object'
                        ? file.plot?.projectId?.projName
                        : '') ||
                      'Unknown'}
                  </CardDescription>
                </div>
                <div className='flex gap-2'>
                  <Badge className={getStatusColor(file.status, file.isActive)}>
                    {file.status}
                  </Badge>
                  {!file.isActive && (
                    <Badge className='bg-gray-100 text-gray-800'>
                      Inactive
                    </Badge>
                  )}
                  {file.isDeleted && (
                    <Badge className='bg-red-100 text-red-800'>Deleted</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* File Information */}
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold'>File Details</h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-gray-500'>
                      <Barcode className='h-4 w-4' />
                      <span className='text-sm font-medium'>
                        File Registration
                      </span>
                    </div>
                    <div className='pl-6'>
                      <div className='font-medium font-mono'>
                        {file.fileRegNo}
                      </div>
                      {file.fileBarCode && (
                        <div className='text-sm text-gray-600'>
                          Barcode: {file.fileBarCode}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-gray-500'>
                      <FileText className='h-4 w-4' />
                      <span className='text-sm font-medium'>Installment Plan</span>
                    </div>
                    <div className='pl-6'>
                      <div className='font-medium'>
                        {file.plan?.planName || 'N/A'}
                      </div>
                      {file.plan && (
                        <div className='text-sm text-gray-600'>
                          {file.plan.totalMonths} months · Contract price{' '}
                          {formatCurrency(file.contractPrice)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-gray-500'>
                      <Building className='h-4 w-4' />
                      <span className='text-sm font-medium'>Project</span>
                    </div>
                    <div className='pl-6'>
                      <div className='font-medium'>
                        {typeof file.plot?.projectId === 'object'
                          ? file.plot?.projectId?.projName
                          : file.plot?.projectId || 'Unknown'}
                      </div>
                      {typeof file.plot?.projectId === 'object' &&
                        file.plot?.projectId?.projCode && (
                          <div className='text-sm text-gray-600'>
                            Code: {file.plot?.projectId?.projCode}
                          </div>
                        )}
                      {typeof file.plot?.projectId !== 'object' &&
                        file.plot?.projectId && (
                          <div className='text-sm text-gray-600'>
                            ID: {file.plot?.projectId}
                          </div>
                        )}
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-gray-500'>
                      <Calendar className='h-4 w-4' />
                      <span className='text-sm font-medium'>Booking Date</span>
                    </div>
                    <div className='pl-6'>
                      <div className='font-medium'>
                        {formatDate(file.bookingDate)}
                      </div>
                      {file.fileAge && (
                        <div className='text-sm text-gray-600'>
                          Age: {file.fileAge} days
                        </div>
                      )}
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-gray-500'>
                      <Tag className='h-4 w-4' />
                      <span className='text-sm font-medium'>Status</span>
                    </div>
                    <div className='pl-6'>
                      <Badge
                        className={getStatusColor(file.status, file.isActive)}
                      >
                        {file.status}
                      </Badge>
                      {file.isAdjusted && (
                        <div className='text-sm text-gray-600 mt-1'>
                          Adjusted: {file.adjustmentRef || 'Yes'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-gray-500'>
                  <DollarSign className='h-4 w-4' />
                  <span className='text-sm font-medium'>
                    Financial Information
                  </span>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 pl-6'>
                  <div>
                    <div className='text-sm text-gray-600'>Contract Price</div>
                    <div className='font-medium text-lg'>
                      {formatCurrency(file.contractPrice)}
                    </div>
                  </div>
                  {/* Only shown when the plan actually has a down-payment
                      category — this is the exact anomaly the fix addresses:
                      a plan with no down payment component shouldn't show one.
                      The badge reflects how much of the down-payment row has
                      actually been collected (driven by its amountPaid). */}
                  {!!file.downPayment && (
                    <div>
                      <div className='text-sm text-gray-600'>Down Payment</div>
                      <div className='font-medium flex items-center gap-2'>
                        {formatCurrency(file.downPayment)}
                        {file.downPaymentStatus === 'paid' && (
                          <Badge className='bg-green-100 text-green-800'>Paid</Badge>
                        )}
                        {file.downPaymentStatus === 'partial' && (
                          <Badge className='bg-blue-100 text-blue-800'>
                            Partial ({formatCurrency(file.downPaymentPaid)})
                          </Badge>
                        )}
                        {file.downPaymentStatus === 'unpaid' && (
                          <Badge className='bg-yellow-100 text-yellow-800'>Unpaid</Badge>
                        )}
                      </div>
                    </div>
                  )}
                  <div>
                    <div className='text-sm text-gray-600'>Plot Balance</div>
                    <div className='font-medium'>
                      {formatCurrency(file.plotBalance ?? file.balanceAmount)}
                    </div>
                  </div>
                  {/* Only shown when it differs from the plot balance — i.e. the
                      file has possession/legal/other fee rows on the ledger.
                      These are real charges but not part of the plot price, so
                      paying one must not move Plot Balance (see totalOutstanding
                      vs plotBalance split in attachFinancials). */}
                  {file.totalOutstanding !== undefined &&
                    file.totalOutstanding !== (file.plotBalance ?? file.balanceAmount) && (
                      <div>
                        <div className='text-sm text-gray-600'>
                          Total Outstanding (incl. fees)
                        </div>
                        <div className='font-medium'>
                          {formatCurrency(file.totalOutstanding)}
                        </div>
                      </div>
                    )}
                  <div>
                    <div className='text-sm text-gray-600'>Payment Mode</div>
                    <div className='font-medium'>{file.paymentMode}</div>
                  </div>
                  {!!file.paymentPercentage && (
                    <div>
                      <div className='text-sm text-gray-600'>
                        Payment Percentage
                      </div>
                      <div className='font-medium'>
                        {file.paymentPercentage}%
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Member Information */}
              {file.member && (
                <div className='space-y-2'>
                  <div className='flex items-center gap-2 text-gray-500'>
                    <UserCircle className='h-4 w-4' />
                    <span className='text-sm font-medium'>
                      Member Information
                    </span>
                  </div>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4 pl-6'>
                    <div>
                      <div className='text-sm text-gray-600'>Member Name</div>
                      <div className='font-medium'>{file.member?.memName}</div>
                    </div>
                    <div>
                      <div className='text-sm text-gray-600'>NIC Number</div>
                      <div className='font-medium'>{file.member?.memNic}</div>
                    </div>
                    {file.member?.memRegNo && (
                      <div>
                        <div className='text-sm text-gray-600'>
                          Registration No
                        </div>
                        <div className='font-medium'>
                          {file.member.memRegNo}
                        </div>
                      </div>
                    )}
                    {file.member?.mobileNo && (
                      <div>
                        <div className='text-sm text-gray-600'>
                          Contact Mobile
                        </div>
                        <div className='font-medium'>
                          {file.member.mobileNo}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Nominee Information */}
              {file.nominee && (
                <div className='space-y-2'>
                  <div className='flex items-center gap-2 text-gray-500'>
                    <User className='h-4 w-4' />
                    <span className='text-sm font-medium'>
                      Nominee Information
                    </span>
                  </div>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4 pl-6'>
                    <div>
                      <div className='text-sm text-gray-600'>Nominee Name</div>
                      <div className='font-medium'>
                        {file.nominee?.nomineeName}
                      </div>
                    </div>
                    <div>
                      <div className='text-sm text-gray-600'>CNIC</div>
                      <div className='font-medium'>
                        {file.nominee?.nomineeCNIC}
                      </div>
                    </div>
                    <div>
                      <div className='text-sm text-gray-600'>Contact</div>
                      <div className='font-medium'>
                        {file.nominee?.nomineeContact}
                      </div>
                    </div>
                    <div>
                      <div className='text-sm text-gray-600'>Relationship</div>
                      <div className='font-medium'>
                        {file.nominee?.relationWithMember}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Plot Information */}
              {file.plot && (
                <div className='space-y-2'>
                  <div className='flex items-center gap-2 text-gray-500'>
                    <MapPin className='h-4 w-4' />
                    <span className='text-sm font-medium'>
                      Plot Information
                    </span>
                  </div>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4 pl-6'>
                    <div>
                      <div className='text-sm text-gray-600'>Plot Number</div>
                      <div className='font-medium'>{file.plot?.plotNo}</div>
                    </div>
                    <div>
                      <div className='text-sm text-gray-600'>Plot Area</div>
                      <div className='font-medium'>
                        {file.plot?.formattedArea}
                      </div>
                    </div>
                    <div>
                      <div className='text-sm text-gray-600'>Block</div>
                      <div className='font-medium'>
                        {file.plot?.plotBlockId?.plotBlockName}
                      </div>
                    </div>
                    <div>
                      <div className='text-sm text-gray-600'>Category</div>
                      <div className='font-medium'>
                        {file.plot?.plotCategoryId?.categoryName}
                      </div>
                    </div>
                    <div>
                      <div className='text-sm text-gray-600'>Size</div>
                      <div className='font-medium'>
                        {file.plot?.plotSizeId?.plotSizeName}
                      </div>
                    </div>
                    <div>
                      <div className='text-sm text-gray-600'>Type</div>
                      <div className='font-medium'>
                        {formatPlotType(file.plot?.plotType)}
                      </div>
                    </div>
                    <div>
                      <div className='text-sm text-gray-600'>Dimensions</div>
                      <div className='font-medium'>
                        {file.plot?.plotDimensions}
                      </div>
                    </div>
                    <div>
                      <div className='text-sm text-gray-600'>Price</div>
                      <div className='font-medium'>
                        {file.plot?.formattedTotalAmount}
                      </div>
                    </div>
                    <div>
                      <div className='text-sm text-gray-600'>
                        Registration No
                      </div>
                      <div className='font-medium'>
                        {file.plot?.plotRegistrationNo}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Application Information */}
              {file.application && (
                <div className='space-y-2'>
                  <div className='flex items-center gap-2 text-gray-500'>
                    <FileText className='h-4 w-4' />
                    <span className='text-sm font-medium'>
                      Application Information
                    </span>
                  </div>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4 pl-6'>
                    <div>
                      <div className='text-sm text-gray-600'>
                        Application No
                      </div>
                      <div className='font-medium'>
                        {file.application?.applicationNo}
                      </div>
                    </div>
                    <div>
                      <div className='text-sm text-gray-600'>
                        Application Date
                      </div>
                      <div className='font-medium'>
                        {formatDate(file.application?.applicationDate)}
                      </div>
                    </div>
                    <div>
                      <div className='text-sm text-gray-600'>Status</div>
                      <div className='font-medium'>
                        {file.application?.statusId?.statusName ||
                          file.application?.status}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Dates Information */}
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-gray-500'>
                  <Calendar className='h-4 w-4' />
                  <span className='text-sm font-medium'>Dates Information</span>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 pl-6'>
                  <div>
                    <div className='text-sm text-gray-600'>Booking Date</div>
                    <div className='font-medium'>
                      {formatDate(file.bookingDate)}
                    </div>
                  </div>
                  {file.expectedCompletionDate && (
                    <div>
                      <div className='text-sm text-gray-600'>
                        Expected Completion
                      </div>
                      <div className='font-medium'>
                        {formatDate(file.expectedCompletionDate)}
                      </div>
                    </div>
                  )}
                  {file.actualCompletionDate && (
                    <div>
                      <div className='text-sm text-gray-600'>
                        Actual Completion
                      </div>
                      <div className='font-medium'>
                        {formatDate(file.actualCompletionDate)}
                      </div>
                    </div>
                  )}
                  {file.cancellationDate && (
                    <div>
                      <div className='text-sm text-gray-600'>
                        Cancellation Date
                      </div>
                      <div className='font-medium text-red-600'>
                        {formatDate(file.cancellationDate)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Remarks */}
              {file.fileRemarks && (
                <div className='space-y-2'>
                  <div className='flex items-center gap-2 text-gray-500'>
                    <FileText className='h-4 w-4' />
                    <span className='text-sm font-medium'>Remarks</span>
                  </div>
                  <div className='p-4 bg-gray-50 rounded-lg pl-6'>
                    <p className='text-gray-800 whitespace-pre-wrap'>
                      {file.fileRemarks}
                    </p>
                  </div>
                </div>
              )}

              {/* Cancellation Reason */}
              {file.cancellationReason && (
                <div className='space-y-2'>
                  <div className='flex items-center gap-2 text-gray-500'>
                    <FileText className='h-4 w-4' />
                    <span className='text-sm font-medium'>
                      Cancellation Reason
                    </span>
                  </div>
                  <div className='p-4 bg-red-50 border border-red-200 rounded-lg pl-6'>
                    <p className='text-red-800 whitespace-pre-wrap'>
                      {file.cancellationReason}
                    </p>
                  </div>
                </div>
              )}

              {/* Created Information */}
              {file.createdBy && (
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
                        {file.createdBy.firstName} {file.createdBy.lastName}
                      </div>
                      <div className='text-sm text-gray-500'>
                        {file.createdBy.email}
                      </div>
                    </div>
                    <div>
                      <div className='text-sm text-gray-600'>Created Date</div>
                      <div className='font-medium'>
                        {formatDate(file.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Updated Information */}
              {file.updatedBy && (
                <div className='space-y-2'>
                  <div className='flex items-center gap-2 text-gray-500'>
                    <User className='h-4 w-4' />
                    <span className='text-sm font-medium'>
                      Updated Information
                    </span>
                  </div>
                  <div className='grid grid-cols-2 gap-4 pl-6'>
                    <div>
                      <div className='text-sm text-gray-600'>Updated By</div>
                      <div className='font-medium'>
                        {file.updatedBy.firstName} {file.updatedBy.lastName}
                      </div>
                      <div className='text-sm text-gray-500'>
                        {file.updatedBy.email}
                      </div>
                    </div>
                    <div>
                      <div className='text-sm text-gray-600'>Updated Date</div>
                      <div className='font-medium'>
                        {formatDate(file.updatedAt)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Deleted Information */}
              {file.isDeleted && (
                <div className='space-y-2'>
                  <div className='flex items-center gap-2 text-gray-500'>
                    <FileText className='h-4 w-4' />
                    <span className='text-sm font-medium'>
                      Status Information
                    </span>
                  </div>
                  <div className='p-4 bg-red-50 border border-red-200 rounded-lg pl-6'>
                    <div className='text-sm text-red-600'>
                      This file has been deleted and is archived in the system.
                      {file.deletedAt && (
                        <span> Deleted on: {formatDate(file.deletedAt)}</span>
                      )}
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
                onClick={() => router.push(`/file/${id}/edit`)}
              >
                <Edit className='mr-2 h-4 w-4' />
                Edit File
              </Button>
              {file.project || file.plot?.projectId ? (
                <Button
                  variant='outline'
                  className='w-full justify-start'
                  onClick={() =>
                    router.push(
                      `/file?projId=${
                        file.project?.id ||
                        (typeof file.plot?.projectId === 'object'
                          ? file.plot?.projectId?.id
                          : file.plot?.projectId)
                      }`
                    )
                  }
                >
                  <FileText className='mr-2 h-4 w-4' />
                  View Similar Files
                </Button>
              ) : null}
              {file.member && (
                <Button
                  variant='outline'
                  className='w-full justify-start'
                  onClick={() => router.push(`/members/${file.member?.id}`)}
                >
                  <UserCircle className='mr-2 h-4 w-4' />
                  View Member Profile
                </Button>
              )}
              <Button
                variant='outline'
                className='w-full justify-start'
                onClick={() => router.push('/file')}
              >
                <ArrowLeft className='mr-2 h-4 w-4' />
                Back to All Files
              </Button>
            </CardContent>
          </Card>

          {/* File Summary */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>File Summary</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 text-sm text-gray-600'>
              <div className='space-y-2'>
                <ul className='space-y-1'>
                  <li className='flex justify-between'>
                    <span>File No:</span>
                    <span className='font-mono font-medium'>
                      {file.fileRegNo}
                    </span>
                  </li>
                  <li className='flex justify-between'>
                    <span>Barcode:</span>
                    <span className='font-mono font-medium'>
                      {file.fileBarCode}
                    </span>
                  </li>
                  <li className='flex justify-between'>
                    <span>Project:</span>
                    <span className='font-medium'>
                      {file.project?.projName ||
                        (typeof file.plot?.projectId === 'object'
                          ? file.plot?.projectId?.projName
                          : 'Unknown')}
                    </span>
                  </li>
                  <li className='flex justify-between'>
                    <span>Member:</span>
                    <span className='font-medium truncate max-w-[150px]'>
                      {file.member?.memName || 'Unknown'}
                    </span>
                  </li>
                  <li className='flex justify-between'>
                    <span>Booking Date:</span>
                    <span>{formatDate(file.bookingDate)}</span>
                  </li>
                  <li className='flex justify-between'>
                    <span>Status:</span>
                    <Badge
                      className={getStatusColor(file.status, file.isActive)}
                    >
                      {file.status}
                    </Badge>
                  </li>
                  <li className='flex justify-between'>
                    <span>Contract Price:</span>
                    <span className='font-medium'>
                      {formatCurrency(file.contractPrice)}
                    </span>
                  </li>
                  {!!file.downPayment && (
                    <li className='flex justify-between'>
                      <span>Down Payment:</span>
                      <span className='font-medium'>
                        {formatCurrency(file.downPayment)}
                      </span>
                    </li>
                  )}
                  <li className='flex justify-between'>
                    <span>Balance:</span>
                    <span className='font-medium'>
                      {formatCurrency(file.balanceAmount)}
                    </span>
                  </li>
                  <li className='flex justify-between'>
                    <span>Payment Mode:</span>
                    <span>{file.paymentMode}</span>
                  </li>
                  <li className='flex justify-between'>
                    <span>Created:</span>
                    <span>{formatDate(file.createdAt)}</span>
                  </li>
                  <li className='flex justify-between'>
                    <span>Last Updated:</span>
                    <span>{formatDate(file.updatedAt)}</span>
                  </li>
                  {file.isDeleted && file.deletedAt && (
                    <li className='flex justify-between'>
                      <span>Deleted:</span>
                      <span className='text-red-600'>
                        {formatDate(file.deletedAt)}
                      </span>
                    </li>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
