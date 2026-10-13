// src/app/(dashboard)/states/view/[id]/page.tsx
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
import { useState } from '@/lib/hooks/entities/useState'
import { useAuth } from '@/lib/hooks/useAuth'
import { formatDate } from '@/lib/utils/format'

import { ArrowLeft, Building2, Calendar, MapPin, Plus } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

export default function ViewStatePage () {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()

  const id = params.id as string
  const { data: state, isLoading, error } = useState(id)

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
      <SidebarProvider>
        <AppSidebar variant='inset' />
        <SidebarInset>
          <SiteHeader />
          <div className='p-6'>
            <div className='space-y-4'>
              <Skeleton className='h-8 w-48' />
              <Skeleton className='h-4 w-96' />
              <Skeleton className='h-[400px] w-full' />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (error || !state) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>State Not Found</CardTitle>
            <CardDescription>
              The state you&apos;re looking for doesn&apos;t exist.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/states')}>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to States
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusName =
    typeof state.statusId === 'object'
      ? state.statusId.statusName
      : state.statusId || 'Active'

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
          <h1 className='text-3xl font-bold'>{state.stateName}</h1>
          <p className='text-muted-foreground'>State Details</p>
        </div>

        <div className='flex gap-2'>
          {canUpdate && (
            <Button asChild>
              <Link href={`/states/edit/${state._id}`}>Edit State</Link>
            </Button>
          )}
          <Button variant='outline' asChild>
            <Link href='/states'>View All States</Link>
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
                State Information
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-muted-foreground'>State Name</p>
                  <p className='font-medium text-lg'>{state.stateName}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Status</p>
                  <Badge
                    variant={
                      statusName.toLowerCase() === 'active'
                        ? 'default'
                        : statusName.toLowerCase() === 'inactive'
                        ? 'destructive'
                        : 'outline'
                    }
                  >
                    {statusName}
                  </Badge>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Total Cities</p>
                  <div className='flex items-center gap-2'>
                    <Building2 className='h-4 w-4 text-muted-foreground' />
                    <p className='font-medium text-lg'>
                      {state.cityCount || 0}
                    </p>
                  </div>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Created Date</p>
                  <div className='flex items-center gap-2'>
                    <Calendar className='h-4 w-4 text-muted-foreground' />
                    <p className='font-medium'>{formatDate(state.createdAt)}</p>
                  </div>
                </div>
              </div>

              {state.stateDescription && (
                <div>
                  <p className='text-sm text-muted-foreground'>Description</p>
                  <p className='font-medium whitespace-pre-wrap'>
                    {state.stateDescription}
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
              <Button className='w-full' asChild>
                <Link href={`/states/${state._id}/cities`}>
                  <Building2 className='mr-2 h-4 w-4' />
                  View Cities in this State
                </Link>
              </Button>

              <Button variant='outline' className='w-full' asChild>
                <Link href={`/cities?stateId=${state._id}`}>
                  Filter Cities by this State
                </Link>
              </Button>

              {canUpdate && (
                <Button variant='outline' className='w-full' asChild>
                  <Link href={`/states/edit/${state._id}`}>
                    Edit State Details
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

          {/* Add City Card */}
          <Card>
            <CardHeader>
              <CardTitle>Add New City</CardTitle>
              <CardDescription>Create a new city in this state</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className='w-full' asChild>
                <Link href={`/cities/create?stateId=${state._id}`}>
                  <Plus className='mr-2 h-4 w-4' />
                  Add City
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* System Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>State ID:</span>
                <span className='font-mono'>{state._id.slice(-8)}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Record Type:</span>
                <span>State</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
