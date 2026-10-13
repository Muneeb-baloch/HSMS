'use client'

import { EnhancedDataTable as DataTable } from '@/components/shared/DataTable/DataTable'
import { TableColumn } from '@/components/shared/DataTable/DataTable'
import { ActionBar } from '@/components/shared/PageTemplate'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import {
  useVisitors,
  useVisitorStats,
  useDeleteVisitor,
  useCheckInVisitor,
  useCheckOutVisitor,
  useCancelVisit
} from '@/lib/hooks/entities/useVisitor'
import { useAuth } from '@/lib/hooks/useAuth'
import { formatDate } from '@/lib/utils/format'
import { customToast } from '@/lib/utils/customToast'
import {
  Plus,
  RefreshCw,
  Users,
  UserCheck,
  Clock,
  CalendarDays
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useConfirm } from "@/components/shared/ConfirmDialog";

const getStatusVariant = (
  status: string
): 'default' | 'secondary' | 'destructive' | 'success' | 'warning' => {
  switch (status) {
    case 'expected':
      return 'secondary'
    case 'checked_in':
      return 'success'
    case 'checked_out':
      return 'default'
    case 'cancelled':
      return 'destructive'
    default:
      return 'secondary'
  }
}

const visitorColumns: TableColumn<any>[] = [
  {
    id: 'visitorName',
    header: 'Visitor Name',
    accessorKey: 'visitorName',
    sortable: true,
    cell: row => (
      <div>
        <div className='font-medium'>{row.visitorName}</div>
        {row.numberOfGuests > 1 && (
          <div className='text-sm text-muted-foreground'>
            +{row.numberOfGuests - 1} guests
          </div>
        )}
      </div>
    )
  },
  {
    id: 'phone',
    header: 'Phone',
    accessorKey: 'visitorPhone',
    cell: row => row.visitorPhone || 'N/A'
  },
  {
    id: 'purpose',
    header: 'Purpose',
    accessorKey: 'purpose',
    cell: row => (
      <span className='capitalize'>{row.purpose?.replace(/_/g, ' ') || 'N/A'}</span>
    )
  },
  {
    id: 'host',
    header: 'Host',
    cell: row => {
      const host =
        typeof row.hostMemberId === 'object' ? row.hostMemberId : null
      return host ? host.memName : 'N/A'
    }
  },
  {
    id: 'expectedDate',
    header: 'Expected Date',
    cell: row => formatDate(row.expectedDate),
    sortable: true
  },
  {
    id: 'status',
    header: 'Status',
    cell: row => (
      <Badge variant={getStatusVariant(row.status)}>
        {row.status?.replace(/_/g, ' ').toUpperCase() || 'N/A'}
      </Badge>
    )
  },
  {
    id: 'passCode',
    header: 'Pass Code',
    cell: row => (
      <span className='font-mono text-sm font-bold'>
        {row.passCode || 'N/A'}
      </span>
    )
  }
]

export default function VisitorsPage () {
  const { user } = useAuth()
  const router = useRouter()
  const [filters, setLocalFilters] = useState<Record<string, unknown>>({})
  const { confirm } = useConfirm();
  const [page, setPage] = useState(1)

  const { data, isLoading, refetch } = useVisitors({ ...filters, page })
  const { data: stats } = useVisitorStats()
  const deleteMutation = useDeleteVisitor()
  const checkInMutation = useCheckInVisitor()
  const checkOutMutation = useCheckOutVisitor()
  const cancelMutation = useCancelVisit()

  const canCreate =
    user &&
    hasPermission(user.role as UserRole, [
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

  const handleCreate = () => router.push('/visitors/create')
  const handleView = (id: string) => router.push(`/visitors/view/${id}`)

  const handleDelete = async (id: string) => {
    if (
      canManage &&
      await confirm({ title: "Delete", description: 'Are you sure you want to delete this visitor record?', variant: "destructive" })
    ) {
      try {
        await deleteMutation.mutateAsync(id)
        customToast.success('Visitor record deleted')
      } catch {
        customToast.error('Failed to delete visitor record')
      }
    }
  }

  const handleCheckIn = async (row: any) => {
    try {
      await checkInMutation.mutateAsync(row._id)
      customToast.success('Visitor checked in successfully')
    } catch {
      customToast.error('Failed to check in visitor')
    }
  }

  const handleCheckOut = async (row: any) => {
    try {
      await checkOutMutation.mutateAsync(row._id)
      customToast.success('Visitor checked out successfully')
    } catch {
      customToast.error('Failed to check out visitor')
    }
  }

  const handleCancel = async (row: any) => {
    if (await confirm({ title: "Cancel", description: 'Are you sure you want to cancel this visitor pass?' })) {
      try {
        await cancelMutation.mutateAsync(row._id)
        customToast.success('Visitor pass cancelled')
      } catch {
        customToast.error('Failed to cancel visitor pass')
      }
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

  const tableConfig = {
    columns: visitorColumns,
    filters: [
      {
        id: 'status',
        label: 'Status',
        type: 'select' as const,
        options: [
          { label: 'Expected', value: 'expected' },
          { label: 'Checked In', value: 'checked_in' },
          { label: 'Checked Out', value: 'checked_out' },
          { label: 'Cancelled', value: 'cancelled' }
        ]
      },
      {
        id: 'purpose',
        label: 'Purpose',
        type: 'select' as const,
        options: [
          { label: 'Personal Visit', value: 'personal_visit' },
          { label: 'Delivery', value: 'delivery' },
          { label: 'Maintenance', value: 'maintenance' },
          { label: 'Official', value: 'official' },
          { label: 'Event', value: 'event' },
          { label: 'Other', value: 'other' }
        ]
      },
      {
        id: 'expectedDate',
        label: 'Expected Date',
        type: 'date' as const,
        placeholder: 'Select date'
      }
    ],
    enableActions: true,
    actions: {
      onDelete: canManage ? handleDelete : undefined,
      customActions: [
        {
          label: 'View Details',
          icon: <span>👁️</span>,
          onClick: (row: any) => handleView(row._id),
          variant: 'outline' as const
        },
        {
          label: 'Check In',
          icon: <span>✅</span>,
          onClick: (row: any) => handleCheckIn(row),
          variant: 'secondary' as const,
          showWhen: (row: any) => row.status === 'expected' && canManage
        },
        {
          label: 'Check Out',
          icon: <span>🚪</span>,
          onClick: (row: any) => handleCheckOut(row),
          variant: 'secondary' as const,
          showWhen: (row: any) => row.status === 'checked_in' && canManage
        },
        {
          label: 'Cancel',
          icon: <span>❌</span>,
          onClick: (row: any) => handleCancel(row),
          variant: 'destructive' as const,
          showWhen: (row: any) =>
            (row.status === 'expected' || row.status === 'checked_in') &&
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
        <h1 className='text-2xl font-bold'>Visitor Management</h1>
        <p className='text-muted-foreground'>
          Track and manage visitor entries, check-ins, and passes
        </p>
      </div>

      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
              <Users className='h-4 w-4' />
              Total Visitors
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
              <CalendarDays className='h-4 w-4' />
              Today&apos;s Visitors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-600'>
              {stats?.today || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
              <UserCheck className='h-4 w-4' />
              Currently Checked-In
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>
              {stats?.checkedIn || 0}
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
              New Visitor
            </Button>
          )
        }
      />

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Visitors</CardTitle>
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
