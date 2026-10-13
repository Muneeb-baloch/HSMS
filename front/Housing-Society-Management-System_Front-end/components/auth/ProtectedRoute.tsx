'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
  fallback?: React.ReactNode
}

export default function AuthGuard ({
  children,
  requireAuth = true,
  redirectTo = '/login',
  fallback = null
}: AuthGuardProps) {
  const router = useRouter()
  const { isAuthenticated, isLoading, isInitialized } = useAuth()
  const [shouldRender, setShouldRender] = useState(false)
  const hasRedirectedRef = useRef(false)

  useEffect(() => {
    if (!isInitialized || isLoading) return

    // Use requestAnimationFrame to avoid synchronous updates
    const frameId = requestAnimationFrame(() => {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('accessToken')
          : null
      const actuallyAuthenticated = isAuthenticated || !!token

      let shouldRedirect = false
      let targetRoute = ''

      if (requireAuth && !actuallyAuthenticated) {
        shouldRedirect = true
        targetRoute = redirectTo
      } else if (!requireAuth && actuallyAuthenticated) {
        shouldRedirect = true
        targetRoute = '/dashboard'
      }

      if (shouldRedirect && !hasRedirectedRef.current) {
        hasRedirectedRef.current = true
        router.push(targetRoute)
      } else {
        setShouldRender(true)
      }
    })

    return () => cancelAnimationFrame(frameId)
  }, [
    isAuthenticated,
    isLoading,
    isInitialized,
    requireAuth,
    redirectTo,
    router
  ])

  // Show loading while checking
  if (isLoading || !isInitialized || !shouldRender) {
    return (
      fallback || (
        <div className='min-h-screen flex items-center justify-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
        </div>
      )
    )
  }

  // Final check before rendering
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
  const actuallyAuthenticated = isAuthenticated || !!token

  if (
    (requireAuth && !actuallyAuthenticated) ||
    (!requireAuth && actuallyAuthenticated)
  ) {
    // Still showing loading as redirect will happen
    return (
      fallback || (
        <div className='min-h-screen flex items-center justify-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
        </div>
      )
    )
  }

  return <>{children}</>
}
