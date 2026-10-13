'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  EnhancedDataTable as DataTable,
  TableColumn
} from '@/components/shared/DataTable/DataTable'
import { ActionBar } from '@/components/shared/PageTemplate'
import {
  useAttendanceRecords,
  useCheckIn,
  useCheckOut,
  useAttendanceSummary
} from '@/lib/hooks/entities/useAttendance'
import { AttendanceRecord } from '@/lib/types/attendance'
import { useAuth } from '@/lib/hooks/useAuth'
import { formatDate } from '@/lib/utils/format'
import { customToast } from '@/lib/utils/customToast'
import {
  RefreshCw,
  LogIn,
  LogOut,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  CalendarDays,
  Timer,
  Loader2
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useCallback } from 'react'

const getStatusVariant = (
  status: string
): 'default' | 'secondary' | 'destructive' | 'success' | 'warning' => {
  switch (status) {
    case 'present':
      return 'success'
    case 'absent':
      return 'destructive'
    case 'late':
      return 'warning'
    case 'half-day':
      return 'default'
    case 'leave':
      return 'secondary'
    case 'holiday':
      return 'secondary'
    default:
      return 'secondary'
  }
}

const attendanceColumns: TableColumn<AttendanceRecord>[] = [
  {
    id: 'date',
    header: 'Date',
    cell: (row: AttendanceRecord) => formatDate(row.date),
    sortable: true
  },
  {
    id: 'checkInTime',
    header: 'Check In Time',
    cell: (row: AttendanceRecord) =>
      row.checkInTime
        ? new Date(row.checkInTime).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          })
        : 'N/A'
  },
  {
    id: 'checkOutTime',
    header: 'Check Out Time',
    cell: (row: AttendanceRecord) =>
      row.checkOutTime
        ? new Date(row.checkOutTime).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          })
        : 'N/A'
  },
  {
    id: 'status',
    header: 'Status',
    cell: (row: AttendanceRecord) => (
      <Badge variant={getStatusVariant(row.status)}>
        {row.status?.toUpperCase() || 'N/A'}
      </Badge>
    )
  },
  {
    id: 'totalHours',
    header: 'Total Hours',
    cell: (row: AttendanceRecord) =>
      row.totalHours != null ? `${row.totalHours.toFixed(1)}h` : 'N/A',
    sortable: true
  },
  {
    id: 'isWithinGeofence',
    header: 'Within Geofence',
    cell: (row: AttendanceRecord) => (
      <Badge variant={row.isWithinGeofence ? 'success' : 'destructive'}>
        {row.isWithinGeofence ? 'Yes' : 'No'}
      </Badge>
    ),
    hideOnMobile: true
  },
  {
    id: 'remarks',
    header: 'Remarks',
    cell: (row: AttendanceRecord) => row.remarks || '-',
    hideOnMobile: true
  }
]

export default function AttendanceDashboard () {
  const { user } = useAuth()
  const router = useRouter()
  const [filters, setLocalFilters] = useState<Record<string, unknown>>({})
  const [page, setPage] = useState(1)
  const [checkingIn, setCheckingIn] = useState(false)
  const [checkingOut, setCheckingOut] = useState(false)

  const { data, isLoading, refetch } = useAttendanceRecords({
    ...filters,
    page,
    societyId: user?.societyId
  })

  const { data: summary } = useAttendanceSummary(user?.id || '', {})

  const checkInMutation = useCheckIn()
  const checkOutMutation = useCheckOut()

  const getLocation = useCallback((): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'))
        return
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      })
    })
  }, [])

  const handleCheckIn = async () => {
    setCheckingIn(true)
    try {
      const position = await getLocation()
      await checkInMutation.mutateAsync({
        societyId: user?.societyId || '',
        location: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        }
      })
    } catch (error: unknown) {
      const err = error as Error
      if (err.message?.includes('Geolocation')) {
        customToast.error('Please enable location access to check in')
      }
    } finally {
      setCheckingIn(false)
    }
  }

  const handleCheckOut = async () => {
    setCheckingOut(true)
    try {
      const position = await getLocation()
      // Find today's record to get the ID
      const todayStr = new Date().toISOString().split('T')[0]
      const todayRecord = (data?.items || []).find(
        (r: AttendanceRecord) => r.date?.startsWith(todayStr) && !r.checkOutTime
      )
      if (!todayRecord) {
        customToast.error('No active check-in found for today')
        return
      }
      await checkOutMutation.mutateAsync({
        id: todayRecord._id,
        data: {
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          }
        }
      })
    } catch (error: unknown) {
      const err = error as Error
      if (err.message?.includes('Geolocation')) {
        customToast.error('Please enable location access to check out')
      }
    } finally {
      setCheckingOut(false)
    }
  }

  const handleSearch = (search: string) => {
    setLocalFilters(prev => ({ ...prev, search }))
    setPage(1)
  }

  const handleFilterChange = (newFilters: Record<string, unknown>) => {
    setLocalFilters(prev => ({ ...prev, ...newFilters }))
    setPage(1)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const tableConfig = {
    columns: attendanceColumns,
    filters: [
      {
        id: 'status',
        label: 'Status',
        type: 'select' as const,
        options: [
          { label: 'Present', value: 'present' },
          { label: 'Absent', value: 'absent' },
          { label: 'Late', value: 'late' },
          { label: 'Half Day', value: 'half-day' },
          { label: 'Leave', value: 'leave' },
          { label: 'Holiday', value: 'holiday' }
        ]
      },
      {
        id: 'fromDate',
        label: 'From Date',
        type: 'date' as const,
        placeholder: 'Start date'
      },
      {
        id: 'toDate',
        label: 'To Date',
        type: 'date' as const,
        placeholder: 'End date'
      }
    ],
    enableActions: true,
    actions: {
      customActions: [
        {
          label: 'View',
          actionType: 'view' as const,
          onClick: (row: AttendanceRecord) =>
            router.push(`/attendance/view/${row._id}`)
        }
      ]
    },
    pagination: data?.pagination
      ? {
          currentPage: data.pagination.page,
          totalPages: data.pagination.pages,
          onPageChange: handlePageChange,
          pageSize: data.pagination.limit,
          onPageSizeChange: (size: number) => {
            setLocalFilters(prev => ({ ...prev, limit: size }))
            setPage(1)
          },
          totalItems: data.pagination.total
        }
      : undefined,
    responsive: {
      showMobileView: true,
      stickyHeader: true
    }
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-2xl font-bold'>Attendance</h1>
        <p className='text-muted-foreground'>
          Track your attendance, check in and check out
        </p>
      </div>

      {/* Check In / Check Out Buttons */}
      <div className='flex gap-4'>
        <Button
          variant='primary'
          size='lg'
          onClick={handleCheckIn}
          disabled={checkingIn || checkInMutation.isPending}
        >
          {checkingIn ? (
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          ) : (
            <LogIn className='mr-2 h-4 w-4' />
          )}
          Check In
        </Button>
        <Button
          variant='outline'
          size='lg'
          onClick={handleCheckOut}
          disabled={checkingOut || checkOutMutation.isPending}
        >
          {checkingOut ? (
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          ) : (
            <LogOut className='mr-2 h-4 w-4' />
          )}
          Check Out
        </Button>
      </div>

      {/* Monthly Summary Cards */}
      {summary && (
        <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4'>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
                <CheckCircle className='h-4 w-4' />
                Present
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-green-600'>
                {summary.present}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
                <XCircle className='h-4 w-4' />
                Absent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-red-600'>
                {summary.absent}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
                <AlertTriangle className='h-4 w-4' />
                Late
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-yellow-600'>
                {summary.late}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
                <Clock className='h-4 w-4' />
                Half-Day
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{summary.halfDay}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
                <CalendarDays className='h-4 w-4' />
                Leave
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-blue-600'>
                {summary.leave}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
                <Timer className='h-4 w-4' />
                Total Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {summary.totalHours?.toFixed(1)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
                <Timer className='h-4 w-4' />
                Overtime
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-purple-600'>
                {summary.overtimeHours?.toFixed(1)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Actions Bar */}
      <ActionBar
        left={
          <Button variant='glass' size='sm' onClick={() => refetch()}>
            <RefreshCw className='size-4' />
            Refresh
          </Button>
        }
      />

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={data?.items || []}
            config={tableConfig}
            isLoading={isLoading}
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
          />
        </CardContent>
      </Card>
    </div>
  )
}
