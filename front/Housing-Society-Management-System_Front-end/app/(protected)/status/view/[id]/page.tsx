// src/app/(dashboard)/states/view/[id]/page.tsx
'use client'

import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
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
import { useStatus } from '@/lib/hooks/entities/useStatus'
import { useAuth } from '@/lib/hooks/useAuth'
import { formatDate } from '@/lib/utils/format'

import { ArrowLeft, Calendar, MapPin } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

export default function ViewStatusPage () {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()

  const id = params.id as string
  const { data: state, isLoading, error } = useStatus(id)

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

  if (error || !state) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Status Not Found</CardTitle>
            <CardDescription>
              The status you&apos;re looking for doesn&apos;t exist.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/status')}>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Statuses
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
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
          <h1 className='text-3xl font-bold'>{state.statusName}</h1>
          <p className='text-muted-foreground'>Status Details</p>
        </div>

        <div className='flex gap-2'>
          {canUpdate && (
            <Button asChild>
              <Link href={`/status/edit/${state._id}`}>Edit Status</Link>
            </Button>
          )}
          <Button variant='outline' asChild>
            <Link href='/status'>View All Statuses</Link>
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Left Column: State Info */}
        <div className='lg:col-span-2 space-y-6'>
          {/* State Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <MapPin className='h-5 w-5' />
                Status Information
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-muted-foreground'>Status Name</p>
                  <p className='font-medium text-lg'>{state.statusName}</p>
                </div>

                <div>
                  <p className='text-sm text-muted-foreground'>Created Date</p>
                  <div className='flex items-center gap-2'>
                    <Calendar className='h-4 w-4 text-muted-foreground' />
                    <p className='font-medium'>{formatDate(state.createdAt)}</p>
                  </div>
                </div>
              </div>

              {state.statusDescription && (
                <div>
                  <p className='text-sm text-muted-foreground'>Description</p>
                  <p className='font-medium whitespace-pre-wrap'>
                    {state.statusDescription}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              {canUpdate && (
                <Button variant='outline' className='w-full' asChild>
                  <Link href={`/status/edit/${state._id}`}>
                    Edit Status Details
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Statistics & Meta */}
        <div className='space-y-6'>
          {/* Statistics Card */}
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-muted-foreground'>Created</span>
                  <span className='font-medium'>
                    {formatDate(state.createdAt)}
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-muted-foreground'>Updated</span>
                  <span className='font-medium'>
                    {formatDate(state.updatedAt)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Status ID:</span>
                <span className='font-mono'>{state._id.slice(-8)}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Record Type:</span>
                <span>Status</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
