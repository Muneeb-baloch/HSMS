// src/app/(dashboard)/projects/location/page.tsx
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useProjectsNearLocation } from '@/lib/hooks/entities/useProject'
import { Project } from '@/lib/types/project'
import {
  ArrowLeft,
  Compass,
  Download,
  Filter,
  Home,
  MapPin,
  Navigation,
  RefreshCw,
  Search,
  Target,
  X
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { InlineSkeleton } from '@/components/shared/PageSkeleton'
import { useConfirm } from "@/components/shared/ConfirmDialog";

declare global {
  interface Window {
    google: any
  }
}

interface Coordinates {
  latitude: number
  longitude: number
}

export default function SearchByLocationPage () {
  const router = useRouter()
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null)
  const { alert } = useConfirm();
  const [searchLocation, setSearchLocation] = useState<Coordinates | null>(null)
  const [searchAddress, setSearchAddress] = useState('')
  const [maxDistance, setMaxDistance] = useState(10000) // 10km in meters
  const [searchMode, setSearchMode] = useState<
    'current' | 'manual' | 'address'
  >('current')
  const [isSearching, setIsSearching] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapInstance, setMapInstance] = useState<any>(null)
  const [markers, setMarkers] = useState<any[]>([])

  const {
    data: projects,
    isLoading,
    refetch
  } = useProjectsNearLocation(
    searchLocation?.latitude || 0,
    searchLocation?.longitude || 0,
    maxDistance
  )

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
          if (searchMode === 'current') {
            setSearchLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            })
          }
        },
        error => {
          console.error('Error getting location:', error)
        }
      )
    }

    // Load Google Maps
    const loadGoogleMaps = () => {
      if (window.google) {
        initMap()
        return
      }

      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = () => {
        initMap()
      }
      document.head.appendChild(script)
    }

    loadGoogleMaps()

    return () => {
      // Cleanup markers
      markers.forEach(marker => marker.setMap(null))
    }
  }, [])

  const initMap = () => {
    if (!window.google) return

    const map = new window.google.maps.Map(document.createElement('div'), {
      center: { lat: 30.3753, lng: 69.3451 }, // Pakistan center
      zoom: 6
    })

    setMapInstance(map)
    setMapLoaded(true)
  }

  const handleSearchByCurrentLocation = () => {
    if (userLocation) {
      setSearchLocation(userLocation)
      setSearchMode('current')
      setIsSearching(true)
    }
  }

  const handleSearchByCoordinates = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const lat = parseFloat(
      (form.elements.namedItem('latitude') as HTMLInputElement).value
    )
    const lng = parseFloat(
      (form.elements.namedItem('longitude') as HTMLInputElement).value
    )

    if (!isNaN(lat) && !isNaN(lng)) {
      setSearchLocation({ latitude: lat, longitude: lng })
      setSearchMode('manual')
      setIsSearching(true)
    }
  }

  const handleSearchByAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchAddress.trim()) return

    try {
      const response = await fetch(
        `https://us1.locationiq.com/v1/search?key=${
          process.env.NEXT_PUBLIC_LOCATIONIQ_API_KEY
        }&q=${encodeURIComponent(searchAddress)}&format=json`
      )
      const data = await response.json()

      if (data && data.length > 0) {
        const result = data[0]
        setSearchLocation({
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon)
        })
        setSearchMode('address')
        setIsSearching(true)
      } else {
        await alert({ description: 'Address not found. Please try a different address.' })
      }
    } catch (error) {
      console.error('Geocoding error:', error)
      await alert({ description: 'Could not find the address. Please try a different address.' })
    }
  }

  const handleClearSearch = () => {
    setSearchLocation(null)
    setSearchAddress('')
    setIsSearching(false)
    if (mapInstance) {
      mapInstance.setCenter({ lat: 30.3753, lng: 69.3451 })
      mapInstance.setZoom(6)
    }
    // Clear markers
    markers.forEach(marker => marker.setMap(null))
    setMarkers([])
  }

  const updateMap = (center: Coordinates, projectList: Project[]) => {
    if (!mapInstance || !window.google) return

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null))

    // Center map on search location
    mapInstance.setCenter({
      lat: center.latitude,
      lng: center.longitude
    })
    mapInstance.setZoom(12)

    // Add search location marker
    const searchMarker = new window.google.maps.Marker({
      position: { lat: center.latitude, lng: center.longitude },
      map: mapInstance,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#4285F4',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 2
      },
      title: 'Search Location'
    })

    // Add project markers
    const newMarkers = projectList
      .map(project => {
        if (!project.coordinates?.latitude || !project.coordinates?.longitude)
          return null

        const marker = new window.google.maps.Marker({
          position: {
            lat: project.coordinates.latitude,
            lng: project.coordinates.longitude
          },
          map: mapInstance,
          title: project.projName,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: getStatusColor(project.projStatus),
            fillOpacity: 0.9,
            strokeColor: '#FFFFFF',
            strokeWeight: 2
          }
        })

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
          <div style="padding: 12px; min-width: 250px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">
              ${project.projName}
            </h3>
            <div style="color: #6b7280; font-size: 14px; margin-bottom: 8px;">
              ${project.projLocation}
            </div>
            <div style="display: flex; gap: 12px; margin-bottom: 12px;">
              <span style="background-color: ${getStatusColor(
                project.projStatus
              )}20;
                color: ${getStatusColor(project.projStatus)};
                padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">
                ${project.projStatus.replace('_', ' ')}
              </span>
              <span style="background-color: #f3f4f6; color: #6b7280;
                padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">
                ${project.projType}
              </span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
              <div>
                <div style="color: #9ca3af; font-size: 12px;">Plots</div>
                <div style="font-size: 14px; font-weight: 500;">
                  ${project.totalPlots}
                </div>
              </div>
              <div>
                <div style="color: #9ca3af; font-size: 12px;">Available</div>
                <div style="font-size: 14px; font-weight: 500;">
                  ${project.plotsAvailable}
                </div>
              </div>
            </div>
            <button onclick="window.open('/projects/view/${
              project._id
            }', '_blank')"
              style="width: 100%; background-color: ${getStatusColor(
                project.projStatus
              )};
              color: white; border: none; padding: 8px 12px; border-radius: 6px;
              font-size: 14px; font-weight: 500; cursor: pointer;">
              View Details
            </button>
          </div>
        `,
          maxWidth: 300
        })

        marker.addListener('click', () => {
          infoWindow.open(mapInstance, marker)
        })

        return marker
      })
      .filter(Boolean)

    setMarkers([searchMarker, ...newMarkers])
  }

  useEffect(() => {
    if (searchLocation && projects && mapLoaded) {
      updateMap(searchLocation, projects)
    }
  }, [searchLocation, projects, mapLoaded])

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

  const getDistanceColor = (distance: number) => {
    if (distance < 2000) return 'text-green-600'
    if (distance < 5000) return 'text-orange-600'
    return 'text-red-600'
  }

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lon2 - lon1) * Math.PI) / 180

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return Math.round(R * c) // Distance in meters
  }

  const sortedProjects = projects
    ? [...projects].sort((a, b) => {
        if (!searchLocation || !a.coordinates || !b.coordinates) return 0
        const distA = calculateDistance(
          searchLocation.latitude,
          searchLocation.longitude,
          a.coordinates.latitude,
          a.coordinates.longitude
        )
        const distB = calculateDistance(
          searchLocation.latitude,
          searchLocation.longitude,
          b.coordinates.latitude,
          b.coordinates.longitude
        )
        return distA - distB
      })
    : []

  const handleExport = () => {
    if (!sortedProjects.length) return

    const csvContent = [
      [
        'Project Name',
        'Code',
        'Location',
        'Distance (m)',
        'Status',
        'Total Plots',
        'Available Plots'
      ],
      ...sortedProjects.map(p => {
        const distance =
          searchLocation && p.coordinates
            ? calculateDistance(
                searchLocation.latitude,
                searchLocation.longitude,
                p.coordinates.latitude,
                p.coordinates.longitude
              )
            : 'N/A'
        return [
          p.projName,
          p.projCode,
          p.projLocation,
          distance,
          p.projStatus,
          p.totalPlots,
          p.plotsAvailable
        ]
      })
    ]
      .map(row => row.join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `projects-near-location-${
      new Date().toISOString().split('T')[0]
    }.csv`
    a.click()
  }

  return (
    <div className='p-6'>
      <div className='mb-6'>
        <Button variant='ghost' onClick={() => router.back()} className='mb-4'>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back
        </Button>

        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Search Projects by Location</h1>
            <p className='text-gray-500 mt-2'>
              Find projects near a specific location
            </p>
          </div>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              onClick={handleExport}
              disabled={!sortedProjects.length}
            >
              <Download className='mr-2 h-4 w-4' />
              Export
            </Button>
            <Button variant='outline' onClick={() => refetch()}>
              <RefreshCw className='mr-2 h-4 w-4' />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Search Panel */}
        <div className='lg:col-span-2'>
          <Card className='mb-6'>
            <CardHeader>
              <CardTitle>Search Location</CardTitle>
              <CardDescription>
                Choose how you want to search for projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs
                value={searchMode}
                onValueChange={(v: any) => setSearchMode(v)}
              >
                <TabsList className='grid grid-cols-3 mb-6'>
                  <TabsTrigger value='current'>
                    <Navigation className='h-4 w-4 mr-2' />
                    Current Location
                  </TabsTrigger>
                  <TabsTrigger value='manual'>
                    <Target className='h-4 w-4 mr-2' />
                    Coordinates
                  </TabsTrigger>
                  <TabsTrigger value='address'>
                    <MapPin className='h-4 w-4 mr-2' />
                    Address
                  </TabsTrigger>
                </TabsList>

                <TabsContent value='current' className='space-y-4'>
                  {userLocation ? (
                    <div>
                      <div className='p-4 bg-blue-50 rounded-lg mb-4'>
                        <div className='flex items-center gap-3'>
                          <Compass className='h-5 w-5 text-blue-600' />
                          <div>
                            <p className='font-medium'>Your Location</p>
                            <p className='text-sm text-gray-600'>
                              Latitude: {userLocation.latitude.toFixed(6)}
                              <br />
                              Longitude: {userLocation.longitude.toFixed(6)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <Button onClick={handleSearchByCurrentLocation}>
                        <Search className='mr-2 h-4 w-4' />
                        Search Projects Near Me
                      </Button>
                    </div>
                  ) : (
                    <div className='text-center py-8'>
                      <Compass className='h-12 w-12 mx-auto text-gray-400 mb-4' />
                      <h3 className='font-medium mb-2'>
                        Location Access Required
                      </h3>
                      <p className='text-gray-500 mb-4'>
                        Please enable location access to search near your
                        current location.
                      </p>
                      <Button onClick={() => window.location.reload()}>
                        Retry Location Access
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value='manual'>
                  <form
                    onSubmit={handleSearchByCoordinates}
                    className='space-y-4'
                  >
                    <div className='grid grid-cols-2 gap-4'>
                      <div className='space-y-2'>
                        <Label htmlFor='latitude'>Latitude</Label>
                        <Input
                          id='latitude'
                          type='number'
                          step='any'
                          className='enhanced-input h-11'
                          placeholder='e.g., 30.3753'
                          required
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label htmlFor='longitude'>Longitude</Label>
                        <Input
                          id='longitude'
                          type='number'
                          step='any'
                          className='enhanced-input h-11'
                          placeholder='e.g., 69.3451'
                          required
                        />
                      </div>
                    </div>
                    <div className='flex gap-2'>
                      <Button type='submit'>
                        <Search className='mr-2 h-4 w-4' />
                        Search by Coordinates
                      </Button>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value='address'>
                  <form onSubmit={handleSearchByAddress} className='space-y-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='address'>Address</Label>
                      <Input
                        id='address'
                        placeholder='e.g., Lahore, Pakistan'
                        value={searchAddress}
                        className='enhanced-input h-11'
                        onChange={e => setSearchAddress(e.target.value)}
                        required
                      />
                    </div>
                    <Button type='submit'>
                      <Search className='mr-2 h-4 w-4' />
                      Search by Address
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              <Separator className='my-6' />

              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <h3 className='font-medium'>Search Radius</h3>
                    <p className='text-sm text-gray-500'>
                      Maximum distance from location
                    </p>
                  </div>
                  <div className='text-lg font-bold'>
                    {maxDistance / 1000} km
                  </div>
                </div>

                <div className='space-y-2'>
                  <input
                    type='range'
                    min='1000'
                    max='50000'
                    step='1000'
                    value={maxDistance}
                    onChange={e => setMaxDistance(parseInt(e.target.value))}
                    className='enhanced-input h-11'
                  />
                  <div className='flex justify-between text-sm text-gray-500'>
                    <span>1 km</span>
                    <span>5 km</span>
                    <span>10 km</span>
                    <span>25 km</span>
                    <span>50 km</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          {isSearching && searchLocation && (
            <Card>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle>Search Results</CardTitle>
                    <CardDescription>
                      Projects within {maxDistance / 1000}km radius
                    </CardDescription>
                  </div>
                  <Button variant='ghost' size='sm' onClick={handleClearSearch}>
                    <X className='mr-2 h-4 w-4' />
                    Clear Search
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
            <InlineSkeleton />
          ) : (
                                    <span className='text-gray-400'>N/A</span>
                                  )}
                                </td>
                                <td className='py-3 px-4'>
                                  <Badge
                                    style={{
                                      backgroundColor: `${getStatusColor(
                                        project.projStatus
                                      )}20`,
                                      color: getStatusColor(project.projStatus)
                                    }}
                                  >
                                    {project.projStatus.replace('_', ' ')}
                                  </Badge>
                                </td>
                                <td className='py-3 px-4'>
                                  <div>
                                    <div className='font-medium'>
                                      {project.totalPlots} total
                                    </div>
                                    <div className='text-sm text-gray-600'>
                                      {project.plotsAvailable} available
                                    </div>
                                  </div>
                                </td>
                                <td className='py-3 px-4'>
                                  <div className='flex gap-2'>
                                    <Button
                                      size='sm'
                                      variant='outline'
                                      onClick={() =>
                                        router.push(
                                          `/projects/view/${project._id}`
                                        )
                                      }
                                    >
                                      <Home className='h-4 w-4' />
                                    </Button>
                                    {project.coordinates && (
                                      <Button
                                        size='sm'
                                        variant='outline'
                                        onClick={() => {
                                          if (mapInstance) {
                                            mapInstance.setCenter({
                                              lat: project.coordinates!
                                                .latitude,
                                              lng: project.coordinates!
                                                .longitude
                                            })
                                            mapInstance.setZoom(15)
                                          }
                                        }}
                                      >
                                        <MapPin className='h-4 w-4' />
                                      </Button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className='text-center py-8'>
                    <MapPin className='h-12 w-12 mx-auto text-gray-400 mb-4' />
                    <h3 className='font-medium mb-2'>No Projects Found</h3>
                    <p className='text-gray-500 mb-4'>
                      No projects found within {maxDistance / 1000}km of this
                      location.
                    </p>
                    <div className='flex gap-2 justify-center'>
                      <Button
                        variant='outline'
                        onClick={() => setMaxDistance(20000)}
                      >
                        Increase Search Radius
                      </Button>
                      <Button onClick={handleClearSearch}>
                        Try Different Location
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Map and Filters Sidebar */}
        <div className='space-y-6'>
          {/* Map Preview */}
          <Card className='h-[400px]'>
            <CardHeader>
              <CardTitle className='text-lg'>Map Preview</CardTitle>
            </CardHeader>
            <CardContent className='p-0'>
              <div className='h-[300px] w-full relative'>
                {!mapLoaded ? (
                  <div className='absolute inset-0 flex items-center justify-center'>
                    <div className='text-center'>
                      <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2'></div>
                      <p className='text-gray-600'>Loading map...</p>
                    </div>
                  </div>
                ) : (
                  <div
                    id='map'
                    className='w-full h-full'
                    ref={el => {
                      if (el && mapInstance) {
                        mapInstance.setDiv(el)
                      }
                    }}
                  />
                )}
              </div>
              <div className='p-4'>
                <div className='text-sm text-gray-600'>
                  {searchLocation
                    ? `Center: ${searchLocation.latitude.toFixed(
                        6
                      )}, ${searchLocation.longitude.toFixed(6)}`
                    : 'Select a location to see the map'}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-lg'>Filters</CardTitle>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className='h-4 w-4' />
                </Button>
              </div>
            </CardHeader>
            {showFilters && (
              <CardContent>
                <div className='space-y-4'>
                  <div className='space-y-2'>
                    <Label>Project Status</Label>
                    <div className='space-y-2'>
                      {[
                        'planning',
                        'under_development',
                        'completed',
                        'on_hold'
                      ].map(status => (
                        <div key={status} className='flex items-center'>
                          <input
                            type='checkbox'
                            id={`status-${status}`}
                            className='enhanced-input h-11'
                          />
                          <Label
                            htmlFor={`status-${status}`}
                            className='text-sm capitalize'
                          >
                            {status.replace('_', ' ')}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label>Plot Availability</Label>
                    <div className='space-y-2'>
                      {[
                        { label: 'High (> 50%)', value: 'high' },
                        { label: 'Medium (20-50%)', value: 'medium' },
                        { label: 'Low (< 20%)', value: 'low' }
                      ].map(option => (
                        <div key={option.value} className='flex items-center'>
                          <input
                            type='checkbox'
                            id={`availability-${option.value}`}
                            className='enhanced-input h-11'
                          />
                          <Label
                            htmlFor={`availability-${option.value}`}
                            className='text-sm'
                          >
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button variant='outline' className='w-full'>
                    Apply Filters
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Search Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                <div className='flex justify-between'>
                  <span className='text-sm'>Projects Found</span>
                  <span className='font-medium'>{sortedProjects.length}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm'>Search Radius</span>
                  <span className='font-medium'>{maxDistance / 1000} km</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm'>Average Distance</span>
                  <span className='font-medium'>
                    {sortedProjects.length > 0 && searchLocation
                      ? `${(
                          sortedProjects
                            .map(p =>
                              p.coordinates
                                ? calculateDistance(
                                    searchLocation.latitude,
                                    searchLocation.longitude,
                                    p.coordinates.latitude,
                                    p.coordinates.longitude
                                  ) / 1000
                                : 0
                            )
                            .reduce((a, b) => a + b, 0) / sortedProjects.length
                        ).toFixed(2)} km`
                      : 'N/A'}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm'>Closest Project</span>
                  <span className='font-medium'>
                    {sortedProjects.length > 0 &&
                    searchLocation &&
                    sortedProjects[0].coordinates
                      ? `${(
                          calculateDistance(
                            searchLocation.latitude,
                            searchLocation.longitude,
                            sortedProjects[0].coordinates.latitude,
                            sortedProjects[0].coordinates.longitude
                          ) / 1000
                        ).toFixed(2)} km`
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                <Button
                  variant='outline'
                  className='w-full'
                  onClick={() => router.push('/projects/map')}
                >
                  <MapPin className='mr-2 h-4 w-4' />
                  View Full Map
                </Button>
                <Button
                  variant='outline'
                  className='w-full'
                  onClick={() => router.push('/projects')}
                >
                  <Home className='mr-2 h-4 w-4' />
                  View All Projects
                </Button>
                <Button
                  variant='outline'
                  className='w-full'
                  onClick={handleExport}
                  disabled={!sortedProjects.length}
                >
                  <Download className='mr-2 h-4 w-4' />
                  Export Results
                </Button>
                <Button
                  variant='outline'
                  className='w-full'
                  onClick={handleClearSearch}
                >
                  <X className='mr-2 h-4 w-4' />
                  Clear Search
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Legend */}
      {isSearching && (
        <Card className='mt-6'>
          <CardContent className='pt-6'>
            <div className='flex flex-wrap gap-6'>
              <div className='flex items-center gap-2'>
                <div
                  className='w-4 h-4 rounded-full'
                  style={{ backgroundColor: '#4285F4' }}
                ></div>
                <span className='text-sm'>Search Location</span>
              </div>
              <div className='flex items-center gap-2'>
                <div
                  className='w-4 h-4 rounded-full'
                  style={{ backgroundColor: '#3B82F6' }}
                ></div>
                <span className='text-sm'>Planning</span>
              </div>
              <div className='flex items-center gap-2'>
                <div
                  className='w-4 h-4 rounded-full'
                  style={{ backgroundColor: '#F59E0B' }}
                ></div>
                <span className='text-sm'>Under Development</span>
              </div>
              <div className='flex items-center gap-2'>
                <div
                  className='w-4 h-4 rounded-full'
                  style={{ backgroundColor: '#10B981' }}
                ></div>
                <span className='text-sm'>Completed</span>
              </div>
              <div className='flex items-center gap-2'>
                <div
                  className='w-4 h-4 rounded-full'
                  style={{ backgroundColor: '#FBBF24' }}
                ></div>
                <span className='text-sm'>On Hold</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
