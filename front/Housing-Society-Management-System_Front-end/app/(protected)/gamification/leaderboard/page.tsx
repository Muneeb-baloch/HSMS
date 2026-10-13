'use client'

import LeaderboardTable from '@/components/gamification/LeaderboardTable'

export default function LeaderboardPage () {
  return (
    <div className='flex flex-1 flex-col overflow-auto p-6'>
      <LeaderboardTable />
    </div>
  )
}
