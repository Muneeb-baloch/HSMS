// src/app/(dashboard)/projects/[id]/plots/page.tsx
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger
} from '@/components/ui/dialog'

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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { usePlotCategories } from '@/lib/hooks/entities/usePlotCategory'
import { usePlotSizes } from '@/lib/hooks/entities/usePlotSize'
import { useProject } from '@/lib/hooks/entities/useProject'
import {
  ArrowLeft,
  Download,
  Edit,
  Eye,
  FileText,
  Filter,
  Home,
  LayoutGrid,
  List,
  MoreVertical,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Trash2
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { DetailPageSkeleton } from '@/components/shared/PageSkeleton'
import { useConfirm } from "@/components/shared/ConfirmDialog";

export default function ProjectPlotsPage () {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string

  const { data: project, isLoading: projectLoading } = useProject(projectId)
  const { data: plotSizes, isLoading: sizesLoading } = usePlotSizes()
  const { data: plotCategories, isLoading: categoriesLoading } =
    usePlotCategories()

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const { confirm } = useConfirm();
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterSize, setFilterSize] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTab, setSelectedTab] = useState('all')

  // Mock plot data - in a real app, this would come from an API
  const [plots, setPlots] = useState([
    {
      id: '1',
      plotNumber: '001',
      size: '1',
      category: 'residential',
      status: 'available',
      customer: null,
      price: 5000000,
      area: 500,
      registeredDate: null,
      notes: 'Corner plot with road front'
    },
    {
      id: '2',
      plotNumber: '002',
      size: '2',
      category: 'commercial',
      status: 'sold',
      customer: { name: 'John Doe', id: 'cust1' },
      price: 10000000,
      area: 1000,
      registeredDate: '2024-01-15',
      notes: 'Main road facing'
    },
    {
      id: '3',
      plotNumber: '003',
      size: '1',
      category: 'residential',
      status: 'reserved',
      customer: { name: 'Jane Smith', id: 'cust2' },
      price: 5500000,
      area: 550,
      registeredDate: null,
      notes: ''
    },
    {
      id: '4',
      plotNumber: '004',
      size: '3',
      category: 'industrial',
      status: 'available',
      customer: null,
      price: 15000000,
      area: 2000,
      registeredDate: null,
      notes: 'Backside plot'
    },
    {
      id: '5',
      plotNumber: '005',
      size: '1',
      category: 'residential',
      status: 'sold',
      customer: { name: 'Bob Wilson', id: 'cust3' },
      price: 4800000,
      area: 480,
      registeredDate: '2024-02-20',
      notes: 'Near park'
    },
    {
      id: '6',
      plotNumber: '006',
      size: '2',
      category: 'commercial',
      status: 'available',
      customer: null,
      price: 9500000,
      area: 950,
      registeredDate: null,
      notes: ''
    }
  ])

  const isLoading = projectLoading || sizesLoading || categoriesLoading

  if (isLoading) {
    return <DetailPageSkeleton />
  }

  if (!project) {
    return (
      <div className='p-6'>
        <div className='text-center py-12'>
          <Home className='h-12 w-12 mx-auto text-gray-400 mb-4' />
          <h3 className='text-lg font-medium mb-2'>Project Not Found</h3>
          <p className='text-gray-500 mb-6'>
            The project you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button onClick={() => router.push('/projects')}>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back to Projects
          </Button>
        </div>
      </div>
    )
  }

  const filteredPlots = plots.filter(plot => {
    // Search filter
    if (
      searchTerm &&
      !plot.plotNumber.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !plot.customer?.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false
    }

    // Status filter
    if (filterStatus !== 'all' && plot.status !== filterStatus) {
      return false
    }

    // Size filter
    if (filterSize !== 'all' && plot.size !== filterSize) {
      return false
    }

    // Category filter
    if (filterCategory !== 'all' && plot.category !== filterCategory) {
      return false
    }

    // Tab filter
    if (selectedTab !== 'all' && plot.status !== selectedTab) {
      return false
    }

    return true
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800'
      case 'sold':
        return 'bg-blue-100 text-blue-800'
      case 'reserved':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Available'
      case 'sold':
        return 'Sold'
      case 'reserved':
        return 'Reserved'
      default:
        return status
    }
  }

  const getCategoryText = (category: string) => {
    const cat = plotCategories?.items?.find(c => c._id === category)
    return cat?.categoryName || category
  }

  const getSizeText = (size: string) => {
    const sizeObj = plotSizes?.items?.find(s => s._id === size)
    return sizeObj?.plotSizeName || size
  }

  const handleExport = () => {
    // TODO: implement export functionality
  }

  const handlePrint = () => {
    window.print()
  }

  const handleAddPlot = () => {
    // TODO: implement add plot
  }

  const handleEditPlot = (plotId: string) => {
    // TODO: implement edit plot
  }

  const handleDeletePlot = async (plotId: string) => {
    if (await confirm({ title: "Delete", description: 'Are you sure you want to delete this plot?', variant: "destructive" })) {
      setPlots(plots.filter(plot => plot.id !== plotId))
    }
  }

  const handleViewPlot = (plotId: string) => {
    // TODO: implement view plot
  }

  const handleRegisterPlot = (plotId: string) => {
    // TODO: implement register plot
  }

  return (
    <div className='p-6'>
      <div className='mb-6'>
        <Button
          variant='ghost'
          onClick={() => router.push(`/projects/view/${projectId}`)}
          className='mb-4'
        >
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back to Project
        </Button>

        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>{project.projName} - Plots</h1>
            <p className='text-gray-500 mt-2'>
              Manage and view all plots in {project.projName}
            </p>
          </div>
          <div className='flex gap-2'>
            <Button variant='outline' onClick={handleExport}>
              <Download className='mr-2 h-4 w-4' />
              Export
            </Button>
            <Button variant='outline' onClick={handlePrint}>
              <Printer className='mr-2 h-4 w-4' />
              Print
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className='mr-2 h-4 w-4' />
                  Add Plot
                </Button>
              </DialogTrigger>

              <DialogContent className='sm:max-w-[600px]'>
                <DialogHeader>
                  <h2 className='text-lg font-semibold'>Add New Plot</h2>
                  <p className='text-sm text-gray-500'>
                    Add a new plot to {project.projName}
                  </p>
                </DialogHeader>
                <div className='space-y-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='plotNumber'>Plot Number</Label>
                      <Input
                        id='plotNumber'
                        placeholder='e.g., 001'
                        className='enhanced-input h-11'
                        defaultValue={`${project.projPrefix}-${(
                          plots.length + 1
                        )
                          .toString()
                          .padStart(3, '0')}`}
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='plotSize'>Plot Size</Label>
                      <Select>
                        <SelectTrigger className='h-11 enhanced-input'>
                          <SelectValue placeholder='Select size' />
                        </SelectTrigger>
                        <SelectContent>
                          {plotSizes?.items?.map(size => (
                            <SelectItem key={size._id} value={size._id}>
                              {size.plotSizeName} ({size.totalArea}
                              {size.areaUnit})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='plotCategory'>Category</Label>
                      <Select>
                        <SelectTrigger className='h-11 enhanced-input'>
                          <SelectValue placeholder='Select category' />
                        </SelectTrigger>
                        <SelectContent>
                          {plotCategories?.items?.map(category => (
                            <SelectItem key={category._id} value={category._id}>
                              {category.categoryName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='price'>Price (PKR)</Label>
                      <Input
                        id='price'
                        type='number'
                        className='enhanced-input h-11'
                        placeholder='e.g., 5000000'
                      />
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='notes'>Notes</Label>
                    <Textarea id='notes' placeholder='Additional notes' />
                  </div>
                  <div className='flex justify-end gap-2'>
                    <Button variant='outline'>Cancel</Button>
                    <Button>Add Plot</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Project Summary */}
      <Card className='mb-6'>
        <CardContent className='pt-6'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='text-center p-4 bg-blue-50 rounded-lg'>
              <div className='text-2xl font-bold text-blue-600'>
                {project.totalPlots}
              </div>
              <div className='text-sm text-gray-600'>Total Plots</div>
            </div>
            <div className='text-center p-4 bg-green-50 rounded-lg'>
              <div className='text-2xl font-bold text-green-600'>
                {project.plotsAvailable}
              </div>
              <div className='text-sm text-gray-600'>Available</div>
            </div>
            <div className='text-center p-4 bg-orange-50 rounded-lg'>
              <div className='text-2xl font-bold text-orange-600'>
                {project.plotsReserved}
              </div>
              <div className='text-sm text-gray-600'>Reserved</div>
            </div>
            <div className='text-center p-4 bg-blue-50 rounded-lg'>
              <div className='text-2xl font-bold text-blue-600'>
                {project.plotsSold}
              </div>
              <div className='text-sm text-gray-600'>Sold</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs and Controls */}
      <div className='mb-6'>
        <div className='flex flex-col sm:flex-row justify-between gap-4 mb-4'>
          <Tabs
            value={selectedTab}
            onValueChange={setSelectedTab}
            className='w-full sm:w-auto'
          >
            <TabsList>
              <TabsTrigger value='all'>All Plots</TabsTrigger>
              <TabsTrigger value='available'>Available</TabsTrigger>
              <TabsTrigger value='reserved'>Reserved</TabsTrigger>
              <TabsTrigger value='sold'>Sold</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className='flex items-center gap-2'>
            <div className='relative flex-1 sm:flex-none sm:w-64'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
              <Input
                placeholder='Search plots...'
                value={searchTerm}
                className='enhanced-input h-11 pl-10'
                onChange={e => setSearchTerm(e.target.value)}
               
              />
            </div>

            <Button
              variant='outline'
              size='icon'
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className='h-4 w-4' />
            </Button>

            <div className='flex border rounded-lg'>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size='sm'
                onClick={() => setViewMode('grid')}
                className='rounded-r-none'
              >
                <LayoutGrid className='h-4 w-4' />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size='sm'
                onClick={() => setViewMode('list')}
                className='rounded-l-none'
              >
                <List className='h-4 w-4' />
              </Button>
            </div>

            <Button variant='ghost' size='icon'>
              <RefreshCw className='h-4 w-4' />
            </Button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card className='mb-4'>
            <CardContent className='pt-6'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='filterStatus'>Status</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className='h-11 enhanced-input'>
                      <SelectValue placeholder='All Status' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All Status</SelectItem>
                      <SelectItem value='available'>Available</SelectItem>
                      <SelectItem value='reserved'>Reserved</SelectItem>
                      <SelectItem value='sold'>Sold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='filterSize'>Size</Label>
                  <Select value={filterSize} onValueChange={setFilterSize}>
                    <SelectTrigger className='h-11 enhanced-input'>
                      <SelectValue placeholder='All Sizes' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All Sizes</SelectItem>
                      {plotSizes?.items?.map(size => (
                        <SelectItem key={size._id} value={size._id}>
                          {size.plotSizeName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='filterCategory'>Category</Label>
                  <Select
                    value={filterCategory}
                    onValueChange={setFilterCategory}
                  >
                    <SelectTrigger className='h-11 enhanced-input'>
                      <SelectValue placeholder='All Categories' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All Categories</SelectItem>
                      {plotCategories?.items?.map(category => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.categoryName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className='flex justify-end gap-2 mt-4'>
                <Button
                  variant='outline'
                  onClick={() => {
                    setFilterStatus('all')
                    setFilterSize('all')
                    setFilterCategory('all')
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Plots Display */}
      {viewMode === 'grid' ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {filteredPlots.map(plot => (
            <Card key={plot.id} className='overflow-hidden'>
              <CardHeader className='pb-2'>
                <div className='flex justify-between items-start'>
                  <div>
                    <CardTitle className='text-lg'>
                      Plot {plot.plotNumber}
                    </CardTitle>
                    <CardDescription>
                      {getSizeText(plot.size)} •{' '}
                      {getCategoryText(plot.category)}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(plot.status)}>
                    {getStatusText(plot.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  <div className='grid grid-cols-2 gap-2 text-sm'>
                    <div>
                      <div className='text-gray-500'>Area</div>
                      <div className='font-medium'>{plot.area} sq ft</div>
                    </div>
                    <div>
                      <div className='text-gray-500'>Price</div>
                      <div className='font-medium'>
                        PKR {plot.price.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {plot.customer && (
                    <div className='text-sm'>
                      <div className='text-gray-500'>Customer</div>
                      <div className='font-medium'>{plot.customer.name}</div>
                      {plot.registeredDate && (
                        <div className='text-gray-500 text-xs mt-1'>
                          Registered: {plot.registeredDate}
                        </div>
                      )}
                    </div>
                  )}

                  {plot.notes && (
                    <div className='text-sm'>
                      <div className='text-gray-500'>Notes</div>
                      <div className='truncate'>{plot.notes}</div>
                    </div>
                  )}

                  <div className='flex gap-2 pt-2'>
                    <Button
                      size='sm'
                      variant='outline'
                      className='flex-1'
                      onClick={() => handleViewPlot(plot.id)}
                    >
                      <Eye className='h-3 w-3 mr-1' />
                      View
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size='sm' variant='outline'>
                          <MoreVertical className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => handleEditPlot(plot.id)}
                        >
                          <Edit className='mr-2 h-4 w-4' />
                          Edit
                        </DropdownMenuItem>
                        {plot.status === 'available' && (
                          <DropdownMenuItem
                            onClick={() => handleRegisterPlot(plot.id)}
                          >
                            <FileText className='mr-2 h-4 w-4' />
                            Register
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className='text-red-600'
                          onClick={() => handleDeletePlot(plot.id)}
                        >
                          <Trash2 className='mr-2 h-4 w-4' />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className='pt-6'>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='border-b'>
                    <th className='text-left py-3 px-4 font-medium'>
                      Plot No.
                    </th>
                    <th className='text-left py-3 px-4 font-medium'>Size</th>
                    <th className='text-left py-3 px-4 font-medium'>
                      Category
                    </th>
                    <th className='text-left py-3 px-4 font-medium'>Status</th>
                    <th className='text-left py-3 px-4 font-medium'>Area</th>
                    <th className='text-left py-3 px-4 font-medium'>Price</th>
                    <th className='text-left py-3 px-4 font-medium'>
                      Customer
                    </th>
                    <th className='text-left py-3 px-4 font-medium'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlots.map(plot => (
                    <tr key={plot.id} className='border-b hover:bg-gray-50'>
                      <td className='py-3 px-4'>
                        <div className='font-medium'>{plot.plotNumber}</div>
                      </td>
                      <td className='py-3 px-4'>{getSizeText(plot.size)}</td>
                      <td className='py-3 px-4'>
                        {getCategoryText(plot.category)}
                      </td>
                      <td className='py-3 px-4'>
                        <Badge className={getStatusColor(plot.status)}>
                          {getStatusText(plot.status)}
                        </Badge>
                      </td>
                      <td className='py-3 px-4'>{plot.area} sq ft</td>
                      <td className='py-3 px-4'>
                        PKR {plot.price.toLocaleString()}
                      </td>
                      <td className='py-3 px-4'>
                        {plot.customer?.name || '-'}
                      </td>
                      <td className='py-3 px-4'>
                        <div className='flex gap-2'>
                          <Button
                            size='sm'
                            variant='ghost'
                            onClick={() => handleViewPlot(plot.id)}
                          >
                            <Eye className='h-4 w-4' />
                          </Button>
                          <Button
                            size='sm'
                            variant='ghost'
                            onClick={() => handleEditPlot(plot.id)}
                          >
                            <Edit className='h-4 w-4' />
                          </Button>
                          <Button
                            size='sm'
                            variant='ghost'
                            className='text-red-600 hover:text-red-700 hover:bg-red-50'
                            onClick={() => handleDeletePlot(plot.id)}
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {filteredPlots.length === 0 && (
        <div className='text-center py-12'>
          <Home className='h-12 w-12 mx-auto text-gray-400 mb-4' />
          <h3 className='text-lg font-medium mb-2'>No Plots Found</h3>
          <p className='text-gray-500 mb-6'>
            No plots match your current filters.
          </p>
          <Button
            variant='outline'
            onClick={() => {
              setSearchTerm('')
              setFilterStatus('all')
              setFilterSize('all')
              setFilterCategory('all')
              setSelectedTab('all')
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* Statistics */}
      <div className='mt-6 grid grid-cols-1 md:grid-cols-3 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              <div className='flex justify-between'>
                <span>Available</span>
                <span className='font-medium'>
                  {plots.filter(p => p.status === 'available').length} plots
                </span>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-2'>
                <div
                  className='bg-green-500 h-2 rounded-full'
                  style={{
                    width: `${
                      (plots.filter(p => p.status === 'available').length /
                        plots.length) *
                      100
                    }%`
                  }}
                ></div>
              </div>
              <div className='flex justify-between'>
                <span>Reserved</span>
                <span className='font-medium'>
                  {plots.filter(p => p.status === 'reserved').length} plots
                </span>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-2'>
                <div
                  className='bg-orange-500 h-2 rounded-full'
                  style={{
                    width: `${
                      (plots.filter(p => p.status === 'reserved').length /
                        plots.length) *
                      100
                    }%`
                  }}
                ></div>
              </div>
              <div className='flex justify-between'>
                <span>Sold</span>
                <span className='font-medium'>
                  {plots.filter(p => p.status === 'sold').length} plots
                </span>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-2'>
                <div
                  className='bg-blue-500 h-2 rounded-full'
                  style={{
                    width: `${
                      (plots.filter(p => p.status === 'sold').length /
                        plots.length) *
                      100
                    }%`
                  }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Financial Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              <div className='flex justify-between'>
                <span>Total Value</span>
                <span className='font-medium'>
                  PKR{' '}
                  {plots
                    .reduce((sum, plot) => sum + plot.price, 0)
                    .toLocaleString()}
                </span>
              </div>
              <div className='flex justify-between'>
                <span>Sold Value</span>
                <span className='font-medium'>
                  PKR{' '}
                  {plots
                    .filter(p => p.status === 'sold')
                    .reduce((sum, plot) => sum + plot.price, 0)
                    .toLocaleString()}
                </span>
              </div>
              <div className='flex justify-between'>
                <span>Reserved Value</span>
                <span className='font-medium'>
                  PKR{' '}
                  {plots
                    .filter(p => p.status === 'reserved')
                    .reduce((sum, plot) => sum + plot.price, 0)
                    .toLocaleString()}
                </span>
              </div>
              <div className='flex justify-between'>
                <span>Available Value</span>
                <span className='font-medium'>
                  PKR{' '}
                  {plots
                    .filter(p => p.status === 'available')
                    .reduce((sum, plot) => sum + plot.price, 0)
                    .toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              <Button className='w-full' onClick={handleAddPlot}>
                <Plus className='mr-2 h-4 w-4' />
                Add New Plot
              </Button>
              <Button variant='outline' className='w-full'>
                <FileText className='mr-2 h-4 w-4' />
                Generate Report
              </Button>
              <Button
                variant='outline'
                className='w-full'
                onClick={handleExport}
              >
                <Download className='mr-2 h-4 w-4' />
                Export All Data
              </Button>
              <Button variant='outline' className='w-full'>
                <RefreshCw className='mr-2 h-4 w-4' />
                Sync with Registry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
