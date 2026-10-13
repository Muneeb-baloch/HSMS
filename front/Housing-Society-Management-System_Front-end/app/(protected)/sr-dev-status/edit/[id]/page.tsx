// src/app/(dashboard)/sr-dev-status/edit/[id]/page.tsx
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
import { srDevStatusFormFields } from '@/lib/constants/srDevStatusForm.constants'
import {
  useSrDevStatus,
  useUpdateSrDevStatus
} from '@/lib/hooks/entities/useSrDevStatus'
import { useAuth } from '@/lib/hooks/useAuth'
import { srDevStatusSchema } from '@/lib/schemas/srDevStatus.schema'
import { UpdateSrDevStatusDto } from '@/lib/types/srdevstatus'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { customToast } from "@/lib/utils/customToast"
import { FormPageSkeleton } from '@/components/shared/PageSkeleton'

export default function EditSrDevStatusPage () {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const updateMutation = useUpdateSrDevStatus()

  const id = params.id as string
  const { data: status, isLoading, error } = useSrDevStatus(id)

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
              You don&apos;t have permission to edit development statuses.
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

  if (error || !status) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              Failed to load development status data.
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

  // Prepare default values
  const defaultValues = {
    srDevStatName: status.srDevStatName,
    srDevStatCode: status.srDevStatCode,
    devCategory: status.devCategory,
    devPhase: status.devPhase,
    description: status.description || '',
    isActive: status.isActive,
    isDefault: status.isDefault,
    colorCode: status.colorCode,
    icon: status.icon || '',
    requiresDocumentation: status.requiresDocumentation
  }

  const handleSubmit = async (data: unknown) => {
    try {
      const formData = data as UpdateSrDevStatusDto

      // Transform data
      const submitData: any = {}

      // Only include changed fields
      Object.keys(formData).forEach(key => {
        if (formData[key as keyof UpdateSrDevStatusDto] !== undefined) {
          const value = formData[key as keyof UpdateSrDevStatusDto]

          // Handle special cases
          if (key === 'srDevStatCode' && value) {
            submitData[key] = (value as string).toUpperCase()
          } else {
            submitData[key] = value
          }
        }
      })

      await updateMutation.mutateAsync({
        id,
        data: submitData
      })
      customToast.success('Development status updated successfully')
      router.push('/sr-dev-status')
    } catch (error) {
      customToast.error(
        'Failed to update development status' +
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

        <h1 className='text-3xl font-bold'>Edit Development Status</h1>
        <p className='text-gray-500 mt-2'>
          Update development status information.
        </p>
        <div className='mt-2 flex items-center gap-2'>
          <span className='text-sm font-medium'>Status Code:</span>
          <span className='text-sm bg-gray-100 px-2 py-1 rounded'>
            {status.srDevStatCode}
          </span>
        </div>
      </div>

      <Card>
        <CardContent className='pt-6'>
          <EntityForm
            schema={srDevStatusSchema}
            fields={srDevStatusFormFields}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel='Update Status'
            cancelLabel='Cancel'
            isLoading={updateMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  )
}
