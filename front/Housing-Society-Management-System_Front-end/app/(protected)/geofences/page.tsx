'use client'

import GeofenceList from '@/components/attendance/GeofenceList'

export default function GeofencesPage () {
  return (
    <div className='flex flex-1 flex-col overflow-auto p-6'>
      <GeofenceList />
    </div>
  )
}
