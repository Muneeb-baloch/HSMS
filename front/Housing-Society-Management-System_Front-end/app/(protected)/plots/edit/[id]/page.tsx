// src/app/(dashboard)/plots/edit/[id]/page.tsx
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
import { plotFormFields } from '@/lib/constants/plotForm.constants'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import { usePlot, useUpdatePlot } from '@/lib/hooks/entities/usePlot'
import { useBlockAreaSummary } from '@/lib/hooks/entities/usePlotBlock'
import { useAuth } from '@/lib/hooks/useAuth'
import { PlotFormData, plotSchema } from '@/lib/schemas/plot.schema'
import { UpdatePlotDto } from '@/lib/types/plot'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { customToast } from "@/lib/utils/customToast"
import { FormPageSkeleton } from '@/components/shared/PageSkeleton'

export default function EditPlotPage () {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const updateMutation = useUpdatePlot()
  const [overrideBlockId, setOverrideBlockId] = useState<string>('')

  const id = params.id as string
  const { data: plot, isLoading, error } = usePlot(id)

  const currentBlockId =
    overrideBlockId ||
    (typeof plot?.plotBlockId === 'object' ? plot?.plotBlockId?._id : plot?.plotBlockId) ||
    ''
  const { data: blockAreaSummary } = useBlockAreaSummary(currentBlockId || undefined)

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
                  You don&apos;t have permission to edit plots.
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

  if (error || !plot) {
    return (

          <div className='p-6'>
            <Card>
              <CardHeader>
                <CardTitle>Error</CardTitle>
                <CardDescription>Failed to load plot data.</CardDescription>
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
  const defaultValues: PlotFormData = {
    projectId:
      typeof plot.projectId === 'object'
        ? plot.projectId._id
        : plot.projectId || '',
    plotNo: plot.plotNo,
    plotBlockId:
      typeof plot.plotBlockId === 'object'
        ? plot.plotBlockId._id
        : plot.plotBlockId || '',
    plotSizeId:
      typeof plot.plotSizeId === 'object'
        ? plot.plotSizeId._id
        : plot.plotSizeId || '',
    plotType: plot.plotType,
    plotCategoryId:
      typeof plot.plotCategoryId === 'object'
        ? plot.plotCategoryId._id
        : plot.plotCategoryId || '',
    plotStreet: plot.plotStreet || '',
    plotLength: plot.plotLength,
    plotWidth: plot.plotWidth,
    plotAreaUnit: plot.plotAreaUnit as PlotFormData['plotAreaUnit'],
    srDevStatId:
      typeof plot.srDevStatId === 'object'
        ? plot.srDevStatId._id
        : plot.srDevStatId || '',
    salesStatusId:
      typeof plot.salesStatusId === 'object'
        ? plot.salesStatusId._id
        : plot.salesStatusId || '',
    surchargeAmount: plot.surchargeAmount,
    plotBasePrice: plot.plotBasePrice,
    plotTotalAmount: plot.plotTotalAmount,
    discountAmount: plot.discountAmount,
    discountDate: plot.discountDate
      ? new Date(plot.discountDate).toISOString().split('T')[0]
      : '',
    plotRemarks: plot.plotRemarks || '',
    plotLatitude: plot.plotLatitude || undefined,
    plotLongitude: plot.plotLongitude || undefined
  }

  const handleSubmit = async (data: unknown) => {
    try {
      await updateMutation.mutateAsync({
        id,
        data: data as UpdatePlotDto
      })
      customToast.success('Plot updated successfully')
      router.push('/plots')
    } catch (error) {
      customToast.error(
        'Failed to update plot' +
          (error instanceof Error ? `: ${error.message}` : '')
      )
    }
  }

  const handleCancel = () => {
    router.back()
  }

  const fields = plotFormFields.map(field =>
    field.name === 'plotBlockId'
      ? {
          ...field,
          onChange: (value: unknown) => {
            setOverrideBlockId(typeof value === 'string' ? value : '')
          }
        }
      : field
  )

  return (

        <div className='p-6'>
          <div className='mb-6'>
            <Button
              variant='ghost'
              onClick={() => router.back()}
              className='mb-4'
            >
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Plots
            </Button>

            <h1 className='text-3xl font-bold'>Edit Plot</h1>
            <p className='text-gray-500 mt-2'>Update plot information.</p>
            {plot.plotRegistrationNo && (
              <div className='text-sm text-gray-500'>
                Registration:{' '}
                <span className='font-medium'>{plot.plotRegistrationNo}</span>
              </div>
            )}
            {plot.isAvailable !== undefined && (
              <div className='text-sm text-gray-500'>
                Status:{' '}
                <span
                  className={`font-medium ${
                    plot.isAvailable ? 'text-green-600' : 'text-blue-600'
                  }`}
                >
                  {plot.isAvailable ? 'Available' : 'Assigned'}
                </span>
              </div>
            )}
          </div>

          <Card>
            <CardContent className='pt-6'>
              {blockAreaSummary && (
                <div className='mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900'>
                  Block capacity: <strong>{blockAreaSummary.area} {blockAreaSummary.areaUnit}</strong>
                  {' · '}Already allocated: <strong>{blockAreaSummary.allocated} {blockAreaSummary.areaUnit}</strong>
                  {' · '}Remaining: <strong>{blockAreaSummary.remaining} {blockAreaSummary.areaUnit}</strong>
                  {' '}(includes this plot&apos;s current area)
                </div>
              )}
              <EntityForm
                schema={plotSchema}
                fields={fields}
                defaultValues={defaultValues}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                submitLabel='Update Plot'
                cancelLabel='Cancel'
                isLoading={updateMutation.isPending}
              />
            </CardContent>
          </Card>
        </div>
     
  )
}
