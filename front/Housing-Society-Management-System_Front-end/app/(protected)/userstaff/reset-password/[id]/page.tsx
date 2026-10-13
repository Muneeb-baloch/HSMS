// src/app/(dashboard)/userstaff/reset-password/[id]/page.tsx
'use client'

import { EntityForm } from '@/components/shared/EntityForm/EntityForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { hasPermission, UserRole as UserRoleEnum } from '@/lib/constants/roles'
import {
  useResetPassword,
  useUserStaff
} from '@/lib/hooks/entities/useUserStaff'
import { useAuth } from '@/lib/hooks/useAuth'
import { resetPasswordSchema } from '@/lib/schemas/userstaff.schema'
import { ResetPasswordDto } from '@/lib/types/userStaff'
import { ArrowLeft, Key, Loader2 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { DetailPageSkeleton } from '@/components/shared/PageSkeleton'

export default function ResetPasswordPage () {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const { user } = useAuth()
  const { id } = params

  const { data: userStaff, isLoading: isLoadingUser, error } = useUserStaff(id)
  const resetMutation = useResetPassword()

  const canResetPassword =
    user &&
    hasPermission(
      user.role as UserRoleEnum,
      [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN] as UserRoleEnum[]
    )

  useEffect(() => {
    if (!canResetPassword) {
      router.push('/userstaff')
    }
  }, [canResetPassword, router])

  if (!canResetPassword) {
    return null
  }

  if (isLoadingUser) {
    return <DetailPageSkeleton />
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
                The user you're trying to reset password for doesn't exist.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const passwordFields = [
    {
      name: 'newPassword',
      label: 'New Password',
      type: 'password' as const,
      required: true,
      placeholder: 'Enter new password',
      showStrength: true
    },
    {
      name: 'confirmPassword',
      label: 'Confirm Password',
      type: 'password' as const,
      required: true,
      placeholder: 'Confirm new password'
    }
  ]

  const handleSubmit = async (data: ResetPasswordDto) => {
    try {
      await resetMutation.mutateAsync({ id, data })
      router.push(`/userstaff/view/${id}`)
    } catch (error) {
      console.error('Failed to reset password:', error)
    }
  }

  const handleCancel = () => {
    router.push(`/userstaff/view/${id}`)
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
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-yellow-100 rounded-lg'>
              <Key className='h-6 w-6 text-yellow-600' />
            </div>
            <div>
              <CardTitle className='text-2xl'>Reset Password</CardTitle>
              <p className='text-muted-foreground'>
                Reset password for <strong>{userStaff.fullName}</strong> (@
                {userStaff.userName})
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='mb-6 p-4 bg-blue-50 rounded-lg'>
            <h4 className='font-medium text-blue-800 mb-2'>
              Password Requirements:
            </h4>
            <ul className='text-sm text-blue-700 space-y-1'>
              <li>• At least 6 characters long</li>
              <li>• Include uppercase and lowercase letters</li>
              <li>• Include numbers</li>
              <li>• Include special characters (optional but recommended)</li>
            </ul>
          </div>

          <EntityForm
            schema={resetPasswordSchema}
            fields={passwordFields}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={resetMutation.isPending}
            submitLabel='Reset Password'
            cancelLabel='Cancel'
            submitButtonProps={{
              variant: 'destructive'
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
