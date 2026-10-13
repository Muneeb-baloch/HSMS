'use client'

import {
  EntityForm,
  FieldConfig
} from '@/components/shared/EntityForm/EntityForm'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import { useCreateBooking } from '@/lib/hooks/entities/useFacilityBooking'
import { useAuth } from '@/lib/hooks/useAuth'
import { customToast } from '@/lib/utils/customToast'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'

const facilityBookingSchema = z.object({
  facilityId: z.string().min(1, 'Facility is required'),
  bookingDate: z.string().min(1, 'Booking date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  purpose: z.string().optional(),
  numberOfGuests: z.coerce.number().min(1).default(1),
  remarks: z.string().optional()
})

type FacilityBookingFormData = z.infer<typeof facilityBookingSchema>

const bookingFormFields: FieldConfig<FacilityBookingFormData>[] = [
  {
    name: 'facilityId',
    label: 'Facility',
    type: 'relationship',
    required: true,
    relationship: {
      endpoint: '/facilities',
      labelField: 'facilityName',
      valueField: '_id',
      searchable: true,
      filter: (item: any) => item.isActive !== false
    }
  },
  {
    name: 'bookingDate',
    label: 'Booking Date',
    type: 'date',
    required: true
  },
  {
    name: 'startTime',
    label: 'Start Time',
    type: 'text',
    required: true,
    placeholder: 'e.g., 10:00 AM'
  },
  {
    name: 'endTime',
    label: 'End Time',
    type: 'text',
    required: true,
    placeholder: 'e.g., 02:00 PM'
  },
  {
    name: 'purpose',
    label: 'Purpose',
    type: 'text',
    required: false,
    placeholder: 'e.g., Birthday party, Meeting, etc.'
  },
  {
    name: 'numberOfGuests',
    label: 'Expected Number of Guests',
    type: 'number',
    required: false,
    min: 1,
    placeholder: '1'
  },
  {
    name: 'remarks',
    label: 'Additional Remarks',
    type: 'textarea',
    required: false,
    placeholder: 'Any special requirements or notes',
    rows: 3
  }
]

export default function CreateFacilityBookingPage () {
  const router = useRouter()
  const { user } = useAuth()
  const createMutation = useCreateBooking()

  const canCreate =
    user &&
    hasPermission(user.role as UserRole, [
      UserRole.USER,
      UserRole.MODERATOR,
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
              You don&apos;t have permission to create bookings.
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

  const handleSubmit = async (data: FacilityBookingFormData) => {
    try {
      await createMutation.mutateAsync(data)
      customToast.success('Booking created successfully')
      router.push('/facility-bookings')
    } catch (error: unknown) {
      let errorMessage = 'Failed to create booking'
      if (typeof error === 'object' && error !== null) {
        const err = error as {
          message?: string
          response?: { data?: { message?: string } }
        }
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message
        } else if (err.message) {
          errorMessage = err.message
        }
      }
      customToast.error(errorMessage)
    }
  }

  const handleCancel = () => router.back()

  return (
    <div className='p-6'>
      <Button variant='ghost' onClick={() => router.back()} className='mb-4'>
        <ArrowLeft className='mr-2 h-4 w-4' />
        Back to Bookings
      </Button>

      <h1 className='text-3xl font-bold'>Book a Facility</h1>
      <p className='text-gray-500 mt-2'>
        Select a facility and choose your preferred date and time slot
      </p>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6'>
        <div className='lg:col-span-2'>
          <Card>
            <CardContent className='pt-6'>
              <EntityForm
                schema={facilityBookingSchema}
                fields={bookingFormFields}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                submitLabel='Create Booking'
                cancelLabel='Cancel'
                isLoading={createMutation.isPending}
              />
            </CardContent>
          </Card>
        </div>

        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Booking Tips</CardTitle>
            </CardHeader>
            <CardContent className='text-sm space-y-3'>
              <p>
                - Select an active facility to see available time slots
              </p>
              <p>
                - Some facilities may require admin approval before
                confirmation
              </p>
              <p>
                - A security deposit may be required for certain facilities
              </p>
              <p>
                - Please cancel at least 24 hours in advance if you cannot
                attend
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
