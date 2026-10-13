// src/app/(dashboard)/permissions/create/page.tsx
'use client'

import { EntityForm } from '@/components/shared/EntityForm/EntityForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import { userPermissionFormFields } from '@/lib/constants/userpermissionForm.constants'
import { useCreateUserPermission } from '@/lib/hooks/entities/useUserPermission'
import { useAuth } from '@/lib/hooks/useAuth'
import { userPermissionSchema } from '@/lib/schemas/userpermission.schema'
import { CreateUserPermissionDto } from '@/lib/types/userpermission'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function CreatePermissionPage () {
  const router = useRouter()
  const { user } = useAuth()
  const createMutation = useCreateUserPermission()

  const canCreate =
    user &&
    hasPermission(
      user.role as UserRole,
      [UserRole.ADMIN, UserRole.SUPER_ADMIN] as UserRole[]
    )

  if (!canCreate) {
    router.push('/permissions')
    return null
  }

  const handleSubmit = async (data: CreateUserPermissionDto) => {
    try {
      await createMutation.mutateAsync(data)
      router.push('/permissions')
    } catch (error) {
      console.error('Failed to create permission:', error)
    }
  }

  const handleCancel = () => {
    router.push('/permissions')
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
          <CardTitle className='text-2xl'>Create New Permission</CardTitle>
        </CardHeader>
        <CardContent>
          <EntityForm
            schema={userPermissionSchema}
            fields={userPermissionFormFields}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={createMutation.isPending}
            submitLabel='Create Permission'
            cancelLabel='Cancel'
          />
        </CardContent>
      </Card>
    </div>
  )
}
