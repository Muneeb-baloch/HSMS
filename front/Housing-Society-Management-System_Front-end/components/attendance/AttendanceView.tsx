'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { useAttendanceRecord } from '@/lib/hooks/entities/useAttendance'
import { formatDate } from '@/lib/utils/format'
import { ArrowLeft, Loader2, MapPin, Clock, User } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'

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

export default function AttendanceView () {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const { data: record, isLoading, error } = useAttendanceRecord(id)

  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-[60vh]'>
        <Loader2 className='h-10 w-10 animate-spin text-primary' />
      </div>
    )
  }

  if (error || !record) {
    return (
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Attendance Record Not Found</CardTitle>
            <CardDescription>
              The requested attendance record does not exist or has been deleted.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/attendance')}>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Attendance
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const staffName =
    typeof record.staffId === 'object'
      ? (record.staffId as { name?: string }).name || 'N/A'
      : record.staffId || 'N/A'

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-start'>
        <Button variant='ghost' onClick={() => router.back()}>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back
        </Button>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Main Details */}
        <Card>
          <CardHeader>
            <CardTitle className='text-xl'>Attendance Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <div className='text-sm text-muted-foreground flex items-center gap-1'>
                  <User className='h-3 w-3' />
                  Staff
                </div>
                <div className='font-medium mt-1'>{staffName}</div>
              </div>

              <div>
                <div className='text-sm text-muted-foreground'>Date</div>
                <div className='font-medium mt-1'>{formatDate(record.date)}</div>
              </div>

              <div>
                <div className='text-sm text-muted-foreground flex items-center gap-1'>
                  <Clock className='h-3 w-3' />
                  Check-in Time
                </div>
                <div className='font-medium mt-1'>
                  {record.checkInTime
                    ? new Date(record.checkInTime).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })
                    : 'N/A'}
                </div>
              </div>

              <div>
                <div className='text-sm text-muted-foreground flex items-center gap-1'>
                  <Clock className='h-3 w-3' />
                  Check-out Time
                </div>
                <div className='font-medium mt-1'>
                  {record.checkOutTime
                    ? new Date(record.checkOutTime).toLocaleTimeString(
                        'en-US',
                        {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        }
                      )
                    : 'N/A'}
                </div>
              </div>

              <div>
                <div className='text-sm text-muted-foreground'>Status</div>
                <div className='mt-1'>
                  <Badge variant={getStatusVariant(record.status)}>
                    {record.status?.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div>
                <div className='text-sm text-muted-foreground'>
                  Geofence Status
                </div>
                <div className='mt-1'>
                  <Badge
                    variant={record.isWithinGeofence ? 'success' : 'destructive'}
                  >
                    {record.isWithinGeofence
                      ? 'Within Geofence'
                      : 'Outside Geofence'}
                  </Badge>
                </div>
              </div>

              <div>
                <div className='text-sm text-muted-foreground'>Total Hours</div>
                <div className='font-medium mt-1'>
                  {record.totalHours != null
                    ? `${record.totalHours.toFixed(1)} hours`
                    : 'N/A'}
                </div>
              </div>

              <div>
                <div className='text-sm text-muted-foreground'>Overtime</div>
                <div className='font-medium mt-1'>
                  {record.overtimeHours != null
                    ? `${record.overtimeHours.toFixed(1)} hours`
                    : 'N/A'}
                </div>
              </div>

              {record.shiftName && (
                <div>
                  <div className='text-sm text-muted-foreground'>Shift</div>
                  <div className='font-medium mt-1'>{record.shiftName}</div>
                </div>
              )}

              {record.remarks && (
                <div className='col-span-2'>
                  <div className='text-sm text-muted-foreground'>Remarks</div>
                  <div className='font-medium mt-1'>{record.remarks}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Location Details */}
        <Card>
          <CardHeader>
            <CardTitle className='text-xl flex items-center gap-2'>
              <MapPin className='h-5 w-5' />
              Location Details
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            {/* Check-in Location */}
            <div>
              <h3 className='font-semibold text-sm mb-2'>Check-in Location</h3>
              {record.checkInLocation ? (
                <div className='grid grid-cols-2 gap-2 text-sm'>
                  <div>
                    <span className='text-muted-foreground'>Latitude:</span>
                    <span className='ml-2 font-mono'>
                      {record.checkInLocation.latitude.toFixed(6)}
                    </span>
                  </div>
                  <div>
                    <span className='text-muted-foreground'>Longitude:</span>
                    <span className='ml-2 font-mono'>
                      {record.checkInLocation.longitude.toFixed(6)}
                    </span>
                  </div>
                  {record.checkInLocation.accuracy != null && (
                    <div className='col-span-2'>
                      <span className='text-muted-foreground'>Accuracy:</span>
                      <span className='ml-2'>
                        {record.checkInLocation.accuracy.toFixed(0)}m
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className='text-sm text-muted-foreground'>
                  No location data available
                </p>
              )}
            </div>

            {/* Check-out Location */}
            <div>
              <h3 className='font-semibold text-sm mb-2'>Check-out Location</h3>
              {record.checkOutLocation ? (
                <div className='grid grid-cols-2 gap-2 text-sm'>
                  <div>
                    <span className='text-muted-foreground'>Latitude:</span>
                    <span className='ml-2 font-mono'>
                      {record.checkOutLocation.latitude.toFixed(6)}
                    </span>
                  </div>
                  <div>
                    <span className='text-muted-foreground'>Longitude:</span>
                    <span className='ml-2 font-mono'>
                      {record.checkOutLocation.longitude.toFixed(6)}
                    </span>
                  </div>
                  {record.checkOutLocation.accuracy != null && (
                    <div className='col-span-2'>
                      <span className='text-muted-foreground'>Accuracy:</span>
                      <span className='ml-2'>
                        {record.checkOutLocation.accuracy.toFixed(0)}m
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className='text-sm text-muted-foreground'>
                  No location data available
                </p>
              )}
            </div>

            {/* Map placeholder */}
            {(record.checkInLocation || record.checkOutLocation) && (
              <div className='border rounded-lg bg-muted/50 p-8 text-center'>
                <MapPin className='h-8 w-8 mx-auto text-muted-foreground mb-2' />
                <p className='text-sm text-muted-foreground'>
                  Map view showing check-in/out locations
                </p>
                {record.checkInLocation && (
                  <a
                    href={`https://www.google.com/maps?q=${record.checkInLocation.latitude},${record.checkInLocation.longitude}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-sm text-blue-600 hover:underline mt-2 inline-block'
                  >
                    Open in Google Maps
                  </a>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
