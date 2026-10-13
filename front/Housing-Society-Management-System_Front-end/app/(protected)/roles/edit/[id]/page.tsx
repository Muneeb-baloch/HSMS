// src/app/(dashboard)/roles/edit/[id]/page.tsx
'use client'

import { EntityForm } from '@/components/shared/EntityForm/EntityForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { hasPermission, UserRole as UserRoleEnum } from '@/lib/constants/roles'
import { userRoleFormFields } from '@/lib/constants/userroleForm.constants'
import {
  useUpdateUserRole,
  useUserRole
} from '@/lib/hooks/entities/useUserRole'
import { useAuth } from '@/lib/hooks/useAuth'
import { userRoleSchema } from '@/lib/schemas/userrole.schema'
import { UpdateUserRoleDto } from '@/lib/types/userrole'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { FormPageSkeleton } from '@/components/shared/PageSkeleton'

export default function EditRolePage () {
  const router = useRouter()
  const { user } = useAuth()
  const params = useParams<{ id: string }>()
  const id = params?.id

  const { data: role, isLoading: isLoadingRole, error } = useUserRole(id)
  const updateMutation = useUpdateUserRole()

  const canUpdate =
    user &&
    hasPermission(
      user.role as UserRoleEnum,
      [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN] as UserRoleEnum[]
    )

  useEffect(() => {
    if (!canUpdate) {
      router.push('/roles')
    }
  }, [canUpdate, router])

  if (!canUpdate) {
    return null
  }

  if (isLoadingRole) {
    return <FormPageSkeleton />
  }

  if (error || !role) {
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
              <h3 className='text-lg font-medium mb-2'>Role Not Found</h3>
              <p className='text-muted-foreground'>
                The role you&apos;re trying to edit doesn&apos;t exist or you
                don&apos;t have permission to access it.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSubmit = async (data: UpdateUserRoleDto) => {
    try {
      await updateMutation.mutateAsync({ id, data })
      router.push('/roles')
    } catch (error) {
      console.error('Failed to update role:', error)
    }
  }

  const handleCancel = () => {
    router.push('/roles')
  }

  // Prepare default values for the form
  const defaultValues = {
    roleName: role.roleName,
    roleCode: role.roleCode,
    roleDescription: role.roleDescription || '',
    priority: role.priority,
    isActive: role.isActive
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
          <CardTitle className='text-2xl'>Edit Role</CardTitle>
        </CardHeader>
        <CardContent>
          <EntityForm
            schema={userRoleSchema}
            fields={userRoleFormFields}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={updateMutation.isPending}
            defaultValues={defaultValues}
            submitLabel='Update Role'
            cancelLabel='Cancel'
          />
        </CardContent>
      </Card>
    </div>
  )
}
