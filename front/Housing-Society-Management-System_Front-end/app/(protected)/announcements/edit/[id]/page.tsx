'use client'

import {
  EntityForm,
  type FieldConfig
} from '@/components/shared/EntityForm/EntityForm'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  useGetAnnouncementByIdQuery,
  useUpdateAnnouncementMutation
} from '@/lib/API/announcementApi'
import { updateAnnouncementFormFields } from '@/lib/constants/announcementForm.constants'
import { UserRole, hasPermission } from '@/lib/constants/roles'
import { useAuth } from '@/lib/hooks/useAuth'
import { updateAnnouncementSchema } from '@/lib/schemas/announcement.schema'
import { UpdateAnnouncementDto } from '@/lib/types/announcement'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { customToast } from "@/lib/utils/customToast"
import { FormPageSkeleton } from '@/components/shared/PageSkeleton'

export default function EditAnnouncementPage () {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const id = params.id as string

  const {
    data: announcement,
    isLoading,
    error
  } = useGetAnnouncementByIdQuery(id)
  const [updateAnnouncement] = useUpdateAnnouncementMutation()

  const canUpdate =
    user &&
    hasPermission(user.role as UserRole, [
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
      UserRole.MODERATOR
    ])

  // Update upload config with real ID once we have the announcement
  const modifiedFormFields = updateAnnouncementFormFields.map(field => {
    if (field.name === 'attachmentURL' && field.uploadConfig) {
      return {
        ...field,
        uploadConfig: {
          ...field.uploadConfig,
          entityId: id // ← real announcement ID for Cloudinary folder
        }
      }
    }
    return field
  })

  if (!canUpdate) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to edit announcements.
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

  if (error || !announcement) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Announcement Not Found</CardTitle>
            <CardDescription>
              The announcement could not be loaded or does not exist.
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

  // Prepare default values (handle populated vs raw IDs)
  const defaultValues: Partial<UpdateAnnouncementDto> = {
    title: announcement.title,
    announcementDesc: announcement.announcementDesc,
    shortDescription: announcement.shortDescription || '',
    authorId:
      typeof announcement.authorId === 'object'
        ? announcement.authorId._id
        : announcement.authorId,
    categoryId:
      typeof announcement.categoryId === 'object'
        ? announcement.categoryId._id
        : announcement.categoryId,
    targetType: announcement.targetType,
    targetGroupId: announcement.targetGroupId
      ? typeof announcement.targetGroupId === 'object'
        ? announcement.targetGroupId._id
        : announcement.targetGroupId
      : '',
    priorityLevel: announcement.priorityLevel,
    attachmentURL: announcement.attachmentURL || '',
    expiresAt: announcement.expiresAt
      ? new Date(announcement.expiresAt).toISOString().split('T')[0]
      : undefined
  }

  const handleSubmit = async (values: unknown) => {
    try {
      setIsSubmitting(true)
      const formData = values as UpdateAnnouncementDto

      await updateAnnouncement({ id, data: formData }).unwrap()

      customToast.success('Announcement updated successfully')
      router.push('/announcements')
    } catch (err: unknown) {
      customToast.error(
        (err as { data?: { message?: string } })?.data?.message ||
          'Failed to update announcement'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => router.back()

  return (
    <div className='p-6'>
      <div className='mb-6'>
        <Button variant='ghost' onClick={handleCancel} className='mb-4'>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back to Announcements
        </Button>

        <h1 className='text-3xl font-bold'>Edit Announcement</h1>
        <p className='text-gray-500 mt-2'>{announcement.title}</p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2'>
          <Card>
            <CardContent className='pt-6'>
              <EntityForm
                schema={updateAnnouncementSchema}
                fields={modifiedFormFields as FieldConfig<Partial<UpdateAnnouncementDto>>[]}
                defaultValues={defaultValues}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                submitLabel='Save Changes'
                cancelLabel='Cancel'
                isLoading={isSubmitting}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Current Information</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4 text-sm'>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Title:</span>
                <span className='font-medium'>{announcement.title}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Category:</span>
                <span className='font-medium'>
                  {typeof announcement.categoryId === 'object'
                    ? announcement.categoryId.categoryName
                    : '—'}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Priority:</span>
                <Badge
                  variant={
                    announcement.priorityLevel === 3
                      ? 'destructive'
                      : announcement.priorityLevel === 2
                      ? 'default'
                      : 'secondary'
                  }
                >
                  {announcement.priorityLabel || announcement.priorityLevel}
                </Badge>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Status:</span>
                <Badge
                  variant={
                    announcement.status === 'Published'
                      ? 'success'
                      : announcement.status === 'Draft'
                      ? 'warning'
                      : 'secondary'
                  }
                >
                  {announcement.status}
                </Badge>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Target:</span>
                <span>{announcement.targetType}</span>
              </div>
              {announcement.expiresAt && (
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Expires:</span>
                  <span>
                    {new Date(announcement.expiresAt).toLocaleDateString()}
                  </span>
                </div>
              )}
              {announcement.attachmentURL && (
                <div>
                  <div className='text-gray-600 mb-1'>Current Attachment:</div>
                  <a
                    href={announcement.attachmentURL}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-600 hover:underline text-sm'
                  >
                    View / Download
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Edit Guidelines</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 text-sm text-gray-600'>
              <ul className='list-disc pl-5 space-y-1'>
                <li>Changing category affects filtering & display</li>
                <li>Attachments replace previous files on Cloudinary</li>
                <li>High priority announcements appear first</li>
                <li>Expiry date is optional (permanent if empty)</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
