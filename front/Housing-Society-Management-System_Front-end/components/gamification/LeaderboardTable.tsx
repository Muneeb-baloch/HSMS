'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useLeaderboard } from '@/lib/hooks/entities/useGamification'
import { LeaderboardEntry } from '@/lib/types/gamification'
import { useAuth } from '@/lib/hooks/useAuth'
import { ArrowLeft, Trophy, Medal, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Period = 'monthly' | 'yearly' | 'all-time'

const getLevelColor = (level: string) => {
  switch (level.toLowerCase()) {
    case 'bronze':
      return 'bg-amber-700 text-white'
    case 'silver':
      return 'bg-gray-400 text-white'
    case 'gold':
      return 'bg-yellow-500 text-white'
    case 'platinum':
      return 'bg-blue-300 text-gray-800'
    case 'diamond':
      return 'bg-purple-500 text-white'
    default:
      return 'bg-gray-500 text-white'
  }
}

const getRankStyle = (rank: number) => {
  switch (rank) {
    case 1:
      return 'bg-yellow-50 border-yellow-300 border-2'
    case 2:
      return 'bg-gray-50 border-gray-300 border-2'
    case 3:
      return 'bg-orange-50 border-orange-300 border-2'
    default:
      return ''
  }
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className='h-5 w-5 text-yellow-500' />
    case 2:
      return <Medal className='h-5 w-5 text-gray-400' />
    case 3:
      return <Medal className='h-5 w-5 text-orange-500' />
    default:
      return null
  }
}

export default function LeaderboardTable () {
  const { user } = useAuth()
  const router = useRouter()
  const [period, setPeriod] = useState<Period>('monthly')

  const { data: leaderboard, isLoading } = useLeaderboard({
    societyId: user?.societyId || '',
    period,
    limit: 50
  })

  const entries: LeaderboardEntry[] = Array.isArray(leaderboard)
    ? leaderboard
    : (leaderboard as { entries?: LeaderboardEntry[] })?.entries || []

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-start justify-between'>
        <div>
          <Button variant='ghost' onClick={() => router.back()} className='mb-2'>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back
          </Button>
          <h1 className='text-2xl font-bold'>Leaderboard</h1>
          <p className='text-muted-foreground'>
            See who is leading in community engagement
          </p>
        </div>
      </div>

      {/* Period Selector */}
      <div className='flex gap-2'>
        {(['monthly', 'yearly', 'all-time'] as Period[]).map(p => (
          <Button
            key={p}
            variant={period === p ? 'primary' : 'outline'}
            size='sm'
            onClick={() => setPeriod(p)}
          >
            {p === 'monthly'
              ? 'Monthly'
              : p === 'yearly'
              ? 'Yearly'
              : 'All Time'}
          </Button>
        ))}
      </div>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Trophy className='h-5 w-5' />
            Rankings -{' '}
            {period === 'monthly'
              ? 'This Month'
              : period === 'yearly'
              ? 'This Year'
              : 'All Time'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className='flex justify-center items-center py-12'>
              <Loader2 className='h-8 w-8 animate-spin text-primary' />
            </div>
          ) : entries.length === 0 ? (
            <div className='text-center py-12'>
              <Trophy className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
              <h3 className='text-lg font-semibold'>No Leaderboard Data</h3>
              <p className='text-muted-foreground mt-1'>
                No rankings available for this period yet.
              </p>
            </div>
          ) : (
            <div className='space-y-2'>
              {entries.map((entry: LeaderboardEntry) => (
                <div
                  key={entry.memberId}
                  className={`flex items-center gap-4 p-4 rounded-lg transition-colors hover:bg-muted/50 ${getRankStyle(
                    entry.rank
                  )}`}
                >
                  {/* Rank */}
                  <div className='flex items-center justify-center w-10 h-10'>
                    {getRankIcon(entry.rank) || (
                      <span className='text-lg font-bold text-muted-foreground'>
                        #{entry.rank}
                      </span>
                    )}
                  </div>

                  {/* Member Info */}
                  <div className='flex-1 min-w-0'>
                    <div className='font-semibold truncate'>
                      {entry.memberName}
                    </div>
                    <Badge className={`text-xs ${getLevelColor(entry.level)}`}>
                      {entry.level}
                    </Badge>
                  </div>

                  {/* Points */}
                  <div className='text-right'>
                    <div className='text-lg font-bold'>
                      {entry.totalPoints.toLocaleString()}
                    </div>
                    <div className='text-xs text-muted-foreground'>points</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
