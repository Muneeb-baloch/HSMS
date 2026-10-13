// src/app/(dashboard)/members/page.tsx
'use client'

import {
  EnhancedDataTable as DataTable,
  TableColumn
} from '@/components/shared/DataTable/DataTable'
import { ActionBar } from '@/components/shared/PageTemplate'
import { SummaryCard } from '@/components/shared/SummaryCard'
import { Button } from '@/components/ui/button'
import { PERMISSIONS, UserRole, hasPermission } from '@/lib/constants/roles'
import { useDeleteMember, useMembers } from '@/lib/hooks/entities/useMember'
import { useAuth } from '@/lib/hooks/useAuth'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { resetFilters, setFilters } from '@/lib/store/slices/memberSlice'
import { Member } from '@/lib/types/entity'
import { Plus, RefreshCw, UserCheck, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
const memberColumns: TableColumn<Member>[] = [
  {
    id: 'memImg',
    header: 'Image',
    accessorKey: 'memImg',
    isImage: true,
    imageAltKey: 'memName',
    width: '70'
  },
  {
    id: 'memRegNo',
    header: 'Reg No',
    accessorKey: 'memRegNo',
    sortable: true,
    width: '120'
  },
  {
    id: 'memName',
    header: 'Name',
    accessorKey: 'memName',
    sortable: true,
    width: '180'
  },
  {
    id: 'memNic',
    header: 'NIC',
    accessorKey: 'memNic',
    width: '140'
  },
  {
    id: 'gender',
    header: 'Gender',
    accessorKey: 'gender',
    cell: row => row.gender || 'N/A',
    width: '100'
  },
  {
    id: 'dateOfBirth',
    header: 'Date of Birth',
    accessorKey: 'dateOfBirth',
    cell: row =>
      row.dateOfBirth ? new Date(row.dateOfBirth).toLocaleDateString() : 'N/A',
    width: '120'
  },
  {
    id: 'memFHName',
    header: 'Father/Husband',
    accessorKey: 'memFHName',
    cell: row => row.memFHName || 'N/A',
    width: '150'
  },
  {
    id: 'memFHRelation',
    header: 'Relation',
    accessorKey: 'memFHRelation',
    cell: row => row.memFHRelation || 'N/A',
    width: '100'
  },
  {
    id: 'memAddr1',
    header: 'Address',
    accessorKey: 'memAddr1',
    cell: row => (
      <div
        className='max-w-xs truncate'
        title={`${row.memAddr1} ${row.memAddr2 || ''} ${row.memAddr3 || ''}`}
      >
        {row.memAddr1}
        {row.memAddr2 && `, ${row.memAddr2}`}
        {row.memAddr3 && `, ${row.memAddr3}`}
      </div>
    ),
    width: '250'
  },
  {
    id: 'memContMob',
    header: 'Mobile',
    accessorKey: 'memContMob',
    width: '130'
  },
  {
    id: 'memContEmail',
    header: 'Email',
    accessorKey: 'memContEmail',
    cell: row => row.memContEmail || 'N/A',
    width: '200'
  },
  {
    id: 'memContRes',
    header: 'Res Phone',
    accessorKey: 'memContRes',
    cell: row => row.memContRes || 'N/A',
    width: '120'
  },
  {
    id: 'memContWork',
    header: 'Work Phone',
    accessorKey: 'memContWork',
    cell: row => row.memContWork || 'N/A',
    width: '120'
  },
  {
    id: 'memIsOverseas',
    header: 'Overseas',
    accessorKey: 'memIsOverseas',
    cell: row => (
      <span
        className={`px-2 py-1 rounded text-xs ${
          row.memIsOverseas
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-green-100 text-green-800'
        }`}
      >
        {row.memIsOverseas ? 'Yes' : 'No'}
      </span>
    ),
    width: '100'
  },
  {
    id: 'memOccupation',
    header: 'Occupation',
    accessorKey: 'memOccupation',
    cell: row => row.memOccupation || 'N/A',
    width: '150'
  },
  {
    id: 'memCountry',
    header: 'Country',
    accessorKey: 'memCountry',
    cell: row => row.memCountry || 'N/A',
    width: '120'
  },
  {
    id: 'status',
    header: 'Status',
    cell: row =>
      row.statusId && typeof row.statusId === 'object'
        ? row.statusId.statusName
        : row.statusId || 'N/A',
    width: '120'
  },
  {
    id: 'createdAt',
    header: 'Created',
    accessorKey: 'createdAt',
    cell: row => new Date(row.createdAt).toLocaleDateString(),
    sortable: true,
    width: '120'
  },
  {
    id: 'updatedAt',
    header: 'Updated',
    accessorKey: 'updatedAt',
    cell: row => new Date(row.updatedAt).toLocaleDateString(),
    sortable: true,
    width: '120'
  }
]


export default function MembersPage () {
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const router = useRouter()

  const filters = useAppSelector(state => state.members.filters)

  // Create clean filters
const cleanFilters = { ...filters }
// Remove memIsOverseas if it's false
if (cleanFilters.memIsOverseas === false) {
  delete cleanFilters.memIsOverseas
}

const { data, isLoading, error, refetch } = useMembers(cleanFilters)

  const deleteMutation = useDeleteMember()

  const canCreate =
    user &&
    hasPermission(
      user.role as UserRole,
      [UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN] as UserRole[]
    )

  const canUpdate =
    user &&
    hasPermission(
      user.role as UserRole,
      [UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN] as UserRole[]
    )
  const canDelete =
    user &&
    hasPermission(
      user.role as UserRole,
      [UserRole.ADMIN, UserRole.SUPER_ADMIN] as UserRole[]
    )

  useEffect(() => {
    // Initial fetch
    refetch()
  }, [filters, refetch])

  const handleCreate = () => {
    router.push('/members/create')
  }

  const handleEdit = (id: string) => {
    router.push(`/members/edit/${id}`)
  }

  const handleDelete = async (id: string) => {
    if (canDelete) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const handleSearch = (search: string) => {
    console.log('👤 Members Page - handleSearch called with:', search)
    dispatch(setFilters({ search,searchFields: ['memName', 'memNic', 'memContMob'], page: 1 }))
    console.log('👤 Members Page - setFilters dispatched')
  }

  const handleFilterChange = (newFilters: Record<string, unknown>) => {
    dispatch(setFilters({ ...newFilters, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    dispatch(setFilters({ page }))
  }

  const tableConfig = {
    columns: memberColumns,
    filters: [
      {
        id: 'memIsOverseas',
        label: 'Overseas',
        type: 'select' as const,
        options: [
          { label: 'Yes', value: 'true' },
          { label: 'No', value: 'false' }
        ]
      }
    ],
    enableActions: true,
    userRole: user?.role as UserRole | undefined,
    requiredRoleForEdit: [...PERMISSIONS.MEMBER.UPDATE],
    requiredRoleForDelete: [...PERMISSIONS.MEMBER.DELETE],
    actions: {
      onEdit: canUpdate ? handleEdit : undefined,
      onDelete: canDelete ? handleDelete : undefined,
            customActions: [
              {
                label: 'View Cities',
                icon: <span>🏙️</span>,
                onClick: (row: Member) => router.push(`/members/view/${row._id}`),
                variant: 'outline' as const
              }
            ]
    },
    pagination: data?.pagination
      ? {
          currentPage: data.pagination.page,
          totalPages: data.pagination.pages,
          onPageChange: handlePageChange,
          pageSize: data.pagination.limit,
          onPageSizeChange: (size: number) =>
            dispatch(setFilters({ limit: size, page: 1 })),
          totalItems: data.pagination.total
        }
      : undefined
  }

  const total = data?.pagination?.total ?? data?.items?.length ?? 0
  const activeCount =
    data?.items?.filter(
      (m: Member) =>
        m.statusId &&
        (typeof m.statusId === 'object'
          ? (m.statusId as { statusName?: string }).statusName?.toLowerCase() ===
            'active'
          : false)
    ).length ?? 0

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-foreground'>Members</h1>
        <p className='mt-1 text-muted-foreground'>
          Manage the complete lifecycle of housing society projects
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <SummaryCard
          title='Total Members'
          value={total}
          icon={Users}
          iconBgClassName='bg-blue-500/20'
          iconClassName='text-blue-400'
          gradient='from-blue-500/10 to-transparent'
        />
        <SummaryCard
          title='Active'
          value={activeCount || total}
          icon={UserCheck}
          iconBgClassName='bg-emerald-500/20'
          iconClassName='text-emerald-400'
          gradient='from-emerald-500/10 to-transparent'
        />
      </div>

      <ActionBar
        left={
          Object.keys(filters).length > 4 ? (
            <Button
              variant='glass'
              size='sm'
              onClick={() => dispatch(resetFilters())}
            >
              <RefreshCw className='size-4' />
              Reset Filters
            </Button>
          ) : undefined
        }
        right={
          canCreate && (
            <Button variant='primary' size='sm' onClick={handleCreate}>
              <Plus className='size-4' />
              Add Member
            </Button>
          )
        }
      />

      <DataTable
        data={data?.items || []}
        config={tableConfig}
        isLoading={isLoading}
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
      />

    </div>
  )
}
