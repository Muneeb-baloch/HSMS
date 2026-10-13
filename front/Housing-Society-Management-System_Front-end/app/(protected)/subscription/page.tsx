'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import {
  useActivePackages,
  useSubscribe
} from '@/lib/hooks/entities/useSubscription'
import { useAuth } from '@/lib/hooks/useAuth'
import { formatDate } from '@/lib/utils/format'
import { customToast } from '@/lib/utils/customToast'
import {
  Check,
  CreditCard,
  ArrowLeft,
  Loader2,
  Star
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { InlineSkeleton } from '@/components/shared/PageSkeleton'
import { useConfirm } from "@/components/shared/ConfirmDialog";

const defaultPlans = [
  {
    _id: 'basic',
    name: 'Basic',
    price: 5000,
    billingCycle: 'monthly',
    features: [
      'Up to 100 Members',
      'Basic Plot Management',
      'Member Directory',
      'Email Support',
      '1 Admin User'
    ],
    recommended: false
  },
  {
    _id: 'standard',
    name: 'Standard',
    price: 12000,
    billingCycle: 'monthly',
    features: [
      'Up to 500 Members',
      'Full Plot Management',
      'Installment Tracking',
      'Complaint Management',
      'Visitor Management',
      'Priority Email Support',
      '3 Admin Users'
    ],
    recommended: true
  },
  {
    _id: 'premium',
    name: 'Premium',
    price: 25000,
    billingCycle: 'monthly',
    features: [
      'Up to 2000 Members',
      'All Standard Features',
      'Facility Booking',
      'Financial Reports',
      'Announcement System',
      'File Management',
      'Phone & Email Support',
      '10 Admin Users'
    ],
    recommended: false
  },
  {
    _id: 'enterprise',
    name: 'Enterprise',
    price: 50000,
    billingCycle: 'monthly',
    features: [
      'Unlimited Members',
      'All Premium Features',
      'Custom Integrations',
      'Dedicated Account Manager',
      'SLA Guarantee',
      'Custom Reports',
      'API Access',
      'Unlimited Admin Users',
      'White-label Option'
    ],
    recommended: false
  }
]

export default function SubscriptionPage () {
  const { user } = useAuth()
  const router = useRouter()
  const { confirm } = useConfirm();

  const currentSubscription = null as any
  const subLoading = false
  const { data: apiPlans, isLoading: plansLoading } = useActivePackages()
  const selectPlanMutation = useSubscribe()

  const canManage =
    user &&
    hasPermission(user.role as UserRole, [
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN
    ])

  // Normalize API plans to match the shape used by the template
  const plans =
    apiPlans && apiPlans.length > 0
      ? apiPlans.map((pkg: any) => ({
          ...pkg,
          name: pkg.packageName || pkg.name,
          price: pkg.monthlyPrice ?? pkg.price ?? 0,
          billingCycle: pkg.billingCycle || 'monthly',
          recommended: pkg.isPopular ?? pkg.recommended ?? false,
          features: Array.isArray(pkg.features)
            ? pkg.features
            : pkg.features && typeof pkg.features === 'object'
              ? [
                  ...(pkg.features.maxMembers ? [`Up to ${pkg.features.maxMembers} Members`] : []),
                  ...(pkg.features.maxPlots ? [`Up to ${pkg.features.maxPlots} Plots`] : []),
                  ...(pkg.features.maxStaff ? [`Up to ${pkg.features.maxStaff} Staff`] : []),
                  ...(pkg.features.storageGB ? [`${pkg.features.storageGB} GB Storage`] : []),
                  ...(pkg.features.visitorManagement ? ['Visitor Management'] : []),
                  ...(pkg.features.facilityBooking ? ['Facility Booking'] : []),
                  ...(pkg.features.advancedReporting ? ['Advanced Reporting'] : []),
                  ...(pkg.features.customBranding ? ['Custom Branding'] : []),
                  ...(pkg.features.apiAccess ? ['API Access'] : []),
                  ...(pkg.features.supportLevel ? [`${pkg.features.supportLevel.charAt(0).toUpperCase() + pkg.features.supportLevel.slice(1)} Support`] : []),
                  ...(pkg.features.modules?.length ? pkg.features.modules.map((m: string) => m.replace(/([A-Z])/g, ' $1').trim()) : []),
                ]
              : [],
        }))
      : defaultPlans

  const isLoading = subLoading || plansLoading

  const handleSelectPlan = async (planId: string) => {
    if (!canManage) {
      customToast.error(
        'You do not have permission to change subscription plans'
      )
      return
    }

    const plan = plans.find((p: any) => p._id === planId) as any
    if (!plan) return

    const planName = plan.name || plan.packageName || 'Selected'
    const action = currentSubscription?.planId
      ? 'switch to'
      : 'subscribe to'

    if (
      await confirm({ title: "Confirm", description: `Are you sure you want to ${action} the ${planName} plan?` })
    ) {
      try {
        await selectPlanMutation.mutateAsync({
          packageId: planId,
          societyId: user?.societyId || '',
          billingCycle: 'monthly' as const
        })
        customToast.success(`Successfully subscribed to ${planName} plan`)
      } catch {
        customToast.error('Failed to update subscription')
      }
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
    }).format(amount || 0)
  }

  const currentPlanId =
    currentSubscription?.planId?._id || currentSubscription?.planId

  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
      <div>
        <Button
          variant='ghost'
          onClick={() => router.back()}
          className='mb-4'
        >
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back
        </Button>
        <h1 className='text-2xl font-bold'>Subscription & Plans</h1>
        <p className='text-muted-foreground'>
          Manage your subscription and explore available plans
        </p>
      </div>

      {/* Current Subscription */}
      {currentSubscription && (
        <Card className='border-2 border-primary/20'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <CreditCard className='h-5 w-5' />
              Current Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
              <div>
                <p className='text-sm text-muted-foreground'>Plan</p>
                <p className='text-lg font-bold'>
                  {currentSubscription.planName ||
                    (typeof currentSubscription.planId === 'object'
                      ? currentSubscription.planId.name
                      : 'N/A')}
                </p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Status</p>
                <Badge
                  variant={
                    currentSubscription.status === 'active'
                      ? 'success'
                      : currentSubscription.status === 'trial'
                        ? 'warning'
                        : 'destructive'
                  }
                >
                  {currentSubscription.status?.toUpperCase()}
                </Badge>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Start Date</p>
                <p className='font-medium'>
                  {formatDate(currentSubscription.startDate)}
                </p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Expires</p>
                <p className='font-medium'>
                  {formatDate(currentSubscription.endDate)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plans Grid */}
      <div>
        <h2 className='text-xl font-semibold mb-4'>Available Plans</h2>

        {isLoading ? (
            <InlineSkeleton />
          ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {plans.map((plan: any) => {
              const isCurrentPlan = currentPlanId === plan._id
              const isRecommended = plan.recommended

              return (
                <Card
                  key={plan._id}
                  className={`relative flex flex-col transition-all hover:shadow-lg ${
                    isCurrentPlan
                      ? 'border-2 border-primary ring-2 ring-primary/20'
                      : isRecommended
                        ? 'border-2 border-blue-500'
                        : ''
                  }`}
                >
                  {isRecommended && (
                    <div className='absolute -top-3 left-1/2 -translate-x-1/2'>
                      <Badge className='bg-blue-500 text-white flex items-center gap-1'>
                        <Star className='h-3 w-3' />
                        Recommended
                      </Badge>
                    </div>
                  )}
                  {isCurrentPlan && (
                    <div className='absolute -top-3 right-4'>
                      <Badge variant='success'>Current Plan</Badge>
                    </div>
                  )}

                  <CardHeader className='text-center pb-2 pt-6'>
                    <CardTitle className='text-xl'>{plan.name}</CardTitle>
                    <div className='mt-2'>
                      <span className='text-3xl font-bold'>
                        {formatCurrency(plan.price)}
                      </span>
                      <span className='text-muted-foreground text-sm'>
                        /{plan.billingCycle || 'month'}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className='flex-1 flex flex-col'>
                    <ul className='space-y-2 flex-1 mb-6'>
                      {(plan.features || []).map(
                        (feature: string, idx: number) => (
                          <li
                            key={idx}
                            className='flex items-start gap-2 text-sm'
                          >
                            <Check className='h-4 w-4 text-green-500 mt-0.5 flex-shrink-0' />
                            <span>{feature}</span>
                          </li>
                        )
                      )}
                    </ul>

                    {canManage && (
                      <Button
                        className='w-full'
                        variant={
                          isCurrentPlan
                            ? 'outline'
                            : isRecommended
                              ? 'default'
                              : 'outline'
                        }
                        disabled={
                          isCurrentPlan || selectPlanMutation.isPending
                        }
                        onClick={() => handleSelectPlan(plan._id)}
                      >
                        {isCurrentPlan
                          ? 'Current Plan'
                          : currentPlanId
                            ? 'Switch Plan'
                            : 'Select Plan'}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Info */}
      <Card>
        <CardContent className='pt-6'>
          <p className='text-sm text-muted-foreground text-center'>
            All plans include SSL security, daily backups, and 99.9% uptime
            guarantee. For custom enterprise solutions, please contact our
            sales team.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
