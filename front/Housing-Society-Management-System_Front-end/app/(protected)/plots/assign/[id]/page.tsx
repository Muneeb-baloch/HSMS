// src/app/(dashboard)/plots/assign/[id]/page.tsx
'use client'

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useAssignPlot, usePlot } from '@/lib/hooks/entities/usePlot'
import { useAuth } from '@/lib/hooks/useAuth'
import { ArrowLeft, Loader2, Search } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { customToast } from "@/lib/utils/customToast"
import { DetailPageSkeleton } from '@/components/shared/PageSkeleton'

export default function AssignPlotPage () {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const { mutateAsync: assignPlot, isPending } = useAssignPlot()

  const id = params.id as string
  const { data: plot, isLoading } = usePlot(id)

  const [formData, setFormData] = useState({
    fileId: '',
    salesStatusId: '',
    remarks: ''
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  if (isLoading) {
    return <DetailPageSkeleton />
  }

  if (!plot) {
    router.push('/plots')
    return null
  }

  if (!plot.isAvailable) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Plot Not Available</CardTitle>
            <CardDescription>
              This plot is already assigned to a customer and cannot be
              reassigned.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.back()}>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSearchFiles = async () => {
    if (!searchTerm.trim()) {
      customToast.error('Please enter a search term')
      return
    }

    setIsSearching(true)
    try {
      // This would be an API call to search files
      // const response = await apiClient.get('/files', { params: { search: searchTerm } });
      // setSearchResults(response.data.data);

      // Mock data for demonstration
      setSearchResults([
        {
          _id: '1',
          fileNumber: 'FILE-001',
          customerName: 'John Doe',
          customerCnic: '12345-6789012-3'
        },
        {
          _id: '2',
          fileNumber: 'FILE-002',
          customerName: 'Jane Smith',
          customerCnic: '98765-4321098-7'
        }
      ])
    } catch (error) {
      customToast.error('Failed to search files')
    } finally {
      setIsSearching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.fileId || !formData.salesStatusId) {
      customToast.error('Please select a file and sales status')
      return
    }

    try {
      await assignPlot({
        plotId: id,
        fileId: formData.fileId,
        salesStatusId: formData.salesStatusId,
        assignedBy: user?.id || '',
        remarks: formData.remarks
      })

      customToast.success('Plot assigned successfully')
      router.push(`/plots/view/${id}`)
    } catch (error) {
      customToast.error(
        'Failed to assign plot' +
          (error instanceof Error ? `: ${error.message}` : '')
      )
    }
  }

  return (
    <div className='p-6'>
      <Button variant='ghost' onClick={() => router.back()} className='mb-6'>
        <ArrowLeft className='mr-2 h-4 w-4' />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Assign Plot to Customer</CardTitle>
          <CardDescription>
            Assign plot: <span className='font-medium'>{plot.plotNo}</span> to a
            customer file
          </CardDescription>
          {plot.plotRegistrationNo && (
            <CardDescription>
              Registration:{' '}
              <span className='font-medium'>{plot.plotRegistrationNo}</span>
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Plot Information Summary */}
            <div className='p-4 border rounded-lg bg-gray-50'>
              <h3 className='font-medium mb-2'>Plot Information</h3>
              <div className='grid grid-cols-2 gap-2 text-sm'>
                <div>
                  <span className='text-gray-500'>Project:</span>
                  <p className='font-medium'>
                    {typeof plot.projectId === 'object'
                      ? plot.projectId.projName
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <span className='text-gray-500'>Block:</span>
                  <p className='font-medium'>
                    {typeof plot.plotBlockId === 'object'
                      ? plot.plotBlockId.plotBlockName
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <span className='text-gray-500'>Size:</span>
                  <p className='font-medium'>
                    {plot.dimensionsWithUnit ||
                      `${plot.plotLength}ft × ${plot.plotWidth}ft`}
                  </p>
                </div>
                <div>
                  <span className='text-gray-500'>Price:</span>
                  <p className='font-bold'>
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'PKR'
                    }).format(plot.plotTotalAmount)}
                  </p>
                </div>
              </div>
            </div>

            {/* File Search */}
            <div className='space-y-4'>
              <div>
                <Label htmlFor='search'>Search Customer File</Label>
                <div className='flex gap-2 mt-1'>
                  <Input
                    id='search'
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder='Search by file number, customer name, or CNIC'
                    className='flex-1 enhanced-input h-11'
                  />
                  <Button
                    type='button'
                    variant='outline'
                    onClick={handleSearchFiles}
                    disabled={isSearching}
                  >
                    {isSearching ? (
                      <Loader2 className='h-4 w-4 animate-spin' />
                    ) : (
                      <Search className='h-4 w-4' />
                    )}
                  </Button>
                </div>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className='border rounded-lg'>
                  <div className='p-3 border-b bg-gray-50'>
                    <h4 className='font-medium text-sm'>Select a File</h4>
                  </div>
                  <div className='divide-y'>
                    {searchResults.map(file => (
                      <div
                        key={file._id}
                        className={`p-3 cursor-pointer hover:bg-gray-50 ${
                          formData.fileId === file._id
                            ? 'bg-blue-50 border-l-4 border-blue-500'
                            : ''
                        }`}
                        onClick={() =>
                          setFormData({ ...formData, fileId: file._id })
                        }
                      >
                        <div className='font-medium'>{file.fileNumber}</div>
                        <div className='text-sm text-gray-600'>
                          {file.customerName}
                        </div>
                        <div className='text-xs text-gray-500'>
                          {file.customerCnic}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected File */}
              {formData.fileId && (
                <div className='p-3 border rounded-lg bg-green-50'>
                  <div className='flex justify-between items-center'>
                    <div>
                      <div className='font-medium'>Selected File</div>
                      <div className='text-sm text-gray-600'>
                        {
                          searchResults.find(f => f._id === formData.fileId)
                            ?.fileNumber
                        }
                      </div>
                    </div>
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={() => setFormData({ ...formData, fileId: '' })}
                    >
                      Change
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Sales Status */}
            <div>
              <Label htmlFor='salesStatusId'>Sales Status *</Label>
              <Select
                value={formData.salesStatusId}
                onValueChange={value =>
                  setFormData({ ...formData, salesStatusId: value })
                }
              >
                <SelectTrigger className='h-11 enhanced-input'>
                  <SelectValue placeholder='Select sales status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='sold'>Sold</SelectItem>
                  <SelectItem value='reserved'>Reserved</SelectItem>
                  <SelectItem value='booked'>Booked</SelectItem>
                  <SelectItem value='allocated'>Allocated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Remarks */}
            <div>
              <Label htmlFor='remarks'>Remarks (Optional)</Label>
              <Textarea
                id='remarks'
                value={formData.remarks}
                onChange={e =>
                  setFormData({ ...formData, remarks: e.target.value })
                }
                placeholder='Enter any remarks about this assignment'
                rows={3}
              />
            </div>

            <div className='flex gap-4'>
              <Button
                type='button'
                variant='outline'
                onClick={() => router.back()}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={
                  isPending || !formData.fileId || !formData.salesStatusId
                }
              >
                {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                Assign Plot
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
