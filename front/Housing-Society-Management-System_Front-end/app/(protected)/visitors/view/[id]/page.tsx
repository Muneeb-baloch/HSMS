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
import { Skeleton } from '@/components/ui/skeleton'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import {
  useVisitor,
  useCheckInVisitor,
  useCheckOutVisitor,
  useCancelVisit
} from '@/lib/hooks/entities/useVisitor'
import { useAuth } from '@/lib/hooks/useAuth'
import { formatDate } from '@/lib/utils/format'
import { customToast } from '@/lib/utils/customToast'
import {
  ArrowLeft,
  Car,
  Clock,
  KeyRound,
  Phone,
  User,
  Users,
  CalendarDays,
  FileText
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useConfirm } from "@/components/shared/ConfirmDialog";

const getStatusVariant = (
  status: string
): 'default' | 'secondary' | 'destructive' | 'success' | 'warning' => {
  switch (status) {
    case 'expected':
      return 'warning'
    case 'checked_in':
      return 'success'
    case 'checked_out':
      return 'default'
    case 'cancelled':
      return 'destructive'
    default:
      return 'secondary'
  }
}

export default function ViewVisitorPage () {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const { confirm } = useConfirm();

  const id = params.id as string
  const { data: visitor, isLoading, error } = useVisitor(id)
  const checkInMutation = useCheckInVisitor()
  const checkOutMutation = useCheckOutVisitor()
  const cancelMutation = useCancelVisit()

  const canManage =
    user &&
    hasPermission(user.role as UserRole, [
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN
    ])

  const handleCheckIn = async () => {
    try {
      await checkInMutation.mutateAsync({ id })
      customToast.success('Visitor checked in successfully')
    } catch {
      customToast.error('Failed to check in visitor')
    }
  }

  const handleCheckOut = async () => {
    try {
      await checkOutMutation.mutateAsync({ id })
      customToast.success('Visitor checked out successfully')
    } catch {
      customToast.error('Failed to check out visitor')
    }
  }

  const handleCancel = async () => {
    if (await confirm({ title: "Cancel", description: 'Are you sure you want to cancel this visitor pass?' })) {
      try {
        await cancelMutation.mutateAsync(id)
        customToast.success('Visitor pass cancelled')
      } catch {
        customToast.error('Failed to cancel visitor pass')
      }
    }
  }

  if (isLoading) {
    return (
      <div className='p-6'>
        <div className='space-y-4'>
          <Skeleton className='h-8 w-48' />
          <Skeleton className='h-4 w-96' />
          <Skeleton className='h-[400px] w-full' />
        </div>
      </div>
    )
  }

  if (error || !visitor) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Visitor Not Found</CardTitle>
            <CardDescription>
              The visitor record you&apos;re looking for doesn&apos;t exist or
              you don&apos;t have permission to view it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/visitors')}>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Visitors
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const host =
    typeof visitor.hostMemberId === 'object' ? visitor.hostMemberId : null

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
          <h1 className='text-3xl font-bold'>Visitor Details</h1>
          <p className='text-muted-foreground'>
            Complete information about {visitor.visitorName}
          </p>
        </div>

        <div className='flex gap-2'>
          <Button variant='outline' asChild>
            <Link href='/visitors'>View All Visitors</Link>
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Left Column: Details */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Pass Code Card - Prominent */}
          <Card className='border-2 border-primary/20 bg-primary/5'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <KeyRound className='h-5 w-5' />
                Visitor Pass
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-muted-foreground'>Pass Code</p>
                  <p className='text-4xl font-mono font-bold tracking-widest'>
                    {visitor.passCode || 'N/A'}
                  </p>
                </div>
                <Badge
                  variant={getStatusVariant(visitor.status)}
                  className='text-lg px-4 py-2'
                >
                  {visitor.status?.replace(/_/g, ' ').toUpperCase()}
                </Badge>
              </div>
              {visitor.qrCodeData && (
                <div className='mt-4 p-4 bg-white rounded-lg inline-block'>
                  <p className='text-xs text-muted-foreground mb-1'>
                    QR Code Data
                  </p>
                  <p className='font-mono text-sm break-all'>
                    {visitor.qrCodeData}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Visitor Information */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <User className='h-5 w-5' />
                Visitor Information
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-muted-foreground'>Visitor Name</p>
                  <p className='font-medium'>{visitor.visitorName}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Phone</p>
                  <p className='font-medium flex items-center gap-1'>
                    <Phone className='h-3 w-3' />
                    {visitor.visitorPhone || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Purpose</p>
                  <p className='font-medium capitalize'>
                    {visitor.purpose?.replace(/_/g, ' ') || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>
                    Number of Guests
                  </p>
                  <p className='font-medium flex items-center gap-1'>
                    <Users className='h-3 w-3' />
                    {visitor.numberOfGuests || 1}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedule Information */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <CalendarDays className='h-5 w-5' />
                Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-muted-foreground'>Expected Date</p>
                  <p className='font-medium'>
                    {formatDate(visitor.expectedDate)}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>
                    Expected Time In
                  </p>
                  <p className='font-medium'>
                    {visitor.expectedTimeIn || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>
                    Expected Time Out
                  </p>
                  <p className='font-medium'>
                    {visitor.expectedTimeOut || 'N/A'}
                  </p>
                </div>
                {visitor.actualCheckIn && (
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      Actual Check-In
                    </p>
                    <p className='font-medium text-green-600'>
                      {formatDate(visitor.actualCheckIn)}
                    </p>
                  </div>
                )}
                {visitor.actualCheckOut && (
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      Actual Check-Out
                    </p>
                    <p className='font-medium text-blue-600'>
                      {formatDate(visitor.actualCheckOut)}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Information */}
          {(visitor.vehicleNumber || visitor.vehicleType) && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Car className='h-5 w-5' />
                  Vehicle Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      Vehicle Number
                    </p>
                    <p className='font-medium'>
                      {visitor.vehicleNumber || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      Vehicle Type
                    </p>
                    <p className='font-medium capitalize'>
                      {visitor.vehicleType || 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Remarks */}
          {visitor.remarks && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <FileText className='h-5 w-5' />
                  Remarks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='whitespace-pre-wrap'>{visitor.remarks}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Status, Host & Actions */}
        <div className='space-y-6'>
          {/* Host Card */}
          <Card>
            <CardHeader>
              <CardTitle>Host Member</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              {host ? (
                <>
                  <div>
                    <p className='text-sm text-muted-foreground'>Name</p>
                    <p className='font-medium'>{host.memName}</p>
                  </div>
                  {host.memContMob && (
                    <div>
                      <p className='text-sm text-muted-foreground'>Contact</p>
                      <p className='font-medium'>{host.memContMob}</p>
                    </div>
                  )}
                </>
              ) : (
                <p className='text-muted-foreground'>No host assigned</p>
              )}
            </CardContent>
          </Card>

          {/* Event Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Clock className='h-5 w-5' />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='flex items-start gap-3'>
                  <div className='w-2 h-2 mt-2 rounded-full bg-blue-500' />
                  <div>
                    <p className='text-sm font-medium'>Created</p>
                    <p className='text-xs text-muted-foreground'>
                      {formatDate(visitor.createdAt)}
                    </p>
                  </div>
                </div>
                {visitor.actualCheckIn && (
                  <div className='flex items-start gap-3'>
                    <div className='w-2 h-2 mt-2 rounded-full bg-green-500' />
                    <div>
                      <p className='text-sm font-medium'>Checked In</p>
                      <p className='text-xs text-muted-foreground'>
                        {formatDate(visitor.actualCheckIn)}
                      </p>
                    </div>
                  </div>
                )}
                {visitor.actualCheckOut && (
                  <div className='flex items-start gap-3'>
                    <div className='w-2 h-2 mt-2 rounded-full bg-gray-500' />
                    <div>
                      <p className='text-sm font-medium'>Checked Out</p>
                      <p className='text-xs text-muted-foreground'>
                        {formatDate(visitor.actualCheckOut)}
                      </p>
                    </div>
                  </div>
                )}
                {visitor.status === 'cancelled' && (
                  <div className='flex items-start gap-3'>
                    <div className='w-2 h-2 mt-2 rounded-full bg-red-500' />
                    <div>
                      <p className='text-sm font-medium'>Cancelled</p>
                      <p className='text-xs text-muted-foreground'>
                        {formatDate(visitor.updatedAt)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          {canManage && (
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                {visitor.status === 'expected' && (
                  <Button
                    className='w-full'
                    onClick={handleCheckIn}
                    disabled={checkInMutation.isPending}
                  >
                    Check In Visitor
                  </Button>
                )}
                {visitor.status === 'checked_in' && (
                  <Button
                    className='w-full'
                    onClick={handleCheckOut}
                    disabled={checkOutMutation.isPending}
                  >
                    Check Out Visitor
                  </Button>
                )}
                {(visitor.status === 'expected' ||
                  visitor.status === 'checked_in') && (
                  <Button
                    variant='outline'
                    className='w-full text-red-600 hover:text-red-700'
                    onClick={handleCancel}
                    disabled={cancelMutation.isPending}
                  >
                    Cancel Pass
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Visitor ID:</span>
                <span className='font-mono'>{visitor._id.slice(-8)}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Created:</span>
                <span>{formatDate(visitor.createdAt)}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Last Updated:</span>
                <span>{formatDate(visitor.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
