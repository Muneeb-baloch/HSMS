// src/components/plots/PlotFilters.tsx
'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Filter, X } from 'lucide-react'
import { useState } from 'react'

interface PlotFiltersProps {
  projectId?: string
  onFilterChange?: (filters: any) => void
}

export function PlotFilters ({ projectId, onFilterChange }: PlotFiltersProps) {
  const [filters, setLocalFilters] = useState({
    search: '',
    plotBlockId: 'all',
    plotType: 'all',
    salesStatusId: 'all',
    isAvailable: 'all',
    isPossessionReady: 'all',
    minPrice: '',
    maxPrice: '',
    minArea: '',
    maxArea: ''
  })

  const handleApplyFilters = () => {
    const filterData: any = {
      search: filters.search || undefined
    }

    // Don't include 'all' values in the filter
    if (filters.plotBlockId && filters.plotBlockId !== 'all') {
      filterData.plotBlockId = filters.plotBlockId
    }

    if (filters.plotType && filters.plotType !== 'all') {
      filterData.plotType = filters.plotType
    }

    if (filters.salesStatusId && filters.salesStatusId !== 'all') {
      filterData.salesStatusId = filters.salesStatusId
    }

    if (filters.isAvailable !== 'all') {
      filterData.isAvailable = filters.isAvailable === 'true'
    }

    if (filters.isPossessionReady !== 'all') {
      filterData.isPossessionReady = filters.isPossessionReady === 'true'
    }

    if (filters.minPrice) {
      filterData.minPrice = parseFloat(filters.minPrice)
    }

    if (filters.maxPrice) {
      filterData.maxPrice = parseFloat(filters.maxPrice)
    }

    if (filters.minArea) {
      filterData.minArea = parseFloat(filters.minArea)
    }

    if (filters.maxArea) {
      filterData.maxArea = parseFloat(filters.maxArea)
    }

    if (onFilterChange) {
      onFilterChange(filterData)
    }
  }

  const handleResetFilters = () => {
    setLocalFilters({
      search: '',
      plotBlockId: 'all',
      plotType: 'all',
      salesStatusId: 'all',
      isAvailable: 'all',
      isPossessionReady: 'all',
      minPrice: '',
      maxPrice: '',
      minArea: '',
      maxArea: ''
    })

    if (onFilterChange) {
      onFilterChange({})
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Filter className='h-5 w-5' />
          Filter Plots
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Search */}
        <div className='space-y-2'>
          <Label htmlFor='search'>Search</Label>
          <Input
            id='search'
            placeholder='Search plot number, registration, etc.'
            value={filters.search}
            className='enhanced-input h-11'
            onChange={e =>
              setLocalFilters({ ...filters, search: e.target.value })
            }
          />
        </div>

        {/* Block */}
        <div className='space-y-2'>
          <Label htmlFor='plotBlockId'>Block</Label>
          <Select
            value={filters.plotBlockId}
            onValueChange={value =>
              setLocalFilters({ ...filters, plotBlockId: value })
            }
          >
            <SelectTrigger  className = 'h-11 enhanced-input'
>
              <SelectValue placeholder='Select block' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Blocks</SelectItem>{' '}
              {/* Changed from "" to "all" */}
              <SelectItem value='block1'>Block A</SelectItem>
              <SelectItem value='block2'>Block B</SelectItem>
              <SelectItem value='block3'>Block C</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Plot Type */}
        <div className='space-y-2'>
          <Label htmlFor='plotType'>Plot Type</Label>
          <Select
            value={filters.plotType}
            onValueChange={value =>
              setLocalFilters({ ...filters, plotType: value })
            }
          >
            <SelectTrigger  className = 'h-11 enhanced-input'
>
              <SelectValue placeholder='Select type' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Types</SelectItem>{' '}
              {/* Changed from "" to "all" */}
              <SelectItem value='residential'>Residential</SelectItem>
              <SelectItem value='commercial'>Commercial</SelectItem>
              <SelectItem value='industrial'>Industrial</SelectItem>
              <SelectItem value='corner'>Corner</SelectItem>
              <SelectItem value='park_facing'>Park Facing</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Availability */}
        <div className='space-y-2'>
          <Label htmlFor='isAvailable'>Availability</Label>
          <Select
            value={filters.isAvailable}
            onValueChange={value =>
              setLocalFilters({ ...filters, isAvailable: value })
            }
          >
            <SelectTrigger  className = 'h-11 enhanced-input'
>
              <SelectValue placeholder='Select availability' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All</SelectItem>{' '}
              {/* Changed from "" to "all" */}
              <SelectItem value='true'>Available</SelectItem>
              <SelectItem value='false'>Sold/Assigned</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div className='space-y-2'>
          <Label>Price Range (PKR)</Label>
          <div className='grid grid-cols-2 gap-2'>
            <Input
              placeholder='Min price'
              type='number'
              value={filters.minPrice}
              className='enhanced-input h-11'
              onChange={e =>
                setLocalFilters({ ...filters, minPrice: e.target.value })
              }
            />
            <Input
              placeholder='Max price'
              type='number'
              value={filters.maxPrice}
              className='enhanced-input h-11'
              onChange={e =>
                setLocalFilters({ ...filters, maxPrice: e.target.value })
              }
            />
          </div>
        </div>

        {/* Area Range */}
        <div className='space-y-2'>
          <Label>Area Range (sqft)</Label>
          <div className='grid grid-cols-2 gap-2'>
            <Input
              placeholder='Min area'
              type='number'
              value={filters.minArea}
              className='enhanced-input h-11'
              onChange={e =>
                setLocalFilters({ ...filters, minArea: e.target.value })
              }
            />
            <Input
              placeholder='Max area'
              type='number'
              value={filters.maxArea}
              className='enhanced-input h-11'
              onChange={e =>
                setLocalFilters({ ...filters, maxArea: e.target.value })
              }
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex gap-2 pt-4'>
          <Button onClick={handleApplyFilters} className='flex-1'>
            Apply Filters
          </Button>
          <Button
            variant='outline'
            onClick={handleResetFilters}
            className='flex-1'
          >
            <X className='mr-2 h-4 w-4' />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
