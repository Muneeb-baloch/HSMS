'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'

interface PageTransitionProps {
  children: React.ReactNode
  className?: string
  appear?: boolean
}

export function PageTransition ({
  children,
  className = '',
  appear = true
}: PageTransitionProps) {
  const [mounted, setMounted] = useState(!appear)

  useEffect(() => {
    if (appear) {
      // mount on client to trigger entrance animation
      const t = setTimeout(() => setMounted(true), 10)
      return () => clearTimeout(t)
    }
  }, [appear])

  // If not mounted yet, render nothing (avoids flicker)
  if (!mounted) return null

  return <div className={`animate-fade-in ${className}`}>{children}</div>
}

export default PageTransition
