// src/app/(dashboard)/installment-categories/reorder/page.tsx
'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import {
  useActiveInstallmentCategories,
  useReorderCategories
} from '@/lib/hooks/entities/useInstallmentCategory'
import { useAuth } from '@/lib/hooks/useAuth'
import { InstallmentCategory } from '@/lib/types/installmentCategory'
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ArrowLeft, GripVertical, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { customToast } from "@/lib/utils/customToast"
import { DetailPageSkeleton } from '@/components/shared/PageSkeleton'

interface SortableCategoryProps {
  category: InstallmentCategory
}

function SortableCategory ({ category }: SortableCategoryProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: category._id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className='flex items-center gap-4 p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow'
    >
      <div
        className='cursor-grab active:cursor-grabbing'
        {...attributes}
        {...listeners}
      >
        <GripVertical className='h-5 w-5 text-gray-400' />
      </div>
      <div className='flex-1'>
        <div className='flex justify-between items-center'>
          <div>
            <div className='font-semibold'>{category.instCatName}</div>
            {category.instCatDescription && (
              <div className='text-sm text-gray-500 mt-1'>
                {category.instCatDescription}
              </div>
            )}
          </div>
          <div className='flex items-center gap-4'>
            <div className='text-sm text-gray-600'>
              Current Order:{' '}
              <span className='font-bold'>{category.sequenceOrder}</span>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                category.isMandatory
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {category.isMandatory ? 'Mandatory' : 'Optional'}
            </div>
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                category.isRefundable
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {category.isRefundable ? 'Refundable' : 'Non-Refundable'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ReorderInstallmentCategoriesPage () {
  const router = useRouter()
  const { user } = useAuth()
  const {
    data: categories = [],
    isLoading,
    refetch
  } = useActiveInstallmentCategories()
  const reorderMutation = useReorderCategories()

  const [sortedCategories, setSortedCategories] = useState<
    InstallmentCategory[]
  >([])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const canReorder =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

  // Initialize sorted categories when data loads
  useEffect(() => {
    if (categories.length > 0 && sortedCategories.length === 0) {
      setSortedCategories(
        [...categories].sort((a, b) => a.sequenceOrder - b.sequenceOrder)
      )
    }
  }, [categories, sortedCategories.length])

  if (!canReorder) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to reorder categories.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.back()}>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setSortedCategories(items => {
        const oldIndex = items.findIndex(item => item._id === active.id)
        const newIndex = items.findIndex(item => item._id === over.id)

        const newItems = arrayMove(items, oldIndex, newIndex)

        // Update sequence order
        return newItems.map((item, index) => ({
          ...item,
          sequenceOrder: index + 1
        }))
      })
    }
  }

  const handleSave = async () => {
    try {
      const categoryOrders = sortedCategories.map((category, index) => ({
        id: category._id,
        sequenceOrder: index + 1
      }))

      await reorderMutation.mutateAsync({ categoryOrders })
      customToast.success('Categories reordered successfully')
      refetch()
    } catch (error) {
      customToast.error(
        'Failed to reorder categories' +
          (error instanceof Error ? `: ${error.message}` : '')
      )
    }
  }

  const handleReset = () => {
    setSortedCategories(
      [...categories].sort((a, b) => a.sequenceOrder - b.sequenceOrder)
    )
  }

  const handleCancel = () => {
    router.back()
  }

  if (isLoading) {
    return <DetailPageSkeleton />
  }

  return (
    <div className='p-6'>
      <div className='mb-6'>
        <Button variant='ghost' onClick={handleCancel} className='mb-4'>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back to Categories
        </Button>

        <h1 className='text-3xl font-bold'>Reorder Categories</h1>
        <p className='text-gray-500 mt-2'>
          Drag and drop to change the display order of installment categories.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Sequence</CardTitle>
          <CardDescription>
            Drag categories to rearrange. The order determines how categories
            appear in forms and reports.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-6'>
            {/* Instructions */}
            <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
              <div className='flex items-start gap-3'>
                <div className='p-2 bg-blue-100 rounded-full'>
                  <GripVertical className='h-5 w-5 text-blue-600' />
                </div>
                <div>
                  <h3 className='font-semibold text-blue-800'>
                    How to reorder
                  </h3>
                  <p className='text-blue-700 text-sm mt-1'>
                    1. Click and hold the grip icon on the left side of any
                    category
                    <br />
                    2. Drag it to your desired position
                    <br />
                    3. Release to drop the category in its new position
                    <br />
                    4. Click "Save Order" when you're finished
                  </p>
                </div>
              </div>
            </div>

            {/* Categories List */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sortedCategories.map(c => c._id)}
                strategy={verticalListSortingStrategy}
              >
                <div className='space-y-3'>
                  {sortedCategories.map(category => (
                    <SortableCategory key={category._id} category={category} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {/* Action Buttons */}
            <div className='flex justify-between items-center pt-6 border-t'>
              <div className='text-sm text-gray-500'>
                {sortedCategories.length} categories loaded
              </div>
              <div className='flex gap-3'>
                <Button variant='outline' onClick={handleReset}>
                  Reset to Original
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={reorderMutation.isPending}
                  className='bg-green-600 hover:bg-green-700'
                >
                  <Save className='mr-2 h-4 w-4' />
                  Save Order
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
