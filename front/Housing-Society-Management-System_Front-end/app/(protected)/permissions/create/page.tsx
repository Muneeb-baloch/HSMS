'use client'

import { useToast } from '@/components/context/ToastContext'
import { PermissionForm } from '@/components/permissions/PermissionForm'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { usePermissionForm } from '@/lib/hooks/usePermissions'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function CreatePermissionPage () {
  const router = useRouter()
  const { showToast } = useToast()
  const [modules, setModules] = useState<any[]>([])
  const [roles, setRoles] = useState<any[]>([])
  const [success, setSuccess] = useState(false)
  const { createPermission, isCreating } = usePermissionForm()

  const handleSuccess = async (formData: any) => {
    const result = await createPermission(formData)
    if (result?.success) {
      setSuccess(true)
      showToast('Permission created successfully!', 'success')
      setTimeout(() => {
        router.push('/permissions')
      }, 2000)
    } else if (result) {
      showToast(result.error || 'Failed to create permission', 'error')
    }
  }

  return (
    <div className='space-y-6 p-4 sm:p-6 md:p-8'>
      <div className='flex items-center gap-4'>
        <Link href='/permissions'>
          <Button variant='ghost' size='icon'>
            <ArrowLeft className='w-4 h-4' />
          </Button>
        </Link>
        <div>
          <h1 className='text-3xl font-bold'>Create Permission</h1>
          <p className='text-gray-600 mt-1'>
            Set up a new permission for a role and module
          </p>
        </div>
      </div>

      {success && (
        <Alert className='bg-green-50 text-green-900 border-green-200'>
          <CheckCircle className='h-4 w-4' />
          <AlertDescription>
            Permission created successfully! Redirecting...
          </AlertDescription>
        </Alert>
      )}

      <div className='grid gap-6 lg:grid-cols-3'>
        <div className='lg:col-span-2'>
          <PermissionForm
            modules={modules}
            roles={roles}
            onSuccess={handleSuccess}
          />
        </div>

        <div className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='text-sm'>About Permissions</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 text-sm'>
              <div>
                <p className='font-semibold mb-1'>Read</p>
                <p className='text-gray-600'>View and access the module</p>
              </div>
              <div>
                <p className='font-semibold mb-1'>Create</p>
                <p className='text-gray-600'>Create new items in the module</p>
              </div>
              <div>
                <p className='font-semibold mb-1'>Update</p>
                <p className='text-gray-600'>Edit existing items</p>
              </div>
              <div>
                <p className='font-semibold mb-1'>Delete</p>
                <p className='text-gray-600'>Remove items from the module</p>
              </div>
              <div>
                <p className='font-semibold mb-1'>Export</p>
                <p className='text-gray-600'>Export data from the module</p>
              </div>
              <div>
                <p className='font-semibold mb-1'>Import</p>
                <p className='text-gray-600'>Import data to the module</p>
              </div>
              <div>
                <p className='font-semibold mb-1'>Approve</p>
                <p className='text-gray-600'>Approve pending items</p>
              </div>
              <div>
                <p className='font-semibold mb-1'>Verify</p>
                <p className='text-gray-600'>Verify item validity</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-sm'>Access Levels</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2 text-sm'>
              <div>
                <p className='font-semibold text-green-700'>Full Access</p>
                <p className='text-gray-600'>Read + Create + Update + Delete</p>
              </div>
              <div>
                <p className='font-semibold text-blue-700'>Limited Access</p>
                <p className='text-gray-600'>
                  Read + (Create or Update or Delete)
                </p>
              </div>
              <div>
                <p className='font-semibold text-yellow-700'>View Only</p>
                <p className='text-gray-600'>Read only</p>
              </div>
              <div>
                <p className='font-semibold text-gray-700'>No Access</p>
                <p className='text-gray-600'>Cannot access</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
