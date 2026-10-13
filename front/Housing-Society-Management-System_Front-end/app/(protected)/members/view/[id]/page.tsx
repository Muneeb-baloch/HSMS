// src/app/(dashboard)/members/view/[id]/page.tsx
'use client'

import { AppSidebar } from '@/components/app-sidebar'

import { SiteHeader } from '@/components/site-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import { useMember } from '@/lib/hooks/entities/useMember'
import { useAuth } from '@/lib/hooks/useAuth'

import { formatDate, formatPhone } from '@/lib/utils/format'
import { ArrowLeft, Mail, MapPin, Phone, User } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { MemberStatusBadge } from '../../MemberStatusBadge'

export default function ViewMemberPage () {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()

  const id = params.id as string
  const { data: member, isLoading, error } = useMember(id)

  const canUpdate =
    user &&
    hasPermission(
      user.role as UserRole,
      [UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN] as UserRole[]
    )

  const canDelete =
    user &&
    hasPermission(
      user.role as UserRole,
      [UserRole.ADMIN, UserRole.SUPER_ADMIN] as UserRole[]
    )

  if (isLoading) {
    return (

          <div className='p-6'>
            <div className='space-y-4'>
              <Skeleton className='h-8 w-48' />
              <Skeleton className='h-4 w-96' />
              <Skeleton className='h-[400px] w-full' />
            </div>
          </div>

    )
  }

  if (error || !member) {
    return (

          <div className='p-6'>
            <Card>
              <CardHeader>
                <CardTitle>Member Not Found</CardTitle>
                <CardDescription>
                  The member you&apos;re looking for doesn&apos;t exist or you
                  don&apos;t have permission to view it.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => router.push('/members')}>
                  <ArrowLeft className='mr-2 h-4 w-4' />
                  Back to Members
                </Button>
              </CardContent>
            </Card>
          </div>

    )
  }

  return (
    <SidebarProvider defaultOpen={true}>
        <div className='p-6 space-y-6'>
          {/* Header */}
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
            <div>
              <Button
                variant='ghost'
                onClick={() => router.back()}
                className='mb-4'
              >
                <ArrowLeft className='mr-2 h-4 w-4' />
                Back
              </Button>
              <h1 className='text-3xl font-bold'>Member Details</h1>
              <p className='text-muted-foreground'>
                Complete information about {member.memName}
              </p>
            </div>

            <div className='flex gap-2'>
              {canUpdate && (
                <Button asChild>
                  <Link href={`/members/edit/${member._id}`}>Edit Member</Link>
                </Button>
              )}
              <Button variant='outline' asChild>
                <Link href='/members'>View All Members</Link>
              </Button>
            </div>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* Left Column: Basic Info */}
            <div className='lg:col-span-2 space-y-6'>
              {/* Personal Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <User className='h-5 w-5' />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <p className='text-sm text-muted-foreground'>Full Name</p>
                      <p className='font-medium'>{member.memName}</p>
                    </div>
                    <div>
                      <p className='text-sm text-muted-foreground'>
                        NIC Number
                      </p>
                      <p className='font-medium'>{member.memNic}</p>
                    </div>
                    <div>
                      <p className='text-sm text-muted-foreground'>
                        Date of Birth
                      </p>
                      <p className='font-medium'>
                        {formatDate(member.dateOfBirth)}
                      </p>
                    </div>
                    <div>
                      <p className='text-sm text-muted-foreground'>Gender</p>
                      <p className='font-medium capitalize'>
                        {member.gender || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className='text-sm text-muted-foreground'>
                        Occupation
                      </p>
                      <p className='font-medium'>
                        {member.memOccupation || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className='text-sm text-muted-foreground'>
                        Registration Number
                      </p>
                      <p className='font-medium'>{member.memRegNo || 'N/A'}</p>
                    </div>
                  </div>

                  <div>
                    <p className='text-sm text-muted-foreground'>
                      Father/Husband
                    </p>
                    <p className='font-medium'>{member.memFHName || 'N/A'}</p>
                    {member.memFHRelation && (
                      <p className='text-sm text-muted-foreground capitalize'>
                        ({member.memFHRelation})
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Phone className='h-5 w-5' />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <p className='text-sm text-muted-foreground'>
                        Mobile Number
                      </p>
                      <p className='font-medium'>
                        {formatPhone(member.memContMob)}
                      </p>
                    </div>
                    <div>
                      <p className='text-sm text-muted-foreground'>
                        Residential Phone
                      </p>
                      <p className='font-medium'>
                        {member.memContRes
                          ? formatPhone(member.memContRes)
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className='text-sm text-muted-foreground'>
                        Work Phone
                      </p>
                      <p className='font-medium'>
                        {member.memContWork
                          ? formatPhone(member.memContWork)
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className='text-sm text-muted-foreground flex items-center gap-2'>
                        <Mail className='h-4 w-4' />
                        Email
                      </p>
                      <p className='font-medium truncate'>
                        {member.memContEmail || 'N/A'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Address Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <MapPin className='h-5 w-5' />
                    Address Information
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      Current Address
                    </p>
                    <p className='font-medium'>
                      {member.memAddr1}
                      {member.memAddr2 && `, ${member.memAddr2}`}
                      {member.memAddr3 && `, ${member.memAddr3}`}
                    </p>
                    <div className='mt-2 text-sm text-muted-foreground'>
                      {member.cityId && typeof member.cityId === 'object' && (
                        <p>{member.cityId.cityName}</p>
                      )}
                      {member.memState && <p>{member.memState}</p>}
                      {member.memCountry && <p>{member.memCountry}</p>}
                      {member.memZipPost && <p>ZIP: {member.memZipPost}</p>}
                    </div>
                  </div>

                  {member.memPermAdd && (
                    <div>
                      <p className='text-sm text-muted-foreground'>
                        Permanent Address
                      </p>
                      <p className='font-medium'>{member.memPermAdd}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Additional Information Card */}
              {member.memRemarks && (
                <Card>
                  <CardHeader>
                    <CardTitle>Additional Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className='whitespace-pre-wrap'>{member.memRemarks}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column: Status & Meta Info */}
            <div className='space-y-6'>
              {/* Status Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Member Status</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <MemberStatusBadge status={member.statusId} />
                    {member.memIsOverseas && (
                      <Badge
                        variant='secondary'
                        className='bg-yellow-100 text-yellow-800'
                      >
                        🌍 Overseas
                      </Badge>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <div>
                      <p className='text-sm text-muted-foreground'>Created</p>
                      <p className='font-medium'>
                        {formatDate(member.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className='text-sm text-muted-foreground'>
                        Last Updated
                      </p>
                      <p className='font-medium'>
                        {formatDate(member.updatedAt)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  {canUpdate && (
                    <Button className='w-full' asChild>
                      <Link href={`/members/edit/${member._id}`}>
                        Edit Member
                      </Link>
                    </Button>
                  )}

                  {canDelete && (
                    <Button
                      variant='outline'
                      className='w-full text-red-600 hover:text-red-700'
                      asChild
                    >
                      <Link href={`/members?delete=${member._id}`}>
                        Delete Member
                      </Link>
                    </Button>
                  )}

                  <Button variant='ghost' className='w-full' asChild>
                    <Link href={`/members?similar=${member._id}`}>
                      Find Similar Members
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* System Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle>System Information</CardTitle>
                </CardHeader>
                <CardContent className='space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Member ID:</span>
                    <span className='font-mono'>{member._id.slice(-8)}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Created By:</span>
                    <span>{'System'}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Last Updated:</span>
                    <span>{formatDate(member.updatedAt)}</span>
                  </div>
                  {member.deletedAt && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Deleted At:</span>
                      <span>{formatDate(member.deletedAt)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
    </SidebarProvider>
  )
}
