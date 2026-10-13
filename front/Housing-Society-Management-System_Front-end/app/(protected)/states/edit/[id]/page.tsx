// src/app/(dashboard)/states/edit/[id]/page.tsx
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
import { hasPermission, UserRole } from '@/lib/constants/roles'
import { stateFormFields } from '@/lib/constants/stateFrom.constants'

import { useState, useUpdateState } from '@/lib/hooks/entities/useState'
import { useAuth } from '@/lib/hooks/useAuth'
import { stateSchema } from '@/lib/schemas/state.schema'
import { UpdateStateDto } from '@/lib/types/state'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { customToast } from "@/lib/utils/customToast"
import { FormPageSkeleton } from '@/components/shared/PageSkeleton'

export default function EditStatePage () {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const updateMutation = useUpdateState()

  const id = params.id as string
  const { data: state, isLoading, error } = useState(id)

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
              You don&apos;t have permission to edit states.
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

  if (error || !state) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Failed to load state data.</CardDescription>
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
    ...state,
    statusId:
      typeof state.statusId === 'object'
        ? state.statusId._id
        : state.statusId || ''
  }

  const handleSubmit = async (data: unknown) => {
    try {
      await updateMutation.mutateAsync({ id, data: data as UpdateStateDto })
      customToast.success('State updated successfully')
      router.push('/states')
    } catch (error) {
      customToast.error(
        'Failed to update state' +
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
          Back to States
        </Button>

        <h1 className='text-3xl font-bold'>Edit State</h1>
        <p className='text-gray-500 mt-2'>Update state information.</p>
      </div>

      <Card>
        <CardContent className='pt-6'>
          <EntityForm
            schema={stateSchema}
            fields={stateFormFields}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel='Update State'
            cancelLabel='Cancel'
            isLoading={updateMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  )
}
