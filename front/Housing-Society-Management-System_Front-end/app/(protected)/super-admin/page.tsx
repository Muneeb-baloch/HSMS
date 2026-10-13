'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import { usePlatformOverview } from '@/lib/hooks/entities/useSuperAdmin'
import { useAuth } from '@/lib/hooks/useAuth'
import {
  Building2,
  CreditCard,
  Users,
  DollarSign,
  ArrowRight,
  ArrowLeft,
  Activity,
  BarChart3,
  UserCog,
  Shield
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SuperAdminPage () {
  const { user } = useAuth()
  const router = useRouter()
  const { data: overview, isLoading } = usePlatformOverview()

  const canAccess =
    user &&
    hasPermission(user.role as UserRole, [UserRole.SUPER_ADMIN])

  if (!canAccess) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-muted-foreground mb-4'>
              You don&apos;t have permission to access the super admin
              dashboard.
            </p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
    }).format(amount || 0)
  }

  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-2xl font-bold'>Platform Overview</h1>
        <p className='text-muted-foreground'>
          Super admin dashboard - manage all societies and subscriptions
        </p>
      </div>

      {/* KPI Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
              <Building2 className='h-4 w-4' />
              Total Societies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold'>
              {isLoading ? '...' : overview?.totalSocieties || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
              <CreditCard className='h-4 w-4' />
              Active Subscriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold text-green-600'>
              {isLoading ? '...' : overview?.activeSocieties || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
              <Users className='h-4 w-4' />
              Total Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold text-blue-600'>
              {isLoading ? '...' : overview?.totalMembers || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
              <DollarSign className='h-4 w-4' />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {isLoading
                ? '...'
                : formatCurrency(overview?.totalRevenue || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Recent Societies */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between'>
            <CardTitle>Recent Societies</CardTitle>
            <Button variant='ghost' size='sm' asChild>
              <Link href='/super-admin/societies'>
                View All
                <ArrowRight className='ml-1 h-4 w-4' />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className='space-y-3'>
                {[1, 2, 3].map(i => (
                  <div
                    key={i}
                    className='h-12 bg-muted rounded animate-pulse'
                  />
                ))}
              </div>
            ) : (
              <p className='text-muted-foreground text-center py-4'>
                View all societies from the Manage Societies page.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Subscription Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className='space-y-4'>
                {[1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    className='h-8 bg-muted rounded animate-pulse'
                  />
                ))}
              </div>
            ) : overview?.subscriptionsByPlan &&
              Object.keys(overview.subscriptionsByPlan).length > 0 ? (
              <div className='space-y-4'>
                {Object.entries(overview.subscriptionsByPlan).map(
                  ([plan, count], index) => {
                    const total = overview.totalSocieties || 1
                    const percentage = Math.round(
                      ((count as number) / total) * 100
                    )
                    const colors = [
                      'bg-blue-500',
                      'bg-green-500',
                      'bg-purple-500',
                      'bg-orange-500',
                      'bg-pink-500'
                    ]
                    return (
                      <div key={plan}>
                        <div className='flex items-center justify-between mb-1'>
                          <span className='text-sm font-medium'>
                            {plan}
                          </span>
                          <span className='text-sm text-muted-foreground'>
                            {count as number} ({percentage}%)
                          </span>
                        </div>
                        <div className='w-full bg-muted rounded-full h-2'>
                          <div
                            className={`${colors[index % colors.length]} h-2 rounded-full transition-all`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  }
                )}
              </div>
            ) : (
              <p className='text-muted-foreground text-center py-4'>
                No subscription data available
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <Button
              variant='outline'
              className='h-auto py-4 flex flex-col items-center gap-2'
              asChild
            >
              <Link href='/super-admin/societies'>
                <Building2 className='h-6 w-6' />
                <span>Manage Societies</span>
              </Link>
            </Button>
            <Button
              variant='outline'
              className='h-auto py-4 flex flex-col items-center gap-2'
              asChild
            >
              <Link href='/subscription'>
                <CreditCard className='h-6 w-6' />
                <span>Subscription Plans</span>
              </Link>
            </Button>
            <Button
              variant='outline'
              className='h-auto py-4 flex flex-col items-center gap-2'
              asChild
            >
              <Link href='/super-admin/societies/create'>
                <Building2 className='h-6 w-6' />
                <span>Create Society</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
