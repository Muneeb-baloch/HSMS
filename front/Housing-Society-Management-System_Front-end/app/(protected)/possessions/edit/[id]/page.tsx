// src/app/(dashboard)/permissions/edit/[id]/page.tsx
'use client'

import { EntityForm } from '@/components/shared/EntityForm/EntityForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import { userPermissionFormFields } from '@/lib/constants/userpermissionForm.constants'
import {
  useUpdateUserPermission,
  useUserPermission
} from '@/lib/hooks/entities/useUserPermission'
import { useAuth } from '@/lib/hooks/useAuth'
import { userPermissionSchema } from '@/lib/schemas/userpermission.schema'
import { UpdateUserPermissionDto } from '@/lib/types/userpermission'
import { ArrowLeft } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { FormPageSkeleton } from '@/components/shared/PageSkeleton'

export default function EditPermissionPage () {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()

  const id = params.id as string
  const { data: permission, isLoading: isLoadingPermission } =
    useUserPermission(id)
  const updateMutation = useUpdateUserPermission()

  const canUpdate =
    user &&
    hasPermission(
      user.role as UserRole,
      [UserRole.ADMIN, UserRole.SUPER_ADMIN] as UserRole[]
    )

  if (!canUpdate) {
    router.push('/permissions')
    return null
  }

  const handleSubmit = async (data: UpdateUserPermissionDto) => {
    try {
      await updateMutation.mutateAsync({ id, data })
      router.push(`/permissions/view/${id}`)
    } catch (error) {
      console.error('Failed to update permission:', error)
    }
  }

  const handleCancel = () => {
    router.push(`/permissions/view/${id}`)
  }

  if (isLoadingPermission) {
    return <FormPageSkeleton />
  }

  if (!permission) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Permission Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/permissions')}>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Permissions
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const defaultValues = {
    srModuleId:
      typeof permission.srModuleId === 'object'
        ? permission.srModuleId._id
        : permission.srModuleId,
    roleId:
      typeof permission.roleId === 'object'
        ? permission.roleId._id
        : permission.roleId,
    canRead: permission.canRead,
    canCreate: permission.canCreate,
    canUpdate: permission.canUpdate,
    canDelete: permission.canDelete,
    canExport: permission.canExport || false,
    canImport: permission.canImport || false,
    canApprove: permission.canApprove || false,
    canVerify: permission.canVerify || false,
    isActive: permission.isActive
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

      <Card>
        <CardHeader>
          <CardTitle className='text-2xl'>Edit Permission</CardTitle>
        </CardHeader>
        <CardContent>
          <EntityForm
            schema={userPermissionSchema}
            fields={userPermissionFormFields}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={updateMutation.isPending}
            submitLabel='Update Permission'
            cancelLabel='Cancel'
          />
        </CardContent>
      </Card>
    </div>
  )
}
