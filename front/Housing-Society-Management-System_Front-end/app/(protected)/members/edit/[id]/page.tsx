'use client'

import {
  EntityForm,
  FieldConfig
} from '@/components/shared/EntityForm/EntityForm' // Import FieldConfig
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

import { hasPermission, UserRole } from '@/lib/constants/roles'
import { useMemberById, useUpdateMember } from '@/lib/hooks/entities/useMember'
import { useAuth } from '@/lib/hooks/useAuth'
import { MemberFormData, memberSchema } from '@/lib/schemas/member.schema' // Import MemberFormData
import { UpdateMemberDto } from '@/lib/types/entity'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { customToast } from "@/lib/utils/customToast"
import { FormPageSkeleton } from '@/components/shared/PageSkeleton'

// Define fields with proper typing
const memberFormFields: FieldConfig<MemberFormData>[] = [
  // Basic Information
  {
    name: 'memName',
    label: 'Member Name',
    type: 'text',
    required: true,
    placeholder: 'Enter member name'
  },
  {
    name: 'memNic',
    label: 'NIC',
    type: 'text',
    required: true,
    placeholder: 'Enter NIC number'
  },
  {
    name: 'gender',
    label: 'Gender',
    type: 'select',
    required: false,
    options: [
      { label: 'Male', value: 'male' },
      { label: 'Female', value: 'female' },
      { label: 'Other', value: 'other' }
    ]
  },
  {
    name: 'dateOfBirth',
    label: 'Date of Birth',
    type: 'date',
    required: false
  },

  // Family Information
  {
    name: 'memFHName',
    label: 'Father/Husband Name',
    type: 'text',
    required: false,
    placeholder: 'Enter father/husband name'
  },
  {
    name: 'memFHRelation',
    label: 'Relation',
    type: 'select',
    required: false,
    options: [
      { label: 'Father', value: 'father' },
      { label: 'Husband', value: 'husband' },
      { label: 'Guardian', value: 'guardian' }
    ]
  },

  // Address Information
  {
    name: 'memAddr1',
    label: 'Address Line 1',
    type: 'text',
    required: true,
    placeholder: 'Enter address line 1'
  },
  {
    name: 'memAddr2',
    label: 'Address Line 2',
    type: 'text',
    required: false,
    placeholder: 'Enter address line 2'
  },
  {
    name: 'memAddr3',
    label: 'Address Line 3',
    type: 'text',
    required: false,
    placeholder: 'Enter address line 3'
  },
  {
    name: 'cityId',
    label: 'State & City',
    type: 'state-city',
    required: false,
    placeholder: 'Select state, then city'
  },
  {
    name: 'memZipPost',
    label: 'ZIP/Postal Code',
    type: 'text',
    required: false,
    placeholder: 'Enter ZIP/postal code'
  },
  {
    name: 'memState',
    label: 'State',
    type: 'relationship',
    required: false,
    relationship: {
      endpoint: '/states', // Make sure endpoint has leading slash
      labelField: 'stateName',
      valueField: '_id',
      searchable: true
    }
  },
  {
    name: 'memCountry',
    label: 'Country',
    type: 'text',
    required: false,
    placeholder: 'Enter country'
  },

  // Contact Information
  {
    name: 'memContMob',
    label: 'Mobile Number',
    type: 'text',
    required: true,
    placeholder: 'Enter mobile number'
  },
  {
    name: 'memContRes',
    label: 'Residential Phone',
    type: 'text',
    required: false,
    placeholder: 'Enter residential phone'
  },
  {
    name: 'memContWork',
    label: 'Work Phone',
    type: 'text',
    required: false,
    placeholder: 'Enter work phone'
  },
  {
    name: 'memContEmail',
    label: 'Email',
    type: 'email',
    required: false,
    placeholder: 'Enter email address'
  },

  // Status and Overseas Information
  {
    name: 'statusId',
    label: 'Status',
    type: 'relationship',
    required: false,
    relationship: {
      endpoint: '/status',
      labelField: 'statusName',
      valueField: '_id',
      searchable: true
    }
  },
  {
    name: 'memIsOverseas',
    label: 'Is Overseas Member',
    type: 'switch',
    required: false
  },

  // Additional Information
  {
    name: 'memOccupation',
    label: 'Occupation',
    type: 'text',
    required: false,
    placeholder: 'Enter occupation'
  },
  {
    name: 'memRemarks',
    label: 'Remarks',
    type: 'textarea',
    required: false,
    placeholder: 'Enter any remarks'
  },
  {
    name: 'memImg',
    label: 'Profile Image URL',
    type: 'text',
    required: false,
    placeholder: 'Enter image URL'
  }
]

export default function EditMemberPage () {
  const router = useRouter()
  const params = useParams()

  const { user } = useAuth()
  const updateMutation = useUpdateMember()

  const id = params.id as string
  const { data: member, isLoading, error } = useMemberById(id)

  const canUpdate =
    user &&
    hasPermission(
      user.role as UserRole,
      [UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN] as UserRole[]
    )

  if (!canUpdate) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to edit members.
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

  if (error || !member) {
    return (
      <div className='space-y-1'>
        <div className=''>
          <Card>
            <CardHeader>
              <CardTitle>Error</CardTitle>
              <CardDescription>Failed to load member data.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.back()}>
                <ArrowLeft className='mr-2 h-4 w-4' />
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Prepare default values
  const defaultValues: MemberFormData = {
    memName: member.memName,
    memNic: member.memNic,
    memAddr1: member.memAddr1,
    memContMob: member.memContMob,

    // Optional fields with fallbacks
    memFHName: member.memFHName || '',
    memFHRelation: member.memFHRelation || undefined,
    memAddr2: member.memAddr2 || '',
    memAddr3: member.memAddr3 || '',
    memContRes: member.memContRes || '',
    memContWork: member.memContWork || '',
    memContEmail: member.memContEmail || '',
    memZipPost: member.memZipPost || '',
    memRemarks: member.memRemarks || '',
    memOccupation: member.memOccupation || '',
    memPermAdd: member.memPermAdd || '',
    memPermAddress1: member.memPermAddress1 || '',
    memPermCity: member.memPermCity || '',
    memPermState: member.memPermState || '',
    memPermCountry: member.memPermCountry || '',
    memState: member.memState || '',
    memCountry: member.memCountry || '',
    memImg: member.memImg || '',

    // Relationship fields - extract ID from object
    statusId: member.statusId
      ? typeof member.statusId === 'object'
        ? member.statusId._id
        : member.statusId
      : '',
    cityId: member.cityId
      ? typeof member.cityId === 'object'
        ? member.cityId._id
        : member.cityId
      : '',

    // Boolean and enum fields
    memIsOverseas: member.memIsOverseas || false,
    gender: member.gender || undefined,

    dateOfBirth: member.dateOfBirth
      ? typeof member.dateOfBirth === 'string'
        ? member.dateOfBirth
        : new Date(member.dateOfBirth).toISOString().split('T')[0] // Format as YYYY-MM-DD
      : ''
  }

  // Update the handleSubmit to use MemberFormData
  const handleSubmit = async (data: MemberFormData) => {
    try {
      // Convert data to UpdateMemberDto if needed
      const updateData: UpdateMemberDto = {
        ...data,
        statusId: data.statusId || undefined,
        cityId: data.cityId || undefined
        // Add any other transformations here
      }

      await updateMutation.mutateAsync({ id, data: updateData })
      customToast.success('Member updated successfully')
      router.push('/members')
    } catch (error) {
      customToast.error(
        'Failed to update member' +
          (error instanceof Error ? `: ${error.message}` : '')
      )
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className='space-y-1'>
      <div className=''>
        <div className='mb-6'>
          <Button
            variant='ghost'
            onClick={() => router.back()}
            className='mb-4'
          >
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back to Members
          </Button>

          <h1 className='text-3xl font-bold'>Edit Member</h1>
          <p className='text-gray-500 mt-2'>Update member information.</p>
        </div>

        <Card>
          <CardContent className='pt-6'>
            <EntityForm
              schema={memberSchema}
              fields={memberFormFields}
              defaultValues={defaultValues}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              submitLabel='Update Member'
              cancelLabel='Cancel'
              isLoading={updateMutation.isPending}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
