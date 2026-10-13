// src/app/(dashboard)/cities/edit/[id]/page.tsx
'use client'

import { AppSidebar } from '@/components/app-sidebar'
import { EntityForm } from '@/components/shared/EntityForm/EntityForm'
import { SiteHeader } from '@/components/site-header'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { cityFormFields } from '@/lib/constants/cityForm.constants'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import { useCity, useUpdateCity } from '@/lib/hooks/entities/useCity'
import { useAuth } from '@/lib/hooks/useAuth'
import { citySchema } from '@/lib/schemas/city.schema'
import { UpdateCityDto } from '@/lib/types/city'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { customToast } from "@/lib/utils/customToast"
import { FormPageSkeleton } from '@/components/shared/PageSkeleton'

export default function EditCityPage () {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const updateMutation = useUpdateCity()

  const id = params.id as string
  const { data: city, isLoading, error } = useCity(id)

  const canUpdate =
    user &&
    hasPermission(
      user.role as UserRole,
      [UserRole.ADMIN, UserRole.SUPER_ADMIN] as UserRole[]
    )

  if (!canUpdate) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to edit cities.
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

  if (error || !city) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Failed to load city data.</CardDescription>
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

  // Prepare default values
  const defaultValues = {
    ...city,
    stateId:
      typeof city.stateId === 'object' ? city.stateId._id : city.stateId || '',
    statusId:
      typeof city.statusId === 'object'
        ? city.statusId._id
        : city.statusId || ''
  }

  const handleSubmit = async (data: unknown) => {
    try {
      await updateMutation.mutateAsync({ id, data: data as UpdateCityDto })
      customToast.success('City updated successfully')
      router.push('/cities')
    } catch (error) {
      customToast.error(
        'Failed to update city' +
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

        <h1 className='text-3xl font-bold'>Edit City</h1>
        <p className='text-gray-500 mt-2'>Update city information.</p>
      </div>

      <Card>
        <CardContent className='pt-6'>
          <EntityForm
            schema={citySchema}
            fields={cityFormFields}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel='Update City'
            cancelLabel='Cancel'
            isLoading={updateMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  )
}
