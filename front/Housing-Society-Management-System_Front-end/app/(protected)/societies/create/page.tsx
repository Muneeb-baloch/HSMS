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
import { useCreateSociety } from '@/lib/hooks/entities/useSociety'
import { CreateSocietyDto } from '@/lib/types/society'
import { useAuth } from '@/lib/hooks/useAuth'
import { customToast } from '@/lib/utils/customToast'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'

const societySchema = z.object({
  societyName: z.string().min(1, 'Society name is required'),
  societyCode: z.string().min(1, 'Society code is required'),
  societyAddress: z.string().optional(),
  contactPerson: z.string().optional(),
  contactEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  contactPhone: z.string().optional(),
  description: z.string().optional(),
  logo: z.string().optional(),
  maxMembers: z.coerce.number().min(0).optional(),
  isActive: z.boolean().default(true)
})

type SocietyFormData = z.infer<typeof societySchema>

const societyFormFields: FieldConfig<SocietyFormData>[] = [
  {
    name: 'societyName',
    label: 'Society Name',
    type: 'text',
    required: true,
    placeholder: 'Enter housing society name'
  },
  {
    name: 'societyCode',
    label: 'Society Code',
    type: 'text',
    required: true,
    placeholder: 'e.g., BHS, DHA, PKG'
  },
  {
    name: 'societyAddress',
    label: 'Address',
    type: 'textarea',
    required: false,
    placeholder: 'Enter society address',
    rows: 2
  },
  {
    name: 'contactPerson',
    label: 'Contact Person',
    type: 'text',
    required: false,
    placeholder: 'Name of primary contact'
  },
  {
    name: 'contactEmail',
    label: 'Contact Email',
    type: 'email',
    required: false,
    placeholder: 'admin@society.com'
  },
  {
    name: 'contactPhone',
    label: 'Contact Phone',
    type: 'text',
    required: false,
    placeholder: 'Enter phone number'
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    required: false,
    placeholder: 'Brief description of the housing society',
    rows: 3
  },
  {
    name: 'maxMembers',
    label: 'Maximum Members',
    type: 'number',
    required: false,
    min: 0,
    placeholder: 'Leave empty for unlimited'
  },
  {
    name: 'isActive',
    label: 'Active',
    type: 'switch',
    required: false,
    defaultValue: true
  }
]

export default function CreateSocietyPage () {
  const router = useRouter()
  const { user } = useAuth()
  const createMutation = useCreateSociety()

  const canCreate =
    user &&
    hasPermission(user.role as UserRole, [UserRole.SUPER_ADMIN])

  if (!canCreate) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              Only super admins can create societies.
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

  const handleSubmit = async (data: SocietyFormData) => {
    try {
      const dto: CreateSocietyDto = {
        societyName: data.societyName,
        societyCode: data.societyCode,
        address: data.societyAddress,
        contactEmail: data.contactEmail || '',
        contactPhone: data.contactPhone || '',
        logo: data.logo,
        maxMembers: data.maxMembers
      }
      await createMutation.mutateAsync(dto)
      customToast.success('Society created successfully')
      router.push('/societies')
    } catch (error: unknown) {
      let errorMessage = 'Failed to create society'
      if (typeof error === 'object' && error !== null) {
        const err = error as {
          message?: string
          response?: { data?: { message?: string } }
          status?: number
        }
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message
        } else if (err.message) {
          errorMessage = err.message
        } else if (err.status === 409) {
          errorMessage = 'A society with this code already exists'
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
        Back to Societies
      </Button>

      <h1 className='text-3xl font-bold'>Create New Society</h1>
      <p className='text-gray-500 mt-2'>
        Set up a new housing society on the platform
      </p>

      <div className='mt-6 max-w-4xl'>
        <Card>
          <CardContent className='pt-6'>
            <EntityForm
              schema={societySchema}
              fields={societyFormFields}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              submitLabel='Create Society'
              cancelLabel='Cancel'
              isLoading={createMutation.isPending}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
