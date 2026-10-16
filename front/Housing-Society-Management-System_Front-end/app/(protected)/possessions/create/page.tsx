'use client'

import { EntityForm } from '@/components/shared/EntityForm/EntityForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import { possessionFormFields } from '@/lib/constants/possessionForm.constants'
import { useCreatePossession } from '@/lib/hooks/entities/usePossession'
import { useAuth } from '@/lib/hooks/useAuth'
import { possessionSchema, PossessionFormData } from '@/lib/schemas/possession.schema'
import { CreatePossessionDto } from '@/lib/types/possession'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function CreatePossessionPage () {
  const router = useRouter()
  const { user } = useAuth()
  const createMutation = useCreatePossession()

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
              You don&apos;t have permission to create possession requests.
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

  const defaultValues: Partial<PossessionFormData> = {
    possessionInitDate: new Date().toISOString().split('T')[0]
  }

  const handleSubmit = async (data: PossessionFormData) => {
    try {
      const createData: CreatePossessionDto = {
        fileId: data.fileId,
        plotId: data.plotId,
        possessionInitDate: data.possessionInitDate,
        possessionHandoverCSR: data.possessionHandoverCSR,
        possessionRemarks: data.possessionRemarks,
        possessionLatitude: data.possessionLatitude,
        possessionLongitude: data.possessionLongitude
      }

      await createMutation.mutateAsync(createData)
      router.push('/possessions')
    } catch {
      // Blocking reason (e.g. "Outstanding dues: Rs 45,000", "Possession is
      // blocked: plot is not possession-ready") is already toasted by
      // useCreatePossession's onError - nothing further to do here.
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className='p-6 space-y-6'>
      <div>
        <Button variant='ghost' onClick={() => router.back()} className='mb-4'>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back to Possessions
        </Button>

        <h1 className='text-3xl font-bold'>Request Possession</h1>
        <p className='text-gray-500 mt-2'>
          The plot is derived from the selected file - the file must be fully paid and
          possession-ready before a request can be created.
        </p>
      </div>

      <Card>
        <CardContent className='pt-6'>
          <EntityForm
            schema={possessionSchema}
            fields={possessionFormFields}
            defaultValues={defaultValues as PossessionFormData}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel='Create Possession Request'
            cancelLabel='Cancel'
            isLoading={createMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  )
}
