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
import { useCreateReward } from '@/lib/hooks/entities/useGamification'
import { useAuth } from '@/lib/hooks/useAuth'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import RewardForm, {
  type RewardFormData
} from '@/components/gamification/RewardForm'

export default function CreateRewardPage () {
  const router = useRouter()
  const { user } = useAuth()
  const createMutation = useCreateReward()

  const canCreate =
    user &&
    hasPermission(user.role as UserRole, [
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN
    ])

  if (!canCreate) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to create rewards.
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
    await createMutation.mutateAsync({
      ...data,
      societyId: user?.societyId || ''
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

      <h1 className='text-3xl font-bold'>Create New Reward</h1>
      <p className='text-gray-500 mt-2'>
        Define a new reward that members can redeem with their points
      </p>

      <div className='mt-6 max-w-4xl'>
        <Card>
          <CardContent className='pt-6'>
            <RewardForm
              mode='create'
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={createMutation.isPending}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
