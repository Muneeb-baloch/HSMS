'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  usePoints,
  usePointHistory
} from '@/lib/hooks/entities/useGamification'
import { PointHistoryEntry } from '@/lib/types/gamification'
import { useAuth } from '@/lib/hooks/useAuth'
import { formatDate } from '@/lib/utils/format'
import {
  Star,
  Trophy,
  Gift,
  History,
  ArrowRight,
  TrendingUp,
  Loader2
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function GamificationDashboard () {
  const { user } = useAuth()
  const router = useRouter()

  const { data: points, isLoading: pointsLoading } = usePoints(user?.id)
  const { data: historyData, isLoading: historyLoading } = usePointHistory(
    user?.id,
    { page: 1, limit: 10 }
  )

  const isLoading = pointsLoading || historyLoading

  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-[60vh]'>
        <Loader2 className='h-10 w-10 animate-spin text-primary' />
      </div>
    )
  }

  const currentPoints = points?.currentPoints || 0
  const totalPoints = points?.totalPoints || 0
  const level = points?.level || 'Bronze'

  const getLevelColor = (lvl: string) => {
    switch (lvl.toLowerCase()) {
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

  const getLevelThreshold = (lvl: string): number => {
    switch (lvl.toLowerCase()) {
      case 'bronze':
        return 500
      case 'silver':
        return 1500
      case 'gold':
        return 3000
      case 'platinum':
        return 5000
      case 'diamond':
        return 10000
      default:
        return 500
    }
  }

  const nextLevelPoints = getLevelThreshold(level)
  const pointsToNext = Math.max(0, nextLevelPoints - totalPoints)

  const recentHistory = historyData?.items || []

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-2xl font-bold'>Gamification</h1>
        <p className='text-muted-foreground'>
          Track your points, level, and rewards
        </p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
              <Star className='h-4 w-4' />
              Current Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold text-primary'>
              {currentPoints.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
              <TrendingUp className='h-4 w-4' />
              Total Points Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold'>
              {totalPoints.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
              <Trophy className='h-4 w-4' />
              Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={`text-lg px-3 py-1 ${getLevelColor(level)}`}>
              {level}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
              <ArrowRight className='h-4 w-4' />
              Points to Next Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold text-orange-600'>
              {pointsToNext.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card
          className='cursor-pointer hover:shadow-lg transition-shadow'
          onClick={() => router.push('/gamification/leaderboard')}
        >
          <CardContent className='pt-6 flex items-center gap-4'>
            <div className='p-3 rounded-full bg-yellow-100'>
              <Trophy className='h-6 w-6 text-yellow-600' />
            </div>
            <div>
              <h3 className='font-semibold'>View Leaderboard</h3>
              <p className='text-sm text-muted-foreground'>
                See how you rank against others
              </p>
            </div>
            <ArrowRight className='h-5 w-5 ml-auto text-muted-foreground' />
          </CardContent>
        </Card>

        <Card
          className='cursor-pointer hover:shadow-lg transition-shadow'
          onClick={() => router.push('/gamification/rewards')}
        >
          <CardContent className='pt-6 flex items-center gap-4'>
            <div className='p-3 rounded-full bg-green-100'>
              <Gift className='h-6 w-6 text-green-600' />
            </div>
            <div>
              <h3 className='font-semibold'>Browse Rewards</h3>
              <p className='text-sm text-muted-foreground'>
                Redeem your points for rewards
              </p>
            </div>
            <ArrowRight className='h-5 w-5 ml-auto text-muted-foreground' />
          </CardContent>
        </Card>

        <Card
          className='cursor-pointer hover:shadow-lg transition-shadow'
          onClick={() => router.push('/gamification/redemptions')}
        >
          <CardContent className='pt-6 flex items-center gap-4'>
            <div className='p-3 rounded-full bg-blue-100'>
              <History className='h-6 w-6 text-blue-600' />
            </div>
            <div>
              <h3 className='font-semibold'>My History</h3>
              <p className='text-sm text-muted-foreground'>
                View your redemptions and history
              </p>
            </div>
            <ArrowRight className='h-5 w-5 ml-auto text-muted-foreground' />
          </CardContent>
        </Card>
      </div>

      {/* Recent Points History */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <History className='h-5 w-5' />
            Recent Points History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentHistory.length === 0 ? (
            <div className='text-center py-8'>
              <Star className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
              <h3 className='text-lg font-semibold'>No Points History Yet</h3>
              <p className='text-muted-foreground mt-1'>
                Start earning points by participating in community activities.
              </p>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b'>
                    <th className='text-left py-3 px-2 font-medium text-muted-foreground'>
                      Event
                    </th>
                    <th className='text-left py-3 px-2 font-medium text-muted-foreground'>
                      Description
                    </th>
                    <th className='text-right py-3 px-2 font-medium text-muted-foreground'>
                      Points
                    </th>
                    <th className='text-right py-3 px-2 font-medium text-muted-foreground'>
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentHistory.map(
                    (entry: PointHistoryEntry, index: number) => (
                      <tr key={index} className='border-b last:border-b-0'>
                        <td className='py-3 px-2 font-medium'>
                          {entry.event}
                        </td>
                        <td className='py-3 px-2 text-muted-foreground'>
                          {entry.description || '-'}
                        </td>
                        <td className='py-3 px-2 text-right'>
                          <span
                            className={
                              entry.points > 0
                                ? 'text-green-600 font-semibold'
                                : 'text-red-600 font-semibold'
                            }
                          >
                            {entry.points > 0 ? '+' : ''}
                            {entry.points}
                          </span>
                        </td>
                        <td className='py-3 px-2 text-right text-muted-foreground'>
                          {formatDate(entry.date)}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
