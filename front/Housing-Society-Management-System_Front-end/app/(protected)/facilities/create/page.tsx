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
import { useCreateFacility } from '@/lib/hooks/entities/useFacility'
import { CreateFacilityDto, FacilityType } from '@/lib/types/facility'
import { useAuth } from '@/lib/hooks/useAuth'
import { customToast } from '@/lib/utils/customToast'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'

const facilitySchema = z.object({
  facilityName: z.string().min(1, 'Facility name is required'),
  facilityType: z.string().min(1, 'Facility type is required'),
  description: z.string().optional(),
  location: z.string().optional(),
  capacity: z.coerce.number().min(0).optional(),
  hourlyRate: z.coerce.number().min(0).default(0),
  halfDayRate: z.coerce.number().min(0).default(0),
  fullDayRate: z.coerce.number().min(0).default(0),
  securityDeposit: z.coerce.number().min(0).default(0),
  slotDurationMinutes: z.coerce.number().min(15).default(60),
  maxAdvanceBookingDays: z.coerce.number().min(1).default(30),
  requiresApproval: z.boolean().default(false),
  rules: z.string().optional()
})

type FacilityFormData = z.infer<typeof facilitySchema>

const facilityFormFields: FieldConfig<FacilityFormData>[] = [
  {
    name: 'facilityName',
    label: 'Facility Name',
    type: 'text',
    required: true,
    placeholder: 'e.g., Community Hall, Swimming Pool'
  },
  {
    name: 'facilityType',
    label: 'Facility Type',
    type: 'select',
    required: true,
    options: [
      { label: 'Community Hall', value: 'community_hall' },
      { label: 'Swimming Pool', value: 'swimming_pool' },
      { label: 'Gym / Fitness Center', value: 'gym' },
      { label: 'Sports Court', value: 'sports_court' },
      { label: 'Park / Garden', value: 'park' },
      { label: 'Parking Area', value: 'parking' },
      { label: 'Meeting Room', value: 'meeting_room' },
      { label: 'Banquet Hall', value: 'banquet_hall' },
      { label: 'Playground', value: 'playground' },
      { label: 'Other', value: 'other' }
    ]
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    required: false,
    placeholder: 'Describe the facility and its amenities',
    rows: 3
  },
  {
    name: 'location',
    label: 'Location',
    type: 'text',
    required: false,
    placeholder: 'e.g., Block A, Near Main Gate'
  },
  {
    name: 'capacity',
    label: 'Capacity (persons)',
    type: 'number',
    required: false,
    min: 0,
    placeholder: 'Maximum number of people'
  },
  {
    name: 'hourlyRate',
    label: 'Hourly Rate (PKR)',
    type: 'number',
    required: false,
    min: 0,
    placeholder: '0'
  },
  {
    name: 'halfDayRate',
    label: 'Half Day Rate (PKR)',
    type: 'number',
    required: false,
    min: 0,
    placeholder: '0'
  },
  {
    name: 'fullDayRate',
    label: 'Full Day Rate (PKR)',
    type: 'number',
    required: false,
    min: 0,
    placeholder: '0'
  },
  {
    name: 'securityDeposit',
    label: 'Security Deposit (PKR)',
    type: 'number',
    required: false,
    min: 0,
    placeholder: '0'
  },
  {
    name: 'slotDurationMinutes',
    label: 'Slot Duration (minutes)',
    type: 'number',
    required: false,
    min: 15,
    placeholder: '60'
  },
  {
    name: 'maxAdvanceBookingDays',
    label: 'Max Advance Booking (days)',
    type: 'number',
    required: false,
    min: 1,
    placeholder: '30'
  },
  {
    name: 'requiresApproval',
    label: 'Requires Admin Approval',
    type: 'switch',
    required: false
  },
  {
    name: 'rules',
    label: 'Rules & Guidelines',
    type: 'textarea',
    required: false,
    placeholder: 'Enter rules and guidelines for using this facility',
    rows: 4
  }
]

export default function CreateFacilityPage () {
  const router = useRouter()
  const { user } = useAuth()
  const createMutation = useCreateFacility()

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
              You don&apos;t have permission to create facilities.
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

  const handleSubmit = async (data: FacilityFormData) => {
    try {
      const dto: CreateFacilityDto = {
        ...data,
        facilityType: data.facilityType as unknown as FacilityType
      }
      await createMutation.mutateAsync(dto)
      customToast.success('Facility created successfully')
      router.push('/facilities')
    } catch (error: unknown) {
      let errorMessage = 'Failed to create facility'
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
        Back to Facilities
      </Button>

      <h1 className='text-3xl font-bold'>Add New Facility</h1>
      <p className='text-gray-500 mt-2'>
        Configure a new community facility with booking settings and rates
      </p>

      <div className='mt-6 max-w-4xl'>
        <Card>
          <CardContent className='pt-6'>
            <EntityForm
              schema={facilitySchema}
              fields={facilityFormFields}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              submitLabel='Create Facility'
              cancelLabel='Cancel'
              isLoading={createMutation.isPending}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
