'use client'

import { useEffect, useState } from 'react'
import { useProjects } from '@/lib/hooks/entities/useProject'
import ProjectsLeafletMap from '@/components/ProjectsLeafletMap'
import { Card, CardContent } from '@/components/ui/card'

export default function ProjectsMapPage () {
  const [userLocation, setUserLocation] = useState<{
    lat: number
    lng: number
  } | null>(null)

  const { data } = useProjects({ limit: 100 })
  const projects = data?.items ?? []

  useEffect(() => {
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(pos => {
      setUserLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      })
    })
  }, [])

  return (
    <div className='p-6'>
      <h1 className='text-2xl font-bold mb-4'>Projects Map (No Google API)</h1>

      <Card className='h-[600px] overflow-hidden'>
        <CardContent className='p-0 h-full'>
          <ProjectsLeafletMap projects={projects} userLocation={userLocation} />
        </CardContent>
      </Card>
    </div>
  )
}
