'use client'

import { AnnouncementForm } from '@/components/announcements/AnnouncementForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function CreateAnnouncementPage () {
  const router = useRouter()

  return (
    <div className='p-6'>
      <Button variant='ghost' className='mb-6' onClick={() => router.back()}>
        <ArrowLeft className='mr-2 h-4 w-4' /> Back
      </Button>

      <h1 className='text-3xl font-bold mb-2'>Create Announcement</h1>
      <p className='text-muted-foreground mb-8'>
        Add a new announcement to the system
      </p>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        <div className='lg:col-span-2'>
          <Card>
            <CardContent className='pt-6'>
              <AnnouncementForm />
            </CardContent>
          </Card>
        </div>

        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Quick Tips</CardTitle>
            </CardHeader>
            <CardContent className='text-sm space-y-3'>
              <p>• High priority announcements appear at the top</p>
              <p>• Attachments are stored on Cloudinary</p>
              <p>• Expiry date is optional - leave empty for permanent</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
