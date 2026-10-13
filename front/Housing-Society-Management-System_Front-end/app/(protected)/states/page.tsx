// src/app/(dashboard)/states/page.tsx
'use client'

import { ActionBar } from '@/components/shared/PageTemplate'
import { SummaryCard } from '@/components/shared/SummaryCard'
import { EnhancedDataTable as DataTable } from '@/components/shared/DataTable/DataTable'
import { EntityForm } from '@/components/shared/EntityForm/EntityForm'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import { stateColumns } from '@/lib/constants/stateColum.constants'
import { stateFormFields } from '@/lib/constants/stateFrom.constants'
import {
  useCreateState,
  useDeleteState,
  useStates,
  useUpdateState
} from '@/lib/hooks/entities/useState'

import { useAuth } from '@/lib/hooks/useAuth'
import { stateSchema } from '@/lib/schemas/state.schema'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { setFilters } from '@/lib/store/slices/stateSlice'

import { CreateStateDto, State } from '@/lib/types/state'
import { Map, Plus, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function StatesPage () {
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const router = useRouter()

  const filters = useAppSelector(state => state.states?.filters || {})
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingState, setEditingState] = useState<State | null>(null)

  const { data, isLoading, refetch } = useStates(filters)

  const deleteMutation = useDeleteState()
  const createMutation = useCreateState()
  const updateMutation = useUpdateState()

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
    router.push('/states/create')
  }

  const handleEdit = (id: string) => {
    router.push(`/states/edit/${id}`)
  }

  const handleDelete = async (id: string) => {
    if (canDelete) await deleteMutation.mutateAsync(id)
  }

  const handleSubmit = async (formData: unknown) => {
    try {
      if (editingState) {
        await updateMutation.mutateAsync({
          id: editingState._id,
          data: formData as CreateStateDto
        })
      } else {
        await createMutation.mutateAsync(formData as CreateStateDto)
      }

      setIsModalOpen(false)
      setEditingState(null)
    } catch (error) {
      console.error('Error saving state:', error)
    }
  }

  const handleSearch = (search: string) => {
    dispatch(
      setFilters({
        search,
        searchFields: ['stateName', 'stateDescription'],
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
  const defaultValues = editingState
    ? {
        ...editingState,
        statusId:
          typeof editingState.statusId === 'object'
            ? editingState.statusId._id
            : editingState.statusId
      }
    : undefined

  const tableConfig = {
    columns: stateColumns,
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
          label: 'View State',
          icon: <span>🏙️</span>,
          onClick: (row: State) => router.push(`/states/view/${row._id}`),
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
        <h1 className='text-2xl font-bold text-foreground'>States</h1>
        <p className='mt-1 text-muted-foreground'>
          Manage states and their information
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <SummaryCard
          title='Total States'
          value={total}
          icon={Map}
          iconBgClassName='bg-blue-500/20'
          iconClassName='text-blue-400'
          gradient='from-blue-500/10 to-transparent'
        />
        <SummaryCard
          title='Active'
          value={data?.items?.filter((s: State) => s.isActive !== false).length ?? total}
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
              Add State
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
            setEditingState(null)
          }}
          title={editingState ? 'Edit State' : 'Add New State'}
        >
          <EntityForm
            schema={stateSchema}
            fields={stateFormFields}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsModalOpen(false)
              setEditingState(null)
            }}
            submitLabel={editingState ? 'Update' : 'Create'}
            cancelLabel='Cancel'
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </Modal>
    </div>
  )
}
