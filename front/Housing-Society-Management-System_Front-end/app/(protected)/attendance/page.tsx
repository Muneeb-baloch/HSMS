'use client'

import AttendanceDashboard from '@/components/attendance/AttendanceDashboard'

export default function AttendancePage () {
  return (
    <div className='flex flex-1 flex-col overflow-auto p-6'>
      <AttendanceDashboard />
    </div>
  )
}
