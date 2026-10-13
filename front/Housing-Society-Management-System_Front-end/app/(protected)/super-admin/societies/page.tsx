'use client'

import { EnhancedDataTable as DataTable } from '@/components/shared/DataTable/DataTable'
import { TableColumn } from '@/components/shared/DataTable/DataTable'
import { ActionBar } from '@/components/shared/PageTemplate'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import {
  useSocietyList,
  useSuspendSociety,
  useActivateSociety
} from '@/lib/hooks/entities/useSuperAdmin'
import { useAuth } from '@/lib/hooks/useAuth'
import { formatDate } from '@/lib/utils/format'
import { customToast } from '@/lib/utils/customToast'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useConfirm } from "@/components/shared/ConfirmDialog";

const societyColumns: TableColumn<any>[] = [
  {
    id: 'societyName',
    header: 'Society Name',
    accessorKey: 'societyName',
    sortable: true,
    cell: row => (
      <div>
        <div className='font-medium'>{row.societyName}</div>
        {row.societyAddress && (
          <div className='text-sm text-muted-foreground line-clamp-1'>
            {row.societyAddress}
          </div>
        )}
      </div>
    )
  },
  {
    id: 'societyCode',
    header: 'Code',
    accessorKey: 'societyCode',
    cell: row => (
      <span className='font-mono text-sm'>{row.societyCode || 'N/A'}</span>
    )
  },
  {
    id: 'subscriptionStatus',
    header: 'Subscription',
    cell: row => {
      const status = row.subscriptionStatus || row.subscription?.status
      const variant =
        status === 'active'
          ? 'success'
          : status === 'expired'
            ? 'destructive'
            : status === 'trial'
              ? 'warning'
              : 'secondary'
      return (
        <Badge variant={variant}>
          {status?.toUpperCase() || 'NONE'}
        </Badge>
      )
    }
  },
  {
    id: 'memberCount',
    header: 'Members',
    cell: row => (
      <span className='font-medium'>{row.memberCount || 0}</span>
    ),
    sortable: true
  },
  {
    id: 'isActive',
    header: 'Status',
    cell: row => (
      <Badge variant={row.isActive ? 'success' : 'destructive'}>
        {row.isActive ? 'Active' : 'Suspended'}
      </Badge>
    )
  },
  {
    id: 'createdAt',
    header: 'Created',
    cell: row => formatDate(row.createdAt),
    sortable: true
  }
]

export default function ManageSocietiesPage () {
  const { user } = useAuth()
  const router = useRouter()
  const [filters, setLocalFilters] = useState<Record<string, unknown>>({})
  const { confirm } = useConfirm();
  const [page, setPage] = useState(1)

  const { data, isLoading, refetch } = useSocietyList({ ...filters, page })
  const suspendMutation = useSuspendSociety()
  const activateMutation = useActivateSociety()

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
              Only super admins can manage societies.
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

  const handleView = (id: string) => {
    router.push(`/societies/${id}`)
  }

  const handleSuspend = async (row: any) => {
    if (
      await confirm({ title: "Suspend", description: `Are you sure you want to suspend ${row.societyName}? This will restrict access for all its members.` })
    ) {
      try {
        await suspendMutation.mutateAsync(row._id)
        customToast.success('Society suspended successfully')
      } catch {
        customToast.error('Failed to suspend society')
      }
    }
  }

  const handleActivate = async (row: any) => {
    try {
      await activateMutation.mutateAsync(row._id)
      customToast.success('Society activated successfully')
    } catch {
      customToast.error('Failed to activate society')
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
    columns: societyColumns,
    filters: [
      {
        id: 'isActive',
        label: 'Status',
        type: 'select' as const,
        options: [
          { label: 'Active', value: 'true' },
          { label: 'Suspended', value: 'false' }
        ]
      },
      {
        id: 'subscriptionStatus',
        label: 'Subscription',
        type: 'select' as const,
        options: [
          { label: 'Active', value: 'active' },
          { label: 'Trial', value: 'trial' },
          { label: 'Expired', value: 'expired' },
          { label: 'None', value: 'none' }
        ]
      },
      {
        id: 'sortBy',
        label: 'Sort By',
        type: 'select' as const,
        options: [
          { label: 'Name', value: 'societyName' },
          { label: 'Members', value: 'memberCount' },
          { label: 'Created Date', value: 'createdAt' }
        ]
      }
    ],
    enableActions: true,
    actions: {
      customActions: [
        {
          label: 'View Details',
          icon: <span>👁️</span>,
          onClick: (row: any) => handleView(row._id),
          variant: 'outline' as const
        },
        {
          label: 'Suspend',
          icon: <span>🔒</span>,
          onClick: (row: any) => handleSuspend(row),
          variant: 'destructive' as const,
          showWhen: (row: any) => row.isActive
        },
        {
          label: 'Activate',
          icon: <span>🔓</span>,
          onClick: (row: any) => handleActivate(row),
          variant: 'secondary' as const,
          showWhen: (row: any) => !row.isActive
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
        <Button
          variant='ghost'
          onClick={() => router.push('/super-admin')}
          className='mb-4'
        >
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back to Dashboard
        </Button>
        <h1 className='text-2xl font-bold'>Manage Societies</h1>
        <p className='text-muted-foreground'>
          View, suspend, or activate housing societies across the platform
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
          <Button onClick={() => router.push('/super-admin/societies/create')}>
            + Create Society
          </Button>
        }
      />

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Societies</CardTitle>
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
