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
  useRedemptions,
  useApproveRedemption,
  useRejectRedemption,
  useFulfillRedemption
} from '@/lib/hooks/entities/useGamification'
import { GamificationRedemption } from '@/lib/types/gamification'
import { useAuth } from '@/lib/hooks/useAuth'
import { formatDate } from '@/lib/utils/format'
import {
  RefreshCw,
  ArrowLeft,
  Gift,
  Loader2
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useConfirm } from "@/components/shared/ConfirmDialog";

const getStatusVariant = (
  status: string
): 'default' | 'secondary' | 'destructive' | 'success' | 'warning' => {
  switch (status) {
    case 'pending':
      return 'warning'
    case 'approved':
      return 'success'
    case 'fulfilled':
      return 'default'
    case 'rejected':
      return 'destructive'
    case 'cancelled':
      return 'secondary'
    default:
      return 'secondary'
  }
}

const redemptionColumns: TableColumn<GamificationRedemption>[] = [
  {
    id: 'memberId',
    header: 'Member',
    cell: (row: GamificationRedemption) => {
      if (typeof row.memberId === 'object' && row.memberId !== null) {
        return (
          (row.memberId as unknown as { name?: string }).name ||
          (row.memberId as string)
        )
      }
      return row.memberId || 'N/A'
    }
  },
  {
    id: 'rewardId',
    header: 'Reward',
    cell: (row: GamificationRedemption) => {
      if (typeof row.rewardId === 'object' && row.rewardId !== null) {
        return (
          (row.rewardId as unknown as { rewardName?: string }).rewardName ||
          (row.rewardId as string)
        )
      }
      return row.rewardId || 'N/A'
    }
  },
  {
    id: 'pointsSpent',
    header: 'Points Spent',
    cell: (row: GamificationRedemption) =>
      row.pointsSpent?.toLocaleString() || '0',
    sortable: true
  },
  {
    id: 'status',
    header: 'Status',
    cell: (row: GamificationRedemption) => (
      <Badge variant={getStatusVariant(row.status)}>
        {row.status?.toUpperCase() || 'N/A'}
      </Badge>
    )
  },
  {
    id: 'createdAt',
    header: 'Requested Date',
    cell: (row: GamificationRedemption) => formatDate(row.createdAt),
    sortable: true
  }
]

export default function RedemptionList () {
  const { user } = useAuth()
  const router = useRouter()
  const [filters, setLocalFilters] = useState<Record<string, unknown>>({})
  const { confirm } = useConfirm();
  const [page, setPage] = useState(1)

  const canManage =
    user &&
    hasPermission(user.role as UserRole, [
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN
    ])

  // Admin sees all, member sees own
  const queryParams = {
    ...filters,
    page,
    societyId: user?.societyId,
    ...(canManage ? {} : { memberId: user?.id })
  }

  const { data, isLoading, refetch } = useRedemptions(queryParams)
  const approveMutation = useApproveRedemption()
  const rejectMutation = useRejectRedemption()
  const fulfillMutation = useFulfillRedemption()

  const handleApprove = async (row: GamificationRedemption) => {
    try {
      await approveMutation.mutateAsync(row._id)
    } catch {
      // Error handled by mutation hook
    }
  }

  const handleReject = async (row: GamificationRedemption) => {
    if (await confirm({ title: "Confirm", description: 'Are you sure you want to reject this redemption?' })) {
      try {
        await rejectMutation.mutateAsync({ id: row._id })
      } catch {
        // Error handled by mutation hook
      }
    }
  }

  const handleFulfill = async (row: GamificationRedemption) => {
    try {
      await fulfillMutation.mutateAsync(row._id)
    } catch {
      // Error handled by mutation hook
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
    columns: redemptionColumns,
    filters: [
      {
        id: 'status',
        label: 'Status',
        type: 'select' as const,
        options: [
          { label: 'Pending', value: 'pending' },
          { label: 'Approved', value: 'approved' },
          { label: 'Fulfilled', value: 'fulfilled' },
          { label: 'Rejected', value: 'rejected' },
          { label: 'Cancelled', value: 'cancelled' }
        ]
      }
    ],
    enableActions: canManage ? true : false,
    actions: canManage
      ? {
          customActions: [
            {
              label: 'Approve',
              actionType: 'approve' as const,
              onClick: (row: GamificationRedemption) => handleApprove(row),
              variant: 'secondary' as const,
              showWhen: (row: GamificationRedemption) =>
                row.status === 'pending'
            },
            {
              label: 'Reject',
              actionType: 'reject' as const,
              onClick: (row: GamificationRedemption) => handleReject(row),
              variant: 'destructive' as const,
              showWhen: (row: GamificationRedemption) =>
                row.status === 'pending'
            },
            {
              label: 'Fulfill',
              actionType: 'fulfill' as const,
              onClick: (row: GamificationRedemption) => handleFulfill(row),
              variant: 'secondary' as const,
              showWhen: (row: GamificationRedemption) =>
                row.status === 'approved'
            }
          ]
        }
      : undefined,
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
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <Button variant='ghost' onClick={() => router.back()} className='mb-2'>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back
        </Button>
        <h1 className='text-2xl font-bold'>Redemptions</h1>
        <p className='text-muted-foreground'>
          {canManage
            ? 'Manage all reward redemption requests'
            : 'View your reward redemption history'}
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
      />

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Gift className='h-5 w-5' />
            {canManage ? 'All Redemptions' : 'My Redemptions'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className='flex justify-center items-center py-12'>
              <Loader2 className='h-8 w-8 animate-spin text-primary' />
            </div>
          ) : (
            <DataTable
              data={data?.items || []}
              config={tableConfig}
              isLoading={isLoading}
              onSearch={handleSearch}
              onFilterChange={handleFilterChange}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
