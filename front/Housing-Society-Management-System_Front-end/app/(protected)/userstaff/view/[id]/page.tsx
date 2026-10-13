// src/app/(dashboard)/userstaff/view/[id]/page.tsx
'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { hasPermission, UserRole as UserRoleEnum } from '@/lib/constants/roles'
import { useUserStaff } from '@/lib/hooks/entities/useUserStaff'
import { useAuth } from '@/lib/hooks/useAuth'
import { formatDate } from '@/lib/utils/format'
import {
  ArrowLeft,
  Calendar,
  Edit,
  Mail,
  MapPin,
  Phone,
  Shield,
  Smartphone,
  User
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { DetailPageSkeleton } from '@/components/shared/PageSkeleton'

export default function ViewUserStaffPage () {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const { user } = useAuth()
  const { id } = params

  const { data: userStaff, isLoading, error } = useUserStaff(id)

  const canUpdate =
    user &&
    hasPermission(
      user.role as UserRoleEnum,
      [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN] as UserRoleEnum[]
    )

  if (isLoading) {
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
                The user you're trying to view doesn't exist.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getInitials = (fullName: string) => {
    const names = fullName.split(' ')
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase()
    }
    return fullName.substring(0, 2).toUpperCase()
  }

  const role = (userStaff as any).roleId
  const city = (userStaff as any).cityId
  const createdBy = (userStaff as any).createdByUser
  const updatedBy = (userStaff as any).updatedByUser

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
          <div className='flex gap-2'>
            <Button
              onClick={() => router.push(`/userstaff/edit/${id}`)}
              variant='outline'
              size='sm'
            >
              <Edit className='mr-2 h-4 w-4' />
              Edit User
            </Button>
            <Button
              onClick={() => router.push(`/userstaff/reset-password/${id}`)}
              variant='outline'
              size='sm'
            >
              <Shield className='mr-2 h-4 w-4' />
              Reset Password
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className='flex items-start gap-4'>
            <Avatar className='h-16 w-16'>
              <AvatarFallback className='text-lg'>
                {getInitials(userStaff.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className='flex-1'>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle className='text-2xl'>
                    {userStaff.fullName}
                  </CardTitle>
                  <p className='text-muted-foreground mt-1'>
                    @{userStaff.userName}
                  </p>
                </div>
                <div className='flex gap-2'>
                  <Badge
                    className={
                      userStaff.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }
                  >
                    {userStaff.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  {(userStaff as any).lockUntil &&
                    new Date((userStaff as any).lockUntil) > new Date() && (
                      <Badge className='bg-yellow-100 text-yellow-800'>
                        Locked
                      </Badge>
                    )}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Personal Information */}
          <div>
            <h3 className='text-lg font-medium mb-4'>Personal Information</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-3'>
                <div className='flex items-center gap-2'>
                  <User className='h-4 w-4 text-muted-foreground' />
                  <div>
                    <div className='text-sm text-muted-foreground'>
                      Full Name
                    </div>
                    <div className='font-medium'>{userStaff.fullName}</div>
                  </div>
                </div>

                <div className='flex items-center gap-2'>
                  <Shield className='h-4 w-4 text-muted-foreground' />
                  <div>
                    <div className='text-sm text-muted-foreground'>CNIC</div>
                    <div className='font-medium'>{userStaff.cnic}</div>
                  </div>
                </div>

                {userStaff.mobileNo && (
                  <div className='flex items-center gap-2'>
                    <Smartphone className='h-4 w-4 text-muted-foreground' />
                    <div>
                      <div className='text-sm text-muted-foreground'>
                        Mobile
                      </div>
                      <div className='font-medium'>{userStaff.mobileNo}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className='space-y-3'>
                {userStaff.email && (
                  <div className='flex items-center gap-2'>
                    <Mail className='h-4 w-4 text-muted-foreground' />
                    <div>
                      <div className='text-sm text-muted-foreground'>Email</div>
                      <div className='font-medium'>{userStaff.email}</div>
                    </div>
                  </div>
                )}

                {userStaff.designation && (
                  <div className='flex items-center gap-2'>
                    <User className='h-4 w-4 text-muted-foreground' />
                    <div>
                      <div className='text-sm text-muted-foreground'>
                        Designation
                      </div>
                      <div className='font-medium'>{userStaff.designation}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* System Information */}
          <div>
            <h3 className='text-lg font-medium mb-4'>System Information</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-3'>
                <div>
                  <div className='text-sm text-muted-foreground'>Role</div>
                  <div className='font-medium flex items-center gap-2'>
                    {role ? (
                      <>
                        <Shield className='h-4 w-4' />
                        <span>
                          {role.roleName} ({role.roleCode})
                        </span>
                      </>
                    ) : (
                      'No role assigned'
                    )}
                  </div>
                </div>

                <div>
                  <div className='text-sm text-muted-foreground'>City</div>
                  <div className='font-medium flex items-center gap-2'>
                    {city ? (
                      <>
                        <MapPin className='h-4 w-4' />
                        <span>{city.cityName}</span>
                      </>
                    ) : (
                      'No city assigned'
                    )}
                  </div>
                </div>
              </div>

              <div className='space-y-3'>
                {userStaff.lastLogin && (
                  <div className='flex items-center gap-2'>
                    <Calendar className='h-4 w-4 text-muted-foreground' />
                    <div>
                      <div className='text-sm text-muted-foreground'>
                        Last Login
                      </div>
                      <div className='font-medium'>
                        {formatDate(userStaff.lastLogin)}
                      </div>
                    </div>
                  </div>
                )}

                <div className='flex items-center gap-2'>
                  <Calendar className='h-4 w-4 text-muted-foreground' />
                  <div>
                    <div className='text-sm text-muted-foreground'>
                      Account Created
                    </div>
                    <div className='font-medium'>
                      {formatDate(userStaff.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Account Information */}
          <div>
            <h3 className='text-lg font-medium mb-4'>Account Information</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {createdBy && (
                <div>
                  <div className='text-sm text-muted-foreground'>
                    Created By
                  </div>
                  <div className='font-medium'>
                    {createdBy.fullName} (@{createdBy.userName})
                  </div>
                </div>
              )}

              {updatedBy && (
                <div>
                  <div className='text-sm text-muted-foreground'>
                    Last Updated By
                  </div>
                  <div className='font-medium'>
                    {updatedBy.fullName} (@{updatedBy.userName})
                  </div>
                </div>
              )}

              {(userStaff as any).loginAttempts !== undefined && (
                <div>
                  <div className='text-sm text-muted-foreground'>
                    Login Attempts
                  </div>
                  <div className='font-medium'>
                    {(userStaff as any).loginAttempts || 0}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className='pt-4'>
            <Separator className='mb-4' />
            <div className='flex gap-2'>
              {userStaff.email && (
                <Button variant='outline' asChild>
                  <a href={`mailto:${userStaff.email}`}>
                    <Mail className='mr-2 h-4 w-4' />
                    Send Email
                  </a>
                </Button>
              )}
              {userStaff.mobileNo && (
                <Button variant='outline' asChild>
                  <a href={`tel:${userStaff.mobileNo}`}>
                    <Phone className='mr-2 h-4 w-4' />
                    Call
                  </a>
                </Button>
              )}
              {role && (
                <Button
                  variant='outline'
                  onClick={() => router.push(`/roles/view/${role._id}`)}
                >
                  <Shield className='mr-2 h-4 w-4' />
                  View Role
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
