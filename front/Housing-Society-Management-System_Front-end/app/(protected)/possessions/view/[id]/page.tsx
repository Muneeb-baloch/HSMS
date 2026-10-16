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
import { Separator } from '@/components/ui/separator'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import { useDeletePossession, usePossession } from '@/lib/hooks/entities/usePossession'
import { useAuth } from '@/lib/hooks/useAuth'
import { useConfirm } from '@/components/shared/ConfirmDialog'
import { PossessionStatus } from '@/lib/types/possession'
import { formatDate } from '@/lib/utils/format'
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Edit,
  FileText,
  MapPin,
  Trash2,
  User
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { DetailPageSkeleton } from '@/components/shared/PageSkeleton'

const statusColors: Record<string, string> = {
  [PossessionStatus.REQUESTED]: 'bg-blue-100 text-blue-800 border-blue-200',
  [PossessionStatus.SURVEYED]: 'bg-orange-100 text-orange-800 border-orange-200',
  [PossessionStatus.READY]: 'bg-green-100 text-green-800 border-green-200',
  [PossessionStatus.HANDED_OVER]: 'bg-purple-100 text-purple-800 border-purple-200',
  [PossessionStatus.CANCELLED]: 'bg-red-100 text-red-800 border-red-200',
  [PossessionStatus.ON_HOLD]: 'bg-yellow-100 text-yellow-800 border-yellow-200'
}

export default function ViewPossessionPage () {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const { confirm } = useConfirm()

  const id = params.id as string
  const { data: possession, isLoading } = usePossession(id)
  const deleteMutation = useDeletePossession()

  const canUpdate =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN] as UserRole[])

  const canDelete =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN] as UserRole[])

  if (isLoading) {
    return <DetailPageSkeleton />
  }

  if (!possession) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Possession Not Found</CardTitle>
            <CardDescription>
              The requested possession does not exist or has been deleted.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/possessions')}>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Possessions
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const file = typeof possession.fileId === 'object' ? possession.fileId : null
  const plot = typeof possession.plotId === 'object' ? possession.plotId : null
  const csr =
    typeof possession.possessionHandoverCSR === 'object' ? possession.possessionHandoverCSR : null

  return (
    <div className='space-y-1'>
      <Button variant='ghost' onClick={() => router.back()} className='mb-6'>
        <ArrowLeft className='mr-2 h-4 w-4' />
        Back
      </Button>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2 space-y-6'>
          <Card>
            <CardHeader>
              <div className='flex justify-between items-start'>
                <div>
                  <CardTitle className='text-2xl'>{possession.possessionCode}</CardTitle>
                  <CardDescription>
                    Possession request for plot {plot?.plotNumber || 'N/A'}
                  </CardDescription>
                </div>
                <Badge
                  className={
                    statusColors[possession.possessionStatus] || 'bg-gray-100 text-gray-800'
                  }
                >
                  {possession.statusDisplayName || possession.possessionStatus}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-3'>
                  <div className='flex items-center gap-2'>
                    <FileText className='h-5 w-5 text-gray-400' />
                    <h3 className='font-semibold'>File Information</h3>
                  </div>
                  <div className='space-y-2 pl-7'>
                    <div>
                      <div className='text-sm text-gray-500'>File Number</div>
                      <div className='font-medium'>{file?.fileNumber || 'N/A'}</div>
                    </div>
                    <div>
                      <div className='text-sm text-gray-500'>Member</div>
                      <div className='font-medium'>{file?.customerName || 'N/A'}</div>
                    </div>
                    {file?.customerCnic && (
                      <div>
                        <div className='text-sm text-gray-500'>CNIC</div>
                        <div className='font-medium'>{file.customerCnic}</div>
                      </div>
                    )}
                    {file && (
                      <Button variant='outline' size='sm' asChild>
                        <Link href={`/file/${file._id}`}>View File</Link>
                      </Button>
                    )}
                  </div>
                </div>

                <div className='space-y-3'>
                  <div className='flex items-center gap-2'>
                    <MapPin className='h-5 w-5 text-gray-400' />
                    <h3 className='font-semibold'>Plot Information</h3>
                  </div>
                  <div className='space-y-2 pl-7'>
                    <div>
                      <div className='text-sm text-gray-500'>Plot Number</div>
                      <div className='font-medium'>{plot?.plotNumber || 'N/A'}</div>
                    </div>
                    {plot?.blockName && (
                      <div>
                        <div className='text-sm text-gray-500'>Block</div>
                        <div className='font-medium'>{plot.blockName}</div>
                      </div>
                    )}
                    {plot?.plotSize && (
                      <div>
                        <div className='text-sm text-gray-500'>Plot Size</div>
                        <div className='font-medium'>{plot.plotSize}</div>
                      </div>
                    )}
                    {plot && (
                      <Button variant='outline' size='sm' asChild>
                        <Link href={`/plots/view/${plot._id}`}>View Plot</Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div className='space-y-3'>
                <div className='flex items-center gap-2'>
                  <Calendar className='h-5 w-5 text-gray-400' />
                  <h3 className='font-semibold'>Timeline</h3>
                </div>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4 pl-7'>
                  <div>
                    <div className='text-sm text-gray-500'>Application Date</div>
                    <div className='font-medium'>{formatDate(possession.possessionInitDate)}</div>
                  </div>
                  <div>
                    <div className='text-sm text-gray-500'>Survey Date</div>
                    <div className='font-medium'>
                      {possession.possessionSurveyDate
                        ? formatDate(possession.possessionSurveyDate)
                        : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className='text-sm text-gray-500'>Handover Date</div>
                    <div className='font-medium'>
                      {possession.possessionHandoverDate
                        ? formatDate(possession.possessionHandoverDate)
                        : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className='text-sm text-gray-500'>Duration</div>
                    <div className='font-medium'>
                      {possession.possessionDurationDays != null
                        ? `${possession.possessionDurationDays} days`
                        : `${possession.possessionAgeDays ?? 0} days (ongoing)`}
                    </div>
                  </div>
                </div>
                {possession.possessionSurveyPerson && (
                  <div className='pl-7'>
                    <div className='text-sm text-gray-500'>Survey Person</div>
                    <div className='font-medium'>{possession.possessionSurveyPerson}</div>
                  </div>
                )}
              </div>

              <Separator />

              <div className='space-y-3'>
                <div className='flex items-center gap-2'>
                  <User className='h-5 w-5 text-gray-400' />
                  <h3 className='font-semibold'>Handover CSR</h3>
                </div>
                <div className='pl-7'>
                  <div className='font-medium'>
                    {csr ? `${csr.firstName || ''} ${csr.lastName || ''}`.trim() : 'N/A'}
                  </div>
                  {csr?.email && <div className='text-sm text-gray-500'>{csr.email}</div>}
                </div>
              </div>

              {(possession.possessionRemarks ||
                possession.possessionSurveyRemarks ||
                possession.possessionHandoverRemarks) && (
                <>
                  <Separator />
                  <div className='space-y-3'>
                    {possession.possessionRemarks && (
                      <div>
                        <div className='text-sm text-gray-500'>Remarks</div>
                        <div className='whitespace-pre-wrap'>{possession.possessionRemarks}</div>
                      </div>
                    )}
                    {possession.possessionSurveyRemarks && (
                      <div>
                        <div className='text-sm text-gray-500'>Survey Remarks</div>
                        <div className='whitespace-pre-wrap'>
                          {possession.possessionSurveyRemarks}
                        </div>
                      </div>
                    )}
                    {possession.possessionHandoverRemarks && (
                      <div>
                        <div className='text-sm text-gray-500'>Handover Remarks</div>
                        <div className='whitespace-pre-wrap'>
                          {possession.possessionHandoverRemarks}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Collection Status</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='flex justify-between items-center'>
                <div className='text-gray-600'>Letter Collected</div>
                <Badge
                  className={
                    possession.possessionIsCollected
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }
                >
                  {possession.possessionIsCollected ? 'Yes' : 'No'}
                </Badge>
              </div>
              {possession.possessionIsCollected && (
                <>
                  <div>
                    <div className='text-sm text-gray-500'>Collector Name</div>
                    <div className='font-medium'>
                      {possession.possessionCollectorName || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className='text-sm text-gray-500'>Collector CNIC</div>
                    <div className='font-medium'>{possession.possessionCollectorNic || 'N/A'}</div>
                  </div>
                  <div>
                    <div className='text-sm text-gray-500'>Collection Date</div>
                    <div className='font-medium'>
                      {formatDate(possession.possessionCollectionDate)}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Actions</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              {canUpdate && (possession.allowedNextStatuses?.length ?? 0) > 0 && (
                <Button
                  onClick={() => router.push(`/possessions/edit/${id}`)}
                  className='w-full'
                >
                  <Edit className='mr-2 h-4 w-4' />
                  Change Status
                </Button>
              )}
              {canDelete && (
                <Button
                  variant='outline'
                  onClick={async () => {
                    if (
                      await confirm({
                        title: 'Delete',
                        description: 'Are you sure you want to delete this possession request?',
                        variant: 'destructive'
                      })
                    ) {
                      await deleteMutation.mutateAsync(id)
                      router.push('/possessions')
                    }
                  }}
                  className='w-full'
                >
                  <Trash2 className='mr-2 h-4 w-4' />
                  Delete Possession
                </Button>
              )}
              <Button
                variant='outline'
                onClick={() => router.push('/possessions')}
                className='w-full'
              >
                <ArrowLeft className='mr-2 h-4 w-4' />
                Back to Possessions
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>System Information</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span className='text-gray-500'>Created</span>
                <span>{formatDate(possession.createdAt)}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-500'>Last Updated</span>
                <span>{formatDate(possession.updatedAt)}</span>
              </div>
              {(possession.allowedNextStatuses?.length ?? 0) > 0 && (
                <div className='flex items-center gap-1 pt-2 text-green-700'>
                  <CheckCircle className='h-4 w-4' />
                  <span>Status can still be progressed</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
