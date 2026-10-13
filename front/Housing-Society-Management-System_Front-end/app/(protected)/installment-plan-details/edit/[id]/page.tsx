// src/app/(protected)/installment-plan-details/edit/[id]/page.tsx
'use client'

import { EntityForm } from '@/components/shared/EntityForm/EntityForm'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { installmentPlanDetailFormFields } from '@/lib/constants/installmentPlanDetailForm.constants'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import {
  useInstallmentPlanDetail,
  useUpdateInstallmentPlanDetail,
} from '@/lib/hooks/entities/useInstallmentPlanDetail'
import { useAuth } from '@/lib/hooks/useAuth'
import { updateInstallmentPlanDetailSchema } from '@/lib/schemas/installmentPlanDetail.schema'
import { UpdateInstallmentPlanDetailDto } from '@/lib/types/installmentPlanDetail'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { customToast } from "@/lib/utils/customToast"
import { FormPageSkeleton } from '@/components/shared/PageSkeleton'

export default function EditInstallmentPlanDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const id = params.id as string

  const { data: detail, isLoading, error } = useInstallmentPlanDetail(id)
  const updateMutation = useUpdateInstallmentPlanDetail()

  const canUpdate =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

  if (!canUpdate) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to edit installment plan details.
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

  if (isLoading) {
    return <FormPageSkeleton />
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

  const planId =
    typeof detail.planId === 'object' && detail.planId !== null
      ? (detail.planId as { _id: string })._id
      : detail.planId
  const instCatId =
    typeof detail.instCatId === 'object' && detail.instCatId !== null
      ? (detail.instCatId as { _id: string })._id
      : detail.instCatId

  const planName =
    typeof detail.planId === 'object' && detail.planId !== null
      ? (detail.planId as { planName?: string }).planName
      : ''
  const categoryName =
    typeof detail.instCatId === 'object' && detail.instCatId !== null
      ? (detail.instCatId as { instCatName?: string }).instCatName
      : ''

  const defaultValues = {
    planId,
    instCatId,
    occurrence: detail.occurrence,
    percentageAmount: detail.percentageAmount ?? 0,
    fixedAmount: detail.fixedAmount ?? 0,
  }

  const initialRelationshipOptions = {
    planId: { value: planId, label: planName || '—' },
    instCatId: { value: instCatId, label: categoryName || '—' },
  }

  const handleSubmit = async (data: unknown) => {
    try {
      const formData = data as UpdateInstallmentPlanDetailDto
      const submitData: UpdateInstallmentPlanDetailDto = {
        occurrence:
          formData.occurrence != null ? Number(formData.occurrence) : undefined,
        percentageAmount:
          formData.percentageAmount != null
            ? Number(formData.percentageAmount)
            : undefined,
        fixedAmount:
          formData.fixedAmount != null ? Number(formData.fixedAmount) : undefined,
      }
      await updateMutation.mutateAsync({ id, data: submitData })
      customToast.success('Installment plan detail updated successfully')
      router.push('/installment-plan-details')
    } catch (err) {
      customToast.error(
        'Failed to update detail' +
          (err instanceof Error ? `: ${err.message}` : '')
      )
    }
  }

  const handleCancel = () => router.back()

  // Edit form: plan and category are read-only (disabled)
  const editFormFields = installmentPlanDetailFormFields.map((f) => {
    if (f.name === 'planId' || f.name === 'instCatId') {
      return { ...f, disabled: true }
    }
    return f
  })

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Plan Details
        </Button>

        <h1 className="text-3xl font-bold">Edit Installment Plan Detail</h1>
        <p className="text-muted-foreground mt-2">
          Occurrence {detail.occurrence} — Update percentage or fixed amount
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <EntityForm
            schema={updateInstallmentPlanDetailSchema}
            fields={editFormFields}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel="Save Changes"
            cancelLabel="Cancel"
            isLoading={updateMutation.isPending}
            defaultValues={defaultValues}
            initialRelationshipOptions={initialRelationshipOptions}
          />
        </CardContent>
      </Card>
    </div>
  )
}
