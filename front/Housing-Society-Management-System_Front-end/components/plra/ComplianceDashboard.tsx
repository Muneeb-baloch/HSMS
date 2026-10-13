'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/hooks/useAuth'
import { useComplianceDashboard } from '@/lib/hooks/entities/usePLRA'
import { PLRASyncLog } from '@/lib/types/plra'
import { formatDate } from '@/lib/utils/format'
import { customToast } from '@/lib/utils/customToast'
import {
  BarChart3,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  RefreshCw,
  ShieldCheck,
  XCircle
} from 'lucide-react'

const logStatusVariant = (status: string) => {
  switch (status) {
    case 'success':
      return 'success'
    case 'failed':
      return 'destructive'
    case 'timeout':
      return 'warning'
    default:
      return 'secondary'
  }
}

export default function ComplianceDashboard () {
  const { user } = useAuth()
  const societyId = (user as { societyId?: string })?.societyId || ''

  const { data, isLoading, error } = useComplianceDashboard(societyId)

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[60vh]'>
        <Loader2 className='h-10 w-10 animate-spin text-primary' />
      </div>
    )
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Compliance Dashboard Unavailable</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground'>
            Unable to load compliance data. Please try again later.
          </p>
        </CardContent>
      </Card>
    )
  }

  const totalCertificates = data.totalCertificates || 0
  const syncedCount = data.syncedCount || 0
  const pendingCount = data.pendingCount || 0
  const failedCount = data.failedCount || 0
  const recentLogs: PLRASyncLog[] = data.recentLogs || []

  const syncRate =
    totalCertificates > 0
      ? Math.round((syncedCount / totalCertificates) * 100)
      : 0

  const getSyncRateColor = (rate: number) => {
    if (rate >= 90) return 'text-green-500'
    if (rate >= 70) return 'text-amber-500'
    return 'text-red-500'
  }

  const handleSyncAllPending = () => {
    customToast.info('Sync all pending functionality coming soon')
  }

  const handleGenerateReport = () => {
    customToast.info('Report generation coming soon')
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-2xl font-bold text-white flex items-center gap-2'>
          <BarChart3 className='h-6 w-6' />
          PLRA Compliance Cockpit
        </h1>
        <p className='text-muted-foreground mt-1'>
          Monitor certificate synchronization and compliance status
        </p>
      </div>

      {/* Stat Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <div className='text-sm text-gray-500'>Total Certificates</div>
                <div className='text-3xl font-bold mt-1'>
                  {totalCertificates}
                </div>
              </div>
              <ShieldCheck className='h-8 w-8 text-blue-500 opacity-60' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <div className='text-sm text-gray-500'>Synced</div>
                <div className='text-3xl font-bold mt-1 text-green-600'>
                  {syncedCount}
                </div>
              </div>
              <CheckCircle2 className='h-8 w-8 text-green-500 opacity-60' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <div className='text-sm text-gray-500'>Pending</div>
                <div className='text-3xl font-bold mt-1 text-amber-500'>
                  {pendingCount}
                </div>
              </div>
              <Clock className='h-8 w-8 text-amber-500 opacity-60' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <div className='text-sm text-gray-500'>Failed</div>
                <div className='text-3xl font-bold mt-1 text-red-600'>
                  {failedCount}
                </div>
              </div>
              <XCircle className='h-8 w-8 text-red-500 opacity-60' />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sync Success Rate + Actions */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <Card className='md:col-span-1'>
          <CardHeader>
            <CardTitle className='text-lg'>Sync Success Rate</CardTitle>
          </CardHeader>
          <CardContent className='flex flex-col items-center justify-center py-6'>
            <div className={`text-6xl font-bold ${getSyncRateColor(syncRate)}`}>
              {syncRate}%
            </div>
            <p className='text-muted-foreground mt-2 text-sm'>
              {syncedCount} of {totalCertificates} certificates synced
            </p>
            <div className='w-full bg-gray-700 rounded-full h-3 mt-4'>
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  syncRate >= 90
                    ? 'bg-green-500'
                    : syncRate >= 70
                    ? 'bg-amber-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${syncRate}%` }}
              />
            </div>

            {/* Status breakdown summary */}
            <div className='w-full mt-6 space-y-2 text-sm'>
              <div className='flex justify-between items-center'>
                <span className='text-gray-500'>Synced</span>
                <span className='font-medium text-green-500'>
                  {syncedCount} ({totalCertificates > 0 ? Math.round((syncedCount / totalCertificates) * 100) : 0}%)
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-gray-500'>Pending</span>
                <span className='font-medium text-amber-500'>
                  {pendingCount} ({totalCertificates > 0 ? Math.round((pendingCount / totalCertificates) * 100) : 0}%)
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-gray-500'>Failed</span>
                <span className='font-medium text-red-500'>
                  {failedCount} ({totalCertificates > 0 ? Math.round((failedCount / totalCertificates) * 100) : 0}%)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='md:col-span-2'>
          <CardHeader>
            <CardTitle className='text-lg'>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <Button
                variant='outline'
                className='h-auto py-4 flex flex-col items-center gap-2'
                onClick={handleSyncAllPending}
              >
                <RefreshCw className='h-6 w-6' />
                <div className='text-center'>
                  <div className='font-medium'>Sync All Pending</div>
                  <div className='text-xs text-muted-foreground'>
                    Synchronize {pendingCount} pending certificates
                  </div>
                </div>
              </Button>

              <Button
                variant='outline'
                className='h-auto py-4 flex flex-col items-center gap-2'
                onClick={handleGenerateReport}
              >
                <FileText className='h-6 w-6' />
                <div className='text-center'>
                  <div className='font-medium'>Generate Report</div>
                  <div className='text-xs text-muted-foreground'>
                    Download compliance report as PDF
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sync Logs */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Recent Sync Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {recentLogs.length === 0 ? (
            <p className='text-muted-foreground text-sm'>
              No recent sync activity.
            </p>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b border-border'>
                    <th className='text-left py-3 px-4 font-medium text-muted-foreground'>
                      Action
                    </th>
                    <th className='text-left py-3 px-4 font-medium text-muted-foreground'>
                      Status
                    </th>
                    <th className='text-left py-3 px-4 font-medium text-muted-foreground'>
                      Duration
                    </th>
                    <th className='text-left py-3 px-4 font-medium text-muted-foreground'>
                      Error
                    </th>
                    <th className='text-left py-3 px-4 font-medium text-muted-foreground'>
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentLogs.slice(0, 10).map((log: PLRASyncLog) => (
                    <tr
                      key={log._id}
                      className='border-b border-border/50 hover:bg-muted/50'
                    >
                      <td className='py-3 px-4'>{log.action}</td>
                      <td className='py-3 px-4'>
                        <Badge
                          variant={logStatusVariant(log.status)}
                          className='capitalize'
                        >
                          {log.status}
                        </Badge>
                      </td>
                      <td className='py-3 px-4'>
                        {log.duration ? `${log.duration}ms` : '-'}
                      </td>
                      <td className='py-3 px-4 text-red-400 max-w-[200px] truncate'>
                        {log.errorMessage || '-'}
                      </td>
                      <td className='py-3 px-4'>
                        {formatDate(log.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
