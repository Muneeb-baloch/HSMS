'use client'

import RewardsList from '@/components/gamification/RewardsList'

export default function RewardsPage () {
  return (
    <div className='flex flex-1 flex-col overflow-auto p-6'>
      <RewardsList />
    </div>
  )
}
