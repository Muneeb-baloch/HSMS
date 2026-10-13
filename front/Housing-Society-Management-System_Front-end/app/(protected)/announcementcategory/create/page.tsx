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
import { announcementCategoryFormFields } from '@/lib/constants/announcementCategoryForm.constants'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import { useCreateAnnouncementCategory } from '@/lib/hooks/entities/useAnnouncementCategory'
import { useAuth } from '@/lib/hooks/useAuth'
import { announcementCategorySchema } from '@/lib/schemas/announcementCategory.schema'
import { CreateAnnouncementCategoryDto } from '@/lib/types/announcementCategory'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { customToast } from '@/lib/utils/customToast'

export default function CreateAnnouncementCategoryPage () {
  const router = useRouter()
  const { user } = useAuth()
  const createMutation = useCreateAnnouncementCategory()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canCreate =
    user &&
    hasPermission(user.role as UserRole, [
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
      UserRole.MODERATOR
    ])

  if (!canCreate) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to create categories.
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

  const handleSubmit = async (values: unknown) => {
    try {
      setIsSubmitting(true)
      const data = values as CreateAnnouncementCategoryDto
      await createMutation.mutateAsync(data)
      customToast.success('Category created successfully')
      router.push('/announcementcategory')
    } catch (err: any) {
      customToast.error(err.message || 'Failed to create category')
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
        <h1 className='text-3xl font-bold'>Create Announcement Category</h1>
        <p className='text-gray-500 mt-2'>
          Add a new category for organizing announcements
        </p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2'>
          <Card>
            <CardContent className='pt-6'>
              <EntityForm
                schema={announcementCategorySchema}
                fields={announcementCategoryFormFields}
                onSubmit={handleSubmit}
                submitLabel='Create Category'
                isLoading={isSubmitting}
              />
            </CardContent>
          </Card>
        </div>

        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Information</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4 text-sm text-gray-600'>
              <div>
                <div className='font-medium mb-2'>About Categories:</div>
                <ul className='list-disc pl-5 space-y-1'>
                  <li>Categories help organize announcements</li>
                  <li>Each category can have a color and icon</li>
                  <li>Priority controls display order</li>
                  <li>System categories cannot be deleted</li>
                </ul>
              </div>
              <div className='border-t pt-3'>
                <div className='font-medium mb-2'>Required Fields:</div>
                <ul className='list-disc pl-5 space-y-1'>
                  <li>Category Name (required)</li>
                  <li>Description (optional)</li>
                  <li>Icon name (optional)</li>
                  <li>Color (optional)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Tips</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 text-sm text-gray-600'>
              <ul className='space-y-2'>
                <li>• Use clear, descriptive names</li>
                <li>• Choose distinctive colors</li>
                <li>• Set higher priority for important categories</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
