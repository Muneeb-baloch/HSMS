// src/app/(dashboard)/complain-categories/create/page.tsx
'use client'

import { EntityForm } from '@/components/shared/EntityForm/EntityForm'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { complaintCategoryFormFields } from '@/lib/constants/complaintCategoryForm.constants'
import { hasPermission, UserRole as UserRoleEnum } from '@/lib/constants/roles'
import { useCreateSrComplaintCategory } from '@/lib/hooks/entities/useSrComplaintCategory'
import { useAuth } from '@/lib/hooks/useAuth'
import { complaintCategorySchema } from '@/lib/schemas/complaintCategory.schema'
import { CreateSrComplaintCategoryDto } from '@/lib/types/srComplaintCategory'
import { AlertTriangle, ArrowLeft, Info } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function CreateComplaintCategoryPage () {
  const router = useRouter()
  const { user } = useAuth()
  const createMutation = useCreateSrComplaintCategory()
  const [escalationLevels, setEscalationLevels] = useState<any[]>([])

  const canCreate =
    user &&
    hasPermission(
      user.role as UserRoleEnum,
      [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN] as UserRoleEnum[]
    )

  useEffect(() => {
    if (!canCreate) {
      router.push('/complain-categories')
    }
  }, [canCreate, router])

  if (!canCreate) {
    return null
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

  const handleSubmit = async (data: CreateSrComplaintCategoryDto) => {
    try {
      const submitData = {
        ...data,
        escalationLevels:
          escalationLevels.length > 0 ? escalationLevels : undefined
      }
      await createMutation.mutateAsync(submitData)
      router.push('/complain-categories')
    } catch (error) {
      console.error('Failed to create complaint category:', error)
    }
  }

  const handleCancel = () => {
    router.push('/complain-categories')
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
                Create New Complaint Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EntityForm
                schema={complaintCategorySchema}
                fields={complaintCategoryFormFields}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={createMutation.isPending}
                submitLabel='Create Category'
                cancelLabel='Cancel'
              />
            </CardContent>
          </Card>
        </div>

        <div className='space-y-6'>
          {/* Priority Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg flex items-center gap-2'>
                <AlertTriangle className='h-5 w-5' />
                Priority Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium text-red-600'>
                    1-3: Critical
                  </span>
                  <Badge variant='outline' className='bg-red-50 text-red-700'>
                    High Priority
                  </Badge>
                </div>
                <p className='text-xs text-gray-500'>
                  Emergency issues requiring immediate attention
                </p>
              </div>

              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium text-yellow-600'>
                    4-6: Medium
                  </span>
                  <Badge
                    variant='outline'
                    className='bg-yellow-50 text-yellow-700'
                  >
                    Standard Priority
                  </Badge>
                </div>
                <p className='text-xs text-gray-500'>
                  Important issues within standard SLA
                </p>
              </div>

              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium text-green-600'>
                    7-10: Low
                  </span>
                  <Badge
                    variant='outline'
                    className='bg-green-50 text-green-700'
                  >
                    Low Priority
                  </Badge>
                </div>
                <p className='text-xs text-gray-500'>
                  Minor issues with flexible timeline
                </p>
              </div>
            </CardContent>
          </Card>

          {/* SLA Information */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg flex items-center gap-2'>
                <Info className='h-5 w-5' />
                SLA Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium'>Critical Issues</span>
                  <span className='text-xs font-medium text-red-600'>
                    ≤ 24 hours
                  </span>
                </div>
                <p className='text-xs text-gray-500'>
                  Require escalation if not resolved within 4 hours
                </p>
              </div>

              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium'>Medium Issues</span>
                  <span className='text-xs font-medium text-yellow-600'>
                    ≤ 72 hours
                  </span>
                </div>
                <p className='text-xs text-gray-500'>
                  Standard resolution timeline
                </p>
              </div>

              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium'>Low Issues</span>
                  <span className='text-xs font-medium text-green-600'>
                    ≥ 72 hours
                  </span>
                </div>
                <p className='text-xs text-gray-500'>
                  Flexible resolution timeline
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Escalation Levels Section */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>
            Escalation Levels (Optional)
          </CardTitle>
          <p className='text-sm text-muted-foreground'>
            Define escalation paths for unresolved complaints
          </p>
        </CardHeader>
        <CardContent>
          <Alert className='mb-4'>
            <Info className='h-4 w-4' />
            <AlertDescription>
              Escalation levels define who gets notified and when if a complaint
              remains unresolved.
            </AlertDescription>
          </Alert>

          {escalationLevels.length === 0 ? (
            <div className='text-center py-8 border-2 border-dashed rounded-lg'>
              <p className='text-muted-foreground mb-3'>
                No escalation levels defined
              </p>
              <Button variant='outline' onClick={addEscalationLevel}>
                Add First Escalation Level
              </Button>
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
              <Button
                variant='outline'
                onClick={addEscalationLevel}
                className='w-full'
              >
                Add Another Escalation Level
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
