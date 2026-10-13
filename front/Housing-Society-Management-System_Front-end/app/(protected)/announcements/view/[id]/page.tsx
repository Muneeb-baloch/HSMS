'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { useGetAnnouncementByIdQuery } from '@/lib/API/announcementApi'
import { formatDate } from '@/lib/utils/format'
import { ArrowLeft, Edit, Eye, FileText, AlertTriangle } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { DetailPageSkeleton } from '@/components/shared/PageSkeleton'

export default function ViewAnnouncementPage () {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const {
    data: announcement,
    isLoading,
    error
  } = useGetAnnouncementByIdQuery(id)

  if (isLoading) {
    return <DetailPageSkeleton />
  }

  if (error || !announcement) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Announcement Not Found</CardTitle>
            <CardDescription>
              The requested announcement does not exist or has been deleted.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/announcements')}>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Announcements
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isHighPriority = announcement.priorityLevel === 3
  const isExpired =
    announcement.expiresAt && new Date(announcement.expiresAt) < new Date()

  return (
    <div className='p-6'>
      <div className='flex justify-between items-start mb-6'>
        <Button variant='ghost' onClick={() => router.back()}>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back
        </Button>

        <div className='flex gap-3'>
          <Button onClick={() => router.push(`/announcements/edit/${id}`)}>
            <Edit className='mr-2 h-4 w-4' />
            Edit Announcement
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Main Content */}
        <div className='lg:col-span-2 space-y-6'>
          <Card>
            <CardHeader>
              <div className='flex justify-between items-start gap-4'>
                <div>
                  <CardTitle className='text-2xl'>
                    {announcement.title}
                  </CardTitle>
                  <CardDescription className='mt-2'>
                    {announcement.shortDescription || 'No short description'}
                  </CardDescription>
                </div>

                <div className='flex flex-col items-end gap-2'>
                  <Badge
                    variant={
                      announcement.status === 'Published'
                        ? 'success'
                        : announcement.status === 'Draft'
                        ? 'warning'
                        : 'secondary'
                    }
                    className='text-base px-4 py-1'
                  >
                    {announcement.status}
                  </Badge>

                  {isHighPriority && (
                    <Badge
                      variant='destructive'
                      className='flex items-center gap-1'
                    >
                      <AlertTriangle className='h-3.5 w-3.5' />
                      HIGH PRIORITY
                    </Badge>
                  )}

                  {isExpired && (
                    <Badge
                      variant='outline'
                      className='text-red-600 border-red-400'
                    >
                      Expired
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className='space-y-8'>
              {/* Category & Metadata */}
              <div className='flex flex-wrap gap-6 text-sm'>
                <div>
                  <div className='text-gray-500'>Category</div>
                  <div className='font-medium mt-1'>
                    {typeof announcement.categoryId === 'object'
                      ? announcement.categoryId.categoryName
                      : '—'}
                  </div>
                </div>

                <div>
                  <div className='text-gray-500'>Priority</div>
                  <div className='font-medium mt-1'>
                    {announcement.priorityLabel || announcement.priorityLevel}
                  </div>
                </div>

                <div>
                  <div className='text-gray-500'>Target</div>
                  <div className='font-medium mt-1'>
                    {announcement.targetType}
                  </div>
                </div>

                <div>
                  <div className='text-gray-500'>Views</div>
                  <div className='font-medium mt-1 flex items-center gap-1'>
                    <Eye className='h-4 w-4 text-gray-400' />
                    {announcement.views}
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6 border-t pt-6'>
                <div>
                  <div className='text-gray-500'>Created</div>
                  <div className='font-medium'>
                    {formatDate(announcement.createdAt)}
                  </div>
                </div>
                <div>
                  <div className='text-gray-500'>Published</div>
                  <div className='font-medium'>
                    {announcement.publishedAt
                      ? formatDate(announcement.publishedAt)
                      : '—'}
                  </div>
                </div>
                <div>
                  <div className='text-gray-500'>Expires</div>
                  <div className='font-medium'>
                    {announcement.expiresAt
                      ? formatDate(announcement.expiresAt)
                      : 'Never'}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className='border-t pt-6'>
                <h3 className='font-semibold text-lg mb-4'>Content</h3>
                <div className='prose max-w-none'>
                  <p className='whitespace-pre-wrap'>
                    {announcement.announcementDesc}
                  </p>
                </div>
              </div>

              {/* Attachment */}
              {announcement.attachmentURL && (
                <div className='border-t pt-6'>
                  <h3 className='font-semibold text-lg mb-4'>Attachment</h3>
                  <a
                    href={announcement.attachmentURL}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline'
                  >
                    <FileText className='h-5 w-5' />
                    View / Download Attachment
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <Button
                variant='outline'
                className='w-full justify-start'
                onClick={() => router.push(`/announcements/edit/${id}`)}
              >
                <Edit className='mr-2 h-4 w-4' />
                Edit Announcement
              </Button>

              <Button
                variant='outline'
                className='w-full justify-start'
                onClick={() => router.push('/announcements')}
              >
                <FileText className='mr-2 h-4 w-4' />
                Back to All Announcements
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Summary</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4 text-sm'>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Status</span>
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
                <span className='text-gray-600'>Priority</span>
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
                <span className='text-gray-600'>Target</span>
                <span className='font-medium'>{announcement.targetType}</span>
              </div>

              <div className='flex justify-between'>
                <span className='text-gray-600'>Views</span>
                <span className='font-medium'>{announcement.views}</span>
              </div>

              {announcement.expiresAt && (
                <div className='flex justify-between pt-2 border-t'>
                  <span className='text-gray-600'>Expires</span>
                  <span className={isExpired ? 'text-red-600' : ''}>
                    {formatDate(announcement.expiresAt)}
                    {isExpired && ' (Expired)'}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
