'use client'

import * as React from 'react'

interface SkeletonProps {
  width?: string | number
  height?: string | number
  className?: string
  rounded?: boolean
}

export function Skeleton ({
  width = '100%',
  height = 12,
  className = '',
  rounded = true
}: SkeletonProps) {
  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    borderRadius: rounded ? '0.375rem' : 0
  }

  return (
    <div className={`skeleton ${className}`} style={style} aria-hidden='true' />
  )
}

export default Skeleton
