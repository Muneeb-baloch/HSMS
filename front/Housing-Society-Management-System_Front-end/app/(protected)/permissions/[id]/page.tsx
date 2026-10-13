'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { usePermission } from '@/lib/hooks/usePermissions'
import { ArrowLeft, Edit2, Loader } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { DetailPageSkeleton } from '@/components/shared/PageSkeleton'

export default function PermissionDetailPage () {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const { data: permission, isLoading, error, fetchPermission } = usePermission(params.id ?? null)

  useEffect(() => {
    fetchPermission()
  }, [params.id, fetchPermission])

  if (isLoading) {
    return <DetailPageSkeleton />
  }

  if (error || !permission) {
    return (
      <div className='space-y-4 p-4 sm:p-6 md:p-8'>
        <Link href='/permissions'>
          <Button variant='ghost' size='icon'>
            <ArrowLeft className='w-4 h-4' />
          </Button>
        </Link>
        <Card className='bg-red-50 border-red-200'>
          <CardContent className='pt-6'>
            <p className='text-red-600'>{error || 'Permission not found'}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='space-y-6 p-4 sm:p-6 md:p-8'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Link href='/permissions'>
            <Button variant='ghost' size='icon'>
              <ArrowLeft className='w-4 h-4' />
            </Button>
          </Link>
          <div>
            <h1 className='text-3xl font-bold'>Permission Details</h1>
            <p className='text-gray-600 mt-1'>View permission information</p>
          </div>
        </div>
        <Button onClick={() => router.push(`/permissions/${params.id}/edit`)}>
          <Edit2 className='mr-2 h-4 w-4' />
          Edit
        </Button>
      </div>

      {/* Main Content */}
      <div className='grid gap-6 lg:grid-cols-3'>
        {/* Details Cards */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <p className='text-sm text-gray-600 mb-1'>Module</p>
                <p className='text-lg font-semibold'>
                  {typeof permission.srModuleId === 'string'
                    ? permission.moduleName
                    : permission.srModuleId?.moduleName}
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-600 mb-1'>Role</p>
                <p className='text-lg font-semibold'>
                  {typeof permission.roleId === 'string'
                    ? 'Unknown'
                    : permission.roleId?.roleName}
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-600 mb-1'>Status</p>
                <Badge variant={permission.isActive ? 'default' : 'secondary'}>
                  {permission.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Permissions */}
          <Card>
            <CardHeader>
              <CardTitle>Granted Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
                {[
                  { key: 'canRead', label: 'Read' },
                  { key: 'canCreate', label: 'Create' },
                  { key: 'canUpdate', label: 'Update' },
                  { key: 'canDelete', label: 'Delete' },
                  { key: 'canExport', label: 'Export' },
                  { key: 'canImport', label: 'Import' },
                  { key: 'canApprove', label: 'Approve' },
                  { key: 'canVerify', label: 'Verify' }
                ].map(({ key, label }) => (
                  <div
                    key={key}
                    className={`flex items-center gap-2 p-2 rounded border ${
                      (permission as any)[key]
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <input
                      type='checkbox'
                      checked={(permission as any)[key] || false}
                      disabled
                      className='enhanced-input h-11 rounded'
                    />
                    <span className='text-sm font-medium'>{label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <p className='text-sm text-gray-600 mb-1'>Created At</p>
                <p className='font-semibold'>
                  {new Date(permission.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-600 mb-1'>Updated At</p>
                <p className='font-semibold'>
                  {new Date(permission.updatedAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-600 mb-1'>ID</p>
                <p className='font-mono text-xs break-all'>{permission._id}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 text-sm'>
              <div className='flex justify-between items-center'>
                <span className='text-gray-600'>Total Permissions</span>
                <span className='font-semibold text-lg'>8</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-gray-600'>Granted</span>
                <span className='font-semibold text-lg text-green-600'>
                  {
                    Object.entries(permission).filter(
                      ([key, value]) =>
                        (key.startsWith('can') || key.startsWith('has')) &&
                        value === true
                    ).length
                  }
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-gray-600'>Status</span>
                <Badge variant={permission.isActive ? 'default' : 'secondary'}>
                  {permission.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                className='w-full'
                onClick={() => router.push(`/permissions/${params.id}/edit`)}
              >
                <Edit2 className='mr-2 h-4 w-4' />
                Edit Permission
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
