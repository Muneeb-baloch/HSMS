// src/components/auth/ProtectedRoute.tsx
'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

export default function ProtectedRoute ({
  children,
  requireAuth = true,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)
  const [shouldRender, setShouldRender] = useState(false)
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    // Use setTimeout to defer the initial check
    const timer = setTimeout(() => {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('accessToken')
          : null
      const user =
        typeof window !== 'undefined' ? localStorage.getItem('user') : null

      const actuallyAuthenticated = !!token && !!user

      // Case 1: Protected route but not authenticated
      if (requireAuth && !actuallyAuthenticated) {
        // Don't redirect if already on login or callback page
        if (
          pathname.includes('/login') ||
          pathname.includes('/auth/google/callback')
        ) {
          setShouldRender(true)
          setIsChecking(false)
          return
        }

        // Redirect to login
        setRedirecting(true)
        window.location.href = `${redirectTo}?redirect=${encodeURIComponent(
          pathname
        )}`
        return
      }

      // Case 2: Public route but already authenticated
      if (!requireAuth && actuallyAuthenticated) {
        // Don't redirect if already on dashboard
        if (pathname.includes('/dashboard')) {
          setShouldRender(true)
          setIsChecking(false)
          return
        }

        // Redirect to dashboard
        setRedirecting(true)
        window.location.href = '/dashboard'
        return
      }

      // Case 3: All good, render children
      setShouldRender(true)
      setIsChecking(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [requireAuth, redirectTo, pathname])

  const authSkeleton = (
    <div className='min-h-screen flex items-center justify-center bg-background'>
      <div className='w-full max-w-xs space-y-4 p-6'>
        <Skeleton className='h-12 w-12 rounded-xl mx-auto' />
        <Skeleton className='h-4 w-40 mx-auto' />
        <div className='space-y-3'>
          <Skeleton className='h-10 w-full rounded-md' />
          <Skeleton className='h-10 w-full rounded-md' />
        </div>
        <Skeleton className='h-2 w-24 mx-auto rounded-full' />
      </div>
    </div>
  )

  if (isChecking) return authSkeleton
  if (redirecting) return authSkeleton
  if (shouldRender) return <>{children}</>
  return authSkeleton
}
