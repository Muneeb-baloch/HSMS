'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ActionBar } from '@/components/shared/PageTemplate'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import {
  useRewards,
  useDeleteReward,
  useRedeemReward,
  usePoints
} from '@/lib/hooks/entities/useGamification'
import { GamificationReward } from '@/lib/types/gamification'
import { useAuth } from '@/lib/hooks/useAuth'
import { customToast } from '@/lib/utils/customToast'
import { formatDate } from '@/lib/utils/format'
import {
  Plus,
  RefreshCw,
  Gift,
  ArrowLeft,
  Edit,
  Trash2,
  Star,
  Loader2
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useConfirm } from "@/components/shared/ConfirmDialog";

const getRewardTypeBadge = (type: string) => {
  switch (type) {
    case 'discount':
      return <Badge variant='default'>Discount</Badge>
    case 'free-booking':
      return <Badge variant='success'>Free Booking</Badge>
    case 'merchandise':
      return <Badge variant='warning'>Merchandise</Badge>
    case 'recognition':
      return <Badge variant='secondary'>Recognition</Badge>
    case 'donation':
      return <Badge className='bg-pink-500 text-white'>Donation</Badge>
    default:
      return <Badge variant='secondary'>{type}</Badge>
  }
}

export default function RewardsList () {
  const { user } = useAuth()
  const router = useRouter()
  const [rewardTypeFilter, setRewardTypeFilter] = useState<string>('all')
  const { confirm } = useConfirm();

  const { data: rewardsData, isLoading, refetch } = useRewards(
    user?.societyId || '',
    { page: 1, limit: 50 }
  )

  const { data: points } = usePoints(user?.id)
  const deleteMutation = useDeleteReward()
  const redeemMutation = useRedeemReward()

  const canManage =
    user &&
    hasPermission(user.role as UserRole, [
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN
    ])

  const currentPoints = points?.currentPoints || 0

  const rewards: GamificationReward[] = rewardsData?.items || []

  const filteredRewards =
    rewardTypeFilter === 'all'
      ? rewards
      : rewards.filter(
          (r: GamificationReward) => r.rewardType === rewardTypeFilter
        )

  const handleDelete = async (id: string) => {
    if (await confirm({ title: "Delete", description: 'Are you sure you want to delete this reward?', variant: "destructive" })) {
      try {
        await deleteMutation.mutateAsync(id)
      } catch {
        // Error handled by mutation hook
      }
    }
  }

  const handleRedeem = async (reward: GamificationReward) => {
    if (currentPoints < reward.pointsCost) {
      customToast.error(
        `Not enough points. You need ${reward.pointsCost} but have ${currentPoints}.`
      )
      return
    }

    if (
      await confirm({ title: "Confirm", description: `Redeem "${reward.rewardName}" for ${reward.pointsCost} points?` })
    ) {
      try {
        await redeemMutation.mutateAsync({
          rewardId: reward._id,
          societyId: user?.societyId || ''
        })
      } catch {
        // Error handled by mutation hook
      }
    }
  }

  const rewardTypes = [
    { label: 'All', value: 'all' },
    { label: 'Discount', value: 'discount' },
    { label: 'Free Booking', value: 'free-booking' },
    { label: 'Merchandise', value: 'merchandise' },
    { label: 'Recognition', value: 'recognition' },
    { label: 'Donation', value: 'donation' }
  ]

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <Button variant='ghost' onClick={() => router.back()} className='mb-2'>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back
        </Button>
        <h1 className='text-2xl font-bold'>Rewards Catalog</h1>
        <p className='text-muted-foreground'>
          Browse and redeem rewards with your points. You have{' '}
          <span className='font-semibold text-primary'>
            {currentPoints.toLocaleString()}
          </span>{' '}
          points.
        </p>
      </div>

      {/* Actions Bar */}
      <ActionBar
        left={
          <div className='flex gap-2 flex-wrap'>
            <Button variant='glass' size='sm' onClick={() => refetch()}>
              <RefreshCw className='size-4' />
              Refresh
            </Button>
            {rewardTypes.map(rt => (
              <Button
                key={rt.value}
                variant={rewardTypeFilter === rt.value ? 'primary' : 'outline'}
                size='sm'
                onClick={() => setRewardTypeFilter(rt.value)}
              >
                {rt.label}
              </Button>
            ))}
          </div>
        }
        right={
          canManage && (
            <Button
              variant='primary'
              size='sm'
              onClick={() => router.push('/gamification/rewards/create')}
            >
              <Plus className='size-4' />
              Create Reward
            </Button>
          )
        }
      />

      {/* Rewards Grid */}
      {isLoading ? (
        <div className='flex justify-center items-center py-12'>
          <Loader2 className='h-8 w-8 animate-spin text-primary' />
        </div>
      ) : filteredRewards.length === 0 ? (
        <Card>
          <CardContent className='pt-6 text-center'>
            <Gift className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
            <h3 className='text-lg font-semibold'>No Rewards Found</h3>
            <p className='text-muted-foreground mt-1'>
              {rewardTypeFilter !== 'all'
                ? 'No rewards match the selected filter.'
                : 'No rewards are available at the moment.'}
            </p>
            {canManage && (
              <Button
                className='mt-4'
                onClick={() => router.push('/gamification/rewards/create')}
              >
                <Plus className='mr-2 h-4 w-4' />
                Create Reward
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filteredRewards.map((reward: GamificationReward) => {
            const isExpired =
              reward.validUntil && new Date(reward.validUntil) < new Date()
            const isOutOfStock =
              reward.quantity !== -1 && reward.quantity <= 0
            const canAfford = currentPoints >= reward.pointsCost

            return (
              <Card
                key={reward._id}
                className={`relative transition-all hover:shadow-lg ${
                  !reward.isActive || isExpired || isOutOfStock
                    ? 'opacity-60'
                    : ''
                }`}
              >
                <CardHeader className='pb-3'>
                  <div className='flex items-start justify-between'>
                    <div>
                      <CardTitle className='text-lg'>
                        {reward.rewardName}
                      </CardTitle>
                      <div className='mt-1'>
                        {getRewardTypeBadge(reward.rewardType)}
                      </div>
                    </div>
                    <div className='flex items-center gap-1 text-lg font-bold text-primary'>
                      <Star className='h-4 w-4' />
                      {reward.pointsCost.toLocaleString()}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {reward.description && (
                    <p className='text-sm text-muted-foreground line-clamp-2'>
                      {reward.description}
                    </p>
                  )}

                  <div className='grid grid-cols-2 gap-3 text-sm'>
                    <div>
                      <span className='text-muted-foreground'>Quantity:</span>
                      <span className='ml-1 font-medium'>
                        {reward.quantity === -1
                          ? 'Unlimited'
                          : reward.quantity}
                      </span>
                    </div>
                    {reward.validUntil && (
                      <div>
                        <span className='text-muted-foreground'>
                          Valid Until:
                        </span>
                        <span className='ml-1 font-medium'>
                          {formatDate(reward.validUntil)}
                        </span>
                      </div>
                    )}
                  </div>

                  {isExpired && (
                    <Badge variant='destructive' className='text-xs'>
                      Expired
                    </Badge>
                  )}
                  {isOutOfStock && (
                    <Badge variant='warning' className='text-xs'>
                      Out of Stock
                    </Badge>
                  )}

                  {/* Actions */}
                  <div className='flex gap-2 pt-2 border-t'>
                    {!canManage && !isExpired && !isOutOfStock && (
                      <Button
                        variant={canAfford ? 'primary' : 'outline'}
                        size='sm'
                        className='flex-1'
                        onClick={() => handleRedeem(reward)}
                        disabled={
                          !canAfford ||
                          redeemMutation.isPending ||
                          !reward.isActive
                        }
                      >
                        <Gift className='mr-1 h-3 w-3' />
                        {canAfford ? 'Redeem' : 'Not Enough Points'}
                      </Button>
                    )}
                    {canManage && (
                      <>
                        <Button
                          variant='outline'
                          size='sm'
                          className='flex-1'
                          onClick={() =>
                            router.push(
                              `/gamification/rewards/edit/${reward._id}`
                            )
                          }
                        >
                          <Edit className='mr-1 h-3 w-3' />
                          Edit
                        </Button>
                        <Button
                          variant='outline'
                          size='sm'
                          className='text-red-600 hover:text-red-700'
                          onClick={() => handleDelete(reward._id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className='h-3 w-3' />
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
