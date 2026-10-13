// src/app/(dashboard)/sales-status/create/page.tsx
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
import { useCreateSalesStatus } from '@/lib/hooks/entities/useSalesStatus'
import { useAuth } from '@/lib/hooks/useAuth'
import { salesStatusSchema } from '@/lib/schemas/salesStatus.schema'
import { CreateSalesStatusDto, SalesStatusType } from '@/lib/types/salesStatus'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { customToast } from "@/lib/utils/customToast"

export default function CreateSalesStatusPage () {
  const router = useRouter()
  const { user } = useAuth()
  const createMutation = useCreateSalesStatus()

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
              You don&apos;t have permission to create sales statuses.
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
      const formData = data as CreateSalesStatusDto

      const submitData = {
        ...formData,
        statusCode: formData.statusCode?.toUpperCase() || '',
        colorCode: formData.colorCode || '#808080',
        isActive: formData.isActive ?? true,
        isDefault: formData.isDefault ?? false,
        sequence: Number(formData.sequence) || 1,
        allowsSale: formData.allowsSale ?? false,
        requiresApproval: formData.requiresApproval ?? false,
        statusType: (formData.statusType || 'available') as SalesStatusType
      }

      await createMutation.mutateAsync(submitData)
      customToast.success('Sales status created successfully')
      router.push('/sales-status')
    } catch (error) {
      customToast.error(
        'Failed to create sales status' +
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

        <h1 className='text-3xl font-bold'>Create New Sales Status</h1>
        <p className='text-gray-500 mt-2'>
          Define a new sales status for plot management
        </p>
      </div>

      <Card>
        <CardContent className='pt-6'>
          <EntityForm
            schema={salesStatusSchema}
            fields={salesStatusFormFields}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel='Create Status'
            cancelLabel='Cancel'
            isLoading={createMutation.isPending}
            defaultValues={{
              statusType: 'available',
              colorCode: '#808080',
              isActive: true,
              isDefault: false,
              sequence: 1,
              allowsSale: false,
              requiresApproval: false
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
