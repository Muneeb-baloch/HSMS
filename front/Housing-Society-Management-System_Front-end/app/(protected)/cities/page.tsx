// src/app/(dashboard)/cities/page.tsx
'use client'

import { ActionBar } from '@/components/shared/PageTemplate'
import { SummaryCard } from '@/components/shared/SummaryCard'
import { EnhancedDataTable as DataTable } from '@/components/shared/DataTable/DataTable'
import { EntityForm } from '@/components/shared/EntityForm/EntityForm'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { cityColumns } from '@/lib/constants/citycolum.constants'
import { cityFormFields } from '@/lib/constants/cityForm.constants'

import { hasPermission, UserRole } from '@/lib/constants/roles'
import {
  useCities,
  useCreateCity,
  useDeleteCity,
  useUpdateCity
} from '@/lib/hooks/entities/useCity'
import { useAuth } from '@/lib/hooks/useAuth'
import { CityFormData, citySchema } from '@/lib/schemas/city.schema'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { resetFilters, setFilters } from '@/lib/store/slices/citySlice'

import { City } from '@/lib/types/city'
import { Building2, MapPin, Plus, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function CitiesPage () {
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const router = useRouter()

  const filters = useAppSelector(state => state.cities?.filters || {})
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCity, setEditingCity] = useState<City | null>(null)

  const { data, isLoading, refetch } = useCities(filters)

  const deleteMutation = useDeleteCity()
  const createMutation = useCreateCity()
  const updateMutation = useUpdateCity()

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
    router.push('/cities/create')
  }

  const handleEdit = (id: string) => {
    router.push(`/cities/edit/${id}`)
  }

  const handleDelete = async (id: string) => {
    if (canDelete) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const handleSubmit = async (formData: unknown) => {
    const data = formData as CityFormData

    if (editingCity) {
      await updateMutation.mutateAsync({ id: editingCity._id, data })
    } else {
      await createMutation.mutateAsync(data)
    }

    setIsModalOpen(false)
  }

  const handleSearch = (search: string) => {
    dispatch(
      setFilters({
        search,
        searchFields: ['cityName'],
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

  const defaultCity = editingCity
    ? {
        ...editingCity,
        stateId:
          typeof editingCity.stateId === 'object'
            ? editingCity.stateId._id
            : editingCity.stateId,
        statusId:
          typeof editingCity.statusId === 'object'
            ? editingCity.statusId._id
            : editingCity.statusId
      }
    : undefined

  const tableConfig = {
    columns: cityColumns,
    filters: [
      {
        id: 'stateId',
        label: 'State',
        type: 'select' as const,
        options: [
          { label: 'States', value: 'all' }

          // Options will be populated dynamically from API
        ]
      },
      {
        id: 'statusId',
        label: 'Status',
        type: 'select' as const,
        options: [
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' }
        ]
      }
    ],
    enableActions: true,
    actions: {
      onEdit: canUpdate ? handleEdit : undefined,
      onDelete: canDelete ? handleDelete : undefined,
      customActions: [
        {
          label: 'View Cities',
          icon: <span>🏙️</span>,
          onClick: (row: City) => router.push(`/cities/view/${row._id}`),
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
        <h1 className='text-2xl font-bold text-foreground'>Cities</h1>
        <p className='mt-1 text-muted-foreground'>
          Manage cities and their information
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <SummaryCard
          title='Total Cities'
          value={total}
          icon={Building2}
          iconBgClassName='bg-blue-500/20'
          iconClassName='text-blue-400'
          gradient='from-blue-500/10 to-transparent'
        />
        <SummaryCard
          title='Active'
          value={data?.items?.filter((c: City) => c.isActive !== false).length ?? total}
          icon={MapPin}
          iconBgClassName='bg-emerald-500/20'
          iconClassName='text-emerald-400'
          gradient='from-emerald-500/10 to-transparent'
        />
      </div>

      <ActionBar
        left={
          <>
            {Object.keys(filters).length > 2 && (
              <Button variant='glass' size='sm' onClick={() => dispatch(resetFilters())}>
                <RefreshCw className='size-4' />
                Reset Filters
              </Button>
            )}
          </>
        }
        right={
          canCreate && (
            <Button variant='primary' size='sm' onClick={handleCreate}>
              <Plus className='size-4' />
              Add City
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
          onClose={() => setIsModalOpen(false)}
          title={editingCity ? 'Edit City' : 'Add New City'}
        >
          <EntityForm
            schema={citySchema}
            fields={cityFormFields}
            defaultValues={defaultCity}
            onSubmit={handleSubmit}
            onCancel={() => setIsModalOpen(false)}
            submitLabel={editingCity ? 'Update' : 'Create'}
            cancelLabel='Cancel'
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </Modal>
    </div>
  )
}
