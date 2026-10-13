// src/components/plot-category/CategoryStats.tsx
'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { useCategoryStatistics } from '@/lib/hooks/entities/usePlotCategory'
import {
  CheckCircle,
  DollarSign,
  Loader2,
  Package,
  Percent,
  XCircle
} from 'lucide-react'

export function CategoryStats () {
  const { data: stats, isLoading } = useCategoryStatistics()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Category Statistics</CardTitle>
        </CardHeader>
        <CardContent className='flex justify-center py-8'>
          <Loader2 className='h-8 w-8 animate-spin' />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Statistics</CardTitle>
        <CardDescription>Overview of plot categories</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
          <div className='space-y-2'>
            <div className='flex items-center gap-2 text-gray-500'>
              <Package className='h-4 w-4' />
              <span className='text-sm'>Total Categories</span>
            </div>
            <div className='text-2xl font-bold'>
              {stats?.totalCategories || 0}
            </div>
          </div>

          <div className='space-y-2'>
            <div className='flex items-center gap-2 text-gray-500'>
              <CheckCircle className='h-4 w-4 text-green-500' />
              <span className='text-sm'>Active</span>
            </div>
            <div className='text-2xl font-bold'>
              {stats?.activeCategories || 0}
            </div>
          </div>

          <div className='space-y-2'>
            <div className='flex items-center gap-2 text-gray-500'>
              <Percent className='h-4 w-4 text-blue-500' />
              <span className='text-sm'>% Surcharge</span>
            </div>
            <div className='text-2xl font-bold'>
              {stats?.percentageSurchargeCount || 0}
            </div>
          </div>

          <div className='space-y-2'>
            <div className='flex items-center gap-2 text-gray-500'>
              <DollarSign className='h-4 w-4 text-green-500' />
              <span className='text-sm'>Fixed Surcharge</span>
            </div>
            <div className='text-2xl font-bold'>
              {stats?.fixedSurchargeCount || 0}
            </div>
          </div>

          <div className='space-y-2'>
            <div className='flex items-center gap-2 text-gray-500'>
              <XCircle className='h-4 w-4 text-gray-500' />
              <span className='text-sm'>No Surcharge</span>
            </div>
            <div className='text-2xl font-bold'>
              {(stats?.totalCategories || 0) -
                (stats?.percentageSurchargeCount || 0) -
                (stats?.fixedSurchargeCount || 0)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
