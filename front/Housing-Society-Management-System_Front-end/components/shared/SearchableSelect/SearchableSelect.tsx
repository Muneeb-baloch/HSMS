'use client'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import { DialogHeader } from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { apiClient } from '@/lib/API/client'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger
} from '@radix-ui/react-dialog'
import { useQuery } from '@tanstack/react-query'
import { Check, ChevronsUpDown, Loader2, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Option {
  value: string
  label: string
}

interface SearchableSelectProps {
  value: string
  onValueChange: (value: string) => void
  endpoint: string
  labelField: string
  valueField: string
  placeholder?: string
  disabled?: boolean
  onCreate?: (data: unknown) => Promise<unknown>
  queryParams?: Record<string, unknown>
  /** When editing, pass pre-loaded label for the selected value (e.g. from populated API response) */
  initialOption?: { value: string; label: string }
}

// API Response Types
interface ApiPagination {
  limit: number
  page: number
  pages: number
  total: number
}

interface ApiResponseItem {
  _id: string
  [key: string]: unknown
}

interface ApiResponseData {
  pagination: ApiPagination
  states?: ApiResponseItem[]
  cities?: ApiResponseItem[]
  members?: ApiResponseItem[]
  [key: string]: ApiResponseItem[] | ApiPagination | undefined
}

interface ApiResponse {
  success: boolean
  data: ApiResponseData
}

export function SearchableSelect ({
  value,
  onValueChange,
  endpoint,
  labelField,
  valueField,
  placeholder = 'Select...',
  disabled = false,
  onCreate,
  queryParams,
  initialOption
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [selectedItemLabel, setSelectedItemLabel] = useState<string | null>(null)

  const getArrayKey = (endpoint: string): string => {
    const key = endpoint.replace(/^\//, '')
    return key.endsWith('s') ? key : `${key}s`
  }

  const { data, isLoading, refetch } = useQuery<ApiResponseItem[], Error>({
    queryKey: [endpoint, search, JSON.stringify(queryParams || {}), value],
    queryFn: async (): Promise<ApiResponseItem[]> => {
      const params: Record<string, unknown> = { limit: 100, ...queryParams }
      if (search.trim() !== '') params.search = search.trim()

      // Temporary workaround: backend currently forces memIsOverseas=false
      // which hides existing members. If fetching members, request
      // memIsOverseas=true so overseas members appear until backend is fixed.
      if (endpoint === '/members' && params.memIsOverseas === undefined) {
        params.memIsOverseas = 'true'
      }

      try {
        const response = await apiClient.get<ApiResponse>(endpoint, { params })

        if (!response.data.success) {
          return []
        }

        const arrayKey = getArrayKey(endpoint)
        // Support multiple possible shapes from backend:
        // - response.data.data = { members: [...] }
        // - response.data.data = { items: [...] }
        // - response.data.data = [...] (direct array)
        // - response.data = { members: [...] } (no data wrapper)
        const dataObject = response.data.data ?? response.data

        // If backend returned the array directly
        if (Array.isArray(dataObject)) {
          return dataObject as ApiResponseItem[]
        }

        const arrayFromKey = Array.isArray((dataObject as any)[arrayKey])
          ? ((dataObject as any)[arrayKey] as ApiResponseItem[])
          : undefined

        // Common alternate keys
        const arrayFromItems = Array.isArray((dataObject as any).items)
          ? ((dataObject as any).items as ApiResponseItem[])
          : undefined
        const arrayFromMembers = Array.isArray((dataObject as any).members)
          ? ((dataObject as any).members as ApiResponseItem[])
          : undefined

        const array =
          arrayFromKey ||
          arrayFromMembers ||
          arrayFromItems ||
          (Object.entries(dataObject).find(([_, value]) =>
            Array.isArray(value)
          )?.[1] as ApiResponseItem[] | undefined)

        if (!Array.isArray(array)) {
          return []
        }

        return array
      } catch {
        return []
      }
    },
    enabled: !disabled,
    retry: false
  })

  const options: Option[] = Array.isArray(data)
    ? data
        .map((item: ApiResponseItem) => {
          const rawValue =
            (item as Record<string, unknown>)[valueField] ?? item._id ?? item.id
          if (rawValue === undefined || rawValue === null) return null
          return {
            value: String(rawValue),
            label: String(
              (item as Record<string, unknown>)[labelField] ?? 'Unnamed'
            )
          }
        })
        .filter((option): option is Option => option !== null)
    : []

  // Fetch selected item details if value is set but not in current options
  useEffect(() => {
    if (!value || selectedItemLabel) return

    const selectedOption = options.find(opt => opt.value === value)
    if (selectedOption) {
      setSelectedItemLabel(selectedOption.label)
      return
    }

    // If not found in current options, fetch it directly
    const fetchSelectedItem = async () => {
      try {
        const response = await apiClient.get<ApiResponse>(
          `${endpoint}/${value}`
        )
        if (response.data.success && response.data.data) {
          const item = response.data.data as Record<string, unknown>
          const label = String(item[labelField] ?? 'Unnamed')
          setSelectedItemLabel(label)
        }
      } catch (error) {
        // If fetch fails, try to use initialOption
        if (initialOption?.value === value) {
          setSelectedItemLabel(initialOption.label)
        }
      }
    }

    fetchSelectedItem()
  }, [value, options, labelField, endpoint, initialOption])

  const selectedOption = options.find(opt => opt.value === value)
  const displayOption = selectedOption || (value && selectedItemLabel ? { value, label: selectedItemLabel } : initialOption) || null

  const handleCreate = async (data: unknown) => {
    if (!onCreate) return
    try {
      setIsCreating(true)
      const newItem = await onCreate(data)
      if (newItem) {
        const newValue = (newItem as any)[valueField] || (newItem as any)._id
        onValueChange(String(newValue))
        await refetch()
        setCreateOpen(false)
      }
    } catch (error) {
      console.error('Failed to create item:', error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className='flex gap-2 w-full'>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            aria-expanded={open}
            className={cn(
              'w-full justify-between h-10 enhanced-button hover-lift',
              'border-border bg-input hover:bg-input/80',
              'transition-all duration-200',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            disabled={disabled || isLoading}
          >
            <span className='truncate'>
              {isLoading ? (
                <span className='flex items-center gap-2 text-muted-foreground'>
                  <Loader2 className='h-3 w-3 animate-spin' />
                  Loading...
                </span>
              ) : displayOption ? (
                <span className='font-medium text-foreground'>
                  {displayOption.label}
                </span>
              ) : (
                <span className='text-muted-foreground'>{placeholder}</span>
              )}
            </span>
            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200' />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className='w-[320px] p-0 border-border shadow-xl animate-scale-in'
          align='start'
        >
          <Command className='border-none'>
            <CommandInput
              placeholder='Search...'
              value={search}
              onValueChange={setSearch}
              className='h-12 border-b border-border'
            />
            <CommandList className='max-h-[300px]'>
              {isLoading ? (
                <div className='flex items-center justify-center py-8'>
                  <Loader2 className='h-6 w-6 animate-spin text-primary' />
                </div>
              ) : options.length === 0 ? (
                <CommandEmpty className='py-6 text-center text-muted-foreground'>
                  No results found
                </CommandEmpty>
              ) : (
                <CommandGroup className='p-2'>
                  {options.map(option => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => {
                        onValueChange(option.value)
                        setOpen(false)
                        setSearch('')
                      }}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2.5 rounded-md',
                        'transition-all duration-150 hover-lift',
                        'hover:bg-accent cursor-pointer',
                        value === option.value && 'bg-primary/10 text-primary'
                      )}
                    >
                      <Check
                        className={cn(
                          'h-4 w-4 transition-opacity',
                          value === option.value ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <span className='flex-1 truncate font-medium'>
                        {option.label}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {onCreate && (
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button
              size='icon'
              variant='outline'
              disabled={disabled}
              type='button'
              className='enhanced-button hover-lift border-primary/20 hover:border-primary hover:bg-primary/5'
            >
              <Plus className='h-4 w-4' />
            </Button>
          </DialogTrigger>
          <DialogContent className='sm:max-w-[425px] border-border shadow-2xl animate-scale-in'>
            <DialogHeader className='px-6 pt-6'>
              <DialogTitle className='text-lg font-semibold text-foreground'>
                Add New Item
              </DialogTitle>
            </DialogHeader>
            <div className='p-6 pt-4'>
              <form
                onSubmit={async e => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  const name = formData.get('name') as string
                  const description = formData.get('description') as string

                  await handleCreate({
                    [labelField]: name,
                    description
                  })
                }}
                className='space-y-4'
              >
                <div className='space-y-2'>
                  <label className='block text-sm font-medium text-foreground'>
                    Name *
                  </label>
                  <input
                    name='name'
                    type='text'
                    required
                    className='enhanced-input h-11'
                    placeholder='Enter name'
                  />
                </div>
                <div className='space-y-2'>
                  <label className='block text-sm font-medium text-foreground'>
                    Description
                  </label>
                  <textarea
                    name='description'
                    className='w-full px-3 py-2.5 border border-border rounded-md enhanced-input resize-none'
                    placeholder='Enter description'
                    rows={3}
                  />
                </div>
                <div className='flex justify-end gap-3 pt-2'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => setCreateOpen(false)}
                    className='enhanced-button'
                    disabled={isCreating}
                  >
                    Cancel
                  </Button>
                  <Button
                    type='submit'
                    className='enhanced-button hover-lift bg-primary hover:bg-primary/90'
                    disabled={isCreating}
                  >
                    {isCreating && (
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    )}
                    Create
                  </Button>
                </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
