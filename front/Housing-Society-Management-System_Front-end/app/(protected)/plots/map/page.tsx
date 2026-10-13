// src/app/(dashboard)/plots/map/page.tsx
'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { ArrowLeft, Download, Filter, Printer } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { PlotMapView } from '../PlotMapView'

export default function PlotMapPage () {
  const router = useRouter()
  const [projectId, setProjectId] = useState('project1')
  const [viewMode, setViewMode] = useState('standard')

  return (
    <div className='p-6'>
      <div className='mb-6'>
        <Button variant='ghost' onClick={() => router.back()} className='mb-4'>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back to Plots
        </Button>

        <div className='flex justify-between items-start'>
          <div>
            <h1 className='text-3xl font-bold'>Plot Map View</h1>
            <p className='text-gray-500 mt-2'>
              Interactive map showing plot locations, status, and details
            </p>
          </div>

          <div className='flex gap-4'>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger className='h-11 enhanced-input'>
                <SelectValue placeholder='Select Project' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='project1'>Project Alpha</SelectItem>
                <SelectItem value='project2'>Project Beta</SelectItem>
              </SelectContent>
            </Select>

            <Select value={viewMode} onValueChange={setViewMode}>
              <SelectTrigger className='h-11 enhanced-input'>
                <SelectValue placeholder='View Mode' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='standard'>Standard View</SelectItem>
                <SelectItem value='satellite'>Satellite View</SelectItem>
                <SelectItem value='terrain'>Terrain View</SelectItem>
              </SelectContent>
            </Select>

            <Button variant='outline'>
              <Filter className='mr-2 h-4 w-4' />
              Filters
            </Button>

            <Button variant='outline'>
              <Printer className='mr-2 h-4 w-4' />
              Print
            </Button>

            <Button variant='outline'>
              <Download className='mr-2 h-4 w-4' />
              Export
            </Button>
          </div>
        </div>
      </div>

      <Card className='mb-6'>
        <CardHeader>
          <CardTitle>
            Project Map - {projectId === 'project1' ? 'Alpha' : 'Beta'}
          </CardTitle>
          <CardDescription>
            Click on any plot to view details. Green plots are available, blue
            are sold.
          </CardDescription>
        </CardHeader>
        <CardContent className='p-0'>
          <PlotMapView projectId={projectId} height='600px' />
        </CardContent>
      </Card>

      <div className='grid grid-cols-3 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>Map Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              <div className='flex items-center gap-3'>
                <div className='w-6 h-6 bg-green-500 border border-green-700 rounded'></div>
                <div>
                  <div className='font-medium'>Available Plots</div>
                  <div className='text-sm text-gray-500'>Ready for sale</div>
                </div>
              </div>
              <div className='flex items-center gap-3'>
                <div className='w-6 h-6 bg-blue-500 border border-blue-700 rounded'></div>
                <div>
                  <div className='font-medium'>Sold Plots</div>
                  <div className='text-sm text-gray-500'>
                    Assigned to customers
                  </div>
                </div>
              </div>
              <div className='flex items-center gap-3'>
                <div className='w-6 h-6 bg-yellow-500 border border-yellow-700 rounded'></div>
                <div>
                  <div className='font-medium'>Reserved Plots</div>
                  <div className='text-sm text-gray-500'>
                    Temporarily reserved
                  </div>
                </div>
              </div>
              <div className='flex items-center gap-3'>
                <div className='w-6 h-6 bg-red-500 border border-red-700 rounded'></div>
                <div>
                  <div className='font-medium'>Under Development</div>
                  <div className='text-sm text-gray-500'>Not yet available</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              <Button className='w-full' variant='outline'>
                Highlight Available Plots
              </Button>
              <Button className='w-full' variant='outline'>
                Show Only Corner Plots
              </Button>
              <Button className='w-full' variant='outline'>
                Filter by Price Range
              </Button>
              <Button className='w-full' variant='outline'>
                View Development Progress
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Map Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              <div className='flex justify-between'>
                <span className='text-gray-500'>Total Plots:</span>
                <span className='font-bold'>156</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-500'>Available:</span>
                <span className='font-bold text-green-600'>89</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-500'>Sold:</span>
                <span className='font-bold text-blue-600'>67</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-500'>With Coordinates:</span>
                <span className='font-bold'>142</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-500'>Average Price:</span>
                <span className='font-bold'>PKR 4.5M</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
