// src/app/(dashboard)/projects/edit/[id]/page.tsx
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
import { projectFormFields } from '@/lib/constants/projectForm.constants'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import { useProject, useUpdateProject } from '@/lib/hooks/entities/useProject'
import { useAuth } from '@/lib/hooks/useAuth'
import { ProjectFormData, projectSchema } from '@/lib/schemas/project.schema'
import { UpdateProjectDto } from '@/lib/types/project'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { customToast } from "@/lib/utils/customToast"
import { FormPageSkeleton } from '@/components/shared/PageSkeleton'

export default function EditProjectPage () {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const updateMutation = useUpdateProject()

  const id = params.id as string
  const { data: project, isLoading, error } = useProject(id)

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
                  You don&apos;t have permission to edit projects.
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

  if (error || !project) {
    return (

          <div className='p-6'>
            <Card>
              <CardHeader>
                <CardTitle>Error</CardTitle>
                <CardDescription>Failed to load project data.</CardDescription>
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

  // Get city ID (could be string or object)
  const cityId =
    typeof project.cityId === 'object' ? project.cityId._id : project.cityId

  // Prepare default values
  const defaultValues: ProjectFormData = {
    projName: project.projName,
    projCode: project.projCode,
    projLocation: project.projLocation,
    projPrefix: project.projPrefix,
    projDescription: project.projDescription || '',
    totalArea: project.totalArea,
    areaUnit: project.areaUnit,
    launchDate: new Date(project.launchDate),
    completionDate: project.completionDate
      ? new Date(project.completionDate) // Date when exists
      : undefined,
    projStatus: project.projStatus,
    projType: project.projType,
    isActive: project.isActive,
    website: project.website || '',
    contactEmail: project.contactEmail || '',
    contactPhone: project.contactPhone || '',
    address: project.address || '',
    cityId: cityId,
    country: project.country || 'Pakistan',
    amenities: project.amenities || []
    // Note: coordinates and other fields not included in form
  }

  const handleSubmit = async (data: unknown) => {
    try {
      const formData = data as UpdateProjectDto

      // Transform data
      const submitData: any = {}

      // Only include changed fields
      Object.keys(formData).forEach(key => {
        if (formData[key as keyof UpdateProjectDto] !== undefined) {
          const value = formData[key as keyof UpdateProjectDto]

          // Handle special cases
          if (key === 'launchDate' && value) {
            submitData.launchDate = new Date(value as string)
          } else if (key === 'completionDate' && value) {
            submitData.completionDate = new Date(value as string)
          } else if (key === 'totalArea') {
            submitData[key] = Number(value)
          } else if (key === 'projPrefix') {
            submitData[key] = (value as string).toUpperCase()
          } else {
            submitData[key] = value
          }
        }
      })

      await updateMutation.mutateAsync({
        id,
        data: submitData
      })
      customToast.success('Project updated successfully')
      router.push('/projects')
    } catch (error) {
      customToast.error(
        'Failed to update project' +
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
              Back to Projects
            </Button>

            <h1 className='text-3xl font-bold'>Edit Project</h1>
            <p className='text-gray-500 mt-2'>Update project information.</p>
            <div className='mt-2 flex items-center gap-2'>
              <span className='text-sm font-medium'>Project Code:</span>
              <span className='text-sm bg-gray-100 px-2 py-1 rounded'>
                {project.projCode}
              </span>
            </div>
          </div>

          <Card>
            <CardContent className='pt-6'>
              <EntityForm
                schema={projectSchema}
                fields={projectFormFields}
                defaultValues={defaultValues}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                submitLabel='Update Project'
                cancelLabel='Cancel'
                isLoading={updateMutation.isPending}
              />
            </CardContent>
          </Card>
        </div>
     
  )
}
