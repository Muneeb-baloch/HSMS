'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle
} from '@radix-ui/react-dialog'
import React from 'react'
import { Button } from './button'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onConfirm: () => void
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  onConfirm
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='p-4 rounded-lg border bg-white'>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
        <div className='flex justify-end gap-2 mt-4'>
          <Button onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            variant='destructive'
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
          >
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
