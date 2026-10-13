// src/app/(protected)/installment-plans/view/[id]/page.tsx
'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useInstallmentPlan } from '@/lib/hooks/entities/useInstallmentPlan'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { ArrowLeft, Edit, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import { DetailPageSkeleton } from '@/components/shared/PageSkeleton'

export default function ViewInstallmentPlanPage () {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const id = params.id as string

  const { data: plan, isLoading, error } = useInstallmentPlan(id)

  const canUpdate =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

  if (isLoading) {
    return <DetailPageSkeleton />
  }

  if (error || !plan) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Plan Not Found</CardTitle>
            <CardDescription>
              The installment plan could not be loaded or does not exist.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.back()}>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const projName =
    typeof plan.projId === 'object' && plan.projId !== null
      ? (plan.projId as { projName?: string }).projName
      : '—'

  return (
    <div className='p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <Button variant='ghost' onClick={() => router.back()} className='mb-4'>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back to Plans
          </Button>
          <h1 className='text-3xl font-bold'>{plan.planName}</h1>
          <p className='text-muted-foreground mt-1'>
            Project: {projName}
          </p>
        </div>
        {canUpdate && (
          <Button asChild>
            <Link href={`/installment-plans/edit/${id}`}>
              <Edit className='mr-2 h-4 w-4' />
              Edit Plan
            </Link>
          </Button>
        )}
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>Plan Details</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Plan Name</span>
              <span className='font-medium'>{plan.planName}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Project</span>
              <span className='font-medium'>{projName}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Total Months</span>
              <span className='font-medium'>{plan.totalMonths}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Total Amount</span>
              <span className='font-medium text-green-600 dark:text-green-400'>
                {formatCurrency(plan.totalAmount)}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Status</span>
              <Badge
                className={
                  plan.isActive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                }
              >
                {plan.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Created</span>
              <span className='text-sm'>{formatDate(plan.createdAt)}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Updated</span>
              <span className='text-sm'>{formatDate(plan.updatedAt)}</span>
            </div>
            {plan.createdBy && (
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Created By</span>
                <span className='text-sm'>
                  {plan.createdBy.fullName || plan.createdBy.userName || '—'}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
