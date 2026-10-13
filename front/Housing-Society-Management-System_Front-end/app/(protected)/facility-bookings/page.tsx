'use client'

import { EnhancedDataTable as DataTable } from '@/components/shared/DataTable/DataTable'
import { TableColumn } from '@/components/shared/DataTable/DataTable'
import { ActionBar } from '@/components/shared/PageTemplate'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import {
  useFacilityBookings,
  useBookingStats,
  useApproveBooking,
  useCancelBooking,
  useCompleteBooking
} from '@/lib/hooks/entities/useFacilityBooking'
import { useAuth } from '@/lib/hooks/useAuth'
import { formatDate } from '@/lib/utils/format'
import { customToast } from '@/lib/utils/customToast'
import {
  Plus,
  RefreshCw,
  CalendarDays,
  Clock,
  CheckCircle,
  DollarSign
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useConfirm } from "@/components/shared/ConfirmDialog";

const getBookingStatusVariant = (
  status: string
): 'default' | 'secondary' | 'destructive' | 'success' | 'warning' => {
  switch (status) {
    case 'pending':
      return 'warning'
    case 'confirmed':
    case 'approved':
      return 'success'
    case 'cancelled':
      return 'destructive'
    case 'completed':
      return 'default'
    default:
      return 'secondary'
  }
}

const bookingColumns: TableColumn<any>[] = [
  {
    id: 'facility',
    header: 'Facility',
    cell: row => {
      const facility =
        typeof row.facilityId === 'object' ? row.facilityId : null
      return (
        <div>
          <div className='font-medium'>
            {facility?.facilityName || 'N/A'}
          </div>
          <div className='text-sm text-muted-foreground capitalize'>
            {facility?.facilityType?.replace(/_/g, ' ') || ''}
          </div>
        </div>
      )
    }
  },
  {
    id: 'member',
    header: 'Booked By',
    cell: row => {
      const member = typeof row.memberId === 'object' ? row.memberId : null
      return member?.memName || 'N/A'
    }
  },
  {
    id: 'bookingDate',
    header: 'Date',
    cell: row => formatDate(row.bookingDate),
    sortable: true
  },
  {
    id: 'timeSlot',
    header: 'Time',
    cell: row => {
      if (row.startTime && row.endTime) {
        return `${row.startTime} - ${row.endTime}`
      }
      return row.timeSlot || 'N/A'
    }
  },
  {
    id: 'status',
    header: 'Status',
    cell: row => (
      <Badge variant={getBookingStatusVariant(row.status)}>
        {row.status?.toUpperCase() || 'N/A'}
      </Badge>
    )
  },
  {
    id: 'amount',
    header: 'Amount',
    cell: row => {
      const amount = row.totalAmount || row.amount || 0
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'PKR',
        minimumFractionDigits: 0
      }).format(amount)
    },
    sortable: true
  }
]

export default function FacilityBookingsPage () {
  const { user } = useAuth()
  const router = useRouter()
  const [filters, setLocalFilters] = useState<Record<string, unknown>>({})
  const { confirm } = useConfirm();
  const [page, setPage] = useState(1)

  const { data, isLoading, refetch } = useFacilityBookings({
    ...filters,
    page
  })
  const { data: stats } = useBookingStats()
  const approveMutation = useApproveBooking()
  const cancelMutation = useCancelBooking()
  const completeMutation = useCompleteBooking()

  const canCreate =
    user &&
    hasPermission(user.role as UserRole, [
      UserRole.USER,
      UserRole.MODERATOR,
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN
    ])

  const canManage =
    user &&
    hasPermission(user.role as UserRole, [
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN
    ])

  const handleCreate = () => router.push('/facility-bookings/create')

  const handleApprove = async (row: any) => {
    try {
      await approveMutation.mutateAsync(row._id)
      customToast.success('Booking approved successfully')
    } catch {
      customToast.error('Failed to approve booking')
    }
  }

  const handleCancelBooking = async (row: any) => {
    if (await confirm({ title: "Cancel", description: 'Are you sure you want to cancel this booking?' })) {
      try {
        await cancelMutation.mutateAsync({ id: row._id })
        customToast.success('Booking cancelled successfully')
      } catch {
        customToast.error('Failed to cancel booking')
      }
    }
  }

  const handleComplete = async (row: any) => {
    try {
      await completeMutation.mutateAsync(row._id)
      customToast.success('Booking marked as completed')
    } catch {
      customToast.error('Failed to complete booking')
    }
  }

  const handleSearch = (search: string) => {
    setLocalFilters(prev => ({ ...prev, search }))
    setPage(1)
  }

  const handleFilterChange = (newFilters: Record<string, unknown>) => {
    setLocalFilters(prev => ({ ...prev, ...newFilters }))
    setPage(1)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
    }).format(amount || 0)
  }

  const tableConfig = {
    columns: bookingColumns,
    filters: [
      {
        id: 'facilityId',
        label: 'Facility',
        type: 'relationship' as const,
        placeholder: 'Select facility',
        relationship: {
          endpoint: '/facilities',
          labelField: 'facilityName',
          valueField: '_id',
          searchable: true
        }
      },
      {
        id: 'status',
        label: 'Status',
        type: 'select' as const,
        options: [
          { label: 'Pending', value: 'pending' },
          { label: 'Approved', value: 'approved' },
          { label: 'Confirmed', value: 'confirmed' },
          { label: 'Cancelled', value: 'cancelled' },
          { label: 'Completed', value: 'completed' }
        ]
      },
      {
        id: 'bookingDate',
        label: 'Booking Date',
        type: 'date' as const,
        placeholder: 'Select date'
      }
    ],
    enableActions: true,
    actions: {
      customActions: [
        {
          label: 'Approve',
          icon: <span>✅</span>,
          onClick: (row: any) => handleApprove(row),
          variant: 'secondary' as const,
          showWhen: (row: any) => row.status === 'pending' && canManage
        },
        {
          label: 'Complete',
          icon: <span>✔️</span>,
          onClick: (row: any) => handleComplete(row),
          variant: 'secondary' as const,
          showWhen: (row: any) =>
            (row.status === 'approved' || row.status === 'confirmed') &&
            canManage
        },
        {
          label: 'Cancel',
          icon: <span>❌</span>,
          onClick: (row: any) => handleCancelBooking(row),
          variant: 'destructive' as const,
          showWhen: (row: any) =>
            row.status !== 'cancelled' &&
            row.status !== 'completed' &&
            canManage
        }
      ]
    },
    pagination: data?.pagination
      ? {
          currentPage: data.pagination.page,
          totalPages: data.pagination.pages,
          onPageChange: handlePageChange,
          pageSize: data.pagination.limit,
          onPageSizeChange: (size: number) => {
            setLocalFilters(prev => ({ ...prev, limit: size }))
            setPage(1)
          },
          totalItems: data.pagination.total
        }
      : undefined,
    responsive: {
      showMobileView: true,
      stickyHeader: true
    }
  }

  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-2xl font-bold'>Facility Bookings</h1>
        <p className='text-muted-foreground'>
          Manage facility reservations, approvals, and scheduling
        </p>
      </div>

      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
              <CalendarDays className='h-4 w-4' />
              Total Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {stats?.total || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
              <Clock className='h-4 w-4' />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-yellow-600'>
              {stats?.pending || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
              <CheckCircle className='h-4 w-4' />
              Confirmed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>
              {stats?.confirmed || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
              <DollarSign className='h-4 w-4' />
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatCurrency(stats?.revenue || 0)}
            </div>
          </CardContent>
        </Card>
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
              New Booking
            </Button>
          )
        }
      />

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={data?.items || []}
            config={tableConfig}
            isLoading={isLoading}
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
          />
        </CardContent>
      </Card>
    </div>
  )
}
