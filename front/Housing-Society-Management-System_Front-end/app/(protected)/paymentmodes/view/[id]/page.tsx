// src/app/(dashboard)/paymentmodes/view/[id]/page.tsx
'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { hasPermission, UserRole as UserRoleEnum } from '@/lib/constants/roles'
import { usePaymentMode } from '@/lib/hooks/entities/usePaymentMode'
import { useAuth } from '@/lib/hooks/useAuth'
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Edit,
  History,
  Info,
  User,
  Wallet
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { DetailPageSkeleton } from '@/components/shared/PageSkeleton'

interface ViewPaymentModePageProps {
  params: {
    id: string
  }
}

export default function ViewPaymentModePage ({
  params
}: ViewPaymentModePageProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { id } = params

  const { data: paymentMode, isLoading, error } = usePaymentMode(id)

  const canUpdate =
    user &&
    hasPermission(
      user.role as UserRoleEnum,
      [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN] as UserRoleEnum[]
    )

  if (isLoading) {
    return <DetailPageSkeleton />
  }

  if (error || !paymentMode) {
    return (
      <div className='space-y-1'>
        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => router.back()}
            className='mb-4'
          >
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-center py-8'>
              <h3 className='text-lg font-medium mb-2'>
                Payment Mode Not Found
              </h3>
              <p className='text-muted-foreground'>
                The payment mode you&apos;re trying to view doesn&apos;t exist.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getPaymentModeIcon = () => {
    switch (paymentMode.paymentModeName.toLowerCase()) {
      case 'cash':
        return <Wallet className='h-5 w-5 text-green-600' />
      case 'bank transfer':
        return <CreditCard className='h-5 w-5 text-blue-600' />
      case 'check':
        return <CreditCard className='h-5 w-5 text-purple-600' />
      case 'p/0':
        return <CreditCard className='h-5 w-5 text-orange-600' />
      default:
        return <Wallet className='h-5 w-5 text-gray-600' />
    }
  }

  return (
    <div className='space-y-1'>
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-2'>
          <Button variant='ghost' size='sm' onClick={() => router.back()}>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back
          </Button>
        </div>
        {canUpdate && (
          <Button
            onClick={() => router.push(`/paymentmodes/edit/${id}`)}
            variant='outline'
            size='sm'
          >
            <Edit className='mr-2 h-4 w-4' />
            Edit Payment Mode
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className='flex items-start justify-between'>
            <div className='flex items-center gap-4'>
              <div className='p-3 bg-gray-100 rounded-lg'>
                {getPaymentModeIcon()}
              </div>
              <div>
                <CardTitle className='text-2xl'>
                  {paymentMode.paymentModeName}
                </CardTitle>
                <div className='flex items-center gap-2 mt-2'>
                  <Badge
                    className={
                      paymentMode.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }
                  >
                    {paymentMode.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge variant='outline' className='bg-blue-50 text-blue-700'>
                    Payment Mode
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Description */}
          {paymentMode.description && (
            <div>
              <h3 className='text-lg font-medium mb-2 flex items-center gap-2'>
                <Info className='h-4 w-4' />
                Description
              </h3>
              <p className='text-muted-foreground'>{paymentMode.description}</p>
            </div>
          )}

          <Separator />

          {/* Payment Mode Details */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-4'>
              <h3 className='text-lg font-medium'>Payment Mode Information</h3>

              <div className='space-y-3'>
                <div className='flex items-center gap-2'>
                  <Wallet className='h-4 w-4 text-muted-foreground' />
                  <div>
                    <div className='text-sm text-muted-foreground'>
                      Payment Type
                    </div>
                    <div className='font-medium'>
                      {paymentMode.paymentModeName}
                    </div>
                  </div>
                </div>

                <div className='flex items-center gap-2'>
                  <History className='h-4 w-4 text-muted-foreground' />
                  <div>
                    <div className='text-sm text-muted-foreground'>
                      Last Modified
                    </div>
                    <div className='font-medium'>
                      {paymentMode.modifiedOn
                        ? new Date(paymentMode.modifiedOn).toLocaleDateString()
                        : 'Never modified'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='space-y-4'>
              <h3 className='text-lg font-medium'>Timestamps</h3>

              <div className='space-y-3'>
                <div className='flex items-center gap-2'>
                  <Calendar className='h-4 w-4 text-muted-foreground' />
                  <div>
                    <div className='text-sm text-muted-foreground'>Created</div>
                    <div className='font-medium'>
                      {new Date(paymentMode.createdAt).toLocaleDateString()} at{' '}
                      {new Date(paymentMode.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                <div className='flex items-center gap-2'>
                  <Calendar className='h-4 w-4 text-muted-foreground' />
                  <div>
                    <div className='text-sm text-muted-foreground'>
                      Last Updated
                    </div>
                    <div className='font-medium'>
                      {new Date(paymentMode.updatedAt).toLocaleDateString()} at{' '}
                      {new Date(paymentMode.updatedAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                {paymentMode.createdBy &&
                  typeof paymentMode.createdBy === 'object' && (
                    <div className='flex items-center gap-2'>
                      <User className='h-4 w-4 text-muted-foreground' />
                      <div>
                        <div className='text-sm text-muted-foreground'>
                          Created By
                        </div>
                        <div className='font-medium'>
                          {(paymentMode.createdBy as any).firstName}{' '}
                          {(paymentMode.createdBy as any).lastName}
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* Status Analysis */}
          <Separator />
          <div>
            <h3 className='text-lg font-medium mb-4'>Status Analysis</h3>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <Card>
                <CardContent className='pt-6'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-gray-100 rounded-lg'>
                      <Info className='h-5 w-5 text-gray-600' />
                    </div>
                    <div>
                      <div className='text-sm text-muted-foreground'>
                        Current Status
                      </div>
                      <div className='font-medium'>
                        {paymentMode.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className='pt-6'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-blue-100 rounded-lg'>
                      <Calendar className='h-5 w-5 text-blue-600' />
                    </div>
                    <div>
                      <div className='text-sm text-muted-foreground'>
                        Created Date
                      </div>
                      <div className='font-medium'>
                        {new Date(paymentMode.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className='pt-6'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-green-100 rounded-lg'>
                      <History className='h-5 w-5 text-green-600' />
                    </div>
                    <div>
                      <div className='text-sm text-muted-foreground'>Age</div>
                      <div className='font-medium'>
                        {Math.floor(
                          (new Date().getTime() -
                            new Date(paymentMode.createdAt).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}{' '}
                        days
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Actions */}
          <div className='pt-4'>
            <Separator className='mb-4' />
            <div className='flex gap-2'>
              <Button
                variant='outline'
                onClick={() => router.push('/paymentmodes')}
              >
                Back to Payment Modes
              </Button>
              {canUpdate && (
                <>
                  <Button
                    variant='outline'
                    onClick={() => router.push(`/paymentmodes/edit/${id}`)}
                  >
                    <Edit className='mr-2 h-4 w-4' />
                    Edit Payment Mode
                  </Button>
                  <Button
                    variant='outline'
                    onClick={() => router.push('/paymentmodes/analysis')}
                  >
                    <History className='mr-2 h-4 w-4' />
                    View Analysis
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
