// src/components/plots/PlotMapView.tsx
'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { useGetPlotMapDataQuery } from '@/lib/API/plotApi'
import { MapPin, Navigation, ZoomIn, ZoomOut } from 'lucide-react'
import { useState } from 'react'

interface PlotMapViewProps {
  projectId: string
  height?: string
}

interface PlotMarker {
  id: string
  plotNo: string
  coordinates: { lat: number; lng: number }
  area: number
  price: number
  status: string
  color: string
  isAvailable: boolean
  customer?: string
}

export function PlotMapView ({ projectId, height = '500px' }: PlotMapViewProps) {
  const { data: mapData, isLoading } = useGetPlotMapDataQuery(projectId)
  const [zoom, setZoom] = useState(15)
  const [center, setCenter] = useState({ lat: 33.6844, lng: 73.0479 }) // Default Islamabad coordinates
  const [selectedPlot, setSelectedPlot] = useState<PlotMarker | null>(null)

  // Mock implementation - in real app, use Google Maps or similar
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 1, 20))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 1, 10))

  const handleCenterReset = () => {
    setCenter({ lat: 33.6844, lng: 73.0479 })
    setZoom(15)
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center' style={{ height }}>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
      </div>
    )
  }

  const plots = mapData || []

  return (
    <Card>
      <CardHeader>
        <div className='flex justify-between items-center'>
          <div>
            <CardTitle className='flex items-center gap-2'>
              <MapPin className='h-5 w-5' />
              Plot Map View
            </CardTitle>
            <CardDescription>
              Interactive map showing plot locations and status
            </CardDescription>
          </div>
          <div className='flex gap-2'>
            <Button variant='outline' size='sm' onClick={handleZoomOut}>
              <ZoomOut className='h-4 w-4' />
            </Button>
            <Button variant='outline' size='sm' onClick={handleZoomIn}>
              <ZoomIn className='h-4 w-4' />
            </Button>
            <Button variant='outline' size='sm' onClick={handleCenterReset}>
              <Navigation className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Map Container */}
        <div
          className='border rounded-lg relative bg-gray-100'
          style={{ height }}
        >
          {/* Mock Map Grid */}
          <div className='absolute inset-0 grid grid-cols-8 grid-rows-6 gap-2 p-4'>
            {plots.slice(0, 48).map((plot, index) => (
              <div
                key={plot.id}
                className={`rounded border-2 cursor-pointer transition-all hover:scale-105 ${
                  plot.isAvailable
                    ? 'border-green-500 bg-green-50'
                    : 'border-blue-500 bg-blue-50'
                } ${
                  selectedPlot?.id === plot.id
                    ? 'ring-2 ring-offset-2 ring-primary'
                    : ''
                }`}
                style={{
                  gridColumn: `${(index % 8) + 1} / span 1`,
                  gridRow: `${Math.floor(index / 8) + 1} / span 1`
                }}
                onClick={() => setSelectedPlot(plot)}
                title={`Plot ${plot.plotNo} - ${plot.status}`}
              >
                <div className='p-2 text-center'>
                  <div className='font-bold text-sm'>{plot.plotNo}</div>
                  <div className='text-xs opacity-75'>
                    {plot.area.toLocaleString()} sqft
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className='absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg'>
            <div className='text-sm font-medium mb-2'>Legend</div>
            <div className='space-y-1 text-xs'>
              <div className='flex items-center gap-2'>
                <div className='w-3 h-3 bg-green-500 border border-green-700'></div>
                <span>Available</span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='w-3 h-3 bg-blue-500 border border-blue-700'></div>
                <span>Sold/Assigned</span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='w-3 h-3 bg-yellow-500 border border-yellow-700'></div>
                <span>Reserved</span>
              </div>
            </div>
          </div>

          {/* Selected Plot Info */}
          {selectedPlot && (
            <div className='absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg max-w-xs'>
              <div className='font-bold mb-2'>Plot {selectedPlot.plotNo}</div>
              <div className='space-y-1 text-sm'>
                <div>Status: {selectedPlot.status}</div>
                <div>Area: {selectedPlot.area.toLocaleString()} sqft</div>
                <div>Price: PKR {selectedPlot.price.toLocaleString()}</div>
                <div>
                  Availability:{' '}
                  {selectedPlot.isAvailable ? 'Available' : 'Sold'}
                </div>
                {selectedPlot.customer && (
                  <div>Customer: {selectedPlot.customer}</div>
                )}
              </div>
              <Button
                variant='outline'
                size='sm'
                className='mt-3 w-full'
                onClick={() =>
                  (window.location.href = `/plots/view/${selectedPlot.id}`)
                }
              >
                View Details
              </Button>
            </div>
          )}

          {/* No Data Message */}
          {plots.length === 0 && (
            <div className='absolute inset-0 flex items-center justify-center'>
              <div className='text-center'>
                <MapPin className='h-12 w-12 mx-auto text-gray-400 mb-2' />
                <div className='text-gray-500'>
                  No plot data available for mapping
                </div>
                <div className='text-sm text-gray-400 mt-1'>
                  Plot coordinates need to be added
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Statistics Bar */}
        <div className='grid grid-cols-4 gap-4 mt-4'>
          <div className='text-center p-3 bg-gray-50 rounded-lg'>
            <div className='text-sm text-gray-500'>Total Plots</div>
            <div className='text-xl font-bold'>{plots.length}</div>
          </div>
          <div className='text-center p-3 bg-green-50 rounded-lg'>
            <div className='text-sm text-gray-500'>Available</div>
            <div className='text-xl font-bold text-green-600'>
              {plots.filter(p => p.isAvailable).length}
            </div>
          </div>
          <div className='text-center p-3 bg-blue-50 rounded-lg'>
            <div className='text-sm text-gray-500'>Sold</div>
            <div className='text-xl font-bold text-blue-600'>
              {plots.filter(p => !p.isAvailable).length}
            </div>
          </div>
          <div className='text-center p-3 bg-yellow-50 rounded-lg'>
            <div className='text-sm text-gray-500'>With Coordinates</div>
            <div className='text-xl font-bold text-yellow-600'>
              {plots.length}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
