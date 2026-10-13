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
import { useCreateVisitor } from '@/lib/hooks/entities/useVisitor'
import { useAuth } from '@/lib/hooks/useAuth'
import { customToast } from '@/lib/utils/customToast'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'

const visitorSchema = z.object({
  visitorName: z.string().min(1, 'Visitor name is required'),
  visitorPhone: z.string().min(1, 'Phone number is required'),
  purpose: z.string().min(1, 'Purpose is required'),
  hostMemberId: z.string().min(1, 'Host member is required'),
  expectedDate: z.string().min(1, 'Expected date is required'),
  expectedTimeIn: z.string().optional(),
  expectedTimeOut: z.string().optional(),
  vehicleNumber: z.string().optional(),
  vehicleType: z.string().optional(),
  numberOfGuests: z.coerce.number().min(1).default(1),
  remarks: z.string().optional()
})

type VisitorFormData = z.infer<typeof visitorSchema>

const visitorFormFields: FieldConfig<VisitorFormData>[] = [
  {
    name: 'visitorName',
    label: 'Visitor Name',
    type: 'text',
    required: true,
    placeholder: 'Enter visitor full name'
  },
  {
    name: 'visitorPhone',
    label: 'Phone Number',
    type: 'text',
    required: true,
    placeholder: 'Enter phone number'
  },
  {
    name: 'purpose',
    label: 'Purpose of Visit',
    type: 'select',
    required: true,
    options: [
      { label: 'Personal Visit', value: 'personal_visit' },
      { label: 'Delivery', value: 'delivery' },
      { label: 'Maintenance', value: 'maintenance' },
      { label: 'Official', value: 'official' },
      { label: 'Event', value: 'event' },
      { label: 'Other', value: 'other' }
    ]
  },
  {
    name: 'hostMemberId',
    label: 'Host Member',
    type: 'relationship',
    required: true,
    relationship: {
      endpoint: '/members',
      labelField: 'memName',
      valueField: '_id',
      searchable: true
    }
  },
  {
    name: 'expectedDate',
    label: 'Expected Date',
    type: 'date',
    required: true
  },
  {
    name: 'expectedTimeIn',
    label: 'Expected Time In',
    type: 'text',
    required: false,
    placeholder: 'e.g., 10:00 AM'
  },
  {
    name: 'expectedTimeOut',
    label: 'Expected Time Out',
    type: 'text',
    required: false,
    placeholder: 'e.g., 05:00 PM'
  },
  {
    name: 'vehicleNumber',
    label: 'Vehicle Number',
    type: 'text',
    required: false,
    placeholder: 'Enter vehicle number (if any)'
  },
  {
    name: 'vehicleType',
    label: 'Vehicle Type',
    type: 'select',
    required: false,
    options: [
      { label: 'Car', value: 'car' },
      { label: 'Motorcycle', value: 'motorcycle' },
      { label: 'Van', value: 'van' },
      { label: 'Truck', value: 'truck' },
      { label: 'Bicycle', value: 'bicycle' },
      { label: 'Other', value: 'other' }
    ]
  },
  {
    name: 'numberOfGuests',
    label: 'Number of Guests',
    type: 'number',
    required: false,
    min: 1,
    placeholder: '1'
  },
  {
    name: 'remarks',
    label: 'Remarks',
    type: 'textarea',
    required: false,
    placeholder: 'Any additional notes or instructions'
  }
]

export default function CreateVisitorPage () {
  const router = useRouter()
  const { user } = useAuth()
  const createMutation = useCreateVisitor()

  const canCreate =
    user &&
    hasPermission(user.role as UserRole, [
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
              You don&apos;t have permission to register visitors.
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

  const handleSubmit = async (data: VisitorFormData) => {
    try {
      await createMutation.mutateAsync(data as any)
      customToast.success('Visitor registered successfully')
      router.push('/visitors')
    } catch (error: unknown) {
      let errorMessage = 'Failed to register visitor'
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
        Back to Visitors
      </Button>

      <h1 className='text-3xl font-bold'>Register New Visitor</h1>
      <p className='text-gray-500 mt-2'>
        Fill in the visitor details to generate a visitor pass
      </p>

      <div className='mt-6 max-w-4xl'>
        <Card>
          <CardContent className='pt-6'>
            <EntityForm
              schema={visitorSchema}
              fields={visitorFormFields}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              submitLabel='Register Visitor'
              cancelLabel='Cancel'
              isLoading={createMutation.isPending}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
