'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import {
  useRewards,
  useUpdateReward
} from '@/lib/hooks/entities/useGamification'
import { GamificationReward } from '@/lib/types/gamification'
import { useAuth } from '@/lib/hooks/useAuth'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import RewardForm, {
import { FormPageSkeleton } from '@/components/shared/PageSkeleton'
  type RewardFormData
} from '@/components/gamification/RewardForm'

export default function EditRewardPage () {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const id = params.id as string

  const updateMutation = useUpdateReward()
  const { data: rewardsData, isLoading } = useRewards(
    user?.societyId || '',
    { page: 1, limit: 100 }
  )

  const canEdit =
    user &&
    hasPermission(user.role as UserRole, [
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN
    ])

  if (!canEdit) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to edit rewards.
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

  const rewards: GamificationReward[] = rewardsData?.items || []
  const reward = rewards.find((r: GamificationReward) => r._id === id)

  if (!reward) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Reward Not Found</CardTitle>
            <CardDescription>
              The reward could not be loaded or does not exist.
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

  const handleSubmit = async (data: RewardFormData) => {
    await updateMutation.mutateAsync({
      id,
      data: {
        ...data,
        societyId: user?.societyId || ''
      }
    })
    router.push('/gamification/rewards')
  }

  const handleCancel = () => router.back()

  return (
    <div className='p-6'>
      <Button variant='ghost' onClick={() => router.back()} className='mb-4'>
        <ArrowLeft className='mr-2 h-4 w-4' />
        Back to Rewards
      </Button>

      <h1 className='text-3xl font-bold'>Edit Reward</h1>
      <p className='text-gray-500 mt-2'>{reward.rewardName}</p>

      <div className='mt-6 max-w-4xl'>
        <Card>
          <CardContent className='pt-6'>
            <RewardForm
              mode='edit'
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={updateMutation.isPending}
              defaultValues={{
                rewardName: reward.rewardName,
                description: reward.description || '',
                pointsCost: reward.pointsCost,
                quantity: reward.quantity,
                rewardType: reward.rewardType,
                validUntil: reward.validUntil
                  ? new Date(reward.validUntil).toISOString().split('T')[0]
                  : undefined
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
