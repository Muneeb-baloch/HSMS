'use client'

import { Progress } from '@/components/ui/progress'
import { uploadApi } from '@/lib/API/upload-api'
import { EntityType } from '@/lib/types/upload.types'
import { cn } from '@/lib/utils'
import { formatBytes } from '@/lib/utils/file.utils'
import { Loader2, Upload } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { customToast } from "@/lib/utils/customToast"

const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPT = { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] }

interface UploadAvatarProps {
  value?: string
  onChange: (url: string) => void
  userId: string
  disabled?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'h-20 w-20',
  md: 'h-28 w-28',
  lg: 'h-36 w-36',
}

export function UploadAvatar({
  value,
  onChange,
  userId,
  disabled = false,
  className,
  size = 'md',
}: UploadAvatarProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [preview, setPreview] = useState<string | null>(null)

  const handlePreview = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)
  }, [])

  const uploadFile = async (file: File): Promise<string> => {
    setIsUploading(true)
    setUploadProgress(0)
    const progressInterval = setInterval(() => {
      setUploadProgress((p) => (p >= 90 ? 90 : p + 10))
    }, 80)

    try {
      const result = await uploadApi.uploadSingle(
        {
          file,
          entityType: EntityType.USER,
          entityId: userId,
          uploadedBy: userId,
          metadata: { purpose: 'avatar' },
        },
        {
          onUploadProgress: (e) => {
            if (e.total) {
              const pct = Math.round((e.loaded / e.total) * 100)
              setUploadProgress(pct)
            }
          },
        }
      )
      clearInterval(progressInterval)
      setUploadProgress(100)
      return result.secureUrl
    } catch (err: any) {
      clearInterval(progressInterval)
      const msg = err.response?.data?.message || err.message || 'Upload failed'
      customToast.error(msg)
      throw err
    } finally {
      setIsUploading(false)
      setTimeout(() => setUploadProgress(0), 800)
    }
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: { errors: { code: string }[] }[]) => {
      if (rejectedFiles.length) {
        const first = rejectedFiles[0]
        if (first?.errors?.[0]?.code === 'file-too-large') {
          customToast.error(`File too large. Max ${formatBytes(MAX_SIZE)}`)
        } else {
          customToast.error('Only JPEG and PNG images allowed.')
        }
        return
      }
      if (!acceptedFiles.length) return
      const file = acceptedFiles[0]
      handlePreview(file)
      try {
        const url = await uploadFile(file)
        onChange(url)
        customToast.success('Avatar updated')
      } catch {
        setPreview(null)
      }
    },
    [onChange, handlePreview, userId]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: MAX_SIZE,
    accept: ACCEPT,
    disabled: disabled || isUploading,
    multiple: false,
    maxFiles: 1,
  })

  const displayUrl = preview || value
  const sizeClass = sizeClasses[size]

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'relative rounded-full overflow-hidden cursor-pointer transition-all',
          sizeClass,
          isDragActive && 'ring-2 ring-primary ring-offset-2',
          (disabled || isUploading) && 'cursor-not-allowed opacity-70'
        )}
      >
        <input {...getInputProps()} />
        {displayUrl ? (
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <Image
              src={displayUrl}
              alt="Avatar"
              fill
              className="object-cover"
              sizes="144px"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            )}
          </div>
        ) : (
          <div className="absolute inset-0 rounded-full bg-muted flex items-center justify-center">
            {isUploading ? (
              <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
            ) : (
              <Upload className="h-10 w-10 text-muted-foreground" />
            )}
          </div>
        )}
      </div>
      {isUploading && uploadProgress > 0 && (
        <div className="w-full max-w-[140px]">
          <Progress value={uploadProgress} className="h-1.5" />
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Drag or click · Max {formatBytes(MAX_SIZE)} · JPG/PNG
      </p>
    </div>
  )
}
