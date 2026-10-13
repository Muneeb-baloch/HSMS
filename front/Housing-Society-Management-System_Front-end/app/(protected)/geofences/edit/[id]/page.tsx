'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import {
  useGeofences,
  useUpdateGeofence
} from '@/lib/hooks/entities/useAttendance'
import { Geofence } from '@/lib/types/attendance'
import { useAuth } from '@/lib/hooks/useAuth'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import GeofenceForm, {
import { FormPageSkeleton } from '@/components/shared/PageSkeleton'
  type GeofenceFormData
} from '@/components/attendance/GeofenceForm'

export default function EditGeofencePage () {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const id = params.id as string

  const updateMutation = useUpdateGeofence()

  const { data: geofences, isLoading } = useGeofences(user?.societyId || '')

  const canEdit =
    user &&
    hasPermission(user.role as UserRole, [
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN
    ])

  if (!canEdit) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to edit geofences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.back()}>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return <FormPageSkeleton />
  }

  const geofenceList = Array.isArray(geofences) ? geofences : []
  const geofence = geofenceList.find((g: Geofence) => g._id === id)

  if (!geofence) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Geofence Not Found</CardTitle>
            <CardDescription>
              The geofence could not be loaded or does not exist.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.back()}>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSubmit = async (data: GeofenceFormData) => {
    await updateMutation.mutateAsync({
      id,
      data: {
        ...data,
        societyId: user?.societyId || ''
      }
    })
    router.push('/geofences')
  }

  const handleCancel = () => router.back()

  return (
    <div className='p-6'>
      <Button variant='ghost' onClick={() => router.back()} className='mb-4'>
        <ArrowLeft className='mr-2 h-4 w-4' />
        Back to Geofences
      </Button>

      <h1 className='text-3xl font-bold'>Edit Geofence</h1>
      <p className='text-gray-500 mt-2'>{geofence.name}</p>

      <div className='mt-6 max-w-4xl'>
        <Card>
          <CardContent className='pt-6'>
            <GeofenceForm
              mode='edit'
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={updateMutation.isPending}
              defaultValues={{
                name: geofence.name,
                latitude: geofence.latitude,
                longitude: geofence.longitude,
                radius: geofence.radius
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
