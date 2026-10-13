// src/app/(dashboard)/sales-status/edit/[id]/page.tsx
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
import { salesStatusFormFields } from '@/lib/constants/salesStatusForm.constants'
import {
  useSalesStatus,
  useUpdateSalesStatus
} from '@/lib/hooks/entities/useSalesStatus'
import { useAuth } from '@/lib/hooks/useAuth'
import { salesStatusSchema } from '@/lib/schemas/salesStatus.schema'
import { UpdateSalesStatusDto } from '@/lib/types/salesStatus'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { customToast } from "@/lib/utils/customToast"
import { FormPageSkeleton } from '@/components/shared/PageSkeleton'

export default function EditSalesStatusPage () {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const updateMutation = useUpdateSalesStatus()

  const id = params.id as string
  const { data: status, isLoading, error } = useSalesStatus(id)

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
              You don&apos;t have permission to edit sales statuses.
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
            <CardDescription>Failed to load sales status data.</CardDescription>
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
    statusName: status.statusName,
    statusCode: status.statusCode,
    statusType: status.statusType,
    description: status.description || '',
    colorCode: status.colorCode,
    isActive: status.isActive,
    isDefault: status.isDefault,
    sequence: status.sequence,
    allowsSale: status.allowsSale,
    requiresApproval: status.requiresApproval,
    notificationTemplate: status.notificationTemplate || ''
  }

  const handleSubmit = async (data: unknown) => {
    try {
      const formData = data as UpdateSalesStatusDto

      // Transform data
      const submitData: any = {}

      // Only include changed fields
      Object.keys(formData).forEach(key => {
        if (formData[key as keyof UpdateSalesStatusDto] !== undefined) {
          const value = formData[key as keyof UpdateSalesStatusDto]

          // Handle special cases
          if (key === 'statusCode' && value) {
            submitData[key] = (value as string).toUpperCase()
          } else if (key === 'sequence') {
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
      customToast.success('Sales status updated successfully')
      router.push('/sales-status')
    } catch (error) {
      customToast.error(
        'Failed to update sales status' +
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
          Back to Sales Statuses
        </Button>

        <h1 className='text-3xl font-bold'>Edit Sales Status</h1>
        <p className='text-gray-500 mt-2'>Update sales status information.</p>
        <div className='mt-2 flex items-center gap-2'>
          <span className='text-sm font-medium'>Status Code:</span>
          <span className='text-sm bg-gray-100 px-2 py-1 rounded'>
            {status.statusCode}
          </span>
        </div>
      </div>

      <Card>
        <CardContent className='pt-6'>
          <EntityForm
            schema={salesStatusSchema}
            fields={salesStatusFormFields}
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
