// components/shared/ImagePreview/ImagePreview.tsx
'use client'

import { getCloudinaryUrl } from '@/lib/utils/cloudinary'
import Image from 'next/image'
import { useState } from 'react'

interface ImagePreviewProps {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
  transformations?: string[]
  fallbackSrc?: string
  priority?: boolean
  onError?: () => void
}

export function ImagePreview ({
  src,
  alt,
  className = '',
  width,
  height,
  transformations = ['q_auto', 'f_auto'],
  fallbackSrc = '/images/placeholder.jpg',
  priority = false,
  onError
}: ImagePreviewProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [imageSrc, setImageSrc] = useState(src)

  // Generate optimized Cloudinary URL
  const optimizedSrc = imageSrc.includes('cloudinary.com')
    ? getCloudinaryUrl(imageSrc.split('/').pop() || '', transformations)
    : imageSrc

  const handleError = () => {
    setHasError(true)
    if (fallbackSrc && fallbackSrc !== imageSrc) {
      setImageSrc(fallbackSrc)
    }
    onError?.()
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className='absolute inset-0 bg-muted animate-pulse rounded' />
      )}

      <Image
        src={hasError ? fallbackSrc : optimizedSrc}
        alt={alt}
        width={width}
        height={height}
        className={`
          transition-opacity duration-300
          ${isLoading ? 'opacity-0' : 'opacity-100'}
          rounded
          object-cover
        `}
        onLoad={() => setIsLoading(false)}
        onError={handleError}
        priority={priority}
        sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
        {...(width && height ? { width, height } : { fill: true })}
      />
    </div>
  )
}
