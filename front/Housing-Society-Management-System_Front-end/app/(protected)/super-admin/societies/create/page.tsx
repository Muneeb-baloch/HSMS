'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import {
  useCreateSociety,
  useSubscriptionPlans,
} from '@/lib/hooks/entities/useSuperAdmin'
import { useAuth } from '@/lib/hooks/useAuth'
import { CreateSocietyPayload } from '@/lib/types/superAdmin'
import { ArrowLeft, Building2, Loader2, UserPlus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function CreateSocietyPage() {
  const { user } = useAuth()
  const router = useRouter()
  const createMutation = useCreateSociety()
  const { data: plans, isLoading: plansLoading } = useSubscriptionPlans()

  const [form, setForm] = useState<CreateSocietyPayload>({
    societyName: '',
    address: '',
    contactEmail: '',
    contactPhone: '',
    subscriptionPlanId: '',
    billingCycle: 'monthly',
    adminEmail: '',
    adminFirstName: '',
    adminLastName: '',
  })

  const canAccess =
    user && hasPermission(user.role as UserRole, [UserRole.SUPER_ADMIN])

  if (!canAccess) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-muted-foreground'>
              Only Super Admins can create societies.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const updateField = (field: keyof CreateSocietyPayload, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const result = await createMutation.mutateAsync(form)
      router.push('/super-admin/societies')
    } catch {
      // Error handled by mutation
    }
  }

  const selectedPlan = plans?.find(
    (p: any) => p._id === form.subscriptionPlanId,
  )

  return (
    <div className='p-6 space-y-6 max-w-4xl'>
      <div>
        <Button
          variant='ghost'
          onClick={() => router.push('/super-admin/societies')}
          className='mb-4'
        >
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back to Societies
        </Button>
        <h1 className='text-2xl font-bold'>Create New Society</h1>
        <p className='text-muted-foreground'>
          Onboard a new housing society to the platform
        </p>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Society Details */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Building2 className='h-5 w-5' />
              Society Details
            </CardTitle>
            <CardDescription>
              Basic information about the housing society
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='societyName'>Society Name *</Label>
                <Input
                  id='societyName'
                  value={form.societyName}
                  onChange={e => updateField('societyName', e.target.value)}
                  placeholder='e.g. DHA Phase 5 Islamabad'
                  required
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='societyCode'>
                  Society Code (auto-generated if empty)
                </Label>
                <Input
                  id='societyCode'
                  value={form.societyCode || ''}
                  onChange={e => updateField('societyCode', e.target.value)}
                  placeholder='e.g. DHA-ISB-P5'
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='address'>Address *</Label>
              <Input
                id='address'
                value={form.address}
                onChange={e => updateField('address', e.target.value)}
                placeholder='Full address'
                required
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='contactEmail'>Contact Email *</Label>
                <Input
                  id='contactEmail'
                  type='email'
                  value={form.contactEmail}
                  onChange={e => updateField('contactEmail', e.target.value)}
                  placeholder='info@society.com'
                  required
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='contactPhone'>Contact Phone *</Label>
                <Input
                  id='contactPhone'
                  value={form.contactPhone}
                  onChange={e => updateField('contactPhone', e.target.value)}
                  placeholder='+92...'
                  required
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='website'>Website</Label>
              <Input
                id='website'
                value={form.website || ''}
                onChange={e => updateField('website', e.target.value)}
                placeholder='https://...'
              />
            </div>
          </CardContent>
        </Card>

        {/* Subscription Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Plan</CardTitle>
            <CardDescription>
              Select the subscription tier for this society
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label>Plan *</Label>
                <Select
                  value={form.subscriptionPlanId}
                  onValueChange={v => updateField('subscriptionPlanId', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select a plan' />
                  </SelectTrigger>
                  <SelectContent>
                    {plansLoading ? (
                      <SelectItem value='loading' disabled>
                        Loading...
                      </SelectItem>
                    ) : (
                      plans?.map((plan: any) => (
                        <SelectItem key={plan._id} value={plan._id}>
                          {plan.packageName} - PKR{' '}
                          {plan.monthlyPrice.toLocaleString()}/mo
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label>Billing Cycle</Label>
                <Select
                  value={form.billingCycle}
                  onValueChange={v =>
                    updateField('billingCycle', v as 'monthly' | 'yearly')
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='monthly'>Monthly</SelectItem>
                    <SelectItem value='yearly'>
                      Yearly (save ~17%)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedPlan && (
              <div className='bg-muted/50 rounded-lg p-4 text-sm space-y-1'>
                <p className='font-medium'>{selectedPlan.packageName} Plan Features:</p>
                <p>Members: {selectedPlan.features.maxMembers} | Projects: {selectedPlan.features.maxProjects} | Staff: {selectedPlan.features.maxStaff}</p>
                <p>Storage: {selectedPlan.features.storageGB}GB | Support: {selectedPlan.features.supportLevel}</p>
                <p>Modules: {selectedPlan.features.modules.join(', ')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Admin User */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <UserPlus className='h-5 w-5' />
              Society Admin Account
            </CardTitle>
            <CardDescription>
              This admin will manage the society. A temporary password will be
              generated if not provided.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='adminFirstName'>First Name *</Label>
                <Input
                  id='adminFirstName'
                  value={form.adminFirstName}
                  onChange={e => updateField('adminFirstName', e.target.value)}
                  required
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='adminLastName'>Last Name *</Label>
                <Input
                  id='adminLastName'
                  value={form.adminLastName}
                  onChange={e => updateField('adminLastName', e.target.value)}
                  required
                />
              </div>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='adminEmail'>Email *</Label>
                <Input
                  id='adminEmail'
                  type='email'
                  value={form.adminEmail}
                  onChange={e => updateField('adminEmail', e.target.value)}
                  required
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='adminPhone'>Phone</Label>
                <Input
                  id='adminPhone'
                  value={form.adminPhone || ''}
                  onChange={e => updateField('adminPhone', e.target.value)}
                />
              </div>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='adminPassword'>
                Password (leave empty for auto-generated)
              </Label>
              <Input
                id='adminPassword'
                type='password'
                value={form.adminPassword || ''}
                onChange={e => updateField('adminPassword', e.target.value)}
                placeholder='Min 8 characters'
                minLength={8}
              />
            </div>
          </CardContent>
        </Card>

        <div className='flex justify-end gap-4'>
          <Button
            type='button'
            variant='outline'
            onClick={() => router.push('/super-admin/societies')}
          >
            Cancel
          </Button>
          <Button type='submit' disabled={createMutation.isPending}>
            {createMutation.isPending ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Creating...
              </>
            ) : (
              'Create Society'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
