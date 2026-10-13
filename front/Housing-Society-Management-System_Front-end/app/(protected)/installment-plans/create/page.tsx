// src/app/(protected)/installment-plans/create/page.tsx
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
import { useCreateInstallmentPlan } from '@/lib/hooks/entities/useInstallmentPlan'
import { useAuth } from '@/lib/hooks/useAuth'
import { createInstallmentPlanSchema } from '@/lib/schemas/installmentPlan.schema'
import { CreateInstallmentPlanDto } from '@/lib/types/installmentPlan'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { customToast } from "@/lib/utils/customToast"

export default function CreateInstallmentPlanPage () {
  const router = useRouter()
  const { user } = useAuth()
  const createMutation = useCreateInstallmentPlan()

  const canCreate =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

  if (!canCreate) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to create installment plans.
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

  const handleSubmit = async (data: unknown) => {
    try {
      const formData = data as CreateInstallmentPlanDto
      const submitData = {
        ...formData,
        totalMonths: Number(formData.totalMonths),
        totalAmount: Number(formData.totalAmount),
        isActive: formData.isActive ?? true,
      }
      await createMutation.mutateAsync(submitData)
      customToast.success('Installment plan created successfully')
      router.push('/installment-plans')
    } catch (error) {
      customToast.error(
        'Failed to create plan' +
          (error instanceof Error ? `: ${error.message}` : '')
      )
    }
  }

  const handleCancel = () => router.back()

  return (
    <div className='p-6'>
      <div className='mb-6'>
        <Button variant='ghost' onClick={() => router.back()} className='mb-4'>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back to Plans
        </Button>

        <h1 className='text-3xl font-bold'>Create Installment Plan</h1>
        <p className='text-muted-foreground mt-2'>
          Define a new installment plan for a project.
        </p>
      </div>

      <Card>
        <CardContent className='pt-6'>
          <EntityForm
            schema={createInstallmentPlanSchema}
            fields={installmentPlanFormFields}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel='Create Plan'
            cancelLabel='Cancel'
            isLoading={createMutation.isPending}
            defaultValues={{
              isActive: true,
              totalMonths: 12,
              totalAmount: 0,
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
