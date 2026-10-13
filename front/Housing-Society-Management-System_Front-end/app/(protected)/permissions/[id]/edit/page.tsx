'use client'

import { useToast } from '@/components/context/ToastContext'
import { PermissionForm } from '@/components/permissions/PermissionForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  useDeletePermission,
  usePermission,
  usePermissionForm
} from '@/lib/hooks/usePermissions'
import { ArrowLeft, Loader, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FormPageSkeleton } from '@/components/shared/PageSkeleton'

export default function EditPermissionPage () {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const { showToast } = useToast()
  const [modules, setModules] = useState<any[]>([])
  const [roles, setRoles] = useState<any[]>([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const { data: permission, isLoading, error, fetchPermission } = usePermission(params.id ?? null)
  const { updatePermission, isUpdating } = usePermissionForm()
  const { deletePermission, isDeleting } = useDeletePermission()

  useEffect(() => {
    fetchPermission()
  }, [params.id, fetchPermission])

  const handleUpdate = async (formData: any) => {
    const result = await updatePermission(params.id!, formData)
    if (result?.success) {
      showToast('Permission updated successfully!', 'success')
      setTimeout(() => {
        router.push('/permissions')
      }, 1500)
    } else if (result) {
      showToast(result.error || 'Failed to update permission', 'error')
    }
  }

  const handleDelete = async () => {
    const result = await deletePermission(params.id!)
    if (result?.success) {
      showToast('Permission deleted successfully!', 'success')
      setTimeout(() => {
        router.push('/permissions')
      }, 1500)
    } else if (result) {
      showToast(result.error || 'Failed to delete permission', 'error')
    }
  }

  if (isLoading) {
    return <FormPageSkeleton />
  }

  if (error || !permission) {
    return (
      <div className='space-y-4 p-4 sm:p-6 md:p-8'>
        <Link href='/permissions'>
          <Button variant='ghost' size='icon'>
            <ArrowLeft className='w-4 h-4' />
          </Button>
        </Link>
        <Card>
          <CardContent className='pt-6'>
            <p className='text-red-600'>{error || 'Permission not found'}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='space-y-6 p-4 sm:p-6 md:p-8'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Link href='/permissions'>
            <Button variant='ghost' size='icon'>
              <ArrowLeft className='w-4 h-4' />
            </Button>
          </Link>
          <div>
            <h1 className='text-3xl font-bold'>Edit Permission</h1>
            <p className='text-gray-600 mt-1'>Update permission details</p>
          </div>
        </div>
        <Button
          variant='destructive'
          onClick={() => setShowDeleteConfirm(true)}
          disabled={isDeleting}
        >
          <Trash2 className='mr-2 h-4 w-4' />
          Delete
        </Button>
      </div>

      {showDeleteConfirm && (
        <Card className='bg-red-50 border-red-200 p-4'>
          <div className='flex items-center justify-between'>
            <p className='text-red-900'>
              Are you sure you want to delete this permission?
            </p>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant='destructive'
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className='grid gap-6 lg:grid-cols-3'>
        <div className='lg:col-span-2'>
          <PermissionForm
            initialData={permission}
            modules={modules}
            roles={roles}
            isUpdate={true}
            onSuccess={handleUpdate}
          />
        </div>

        <Card>
          <CardContent className='pt-6 space-y-4 text-sm'>
            <div>
              <p className='text-gray-600 text-xs font-medium'>MODULE</p>
              <p className='font-semibold text-gray-900'>
                {typeof permission.srModuleId === 'string'
                  ? permission.moduleName
                  : permission.srModuleId?.moduleName}
              </p>
            </div>
            <div>
              <p className='text-gray-600 text-xs font-medium'>ROLE</p>
              <p className='font-semibold text-gray-900'>
                {typeof permission.roleId === 'string'
                  ? 'Unknown'
                  : permission.roleId?.roleName}
              </p>
            </div>
            <div className='pt-4 border-t'>
              <p className='text-gray-600 text-xs font-medium'>CREATED</p>
              <p className='font-semibold text-gray-900'>
                {new Date(permission.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className='text-gray-600 text-xs font-medium'>UPDATED</p>
              <p className='font-semibold text-gray-900'>
                {new Date(permission.updatedAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className='text-gray-600 text-xs font-medium'>STATUS</p>
              <span
                className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                  permission.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {permission.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
