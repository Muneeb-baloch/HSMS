// src/app/(protected)/installment-plans/edit/[id]/page.tsx
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
import { installmentPlanFormFields } from '@/lib/constants/installmentPlanForm.constants'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import { useInstallmentPlan, useUpdateInstallmentPlan } from '@/lib/hooks/entities/useInstallmentPlan'
import { useAuth } from '@/lib/hooks/useAuth'
import { updateInstallmentPlanSchema } from '@/lib/schemas/installmentPlan.schema'
import { UpdateInstallmentPlanDto } from '@/lib/types/installmentPlan'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { customToast } from "@/lib/utils/customToast"
import { FormPageSkeleton } from '@/components/shared/PageSkeleton'

export default function EditInstallmentPlanPage () {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const id = params.id as string

  const { data: plan, isLoading, error } = useInstallmentPlan(id)
  const updateMutation = useUpdateInstallmentPlan()

  const canUpdate =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

  if (!canUpdate) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to edit installment plans.
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

  if (isLoading) {
    return <FormPageSkeleton />
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

  const defaultValues = {
    projId: typeof plan.projId === 'object' ? (plan.projId as { _id: string })._id : plan.projId,
    planName: plan.planName,
    totalMonths: plan.totalMonths,
    totalAmount: plan.totalAmount,
    isActive: plan.isActive,
  }

  const handleSubmit = async (data: unknown) => {
    try {
      const formData = data as UpdateInstallmentPlanDto
      const submitData: UpdateInstallmentPlanDto = {
        planName: formData.planName,
        totalMonths: formData.totalMonths != null ? Number(formData.totalMonths) : undefined,
        totalAmount: formData.totalAmount != null ? Number(formData.totalAmount) : undefined,
        isActive: formData.isActive,
      }
      await updateMutation.mutateAsync({ id, data: submitData })
      customToast.success('Installment plan updated successfully')
      router.push('/installment-plans')
    } catch (err) {
      customToast.error(
        'Failed to update plan' +
          (err instanceof Error ? `: ${err.message}` : '')
      )
    }
  }

  const handleCancel = () => router.back()

  const editFormFields = installmentPlanFormFields.filter(f => f.name !== 'projId')

  return (
    <div className='p-6'>
      <div className='mb-6'>
        <Button variant='ghost' onClick={() => router.back()} className='mb-4'>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back to Plans
        </Button>

        <h1 className='text-3xl font-bold'>Edit Installment Plan</h1>
        <p className='text-muted-foreground mt-2'>{plan.planName}</p>
      </div>

      <Card>
        <CardContent className='pt-6'>
          <EntityForm
            schema={updateInstallmentPlanSchema}
            fields={editFormFields}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel='Save Changes'
            cancelLabel='Cancel'
            isLoading={updateMutation.isPending}
            defaultValues={defaultValues}
          />
        </CardContent>
      </Card>
    </div>
  )
}
