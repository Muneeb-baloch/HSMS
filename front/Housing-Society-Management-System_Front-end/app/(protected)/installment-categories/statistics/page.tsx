// src/app/(dashboard)/installment-categories/statistics/page.tsx
'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useInstallmentCategoryStatistics } from '@/lib/hooks/entities/useInstallmentCategory'
import {
  ArrowLeft,
  BarChart3,
  Database,
  Percent,
  PieChart,
  TrendingUp
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { StatsPageSkeleton } from '@/components/shared/PageSkeleton'

export default function InstallmentCategoryStatisticsPage () {
  const router = useRouter()
  const { data: stats, isLoading } = useInstallmentCategoryStatistics()

  if (isLoading) {
    return <StatsPageSkeleton />
  }

  return (
    <div className='p-6'>
      <Button variant='ghost' onClick={() => router.back()} className='mb-6'>
        <ArrowLeft className='mr-2 h-4 w-4' />
        Back
      </Button>

      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2'>Category Statistics</h1>
        <p className='text-gray-600'>
          Comprehensive overview of installment category distribution and
          performance
        </p>
      </div>

      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <div className='text-sm text-gray-500'>Total Categories</div>
                <div className='text-3xl font-bold'>
                  {stats?.totalCategories || 0}
                </div>
              </div>
              <div className='p-3 bg-blue-100 rounded-full'>
                <Database className='h-6 w-6 text-blue-600' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <div className='text-sm text-gray-500'>Active Categories</div>
                <div className='text-3xl font-bold'>
                  {stats?.activeCategories || 0}
                </div>
                <div className='text-sm text-green-600'>
                  {stats?.totalCategories
                    ? `${Math.round(
                        (stats.activeCategories / stats.totalCategories) * 100
                      )}% active`
                    : '0%'}
                </div>
              </div>
              <div className='p-3 bg-green-100 rounded-full'>
                <TrendingUp className='h-6 w-6 text-green-600' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <div className='text-sm text-gray-500'>
                  Mandatory Categories
                </div>
                <div className='text-3xl font-bold'>
                  {stats?.mandatoryCategories || 0}
                </div>
                <div className='text-sm text-blue-600'>
                  {stats?.activeCategories
                    ? `${Math.round(
                        (stats.mandatoryCategories / stats.activeCategories) *
                          100
                      )}% of active`
                    : '0%'}
                </div>
              </div>
              <div className='p-3 bg-orange-100 rounded-full'>
                <BarChart3 className='h-6 w-6 text-orange-600' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <div className='text-sm text-gray-500'>
                  Refundable Categories
                </div>
                <div className='text-3xl font-bold'>
                  {stats?.refundableCategories || 0}
                </div>
                <div className='text-sm text-purple-600'>
                  {stats?.activeCategories
                    ? `${Math.round(
                        (stats.refundableCategories / stats.activeCategories) *
                          100
                      )}% of active`
                    : '0%'}
                </div>
              </div>
              <div className='p-3 bg-purple-100 rounded-full'>
                <Percent className='h-6 w-6 text-purple-600' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Categories by Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <PieChart className='h-5 w-5' />
              Categories by Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {stats?.categoriesByType?.map((categoryType, index) => {
                const percentage =
                  stats.activeCategories > 0
                    ? Math.round(
                        (categoryType.count / stats.activeCategories) * 100
                      )
                    : 0

                return (
                  <div key={index} className='space-y-2'>
                    <div className='flex justify-between'>
                      <div className='flex items-center gap-2'>
                        <div
                          className={`w-3 h-3 rounded-full ${
                            categoryType.isMandatory &&
                            categoryType.isRefundable
                              ? 'bg-purple-500'
                              : categoryType.isMandatory
                              ? 'bg-blue-500'
                              : categoryType.isRefundable
                              ? 'bg-green-500'
                              : 'bg-gray-500'
                          }`}
                        ></div>
                        <span className='font-medium'>{categoryType.name}</span>
                      </div>
                      <div className='flex items-center gap-4'>
                        <div className='text-sm text-gray-600'>
                          {categoryType.isMandatory ? 'Mandatory' : 'Optional'}{' '}
                          •{' '}
                          {categoryType.isRefundable
                            ? 'Refundable'
                            : 'Non-Refundable'}
                        </div>
                        <div className='font-medium'>
                          {categoryType.count} ({percentage}%)
                        </div>
                      </div>
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-2'>
                      <div
                        className={`h-2 rounded-full ${
                          categoryType.isMandatory && categoryType.isRefundable
                            ? 'bg-purple-500'
                            : categoryType.isMandatory
                            ? 'bg-blue-500'
                            : categoryType.isRefundable
                            ? 'bg-green-500'
                            : 'bg-gray-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Summary Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <BarChart3 className='h-5 w-5' />
              Category Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-6'>
              {/* Active vs Inactive */}
              <div className='space-y-3'>
                <div className='flex justify-between'>
                  <span className='font-medium'>Active vs Inactive</span>
                  <span className='text-sm text-gray-600'>
                    {stats?.activeCategories || 0} /{' '}
                    {stats?.totalCategories || 0}
                  </span>
                </div>
                <div className='w-full bg-gray-200 rounded-full h-4'>
                  <div
                    className='h-4 rounded-full bg-green-500'
                    style={{
                      width: stats?.totalCategories
                        ? `${
                            (stats.activeCategories / stats.totalCategories) *
                            100
                          }%`
                        : '0%'
                    }}
                  ></div>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-green-600'>
                    Active ({stats?.activeCategories || 0})
                  </span>
                  <span className='text-gray-600'>
                    Inactive (
                    {(stats?.totalCategories || 0) -
                      (stats?.activeCategories || 0)}
                    )
                  </span>
                </div>
              </div>

              {/* Mandatory vs Optional */}
              <div className='space-y-3'>
                <div className='flex justify-between'>
                  <span className='font-medium'>Mandatory vs Optional</span>
                  <span className='text-sm text-gray-600'>
                    {stats?.mandatoryCategories || 0} /{' '}
                    {stats?.activeCategories || 0}
                  </span>
                </div>
                <div className='w-full bg-gray-200 rounded-full h-4'>
                  <div
                    className='h-4 rounded-full bg-blue-500'
                    style={{
                      width: stats?.activeCategories
                        ? `${
                            (stats.mandatoryCategories /
                              stats.activeCategories) *
                            100
                          }%`
                        : '0%'
                    }}
                  ></div>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-blue-600'>
                    Mandatory ({stats?.mandatoryCategories || 0})
                  </span>
                  <span className='text-gray-600'>
                    Optional (
                    {(stats?.activeCategories || 0) -
                      (stats?.mandatoryCategories || 0)}
                    )
                  </span>
                </div>
              </div>

              {/* Refundable vs Non-Refundable */}
              <div className='space-y-3'>
                <div className='flex justify-between'>
                  <span className='font-medium'>
                    Refundable vs Non-Refundable
                  </span>
                  <span className='text-sm text-gray-600'>
                    {stats?.refundableCategories || 0} /{' '}
                    {stats?.activeCategories || 0}
                  </span>
                </div>
                <div className='w-full bg-gray-200 rounded-full h-4'>
                  <div
                    className='h-4 rounded-full bg-purple-500'
                    style={{
                      width: stats?.activeCategories
                        ? `${
                            (stats.refundableCategories /
                              stats.activeCategories) *
                            100
                          }%`
                        : '0%'
                    }}
                  ></div>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-purple-600'>
                    Refundable ({stats?.refundableCategories || 0})
                  </span>
                  <span className='text-gray-600'>
                    Non-Refundable (
                    {(stats?.activeCategories || 0) -
                      (stats?.refundableCategories || 0)}
                    )
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
