// src/app/(dashboard)/states/page.tsx
'use client'

import { ActionBar } from '@/components/shared/PageTemplate'
import { SummaryCard } from '@/components/shared/SummaryCard'
import { EnhancedDataTable as DataTable } from '@/components/shared/DataTable/DataTable'
import { EntityForm } from '@/components/shared/EntityForm/EntityForm'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import { statusColumns } from '@/lib/constants/statusColum.constants'
import { statusFormFields } from '@/lib/constants/statusForm.constants'
import {
  useCreateStatus,
  useDeleteStatus,
  useStatuses,
  useUpdateStatus
} from '@/lib/hooks/entities/useStatus'

import { useAuth } from '@/lib/hooks/useAuth'
import { statusSchema } from '@/lib/schemas/status.schema'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { setFilters } from '@/lib/store/slices/stateSlice'

import { CreateStatusDto, Status } from '@/lib/types/status'
import { CheckCircle2, Plus, List } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useConfirm } from "@/components/shared/ConfirmDialog";

export default function StatusesPage () {
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const router = useRouter()

  const filters = useAppSelector(state => state.status?.filters || {})
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { confirm } = useConfirm();
  const [editingStatus, setEditingStatus] = useState<Status | null>(null)

  const { data, isLoading, refetch } = useStatuses(filters)

  const deleteMutation = useDeleteStatus()
  const createMutation = useCreateStatus()
  const updateMutation = useUpdateStatus()

  const canCreate =
    user &&
    hasPermission(
      user.role as UserRole,
      [UserRole.ADMIN, UserRole.SUPER_ADMIN] as UserRole[]
    )

  const canUpdate =
    user &&
    hasPermission(
      user.role as UserRole,
      [UserRole.ADMIN, UserRole.SUPER_ADMIN] as UserRole[]
    )

  const canDelete =
    user &&
    hasPermission(
      user.role as UserRole,
      [UserRole.ADMIN, UserRole.SUPER_ADMIN] as UserRole[]
    )

  useEffect(() => {
    refetch()
  }, [filters, refetch])

  const handleCreate = () => {
    router.push('/status/create')
  }

  const handleEdit = (id: string) => {
    router.push(`/status/edit/${id}`)
  }

  const handleDelete = async (id: string) => {
    if (canDelete && await confirm({ title: "Delete", description: 'Are you sure you want to delete this status?', variant: "destructive" })) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const handleSubmit = async (formData: unknown) => {
    try {
      if (editingStatus) {
        await updateMutation.mutateAsync({
          id: editingStatus._id,
          data: formData as CreateStatusDto
        })
      } else {
        await createMutation.mutateAsync(formData as CreateStatusDto)
      }

      setIsModalOpen(false)
      setEditingStatus(null)
    } catch (error) {
      console.error('Error saving status:', error)
    }
  }

  const handleSearch = (search: string) => {
    dispatch(
      setFilters({
        search,
        searchFields: ['statusName', 'statusDescription'],
        page: 1
      })
    )
  }

  const handleFilterChange = (newFilters: Record<string, unknown>) => {
    dispatch(setFilters({ ...newFilters, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    dispatch(setFilters({ page }))
  }

  // Prepare default values for form
  const defaultValues = editingStatus
    ? {
        ...editingStatus
      }
    : undefined

  const tableConfig = {
    columns: statusColumns,
    filters: [
      {
        id: 'statusId',
        label: 'Status',
        type: 'select' as const,
        options: [
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' },
          { label: 'Pending', value: 'pending' }
        ]
      }
    ],
    enableActions: true,
    actions: {
      onEdit: canUpdate ? handleEdit : undefined,
      onDelete: canDelete ? handleDelete : undefined,
      customActions: [
        {
          label: 'View Status',
          icon: <span>🏙️</span>,
          onClick: (row: Status) => router.push(`/status/view/${row._id}`),
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
      : undefined,
    responsive: {
      showMobileView: true,
      stickyHeader: true
    }
  }

  const total = data?.pagination?.total ?? data?.items?.length ?? 0

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-foreground'>Statuses</h1>
        <p className='mt-1 text-muted-foreground'>
          Manage statuses and their information
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <SummaryCard
          title='Total Statuses'
          value={total}
          icon={List}
          iconBgClassName='bg-blue-500/20'
          iconClassName='text-blue-400'
          gradient='from-blue-500/10 to-transparent'
        />
        <SummaryCard
          title='Active'
          value={data?.items?.filter((s: Status) => s.isActive !== false).length ?? total}
          icon={CheckCircle2}
          iconBgClassName='bg-emerald-500/20'
          iconClassName='text-emerald-400'
          gradient='from-emerald-500/10 to-transparent'
        />
      </div>

      <ActionBar
        right={
          canCreate && (
            <Button variant='primary' size='sm' onClick={handleCreate}>
              <Plus className='size-4' />
              Add Status
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingStatus(null)
        }}
        title={editingStatus ? 'Edit State' : 'Add New State'}
      >
        <EntityForm
          schema={statusSchema}
          fields={statusFormFields}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false)
            setEditingStatus(null)
          }}
          submitLabel={editingStatus ? 'Update' : 'Create'}
          cancelLabel='Cancel'
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>
    </div>
  )
}
