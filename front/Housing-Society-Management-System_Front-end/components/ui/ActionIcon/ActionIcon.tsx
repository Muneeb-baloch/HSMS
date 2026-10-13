'use client'

import {
  IconEdit,
  IconEye,
  IconTrash,
  IconPlus,
  IconArrowsExchange,
  IconKey,
  IconPrinter,
  IconDownload,
  IconUpload,
  IconAlertTriangle,
  IconCheck,
  IconX,
  IconRefresh,
  IconDotsVertical
} from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { ActionType, getActionColor } from '@/lib/utils/actionColors'

const actionToIcon: Record<ActionType, React.ComponentType<{ className?: string; size?: number; stroke?: number }>> = {
  edit: IconEdit,
  view: IconEye,
  delete: IconTrash,
  add: IconPlus,
  transfer: IconArrowsExchange,
  possession: IconKey,
  print: IconPrinter,
  export: IconDownload,
  download: IconDownload,
  import: IconUpload,
  complaint: IconAlertTriangle,
  alert: IconAlertTriangle,
  warning: IconAlertTriangle,
  approve: IconCheck,
  confirm: IconCheck,
  paid: IconCheck,
  cancel: IconX,
  reject: IconX,
  refresh: IconRefresh,
  toggle: IconRefresh,
  default: IconDotsVertical
}

export interface ActionIconProps {
  actionType: ActionType
  size?: number
  className?: string
  onClick?: (e: React.MouseEvent) => void
  disabled?: boolean
  title?: string
  /** Use filled circular style for row actions */
  variant?: 'icon' | 'circular'
}

export function ActionIcon({
  actionType,
  size = 16,
  className,
  onClick,
  disabled = false,
  title,
  variant = 'icon'
}: ActionIconProps) {
  const Icon = actionToIcon[actionType]
  const colors = getActionColor(actionType)

  const iconClasses = cn(
    colors.icon,
    !disabled && colors.iconHover,
    'transition-all duration-200',
    !disabled && 'cursor-pointer',
    disabled && 'opacity-40 cursor-not-allowed',
    !disabled && variant === 'circular' && 'hover:scale-110',
    className
  )

  const iconElement = (
    <Icon
      className={iconClasses}
      size={size}
      stroke={1.5}
    />
  )

  if (variant === 'circular') {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={cn(
          'rounded-full p-2 inline-flex items-center justify-center transition-all duration-200',
          colors.bg,
          !disabled && colors.bgHover,
          !disabled && 'hover:scale-105'
        )}
      >
        {iconElement}
      </button>
    )
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title={title}
        className="inline-flex items-center justify-center group"
      >
        {iconElement}
      </button>
    )
  }

  return iconElement
}
