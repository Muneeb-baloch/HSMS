// components/permissions/PermissionFilters.tsx
'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { UserPermissionQueryParams } from '@/lib/types/permissions'
import { X } from 'lucide-react'

interface PermissionFiltersProps {
  filters: UserPermissionQueryParams
  onFiltersChange: (filters: Partial<UserPermissionQueryParams>) => void
  onReset: () => void
  modules: Array<{ _id: string; name: string }>
  roles: Array<{ _id: string; name: string }>
}

export function PermissionFilters ({
  filters,
  onFiltersChange,
  onReset,
  modules,
  roles
}: PermissionFiltersProps) {
  const hasActiveFilters =
    filters.search || filters.srModuleId || filters.roleId

  const handleModuleChange = (value: string) => {
    onFiltersChange({
      srModuleId: value === 'all' ? undefined : value,
      page: 1
    })
  }

  const handleRoleChange = (value: string) => {
    onFiltersChange({
      roleId: value === 'all' ? undefined : value,
      page: 1
    })
  }

  return (
    <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
      <div className='flex flex-1 flex-col gap-4 md:flex-row md:items-center'>
        {/* Search */}
        <div className='flex-1'>
          <Input
            placeholder='Search permissions...'
            value={filters.search || ''}
            onChange={e => onFiltersChange({ search: e.target.value, page: 1 })}
            className='max-w-sm'
          />
        </div>

        {/* Module Filter */}
        <Select
          value={filters.srModuleId || 'all'}
          onValueChange={handleModuleChange}
        >
          <SelectTrigger className='w-full md:w-[200px]'>
            <SelectValue placeholder='All Modules' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Modules</SelectItem>
            {modules.map(module => (
              <SelectItem key={module._id} value={module._id}>
                {module.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Role Filter */}
        <Select
          value={filters.roleId || 'all'}
          onValueChange={handleRoleChange}
        >
          <SelectTrigger className='w-full md:w-[200px]'>
            <SelectValue placeholder='All Roles' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Roles</SelectItem>
            {roles.map(role => (
              <SelectItem key={role._id} value={role._id}>
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Reset Button */}
      {hasActiveFilters && (
        <Button variant='outline' size='sm' onClick={onReset}>
          <X className='mr-2 h-4 w-4' />
          Clear Filters
        </Button>
      )}
    </div>
  )
}
