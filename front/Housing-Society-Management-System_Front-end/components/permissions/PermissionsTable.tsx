// components/permissions/PermissionsTable.tsx
'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { UserPermission } from '@/lib/types/permissions'
import { Edit, Eye, Trash2 } from 'lucide-react'

interface PermissionsTableProps {
  permissions: UserPermission[]
  isLoading: boolean
  onView: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  selectedPermissions: string[]
  onSelectionChange: (ids: string[]) => void
}

export function PermissionsTable ({
  permissions,
  isLoading,
  onView,
  onEdit,
  onDelete,
  selectedPermissions,
  onSelectionChange
}: PermissionsTableProps) {
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(permissions.map(p => p._id))
    } else {
      onSelectionChange([])
    }
  }

  const handleSelectPermission = (id: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedPermissions, id])
    } else {
      onSelectionChange(selectedPermissions.filter(pId => pId !== id))
    }
  }

  if (isLoading) {
    return (
      <Card className='p-6'>
        <div className='space-y-4'>
          {[...Array(5)].map((_, i) => (
            <div key={i} className='h-12 animate-pulse rounded bg-muted' />
          ))}
        </div>
      </Card>
    )
  }

  if (!permissions || permissions.length === 0) {
    return (
      <Card className='p-12'>
        <div className='text-center'>
          <p className='text-muted-foreground'>No permissions found</p>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-12'>
              <input
                type='checkbox'
                checked={
                  selectedPermissions.length === permissions.length &&
                  permissions.length > 0
                }
                onChange={e => handleSelectAll(e.target.checked)}
                className='cursor-pointer'
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Module</TableHead>
            <TableHead>Resource</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {permissions.map(permission => (
            <TableRow key={permission._id}>
              <TableCell>
                <input
                  type='checkbox'
                  checked={selectedPermissions.includes(permission._id)}
                  onChange={e =>
                    handleSelectPermission(permission._id, e.target.checked)
                  }
                  className='cursor-pointer'
                />
              </TableCell>
              <TableCell className='font-medium'>{permission.name}</TableCell>
              <TableCell>{permission.module || '-'}</TableCell>
              <TableCell>
                <code className='rounded bg-muted px-2 py-1 text-xs'>
                  {permission.resource}
                </code>
              </TableCell>
              <TableCell>
                <Badge variant='outline'>{permission.action}</Badge>
              </TableCell>
              <TableCell className='max-w-xs truncate'>
                {permission.description || '-'}
              </TableCell>
              <TableCell>
                <Badge variant={permission.isActive ? 'default' : 'secondary'}>
                  {permission.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell className='text-right'>
                <div className='flex justify-end gap-2'>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => onView(permission._id)}
                  >
                    <Eye className='h-4 w-4' />
                  </Button>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => onEdit(permission._id)}
                  >
                    <Edit className='h-4 w-4' />
                  </Button>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => onDelete(permission._id)}
                  >
                    <Trash2 className='h-4 w-4 text-destructive' />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
