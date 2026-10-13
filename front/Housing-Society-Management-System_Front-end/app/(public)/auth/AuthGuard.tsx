// src/components/auth/AuthGuard.tsx (Simpler Alternative)
'use client'

import { useAuthStatus } from '@/lib/hooks/useAuth'
import { Skeleton } from '@/components/ui/skeleton'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

interface AuthGuardProps {
  children: React.ReactNode
  type: 'protected' | 'public'
}

function AuthSkeleton() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-background'>
      <div className='w-full max-w-xs space-y-4 p-6'>
        <Skeleton className='h-12 w-12 rounded-xl mx-auto' />
        <Skeleton className='h-4 w-36 mx-auto' />
        <div className='space-y-3'>
          <Skeleton className='h-10 w-full rounded-md' />
          <Skeleton className='h-10 w-full rounded-md' />
        </div>
        <Skeleton className='h-2 w-24 mx-auto rounded-full' />
      </div>
    </div>
  )
}

export default function AuthGuard ({ children, type }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuthStatus()
  const pathname = usePathname()
  const [shouldRender, setShouldRender] = useState(false)
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    if (isLoading) return

    const token =
      typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    const actuallyAuthenticated = isAuthenticated || !!token

    if (type === 'protected' && !actuallyAuthenticated) {
      // User needs to be authenticated but isn't
      if (!redirecting && !pathname.includes('/login')) {
        setRedirecting(true)
        window.location.href = `/login?redirect=${encodeURIComponent(pathname)}`
      }
      setShouldRender(false)
    } else if (type === 'public' && actuallyAuthenticated) {
      // User is authenticated but on public page
      if (!redirecting && !pathname.includes('/dashboard')) {
        setRedirecting(true)
        window.location.href = '/dashboard'
      }
      setShouldRender(false)
    } else {
      setShouldRender(true)
    }
  }, [isAuthenticated, isLoading, type, pathname, redirecting])

  if (isLoading) return <AuthSkeleton />
  if (redirecting) return <AuthSkeleton />
  if (!shouldRender) return null

  return <>{children}</>
}
