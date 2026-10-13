// src/app/(dashboard)/files/create/page.tsx
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
import { fileFormFields } from '@/lib/constants/fileForm.constants'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import { useCreateFile } from '@/lib/hooks/entities/useFile'
import { useAuth } from '@/lib/hooks/useAuth'
import { fileSchema } from '@/lib/schemas/file.schema'
import { CreateFileDto } from '@/lib/types/file'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { customToast } from "@/lib/utils/customToast"
import { apiClient } from '@/lib/API/client'

export default function CreateFilePage () {
  const router = useRouter()
  const { user } = useAuth()
  const createMutation = useCreateFile()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canCreate =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

  const handleSubmit = async (data: unknown) => {
    try {
      setIsSubmitting(true)
      const formData = data as CreateFileDto & { societyId?: string }

      // Get societyId from the selected project
      if (formData.projId) {
        try {
          const projectResponse = await apiClient.get(`/projects/${formData.projId}`)
          if (projectResponse.data.success && projectResponse.data.data.societyId) {
            formData.societyId = projectResponse.data.data.societyId
          }
        } catch (e) {
          console.error('Failed to fetch project societyId:', e)
        }
      }

      if (!formData.societyId) {
        customToast.error('Society information is missing. Please select a valid project.')
        return
      }

      await createMutation.mutateAsync(formData)
      customToast.success('File created successfully')
      router.push('/file')
    } catch (error) {
      customToast.error(
        'Failed to create file' +
          (error instanceof Error ? `: ${error.message}` : '')
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  if (!canCreate) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to create files.
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

  return (
    <div className='p-6'>
      <div className='mb-6'>
        <Button variant='ghost' onClick={() => router.back()} className='mb-4'>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back to Files
        </Button>

        <h1 className='text-3xl font-bold'>Create File</h1>
        <p className='text-gray-500 mt-2'>Add a new file to the system</p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2'>
          <Card>
            <CardContent className='pt-6'>
              <EntityForm
                schema={fileSchema}
                fields={fileFormFields}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                submitLabel='Create File'
                cancelLabel='Cancel'
                isLoading={isSubmitting}
              />
            </CardContent>
          </Card>
        </div>

        <div className='space-y-6'>
          {/* Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Information</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 text-sm text-gray-600'>
              <div className='space-y-2'>
                <div className='font-medium'>About Files:</div>
                <ul className='space-y-1 list-disc pl-4'>
                  <li>Files represent property bookings or purchases</li>
                  <li>Each file is associated with a member and project</li>
                  <li>
                    <strong>Each file MUST be linked to a plot</strong>
                  </li>
                  <li>Files can be linked to applications</li>
                  <li>Files track financial transactions</li>
                  <li>File numbers are auto-generated if not provided</li>
                  <li>Barcodes are auto-generated for tracking</li>
                  <li>Deleted files are archived</li>
                </ul>
              </div>
              <div className='border-t pt-3'>
                <div className='font-medium'>Required Information:</div>
                <ul className='space-y-1 list-disc pl-4'>
                  <li>Project (required)</li>
                  <li>Member (required)</li>
                  <li>
                    <strong>Plot (required)</strong>
                  </li>
                  <li>Total Amount (required)</li>
                  <li>Down Payment (required)</li>
                  <li>Payment Mode (required)</li>
                  <li>Status (required)</li>
                  <li>Booking Date (required)</li>
                  <li>Nominee (optional)</li>
                  <li>Application (optional)</li>
                  <li>File Remarks (optional)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Important Notes */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Important Notes</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 text-sm text-gray-600'>
              <div className='space-y-2'>
                <ul className='space-y-1'>
                  <li className='flex items-start gap-2'>
                    <span className='text-red-500 mt-1'>•</span>
                    <span>
                      <strong>Plot is now required</strong> for all files
                    </span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='text-red-500 mt-1'>•</span>
                    <span>Down payment cannot exceed total amount</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='text-blue-500 mt-1'>•</span>
                    <span>
                      Each plot can only be allocated to one active file
                    </span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='text-blue-500 mt-1'>•</span>
                    <span>
                      File registration numbers are auto-generated in the format
                      PROJ-XXXX-XXX
                    </span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='text-blue-500 mt-1'>•</span>
                    <span>
                      Barcodes are auto-generated for tracking purposes
                    </span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='text-blue-500 mt-1'>•</span>
                    <span>Date format: YYYY-MM-DD</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
