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
import { plotSizeFormFields } from '@/lib/constants/plotsizeForm.constants'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import { useCreatePlotSize } from '@/lib/hooks/entities/usePlotSize'
import { useProjects } from '@/lib/hooks/entities/useProject'
import { useAuth } from '@/lib/hooks/useAuth'
import { plotSizeSchema } from '@/lib/schemas/plotsize.schema'
import { CreatePlotSizeDto } from '@/lib/types/plotsize'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { customToast } from '@/lib/utils/customToast'

export default function CreatePlotSizePage () {
  const router = useRouter()
  const { user } = useAuth()
  const createMutation = useCreatePlotSize()
  const { data: projects } = useProjects({ limit: 100 })

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
              You don&apos;t have permission to create plot sizes.
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
      const formData = data as CreatePlotSizeDto & { projectId?: string; totalArea?: number; areaUnit?: string }

      // PlotSize is a template, not allocated land - no project capacity check needed.
      // Backend validates PlotBlock capacity against Project, not PlotSize.
      // Different units are allowed at each level; validation uses canonical sqft.

      // Transform data - convert strings to numbers
      const submitData = {
        ...formData,
        totalArea: Number(formData.totalArea),
        ratePerUnit: Number(formData.ratePerUnit),
        standardBasePrice: formData.standardBasePrice
          ? Number(formData.standardBasePrice)
          : undefined
      }

      await createMutation.mutateAsync(submitData)
      customToast.success('Plot Size created successfully')
      router.push('/plotsizes')
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
          Back to Plot Sizes
        </Button>

        <h1 className='text-3xl font-bold'>Create New Plot Size</h1>
        <p className='text-gray-500 mt-2'>
          Define a new plot size with area and pricing information.
        </p>
      </div>

      <Card>
        <CardContent className='pt-6'>
          <EntityForm
            schema={plotSizeSchema}
            fields={plotSizeFormFields}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel='Create Plot Size'
            cancelLabel='Cancel'
            isLoading={createMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  )
}
