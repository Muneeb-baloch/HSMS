// src/app/(dashboard)/nominees/view/[id]/page.tsx
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
import { useNominee } from '@/lib/hooks/entities/useNominee'
import { RelationType } from '@/lib/types/nominee'
import { formatDate } from '@/lib/utils/format'
import {
  ArrowLeft,
  Calendar,
  Edit,
  Mail,
  MapPin,
  Phone,
  Share2,
  User
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { DetailPageSkeleton } from '@/components/shared/PageSkeleton'

export default function ViewNomineePage () {
  const router = useRouter()
  const params = useParams()

  const id = params.id as string
  const { data: nominee, isLoading } = useNominee(id)

  if (isLoading) {
    return <DetailPageSkeleton />
  }

  if (!nominee) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Nominee Not Found</CardTitle>
            <CardDescription>
              The requested nominee does not exist or has been deleted.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/nominees')}>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Nominees
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const relationColors = {
    [RelationType.SON]: 'bg-blue-100 text-blue-800',
    [RelationType.DAUGHTER]: 'bg-pink-100 text-pink-800',
    [RelationType.WIFE]: 'bg-red-100 text-red-800',
    [RelationType.HUSBAND]: 'bg-cyan-100 text-cyan-800',
    [RelationType.FATHER]: 'bg-orange-100 text-orange-800',
    [RelationType.MOTHER]: 'bg-green-100 text-green-800',
    [RelationType.BROTHER]: 'bg-gray-100 text-gray-800',
    [RelationType.SISTER]: 'bg-purple-100 text-purple-800',
    [RelationType.UNCLE]: 'bg-yellow-100 text-yellow-800',
    [RelationType.AUNT]: 'bg-indigo-100 text-indigo-800',
    [RelationType.GRANDFATHER]: 'bg-amber-100 text-amber-800',
    [RelationType.GRANDMOTHER]: 'bg-teal-100 text-teal-800',
    [RelationType.OTHER]: 'bg-gray-100 text-gray-800'
  }

  return (
    <div className='p-6'>
      <div className='flex justify-between items-start mb-6'>
        <Button variant='ghost' onClick={() => router.back()}>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back
        </Button>
        <Button onClick={() => router.push(`/nominees/edit/${id}`)}>
          <Edit className='mr-2 h-4 w-4' />
          Edit Nominee
        </Button>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Main Nominee Card */}
        <div className='lg:col-span-2'>
          <Card className='mb-6'>
            <CardHeader>
              <div className='flex justify-between items-start'>
                <div>
                  <CardTitle className='text-2xl'>
                    {nominee.nomineeName}
                  </CardTitle>
                  <CardDescription>
                    Nominee for{' '}
                    {typeof nominee.memId === 'object'
                      ? nominee.memId.memName
                      : 'Member'}
                  </CardDescription>
                </div>
                <div className='flex gap-2'>
                  <Badge className={relationColors[nominee.relationWithMember]}>
                    {nominee.relationWithMember}
                  </Badge>
                  <Badge
                    className={
                      nominee.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }
                  >
                    {nominee.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge
                    className={
                      nominee.nomineeSharePercentage === 100
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }
                  >
                    {nominee.nomineeSharePercentage}% Share
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Basic Information */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-4'>
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-gray-500'>
                      <User className='h-4 w-4' />
                      <span className='text-sm font-medium'>
                        Personal Information
                      </span>
                    </div>
                    <div className='space-y-3 pl-6'>
                      <div>
                        <div className='text-sm text-gray-600'>CNIC</div>
                        <div className='font-medium'>{nominee.nomineeCNIC}</div>
                      </div>
                      <div>
                        <div className='text-sm text-gray-600'>Relation</div>
                        <div className='font-medium'>
                          {nominee.relationWithMember}
                        </div>
                      </div>
                      {nominee.nomineeSharePercentage && (
                        <div>
                          <div className='text-sm text-gray-600'>
                            Share Percentage
                          </div>
                          <div
                            className={`text-xl font-bold ${
                              nominee.nomineeSharePercentage === 100
                                ? 'text-purple-600'
                                : 'text-blue-600'
                            }`}
                          >
                            {nominee.nomineeSharePercentage}%
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className='space-y-4'>
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-gray-500'>
                      <Phone className='h-4 w-4' />
                      <span className='text-sm font-medium'>
                        Contact Information
                      </span>
                    </div>
                    <div className='space-y-3 pl-6'>
                      <div>
                        <div className='text-sm text-gray-600'>
                          Contact Number
                        </div>
                        <div className='font-medium'>
                          {nominee.nomineeContact}
                        </div>
                      </div>
                      {nominee.nomineeEmail && (
                        <div>
                          <div className='text-sm text-gray-600'>
                            Email Address
                          </div>
                          <div className='font-medium flex items-center gap-2'>
                            <Mail className='h-4 w-4' />
                            {nominee.nomineeEmail}
                          </div>
                        </div>
                      )}
                      {nominee.nomineeAddress && (
                        <div>
                          <div className='text-sm text-gray-600'>Address</div>
                          <div className='font-medium flex items-start gap-2'>
                            <MapPin className='h-4 w-4 mt-1 flex-shrink-0' />
                            <span>{nominee.nomineeAddress}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Member Information */}
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-gray-500'>
                  <User className='h-4 w-4' />
                  <span className='text-sm font-medium'>
                    Member Information
                  </span>
                </div>
                {typeof nominee.memId === 'object' && (
                  <div className='grid grid-cols-2 gap-4 pl-6'>
                    <div>
                      <div className='text-sm text-gray-600'>Member Name</div>
                      <div className='font-medium'>{nominee.memId.memName}</div>
                    </div>
                    <div>
                      <div className='text-sm text-gray-600'>Member CNIC</div>
                      <div className='font-medium'>{nominee.memId.memNic}</div>
                    </div>
                    {nominee.memId.mobileNo && (
                      <div>
                        <div className='text-sm text-gray-600'>
                          Member Contact
                        </div>
                        <div className='font-medium'>
                          {nominee.memId.mobileNo}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Timestamps */}
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-gray-500'>
                  <Calendar className='h-4 w-4' />
                  <span className='text-sm font-medium'>Timestamps</span>
                </div>
                <div className='grid grid-cols-2 gap-4 pl-6'>
                  <div>
                    <div className='text-sm text-gray-600'>Created At</div>
                    <div className='font-medium'>
                      {formatDate(nominee.createdAt)}
                    </div>
                  </div>
                  <div>
                    <div className='text-sm text-gray-600'>Last Updated</div>
                    <div className='font-medium'>
                      {formatDate(nominee.updatedAt)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className='space-y-6'>
          {/* Share Information */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Share2 className='h-5 w-5' />
                Share Information
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='text-center'>
                <div
                  className={`text-4xl font-bold ${
                    nominee.nomineeSharePercentage === 100
                      ? 'text-purple-600'
                      : 'text-blue-600'
                  }`}
                >
                  {nominee.nomineeSharePercentage}%
                </div>
                <div className='text-sm text-gray-500 mt-2'>
                  Share Percentage
                </div>
                {nominee.nomineeSharePercentage === 100 && (
                  <Badge className='mt-2 bg-purple-100 text-purple-800'>
                    Primary Nominee
                  </Badge>
                )}
              </div>
              <div className='text-sm text-gray-600'>
                <div className='font-medium mb-1'>Note:</div>
                <p>
                  {nominee.nomineeSharePercentage === 100
                    ? 'This is the primary nominee with full share.'
                    : "This nominee has partial share in the member's account."}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <Button
                variant='outline'
                className='w-full justify-start'
                onClick={() => router.push(`/nominees/edit/${id}`)}
              >
                <Edit className='mr-2 h-4 w-4' />
                Edit Nominee
              </Button>
              {typeof nominee.memId === 'object' &&
                (() => {
                  const memberId = nominee.memId._id
                  return (
                    <Button
                      variant='outline'
                      className='w-full justify-start'
                      onClick={() =>
                        router.push(`/nominees/member/${memberId}`)
                      }
                    >
                      <User className='mr-2 h-4 w-4' />
                      View Member&apos;s Nominees
                    </Button>
                  )
                })()}
              <Button
                variant='outline'
                className='w-full justify-start'
                onClick={() =>
                  router.push(
                    `/nominees?memId=${
                      typeof nominee.memId === 'object' ? nominee.memId._id : ''
                    }`
                  )
                }
              >
                <User className='mr-2 h-4 w-4' />
                All Member&apos;s Nominees
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
