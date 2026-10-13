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
import { updateFileFormFields } from '@/lib/constants/fileForm.constants'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import { useFile, useUpdateFile } from '@/lib/hooks/entities/useFile'
import { useAuth } from '@/lib/hooks/useAuth'
import { updateFileSchema } from '@/lib/schemas/file.schema'
import { UpdateFileDto } from '@/lib/types/file'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { customToast } from '@/lib/utils/customToast'
import { FormPageSkeleton } from '@/components/shared/PageSkeleton'

export default function EditFilePage () {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()

  const id = params.id as string
  const { data: file, isLoading } = useFile(id)
  const updateMutation = useUpdateFile()

  const canUpdate =
    user &&
    hasPermission(user.role as UserRole, [
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN
    ] as UserRole[])

  if (!canUpdate) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to edit files.
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

  if (!file) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>File Not Found</CardTitle>
            <CardDescription>The file you&apos;re looking for doesn&apos;t exist.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/file')}>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Files
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const memId =
    typeof file.memId === 'object'
      ? (file.memId as { _id?: string })?._id
      : file.memId
  const projId =
    file.project?._id ||
    (typeof file.projectId === 'object'
      ? (file.projectId as { _id?: string })?._id
      : file.projectId)
  const nomineeId =
    file.nomineeId != null
      ? typeof file.nomineeId === 'object'
        ? (file.nomineeId as { _id?: string })?._id
        : file.nomineeId
      : ''

  const defaultValues = {
    projId: projId || '',
    memId: memId || '',
    planId: file.plan?.id ?? file.planId ?? '',
    fileBarCode: file.fileBarCode || '',
    nomineeId: nomineeId || '',
    plotId:
      typeof file.plotId === 'object'
        ? (file.plotId as { _id?: string })?._id
        : file.plotId ?? '',
    totalAmount: file.totalAmount,
    downPayment: file.downPayment,
    paymentMode: file.paymentMode || '',
    isAdjusted: file.isAdjusted,
    adjustmentRef: file.adjustmentRef || '',
    status: file.status || '',
    fileRemarks: file.fileRemarks || '',
    expectedCompletionDate: file.expectedCompletionDate
      ? new Date(file.expectedCompletionDate).toISOString().split('T')[0]
      : '',
    actualCompletionDate: file.actualCompletionDate
      ? new Date(file.actualCompletionDate).toISOString().split('T')[0]
      : '',
    cancellationReason: file.cancellationReason || '',
    isActive: file.isActive ?? true,
  }

  const handleSubmit = async (data: Record<string, unknown>) => {
    try {
      const updateData: UpdateFileDto = {
        fileBarCode: data.fileBarCode as string | undefined,
        planId: data.planId as string | undefined,
        nomineeId: (data.nomineeId as string) || undefined,
        plotId: data.plotId as string | undefined,
        totalAmount: data.totalAmount as number | undefined,
        downPayment: data.downPayment as number | undefined,
        paymentMode: data.paymentMode as string | undefined,
        isAdjusted: data.isAdjusted as boolean | undefined,
        adjustmentRef: data.adjustmentRef as string | undefined,
        status: data.status as string | undefined,
        fileRemarks: data.fileRemarks as string | undefined,
        expectedCompletionDate: data.expectedCompletionDate
          ? new Date(data.expectedCompletionDate as string)
          : undefined,
        actualCompletionDate: data.actualCompletionDate
          ? new Date(data.actualCompletionDate as string)
          : undefined,
        cancellationReason: data.cancellationReason as string | undefined,
        isActive: data.isActive as boolean | undefined,
      }
      await updateMutation.mutateAsync({ id, data: updateData })
      customToast.success('File updated successfully')
      router.push(`/file/${id}`)
    } catch (error) {
      customToast.error(
        'Failed to update file' +
          (error instanceof Error ? `: ${error.message}` : ''),
      )
    }
  }

  const handleCancel = () => {
    router.push(`/file/${id}`)
  }

  return (
    <div className='p-6'>
      <div className='mb-6'>
        <Button
          variant='ghost'
          onClick={() => router.push(`/file/${id}`)}
          className='mb-4'
        >
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back to File
        </Button>

        <h1 className='text-3xl font-bold'>Edit File</h1>
        <p className='text-gray-500 mt-2'>
          Update file #{file.fileRegNo}
        </p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2'>
          <Card>
            <CardContent className='pt-6'>
              <EntityForm
                schema={updateFileSchema}
                fields={updateFileFormFields}
                defaultValues={defaultValues}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                submitLabel='Update File'
                cancelLabel='Cancel'
                isLoading={updateMutation.isPending}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
