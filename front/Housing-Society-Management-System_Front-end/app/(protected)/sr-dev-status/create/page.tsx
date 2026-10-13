// src/app/(dashboard)/sr-dev-status/create/page.tsx
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
import { hasPermission, UserRole } from '@/lib/constants/roles'
import { PHASE_PERCENTAGE_RANGES } from '@/lib/constants/srDevStatus.constants'
import { srDevStatusFormFields } from '@/lib/constants/srDevStatusForm.constants'
import { useCreateSrDevStatus } from '@/lib/hooks/entities/useSrDevStatus'
import { useAuth } from '@/lib/hooks/useAuth'
import { srDevStatusSchema } from '@/lib/schemas/srDevStatus.schema'
import { CreateSrDevStatusDto, DevPhase } from '@/lib/types/srdevstatus'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { customToast } from "@/lib/utils/customToast"

export default function CreateSrDevStatusPage () {
  const router = useRouter()
  const { user } = useAuth()
  const createMutation = useCreateSrDevStatus()

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
              You don&apos;t have permission to create development statuses.
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
      const formData = data as CreateSrDevStatusDto

      const submitData = {
        ...formData,
        srDevStatCode: formData.srDevStatCode?.toUpperCase() || '',
        colorCode: formData.colorCode || '#808080',
        isActive: formData.isActive ?? true,
        isDefault: formData.isDefault ?? false,
        sequence: Number(formData.sequence) || 1,
        percentageComplete: Number(formData.percentageComplete) || 0,
        requiresDocumentation: formData.requiresDocumentation ?? false,
        estimatedDurationDays: Number(formData.estimatedDurationDays) || 0
      }

      await createMutation.mutateAsync(submitData)
      customToast.success('Development status created successfully')
      router.push('/sr-dev-status')
    } catch (error) {
      customToast.error(
        'Failed to create development status' +
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
          Back to Development Statuses
        </Button>

        <h1 className='text-3xl font-bold'>Create New Development Status</h1>
        <p className='text-gray-500 mt-2'>
          Define a new development status for project management
        </p>
      </div>

      <Card>
        <CardContent className='pt-6'>
          <EntityForm
            schema={srDevStatusSchema}
            fields={srDevStatusFormFields}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel='Create Status'
            cancelLabel='Cancel'
            isLoading={createMutation.isPending}
            defaultValues={{
              devPhase: DevPhase.PRE_CONSTRUCTION,
              percentageComplete:
                PHASE_PERCENTAGE_RANGES[DevPhase.PRE_CONSTRUCTION].min,
              colorCode: '#808080',
              isActive: true,
              isDefault: false,
              sequence: 1,
              //   percentageComplete: 0,
              requiresDocumentation: false,
              estimatedDurationDays: 0
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
