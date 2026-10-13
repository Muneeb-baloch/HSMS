'use client'

import { EnhancedDataTable as DataTable } from '@/components/shared/DataTable/DataTable'
import { TableColumn } from '@/components/shared/DataTable/DataTable'
import { ActionBar } from '@/components/shared/PageTemplate'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import {
  useSocieties,
  useDeleteSociety,
  useToggleSocietyStatus
} from '@/lib/hooks/entities/useSociety'
import { useAuth } from '@/lib/hooks/useAuth'
import { formatDate } from '@/lib/utils/format'
import { customToast } from '@/lib/utils/customToast'
import { Plus, RefreshCw } from 'lucide-react'
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
    id: 'contactPerson',
    header: 'Contact Person',
    cell: row => row.contactPerson || 'N/A'
  },
  {
    id: 'contactEmail',
    header: 'Email',
    cell: row => row.contactEmail || 'N/A',
    hideOnMobile: true
  },
  {
    id: 'isActive',
    header: 'Status',
    cell: row => (
      <Badge variant={row.isActive !== false ? 'success' : 'destructive'}>
        {row.isActive !== false ? 'Active' : 'Inactive'}
      </Badge>
    )
  },
  {
    id: 'createdAt',
    header: 'Created',
    cell: row => formatDate(row.createdAt),
    sortable: true,
    hideOnMobile: true
  }
]

export default function SocietiesPage () {
  const { user } = useAuth()
  const router = useRouter()
  const [filters, setLocalFilters] = useState<Record<string, unknown>>({})
  const { confirm } = useConfirm();
  const [page, setPage] = useState(1)

  const { data, isLoading, refetch } = useSocieties({ ...filters, page })
  const deleteMutation = useDeleteSociety()
  const toggleStatusMutation = useToggleSocietyStatus()

  const canAccess =
    user &&
    hasPermission(user.role as UserRole, [UserRole.SUPER_ADMIN])

  const canCreate =
    user &&
    hasPermission(user.role as UserRole, [UserRole.SUPER_ADMIN])

  const canDelete =
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
            <p className='text-muted-foreground'>
              Only super admins can manage societies.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleCreate = () => router.push('/societies/create')

  const handleView = (id: string) => router.push(`/societies/${id}`)

  const handleEdit = (id: string) => router.push(`/societies/edit/${id}`)

  const handleDelete = async (id: string) => {
    if (
      canDelete &&
      await confirm({ title: "Delete", description: 'Are you sure you want to delete this society? This action cannot be undone.', variant: "destructive" })
    ) {
      try {
        await deleteMutation.mutateAsync(id)
        customToast.success('Society deleted successfully')
      } catch {
        customToast.error('Failed to delete society')
      }
    }
  }

  const handleToggleStatus = async (row: any) => {
    const action = row.isActive ? 'deactivate' : 'activate'
    if (await confirm({ title: "Confirm", description: `Are you sure you want to ${action} ${row.societyName}?` })) {
      try {
        await toggleStatusMutation.mutateAsync(row._id)
        customToast.success(
          `Society ${action}d successfully`
        )
      } catch {
        customToast.error(`Failed to ${action} society`)
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
    columns: societyColumns,
    filters: [
      {
        id: 'isActive',
        label: 'Status',
        type: 'select' as const,
        options: [
          { label: 'Active', value: 'true' },
          { label: 'Inactive', value: 'false' }
        ]
      },
      {
        id: 'sortBy',
        label: 'Sort By',
        type: 'select' as const,
        options: [
          { label: 'Name', value: 'societyName' },
          { label: 'Code', value: 'societyCode' },
          { label: 'Created Date', value: 'createdAt' }
        ]
      },
      {
        id: 'sortOrder',
        label: 'Order',
        type: 'select' as const,
        options: [
          { label: 'Ascending', value: 'asc' },
          { label: 'Descending', value: 'desc' }
        ]
      }
    ],
    enableActions: true,
    actions: {
      onEdit: handleEdit,
      onDelete: canDelete ? handleDelete : undefined,
      customActions: [
        {
          label: 'View Details',
          icon: <span>👁️</span>,
          onClick: (row: any) => handleView(row._id),
          variant: 'outline' as const
        },
        {
          label: (row: any) =>
            row.isActive ? 'Deactivate' : 'Activate',
          onClick: (row: any) => handleToggleStatus(row),
          variant: 'secondary' as const
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
        <h1 className='text-2xl font-bold'>Societies</h1>
        <p className='text-muted-foreground'>
          Create and manage housing societies on the platform
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
              Create Society
            </Button>
          )
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
