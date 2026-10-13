'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  EnhancedDataTable as DataTable,
  TableColumn
} from '@/components/shared/DataTable/DataTable'
import { ActionBar } from '@/components/shared/PageTemplate'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import {
  useGeofences,
  useDeleteGeofence
} from '@/lib/hooks/entities/useAttendance'
import { Geofence } from '@/lib/types/attendance'
import { useAuth } from '@/lib/hooks/useAuth'
import { customToast } from '@/lib/utils/customToast'
import { Plus, RefreshCw, MapPin } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useConfirm } from "@/components/shared/ConfirmDialog";

const geofenceColumns: TableColumn<Geofence>[] = [
  {
    id: 'name',
    header: 'Name',
    cell: (row: Geofence) => (
      <div className='font-medium'>{row.name}</div>
    ),
    sortable: true
  },
  {
    id: 'latitude',
    header: 'Latitude',
    cell: (row: Geofence) => (
      <span className='font-mono text-sm'>{row.latitude.toFixed(6)}</span>
    )
  },
  {
    id: 'longitude',
    header: 'Longitude',
    cell: (row: Geofence) => (
      <span className='font-mono text-sm'>{row.longitude.toFixed(6)}</span>
    )
  },
  {
    id: 'radius',
    header: 'Radius (m)',
    cell: (row: Geofence) => `${row.radius}m`,
    sortable: true
  },
  {
    id: 'isActive',
    header: 'Active',
    cell: (row: Geofence) => (
      <Badge variant={row.isActive ? 'success' : 'secondary'}>
        {row.isActive ? 'Active' : 'Inactive'}
      </Badge>
    )
  }
]

export default function GeofenceList () {
  const { user } = useAuth()
  const router = useRouter()
  const { confirm } = useConfirm();
  const deleteMutation = useDeleteGeofence()

  const canManage =
    user &&
    hasPermission(user.role as UserRole, [
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN
    ])

  const { data: geofences, isLoading, refetch } = useGeofences(
    user?.societyId || ''
  )

  const handleDelete = async (id: string) => {
    if (canManage && await confirm({ title: "Delete", description: 'Are you sure you want to delete this geofence?', variant: "destructive" })) {
      try {
        await deleteMutation.mutateAsync(id)
      } catch {
        // Error handled by mutation hook
      }
    }
  }

  if (!canManage) {
    return (
      <div className='space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-muted-foreground'>
              You don&apos;t have permission to manage geofences.
            </p>
            <Button
              variant='ghost'
              className='mt-4'
              onClick={() => router.back()}
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const tableConfig = {
    columns: geofenceColumns,
    enableActions: true,
    actions: {
      onEdit: (id: string) => router.push(`/geofences/edit/${id}`),
      onDelete: async (id: string) => handleDelete(id),
      customActions: [] as Array<{
        label: string
        actionType: string
        onClick: (row: Geofence) => void
      }>
    },
    responsive: {
      showMobileView: true,
      stickyHeader: true
    }
  }

  const items = Array.isArray(geofences) ? geofences : []

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-2xl font-bold'>Geofence Management</h1>
        <p className='text-muted-foreground'>
          Manage geofence zones for attendance tracking
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
          <Button
            variant='primary'
            size='sm'
            onClick={() => router.push('/geofences/create')}
          >
            <Plus className='size-4' />
            Add Geofence
          </Button>
        }
      />

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <MapPin className='h-5 w-5' />
            All Geofences
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className='flex justify-center items-center py-12'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary' />
            </div>
          ) : items.length === 0 ? (
            <div className='text-center py-12'>
              <MapPin className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
              <h3 className='text-lg font-semibold'>No Geofences Found</h3>
              <p className='text-muted-foreground mt-1'>
                Create your first geofence zone to start tracking attendance
                locations.
              </p>
              <Button
                className='mt-4'
                onClick={() => router.push('/geofences/create')}
              >
                <Plus className='mr-2 h-4 w-4' />
                Add Geofence
              </Button>
            </div>
          ) : (
            <DataTable
              data={items}
              config={tableConfig}
              isLoading={isLoading}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
