// src/app/(dashboard)/plotblocks/create/page.tsx
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
import { plotBlockFormFields } from '@/lib/constants/plotblockForm.constants'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import { useCreatePlotBlock } from '@/lib/hooks/entities/usePlotBlock'
import { useProjectAreaSummary } from '@/lib/hooks/entities/useProject'
import { useAuth } from '@/lib/hooks/useAuth'
import { plotBlockSchema } from '@/lib/schemas/plotblock.schema'
import { CreatePlotBlockDto } from '@/lib/types/plotblock'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { customToast } from '@/lib/utils/customToast'

export default function CreatePlotBlockPage () {
  const router = useRouter()
  const { user } = useAuth()
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const { data: areaSummary } = useProjectAreaSummary(selectedProjectId || undefined)

  const transformedFields = useMemo(() => {
    return plotBlockFormFields.map(field => {
      if (field.name === 'projectId') {
        return {
          ...field,
          onChange: (value: unknown) => {
            setSelectedProjectId(typeof value === 'string' ? value : '')
          }
        }
      }
      return field
    })
  }, [])

  const createMutation = useCreatePlotBlock()

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
              You don&apos;t have permission to create plot blocks.
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
      const plotBlockData = data as CreatePlotBlockDto

      // Area-vs-project-capacity validation (unit-aware, race-proof) happens
      // server-side; the live "remaining" banner above gives an early hint.
      await createMutation.mutateAsync(plotBlockData)
      customToast.success('Plot Block created successfully')
      router.push('/plotblocks')
    } catch (error) {
      customToast.error(
        'Failed to create plot block' +
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
          Back to Plot Blocks
        </Button>

        <h1 className='text-3xl font-bold'>Create New Plot Block</h1>
        <p className='text-gray-500 mt-2'>
          Fill in all the required information to create a new plot block.
        </p>
      </div>

      <Card>
        <CardContent className='pt-6'>
          {areaSummary && (
            <div className='mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900'>
              Project capacity: <strong>{areaSummary.area} {areaSummary.areaUnit}</strong>
              {' · '}Already allocated: <strong>{areaSummary.allocated} {areaSummary.areaUnit}</strong>
              {' · '}Remaining: <strong>{areaSummary.remaining} {areaSummary.areaUnit}</strong>
            </div>
          )}
          <EntityForm
            schema={plotBlockSchema}
            fields={transformedFields}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel='Create Plot Block'
            cancelLabel='Cancel'
            isLoading={createMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  )
}
