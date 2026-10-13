// src/app/(dashboard)/roles/view/[id]/page.tsx
'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { hasPermission, UserRole as UserRoleEnum } from '@/lib/constants/roles'
import { useUserRole } from '@/lib/hooks/entities/useUserRole'
import { useAuth } from '@/lib/hooks/useAuth'
import { RoleLevel } from '@/lib/types/userrole'
import { formatDate } from '@/lib/utils/format'
import { ArrowLeft, Calendar, Edit, Hash, Shield, Users } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { DetailPageSkeleton } from '@/components/shared/PageSkeleton'

export default function ViewRolePage () {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const { user } = useAuth()
  const { id } = params

  const { data: role, isLoading, error } = useUserRole(id)

  const canUpdate =
    user &&
    hasPermission(
      user.role as UserRoleEnum,
      [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN] as UserRoleEnum[]
    )

  if (isLoading) {
    return <DetailPageSkeleton />
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
                The role you're trying to view doesn't exist.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getRoleLevel = (priority: number): string => {
    if (priority >= 900) return RoleLevel.SYSTEM
    if (priority >= 800) return RoleLevel.ADMINISTRATIVE
    if (priority >= 600) return RoleLevel.MANAGERIAL
    if (priority >= 400) return RoleLevel.OPERATIONAL
    if (priority >= 200) return RoleLevel.STAFF
    return RoleLevel.BASIC
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case RoleLevel.SYSTEM:
        return 'bg-purple-100 text-purple-800'
      case RoleLevel.ADMINISTRATIVE:
        return 'bg-red-100 text-red-800'
      case RoleLevel.MANAGERIAL:
        return 'bg-orange-100 text-orange-800'
      case RoleLevel.OPERATIONAL:
        return 'bg-blue-100 text-blue-800'
      case RoleLevel.STAFF:
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const roleLevel = getRoleLevel(role.priority)
  const levelColor = getLevelColor(roleLevel)

  return (
    <div className='space-y-1'>
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-2'>
          <Button variant='ghost' size='sm' onClick={() => router.back()}>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back
          </Button>
        </div>
        {canUpdate && (
          <Button
            onClick={() => router.push(`/roles/edit/${id}`)}
            variant='outline'
            size='sm'
          >
            <Edit className='mr-2 h-4 w-4' />
            Edit Role
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='text-2xl'>{role.roleName}</CardTitle>
              <p className='text-muted-foreground mt-1'>{role.roleCode}</p>
            </div>
            <div className='flex gap-2'>
              <Badge
                className={
                  role.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }
              >
                {role.isActive ? 'Active' : 'Inactive'}
              </Badge>
              {role.isSystem && (
                <Badge className='bg-purple-100 text-purple-800'>
                  System Role
                </Badge>
              )}
              <Badge className={levelColor}>{roleLevel}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Role Description */}
          <div>
            <h3 className='text-lg font-medium mb-2'>Description</h3>
            <p className='text-muted-foreground'>
              {role.roleDescription || 'No description provided.'}
            </p>
          </div>

          <Separator />

          {/* Role Details */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-4'>
              <h3 className='text-lg font-medium'>Role Information</h3>

              <div className='space-y-3'>
                <div className='flex items-center gap-2'>
                  <Hash className='h-4 w-4 text-muted-foreground' />
                  <div>
                    <div className='text-sm text-muted-foreground'>
                      Priority
                    </div>
                    <div className='font-medium'>{role.priority}</div>
                  </div>
                </div>

                <div className='flex items-center gap-2'>
                  <Users className='h-4 w-4 text-muted-foreground' />
                  <div>
                    <div className='text-sm text-muted-foreground'>
                      Users Assigned
                    </div>
                    <div className='font-medium'>
                      {role.userCount || 0} users
                    </div>
                  </div>
                </div>

                <div className='flex items-center gap-2'>
                  <Shield className='h-4 w-4 text-muted-foreground' />
                  <div>
                    <div className='text-sm text-muted-foreground'>
                      Permissions
                    </div>
                    <div className='font-medium'>
                      {role.permissionCount || 0} permissions
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='space-y-4'>
              <h3 className='text-lg font-medium'>Timestamps</h3>

              <div className='space-y-3'>
                <div className='flex items-center gap-2'>
                  <Calendar className='h-4 w-4 text-muted-foreground' />
                  <div>
                    <div className='text-sm text-muted-foreground'>Created</div>
                    <div className='font-medium'>
                      {formatDate(role.createdAt)}
                    </div>
                  </div>
                </div>

                <div className='flex items-center gap-2'>
                  <Calendar className='h-4 w-4 text-muted-foreground' />
                  <div>
                    <div className='text-sm text-muted-foreground'>
                      Last Updated
                    </div>
                    <div className='font-medium'>
                      {formatDate(role.updatedAt)}
                    </div>
                  </div>
                </div>

                {role.createdBy && typeof role.createdBy === 'object' && (
                  <div>
                    <div className='text-sm text-muted-foreground'>
                      Created By
                    </div>
                    <div className='font-medium'>
                      {role.createdBy.firstName} {role.createdBy.lastName}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className='pt-4'>
            <Separator className='mb-4' />
            <div className='flex gap-2'>
              <Button
                variant='outline'
                onClick={() => router.push(`/users?roleId=${id}`)}
              >
                <Users className='mr-2 h-4 w-4' />
                View Users
              </Button>
              <Button
                variant='outline'
                onClick={() => router.push('/roles/hierarchy')}
              >
                <Shield className='mr-2 h-4 w-4' />
                View Hierarchy
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
