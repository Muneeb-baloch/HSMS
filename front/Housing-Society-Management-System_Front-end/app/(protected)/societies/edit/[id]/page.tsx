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
import { useSociety, useUpdateSociety } from '@/lib/hooks/entities/useSociety'
import { UpdateSocietyDto } from '@/lib/types/society'
import { useAuth } from '@/lib/hooks/useAuth'
import { customToast } from '@/lib/utils/customToast'
import { FormPageSkeleton } from '@/components/shared/PageSkeleton'
import { ArrowLeft } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { z } from 'zod'

const societySchema = z.object({
  societyName: z.string().min(1, 'Society name is required'),
  societyCode: z.string().min(1, 'Society code is required'),
  address: z.string().optional(),
  contactEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  contactPhone: z.string().optional(),
  website: z.string().optional(),
  country: z.string().optional(),
  zipCode: z.string().optional(),
  maxMembers: z.coerce.number().min(0).optional(),
  maxProjects: z.coerce.number().min(0).optional(),
  maxStaff: z.coerce.number().min(0).optional(),
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
    placeholder: 'e.g., BHS, DHA, PKG',
    disabled: true
  },
  {
    name: 'address',
    label: 'Address',
    type: 'textarea',
    required: false,
    placeholder: 'Enter society address',
    rows: 2
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
    name: 'website',
    label: 'Website',
    type: 'text',
    required: false,
    placeholder: 'https://yoursociety.com'
  },
  {
    name: 'country',
    label: 'Country',
    type: 'text',
    required: false,
    placeholder: 'Pakistan'
  },
  {
    name: 'zipCode',
    label: 'Zip Code',
    type: 'text',
    required: false,
    placeholder: '54000'
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
    name: 'maxProjects',
    label: 'Maximum Projects',
    type: 'number',
    required: false,
    min: 0,
    placeholder: 'Leave empty for unlimited'
  },
  {
    name: 'maxStaff',
    label: 'Maximum Staff',
    type: 'number',
    required: false,
    min: 0,
    placeholder: 'Leave empty for unlimited'
  },
]

export default function EditSocietyPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { user } = useAuth()
  const { data: society, isLoading } = useSociety(id)
  const updateMutation = useUpdateSociety()

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
              You do not have permission to edit societies.
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

  if (!society) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Society Not Found</CardTitle>
            <CardDescription>
              The requested society does not exist or was deleted.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/societies')}>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Societies
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSubmit = async (data: SocietyFormData) => {
    try {
      const dto: UpdateSocietyDto = {
        societyName: data.societyName,
        address: data.address,
        contactEmail: data.contactEmail || undefined,
        contactPhone: data.contactPhone || undefined,
        website: data.website || undefined,
        country: data.country || undefined,
        zipCode: data.zipCode || undefined,
        maxMembers: data.maxMembers,
        maxProjects: data.maxProjects,
        maxStaff: data.maxStaff,
      }
      await updateMutation.mutateAsync({ id, data: dto })
      customToast.success('Society updated successfully')
      router.push(`/societies/${id}`)
    } catch (error: unknown) {
      let errorMessage = 'Failed to update society'
      if (typeof error === 'object' && error !== null) {
        const err = error as {
          message?: string
          response?: { data?: { message?: string } }
        }
        errorMessage =
          err.response?.data?.message || err.message || errorMessage
      }
      customToast.error(errorMessage)
    }
  }

  const handleCancel = () => router.back()

  const defaultValues: SocietyFormData = {
    societyName: society.societyName || '',
    societyCode: society.societyCode || '',
    address: society.address || '',
    contactEmail: society.contactEmail || '',
    contactPhone: society.contactPhone || '',
    website: society.website || '',
    country: society.country || '',
    zipCode: society.zipCode || '',
    maxMembers: society.maxMembers || 0,
    maxProjects: society.maxProjects || 0,
    maxStaff: society.maxStaff || 0,
  }

  return (
    <div className='p-6'>
      <Button variant='ghost' onClick={() => router.back()} className='mb-4'>
        <ArrowLeft className='mr-2 h-4 w-4' />
        Back
      </Button>

      <h1 className='text-3xl font-bold'>Edit Society</h1>
      <p className='text-gray-500 mt-2'>
        Update {society.societyName} details
      </p>

      <div className='mt-6 max-w-4xl'>
        <Card>
          <CardContent className='pt-6'>
            <EntityForm
              schema={societySchema}
              fields={societyFormFields}
              defaultValues={defaultValues}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              submitLabel='Save Changes'
              cancelLabel='Cancel'
              isLoading={updateMutation.isPending}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
