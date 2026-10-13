'use client'

import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface SummaryCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  iconBgClassName?: string
  iconClassName?: string
  valueClassName?: string
  trend?: string
  trendUp?: boolean
  gradient?: string
}

export function SummaryCard ({
  title,
  value,
  icon: Icon,
  iconBgClassName = 'bg-blue-500/20',
  iconClassName = 'text-blue-500 dark:text-blue-400',
  valueClassName = '',
  trend,
  trendUp = true,
  gradient = 'from-blue-500/10 to-transparent'
}: SummaryCardProps) {
  return (
    <div
      className={cn(
        'glass-card rounded-2xl border border-border p-6 transition-all duration-300 shadow-md',
        'hover:scale-[1.02] hover:shadow-2xl hover:border-primary/30',
        `bg-gradient-to-br ${gradient}`
      )}
    >
      <div className='flex items-start justify-between gap-4'>
        <div className='min-w-0 flex-1'>
          <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
            {title}
          </p>
          <p
            className={cn(
              'mt-1 text-lg font-bold tabular-nums',
              valueClassName
            )}
          >
            {value}
          </p>
          {trend && (
            <span
              className={cn(
                'mt-1 inline-flex items-center text-xs font-medium',
                trendUp ? 'text-emerald-500' : 'text-rose-500'
              )}
            >
              {trendUp ? '↑' : '↓'} {trend}
            </span>
          )}
        </div>
        <div
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-xl',
            iconBgClassName
          )}
        >
          <Icon className={cn('size-5', iconClassName)} />
        </div>
      </div>
    </div>
  )
}
