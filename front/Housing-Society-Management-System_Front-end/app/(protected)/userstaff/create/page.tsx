// src/app/(dashboard)/userstaff/create/page.tsx
'use client'

import { EntityForm } from '@/components/shared/EntityForm/EntityForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { hasPermission, UserRole as UserRoleEnum } from '@/lib/constants/roles'
import { userStaffFormFields } from '@/lib/constants/userstaffForm.constants'
import { useActiveRoles } from '@/lib/hooks/entities/useUserRole'
import { useCreateUserStaff } from '@/lib/hooks/entities/useUserStaff'
import { useAuth } from '@/lib/hooks/useAuth'
import { userStaffSchema } from '@/lib/schemas/userstaff.schema'
import { CreateUserStaffDto } from '@/lib/types/userStaff'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { FormPageSkeleton } from '@/components/shared/PageSkeleton'

export default function CreateUserStaffPage () {
  const router = useRouter()
  const { user } = useAuth()
  const createMutation = useCreateUserStaff()

  const { data: roles = [], isLoading: isLoadingRoles } = useActiveRoles()

  const canCreate =
    user &&
    hasPermission(
      user.role as UserRoleEnum,
      [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN] as UserRoleEnum[]
    )

  useEffect(() => {
    if (!canCreate) {
      router.push('/userstaff')
    }
  }, [canCreate, router])

  if (!canCreate) {
    return null
  }

  // Prepare form fields with dynamic options
  const dynamicFormFields = userStaffFormFields.map(field => {
    if (field.name === 'roleId') {
      return {
        ...field,
        options: roles.map((role: any) => ({
          label: `${role.roleName} (${role.roleCode})`,
          value: role._id
        }))
      }
    }

    return field
  })

  const handleSubmit = async (data: CreateUserStaffDto) => {
    try {
      await createMutation.mutateAsync(data)
      router.push('/userstaff')
    } catch (error) {
      console.error('Failed to create user:', error)
    }
  }

  const handleCancel = () => {
    router.push('/userstaff')
  }

  // Default values for new user form
  const defaultValues = {
    userName: '',
    password: '',
    fullName: '',
    cnic: '',
    mobileNo: '',
    email: '',
    roleId: '',
    cityId: '',
    designation: '',
    isActive: true
  }

  if (isLoadingRoles) {
    return <FormPageSkeleton />
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
          <CardTitle className='text-2xl'>Create New User</CardTitle>
        </CardHeader>
        <CardContent>
          <EntityForm
            schema={userStaffSchema}
            fields={dynamicFormFields}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={createMutation.isPending}
            submitLabel='Create User'
            cancelLabel='Cancel'
          />
        </CardContent>
      </Card>
    </div>
  )
}
