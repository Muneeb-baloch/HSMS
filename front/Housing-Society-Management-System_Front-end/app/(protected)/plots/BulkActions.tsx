// src/components/plots/BulkActions.tsx
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
import { Switch } from '@/components/ui/switch'
import { useBulkUpdatePlots } from '@/lib/hooks/entities/usePlot'
import { CheckSquare, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { customToast } from '@/lib/utils/customToast'

interface BulkActionsProps {
  selectedPlots: string[]
  onSuccess?: () => void
}

export function BulkActions ({ selectedPlots, onSuccess }: BulkActionsProps) {
  const bulkUpdate = useBulkUpdatePlots()
  const [open, setOpen] = useState(false)
  const [action, setAction] = useState('')
  const [value, setValue] = useState<any>('')

  const handleBulkUpdate = async () => {
    if (selectedPlots.length === 0) {
      customToast.error('Please select at least one plot')
      return
    }

    if (!action) {
      customToast.error('Please select an action')
      return
    }

    try {
      await bulkUpdate.mutateAsync({
        plotIds: selectedPlots,
        field: action as any,
        value
      })

      customToast.success(`Updated ${selectedPlots.length} plots`)
      setOpen(false)
      setAction('')
      setValue('')

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      customToast.error('Failed to update plots')
    }
  }

  const getValueInput = () => {
    switch (action) {
      case 'salesStatusId':
        return (
          <Select value={value} onValueChange={setValue}>
            <SelectTrigger className='h-11 enhanced-input'>
              <SelectValue placeholder='Select sales status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='sold'>Sold</SelectItem>
              <SelectItem value='reserved'>Reserved</SelectItem>
              <SelectItem value='available'>Available</SelectItem>
            </SelectContent>
          </Select>
        )

      case 'srDevStatId':
        return (
          <Select value={value} onValueChange={setValue}>
            <SelectTrigger className='h-11 enhanced-input'>
              <SelectValue placeholder='Select development status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='phase1'>Phase 1</SelectItem>
              <SelectItem value='phase2'>Phase 2</SelectItem>
              <SelectItem value='completed'>Completed</SelectItem>
            </SelectContent>
          </Select>
        )

      case 'isPossessionReady':
        return (
          <div className='flex items-center space-x-2'>
            <Switch
              checked={value}
              onCheckedChange={setValue}
              className='data-[state=checked]:bg-primary'
            />
            <Label>{value ? 'Ready' : 'Not Ready'}</Label>
          </div>
        )

      case 'plotCategoryId':
        return (
          <Select value={value} onValueChange={setValue}>
            <SelectTrigger className='h-11 enhanced-input'>
              <SelectValue placeholder='Select plot category' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='premium'>Premium</SelectItem>
              <SelectItem value='standard'>Standard</SelectItem>
              <SelectItem value='economy'>Economy</SelectItem>
            </SelectContent>
          </Select>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' disabled={selectedPlots.length === 0}>
          <CheckSquare className='mr-2 h-4 w-4' />
          Bulk Actions ({selectedPlots.length})
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Update Plots</DialogTitle>
          <DialogDescription>
            Apply changes to {selectedPlots.length} selected plots
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Action Selection */}
          <div className='space-y-2'>
            <Label htmlFor='action'>Action</Label>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger className='h-11 enhanced-input'>
                <SelectValue placeholder='Select action' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='salesStatusId'>
                  Update Sales Status
                </SelectItem>
                <SelectItem value='srDevStatId'>
                  Update Development Status
                </SelectItem>
                <SelectItem value='isPossessionReady'>
                  Mark Possession Ready
                </SelectItem>
                <SelectItem value='plotCategoryId'>
                  Update Plot Category
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Value Input */}
          {action && (
            <div className='space-y-2'>
              <Label htmlFor='value'>Value</Label>
              {getValueInput()}
            </div>
          )}

          {/* Selected Plots Preview */}
          <div className='space-y-2'>
            <Label>Selected Plots ({selectedPlots.length})</Label>
            <div className='max-h-32 overflow-y-auto border rounded-md p-2'>
              {selectedPlots.slice(0, 10).map((id, index) => (
                <div key={id} className='text-sm py-1'>
                  Plot {index + 1}: {id.slice(-6)}
                </div>
              ))}
              {selectedPlots.length > 10 && (
                <div className='text-sm text-gray-500 py-1'>
                  ...and {selectedPlots.length - 10} more
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <Button
            onClick={handleBulkUpdate}
            disabled={!action || bulkUpdate.isPending}
            className='w-full'
          >
            {bulkUpdate.isPending ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Updating...
              </>
            ) : (
              `Update ${selectedPlots.length} Plots`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
