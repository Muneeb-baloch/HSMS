// components/shared/ImageUpload/ImageUpload.tsx
'use client'

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { uploadApi } from '@/lib/API/upload-api'
import { EntityType } from '@/lib/types/upload.types'
import { cn } from '@/lib/utils'
import { formatBytes } from '@/lib/utils/file.utils'
import { ImageIcon, Loader2, Trash2, Upload, X } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { customToast } from "@/lib/utils/customToast"

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  onRemove?: () => void
  disabled?: boolean
  entityType: EntityType
  entityId: string
  uploadedBy: string
  maxSize?: number
  className?: string
  aspectRatio?: 'square' | 'video' | 'custom'
  height?: number
  width?: number
}

export function ImageUpload ({
  value,
  onChange,
  onRemove,
  disabled = false,
  entityType,
  entityId,
  uploadedBy,
  maxSize = 5 * 1024 * 1024, // 5MB default
  className,
  aspectRatio = 'square',
  height = 400,
  width = 400
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [preview, setPreview] = useState<string | null>(null)

  // Handle image preview
  const handlePreview = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }, [])

  // Upload to Cloudinary via backend
  const uploadToCloudinary = async (file: File): Promise<string> => {
    try {
      setIsUploading(true)
      setUploadProgress(0)

      // Simulate progress (real progress would come from axios onUploadProgress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      const uploadedFile = await uploadApi.uploadSingle({
        file,
        entityType,
        entityId,
        uploadedBy
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      // Return Cloudinary URL
      return uploadedFile.secureUrl
    } catch (error: any) {
      console.error('Upload failed:', error)

      let errorMessage = 'Upload failed'
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }

      customToast.error(errorMessage)
      throw error
    } finally {
      setIsUploading(false)
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: any[]) => {
      if (rejectedFiles.length > 0) {
        const firstRejected = rejectedFiles[0]
        if (firstRejected.errors[0]?.code === 'file-too-large') {
          customToast.error(`File too large. Max size: ${formatBytes(maxSize)}`)
        } else {
          customToast.error('Invalid file type. Only images are allowed.')
        }
        return
      }

      if (acceptedFiles.length === 0) return

      const file = acceptedFiles[0]
      // Preview
      handlePreview(file)

      try {
        // Upload to Cloudinary
        const imageUrl = await uploadToCloudinary(file)

        // Update form with Cloudinary URL
        onChange(imageUrl)

        customToast.success('Image uploaded successfully')
      } catch (error) {
        console.error('Upload error:', error)
        setPreview(null)
      }
    },
    [onChange, handlePreview, maxSize, entityType, entityId, uploadedBy]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']
    },
    disabled: disabled || isUploading,
    multiple: false
  })

  const handleRemove = () => {
    if (onRemove) {
      onRemove()
    } else {
      onChange('')
    }
    setPreview(null)
    customToast.success('Image removed')
  }

  return (
    <div className={cn('space-y-4 w-full max-w-full min-w-0', className)}>
      {/* Current Image Preview */}
      {value && !preview && (
        <div className='relative group w-full max-w-full'>
          <div
            className={cn(
              'relative rounded-lg overflow-hidden border w-full max-w-full',
              aspectRatio === 'square' && 'aspect-square max-w-full sm:max-w-[280px]',
              aspectRatio === 'video' && 'aspect-video',
              aspectRatio === 'custom' && 'min-h-[120px]'
            )}
            style={
              aspectRatio === 'custom'
                ? { height: `${Math.min(height, 280)}px` }
                : undefined
            }
          >
            <Image
              src={value}
              alt='Profile image'
              fill
              className='object-cover'
              sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px'
            />
          </div>
          {!disabled && (
            <Button
              type='button'
              variant='destructive'
              size='icon'
              className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity'
              onClick={handleRemove}
            >
              <Trash2 className='h-4 w-4' />
            </Button>
          )}
        </div>
      )}

      {/* Upload Preview */}
      {preview && (
        <div className='relative group w-full max-w-full'>
          <div
            className={cn(
              'relative rounded-lg overflow-hidden border w-full max-w-full',
              aspectRatio === 'square' && 'aspect-square max-w-full sm:max-w-[280px]',
              aspectRatio === 'video' && 'aspect-video',
              aspectRatio === 'custom' && 'min-h-[120px]'
            )}
            style={
              aspectRatio === 'custom'
                ? { height: `${Math.min(height, 280)}px` }
                : undefined
            }
          >
            <Image
              src={preview}
              alt='Upload preview'
              fill
              className='object-cover'
              sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px'
            />
          </div>
          {isUploading ? (
            <div className='absolute inset-0 bg-black/50 flex items-center justify-center'>
              <div className='text-center text-white'>
                <Loader2 className='h-8 w-8 animate-spin mx-auto mb-2' />
                <p className='text-sm'>Uploading... {uploadProgress}%</p>
              </div>
            </div>
          ) : (
            <Button
              type='button'
              variant='destructive'
              size='icon'
              className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity'
              onClick={() => {
                setPreview(null)
                onChange('')
              }}
            >
              <X className='h-4 w-4' />
            </Button>
          )}
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && uploadProgress > 0 && (
        <Progress value={uploadProgress} className='h-2' />
      )}

      {/* Upload Area */}
      {(!value && !preview) || (value && !disabled) ? (
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors w-full max-w-full min-w-0',
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-muted-foreground/50',
            (disabled || isUploading) && 'opacity-50 cursor-not-allowed'
          )}
        >
          <input {...getInputProps()} className='enhanced-input h-11' />

          {isUploading ? (
            <div className='space-y-2'>
              <Loader2 className='h-8 w-8 animate-spin mx-auto text-muted-foreground' />
              <p className='text-sm font-medium'>Uploading...</p>
              <p className='text-xs text-muted-foreground'>Please wait</p>
            </div>
          ) : (
            <div className='space-y-2'>
              <Upload className='h-8 w-8 mx-auto text-muted-foreground' />
              <div>
                <p className='text-sm font-medium'>
                  {isDragActive ? 'Drop image here' : 'Upload image'}
                </p>
                <p className='text-xs text-muted-foreground mt-1'>
                  Drag & drop or click to browse
                </p>
                <p className='text-xs text-muted-foreground mt-1'>
                  Max size: {formatBytes(maxSize)}
                </p>
              </div>
              <Button
                type='button'
                variant='outline'
                size='sm'
                disabled={disabled || isUploading}
                className='mt-2'
              >
                <ImageIcon className='mr-2 h-4 w-4' />
                Select Image
              </Button>
            </div>
          )}
        </div>
      ) : null}

      {/* Current URL Display (for debugging/fallback) */}
      {value && process.env.NODE_ENV === 'development' && (
        <div className='text-xs text-muted-foreground truncate'>
          URL: {value}
        </div>
      )}
    </div>
  )
}
