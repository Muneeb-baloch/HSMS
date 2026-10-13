'use client'

import { PermissionStatistics } from '@/components/permissions/PermissionStatistics'
import { PermissionStatsCards } from '@/components/permissions/PermissionStatsCards'
import { Button } from '@/components/ui/button'
import { usePermissionStatistics } from '@/hooks/usePermissions'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'

export default function AnalyticsPage () {
  const { statistics, loading, fetchStatistics } = usePermissionStatistics()

  useEffect(() => {
    fetchStatistics()
    const interval = setInterval(fetchStatistics, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [fetchStatistics])

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-start'>
        <div>
          <div className='flex items-center gap-4 mb-4'>
            <Link href='/permissions'>
              <Button variant='ghost' size='icon'>
                <ArrowLeft className='w-4 h-4' />
              </Button>
            </Link>
            <div>
              <h1 className='text-3xl font-bold'>Permission Analytics</h1>
              <p className='text-gray-600 mt-1'>
                Comprehensive permission statistics and insights
              </p>
            </div>
          </div>
        </div>
        <Button onClick={fetchStatistics} variant='outline' disabled={loading}>
          <RefreshCw
            className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`}
          />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <PermissionStatsCards statistics={statistics} />

      {/* Charts and Detailed Stats */}
      <PermissionStatistics statistics={statistics} loading={loading} />
    </div>
  )
}
