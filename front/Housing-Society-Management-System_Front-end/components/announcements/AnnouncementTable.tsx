'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { useAnnouncementApi } from '@/lib/hooks/useAnnouncementApi'
import type {
  Announcement,
  AnnouncementQueryParams
} from '@/lib/types/announcement'
import { Loader2, UploadCloud } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { customToast } from "@/lib/utils/customToast"

const priorityStyles: Record<number, { label: string; className: string }> = {
  1: {
    label: 'Low',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700'
  },
  2: {
    label: 'Medium',
    className: 'border-amber-200 bg-amber-50 text-amber-700'
  },
  3: {
    label: 'High',
    className: 'border-red-200 bg-red-50 text-red-700'
  }
}

const statusVariants: Record<string, 'success' | 'secondary' | 'warning'> = {
  Published: 'success',
  Draft: 'secondary',
  Archived: 'warning'
}

const resolveCategoryName = (announcement: Announcement) => {
  if (typeof announcement.categoryId === 'string')
    return announcement.categoryId
  return (
    announcement.categoryId?.categoryName ||
    announcement.category?.categoryName ||
    'N/A'
  )
}

export function AnnouncementTable ({
  queryParams
}: {
  queryParams?: AnnouncementQueryParams
}) {
  const { fetchAnnouncements, publishAnnouncement, isLoading } =
    useAnnouncementApi()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [publishingId, setPublishingId] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadAnnouncements = async () => {
      try {
        const data = await fetchAnnouncements(queryParams)
        if (isMounted) setAnnouncements(data)
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to load announcements'
        customToast.error(message)
      }
    }

    loadAnnouncements()

    return () => {
      isMounted = false
    }
  }, [fetchAnnouncements, queryParams])

  const handlePublish = async (id: string) => {
    setPublishingId(id)
    try {
      const updated = await publishAnnouncement(id)
      setAnnouncements(prev =>
        prev.map(item => (item._id === id ? updated : item))
      )
      customToast.success('Announcement published')
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to publish announcement'
      customToast.error(message)
    } finally {
      setPublishingId(null)
    }
  }

  const rows = useMemo(() => announcements, [announcements])

  return (
    <div className='rounded-lg border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading.announcements ? (
            <TableRow>
              <TableCell colSpan={5} className='py-10 text-center'>
                <div className='flex items-center justify-center gap-2 text-muted-foreground'>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  Loading announcements...
                </div>
              </TableCell>
            </TableRow>
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className='py-10 text-center text-muted-foreground'
              >
                No announcements found.
              </TableCell>
            </TableRow>
          ) : (
            rows.map(announcement => {
              const priority = priorityStyles[announcement.priorityLevel]
              const statusVariant =
                statusVariants[announcement.status] || 'secondary'

              return (
                <TableRow key={announcement._id}>
                  <TableCell className='font-medium'>
                    {announcement.title}
                  </TableCell>
                  <TableCell>{resolveCategoryName(announcement)}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant}>{announcement.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant='outline' className={priority?.className}>
                      {priority?.label || 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-right'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handlePublish(announcement._id)}
                      disabled={
                        announcement.status === 'Published' ||
                        publishingId === announcement._id
                      }
                    >
                      {publishingId === announcement._id ? (
                        <>
                          <Loader2 className='h-4 w-4 animate-spin' />
                          Publishing
                        </>
                      ) : (
                        <>
                          <UploadCloud className='h-4 w-4' />
                          Publish
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
