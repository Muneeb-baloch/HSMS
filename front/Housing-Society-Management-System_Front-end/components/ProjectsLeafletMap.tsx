'use client'

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L, { LatLngExpression } from 'leaflet'
import { useEffect } from 'react'

/* Fix marker icons for Next.js */
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
})

interface Props {
  projects: any[]
  userLocation: { lat: number; lng: number } | null
}

function FitBounds ({ points }: { points: LatLngExpression[] }) {
  const map = useMap()

  useEffect(() => {
    if (points.length > 0) {
      const bounds = L.latLngBounds(points)
      map.fitBounds(bounds, { padding: [60, 60] })
    }
  }, [points, map])

  return null
}

export default function ProjectsLeafletMap ({ projects, userLocation }: Props) {
  const center: LatLngExpression = userLocation
    ? [userLocation.lat, userLocation.lng]
    : [30.3753, 69.3451]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return '#3B82F6'
      case 'under_development':
        return '#F59E0B'
      case 'completed':
        return '#10B981'
      case 'on_hold':
        return '#FBBF24'
      case 'cancelled':
        return '#EF4444'
      default:
        return '#6B7280'
    }
  }

  const points: LatLngExpression[] = projects
    .filter(p => p.coordinates?.latitude && p.coordinates?.longitude)
    .map(p => [p.coordinates.latitude, p.coordinates.longitude])

  return (
    <MapContainer
      center={center}
      zoom={6}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        attribution='&copy; OpenStreetMap contributors'
      />

      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]}>
          <Popup>Your Location</Popup>
        </Marker>
      )}

      {projects.map(project => {
        if (!project.coordinates) return null

        return (
          <Marker
            key={project._id}
            position={[
              project.coordinates.latitude,
              project.coordinates.longitude
            ]}
            icon={L.divIcon({
              className: '',
              html: `<div style="
                width:14px;
                height:14px;
                background:${getStatusColor(project.projStatus)};
                border-radius:50%;
                border:2px solid white;"></div>`
            })}
          >
            <Popup>
              <div>
                <strong>{project.projName}</strong>
                <div>{project.projLocation}</div>
                <div>Plots: {project.totalPlots ?? 0}</div>
              </div>
            </Popup>
          </Marker>
        )
      })}

      <FitBounds points={points} />
    </MapContainer>
  )
}
