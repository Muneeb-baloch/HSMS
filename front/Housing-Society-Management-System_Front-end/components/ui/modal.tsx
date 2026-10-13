'use client'

import { Dialog, DialogContent, DialogTitle } from '@radix-ui/react-dialog'
import React, { ReactNode } from 'react'
import { Button } from './button'
import { DialogHeader } from './dialog'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className='p-6 rounded-lg border bg-white max-w-lg mx-auto'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className='mt-4'>{children}</div>
        <div className='mt-6 flex justify-end'>
          <Button variant='outline' onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
