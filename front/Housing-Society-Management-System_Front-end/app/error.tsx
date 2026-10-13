'use client'

import {
  AnimatedIcon,
  GlassErrorCard,
  SpecialPageLayout
} from '@/components/special-pages'
import { IconAlertTriangle } from '@tabler/icons-react'
import { Link } from 'lucide-react'
import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error ({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  const isDev = process.env.NODE_ENV === 'development'

  return (
    <SpecialPageLayout>
      <GlassErrorCard>
        <div className='text-center'>
          <AnimatedIcon variant='shake' className='mb-6 flex justify-center'>
            <IconAlertTriangle
              className='size-12 text-amber-400/90'
              aria-hidden
            />
          </AnimatedIcon>
          <h1 className='mb-2 text-xl font-bold text-white sm:text-4xl'>
            Something Went Wrong in the Society
          </h1>
          <p className='mb-4 text-white/70'>
            We hit a snag. You can try again or head back home.
          </p>
          {isDev && (
            <div className='mb-6 rounded-xl border border-white/10 bg-white/5 p-4 text-left'>
              <p className='mb-1 text-xs font-semibold uppercase tracking-wider text-white/50'>
                Error (dev only)
              </p>
              <p className='text-sm text-red-300 break-all'>{error.message}</p>
            </div>
          )}
          {!isDev && error.digest && (
            <p className='mb-6 text-xs text-white/50'>
              Reference: {error.digest}
            </p>
          )}
          <div className='flex flex-col gap-3 sm:flex-row sm:justify-center'>
            <button
              type='button'
              onClick={reset}
              className='inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:scale-105 hover:shadow-xl hover:shadow-blue-600/30 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900'
            >
              Try Again
            </button>
            <Link
              href='/'
              className='inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-8 py-3.5 font-medium text-white transition-all hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-gray-900'
            >
              Back to Home
            </Link>
          </div>
        </div>
      </GlassErrorCard>
    </SpecialPageLayout>
  )
}
