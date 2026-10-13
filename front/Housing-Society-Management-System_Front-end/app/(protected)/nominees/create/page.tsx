// src/app/(dashboard)/nominees/create/page.tsx
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
import { nomineeFormFields } from '@/lib/constants/nomineeForm.constants'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import {
  useCreateNominee,
  useValidateNominee
} from '@/lib/hooks/entities/useNominee'
import { useAuth } from '@/lib/hooks/useAuth'
import { nomineeSchema } from '@/lib/schemas/nominee.schema'
import { CreateNomineeDto } from '@/lib/types/nominee'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { customToast } from "@/lib/utils/customToast"

export default function CreateNomineePage () {
  const router = useRouter()
  const { user } = useAuth()
  const createMutation = useCreateNominee()
  const validateMutation = useValidateNominee()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [validationWarnings, setValidationWarnings] = useState<string[]>([])

  const canCreate =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

  const handleValidation = async (data: unknown) => {
    const formData = data as CreateNomineeDto
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
      const formData = data as CreateNomineeDto

      // Validate before submitting
      const isValid = await handleValidation(formData)
      if (!isValid) {
        customToast.error('Please fix validation errors before submitting')
        return
      }

      const submitData = {
        ...formData,
        nomineeSharePercentage: formData.nomineeSharePercentage || 100
      }

      await createMutation.mutateAsync(submitData)
      customToast.success('Nominee created successfully')
      router.push('/nominees')
    } catch (error) {
      customToast.error(
        'Failed to create nominee' +
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
              You don&apos;t have permission to create nominees.
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
          Back to Nominees
        </Button>

        <h1 className='text-3xl font-bold'>Create Nominee</h1>
        <p className='text-gray-500 mt-2'>Add a new nominee for a member</p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2'>
          <Card>
            <CardContent className='pt-6'>
              <EntityForm
                schema={nomineeSchema}
                fields={nomineeFormFields}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                submitLabel='Create Nominee'
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

          {/* Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Information</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 text-sm text-gray-600'>
              <div className='space-y-2'>
                <div className='font-medium'>Important Notes:</div>
                <ul className='space-y-1 list-disc pl-4'>
                  <li>CNIC must be in format: XXXXX-XXXXXXX-X</li>
                  <li>Contact number must be 11 digits</li>
                  <li>
                    Total share percentage for a member cannot exceed 100%
                  </li>
                  <li>A nominee with 100% share is considered primary</li>
                  <li>Multiple nominees can be added for a member</li>
                </ul>
              </div>
              <div className='border-t pt-3'>
                <div className='font-medium'>Share Distribution:</div>
                <p>
                  Ensure that the total share percentage for all nominees of a
                  member equals 100% for full coverage.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
