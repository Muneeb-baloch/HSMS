// src/components/plots/ExportReports.tsx
'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useGeneratePlotInventoryReportQuery } from '@/lib/API/plotApi'
import { FileDown, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { customToast } from '@/lib/utils/customToast'

interface ExportReportsProps {
  projectId?: string
}

export function ExportReports ({ projectId }: ExportReportsProps) {
  const [open, setOpen] = useState(false)
  const [format, setFormat] = useState('excel')
  const [reportType, setReportType] = useState('inventory')
  const { refetch, isLoading } = useGeneratePlotInventoryReportQuery(
    projectId || '',
    {
      skip: !projectId
    }
  )

  const handleExport = async () => {
    try {
      const result = await refetch()

      if (result.data) {
        // Simulate download
        const dataStr = JSON.stringify(result.data, null, 2)
        const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(
          dataStr
        )}`

        const exportFileName = `plots-report-${reportType}-${
          new Date().toISOString().split('T')[0]
        }.${format}`

        const linkElement = document.createElement('a')
        linkElement.setAttribute('href', dataUri)
        linkElement.setAttribute('download', exportFileName)
        linkElement.click()

        customToast.success('Report downloaded successfully')
        setOpen(false)
      }
    } catch (error) {
      customToast.error('Failed to generate report')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline'>
          <FileDown className='mr-2 h-4 w-4' />
          Export Reports
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Reports</DialogTitle>
          <DialogDescription>
            Generate and download plot reports
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Report Type */}
          <div className='space-y-2'>
            <Label htmlFor='reportType'>Report Type</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className='h-11 enhanced-input'>
                <SelectValue placeholder='Select report type' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='inventory'>Inventory Report</SelectItem>
                <SelectItem value='sales'>Sales Report</SelectItem>
                <SelectItem value='available'>
                  Available Plots Report
                </SelectItem>
                <SelectItem value='financial'>Financial Summary</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Format */}
          <div className='space-y-2'>
            <Label htmlFor='format'>Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger className='h-11 enhanced-input'>
                <SelectValue placeholder='Select format' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='excel'>Excel (.xlsx)</SelectItem>
                <SelectItem value='pdf'>PDF (.pdf)</SelectItem>
                <SelectItem value='csv'>CSV (.csv)</SelectItem>
                <SelectItem value='json'>JSON (.json)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Options based on report type */}
          {reportType === 'inventory' && (
            <div className='space-y-2'>
              <Label>Inventory Options</Label>
              <div className='space-y-2 text-sm'>
                <div className='flex items-center space-x-2'>
                  <input
                    type='checkbox'
                    id='includeDetails'
                    className='enhanced-input h-11'
                    defaultChecked
                  />
                  <label htmlFor='includeDetails'>Include plot details</label>
                </div>
                <div className='flex items-center space-x-2'>
                  <input
                    type='checkbox'
                    id='includePrices'
                    className='enhanced-input h-11'
                    defaultChecked
                  />
                  <label htmlFor='includePrices'>
                    Include pricing information
                  </label>
                </div>
                <div className='flex items-center space-x-2'>
                  <input
                    type='checkbox'
                    id='includeStatus'
                    className='enhanced-input h-11'
                    defaultChecked
                  />
                  <label htmlFor='includeStatus'>
                    Include status information
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Project Filter */}
          {!projectId && (
            <div className='space-y-2'>
              <Label htmlFor='projectFilter'>Project</Label>
              <Select defaultValue='all'>
                <SelectTrigger className='h-11 enhanced-input'>
                  <SelectValue placeholder='Select project' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Projects</SelectItem>
                  <SelectItem value='project1'>Project Alpha</SelectItem>
                  <SelectItem value='project2'>Project Beta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Date Range */}
          <div className='grid grid-cols-2 gap-2'>
            <div className='space-y-2'>
              <Label htmlFor='fromDate'>From Date</Label>
              <input
                type='date'
                id='fromDate'
                className='enhanced-input h-11'
                defaultValue={
                  new Date(new Date().setMonth(new Date().getMonth() - 1))
                    .toISOString()
                    .split('T')[0]
                }
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='toDate'>To Date</Label>
              <input
                type='date'
                id='toDate'
                className='enhanced-input h-11'
                defaultValue={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Export Button */}
          <Button
            onClick={handleExport}
            disabled={isLoading}
            className='w-full'
          >
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Generating...
              </>
            ) : (
              <>
                <FileDown className='mr-2 h-4 w-4' />
                Export{' '}
                {reportType.charAt(0).toUpperCase() + reportType.slice(1)}{' '}
                Report
              </>
            )}
          </Button>

          {/* Preview Note */}
          <div className='text-xs text-gray-500 text-center'>
            Note: Reports are generated based on current data and filters
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
