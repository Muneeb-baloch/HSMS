'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ActionType } from '@/lib/utils/actionColors'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

const addButtonStyles =
  'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white border-0 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all duration-200'

const exportButtonStyles =
  'border-sky-500/50 text-sky-400 hover:bg-sky-500/20 hover:text-sky-300 hover:border-sky-400/60 transition-all'

const importButtonStyles =
  'border-sky-500/50 text-sky-400 hover:bg-sky-500/20 hover:text-sky-300 hover:border-sky-400/60 transition-all'

const actionButtonStyles: Partial<Record<ActionType, string>> = {
  add: addButtonStyles,
  export: exportButtonStyles,
  download: exportButtonStyles,
  import: importButtonStyles,
  refresh: 'border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 transition-all',
}

export interface ActionButtonProps {
  actionType: ActionType
  children: ReactNode
  icon?: LucideIcon | ReactNode
  variant?: 'default' | 'glass' | 'outline' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
  className?: string
  onClick?: () => void
  disabled?: boolean
}

export function ActionButton({
  actionType,
  children,
  icon: Icon,
  variant = 'default',
  size = 'sm',
  className,
  onClick,
  disabled
}: ActionButtonProps) {
  const actionStyles = actionButtonStyles[actionType]
  const isAddButton = actionType === 'add'

  return (
    <Button
      variant={isAddButton ? 'default' : (variant === 'glass' ? 'outline' : variant)}
      size={size}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        actionStyles,
        variant === 'glass' && !actionStyles && 'border-border/50',
        className
      )}
    >
      {Icon && (
        typeof Icon === 'function' ? (
          <Icon className="size-4 mr-1.5 shrink-0" />
        ) : (
          <span className="mr-1.5 shrink-0 inline-flex">{Icon}</span>
        )
      )}
      {children}
    </Button>
  )
}
