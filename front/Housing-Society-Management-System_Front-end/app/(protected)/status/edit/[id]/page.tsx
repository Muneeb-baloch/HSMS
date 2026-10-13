// src/app/(dashboard)/states/edit/[id]/page.tsx
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
import { hasPermission, UserRole } from '@/lib/constants/roles'
import { statusFormFields } from '@/lib/constants/statusForm.constants'

import { useStatus, useUpdateStatus } from '@/lib/hooks/entities/useStatus'
import { useAuth } from '@/lib/hooks/useAuth'
import { statusSchema } from '@/lib/schemas/status.schema'
import { UpdateStatusDto } from '@/lib/types/status'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { customToast } from "@/lib/utils/customToast"
import { FormPageSkeleton } from '@/components/shared/PageSkeleton'

export default function EditStatusPage () {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const updateMutation = useUpdateStatus()

  const id = params.id as string
  const { data: state, isLoading, error } = useStatus(id)

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
              You don&apos;t have permission to edit statuses.
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
            <CardDescription>Failed to load status data.</CardDescription>
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
    ...state
  }

  const handleSubmit = async (data: unknown) => {
    try {
      await updateMutation.mutateAsync({ id, data: data as UpdateStatusDto })
      customToast.success('Status updated successfully')
      router.push('/status')
    } catch (error) {
      customToast.error(
        'Failed to update status' +
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
          Back to Statuses
        </Button>

        <h1 className='text-3xl font-bold'>Edit Status</h1>
        <p className='text-gray-500 mt-2'>Update status information.</p>
      </div>

      <Card>
        <CardContent className='pt-6'>
          <EntityForm
            schema={statusSchema}
            fields={statusFormFields}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel='Update Status'
            cancelLabel='Cancel'
            isLoading={updateMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  )
}
