// src/app/(dashboard)/plottypes/edit/[id]/page.tsx
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
import { plotTypeFormFields } from '@/lib/constants/plottypeForm.constants'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import {
  usePlotType,
  useUpdatePlotType
} from '@/lib/hooks/entities/usePoltType'
import { useAuth } from '@/lib/hooks/useAuth'
import { plotTypeSchema } from '@/lib/schemas/plottype.schema'
import { UpdatePlotTypeDto } from '@/lib/types/plottypes'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { customToast } from "@/lib/utils/customToast"
import { FormPageSkeleton } from '@/components/shared/PageSkeleton'

export default function EditPlotTypePage () {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const updateMutation = useUpdatePlotType()

  const id = params.id as string
  const { data: plotType, isLoading, error } = usePlotType(id)

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
              You don&apos;t have permission to edit plot types.
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

  if (error || !plotType) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Failed to load plot type data.</CardDescription>
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
    plotTypeName: plotType.plotTypeName
  }

  const handleSubmit = async (data: unknown) => {
    try {
      await updateMutation.mutateAsync({ id, data: data as UpdatePlotTypeDto })
      customToast.success('Plot Type updated successfully')
      router.push('/plottypes')
    } catch (error) {
      customToast.error(
        'Failed to update plot type' +
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
          Back to Plot Types
        </Button>

        <h1 className='text-3xl font-bold'>Edit Plot Type</h1>
        <p className='text-gray-500 mt-2'>Update plot type information.</p>
      </div>

      <Card>
        <CardContent className='pt-6'>
          <EntityForm
            schema={plotTypeSchema}
            fields={plotTypeFormFields}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel='Update Plot Type'
            cancelLabel='Cancel'
            isLoading={updateMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  )
}
