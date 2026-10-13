// src/app/(dashboard)/userstaff/activity/page.tsx
'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Calendar, Clock, Search, User } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function UserStaffActivityPage () {
  const router = useRouter()

  // This would be fetched from an API
  const recentActivities = [
    {
      id: 1,
      user: 'admin_user',
      action: 'Login',
      description: 'Successful login',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
      ip: '192.168.1.100'
    },
    {
      id: 2,
      user: 'john_doe',
      action: 'Password Reset',
      description: 'Password reset requested',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      ip: '192.168.1.101'
    },
    {
      id: 3,
      user: 'jane_smith',
      action: 'Profile Update',
      description: 'Updated personal information',
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
      ip: '192.168.1.102'
    },
    {
      id: 4,
      user: 'admin_user',
      action: 'User Creation',
      description: 'Created new user: mike_jones',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
      ip: '192.168.1.100'
    },
    {
      id: 5,
      user: 'system',
      action: 'Role Assignment',
      description: 'Assigned Admin role to john_doe',
      timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
      ip: '192.168.1.1'
    }
  ]

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const past = new Date(timestamp)
    const diffMs = now.getTime() - past.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    return `${diffDays} days ago`
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'Login':
        return 'bg-green-100 text-green-800'
      case 'Password Reset':
        return 'bg-yellow-100 text-yellow-800'
      case 'Profile Update':
        return 'bg-blue-100 text-blue-800'
      case 'User Creation':
        return 'bg-purple-100 text-purple-800'
      case 'Role Assignment':
        return 'bg-indigo-100 text-indigo-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className='space-y-1'>
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-2'>
          <Button variant='ghost' size='sm' onClick={() => router.back()}>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back
          </Button>
        </div>
      </div>

      <div>
        <h1 className='text-2xl font-bold mb-2'>User Activity Log</h1>
        <p className='text-muted-foreground mb-6'>
          Monitor user activities and system access
        </p>
      </div>

      {/* Filters */}
      <Card className='mb-6'>
        <CardContent className='pt-6'>
          <div className='flex flex-col md:flex-row gap-4'>
            <div className='flex-1'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <input
                  type='text'
                  placeholder='Search activities...'
                  className='pl-10 w-full p-2 border rounded-md'
                />
              </div>
            </div>
            <div className='flex gap-2'>
              <Button variant='outline' size='sm'>
                <Calendar className='mr-2 h-4 w-4' />
                Date Range
              </Button>
              <Button variant='outline' size='sm'>
                <User className='mr-2 h-4 w-4' />
                Filter by User
              </Button>
              <Button variant='outline' size='sm'>
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {recentActivities.map(activity => (
              <div
                key={activity.id}
                className='flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors'
              >
                <div className='p-2 bg-gray-100 rounded-lg'>
                  <User className='h-5 w-5 text-gray-600' />
                </div>
                <div className='flex-1'>
                  <div className='flex items-center justify-between mb-2'>
                    <div className='flex items-center gap-2'>
                      <span className='font-medium'>{activity.user}</span>
                      <Badge className={getActionColor(activity.action)}>
                        {activity.action}
                      </Badge>
                    </div>
                    <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                      <Clock className='h-3 w-3' />
                      {formatTimeAgo(activity.timestamp)}
                    </div>
                  </div>
                  <p className='text-gray-600'>{activity.description}</p>
                  <div className='mt-2 text-sm text-muted-foreground'>
                    IP: {activity.ip}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className='mt-6 flex items-center justify-between'>
            <div className='text-sm text-muted-foreground'>
              Showing 1-5 of 128 activities
            </div>
            <div className='flex gap-2'>
              <Button variant='outline' size='sm' disabled>
                Previous
              </Button>
              <Button
                variant='outline'
                size='sm'
                className='bg-primary text-primary-foreground'
              >
                1
              </Button>
              <Button variant='outline' size='sm'>
                2
              </Button>
              <Button variant='outline' size='sm'>
                3
              </Button>
              <Button variant='outline' size='sm'>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
