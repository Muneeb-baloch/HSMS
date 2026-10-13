// src/app/(dashboard)/plotsizes/edit/[id]/page.tsx
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
import {
  usePlotSize,
  useUpdatePlotSize
} from '@/lib/hooks/entities/usePlotSize'
import { useAuth } from '@/lib/hooks/useAuth'
import { plotSizeSchema } from '@/lib/schemas/plotsize.schema'
import { UpdatePlotSizeDto } from '@/lib/types/plotsize'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { customToast } from "@/lib/utils/customToast"
import { FormPageSkeleton } from '@/components/shared/PageSkeleton'

export default function EditPlotSizePage () {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const updateMutation = useUpdatePlotSize()

  const id = params.id as string
  const { data: plotSize, isLoading, error } = usePlotSize(id)

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
              You don&apos;t have permission to edit plot sizes.
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

  if (error || !plotSize) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Failed to load plot size data.</CardDescription>
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
    plotSizeName: plotSize.plotSizeName,
    totalArea: plotSize.totalArea,
    areaUnit: plotSize.areaUnit,
    ratePerUnit: plotSize.ratePerUnit,
    standardBasePrice: plotSize.standardBasePrice
  }

  const handleSubmit = async (data: unknown) => {
    try {
      const formData = data as UpdatePlotSizeDto

      // Transform data - convert strings to numbers where applicable
      const submitData: any = {}
      if (formData.plotSizeName !== undefined)
        submitData.plotSizeName = formData.plotSizeName
      if (formData.totalArea !== undefined)
        submitData.totalArea = Number(formData.totalArea)
      if (formData.areaUnit !== undefined)
        submitData.areaUnit = formData.areaUnit
      if (formData.ratePerUnit !== undefined)
        submitData.ratePerUnit = Number(formData.ratePerUnit)
      if (formData.standardBasePrice !== undefined)
        submitData.standardBasePrice = Number(formData.standardBasePrice)

      await updateMutation.mutateAsync({
        id,
        data: submitData
      })
      customToast.success('Plot Size updated successfully')
      router.push('/plotsizes')
    } catch (error) {
      customToast.error(
        'Failed to update plot size' +
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

        <h1 className='text-3xl font-bold'>Edit Plot Size</h1>
        <p className='text-gray-500 mt-2'>Update plot size information.</p>
      </div>

      <Card>
        <CardContent className='pt-6'>
          <EntityForm
            schema={plotSizeSchema}
            fields={plotSizeFormFields}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel='Update Plot Size'
            cancelLabel='Cancel'
            isLoading={updateMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  )
}
