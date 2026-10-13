// src/app/(dashboard)/installments/categories/page.tsx
'use client'

import { ActionBar } from '@/components/shared/PageTemplate'
import { SummaryCard } from '@/components/shared/SummaryCard'
import { EnhancedDataTable as DataTable } from '@/components/shared/DataTable/DataTable'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useInstallmentCategories } from '@/lib/hooks/entities/useInstallmentCategory'
import type { InstallmentCategory } from '@/lib/types/installmentCategory'
import { Folder, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useConfirm } from "@/components/shared/ConfirmDialog";

export default function InstallmentCategoriesPage () {
  const router = useRouter()
  const { confirm } = useConfirm();
  const { data: categories, isLoading } = useInstallmentCategories()

  const columns = [
    {
      id: 'instCatName',
      header: 'Category Name',
      cell: (row: InstallmentCategory) => row.instCatName,
      sortable: true
    },
    {
      id: 'instCatDescription',
      header: 'Description',
      cell: (row: InstallmentCategory) => row.instCatDescription || '-'
    },
    {
      id: 'isRefundable',
      header: 'Refundable',
      cell: (row: InstallmentCategory) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.isRefundable
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {row.isRefundable ? 'Yes' : 'No'}
        </span>
      )
    },
    {
      id: 'isActive',
      header: 'Status',
      cell: (row: InstallmentCategory) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    }
  ]

  const handleCreate = () => {
    router.push('/installments/categories/create')
  }

  const tableConfig = {
    columns,
    enableActions: true,
    actions: {
      onEdit: (id: string) =>
        router.push(`/installments/categories/edit/${id}`),
      onDelete: async (id: string) => {
        if (await confirm({ title: "Delete", description: 'Are you sure you want to delete this category?', variant: "destructive" })) {
          // TODO: implement delete logic
        }
      }
    }
  }

  const total = categories?.items?.length ?? categories?.pagination?.total ?? 0

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-foreground'>
          Installment Categories
        </h1>
        <p className='mt-1 text-muted-foreground'>
          Manage different types of installment categories
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <SummaryCard
          title='Total Categories'
          value={total}
          icon={Folder}
          iconBgClassName='bg-blue-500/20'
          iconClassName='text-blue-400'
          gradient='from-blue-500/10 to-transparent'
        />
      </div>

      <ActionBar
        right={
          <Button variant='primary' size='sm' onClick={handleCreate}>
            <Plus className='size-4' />
            Add Category
          </Button>
        }
      />

      <Card>
        <CardContent className='pt-6'>
          <DataTable
            data={categories?.items || []}
            config={tableConfig}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  )
}
