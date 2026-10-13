'use client'

import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import * as React from 'react'

export interface ConfirmDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  /** Summary content (form fields, transfer details, etc.) */
  children?: React.ReactNode
  /** Called when user confirms */
  onConfirm: () => void | Promise<void>
  /** Confirm button label */
  confirmLabel?: string
  /** Variant for confirm button */
  variant?: 'default' | 'danger'
}

export function ConfirmDrawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  onConfirm,
  confirmLabel = 'Confirm',
  variant = 'default',
}: ConfirmDrawerProps) {
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
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent
        className={cn(
          'bg-black/40 backdrop-blur-xl border-white/10 sm:max-w-md',
          'data-[vaul-drawer-direction=right]:rounded-l-2xl'
        )}
      >
        <DrawerHeader className="border-b border-white/5">
          <DrawerTitle className="text-lg font-semibold">{title}</DrawerTitle>
          {description && (
            <DrawerDescription className="text-muted-foreground">
              {description}
            </DrawerDescription>
          )}
        </DrawerHeader>

        {children && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 overflow-y-auto p-4"
          >
            {children}
          </motion.div>
        )}

        <DrawerFooter className="border-t border-white/5 flex-row gap-2">
          <DrawerClose asChild>
            <Button
              variant="outline"
              className="border-white/10 bg-white/5 hover:bg-white/10"
            >
              Cancel
            </Button>
          </DrawerClose>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className={cn(
              variant === 'danger' &&
                'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700'
            )}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Processing...
              </span>
            ) : (
              confirmLabel
            )}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
