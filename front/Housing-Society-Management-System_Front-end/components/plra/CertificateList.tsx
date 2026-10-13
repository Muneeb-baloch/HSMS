'use client'

import { ActionBar } from '@/components/shared/PageTemplate'
import { EnhancedDataTable as DataTable } from '@/components/shared/DataTable/DataTable'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import { useAuth } from '@/lib/hooks/useAuth'
import {
  useCertificates,
  useRevokeCertificate,
  useSyncCertificate
} from '@/lib/hooks/entities/usePLRA'
import { PLRACertificate, CertificateQueryParams } from '@/lib/types/plra'
import { formatDate } from '@/lib/utils/format'
import { customToast } from '@/lib/utils/customToast'
import {
  Download,
  Eye,
  Edit,
  Plus,
  RefreshCw,
  ShieldCheck,
  XCircle,
  Upload
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useConfirm } from "@/components/shared/ConfirmDialog";

const syncStatusVariant = (status: string) => {
  switch (status) {
    case 'synced':
      return 'success'
    case 'pending':
      return 'warning'
    case 'failed':
      return 'destructive'
    default:
      return 'secondary'
  }
}

const statusVariant = (status: string) => {
  switch (status) {
    case 'issued':
    case 'verified':
      return 'success'
    case 'revoked':
      return 'destructive'
    case 'expired':
      return 'warning'
    default:
      return 'secondary'
  }
}

const certificateColumns = [
  {
    accessorKey: 'certificateNumber',
    header: 'Certificate #',
    cell: (row: PLRACertificate) => (
      <span className='font-mono text-sm'>{row.certificateNumber}</span>
    )
  },
  {
    accessorKey: 'certificateType',
    header: 'Type',
    cell: (row: PLRACertificate) => (
      <Badge variant='outline' className='capitalize'>
        {row.certificateType}
      </Badge>
    )
  },
  {
    accessorKey: 'propertyDetails.plotNumber',
    header: 'Plot #',
    cell: (row: PLRACertificate) => row.propertyDetails.plotNumber
  },
  {
    accessorKey: 'ownerDetails.name',
    header: 'Owner Name',
    cell: (row: PLRACertificate) => row.ownerDetails.name
  },
  {
    accessorKey: 'ownerDetails.cnic',
    header: 'CNIC',
    cell: (row: PLRACertificate) => row.ownerDetails.cnic
  },
  {
    accessorKey: 'issuedDate',
    header: 'Issued Date',
    cell: (row: PLRACertificate) => formatDate(row.issuedDate)
  },
  {
    accessorKey: 'syncStatus',
    header: 'Sync Status',
    cell: (row: PLRACertificate) => (
      <Badge variant={syncStatusVariant(row.syncStatus)} className='capitalize'>
        {row.syncStatus}
      </Badge>
    )
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (row: PLRACertificate) => (
      <Badge variant={statusVariant(row.status)} className='capitalize'>
        {row.status}
      </Badge>
    )
  }
]

export default function CertificateList () {
  const router = useRouter()
  const { user } = useAuth()

  const { confirm } = useConfirm();

  const [filters, setFilters] = useState<CertificateQueryParams>({
    page: 1,
    limit: 15
  })

  const { data, isLoading } = useCertificates(filters)
  const syncCertificate = useSyncCertificate()
  const revokeCertificate = useRevokeCertificate()

  const canCreate =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

  const canAdmin =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

  const certificates = data?.items || []
  const pagination = data?.pagination

  const totalCertificates = pagination?.total || 0
  const issuedCount = certificates.filter(
    (c: PLRACertificate) => c.status === 'issued'
  ).length
  const syncedCount = certificates.filter(
    (c: PLRACertificate) => c.syncStatus === 'synced'
  ).length
  const pendingCount = certificates.filter(
    (c: PLRACertificate) => c.syncStatus === 'pending'
  ).length
  const failedCount = certificates.filter(
    (c: PLRACertificate) => c.syncStatus === 'failed'
  ).length

  const handleView = (id: string) =>
    router.push(`/plra/certificates/view/${id}`)
  const handleEdit = (id: string) =>
    router.push(`/plra/certificates/edit/${id}`)
  const handleCreate = () => router.push('/plra/certificates/create')

  const handleSync = async (id: string) => {
    try {
      await syncCertificate.mutateAsync(id)
    } catch {
      // Error already handled in hook
    }
  }

  const handleRevoke = async (id: string) => {
    if (!canAdmin) return
    if (!await confirm({ title: "Confirm", description: 'Are you sure you want to revoke this certificate?' })) return
    try {
      await revokeCertificate.mutateAsync({ id })
    } catch {
      // Error already handled in hook
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
      page: 1
    }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const handleResetFilters = () => {
    setFilters({ page: 1, limit: 15 })
  }

  const handleExport = () => {
    customToast.info('Export functionality coming soon')
  }

  const paginationConfig = pagination
    ? {
        currentPage: pagination.page || 1,
        totalPages: pagination.pages || 1,
        onPageChange: handlePageChange,
        pageSize: pagination.limit || 15,
        onPageSizeChange: (size: number) =>
          setFilters(prev => ({ ...prev, limit: size, page: 1 })),
        totalItems: pagination.total || 0
      }
    : undefined

  const tableConfig = {
    columns: certificateColumns,
    enableActions: true,
    enableSelection: !!canAdmin,
    actions: {
      onEdit: canAdmin ? handleEdit : undefined,
      customActions: [
        {
          label: 'View Details',
          icon: <Eye className='h-4 w-4' />,
          onClick: (row: PLRACertificate) => handleView(row._id),
          variant: 'outline' as const
        },
        {
          label: 'Sync with PLRA',
          icon: <Upload className='h-4 w-4' />,
          onClick: (row: PLRACertificate) => handleSync(row._id),
          variant: 'outline' as const
        },
        ...(canAdmin
          ? [
              {
                label: 'Revoke',
                icon: <XCircle className='h-4 w-4' />,
                onClick: (row: PLRACertificate) => handleRevoke(row._id),
                variant: 'destructive' as const
              }
            ]
          : [])
      ]
    },
    pagination: paginationConfig
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-2xl font-bold text-white'>PLRA Certificates</h1>
        <p className='text-muted-foreground mt-1'>
          Manage land record certificates and PLRA synchronization
        </p>
      </div>

      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-sm text-gray-500'>Total Certificates</div>
            <div className='text-2xl font-bold mt-1'>{totalCertificates}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-sm text-gray-500'>Issued</div>
            <div className='text-2xl font-bold mt-1 text-blue-600'>
              {issuedCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-sm text-gray-500'>Synced with PLRA</div>
            <div className='text-2xl font-bold mt-1 text-green-600'>
              {syncedCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-sm text-gray-500'>Pending Sync</div>
            <div className='text-2xl font-bold mt-1 text-amber-500'>
              {pendingCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-sm text-gray-500'>Failed Sync</div>
            <div className='text-2xl font-bold mt-1 text-red-600'>
              {failedCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className='flex flex-wrap gap-3'>
        <Select
          value={filters.certificateType || ''}
          onValueChange={v => handleFilterChange('certificateType', v)}
        >
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Certificate Type' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='ownership'>Ownership</SelectItem>
            <SelectItem value='allotment'>Allotment</SelectItem>
            <SelectItem value='transfer'>Transfer</SelectItem>
            <SelectItem value='possession'>Possession</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.status || ''}
          onValueChange={v => handleFilterChange('status', v)}
        >
          <SelectTrigger className='w-[160px]'>
            <SelectValue placeholder='Status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='draft'>Draft</SelectItem>
            <SelectItem value='issued'>Issued</SelectItem>
            <SelectItem value='verified'>Verified</SelectItem>
            <SelectItem value='revoked'>Revoked</SelectItem>
            <SelectItem value='expired'>Expired</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.syncStatus || ''}
          onValueChange={v => handleFilterChange('syncStatus', v)}
        >
          <SelectTrigger className='w-[160px]'>
            <SelectValue placeholder='Sync Status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='synced'>Synced</SelectItem>
            <SelectItem value='pending'>Pending</SelectItem>
            <SelectItem value='failed'>Failed</SelectItem>
            <SelectItem value='manual'>Manual</SelectItem>
          </SelectContent>
        </Select>

        {(filters.certificateType || filters.status || filters.syncStatus) && (
          <Button variant='glass' size='sm' onClick={handleResetFilters}>
            <RefreshCw className='size-4' />
            Reset Filters
          </Button>
        )}
      </div>

      {/* Actions Bar */}
      <ActionBar
        left={
          <Button variant='glass' size='sm' onClick={handleExport}>
            <Download className='size-4' />
            Export
          </Button>
        }
        right={
          canCreate && (
            <Button variant='primary' size='sm' onClick={handleCreate}>
              <Plus className='size-4' />
              Generate Certificate
            </Button>
          )
        }
      />

      {/* Main Table */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <ShieldCheck className='h-5 w-5' />
            All Certificates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={certificates}
            config={tableConfig}
            isLoading={isLoading}
            onSearch={(search: string) =>
              setFilters(prev => ({ ...prev, search, page: 1 }))
            }
            onFilterChange={(newFilters: Record<string, unknown>) =>
              setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
            }
          />
        </CardContent>
      </Card>
    </div>
  )
}
