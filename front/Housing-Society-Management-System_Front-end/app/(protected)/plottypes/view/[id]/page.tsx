// src/app/(dashboard)/plottypes/view/[id]/page.tsx
'use client'

import { AppSidebar } from '@/components/app-sidebar'
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
import { usePlotType } from '@/lib/hooks/entities/usePoltType'
import { formatDate } from '@/lib/utils/format'
import { ArrowLeft, Calendar, User } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { DetailPageSkeleton } from '@/components/shared/PageSkeleton'

export default function ViewPlotTypePage () {
  const router = useRouter()
  const params = useParams()

  const id = params.id as string
  const { data: plotType, isLoading } = usePlotType(id)

  if (isLoading) {
    return <DetailPageSkeleton />
  }

  if (!plotType) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Plot Type Not Found</CardTitle>
            <CardDescription>
              The requested plot type does not exist or has been deleted.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/plottypes')}>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Plot Types
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const createdBy =
    typeof plotType.createdBy === 'object'
      ? `${plotType.createdBy.firstName} ${plotType.createdBy.lastName}`
      : 'System'

  const updatedBy =
    plotType.updatedBy && typeof plotType.updatedBy === 'object'
      ? `${plotType.updatedBy.firstName} ${plotType.updatedBy.lastName}`
      : 'N/A'

  return (

        <div className='p-6'>
          <Button
            variant='ghost'
            onClick={() => router.back()}
            className='mb-6'
          >
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back
          </Button>

          <Card className='mb-6'>
            <CardHeader>
              <div className='flex justify-between items-start'>
                <div>
                  <CardTitle className='text-2xl'>
                    {plotType.plotTypeName}
                  </CardTitle>
                  <CardDescription>Plot Type Details</CardDescription>
                </div>
                {plotType.isDeleted && (
                  <span className='px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full'>
                    Deleted
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-4'>
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-gray-500'>
                      <User className='h-4 w-4' />
                      <span className='text-sm font-medium'>Created By</span>
                    </div>
                    <p className='font-medium pl-6'>{createdBy}</p>
                  </div>

                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-gray-500'>
                      <Calendar className='h-4 w-4' />
                      <span className='text-sm font-medium'>Created Date</span>
                    </div>
                    <p className='font-medium pl-6'>
                      {formatDate(plotType.createdAt)}
                    </p>
                  </div>
                </div>

                <div className='space-y-4'>
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-gray-500'>
                      <User className='h-4 w-4' />
                      <span className='text-sm font-medium'>
                        Last Updated By
                      </span>
                    </div>
                    <p className='font-medium pl-6'>{updatedBy}</p>
                  </div>

                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-gray-500'>
                      <Calendar className='h-4 w-4' />
                      <span className='text-sm font-medium'>Last Updated</span>
                    </div>
                    <p className='font-medium pl-6'>
                      {formatDate(plotType.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>

              {plotType.deletedAt && (
                <div className='pt-4 border-t'>
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-red-500'>
                      <Calendar className='h-4 w-4' />
                      <span className='text-sm font-medium'>Deleted Date</span>
                    </div>
                    <p className='font-medium pl-6'>
                      {formatDate(plotType.deletedAt)}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className='flex gap-4'>
            <Button
              onClick={() => router.push(`/plottypes/edit/${id}`)}
              className='flex-1'
            >
              Edit Plot Type
            </Button>
            <Button
              variant='outline'
              onClick={() => router.push('/plottypes')}
              className='flex-1'
            >
              Back to List
            </Button>
          </div>
        </div>
    
  )
}
