// src/app/(dashboard)/plotsizes/create/page.tsx
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
import { useCreatePlotType } from '@/lib/hooks/entities/usePoltType'
import { useAuth } from '@/lib/hooks/useAuth'
import { plotTypeSchema } from '@/lib/schemas/plottype.schema'
import { CreatePlotTypeDto } from '@/lib/types/plottypes'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { customToast } from "@/lib/utils/customToast"

export default function CreatePlotTypePage () {
  const router = useRouter()
  const { user } = useAuth()
  const createMutation = useCreatePlotType()

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
              You don&apos;t have permission to create plot types.
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
      await createMutation.mutateAsync(data as CreatePlotTypeDto)
      customToast.success('Plot Type created successfully')
      router.push('/plottypes')
    } catch (error) {
      customToast.error(
        'Failed to create plot size' +
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

        <h1 className='text-3xl font-bold'>Create New Plot Type</h1>
        <p className='text-gray-500 mt-2'>
          Enter plot type name (e.g., Residential, Commercial, Industrial).
        </p>
      </div>

      <Card>
        <CardContent className='pt-6'>
          <EntityForm
            schema={plotTypeSchema}
            fields={plotTypeFormFields}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel='Create Plot Type'
            cancelLabel='Cancel'
            isLoading={createMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  )
}
