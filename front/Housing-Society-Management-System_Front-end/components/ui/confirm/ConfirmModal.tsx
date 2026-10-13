'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import * as React from 'react'

export interface ConfirmModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  /** Called when user confirms */
  onConfirm: () => void | Promise<void>
  /** Confirm button label */
  confirmLabel?: string
  /** Use danger styling (red) for confirm button */
  variant?: 'danger' | 'default'
  /** Show warning icon */
  showIcon?: boolean
}

export function ConfirmModal ({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmLabel = 'Delete Permanently',
  variant = 'danger',
  showIcon = true
}: ConfirmModalProps) {
  const [isLoading, setIsLoading] = React.useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        className={cn(
          'bg-black/10 backdrop-blur-xl border-white/10 rounded-2xl shadow-2xl',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95'
        )}
      >
        <AlertDialogHeader>
          {showIcon && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className={cn(
                'mx-auto mb-2 flex size-14 items-center justify-center rounded-full',
                variant === 'danger'
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-amber-500/20 text-amber-400'
              )}
            >
              <AlertTriangle className='size-7' />
            </motion.div>
          )}
          <AlertDialogTitle className='text-center text-xl text-red-600 font-bold mx-auto'>
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription
            className='text-white/80
 text-center text-sm font-medium'
          >
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className='flex flex-col-reverse gap-2 sm:flex-row sm:justify-center'>
          <AlertDialogCancel
            className='border-white/10 bg-white/5 hover:bg-white/10'
            disabled={isLoading}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={e => {
              e.preventDefault()
              handleConfirm()
            }}
            className={cn(
              variant === 'danger' &&
                'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white focus:ring-red-500/30'
            )}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className='flex items-center gap-2'>
                <span className='size-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
                Processing...
              </span>
            ) : (
              confirmLabel
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
