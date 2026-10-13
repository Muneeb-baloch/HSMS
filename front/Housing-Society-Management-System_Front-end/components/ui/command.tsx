'use client'

import { cn } from '@/lib/utils'
import * as React from 'react'

export const Command = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'bg-white rounded-md shadow-md border w-full overflow-hidden',
      className
    )}
    {...props}
  />
))
Command.displayName = 'Command'

export const CommandList = React.forwardRef<
  HTMLUListElement,
  React.ComponentPropsWithoutRef<'ul'>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn('p-2 max-h-60 overflow-auto', className)}
    {...props}
  />
))
CommandList.displayName = 'CommandList'

export const CommandEmpty = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('p-2 text-sm text-gray-500', className)}
    {...props}
  >
    {children}
  </div>
))
CommandEmpty.displayName = 'CommandEmpty'

export const CommandGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('py-1', className)} {...props} />
))
CommandGroup.displayName = 'CommandGroup'

export const CommandItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'> & {
    value?: string
    onSelect?: () => void
    disabled?: boolean
  }
>(({ className, children, onSelect, disabled = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center px-2 py-1 cursor-pointer rounded hover:bg-gray-100',
      disabled && 'opacity-50 cursor-not-allowed',
      className
    )}
    onClick={() => {
      if (!disabled) onSelect?.()
    }}
    {...props}
  >
    {children}
  </div>
))
CommandItem.displayName = 'CommandItem'


export const CommandInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentPropsWithoutRef<'input'> & {
    onValueChange?: (value: string) => void
  }
>(({ className, onValueChange, value, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        'w-full px-2 py-1 border-b border-gray-200 focus:outline-none',
        className
      )}
      value={value}
      onChange={e => {
        props.onChange?.(e)
        onValueChange?.(e.target.value)
      }}
      {...props}
    />
  )
})
CommandInput.displayName = 'CommandInput'
