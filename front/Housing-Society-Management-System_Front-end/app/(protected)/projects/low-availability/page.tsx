// src/app/(dashboard)/projects/low-availability/page.tsx
'use client'

import { EnhancedDataTable as DataTable } from '@/components/shared/DataTable/DataTable'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useProjectsWithLowAvailability } from '@/lib/hooks/entities/useProject'
import { Project } from '@/lib/types/project'
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Download,
  Filter,
  Home,
  MoreVertical,
  RefreshCw,
  Search
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LowAvailabilityPage () {
  const router = useRouter()
  const [threshold, setThreshold] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [sortBy, setSortBy] = useState('availabilityPercentage')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const {
    data: projects,
    isLoading,
    refetch
  } = useProjectsWithLowAvailability(threshold)

  const columns = [
    {
      id: 'projName',
      header: 'Project Name',
      accessorKey: 'projName' as keyof Project,
      sortable: true,
      width: '200px',
      cell: (row: Project) => <div className='font-medium'>{row.projName}</div>
    },
    {
      id: 'projCode',
      header: 'Project Code',
      accessorKey: 'projCode' as keyof Project,
      sortable: true,
      width: '120px',
      cell: (row: Project) => (
        <div className='font-mono text-sm'>{row.projCode}</div>
      )
    },
    {
      id: 'location',
      header: 'Location',
      accessorKey: 'projLocation' as keyof Project,
      sortable: true,
      width: '150px',
      cell: (row: Project) => <div className='text-sm'>{row.projLocation}</div>
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'projStatus' as keyof Project,
      sortable: true,
      width: '120px',
      cell: (row: Project) => {
        const statusColors: Record<string, string> = {
          planning: 'bg-blue-100 text-blue-800',
          under_development: 'bg-orange-100 text-orange-800',
          completed: 'bg-green-100 text-green-800',
          on_hold: 'bg-yellow-100 text-yellow-800',
          cancelled: 'bg-red-100 text-red-800'
        }
        const statusText: Record<string, string> = {
          planning: 'Planning',
          under_development: 'In Progress',
          completed: 'Completed',
          on_hold: 'On Hold',
          cancelled: 'Cancelled'
        }
        return (
          <Badge
            className={
              statusColors[row.projStatus] || 'bg-gray-100 text-gray-800'
            }
          >
            {statusText[row.projStatus] || row.projStatus}
          </Badge>
        )
      }
    },
    {
      id: 'totalPlots',
      header: 'Total Plots',
      accessorKey: 'totalPlots' as keyof Project,
      sortable: true,
      width: '100px',
      cell: (row: Project) => (
        <div className='text-center font-medium'>{row.totalPlots ?? 0}</div>
      )
    },
    {
      id: 'availablePlots',
      header: 'Available',
      accessorKey: 'plotsAvailable' as keyof Project,
      sortable: true,
      width: '100px',
      cell: (row: Project) => {
        const available = row.plotsAvailable ?? 0
        const total = row.totalPlots ?? 0
        return (
          <div
            className={`text-center font-medium ${
              total > 0 && available <= Math.round(total * 0.1)
                ? 'text-red-600'
                : 'text-gray-600'
            }`}
          >
            {available}
          </div>
        )
      }
    },
    {
      id: 'availability',
      header: 'Availability %',
      accessorKey: 'availabilityPercentage' as keyof Project,
      sortable: true,
      width: '120px',
      cell: (row: any) => {
        const total = row.totalPlots ?? 0
        const percentage =
          row.availabilityPercentage ??
          (total > 0 ? Math.round(((row.plotsAvailable ?? 0) / total) * 100) : 0)
        return (
          <div className='space-y-1'>
            <div className='flex justify-between text-sm'>
              <span
                className={`font-medium ${
                  percentage <= threshold ? 'text-red-600' : 'text-gray-600'
                }`}
              >
                {percentage}%
              </span>
            </div>
            <div className='w-full bg-gray-200 rounded-full h-1.5'>
              <div
                className={`h-1.5 rounded-full ${
                  percentage <= 5
                    ? 'bg-red-500'
                    : percentage <= 10
                    ? 'bg-orange-500'
                    : percentage <= 20
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              ></div>
            </div>
          </div>
        )
      }
    },
    {
      id: 'progress',
      header: 'Progress',
      accessorKey: 'progressPercentage' as keyof Project,
      sortable: true,
      width: '120px',
      cell: (row: any) => {
        const total = row.totalPlots ?? 0
        const percentage =
          row.progressPercentage ??
          (total > 0
            ? Math.round(
                ((row.plotsSold ?? 0) + (row.plotsReserved ?? 0)) / total * 100
              )
            : 0)
        return (
          <div className='text-center'>
            <Badge
              variant='outline'
              className={
                percentage >= 90
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : percentage >= 70
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-gray-50 text-gray-700 border-gray-200'
              }
            >
              {percentage}%
            </Badge>
          </div>
        )
      }
    },
    {
      id: 'actions',
      header: 'Actions',
      width: '80px',
      cell: (row: Project) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='sm'>
              <MoreVertical className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => router.push(`/projects/view/${row._id}`)}
            >
              <Home className='mr-2 h-4 w-4' />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push(`/projects/${row._id}/plots`)}
            >
              <BarChart3 className='mr-2 h-4 w-4' />
              View Plots
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push(`/projects/edit/${row._id}`)}
            >
              <EditIcon className='mr-2 h-4 w-4' />
              Edit Project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ]

  const filteredProjects = (projects || [])
    .filter(project => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        if (
          !project.projName.toLowerCase().includes(searchLower) &&
          !project.projCode.toLowerCase().includes(searchLower) &&
          !project.projLocation.toLowerCase().includes(searchLower)
        ) {
          return false
        }
      }

      // Status filter
      if (statusFilter && project.projStatus !== statusFilter) {
        return false
      }

      // Type filter
      if (typeFilter && project.projType !== typeFilter) {
        return false
      }

      return true
    })
    .sort((a, b) => {
      const aTotal = a.totalPlots ?? 0
      const bTotal = b.totalPlots ?? 0
      const aPercentage =
        a.availabilityPercentage ??
        (aTotal > 0 ? Math.round(((a.plotsAvailable ?? 0) / aTotal) * 100) : 0)
      const bPercentage =
        b.availabilityPercentage ??
        (bTotal > 0 ? Math.round(((b.plotsAvailable ?? 0) / bTotal) * 100) : 0)

      if (sortBy === 'availabilityPercentage') {
        return sortOrder === 'asc'
          ? aPercentage - bPercentage
          : bPercentage - aPercentage
      }
      if (sortBy === 'projName') {
        return sortOrder === 'asc'
          ? a.projName.localeCompare(b.projName)
          : b.projName.localeCompare(a.projName)
      }
      return 0
    })

  const getAvailabilityPercentage = (p: Project) => {
    const total = p.totalPlots ?? 0
    return (
      p.availabilityPercentage ??
      (total > 0 ? Math.round(((p.plotsAvailable ?? 0) / total) * 100) : 0)
    )
  }

  const criticalProjects = filteredProjects.filter(
    p => getAvailabilityPercentage(p) <= 5
  )

  const warningProjects = filteredProjects.filter(
    p =>
      getAvailabilityPercentage(p) > 5 &&
      getAvailabilityPercentage(p) <= threshold
  )

  const handleExport = () => {
    // Export functionality
    const csvContent = [
      [
        'Project Name',
        'Code',
        'Location',
        'Total Plots',
        'Available Plots',
        'Availability %',
        'Status'
      ],
      ...filteredProjects.map(p => {
        const total = p.totalPlots ?? 0
        const available = p.plotsAvailable ?? 0
        const pct = total > 0 ? Math.round((available / total) * 100) : 0
        return [
          p.projName,
          p.projCode,
          p.projLocation,
          total,
          available,
          pct,
          p.projStatus
        ]
      })
    ]
      .map(row => row.join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `low-availability-projects-${
      new Date().toISOString().split('T')[0]
    }.csv`
    a.click()
  }

  const handleRefresh = () => {
    refetch()
  }

  const handleThresholdChange = (value: string) => {
    setThreshold(parseInt(value))
  }

  const EditIcon = ({ className }: { className?: string }) => (
    <svg
      className={className}
      fill='none'
      viewBox='0 0 24 24'
      stroke='currentColor'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
      />
    </svg>
  )

  return (
    <div className='p-6'>
      <div className='mb-6'>
        <Button variant='ghost' onClick={() => router.back()} className='mb-4'>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back
        </Button>

        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Low Availability Projects</h1>
            <p className='text-gray-500 mt-2'>
              Projects with limited plot availability
            </p>
          </div>
          <div className='flex gap-2'>
            <Button variant='outline' onClick={handleExport}>
              <Download className='mr-2 h-4 w-4' />
              Export
            </Button>
            <Button variant='outline' onClick={handleRefresh}>
              <RefreshCw className='mr-2 h-4 w-4' />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <div className='text-sm text-gray-500'>Total Projects</div>
                <div className='text-3xl font-bold'>
                  {filteredProjects.length}
                </div>
              </div>
              <div className='p-3 bg-blue-100 rounded-full'>
                <Home className='h-6 w-6 text-blue-600' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <div className='text-sm text-gray-500'>Critical ({'<'}5%)</div>
                <div className='text-3xl font-bold text-red-600'>
                  {criticalProjects.length}
                </div>
              </div>
              <div className='p-3 bg-red-100 rounded-full'>
                <AlertTriangle className='h-6 w-6 text-red-600' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <div className='text-sm text-gray-500'>Warning ({'<'}10%)</div>
                <div className='text-3xl font-bold text-orange-600'>
                  {warningProjects.length}
                </div>
              </div>
              <div className='p-3 bg-orange-100 rounded-full'>
                <AlertTriangle className='h-6 w-6 text-orange-600' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <div className='text-sm text-gray-500'>Threshold</div>
                <div className='text-3xl font-bold'>{threshold}%</div>
              </div>
              <div className='p-3 bg-green-100 rounded-full'>
                <Filter className='h-6 w-6 text-green-600' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card className='mb-6'>
        <CardContent className='pt-6'>
          <div className='flex flex-col md:flex-row gap-4'>
            <div className='flex-1'>
              <Label htmlFor='search'>Search</Label>
              <div className='relative mt-1'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                <Input
                  id='search'
                  placeholder='Search projects...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='enhanced-input h-11'
                />
              </div>
            </div>

            <div className='w-full md:w-48'>
              <Label htmlFor='threshold'>Availability Threshold</Label>
              <Select
                value={threshold.toString()}
                onValueChange={handleThresholdChange}
              >
                <SelectTrigger className='h-11 enhanced-input'>
                  <SelectValue placeholder='Select threshold' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='5'>5% (Critical)</SelectItem>
                  <SelectItem value='10'>10% (Warning)</SelectItem>
                  <SelectItem value='15'>15%</SelectItem>
                  <SelectItem value='20'>20%</SelectItem>
                  <SelectItem value='25'>25%</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='w-full md:w-48'>
              <Label htmlFor='status'>Status Filter</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className='h-11 enhanced-input'>
                  <SelectValue placeholder='All Status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=''>All Status</SelectItem>
                  <SelectItem value='planning'>Planning</SelectItem>
                  <SelectItem value='under_development'>In Progress</SelectItem>
                  <SelectItem value='completed'>Completed</SelectItem>
                  <SelectItem value='on_hold'>On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='w-full md:w-48'>
              <Label htmlFor='type'>Type Filter</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className='h-11 enhanced-input'>
                  <SelectValue placeholder='All Types' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=''>All Types</SelectItem>
                  <SelectItem value='residential'>Residential</SelectItem>
                  <SelectItem value='commercial'>Commercial</SelectItem>
                  <SelectItem value='industrial'>Industrial</SelectItem>
                  <SelectItem value='mixed_use'>Mixed Use</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='flex justify-between items-center mt-4'>
            <div className='text-sm text-gray-600'>
              Showing {filteredProjects.length} project(s)
            </div>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('')
                  setTypeFilter('')
                  setThreshold(10)
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs View */}
      <Tabs defaultValue='all' className='mb-6'>
        <TabsList>
          <TabsTrigger value='all'>
            All Projects ({filteredProjects.length})
          </TabsTrigger>
          <TabsTrigger value='critical'>
            Critical ({criticalProjects.length})
          </TabsTrigger>
          <TabsTrigger value='warning'>
            Warning ({warningProjects.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value='all'>
          <DataTable
            data={filteredProjects}
            config={{
              columns,
              enableActions: true,
              responsive: { showMobileView: true }
            }}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value='critical'>
          <DataTable
            data={criticalProjects}
            config={{
              columns,
              enableActions: true,
              responsive: { showMobileView: true }
            }}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value='warning'>
          <DataTable
            data={warningProjects}
            config={{
              columns,
              enableActions: true,
              responsive: { showMobileView: true }
            }}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>

      {/* Analysis Section */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <BarChart3 className='h-5 w-5' />
              Availability Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {filteredProjects.slice(0, 5).map(project => {
                const total = project.totalPlots ?? 0
                const percentage =
                  project.availabilityPercentage ??
                  (total > 0
                    ? Math.round(
                        ((project.plotsAvailable ?? 0) / total) * 100
                      )
                    : 0)
                return (
                  <div key={project._id} className='space-y-2'>
                    <div className='flex justify-between'>
                      <div className='font-medium'>{project.projName}</div>
                      <div
                        className={`font-bold ${
                          percentage <= 5
                            ? 'text-red-600'
                            : percentage <= 10
                            ? 'text-orange-600'
                            : 'text-yellow-600'
                        }`}
                      >
                        {percentage}%
                      </div>
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-2'>
                      <div
                        className={`h-2 rounded-full ${
                          percentage <= 5
                            ? 'bg-red-500'
                            : percentage <= 10
                            ? 'bg-orange-500'
                            : 'bg-yellow-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className='flex justify-between text-sm text-gray-500'>
                      <span>
                        {project.plotsAvailable ?? 0} / {project.totalPlots ?? 0}{' '}
                        plots available
                      </span>
                      <span>{project.projStatus}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>
              Suggested actions for low availability projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {criticalProjects.length > 0 && (
                <div className='p-4 bg-red-50 border border-red-200 rounded-lg'>
                  <div className='flex items-center gap-2 mb-2'>
                    <AlertTriangle className='h-5 w-5 text-red-600' />
                    <h3 className='font-semibold text-red-800'>
                      Critical Projects
                    </h3>
                  </div>
                  <p className='text-sm text-red-700 mb-2'>
                    {criticalProjects.length} project(s) have less than 5%
                    availability. Consider:
                  </p>
                  <ul className='text-sm text-red-700 space-y-1 ml-5 list-disc'>
                    <li>Increasing plot prices</li>
                    <li>Launching new phase/section</li>
                    <li>Promoting remaining plots</li>
                    <li>Reviewing development strategy</li>
                  </ul>
                </div>
              )}

              {warningProjects.length > 0 && (
                <div className='p-4 bg-orange-50 border border-orange-200 rounded-lg'>
                  <div className='flex items-center gap-2 mb-2'>
                    <AlertTriangle className='h-5 w-5 text-orange-600' />
                    <h3 className='font-semibold text-orange-800'>
                      Warning Projects
                    </h3>
                  </div>
                  <p className='text-sm text-orange-700 mb-2'>
                    {warningProjects.length} project(s) have less than{' '}
                    {threshold}% availability. Suggested actions:
                  </p>
                  <ul className='text-sm text-orange-700 space-y-1 ml-5 list-disc'>
                    <li>Monitor inventory weekly</li>
                    <li>Consider price adjustments</li>
                    <li>Plan for project completion</li>
                    <li>Update marketing strategy</li>
                  </ul>
                </div>
              )}

              {filteredProjects.length === 0 && (
                <div className='text-center py-8'>
                  <Home className='h-12 w-12 mx-auto text-gray-400 mb-4' />
                  <h3 className='font-medium mb-2'>
                    No Low Availability Projects
                  </h3>
                  <p className='text-gray-500'>
                    All projects have sufficient plot availability based on your
                    threshold.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics Summary */}
      <Card className='mt-6'>
        <CardContent className='pt-6'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div>
              <h3 className='font-medium mb-3'>Availability Distribution</h3>
              <div className='space-y-3'>
                <div className='flex justify-between'>
                  <span className='text-sm'>0-5% (Critical)</span>
                  <span className='font-medium'>{criticalProjects.length}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm'>6-10% (Warning)</span>
                  <span className='font-medium'>{warningProjects.length}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm'>11-{threshold}%</span>
                  <span className='font-medium'>
                    {filteredProjects.length -
                      criticalProjects.length -
                      warningProjects.length}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className='font-medium mb-3'>Status Distribution</h3>
              <div className='space-y-3'>
                {Object.entries(
                  filteredProjects.reduce((acc, project) => {
                    acc[project.projStatus] = (acc[project.projStatus] || 0) + 1
                    return acc
                  }, {} as Record<string, number>)
                ).map(([status, count]) => (
                  <div key={status} className='flex justify-between'>
                    <span className='text-sm capitalize'>
                      {status.replace('_', ' ')}
                    </span>
                    <span className='font-medium'>{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className='font-medium mb-3'>Quick Actions</h3>
              <div className='space-y-2'>
                <Button
                  variant='outline'
                  className='w-full'
                  onClick={handleExport}
                >
                  <Download className='mr-2 h-4 w-4' />
                  Export Report
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
                  onClick={handleRefresh}
                >
                  <RefreshCw className='mr-2 h-4 w-4' />
                  Refresh Data
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
