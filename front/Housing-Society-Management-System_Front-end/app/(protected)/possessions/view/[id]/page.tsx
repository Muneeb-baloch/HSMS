// src/app/(dashboard)/permissions/view/[id]/page.tsx
'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import { useUserPermission } from '@/lib/hooks/entities/useUserPermission'
import { useAuth } from '@/lib/hooks/useAuth'
import { AccessType } from '@/lib/types/userpermission'
import {
  ArrowLeft,
  CheckCircle,
  Edit,
  Shield,
  Trash2,
  User,
  Zap
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { DetailPageSkeleton } from '@/components/shared/PageSkeleton'
import { useConfirm } from "@/components/shared/ConfirmDialog";

export default function ViewPermissionPage () {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const { confirm } = useConfirm();

  const id = params.id as string
  const { data: permission, isLoading } = useUserPermission(id)

  const canUpdate =
    user &&
    hasPermission(
      user.role as UserRole,
      [UserRole.ADMIN, UserRole.SUPER_ADMIN] as UserRole[]
    )

  const canDelete =
    user &&
    hasPermission(
      user.role as UserRole,
      [UserRole.ADMIN, UserRole.SUPER_ADMIN] as UserRole[]
    )

  if (isLoading) {
    return <DetailPageSkeleton />
  }

  if (!permission) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Permission Not Found</CardTitle>
            <CardDescription>
              The requested permission does not exist or has been deleted.
            </CardDescription>
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

  const moduleName =
    typeof permission.srModuleId === 'object'
      ? permission.srModuleId.moduleName
      : permission.moduleName

  const moduleCode =
    typeof permission.srModuleId === 'object'
      ? permission.srModuleId.moduleCode
      : ''

  const roleName =
    typeof permission.roleId === 'object' ? permission.roleId.roleName : ''

  const roleCode =
    typeof permission.roleId === 'object' ? permission.roleId.roleCode : ''

  const accessType = permission.accessType || AccessType.NO_ACCESS

  const accessTypeColors = {
    [AccessType.NO_ACCESS]: 'bg-red-100 text-red-800',
    [AccessType.VIEW_ONLY]: 'bg-yellow-100 text-yellow-800',
    [AccessType.LIMITED_ACCESS]: 'bg-blue-100 text-blue-800',
    [AccessType.FULL_ACCESS]: 'bg-green-100 text-green-800'
  }

  const permissions = [
    { label: 'Read', value: permission.canRead },
    { label: 'Create', value: permission.canCreate },
    { label: 'Update', value: permission.canUpdate },
    { label: 'Delete', value: permission.canDelete },
    { label: 'Export', value: permission.canExport },
    { label: 'Import', value: permission.canImport },
    { label: 'Approve', value: permission.canApprove },
    { label: 'Verify', value: permission.canVerify }
  ]

  const activePermissions = permissions.filter(p => p.value)

  return (
    <div className='space-y-1'>
      <Button variant='ghost' onClick={() => router.back()} className='mb-6'>
        <ArrowLeft className='mr-2 h-4 w-4' />
        Back
      </Button>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Main Permission Card */}
        <div className='lg:col-span-2'>
          <Card className='mb-6'>
            <CardHeader>
              <div className='flex justify-between items-start'>
                <div>
                  <CardTitle className='text-2xl'>{moduleName}</CardTitle>
                  <CardDescription>
                    Permission for {roleName} role
                  </CardDescription>
                </div>
                <div className='flex gap-2'>
                  <Badge className={accessTypeColors[accessType]}>
                    {accessType}
                  </Badge>
                  <Badge
                    className={
                      permission.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }
                  >
                    {permission.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Module and Role Info */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-3'>
                  <div className='flex items-center gap-2'>
                    <Shield className='h-5 w-5 text-gray-400' />
                    <h3 className='font-semibold'>Module Information</h3>
                  </div>
                  <div className='space-y-2 pl-7'>
                    <div>
                      <div className='text-sm text-gray-500'>Module Name</div>
                      <div className='font-medium'>{moduleName}</div>
                    </div>
                    {moduleCode && (
                      <div>
                        <div className='text-sm text-gray-500'>Module Code</div>
                        <div className='font-medium'>{moduleCode}</div>
                      </div>
                    )}
                    {typeof permission.srModuleId === 'object' &&
                      permission.srModuleId.routePath && (
                        <div>
                          <div className='text-sm text-gray-500'>
                            Route Path
                          </div>
                          <div className='font-medium text-blue-600'>
                            {permission.srModuleId.routePath}
                          </div>
                        </div>
                      )}
                  </div>
                </div>

                <div className='space-y-3'>
                  <div className='flex items-center gap-2'>
                    <User className='h-5 w-5 text-gray-400' />
                    <h3 className='font-semibold'>Role Information</h3>
                  </div>
                  <div className='space-y-2 pl-7'>
                    <div>
                      <div className='text-sm text-gray-500'>Role Name</div>
                      <div className='font-medium'>{roleName}</div>
                    </div>
                    {roleCode && (
                      <div>
                        <div className='text-sm text-gray-500'>Role Code</div>
                        <div className='font-medium'>{roleCode}</div>
                      </div>
                    )}
                    {typeof permission.roleId === 'object' &&
                      permission.roleId.description && (
                        <div>
                          <div className='text-sm text-gray-500'>
                            Description
                          </div>
                          <div className='font-medium'>
                            {permission.roleId.description}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Permissions Grid */}
              <div className='space-y-4'>
                <div className='flex items-center gap-2'>
                  <Zap className='h-5 w-5 text-gray-400' />
                  <h3 className='font-semibold'>Access Permissions</h3>
                </div>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                  {permissions.map(perm => (
                    <div
                      key={perm.label}
                      className={`p-4 rounded-lg border ${
                        perm.value
                          ? 'bg-green-50 border-green-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className='flex items-center justify-between'>
                        <div className='font-medium'>{perm.label}</div>
                        {perm.value ? (
                          <CheckCircle className='h-5 w-5 text-green-600' />
                        ) : (
                          <div className='h-5 w-5' />
                        )}
                      </div>
                      <div className='text-sm text-gray-500 mt-1'>
                        {perm.value ? 'Allowed' : 'Not Allowed'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className='space-y-6'>
          {/* Permission Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Permission Stats</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-3'>
                <div className='flex justify-between items-center'>
                  <div className='text-gray-600'>Total Permissions</div>
                  <div className='font-semibold'>{permissions.length}</div>
                </div>
                <div className='flex justify-between items-center'>
                  <div className='text-gray-600'>Active Permissions</div>
                  <div className='font-semibold text-green-600'>
                    {activePermissions.length}
                  </div>
                </div>
                <div className='flex justify-between items-center'>
                  <div className='text-gray-600'>Inactive Permissions</div>
                  <div className='font-semibold text-gray-600'>
                    {permissions.length - activePermissions.length}
                  </div>
                </div>
              </div>

              <div className='pt-4 border-t'>
                <div className='text-center'>
                  <div className='text-3xl font-bold text-blue-600'>
                    {Math.round(
                      (activePermissions.length / permissions.length) * 100
                    )}
                    %
                  </div>
                  <div className='text-sm text-gray-500'>
                    Permission Coverage
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Actions</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              {canUpdate && (
                <Button
                  onClick={() => router.push(`/permissions/edit/${id}`)}
                  className='w-full'
                >
                  <Edit className='mr-2 h-4 w-4' />
                  Edit Permission
                </Button>
              )}
              {canDelete && (
                <Button
                  variant='outline'
                  onClick={() => {
                    if (
                      await confirm({ title: "Delete", description: 'Are you sure you want to delete this permission?', variant: "destructive" })
                    ) {
                      router.push('/permissions')
                    }
                  }}
                  className='w-full'
                >
                  <Trash2 className='mr-2 h-4 w-4' />
                  Delete Permission
                </Button>
              )}
              <Button
                variant='outline'
                onClick={() => router.push('/permissions')}
                className='w-full'
              >
                <ArrowLeft className='mr-2 h-4 w-4' />
                Back to Permissions
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
