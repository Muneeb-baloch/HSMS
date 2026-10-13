// src/app/(dashboard)/userstaff/edit/[id]/page.tsx
'use client'

import { EntityForm } from '@/components/shared/EntityForm/EntityForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { hasPermission, UserRole as UserRoleEnum } from '@/lib/constants/roles'
import { userStaffFormFields } from '@/lib/constants/userstaffForm.constants'
import { useActiveRoles } from '@/lib/hooks/entities/useUserRole'
import {
  useUpdateUserStaff,
  useUserStaff
} from '@/lib/hooks/entities/useUserStaff'
import { useAuth } from '@/lib/hooks/useAuth'
import { userStaffSchema } from '@/lib/schemas/userstaff.schema'
import { UpdateUserStaffDto } from '@/lib/types/userStaff'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { FormPageSkeleton } from '@/components/shared/PageSkeleton'

export default function EditUserStaffPage () {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const { user } = useAuth()
  const { id } = params

  const { data: userStaff, isLoading: isLoadingUser, error } = useUserStaff(id)
  const updateMutation = useUpdateUserStaff()

  const { data: roles = [], isLoading: isLoadingRoles } = useActiveRoles()

  const canUpdate =
    user &&
    hasPermission(
      user.role as UserRoleEnum,
      [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN] as UserRoleEnum[]
    )

  useEffect(() => {
    if (!canUpdate) {
      router.push('/userstaff')
    }
  }, [canUpdate, router])

  if (!canUpdate) {
    return null
  }

  if (isLoadingUser || isLoadingRoles) {
    return <FormPageSkeleton />
  }

  if (error || !userStaff) {
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
              <h3 className='text-lg font-medium mb-2'>User Not Found</h3>
              <p className='text-muted-foreground'>
                The user you're trying to edit doesn't exist or you don't have
                permission to access it.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
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

  const handleSubmit = async (data: UpdateUserStaffDto) => {
    try {
      await updateMutation.mutateAsync({ id, data })
      router.push('/userstaff')
    } catch (error) {
      console.error('Failed to update user:', error)
    }
  }

  const handleCancel = () => {
    router.push('/userstaff')
  }

  // Prepare default values for the form - ensure they're always defined
  const defaultValues = userStaff
    ? {
        userName: userStaff.userName,
        fullName: userStaff.fullName,
        cnic: userStaff.cnic,
        mobileNo: userStaff.mobileNo || '',
        email: userStaff.email || '',
        roleId: (userStaff.roleId as any)?._id || '',
        cityId: (userStaff.cityId as any)?._id || '',
        designation: userStaff.designation || '',
        isActive: userStaff.isActive
      }
    : {
        userName: '',
        fullName: '',
        cnic: '',
        mobileNo: '',
        email: '',
        roleId: '',
        cityId: '',
        designation: '',
        isActive: true
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
          <CardTitle className='text-2xl'>Edit User</CardTitle>
        </CardHeader>
        <CardContent>
          <EntityForm
            schema={userStaffSchema}
            fields={dynamicFormFields}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={updateMutation.isPending}
            defaultValues={defaultValues}
            submitLabel='Update User'
            cancelLabel='Cancel'
          />
        </CardContent>
      </Card>
    </div>
  )
}
