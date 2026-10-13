// src/app/(dashboard)/installment-categories/edit/[id]/page.tsx
'use client'

import { EntityForm } from '@/components/shared/EntityForm/EntityForm'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { installmentCategoryFormFields } from '@/lib/constants/installmentCategoryForm.constants'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import {
  useInstallmentCategory,
  useUpdateInstallmentCategory,
  useValidateSequenceOrder
} from '@/lib/hooks/entities/useInstallmentCategory'
import { useAuth } from '@/lib/hooks/useAuth'
import { installmentCategorySchema } from '@/lib/schemas/installmentCategory.schema'
import { UpdateInstallmentCategoryDto } from '@/lib/types/installmentCategory'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { customToast } from "@/lib/utils/customToast"
import { FormPageSkeleton } from '@/components/shared/PageSkeleton'

export default function EditInstallmentCategoryPage () {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const updateMutation = useUpdateInstallmentCategory()

  const id = params.id as string
  const { data: category, isLoading, error } = useInstallmentCategory(id)

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
              You don&apos;t have permission to edit installment categories.
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

  if (error || !category) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Failed to load category data.</CardDescription>
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

  // Prepare default values
  const defaultValues = {
    instCatName: category.instCatName,
    instCatDescription: category.instCatDescription || '',
    isRefundable: category.isRefundable,
    isMandatory: category.isMandatory,
    sequenceOrder: category.sequenceOrder,
    isActive: category.isActive
  }

  const handleSubmit = async (data: unknown) => {
    try {
      const formData = data as UpdateInstallmentCategoryDto

      // Validate sequence order if changed
      if (
        formData.sequenceOrder !== undefined &&
        formData.sequenceOrder !== category.sequenceOrder
      ) {
        const { data: validation } = await useValidateSequenceOrder(
          formData.sequenceOrder,
          id
        )

        if (!validation?.isValid) {
          customToast.error(validation?.message || 'Invalid sequence order')
          return
        }
      }

      const submitData: any = {}

      // Only include changed fields
      Object.keys(formData).forEach(key => {
        if (formData[key as keyof UpdateInstallmentCategoryDto] !== undefined) {
          const value = formData[key as keyof UpdateInstallmentCategoryDto]

          if (key === 'sequenceOrder') {
            submitData[key] = Number(value)
          } else {
            submitData[key] = value
          }
        }
      })

      await updateMutation.mutateAsync({
        id,
        data: submitData
      })

      customToast.success('Category updated successfully')
      router.push('/installment-categories')
    } catch (error) {
      customToast.error(
        'Failed to update category' +
          (error instanceof Error ? `: ${error.message}` : '')
      )
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className='p-6'>
      <div className='mb-6'>
        <Button variant='ghost' onClick={() => router.back()} className='mb-4'>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back to Categories
        </Button>

        <h1 className='text-3xl font-bold'>Edit Category</h1>
        <p className='text-gray-500 mt-2'>Update category information.</p>
        <div className='mt-2 flex items-center gap-2'>
          <span className='text-sm font-medium'>Category:</span>
          <span className='text-sm bg-gray-100 px-2 py-1 rounded'>
            {category.instCatName}
          </span>
        </div>
      </div>

      <Card>
        <CardContent className='pt-6'>
          <EntityForm
            schema={installmentCategorySchema}
            fields={installmentCategoryFormFields}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel='Update Category'
            cancelLabel='Cancel'
            isLoading={updateMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  )
}
