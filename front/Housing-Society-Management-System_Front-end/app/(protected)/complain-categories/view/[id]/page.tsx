// src/app/(dashboard)/complain-categories/view/[id]/page.tsx
'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { hasPermission, UserRole as UserRoleEnum } from '@/lib/constants/roles'
import { useSrComplaintCategory } from '@/lib/hooks/entities/useSrComplaintCategory'
import { useAuth } from '@/lib/hooks/useAuth'
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Clock,
  Edit,
  ShieldAlert,
  TrendingUp,
  User
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { DetailPageSkeleton } from '@/components/shared/PageSkeleton'

interface ViewComplaintCategoryPageProps {
  params: {
    id: string
  }
}

export default function ViewComplaintCategoryPage ({
  params
}: ViewComplaintCategoryPageProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { id } = params

  const { data: category, isLoading, error } = useSrComplaintCategory(id)

  const canUpdate =
    user &&
    hasPermission(
      user.role as UserRoleEnum,
      [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN] as UserRoleEnum[]
    )

  if (isLoading) {
    return <DetailPageSkeleton />
  }

  if (error || !category) {
    return (
      <div className='space-y-1'>
        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => router.back()}
            className='mb-4'
          >
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-center py-8'>
              <h3 className='text-lg font-medium mb-2'>Category Not Found</h3>
              <p className='text-muted-foreground'>
                The complaint category you&apos;re trying to view doesn&apos;t
                exist.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getPriorityColor = (priority: number) => {
    if (priority <= 3) return 'bg-red-100 text-red-800'
    if (priority <= 6) return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  const getPriorityLabel = (priority: number) => {
    if (priority <= 3) return 'Critical'
    if (priority <= 6) return 'Medium'
    return 'Low'
  }

  const getSlaColor = (slaHours?: number) => {
    if (!slaHours) return 'bg-gray-100 text-gray-800'
    if (slaHours <= 24) return 'bg-red-100 text-red-800'
    if (slaHours <= 48) return 'bg-orange-100 text-orange-800'
    return 'bg-blue-100 text-blue-800'
  }

  const getSlaLabel = (slaHours?: number) => {
    if (!slaHours) return 'No SLA'
    if (slaHours < 24) return `${slaHours} hours`
    const days = Math.ceil(slaHours / 24)
    return `${days} day${days > 1 ? 's' : ''}`
  }

  return (
    <div className='space-y-1'>
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-2'>
          <Button variant='ghost' size='sm' onClick={() => router.back()}>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back
          </Button>
        </div>
        {canUpdate && (
          <Button
            onClick={() => router.push(`/complain-categories/edit/${id}`)}
            variant='outline'
            size='sm'
          >
            <Edit className='mr-2 h-4 w-4' />
            Edit Category
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='text-2xl'>
                {category.categoryName}
              </CardTitle>
              <p className='text-muted-foreground mt-1'>
                Code: {category.categoryCode}
              </p>
            </div>
            <div className='flex gap-2'>
              <Badge
                className={
                  category.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }
              >
                {category.isActive ? 'Active' : 'Inactive'}
              </Badge>
              <Badge className={getPriorityColor(category.priorityLevel)}>
                Priority {category.priorityLevel} (
                {getPriorityLabel(category.priorityLevel)})
              </Badge>
              <Badge className={getSlaColor(category.slaHours)}>
                SLA: {getSlaLabel(category.slaHours)}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Description */}
          <div>
            <h3 className='text-lg font-medium mb-2'>Description</h3>
            <p className='text-muted-foreground'>
              {category.description || 'No description provided.'}
            </p>
          </div>

          <Separator />

          {/* Category Details */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-4'>
              <h3 className='text-lg font-medium'>Category Information</h3>

              <div className='space-y-3'>
                <div className='flex items-center gap-2'>
                  <AlertTriangle className='h-4 w-4 text-muted-foreground' />
                  <div>
                    <div className='text-sm text-muted-foreground'>
                      Priority Level
                    </div>
                    <div className='font-medium flex items-center gap-2'>
                      <span>{category.priorityLevel}</span>
                      <Badge
                        className={getPriorityColor(category.priorityLevel)}
                      >
                        {getPriorityLabel(category.priorityLevel)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className='flex items-center gap-2'>
                  <Clock className='h-4 w-4 text-muted-foreground' />
                  <div>
                    <div className='text-sm text-muted-foreground'>
                      SLA Hours
                    </div>
                    <div className='font-medium flex items-center gap-2'>
                      <span>{category.slaHours || 'Not set'}</span>
                      {category.slaHours && (
                        <Badge className={getSlaColor(category.slaHours)}>
                          {getSlaLabel(category.slaHours)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='space-y-4'>
              <h3 className='text-lg font-medium'>Timestamps</h3>

              <div className='space-y-3'>
                <div className='flex items-center gap-2'>
                  <Calendar className='h-4 w-4 text-muted-foreground' />
                  <div>
                    <div className='text-sm text-muted-foreground'>Created</div>
                    <div className='font-medium'>
                      {new Date(category.createdAt).toLocaleDateString()} at{' '}
                      {new Date(category.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                <div className='flex items-center gap-2'>
                  <Calendar className='h-4 w-4 text-muted-foreground' />
                  <div>
                    <div className='text-sm text-muted-foreground'>
                      Last Updated
                    </div>
                    <div className='font-medium'>
                      {new Date(category.updatedAt).toLocaleDateString()} at{' '}
                      {new Date(category.updatedAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                {category.createdBy && typeof category.createdBy === 'object' && (
                  <div className='flex items-center gap-2'>
                    <User className='h-4 w-4 text-muted-foreground' />
                    <div>
                      <div className='text-sm text-muted-foreground'>
                        Created By
                      </div>
                      <div className='font-medium'>
                        {(category.createdBy as any).firstName}{' '}
                        {(category.createdBy as any).lastName}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Escalation Levels */}
          {category.escalationLevels && category.escalationLevels.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className='text-lg font-medium mb-4'>Escalation Levels</h3>
                <div className='space-y-3'>
                  {category.escalationLevels.map(
                    (level: any, index: number) => (
                      <Card
                        key={index}
                        className='bg-gradient-to-r from-blue-50 to-indigo-50'
                      >
                        <CardContent className='pt-6'>
                          <div className='flex items-center justify-between mb-2'>
                            <div className='flex items-center gap-2'>
                              <ShieldAlert className='h-5 w-5 text-blue-600' />
                              <h4 className='font-medium'>
                                Escalation Level {level.level}
                              </h4>
                            </div>
                            <Badge
                              variant='outline'
                              className='bg-blue-100 text-blue-800'
                            >
                              After {level.hoursAfterCreation} hours
                            </Badge>
                          </div>
                          <div className='space-y-2'>
                            <div>
                              <div className='text-sm text-muted-foreground'>
                                Role to Escalate
                              </div>
                              <div className='font-medium'>{level.role}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  )}
                </div>
              </div>
            </>
          )}

          {/* Priority Analysis */}
          <Separator />
          <div>
            <h3 className='text-lg font-medium mb-4'>Priority Analysis</h3>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <Card>
                <CardContent className='pt-6'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-red-100 rounded-lg'>
                      <TrendingUp className='h-5 w-5 text-red-600' />
                    </div>
                    <div>
                      <div className='text-sm text-muted-foreground'>
                        Urgency Level
                      </div>
                      <div className='font-medium'>
                        {getPriorityLabel(category.priorityLevel)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className='pt-6'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-blue-100 rounded-lg'>
                      <Clock className='h-5 w-5 text-blue-600' />
                    </div>
                    <div>
                      <div className='text-sm text-muted-foreground'>
                        Resolution Time
                      </div>
                      <div className='font-medium'>
                        {getSlaLabel(category.slaHours)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className='pt-6'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-green-100 rounded-lg'>
                      <ShieldAlert className='h-5 w-5 text-green-600' />
                    </div>
                    <div>
                      <div className='text-sm text-muted-foreground'>
                        Status
                      </div>
                      <div className='font-medium'>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Actions */}
          <div className='pt-4'>
            <Separator className='mb-4' />
            <div className='flex gap-2'>
              <Button
                variant='outline'
                onClick={() => router.push('/complain-categories')}
              >
                Back to Categories
              </Button>
              {canUpdate && (
                <>
                  <Button
                    variant='outline'
                    onClick={() =>
                      router.push(`/complain-categories/edit/${id}`)
                    }
                  >
                    <Edit className='mr-2 h-4 w-4' />
                    Edit Category
                  </Button>
                  <Button
                    variant='outline'
                    onClick={() =>
                      router.push('/complain-categories/priority-analysis')
                    }
                  >
                    <TrendingUp className='mr-2 h-4 w-4' />
                    View Analysis
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
