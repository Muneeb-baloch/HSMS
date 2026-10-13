'use client'

import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, X, Check } from 'lucide-react'
import * as React from 'react'

const REVERT_MS = 4000

export interface ConfirmInlineButtonProps
  extends Omit<React.ComponentProps<typeof Button>, 'onClick'> {
  /** Label for initial button */
  label?: string
  /** Label for confirm button */
  confirmLabel?: string
  /** Called when user confirms */
  onConfirm: () => void | Promise<void>
  /** Variant for initial button */
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  /** Size */
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm' | 'icon-xs'
  /** Icon for initial button */
  icon?: React.ReactNode
  /** Icon for confirm button */
  confirmIcon?: React.ReactNode
  /** Accessible label */
  ariaLabel?: string
}

export function ConfirmInlineButton({
  label = 'Delete',
  confirmLabel = 'Confirm Delete',
  onConfirm,
  variant = 'destructive',
  size = 'sm',
  icon,
  confirmIcon,
  ariaLabel,
  disabled,
  className,
  ...rest
}: ConfirmInlineButtonProps) {
  const [isConfirming, setIsConfirming] = React.useState(false)
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimeout = React.useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const handleRevert = React.useCallback(() => {
    clearTimeout()
    setIsConfirming(false)
  }, [clearTimeout])

  const handleInitialClick = React.useCallback(() => {
    clearTimeout()
    setIsConfirming(true)
    timeoutRef.current = window.setTimeout(handleRevert, REVERT_MS)
  }, [clearTimeout, handleRevert])

  const handleConfirm = React.useCallback(async () => {
    clearTimeout()
    setIsConfirming(false)
    await onConfirm()
  }, [clearTimeout, onConfirm])

  React.useEffect(() => () => clearTimeout(), [clearTimeout])

  return (
    <div className="inline-flex items-center gap-1">
      <AnimatePresence mode="wait">
        {!isConfirming ? (
          <motion.div
            key="initial"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            <Button
              variant={variant}
              size={size}
              disabled={disabled}
              onClick={handleInitialClick}
              aria-label={ariaLabel || label}
              className={className}
              {...rest}
            >
              {icon ?? <Trash2 className="size-4" />}
              {label}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center gap-1"
            transition={{ duration: 0.15 }}
          >
            <Button
              variant="destructive"
              size={size}
              disabled={disabled}
              onClick={handleConfirm}
              className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-lg"
            >
              {confirmIcon ?? <Check className="size-4" />}
              {confirmLabel}
            </Button>
            <Button
              variant="outline"
              size={size}
              onClick={handleRevert}
              aria-label="Cancel"
              className="border-white/10 bg-white/5"
            >
              <X className="size-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
