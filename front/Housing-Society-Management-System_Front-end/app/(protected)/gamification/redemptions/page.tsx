'use client'

import RedemptionList from '@/components/gamification/RedemptionList'

export default function RedemptionsPage () {
  return (
    <div className='flex flex-1 flex-col overflow-auto p-6'>
      <RedemptionList />
    </div>
  )
}
