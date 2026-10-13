import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

/**
 * Skeleton for detail/view pages (e.g. /societies/[id], /roles/view/[id])
 */
export function DetailPageSkeleton() {
  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Skeleton className='h-8 w-8 rounded' />
          <div className='space-y-2'>
            <Skeleton className='h-7 w-48' />
            <Skeleton className='h-4 w-32' />
          </div>
        </div>
        <div className='flex gap-2'>
          <Skeleton className='h-8 w-20 rounded-md' />
          <Skeleton className='h-8 w-20 rounded-md' />
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Main content */}
        <div className='lg:col-span-2 space-y-6'>
          <Card>
            <CardHeader>
              <Skeleton className='h-5 w-36' />
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className='space-y-2'>
                    <Skeleton className='h-3 w-20' />
                    <Skeleton className='h-5 w-32' />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className='h-5 w-28' />
            </CardHeader>
            <CardContent className='space-y-3'>
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className='h-12 w-full rounded-lg' />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <Skeleton className='h-5 w-24' />
            </CardHeader>
            <CardContent className='space-y-3'>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className='flex justify-between'>
                  <Skeleton className='h-4 w-16' />
                  <Skeleton className='h-4 w-20' />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className='h-5 w-28' />
            </CardHeader>
            <CardContent className='space-y-2'>
              <Skeleton className='h-9 w-full rounded-md' />
              <Skeleton className='h-9 w-full rounded-md' />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

/**
 * Skeleton for edit/form pages
 */
export function FormPageSkeleton() {
  return (
    <div className='p-6 space-y-6'>
      <div className='flex items-center gap-3'>
        <Skeleton className='h-8 w-8 rounded' />
        <Skeleton className='h-7 w-40' />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className='h-5 w-32' />
          <Skeleton className='h-4 w-56' />
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className='space-y-2'>
                <Skeleton className='h-4 w-24' />
                <Skeleton className='h-10 w-full rounded-md' />
              </div>
            ))}
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-28' />
            <Skeleton className='h-24 w-full rounded-md' />
          </div>
          <div className='flex gap-3 justify-end'>
            <Skeleton className='h-10 w-24 rounded-md' />
            <Skeleton className='h-10 w-24 rounded-md' />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Skeleton for list/table pages
 */
export function ListPageSkeleton() {
  return (
    <div className='p-6 space-y-6'>
      <div className='space-y-2'>
        <Skeleton className='h-7 w-40' />
        <Skeleton className='h-4 w-64' />
      </div>

      <div className='flex items-center justify-between'>
        <Skeleton className='h-9 w-32 rounded-md' />
        <Skeleton className='h-9 w-36 rounded-md' />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className='h-5 w-28' />
        </CardHeader>
        <CardContent>
          {/* Search bar */}
          <Skeleton className='h-10 w-full max-w-sm rounded-md mb-4' />
          {/* Table header */}
          <div className='flex gap-4 py-3 border-b'>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className='h-4 flex-1' />
            ))}
          </div>
          {/* Table rows */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className='flex gap-4 py-4 border-b last:border-0'>
              {Array.from({ length: 5 }).map((_, j) => (
                <Skeleton key={j} className='h-4 flex-1' />
              ))}
            </div>
          ))}
          {/* Pagination */}
          <div className='flex items-center justify-between pt-4'>
            <Skeleton className='h-4 w-32' />
            <div className='flex gap-2'>
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className='h-8 w-8 rounded' />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Skeleton for statistics/analytics pages
 */
export function StatsPageSkeleton() {
  return (
    <div className='p-6 space-y-6'>
      <div className='flex items-center gap-3'>
        <Skeleton className='h-8 w-8 rounded' />
        <Skeleton className='h-7 w-40' />
      </div>

      {/* Stat cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className='p-6'>
              <Skeleton className='h-4 w-20 mb-2' />
              <Skeleton className='h-8 w-16' />
              <Skeleton className='h-3 w-24 mt-2' />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <Skeleton className='h-5 w-32' />
          </CardHeader>
          <CardContent>
            <Skeleton className='h-64 w-full rounded-lg' />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className='h-5 w-28' />
          </CardHeader>
          <CardContent>
            <Skeleton className='h-64 w-full rounded-lg' />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/**
 * Simple inline skeleton for content areas (replaces inline spinners)
 */
export function InlineSkeleton() {
  return (
    <div className='flex items-center justify-center h-32'>
      <div className='w-full max-w-md space-y-3'>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className='h-4 w-full' />
        ))}
      </div>
    </div>
  )
}
