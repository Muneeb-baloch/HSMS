'use client'

import AttendanceView from '@/components/attendance/AttendanceView'

export default function AttendanceViewPage () {
  return (
    <div className='flex flex-1 flex-col overflow-auto p-6'>
      <AttendanceView />
    </div>
  )
}
