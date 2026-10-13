'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSociety } from '@/lib/hooks/entities/useSociety'
import { formatDate } from '@/lib/utils/format'
import {
  ArrowLeft,
  Building2,
  Edit,
  Globe,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Users,
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { DetailPageSkeleton } from '@/components/shared/PageSkeleton'

export default function SocietyDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const { data: society, isLoading } = useSociety(id)

  if (isLoading) {
    return <DetailPageSkeleton />
  }

  if (!society) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Society Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='mb-4 text-muted-foreground'>
              The requested society does not exist or was deleted.
            </p>
            <Button onClick={() => router.push('/societies')}>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Societies
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const subscriptionPlan =
    typeof society.subscriptionPlanId === 'object'
      ? society.subscriptionPlanId
      : null

  const city =
    typeof society.cityId === 'object' ? society.cityId : null

  const state =
    typeof society.stateId === 'object' ? society.stateId : null

  const createdBy =
    typeof society.createdBy === 'object' ? society.createdBy : null

  const statusVariant =
    society.subscriptionStatus === 'active'
      ? 'success'
      : society.subscriptionStatus === 'trial'
        ? 'warning'
        : 'destructive'

  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-start justify-between'>
        <div className='flex items-center gap-3'>
          <Button variant='ghost' size='sm' onClick={() => router.back()}>
            <ArrowLeft className='h-4 w-4' />
          </Button>
          <div>
            <h1 className='text-2xl font-bold'>{society.societyName}</h1>
            <p className='text-sm text-muted-foreground font-mono'>
              {society.societyCode}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <Badge variant={society.isActive ? 'success' : 'destructive'}>
            {society.isActive ? 'Active' : 'Inactive'}
          </Badge>
          <Button
            variant='outline'
            size='sm'
            onClick={() => router.push(`/societies/edit/${id}`)}
          >
            <Edit className='mr-2 h-4 w-4' />
            Edit
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Main Info */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Contact & Location */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-lg'>
                <Building2 className='h-5 w-5' />
                Society Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-4'>
                  <div className='flex items-start gap-3'>
                    <Mail className='mt-0.5 h-4 w-4 text-muted-foreground' />
                    <div>
                      <p className='text-sm text-muted-foreground'>
                        Contact Email
                      </p>
                      <p className='font-medium'>{society.contactEmail}</p>
                    </div>
                  </div>
                  <div className='flex items-start gap-3'>
                    <Phone className='mt-0.5 h-4 w-4 text-muted-foreground' />
                    <div>
                      <p className='text-sm text-muted-foreground'>
                        Contact Phone
                      </p>
                      <p className='font-medium'>{society.contactPhone}</p>
                    </div>
                  </div>
                  {society.website && (
                    <div className='flex items-start gap-3'>
                      <Globe className='mt-0.5 h-4 w-4 text-muted-foreground' />
                      <div>
                        <p className='text-sm text-muted-foreground'>Website</p>
                        <p className='font-medium'>{society.website}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className='space-y-4'>
                  {society.address && (
                    <div className='flex items-start gap-3'>
                      <MapPin className='mt-0.5 h-4 w-4 text-muted-foreground' />
                      <div>
                        <p className='text-sm text-muted-foreground'>Address</p>
                        <p className='font-medium'>{society.address}</p>
                        {(city || state || society.country) && (
                          <p className='text-sm text-muted-foreground'>
                            {[
                              city?.cityName,
                              state?.stateName,
                              society.country,
                              society.zipCode,
                            ]
                              .filter(Boolean)
                              .join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Limits */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-lg'>
                <Users className='h-5 w-5' />
                Capacity & Limits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-3 gap-4'>
                <div className='rounded-lg border p-4 text-center'>
                  <p className='text-2xl font-bold'>{society.maxMembers}</p>
                  <p className='text-sm text-muted-foreground'>Max Members</p>
                </div>
                <div className='rounded-lg border p-4 text-center'>
                  <p className='text-2xl font-bold'>{society.maxProjects}</p>
                  <p className='text-sm text-muted-foreground'>Max Projects</p>
                </div>
                <div className='rounded-lg border p-4 text-center'>
                  <p className='text-2xl font-bold'>{society.maxStaff}</p>
                  <p className='text-sm text-muted-foreground'>Max Staff</p>
                </div>
              </div>
              {society.enabledModules?.length > 0 && (
                <div className='mt-4'>
                  <p className='text-sm font-medium mb-2'>Enabled Modules</p>
                  <div className='flex flex-wrap gap-2'>
                    {society.enabledModules.map((mod: string) => (
                      <Badge key={mod} variant='outline'>
                        {mod}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className='space-y-6'>
          {/* Subscription */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Subscription</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 text-sm'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Status</span>
                <Badge variant={statusVariant}>
                  {society.subscriptionStatus?.toUpperCase()}
                </Badge>
              </div>
              {subscriptionPlan && (
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Plan</span>
                  <span className='font-medium'>
                    {subscriptionPlan.packageName}
                  </span>
                </div>
              )}
              {society.subscriptionStartDate && (
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Start</span>
                  <span>{formatDate(society.subscriptionStartDate)}</span>
                </div>
              )}
              {society.subscriptionEndDate && (
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Expires</span>
                  <span>{formatDate(society.subscriptionEndDate)}</span>
                </div>
              )}
              {society.trialEndsAt && (
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Trial Ends</span>
                  <span>{formatDate(society.trialEndsAt)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Audit */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Audit Info</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 text-sm'>
              <div>
                <p className='text-muted-foreground'>Created</p>
                <p className='font-medium'>{formatDate(society.createdAt)}</p>
                {createdBy && (
                  <p className='text-xs text-muted-foreground'>
                    by {createdBy.firstName} {createdBy.lastName}
                  </p>
                )}
              </div>
              <div>
                <p className='text-muted-foreground'>Last Updated</p>
                <p className='font-medium'>{formatDate(society.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              <Button
                variant='outline'
                className='w-full justify-start'
                onClick={() => router.push(`/societies/edit/${id}`)}
              >
                <Edit className='mr-2 h-4 w-4' />
                Edit Society
              </Button>
              <Button
                variant='outline'
                className='w-full justify-start'
                onClick={() => router.push('/societies')}
              >
                <Building2 className='mr-2 h-4 w-4' />
                All Societies
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
