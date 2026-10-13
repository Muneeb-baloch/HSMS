// src/app/(dashboard)/cities/create/page.tsx
'use client'

import { EntityForm } from '@/components/shared/EntityForm/EntityForm'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { cityFormFields } from '@/lib/constants/cityForm.constants'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import { useCreateCity } from '@/lib/hooks/entities/useCity'
import { useAuth } from '@/lib/hooks/useAuth'
import { citySchema } from '@/lib/schemas/city.schema'
import { CreateCityDto } from '@/lib/types/city'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { customToast } from '@/lib/utils/customToast'

export default function CreateCityPage () {
  const router = useRouter()
  const { user } = useAuth()
  const createMutation = useCreateCity()

  const canCreate =
    user &&
    hasPermission(
      user.role as UserRole,
      [UserRole.ADMIN, UserRole.SUPER_ADMIN] as UserRole[]
    )

  if (!canCreate) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to create cities.
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

  const handleSubmit = async (data: unknown) => {
    try {
      await createMutation.mutateAsync(data as CreateCityDto)
      customToast.success('City created successfully')
      router.push('/cities')
    } catch (error) {
      customToast.error(
        'Failed to create city' +
          (error instanceof Error ? `: ${error.message}` : '')
      )
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className='p-6'>
      <div className='mb-6'>
        <Button variant='ghost' onClick={() => router.back()} className='mb-4'>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back to Cities
        </Button>

        <h1 className='text-3xl font-bold'>Create New City</h1>
        <p className='text-gray-500 mt-2'>
          Fill in all the required information to create a new city.
        </p>
      </div>

      <Card>
        <CardContent className='pt-6'>
          <EntityForm
            schema={citySchema}
            fields={cityFormFields}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel='Create City'
            cancelLabel='Cancel'
            isLoading={createMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  )
}
