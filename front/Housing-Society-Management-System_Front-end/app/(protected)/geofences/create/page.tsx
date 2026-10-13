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
import { useCreateGeofence } from '@/lib/hooks/entities/useAttendance'
import { useAuth } from '@/lib/hooks/useAuth'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import GeofenceForm, {
  type GeofenceFormData
} from '@/components/attendance/GeofenceForm'

export default function CreateGeofencePage () {
  const router = useRouter()
  const { user } = useAuth()
  const createMutation = useCreateGeofence()

  const canCreate =
    user &&
    hasPermission(user.role as UserRole, [
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN
    ])

  if (!canCreate) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to create geofences.
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
    await createMutation.mutateAsync({
      ...data,
      societyId: user?.societyId || ''
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

      <h1 className='text-3xl font-bold'>Add New Geofence</h1>
      <p className='text-gray-500 mt-2'>
        Define a geofence zone for attendance location tracking
      </p>

      <div className='mt-6 max-w-4xl'>
        <Card>
          <CardContent className='pt-6'>
            <GeofenceForm
              mode='create'
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={createMutation.isPending}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
