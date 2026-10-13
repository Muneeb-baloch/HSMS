'use client'

import { cn } from '@/lib/utils'
import { IconCalendar } from '@tabler/icons-react'
import {
  addMonths,
  format,
  getDay,
  getDaysInMonth,
  isSameDay,
  isSameMonth,
  setMonth,
  setYear,
  startOfMonth,
  subMonths
} from 'date-fns'
import { useRef, useState } from 'react'
import { Button } from './button'
import { Input } from './input'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './select'

export interface DatePickerProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  min?: Date
  max?: Date
  className?: string
  inputClassName?: string
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export function DatePicker ({
  value,
  onChange,
  placeholder = 'Select date',
  disabled = false,
  min,
  max,
  className,
  inputClassName
}: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const [viewDate, setViewDate] = useState(() => {
    if (value) {
      const d = new Date(value)
      return isNaN(d.getTime()) ? new Date() : d
    }
    return new Date()
  })
  const inputRef = useRef<HTMLInputElement>(null)

  const displayValue = value
    ? (() => {
        const d = new Date(value)
        return isNaN(d.getTime()) ? '' : format(d, 'yyyy-MM-dd')
      })()
    : ''

  const handleSelect = (date: Date) => {
    onChange(format(date, 'yyyy-MM-dd'))
    setOpen(false)
  }

  const goPrev = () => setViewDate(d => subMonths(d, 1))
  const goNext = () => setViewDate(d => addMonths(d, 1))

  const currentYear = new Date().getFullYear()
  const minYear = min ? min.getFullYear() : 1900
  const maxYear = max ? max.getFullYear() : currentYear + 10
  const years = Array.from(
    { length: maxYear - minYear + 1 },
    (_, i) => minYear + i
  ).reverse()

  const handleMonthChange = (monthVal: string) => {
    setViewDate(d => setMonth(d, parseInt(monthVal, 10)))
  }
  const handleYearChange = (yearVal: string) => {
    setViewDate(d => setYear(d, parseInt(yearVal, 10)))
  }

  const daysInMonth = getDaysInMonth(viewDate)
  const start = startOfMonth(viewDate)
  const startWeekday = getDay(start)
  const days: (Date | null)[] = []
  for (let i = 0; i < startWeekday; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), d))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className={cn('flex gap-2', className)}>
          <Input
            ref={inputRef}
            readOnly
            value={displayValue}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              'flex-1 rounded-xl border bg-background focus-visible:ring-2 focus-visible:ring-blue-500/30',
              inputClassName
            )}
          />
          <Button
            type='button'
            variant='outline'
            size='icon'
            disabled={disabled}
            className='shrink-0 rounded-xl border-border hover:bg-muted'
            aria-label='Open calendar'
          >
            <IconCalendar className='size-5 text-muted-foreground' />
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent
        align='start'
        className='w-auto rounded-2xl border border-white/10  p-4 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-gray-900/95'
      >
        <div className='flex items-center justify-between gap-2 pb-3'>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='size-8 shrink-0 rounded-lg hover:bg-white/10'
            onClick={goPrev}
            aria-label='Previous month'
          >
            <span className='text-lg'>‹</span>
          </Button>
          <div className='flex flex-1 items-center gap-2'>
            <Select
              value={String(viewDate.getMonth())}
              onValueChange={handleMonthChange}
            >
              <SelectTrigger className='h-8 min-w-0 flex-1 rounded-lg border-white/20 bg-black/20 text-sm'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m, i) => (
                  <SelectItem key={m} value={String(i)}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={String(viewDate.getFullYear())}
              onValueChange={handleYearChange}
            >
              <SelectTrigger className='h-8 w-[80px] shrink-0 rounded-lg border-white/20 bg-black/20 text-sm'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className='max-h-60'>
                {years.map(y => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='size-8 shrink-0 rounded-lg hover:bg-white/10'
            onClick={goNext}
            aria-label='Next month'
          >
            <span className='text-lg'>›</span>
          </Button>
        </div>
        <div className='grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground'>
          {WEEKDAYS.map(d => (
            <div key={d} className='py-1 font-medium'>
              {d}
            </div>
          ))}
          {days.map((date, i) => {
            if (!date) {
              return <div key={`empty-${i}`} />
            }
            const selected = value && isSameDay(date, new Date(value))
            const currentMonth = isSameMonth(date, viewDate)
            const isDisabled =
              (min && date < min) || (max && date > max) || !currentMonth
            return (
              <button
                key={date.toISOString()}
                type='button'
                disabled={isDisabled}
                onClick={() => !isDisabled && handleSelect(date)}
                className={cn(
                  'size-9 rounded-lg text-sm transition-colors',
                  currentMonth && 'text-foreground',
                  !currentMonth && 'text-muted-foreground/50',
                  selected &&
                    'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-90',
                  !selected &&
                    !isDisabled &&
                    'hover:bg-white/10 hover:text-foreground'
                )}
              >
                {date.getDate()}
              </button>
            )
          })}
        </div>
        <div className='mt-3 flex gap-2 border-t border-white/10 pt-3'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='flex-1 rounded-xl border-white/20 text-white bg-blue-400'
            onClick={() => {
              const today = new Date()
              handleSelect(today)
            }}
          >
            Today
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            className='rounded-xl bg-gray-200'
            onClick={() => {
              onChange('')
              setOpen(false)
            }}
          >
            Clear
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
