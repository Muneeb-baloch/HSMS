// components/permissions/PermissionForm.tsx
'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  CreateUserPermissionDto,
  UserPermission
} from '@/lib/types/permissions'
import { Loader } from 'lucide-react'
import { useEffect, useState } from 'react'

interface PermissionFormProps {
  initialData?: UserPermission
  modules: Array<{ _id: string; moduleName: string }>
  roles: Array<{ _id: string; roleName: string }>
  isUpdate?: boolean
  onSuccess: (data: CreateUserPermissionDto) => void
}

export function PermissionForm ({
  initialData,
  modules,
  roles,
  isUpdate = false,
  onSuccess
}: PermissionFormProps) {
  const [formData, setFormData] = useState<CreateUserPermissionDto>({
    srModuleId: '',
    roleId: '',
    moduleName: '',
    canRead: false,
    canCreate: false,
    canUpdate: false,
    canDelete: false,
    canExport: false,
    canImport: false,
    canApprove: false,
    canVerify: false,
    isActive: true
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (initialData) {
      setFormData({
        srModuleId:
          typeof initialData.srModuleId === 'string'
            ? initialData.srModuleId
            : initialData.srModuleId._id,
        roleId:
          typeof initialData.roleId === 'string'
            ? initialData.roleId
            : initialData.roleId._id,
        moduleName: initialData.moduleName || '',
        canRead: initialData.canRead,
        canCreate: initialData.canCreate,
        canUpdate: initialData.canUpdate,
        canDelete: initialData.canDelete,
        canExport: initialData.canExport || false,
        canImport: initialData.canImport || false,
        canApprove: initialData.canApprove || false,
        canVerify: initialData.canVerify || false,
        isActive: initialData.isActive
      })
    }
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSuccess(formData)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCheckboxChange = (field: keyof CreateUserPermissionDto) => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>
            {isUpdate ? 'Update Permission' : 'Create New Permission'}
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Module Selection */}
          <div className='space-y-2'>
            <Label htmlFor='srModuleId'>
              Module <span className='text-red-500'>*</span>
            </Label>
            <Select
              value={formData.srModuleId}
              onValueChange={value =>
                setFormData(prev => ({ ...prev, srModuleId: value }))
              }
              disabled={isUpdate}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select a module' />
              </SelectTrigger>
              <SelectContent>
                {modules.map(module => (
                  <SelectItem key={module._id} value={module._id}>
                    {module.moduleName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Role Selection */}
          <div className='space-y-2'>
            <Label htmlFor='roleId'>
              Role <span className='text-red-500'>*</span>
            </Label>
            <Select
              value={formData.roleId}
              onValueChange={value =>
                setFormData(prev => ({ ...prev, roleId: value }))
              }
              disabled={isUpdate}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select a role' />
              </SelectTrigger>
              <SelectContent>
                {roles.map(role => (
                  <SelectItem key={role._id} value={role._id}>
                    {role.roleName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Module Name (Optional) */}
          <div className='space-y-2'>
            <Label htmlFor='moduleName'>Module Name (Optional)</Label>
            <Input
              id='moduleName'
              value={formData.moduleName || ''}
              onChange={e =>
                setFormData(prev => ({ ...prev, moduleName: e.target.value }))
              }
              placeholder='Custom module name'
            />
          </div>

          {/* Permissions Section */}
          <div className='space-y-4'>
            <Label className='text-base font-semibold'>Permissions</Label>

            {/* Basic Permissions */}
            <div className='grid grid-cols-2 gap-4'>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='canRead'
                  checked={formData.canRead}
                  onCheckedChange={() => handleCheckboxChange('canRead')}
                />
                <Label htmlFor='canRead' className='cursor-pointer'>
                  Can Read
                </Label>
              </div>

              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='canCreate'
                  checked={formData.canCreate}
                  onCheckedChange={() => handleCheckboxChange('canCreate')}
                />
                <Label htmlFor='canCreate' className='cursor-pointer'>
                  Can Create
                </Label>
              </div>

              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='canUpdate'
                  checked={formData.canUpdate}
                  onCheckedChange={() => handleCheckboxChange('canUpdate')}
                />
                <Label htmlFor='canUpdate' className='cursor-pointer'>
                  Can Update
                </Label>
              </div>

              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='canDelete'
                  checked={formData.canDelete}
                  onCheckedChange={() => handleCheckboxChange('canDelete')}
                />
                <Label htmlFor='canDelete' className='cursor-pointer'>
                  Can Delete
                </Label>
              </div>
            </div>

            {/* Advanced Permissions */}
            <div className='grid grid-cols-2 gap-4'>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='canExport'
                  checked={formData.canExport}
                  onCheckedChange={() => handleCheckboxChange('canExport')}
                />
                <Label htmlFor='canExport' className='cursor-pointer'>
                  Can Export
                </Label>
              </div>

              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='canImport'
                  checked={formData.canImport}
                  onCheckedChange={() => handleCheckboxChange('canImport')}
                />
                <Label htmlFor='canImport' className='cursor-pointer'>
                  Can Import
                </Label>
              </div>

              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='canApprove'
                  checked={formData.canApprove}
                  onCheckedChange={() => handleCheckboxChange('canApprove')}
                />
                <Label htmlFor='canApprove' className='cursor-pointer'>
                  Can Approve
                </Label>
              </div>

              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='canVerify'
                  checked={formData.canVerify}
                  onCheckedChange={() => handleCheckboxChange('canVerify')}
                />
                <Label htmlFor='canVerify' className='cursor-pointer'>
                  Can Verify
                </Label>
              </div>
            </div>
          </div>

          {/* Active Status */}
          <div className='flex items-center space-x-2'>
            <Checkbox
              id='isActive'
              checked={formData.isActive}
              onCheckedChange={() => handleCheckboxChange('isActive')}
            />
            <Label htmlFor='isActive' className='cursor-pointer'>
              Active
            </Label>
          </div>

          {/* Submit Button */}
          <div className='flex justify-end gap-2'>
            <Button
              type='submit'
              disabled={
                isSubmitting || !formData.srModuleId || !formData.roleId
              }
            >
              {isSubmitting && <Loader className='mr-2 h-4 w-4 animate-spin' />}
              {isUpdate ? 'Update Permission' : 'Create Permission'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
