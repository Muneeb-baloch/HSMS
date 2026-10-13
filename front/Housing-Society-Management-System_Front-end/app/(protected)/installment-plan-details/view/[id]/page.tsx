// src/app/(protected)/installment-plan-details/view/[id]/page.tsx
'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useInstallmentPlanDetail } from '@/lib/hooks/entities/useInstallmentPlanDetail'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { ArrowLeft, Edit, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import { DetailPageSkeleton } from '@/components/shared/PageSkeleton'

export default function ViewInstallmentPlanDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const id = params.id as string

  const { data: detail, isLoading, error } = useInstallmentPlanDetail(id)

  const canUpdate =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

  if (isLoading) {
    return <DetailPageSkeleton />
  }

  if (error || !detail) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Detail Not Found</CardTitle>
            <CardDescription>
              The installment plan detail could not be loaded or does not exist.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const planName =
    typeof detail.planId === 'object' && detail.planId !== null
      ? (detail.planId as { planName?: string }).planName
      : '—'
  const categoryName =
    typeof detail.instCatId === 'object' && detail.instCatId !== null
      ? (detail.instCatId as { instCatName?: string }).instCatName
      : '—'

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Plan Details
          </Button>
          <h1 className="text-3xl font-bold">
            Plan Detail — Occurrence {detail.occurrence}
          </h1>
          <p className="text-muted-foreground mt-1">
            {planName} · {categoryName}
          </p>
        </div>
        {canUpdate && (
          <Button asChild>
            <Link href={`/installment-plan-details/edit/${id}`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Detail
            </Link>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Detail</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Plan</span>
              <span className="font-medium">{planName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Category</span>
              <span className="font-medium">{categoryName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Occurrence</span>
              <span className="font-medium">{detail.occurrence}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Percentage</span>
              <span className="font-medium">
                {detail.percentageAmount > 0 ? `${detail.percentageAmount}%` : '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fixed Amount</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                {detail.fixedAmount > 0
                  ? formatCurrency(detail.fixedAmount)
                  : '—'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created</span>
              <span className="text-sm">{formatDate(detail.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Updated</span>
              <span className="text-sm">{formatDate(detail.updatedAt)}</span>
            </div>
            {detail.createdBy && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created By</span>
                <span className="text-sm">
                  {detail.createdBy.fullName ||
                    detail.createdBy.userName ||
                    '—'}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
