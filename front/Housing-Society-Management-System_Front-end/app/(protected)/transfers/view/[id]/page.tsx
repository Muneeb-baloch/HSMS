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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import { useTransferById } from '@/lib/hooks/entities/useTransfer'
import { useAuth } from '@/lib/hooks/useAuth'
import { formatDate } from '@/lib/utils/format'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  User,
  XCircle
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { DetailPageSkeleton } from '@/components/shared/PageSkeleton'

export default function ViewTransferPage () {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()

  const id = params.id as string
  const { data: transfer, isLoading } = useTransferById(id)

  const canUpdate =
    user &&
    hasPermission(
      user.role as UserRole,
      [UserRole.ADMIN, UserRole.SUPER_ADMIN] as UserRole[]
    )

  const canDelete =
    user &&
    hasPermission(
      user.role as UserRole,
      [UserRole.ADMIN, UserRole.SUPER_ADMIN] as UserRole[]
    )

  if (isLoading) {
    return <DetailPageSkeleton />
  }

  if (!transfer) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Transfer Not Found</CardTitle>
            <CardDescription>
              The transfer you&apos;re looking for doesn&apos;t exist.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/transfers')}>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Transfers
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Under Review': 'bg-blue-100 text-blue-800 border-blue-200',
      Approved: 'bg-purple-100 text-purple-800 border-purple-200',
      Rejected: 'bg-red-100 text-red-800 border-red-200',
      Completed: 'bg-green-100 text-green-800 border-green-200',
      Cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
      'On Hold': 'bg-orange-100 text-orange-800 border-orange-200',
      'Documents Required': 'bg-pink-100 text-pink-800 border-pink-200',
      'Fee Pending': 'bg-indigo-100 text-indigo-800 border-indigo-200'
    }

    const icons: Record<string, any> = {
      Pending: Clock,
      'Under Review': AlertCircle,
      Approved: CheckCircle,
      Rejected: XCircle,
      Completed: CheckCircle,
      Cancelled: XCircle,
      'On Hold': Clock,
      'Documents Required': AlertCircle,
      'Fee Pending': DollarSign
    }

    const Icon = icons[status] || Clock

    return (
      <Badge
        className={`${
          colors[status] || 'bg-gray-100'
        } border flex items-center gap-1`}
      >
        <Icon className='h-3 w-3' />
        {status}
      </Badge>
    )
  }

  const file = transfer.file ?? (typeof transfer.fileId === 'object' ? transfer.fileId : null)
  const transferType =
    transfer.transferType ?? (typeof transfer.transferTypeId === 'object' ? transfer.transferTypeId : null)
  const seller =
    transfer.seller ?? (typeof transfer.sellerMemId === 'object' ? transfer.sellerMemId : null)
  const buyer =
    transfer.buyer ?? (typeof transfer.buyerMemId === 'object' ? transfer.buyerMemId : null)
  const application =
    transfer.application ?? (transfer.applicationId && typeof transfer.applicationId === 'object'
      ? transfer.applicationId
      : null)

  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div>
          <Button
            variant='ghost'
            onClick={() => router.back()}
            className='mb-4'
          >
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back
          </Button>
          <div className='flex items-center gap-4'>
            <h1 className='text-3xl font-bold'>Transfer Details</h1>
            {getStatusBadge(transfer.status)}
          </div>
          <p className='text-muted-foreground'>
            Transfer of {file?.fileRegNo || 'File'} from{' '}
            {seller?.memName || 'Seller'} to {buyer?.memName || 'Buyer'}
          </p>
        </div>

        <div className='flex gap-2'>
          {canUpdate && (
            <Button asChild>
              <Link href={`/transfers/edit/${transfer._id}`}>
                Edit Transfer
              </Link>
            </Button>
          )}
          <Button variant='outline' asChild>
            <Link href='/transfers'>View All Transfers</Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue='details' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='details'>Transfer Details</TabsTrigger>
          <TabsTrigger value='parties'>Parties Involved</TabsTrigger>
          <TabsTrigger value='documents'>Documents</TabsTrigger>
          <TabsTrigger value='timeline'>Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value='details' className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {/* Basic Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <FileText className='h-5 w-5' />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div>
                  <p className='text-sm text-muted-foreground'>File Number</p>
                  <p className='font-medium'>{file?.fileRegNo || 'N/A'}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Transfer Type</p>
                  <p className='font-medium'>
                    {transferType?.typeName || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>
                    Initiation Date
                  </p>
                  <p className='font-medium'>
                    {formatDate(transfer.transferInitDate)}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>
                    Application No
                  </p>
                  <p className='font-medium'>
                    {application?.applicationNo || 'N/A'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Financial Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <DollarSign className='h-5 w-5' />
                  Financial Information
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div>
                  <p className='text-sm text-muted-foreground'>Transfer Fee</p>
                  <p className='font-medium'>
                    {transfer.transferFeeAmount
                      ? `Rs. ${transfer.transferFeeAmount.toLocaleString()}`
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Fee Status</p>
                  <Badge
                    variant={transfer.transferFeePaid ? 'default' : 'secondary'}
                  >
                    {transfer.transferFeePaid ? 'Paid' : 'Pending'}
                  </Badge>
                </div>
                {transfer.transferFeePaidDate && (
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      Fee Paid Date
                    </p>
                    <p className='font-medium'>
                      {formatDate(transfer.transferFeePaidDate)}
                    </p>
                  </div>
                )}
                <div>
                  <p className='text-sm text-muted-foreground'>
                    Documents Attached
                  </p>
                  <Badge
                    variant={transfer.transfIsAtt ? 'default' : 'secondary'}
                  >
                    {transfer.transfIsAtt ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Execution Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <CheckCircle className='h-5 w-5' />
                  Execution Details
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                {transfer.transferExecutionDate && (
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      Execution Date
                    </p>
                    <p className='font-medium'>
                      {formatDate(transfer.transferExecutionDate)}
                    </p>
                  </div>
                )}
                {transfer.officerName && (
                  <div>
                    <p className='text-sm text-muted-foreground'>Officer</p>
                    <p className='font-medium'>{transfer.officerName}</p>
                    {transfer.officerDesignation && (
                      <p className='text-sm text-muted-foreground'>
                        {transfer.officerDesignation}
                      </p>
                    )}
                  </div>
                )}
                {transfer.witness1Name && (
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      Primary Witness
                    </p>
                    <p className='font-medium'>{transfer.witness1Name}</p>
                    {transfer.witness1CNIC && (
                      <p className='text-sm text-muted-foreground'>
                        {transfer.witness1CNIC}
                      </p>
                    )}
                  </div>
                )}
                {transfer.witness2Name && (
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      Secondary Witness
                    </p>
                    <p className='font-medium'>{transfer.witness2Name}</p>
                    {transfer.witness2CNIC && (
                      <p className='text-sm text-muted-foreground'>
                        {transfer.witness2CNIC}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Remarks Card */}
          {transfer.remarks && (
            <Card>
              <CardHeader>
                <CardTitle>Remarks</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='whitespace-pre-wrap'>{transfer.remarks}</p>
              </CardContent>
            </Card>
          )}

          {/* Legal Review Notes */}
          {transfer.legalReviewNotes && (
            <Card>
              <CardHeader>
                <CardTitle>Legal Review Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='whitespace-pre-wrap'>
                  {transfer.legalReviewNotes}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Cancellation Reason */}
          {transfer.cancellationReason && (
            <Card className='border-red-200'>
              <CardHeader>
                <CardTitle className='text-red-700'>
                  Cancellation Reason
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='whitespace-pre-wrap'>
                  {transfer.cancellationReason}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value='parties' className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Seller Card */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <User className='h-5 w-5' />
                  Seller Information
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div>
                  <p className='text-sm text-muted-foreground'>Name</p>
                  <p className='font-medium'>{seller?.memName || 'N/A'}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>NIC</p>
                  <p className='font-medium'>{seller?.memNic || 'N/A'}</p>
                </div>
                {seller && (
                  <Button variant='outline' size='sm' asChild>
                    <Link href={`/members/view/${seller._id}`}>
                      View Member Details
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Buyer Card */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <User className='h-5 w-5' />
                  Buyer Information
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div>
                  <p className='text-sm text-muted-foreground'>Name</p>
                  <p className='font-medium'>{buyer?.memName || 'N/A'}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>NIC</p>
                  <p className='font-medium'>{buyer?.memNic || 'N/A'}</p>
                </div>
                {buyer && (
                  <Button variant='outline' size='sm' asChild>
                    <Link href={`/members/view/${buyer._id}`}>
                      View Member Details
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='documents' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Transfer Documents</CardTitle>
              <CardDescription>
                Documents related to this transfer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {transfer.ndcDocPath && (
                  <div className='flex items-center justify-between p-3 border rounded-lg'>
                    <div className='flex items-center gap-3'>
                      <FileText className='h-5 w-5 text-blue-500' />
                      <div>
                        <p className='font-medium'>NDC Document</p>
                        <p className='text-sm text-muted-foreground'>
                          No Demand Certificate
                        </p>
                      </div>
                    </div>
                    <Button size='sm' asChild>
                      <a
                        href={transfer.ndcDocPath}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        View Document
                      </a>
                    </Button>
                  </div>
                )}

                {transfer.transfClearanceCertPath && (
                  <div className='flex items-center justify-between p-3 border rounded-lg'>
                    <div className='flex items-center gap-3'>
                      <FileText className='h-5 w-5 text-green-500' />
                      <div>
                        <p className='font-medium'>Clearance Certificate</p>
                        <p className='text-sm text-muted-foreground'>
                          Society clearance certificate
                        </p>
                      </div>
                    </div>
                    <Button size='sm' asChild>
                      <a
                        href={transfer.transfClearanceCertPath}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        View Document
                      </a>
                    </Button>
                  </div>
                )}

                {!transfer.ndcDocPath && !transfer.transfClearanceCertPath && (
                  <p className='text-muted-foreground text-center py-8'>
                    No documents uploaded for this transfer
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='timeline' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Transfer Timeline</CardTitle>
              <CardDescription>
                History of actions on this transfer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {/* Created */}
                <div className='flex gap-4'>
                  <div className='flex flex-col items-center'>
                    <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                    <div className='w-px h-full bg-gray-200'></div>
                  </div>
                  <div>
                    <p className='font-medium'>Transfer Created</p>
                    <p className='text-sm text-muted-foreground'>
                      {formatDate(transfer.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Initiated */}
                <div className='flex gap-4'>
                  <div className='flex flex-col items-center'>
                    <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                    <div className='w-px h-full bg-gray-200'></div>
                  </div>
                  <div>
                    <p className='font-medium'>Transfer Initiated</p>
                    <p className='text-sm text-muted-foreground'>
                      {formatDate(transfer.transferInitDate)}
                    </p>
                  </div>
                </div>

                {/* Fee Payment */}
                {transfer.transferFeePaidDate && (
                  <div className='flex gap-4'>
                    <div className='flex flex-col items-center'>
                      <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                      <div className='w-px h-full bg-gray-200'></div>
                    </div>
                    <div>
                      <p className='font-medium'>Fee Paid</p>
                      <p className='text-sm text-muted-foreground'>
                        {formatDate(transfer.transferFeePaidDate)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Execution */}
                {transfer.transferExecutionDate && (
                  <div className='flex gap-4'>
                    <div className='flex flex-col items-center'>
                      <div className='w-2 h-2 bg-purple-500 rounded-full'></div>
                      <div className='w-px h-full bg-gray-200'></div>
                    </div>
                    <div>
                      <p className='font-medium'>Transfer Executed</p>
                      <p className='text-sm text-muted-foreground'>
                        {formatDate(transfer.transferExecutionDate)}
                      </p>
                      {transfer.officerName && (
                        <p className='text-sm text-muted-foreground'>
                          By {transfer.officerName}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Last Updated */}
                {transfer.updatedAt &&
                  transfer.updatedAt !== transfer.createdAt && (
                    <div className='flex gap-4'>
                      <div className='flex flex-col items-center'>
                        <div className='w-2 h-2 bg-gray-400 rounded-full'></div>
                      </div>
                      <div>
                        <p className='font-medium'>Last Updated</p>
                        <p className='text-sm text-muted-foreground'>
                          {formatDate(transfer.updatedAt)}
                        </p>
                      </div>
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm'>
            <div>
              <p className='text-muted-foreground'>Transfer ID</p>
              <p className='font-mono'>{transfer._id.slice(-8)}</p>
            </div>
            <div>
              <p className='text-muted-foreground'>Created</p>
              <p>{formatDate(transfer.createdAt)}</p>
            </div>
            <div>
              <p className='text-muted-foreground'>Last Updated</p>
              <p>{formatDate(transfer.updatedAt)}</p>
            </div>
            <div>
              <p className='text-muted-foreground'>Status</p>
              <div>{getStatusBadge(transfer.status)}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
