'use client'

import { ActionBar } from '@/components/shared/PageTemplate'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import {
  useFacilities,
  useDeleteFacility,
  useToggleFacilityStatus
} from '@/lib/hooks/entities/useFacility'
import { useAuth } from '@/lib/hooks/useAuth'
import { customToast } from '@/lib/utils/customToast'
import {
  Plus,
  RefreshCw,
  Building2,
  Users,
  DollarSign,
  ToggleLeft,
  ToggleRight
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useConfirm } from "@/components/shared/ConfirmDialog";

export default function FacilitiesPage () {
  const { user } = useAuth()
  const router = useRouter()
  const [filters, setFilters] = useState<Record<string, unknown>>({})
  const { confirm } = useConfirm();

  const { data, isLoading, refetch } = useFacilities(filters)
  const deleteMutation = useDeleteFacility()
  const toggleStatusMutation = useToggleFacilityStatus()

  const canCreate =
    user &&
    hasPermission(user.role as UserRole, [
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN
    ])

  const canManage =
    user &&
    hasPermission(user.role as UserRole, [
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN
    ])

  const handleCreate = () => router.push('/facilities/create')

  const handleDelete = async (id: string) => {
    if (
      canManage &&
      await confirm({ title: "Delete", description: 'Are you sure you want to delete this facility?', variant: "destructive" })
    ) {
      try {
        await deleteMutation.mutateAsync(id)
        customToast.success('Facility deleted successfully')
      } catch {
        customToast.error('Failed to delete facility')
      }
    }
  }

  const handleToggleStatus = async (id: string, currentlyActive: boolean) => {
    try {
      await toggleStatusMutation.mutateAsync(id)
      customToast.success(
        `Facility ${currentlyActive ? 'deactivated' : 'activated'} successfully`
      )
    } catch {
      customToast.error('Failed to update facility status')
    }
  }

  const facilities = data?.items || []

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0)
  }

  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-2xl font-bold'>Facility Management</h1>
        <p className='text-muted-foreground'>
          Manage community facilities, amenities, and their booking settings
        </p>
      </div>

      {/* Actions Bar */}
      <ActionBar
        left={
          <Button variant='glass' size='sm' onClick={() => refetch()}>
            <RefreshCw className='size-4' />
            Refresh
          </Button>
        }
        right={
          canCreate && (
            <Button variant='primary' size='sm' onClick={handleCreate}>
              <Plus className='size-4' />
              Add Facility
            </Button>
          )
        }
      />

      {/* Facilities Grid */}
      {isLoading ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {[1, 2, 3].map(i => (
            <Card key={i} className='animate-pulse'>
              <CardHeader>
                <div className='h-6 bg-muted rounded w-3/4' />
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  <div className='h-4 bg-muted rounded w-1/2' />
                  <div className='h-4 bg-muted rounded w-2/3' />
                  <div className='h-4 bg-muted rounded w-1/3' />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : facilities.length === 0 ? (
        <Card>
          <CardContent className='pt-6 text-center'>
            <Building2 className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
            <h3 className='text-lg font-semibold'>No Facilities Found</h3>
            <p className='text-muted-foreground mt-1'>
              Get started by adding your first facility.
            </p>
            {canCreate && (
              <Button className='mt-4' onClick={handleCreate}>
                <Plus className='mr-2 h-4 w-4' />
                Add Facility
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {facilities.map((facility: any) => (
            <Card
              key={facility._id}
              className={`relative transition-all hover:shadow-lg ${
                !facility.isActive ? 'opacity-60' : ''
              }`}
            >
              <CardHeader className='pb-3'>
                <div className='flex items-start justify-between'>
                  <div>
                    <CardTitle className='text-lg'>
                      {facility.facilityName}
                    </CardTitle>
                    <p className='text-sm text-muted-foreground capitalize mt-1'>
                      {facility.facilityType?.replace(/_/g, ' ') || 'General'}
                    </p>
                  </div>
                  <Badge
                    variant={facility.isActive ? 'success' : 'secondary'}
                  >
                    {facility.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className='space-y-4'>
                {facility.description && (
                  <p className='text-sm text-muted-foreground line-clamp-2'>
                    {facility.description}
                  </p>
                )}

                <div className='grid grid-cols-2 gap-3 text-sm'>
                  {facility.capacity && (
                    <div className='flex items-center gap-1'>
                      <Users className='h-3 w-3 text-muted-foreground' />
                      <span>Capacity: {facility.capacity}</span>
                    </div>
                  )}
                  {facility.location && (
                    <div className='flex items-center gap-1'>
                      <Building2 className='h-3 w-3 text-muted-foreground' />
                      <span className='truncate'>{facility.location}</span>
                    </div>
                  )}
                </div>

                {/* Rates */}
                <div className='space-y-1 text-sm'>
                  {facility.hourlyRate > 0 && (
                    <div className='flex items-center justify-between'>
                      <span className='text-muted-foreground'>Hourly Rate</span>
                      <span className='font-medium flex items-center gap-1'>
                        <DollarSign className='h-3 w-3' />
                        {formatCurrency(facility.hourlyRate)}
                      </span>
                    </div>
                  )}
                  {facility.halfDayRate > 0 && (
                    <div className='flex items-center justify-between'>
                      <span className='text-muted-foreground'>
                        Half Day Rate
                      </span>
                      <span className='font-medium'>
                        {formatCurrency(facility.halfDayRate)}
                      </span>
                    </div>
                  )}
                  {facility.fullDayRate > 0 && (
                    <div className='flex items-center justify-between'>
                      <span className='text-muted-foreground'>
                        Full Day Rate
                      </span>
                      <span className='font-medium'>
                        {formatCurrency(facility.fullDayRate)}
                      </span>
                    </div>
                  )}
                  {facility.securityDeposit > 0 && (
                    <div className='flex items-center justify-between'>
                      <span className='text-muted-foreground'>
                        Security Deposit
                      </span>
                      <span className='font-medium'>
                        {formatCurrency(facility.securityDeposit)}
                      </span>
                    </div>
                  )}
                </div>

                {facility.requiresApproval && (
                  <Badge variant='warning' className='text-xs'>
                    Requires Approval
                  </Badge>
                )}

                {/* Actions */}
                {canManage && (
                  <div className='flex gap-2 pt-2 border-t'>
                    <Button
                      variant='outline'
                      size='sm'
                      className='flex-1'
                      onClick={() =>
                        handleToggleStatus(facility._id, facility.isActive)
                      }
                      disabled={toggleStatusMutation.isPending}
                    >
                      {facility.isActive ? (
                        <>
                          <ToggleRight className='mr-1 h-3 w-3' />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <ToggleLeft className='mr-1 h-3 w-3' />
                          Activate
                        </>
                      )}
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      className='text-red-600 hover:text-red-700'
                      onClick={() => handleDelete(facility._id)}
                      disabled={deleteMutation.isPending}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
