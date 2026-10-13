// src/app/(dashboard)/nominees/edit/[id]/page.tsx
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
import { updateNomineeFormFields } from '@/lib/constants/nomineeForm.constants'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import {
  useNominee,
  useUpdateNominee,
  useValidateNominee
} from '@/lib/hooks/entities/useNominee'
import { useAuth } from '@/lib/hooks/useAuth'
import { updateNomineeSchema } from '@/lib/schemas/nominee.schema'
import { UpdateNomineeDto } from '@/lib/types/nominee'
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { customToast } from "@/lib/utils/customToast"
import { FormPageSkeleton } from '@/components/shared/PageSkeleton'

export default function EditNomineePage () {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const updateMutation = useUpdateNominee()
  const validateMutation = useValidateNominee()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [validationWarnings, setValidationWarnings] = useState<string[]>([])

  const id = params.id as string
  const { data: nominee, isLoading, error } = useNominee(id)

  const canUpdate =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

  const handleValidation = async (data: unknown) => {
    const formData = data as UpdateNomineeDto
    try {
      const result = await validateMutation.mutateAsync(formData)
      setValidationErrors(result.errors)
      setValidationWarnings(result.warnings)
      return result.isValid
    } catch (error) {
      console.error('Validation error:', error)
      return true // Proceed even if validation API fails
    }
  }

  const handleSubmit = async (data: unknown) => {
    try {
      setIsSubmitting(true)
      const formData = data as UpdateNomineeDto

      // Validate before submitting
      const isValid = await handleValidation(formData)
      if (!isValid) {
        customToast.error('Please fix validation errors before submitting')
        return
      }

      const submitData: any = {}
      Object.keys(formData).forEach(key => {
        if (formData[key as keyof UpdateNomineeDto] !== undefined) {
          const value = formData[key as keyof UpdateNomineeDto]
          if (key === 'nomineeSharePercentage') {
            submitData[key] = Number(value)
          } else {
            submitData[key] = value
          }
        }
      })

      await updateMutation.mutateAsync({
        id,
        data: submitData
      })

      customToast.success('Nominee updated successfully')
      router.push('/nominees')
    } catch (error) {
      customToast.error(
        'Failed to update nominee' +
          (error instanceof Error ? `: ${error.message}` : '')
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  if (!canUpdate) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to edit nominees.
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

  if (error || !nominee) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Failed to load nominee data.</CardDescription>
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

  const defaultValues = {
    nomineeName: nominee.nomineeName,
    nomineeCNIC: nominee.nomineeCNIC,
    relationWithMember: nominee.relationWithMember,
    nomineeContact: nominee.nomineeContact,
    nomineeEmail: nominee.nomineeEmail || '',
    nomineeAddress: nominee.nomineeAddress || '',
    nomineeSharePercentage: nominee.nomineeSharePercentage,
    isActive: nominee.isActive
  }

  return (
    <div className='p-6'>
      <div className='mb-6'>
        <Button variant='ghost' onClick={() => router.back()} className='mb-4'>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back to Nominees
        </Button>

        <h1 className='text-3xl font-bold'>Edit Nominee</h1>
        <p className='text-gray-500 mt-2'>Update nominee information.</p>
        <div className='mt-2 flex items-center gap-2'>
          <span className='text-sm font-medium'>Nominee:</span>
          <span className='text-sm bg-gray-100 px-2 py-1 rounded'>
            {nominee.nomineeName}
          </span>
          <span className='text-sm font-medium'>Member:</span>
          <span className='text-sm bg-gray-100 px-2 py-1 rounded'>
            {typeof nominee.memId === 'object'
              ? nominee.memId.memName
              : 'Member'}
          </span>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2'>
          <Card>
            <CardContent className='pt-6'>
              <EntityForm
                schema={updateNomineeSchema}
                fields={updateNomineeFormFields}
                defaultValues={defaultValues}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                submitLabel='Update Nominee'
                cancelLabel='Cancel'
                isLoading={isSubmitting}
              />
            </CardContent>
          </Card>
        </div>

        <div className='space-y-6'>
          {/* Validation Messages */}
          {(validationErrors.length > 0 || validationWarnings.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Validation Messages</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {validationErrors.length > 0 && (
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-red-600 font-medium'>
                      <AlertCircle className='h-4 w-4' />
                      <span>Errors</span>
                    </div>
                    <ul className='space-y-1'>
                      {validationErrors.map((error, index) => (
                        <li
                          key={index}
                          className='text-sm text-red-600 flex items-start gap-2'
                        >
                          <span className='mt-1'>•</span>
                          <span>{error}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {validationWarnings.length > 0 && (
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-yellow-600 font-medium'>
                      <AlertCircle className='h-4 w-4' />
                      <span>Warnings</span>
                    </div>
                    <ul className='space-y-1'>
                      {validationWarnings.map((warning, index) => (
                        <li
                          key={index}
                          className='text-sm text-yellow-600 flex items-start gap-2'
                        >
                          <span className='mt-1'>•</span>
                          <span>{warning}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Current Information */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Current Information</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 text-sm'>
              <div className='space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Member:</span>
                  <span className='font-medium'>
                    {typeof nominee.memId === 'object'
                      ? nominee.memId.memName
                      : 'N/A'}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Current Share:</span>
                  <span className='font-medium text-blue-600'>
                    {nominee.nomineeSharePercentage}%
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Current Status:</span>
                  <span
                    className={`font-medium ${
                      nominee.isActive ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {nominee.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Created:</span>
                  <span className='font-medium'>
                    {new Date(nominee.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
