// src/app/(dashboard)/roles/create/page.tsx
'use client'

import { EntityForm } from '@/components/shared/EntityForm/EntityForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { hasPermission, UserRole as UserRoleEnum } from '@/lib/constants/roles'
import { userRoleFormFields } from '@/lib/constants/userroleForm.constants'
import { useCreateUserRole } from '@/lib/hooks/entities/useUserRole'
import { useAuth } from '@/lib/hooks/useAuth'
import { userRoleSchema } from '@/lib/schemas/userrole.schema'
import { CreateUserRoleDto } from '@/lib/types/userrole'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function CreateRolePage () {
  const router = useRouter()
  const { user } = useAuth()
  const createMutation = useCreateUserRole()

  const canCreate =
    user &&
    hasPermission(
      user.role as UserRoleEnum,
      [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN] as UserRoleEnum[]
    )

  if (!canCreate) {
    router.push('/roles')
    return null
  }

  const handleSubmit = async (data: CreateUserRoleDto) => {
    try {
      await createMutation.mutateAsync(data)
      router.push('/roles')
    } catch (error) {
      console.error('Failed to create role:', error)
    }
  }

  const handleCancel = () => {
    router.push('/roles')
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
          <CardTitle className='text-2xl'>Create New Role</CardTitle>
        </CardHeader>
        <CardContent>
          <EntityForm
            schema={userRoleSchema}
            fields={userRoleFormFields}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={createMutation.isPending}
            submitLabel='Create Role'
            cancelLabel='Cancel'
          />
        </CardContent>
      </Card>
    </div>
  )
}
