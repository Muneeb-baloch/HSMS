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
import { updateAnnouncementCategoryFormFields } from '@/lib/constants/announcementCategoryForm.constants'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import {
  useAnnouncementCategory,
  useUpdateAnnouncementCategory
} from '@/lib/hooks/entities/useAnnouncementCategory'
import { useAuth } from '@/lib/hooks/useAuth'
import { updateAnnouncementCategorySchema } from '@/lib/schemas/announcementCategory.schema'
import { UpdateAnnouncementCategoryDto } from '@/lib/types/announcementCategory'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { customToast } from "@/lib/utils/customToast"
import { FormPageSkeleton } from '@/components/shared/PageSkeleton'

export default function EditAnnouncementCategoryPage () {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const updateMutation = useUpdateAnnouncementCategory()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const id = params.id as string
  const { data: category, isLoading, error } = useAnnouncementCategory(id)

  const canUpdate =
    user &&
    hasPermission(user.role as UserRole, [
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
      UserRole.MODERATOR
    ])

  if (!canUpdate) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to edit categories.
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
            <CardTitle>Category Not Found</CardTitle>
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
    categoryName: category.categoryName,
    description: category.description || '',
    icon: category.icon || '',
    color: category.color || '',
    isActive: category.isActive,
    priority: category.priority
  }

  const handleSubmit = async (values: unknown) => {
    try {
      setIsSubmitting(true)
      const data = values as UpdateAnnouncementCategoryDto
      await updateMutation.mutateAsync({ id, data })
      customToast.success('Category updated successfully')
      router.push('/announcementcategory')
    } catch (err: any) {
      customToast.error(err.message || 'Failed to update category')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='p-6'>
      <div className='mb-6'>
        <Button variant='ghost' onClick={() => router.back()} className='mb-4'>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back to Categories
        </Button>
        <h1 className='text-3xl font-bold'>Edit Category</h1>
        <p className='text-gray-500 mt-2'>{category.categoryName}</p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2'>
          <Card>
            <CardContent className='pt-6'>
              <EntityForm
                schema={updateAnnouncementCategorySchema}
                fields={updateAnnouncementCategoryFormFields}
                defaultValues={defaultValues}
                onSubmit={handleSubmit}
                submitLabel='Save Changes'
                isLoading={isSubmitting}
              />
            </CardContent>
          </Card>
        </div>

        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Category Details</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 text-sm'>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Name:</span>
                <span className='font-medium'>{category.categoryName}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Status:</span>
                <span
                  className={
                    category.isActive ? 'text-green-600' : 'text-gray-500'
                  }
                >
                  {category.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>System:</span>
                <span>{category.isSystem ? 'Yes' : 'No'}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Priority:</span>
                <span>{category.priority}</span>
              </div>
              {category.description && (
                <div>
                  <div className='text-gray-600'>Description:</div>
                  <div className='mt-1'>{category.description}</div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Important Notes</CardTitle>
            </CardHeader>
            <CardContent className='text-sm text-gray-600 space-y-2'>
              <ul className='list-disc pl-5 space-y-1'>
                <li>System categories have restricted editing</li>
                <li>
                  Changing color affects all announcements using this category
                </li>
                <li>Deactivating a category hides it from new announcements</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
