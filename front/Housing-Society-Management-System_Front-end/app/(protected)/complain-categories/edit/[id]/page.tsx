// src/app/(dashboard)/complain-categories/edit/[id]/page.tsx
'use client'

import { EntityForm } from '@/components/shared/EntityForm/EntityForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { complaintCategoryFormFields } from '@/lib/constants/complaintCategoryForm.constants'
import { hasPermission, UserRole as UserRoleEnum } from '@/lib/constants/roles'
import {
  useSrComplaintCategory,
  useUpdateSrComplaintCategory
} from '@/lib/hooks/entities/useSrComplaintCategory'
import { useAuth } from '@/lib/hooks/useAuth'
import { complaintCategorySchema } from '@/lib/schemas/complaintCategory.schema'
import { UpdateSrComplaintCategoryDto } from '@/lib/types/srComplaintCategory'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FormPageSkeleton } from '@/components/shared/PageSkeleton'

interface EditComplaintCategoryPageProps {
  params: {
    id: string
  }
}

export default function EditComplaintCategoryPage ({
  params
}: EditComplaintCategoryPageProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { id } = params

  const {
    data: category,
    isLoading: isLoadingCategory,
    error
  } = useSrComplaintCategory(id)
  const updateMutation = useUpdateSrComplaintCategory()
  const [escalationLevels, setEscalationLevels] = useState<any[]>(
    category?.escalationLevels || []
  )

  const canUpdate =
    user &&
    hasPermission(
      user.role as UserRoleEnum,
      [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN] as UserRoleEnum[]
    )

  useEffect(() => {
    if (!canUpdate) {
      router.push('/complain-categories')
    }
  }, [canUpdate, router])

  if (!canUpdate) {
    return null
  }

  if (isLoadingCategory) {
    return <FormPageSkeleton />
  }

  if (error || !category) {
    return (
      <div className='space-y-1'>
        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => router.back()}
            className='mb-4'
          >
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-center py-8'>
              <h3 className='text-lg font-medium mb-2'>Category Not Found</h3>
              <p className='text-muted-foreground'>
                The complaint category you&apos;re trying to edit doesn&apos;t
                exist or you don&apos;t have permission to access it.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const addEscalationLevel = () => {
    setEscalationLevels([
      ...escalationLevels,
      {
        level: escalationLevels.length + 1,
        role: '',
        hoursAfterCreation: 24
      }
    ])
  }

  const removeEscalationLevel = (index: number) => {
    setEscalationLevels(escalationLevels.filter((_, i) => i !== index))
  }

  const updateEscalationLevel = (index: number, field: string, value: any) => {
    const updatedLevels = [...escalationLevels]
    updatedLevels[index] = { ...updatedLevels[index], [field]: value }
    setEscalationLevels(updatedLevels)
  }

  const handleSubmit = async (data: UpdateSrComplaintCategoryDto) => {
    try {
      const submitData = {
        ...data,
        escalationLevels:
          escalationLevels.length > 0 ? escalationLevels : undefined
      }
      await updateMutation.mutateAsync({ id, data: submitData })
      router.push('/complain-categories')
    } catch (error) {
      console.error('Failed to update complaint category:', error)
    }
  }

  const handleCancel = () => {
    router.push('/complain-categories')
  }

  // Prepare initial data for the form
  const initialData = {
    categoryName: category.categoryName,
    categoryCode: category.categoryCode,
    description: category.description || '',
    priorityLevel: category.priorityLevel,
    slaHours: category.slaHours || 72,
    isActive: category.isActive
  }

  return (
    <div className='space-y-1'>
      <div className='flex items-center gap-2'>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => router.back()}
          className='mb-4'
        >
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back
        </Button>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2'>
          <Card>
            <CardHeader>
              <CardTitle className='text-2xl'>
                Edit Complaint Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EntityForm
                schema={complaintCategorySchema}
                fields={complaintCategoryFormFields}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={updateMutation.isPending}
                defaultValues={initialData}
                submitLabel='Update Category'
                cancelLabel='Cancel'
              />
            </CardContent>
          </Card>
        </div>

        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Category Information</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div>
                <p className='text-sm text-muted-foreground'>Category Code</p>
                <p className='font-medium'>{category.categoryCode}</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Created</p>
                <p className='font-medium'>
                  {new Date(category.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Last Updated</p>
                <p className='font-medium'>
                  {new Date(category.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>
                  Current Priority
                </p>
                <p className='font-medium'>
                  {category.priorityLevel} ({category.priorityLabel})
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Escalation Levels Section */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='text-lg'>Escalation Levels</CardTitle>
              <p className='text-sm text-muted-foreground'>
                Define escalation paths for unresolved complaints
              </p>
            </div>
            <Button variant='outline' onClick={addEscalationLevel}>
              Add Escalation Level
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {escalationLevels.length === 0 ? (
            <div className='text-center py-8 border-2 border-dashed rounded-lg'>
              <p className='text-muted-foreground'>
                No escalation levels defined
              </p>
            </div>
          ) : (
            <div className='space-y-4'>
              {escalationLevels.map((level, index) => (
                <div key={index} className='border rounded-lg p-4'>
                  <div className='flex items-center justify-between mb-3'>
                    <h4 className='font-medium'>
                      Escalation Level {level.level}
                    </h4>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => removeEscalationLevel(index)}
                      className='text-red-600 hover:text-red-700'
                    >
                      Remove
                    </Button>
                  </div>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <div>
                      <label className='text-sm font-medium mb-1 block'>
                        Role to Escalate
                      </label>
                      <input
                        type='text'
                        value={level.role}
                        onChange={e =>
                          updateEscalationLevel(index, 'role', e.target.value)
                        }
                        placeholder='e.g., Senior Manager, Director'
                        className='w-full p-2 border rounded'
                      />
                    </div>
                    <div>
                      <label className='text-sm font-medium mb-1 block'>
                        Hours After Creation
                      </label>
                      <input
                        type='number'
                        value={level.hoursAfterCreation}
                        onChange={e =>
                          updateEscalationLevel(
                            index,
                            'hoursAfterCreation',
                            parseInt(e.target.value)
                          )
                        }
                        min='1'
                        className='w-full p-2 border rounded'
                      />
                    </div>
                    <div>
                      <label className='text-sm font-medium mb-1 block'>
                        Level Number
                      </label>
                      <input
                        type='number'
                        value={level.level}
                        onChange={e =>
                          updateEscalationLevel(
                            index,
                            'level',
                            parseInt(e.target.value)
                          )
                        }
                        min='1'
                        max='5'
                        className='w-full p-2 border rounded'
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
