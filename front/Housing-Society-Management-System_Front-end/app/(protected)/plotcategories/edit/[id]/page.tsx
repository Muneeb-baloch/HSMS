// src/app/(dashboard)/plotcategories/edit/[id]/page.tsx
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
import { plotCategoryFormFields } from '@/lib/constants/plotcategoryForm.constants'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import {
  usePlotCategory,
  useUpdatePlotCategory
} from '@/lib/hooks/entities/usePlotCategory'
import { useAuth } from '@/lib/hooks/useAuth'
import { plotCategorySchema } from '@/lib/schemas/plotcategory.schema'
import { UpdatePlotCategoryDto } from '@/lib/types/plotcategory'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { customToast } from "@/lib/utils/customToast"
import { FormPageSkeleton } from '@/components/shared/PageSkeleton'

export default function EditPlotCategoryPage () {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const updateMutation = useUpdatePlotCategory()

  const id = params.id as string
  const { data: plotCategory, isLoading, error } = usePlotCategory(id)

  const canUpdate =
    user &&
    hasPermission(
      user.role as UserRole,
      [UserRole.ADMIN, UserRole.SUPER_ADMIN] as UserRole[]
    )

  if (!canUpdate) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to edit plot categories.
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

  if (error || !plotCategory) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              Failed to load plot category data.
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

  // Determine surcharge type for the form
  const surchargeType =
    plotCategory.surchargeType ||
    (plotCategory.surchargePercentage && plotCategory.surchargePercentage > 0
      ? 'percentage'
      : plotCategory.surchargeFixedAmount &&
        plotCategory.surchargeFixedAmount > 0
      ? 'fixed'
      : 'none')

  // Prepare default values
  const defaultValues = {
    categoryName: plotCategory.categoryName,
    categoryDesc: plotCategory.categoryDesc || '',
    isActive: plotCategory.isActive,
    surchargeType: surchargeType,
    surchargePercentage: plotCategory.surchargePercentage || 0,
    surchargeFixedAmount: plotCategory.surchargeFixedAmount || 0
  }

  const handleSubmit = async (data: unknown) => {
    try {
      const formData = data as UpdatePlotCategoryDto

      // Transform the data to match backend expectations
      const submitData: any = {}

      if (formData.categoryName !== undefined)
        submitData.categoryName = formData.categoryName
      if (formData.categoryDesc !== undefined)
        submitData.categoryDesc = formData.categoryDesc
      if (formData.isActive !== undefined)
        submitData.isActive = formData.isActive

      // Handle surcharge based on type
      if (
        formData.surchargeType === 'percentage' &&
        formData.surchargePercentage !== undefined
      ) {
        submitData.surchargePercentage = formData.surchargePercentage
        submitData.surchargeFixedAmount = 0
      } else if (
        formData.surchargeType === 'fixed' &&
        formData.surchargeFixedAmount !== undefined
      ) {
        submitData.surchargeFixedAmount = formData.surchargeFixedAmount
        submitData.surchargePercentage = 0
      } else if (formData.surchargeType === 'none') {
        submitData.surchargePercentage = 0
        submitData.surchargeFixedAmount = 0
      }

      await updateMutation.mutateAsync({
        id,
        data: submitData
      })
      customToast.success('Plot Category updated successfully')
      router.push('/plotcategories')
    } catch (error) {
      customToast.error(
        'Failed to update plot category' +
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

        <h1 className='text-3xl font-bold'>Edit Plot Category</h1>
        <p className='text-gray-500 mt-2'>Update plot category information.</p>
      </div>

      <Card>
        <CardContent className='pt-6'>
          <EntityForm
            schema={plotCategorySchema}
            fields={plotCategoryFormFields}
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
