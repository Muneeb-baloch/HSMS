// src/app/(dashboard)/plotblocks/view/[id]/page.tsx
'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { usePlotBlock } from '@/lib/hooks/entities/usePlotBlock'
import { formatDate } from '@/lib/utils/format'
import { ArrowLeft, Calendar, FileText, Folder, Map, User } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { DetailPageSkeleton } from '@/components/shared/PageSkeleton'

export default function ViewPlotBlockPage () {
  const router = useRouter()
  const params = useParams()

  const id = params.id as string
  const { data: plotBlock, isLoading } = usePlotBlock(id)

  if (isLoading) {
    return <DetailPageSkeleton />
  }

  if (!plotBlock) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Plot Block Not Found</CardTitle>
            <CardDescription>
              The requested plot block does not exist or has been deleted.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/plotblocks')}>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Plot Blocks
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const createdBy =
    typeof plotBlock.createdBy === 'object'
      ? `${plotBlock.createdBy.firstName} ${plotBlock.createdBy.lastName}`
      : 'System'

  const updatedBy =
    plotBlock.updatedBy && typeof plotBlock.updatedBy === 'object'
      ? `${plotBlock.updatedBy.firstName} ${plotBlock.updatedBy.lastName}`
      : 'N/A'

  return (
    <div className='p-6'>
      <Button variant='ghost' onClick={() => router.back()} className='mb-6'>
        <ArrowLeft className='mr-2 h-4 w-4' />
        Back
      </Button>

      <Card className='mb-6'>
        <CardHeader>
          <div className='flex justify-between items-start'>
            <div>
              <CardTitle className='text-2xl'>
                {plotBlock.plotBlockName}
              </CardTitle>
              <CardDescription>Plot Block Details</CardDescription>
            </div>
            {plotBlock.isDeleted && (
              <span className='px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full'>
                Deleted
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className='space-y-6'>
          {plotBlock.plotBlockDesc && (
            <div className='space-y-2'>
              <div className='flex items-center gap-2 text-gray-500'>
                <FileText className='h-4 w-4' />
                <span className='text-sm font-medium'>Description</span>
              </div>
              <p className='text-gray-800 pl-6'>{plotBlock.plotBlockDesc}</p>
            </div>
          )}

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
                  {formatDate(plotBlock.createdAt)}
                </p>
              </div>
            </div>

            <div className='space-y-4'>
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-gray-500'>
                  <User className='h-4 w-4' />
                  <span className='text-sm font-medium'>Last Updated By</span>
                </div>
                <p className='font-medium pl-6'>{updatedBy}</p>
              </div>

              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-gray-500'>
                  <Calendar className='h-4 w-4' />
                  <span className='text-sm font-medium'>Last Updated</span>
                </div>
                <p className='font-medium pl-6'>
                  {formatDate(plotBlock.updatedAt)}
                </p>
              </div>
            </div>
          </div>
          {plotBlock.blockTotalArea && (
            <div className='space-y-2'>
              <div className='flex items-center gap-2 text-gray-500'>
                <Map className='h-4 w-4' /> {/* Add this import */}
                <span className='text-sm font-medium'>Total Area</span>
              </div>
              <p className='font-medium pl-6'>
                {plotBlock.blockTotalArea} {plotBlock.blockAreaUnit || 'acres'}
              </p>
            </div>
          )}

          {plotBlock.projectId && (
            <div className='space-y-2'>
              <div className='flex items-center gap-2 text-gray-500'>
                <Folder className='h-4 w-4' /> {/* Add this import */}
                <span className='text-sm font-medium'>Project</span>
              </div>
              <p className='font-medium pl-6'>
                {typeof plotBlock.projectId === 'object'
                  ? `${plotBlock.projectId.projName}${
                      plotBlock.projectId.projCode
                        ? ` (${plotBlock.projectId.projCode})`
                        : ''
                    }`
                  : plotBlock.projectId}
              </p>
            </div>
          )}

          {plotBlock.deletedAt && (
            <div className='pt-4 border-t'>
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-red-500'>
                  <Calendar className='h-4 w-4' />
                  <span className='text-sm font-medium'>Deleted Date</span>
                </div>
                <p className='font-medium pl-6'>
                  {formatDate(plotBlock.deletedAt)}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className='flex gap-4'>
        <Button
          onClick={() => router.push(`/plotblocks/edit/${id}`)}
          className='flex-1'
        >
          Edit Plot Block
        </Button>
        <Button
          variant='outline'
          onClick={() => router.push('/plotblocks')}
          className='flex-1'
        >
          Back to List
        </Button>
      </div>
    </div>
  )
}
