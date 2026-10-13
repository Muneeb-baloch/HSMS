// src/app/(protected)/installment-plan-details/create/page.tsx
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
import { useCreateInstallmentPlanDetail } from '@/lib/hooks/entities/useInstallmentPlanDetail'
import { useAuth } from '@/lib/hooks/useAuth'
import { createInstallmentPlanDetailSchema } from '@/lib/schemas/installmentPlanDetail.schema'
import { CreateInstallmentPlanDetailDto } from '@/lib/types/installmentPlanDetail'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { customToast } from "@/lib/utils/customToast"

export default function CreateInstallmentPlanDetailPage() {
  const router = useRouter()
  const { user } = useAuth()
  const createMutation = useCreateInstallmentPlanDetail()

  const canCreate =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

  if (!canCreate) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to create installment plan details.
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

  const handleSubmit = async (data: unknown) => {
    try {
      const formData = data as CreateInstallmentPlanDetailDto
      const submitData = {
        ...formData,
        occurrence: Number(formData.occurrence),
        percentageAmount: Number(formData.percentageAmount ?? 0),
        fixedAmount: Number(formData.fixedAmount ?? 0),
      }
      await createMutation.mutateAsync(submitData)
      customToast.success('Installment plan detail created successfully')
      router.push('/installment-plan-details')
    } catch (error) {
      customToast.error(
        'Failed to create plan detail' +
          (error instanceof Error ? `: ${error.message}` : '')
      )
    }
  }

  const handleCancel = () => router.back()

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Plan Details
        </Button>

        <h1 className="text-3xl font-bold">Create Installment Plan Detail</h1>
        <p className="text-muted-foreground mt-2">
          Add a new detail (category + occurrence) to an installment plan.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <EntityForm
            schema={createInstallmentPlanDetailSchema}
            fields={installmentPlanDetailFormFields}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel="Create Detail"
            cancelLabel="Cancel"
            isLoading={createMutation.isPending}
            defaultValues={{
              occurrence: 1,
              percentageAmount: 0,
              fixedAmount: 0,
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
