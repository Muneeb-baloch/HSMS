// src/app/(dashboard)/states/create/page.tsx
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
import { stateFormFields } from '@/lib/constants/stateFrom.constants'

import { useCreateState } from '@/lib/hooks/entities/useState'
import { useAuth } from '@/lib/hooks/useAuth'
import { stateSchema } from '@/lib/schemas/state.schema'
import { CreateStateDto } from '@/lib/types/state'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { customToast } from "@/lib/utils/customToast"

export default function CreateStatePage () {
  const router = useRouter()
  const { user } = useAuth()
  const createMutation = useCreateState()

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
              You don&apos;t have permission to create states.
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
      await createMutation.mutateAsync(data as CreateStateDto)
      customToast.success('State created successfully')
      router.push('/states')
    } catch (error) {
      customToast.error(
        'Failed to create state' +
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
            <Button
              variant='ghost'
              onClick={() => router.back()}
              className='mb-4'
            >
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to States
            </Button>

            <h1 className='text-3xl font-bold'>Create New State</h1>
            <p className='text-gray-500 mt-2'>
              Fill in all the required information to create a new state.
            </p>
          </div>

          <Card>
            <CardContent className='pt-6'>
              <EntityForm
                schema={stateSchema}
                fields={stateFormFields}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                submitLabel='Create State'
                cancelLabel='Cancel'
                isLoading={createMutation.isPending}
              />
            </CardContent>
          </Card>
        </div>
    
  )
}
