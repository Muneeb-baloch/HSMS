// src/app/(dashboard)/plotcategories/create/page.tsx
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
import { useCreatePlotCategory } from '@/lib/hooks/entities/usePlotCategory'
import { useAuth } from '@/lib/hooks/useAuth'
import { plotCategorySchema } from '@/lib/schemas/plotcategory.schema'
import { CreatePlotCategoryDto } from '@/lib/types/plotcategory'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { customToast } from '@/lib/utils/customToast'

export default function CreatePlotCategoryPage () {
  const router = useRouter()
  const { user } = useAuth()
  const createMutation = useCreatePlotCategory()

  const canCreate =
    user &&
    hasPermission(
      user.role as UserRole,
      [UserRole.ADMIN, UserRole.SUPER_ADMIN] as UserRole[]
    )

  if (!canCreate) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to create plot categories.
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
      const formData = data as CreatePlotCategoryDto

      // Transform the data to match backend expectations
      const submitData: any = {
        categoryName: formData.categoryName,
        categoryDesc: formData.categoryDesc || '',
        isActive: formData.isActive ?? true
      }

      // Handle surcharge based on type
      if (
        formData.surchargeType === 'percentage' &&
        formData.surchargePercentage
      ) {
        submitData.surchargePercentage = formData.surchargePercentage
        submitData.surchargeFixedAmount = 0
      } else if (
        formData.surchargeType === 'fixed' &&
        formData.surchargeFixedAmount
      ) {
        submitData.surchargeFixedAmount = formData.surchargeFixedAmount
        submitData.surchargePercentage = 0
      } else {
        submitData.surchargePercentage = 0
        submitData.surchargeFixedAmount = 0
      }

      await createMutation.mutateAsync(submitData)
      customToast.success('Plot Category created successfully')
      router.push('/plotcategories')
    } catch (error) {
      customToast.error(
        'Failed to create plot category' +
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

        <h1 className='text-3xl font-bold'>Create New Plot Category</h1>
        <p className='text-gray-500 mt-2'>
          Fill in all the required information to create a new plot category.
        </p>
      </div>

      <Card>
        <CardContent className='pt-6'>
          <EntityForm
            schema={plotCategorySchema}
            fields={plotCategoryFormFields}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel='Create Category'
            cancelLabel='Cancel'
            isLoading={createMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  )
}
