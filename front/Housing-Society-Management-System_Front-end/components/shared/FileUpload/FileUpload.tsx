// components/shared/FileUpload/FileUpload.tsx
'use client'

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { uploadApi } from '@/lib/API/upload-api'
import { EntityType } from '@/lib/types/upload.types'
import { cn } from '@/lib/utils'
import { formatBytes } from '@/lib/utils/file.utils'
import { FileIcon, FileText, Loader2, Trash2, Upload, X } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { customToast } from "@/lib/utils/customToast"

interface FileUploadProps {
  value?: string
  onChange: (url: string) => void

  onRemove?: () => void
  disabled?: boolean
  entityType: EntityType
  entityId: string
  uploadedBy: string
  maxSize?: number
  className?: string
  acceptedFileTypes?: string[]
  allowMultipleTypes?: boolean
}

const isImageFile = (url: string) => {
  return (
    url.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i) ||
    (url.includes('cloudinary') && url.includes('/image/'))
  )
}

const isPDFFile = (url: string) => {
  return (
    url.match(/\.pdf$/i) ||
    (url.includes('cloudinary') &&
      url.includes('/raw/') &&
      url.includes('.pdf'))
  )
}

export function FileUpload ({
  value,
  onChange,
  onRemove,
  disabled = false,
  entityType,
  entityId,
  uploadedBy,
  maxSize = 10 * 1024 * 1024,
  className,
  acceptedFileTypes = ['image/*', '.pdf', '.doc', '.docx', '.txt'],
  allowMultipleTypes = true
}: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const handlePreview = useCallback((file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setPreview('document')
    }
  }, [])

  const uploadToCloudinary = async (file: File): Promise<string> => {
    try {
      setIsUploading(true)
      setUploadProgress(0)

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

      setUploadProgress(100)
      clearInterval(progressInterval)

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
    }
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: any[]) => {
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0]
        if (rejection.errors[0]?.code === 'file-too-large') {
          customToast.error(`File size must be less than ${formatBytes(maxSize)}`)
        } else if (rejection.errors[0]?.code === 'file-invalid-type') {
          customToast.error('File type not supported')
        } else {
          customToast.error('File rejected: ' + rejection.errors[0]?.message)
        }
        return
      }

      if (acceptedFiles.length === 0) return

      const file = acceptedFiles[0]

      try {
        handlePreview(file)
        const url = await uploadToCloudinary(file)
        customToast.success('File uploaded successfully')
        onChange(url)
      } catch (error) {
        // Error already handled in uploadToCloudinary
      }
    },
    [handlePreview, uploadToCloudinary, onChange, maxSize]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: allowMultipleTypes
      ? acceptedFileTypes.reduce((acc, type) => {
          acc[type] = []
          return acc
        }, {} as Record<string, string[]>)
      : undefined,
    maxSize,
    multiple: false,
    disabled: disabled || isUploading
  })

  const handleRemove = () => {
    if (onRemove) {
      onRemove()
    } else {
      onChange('')
    }
    setPreview(null)
    customToast.success('File removed')
  }

  return (
    <div className={cn('space-y-4 w-full max-w-full min-w-0', className)}>
      {value && !preview && (
        <div className='relative group w-full max-w-full'>
          {isImageFile(value) ? (
            <div className='relative rounded-lg overflow-hidden border w-full max-w-full h-48 sm:h-56'>
              <Image
                src={value}
                alt='Uploaded file'
                fill
                className='object-cover'
                sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px'
              />
            </div>
          ) : (
            <div className='flex items-center justify-center h-32 w-full border-2 border-dashed border-gray-300 rounded-lg bg-gray-50'>
              <div className='text-center'>
                {isPDFFile(value) ? (
                  <FileText className='mx-auto h-8 w-8 text-red-500 mb-2' />
                ) : (
                  <FileIcon className='mx-auto h-8 w-8 text-gray-500 mb-2' />
                )}
                <p className='text-sm text-gray-600'>Document uploaded</p>
                <a
                  href={value}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-blue-600 hover:text-blue-800 text-sm underline mt-1 inline-block'
                >
                  View File
                </a>
              </div>
            </div>
          )}

          <Button
            type='button'
            variant='destructive'
            size='sm'
            disabled={disabled}
            onClick={handleRemove}
            className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity'
          >
            <Trash2 className='h-4 w-4' />
          </Button>
        </div>
      )}

      {preview && (
        <div className='relative group'>
          {preview === 'document' ? (
            <div className='flex items-center justify-center h-32 w-full border-2 border-dashed border-gray-300 rounded-lg bg-gray-50'>
              <div className='text-center'>
                <FileIcon className='mx-auto h-8 w-8 text-gray-500 mb-2' />
                <p className='text-sm text-gray-600'>
                  Document ready for upload
                </p>
              </div>
            </div>
          ) : (
            <div className='relative rounded-lg overflow-hidden border w-full max-w-full h-48 sm:h-56'>
              <Image
                src={preview}
                alt='Upload preview'
                fill
                className='object-cover'
                sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px'
              />
            </div>
          )}

          <Button
            type='button'
            variant='destructive'
            size='sm'
            disabled={disabled || isUploading}
            onClick={() => setPreview(null)}
            className='absolute top-2 right-2'
          >
            <X className='h-4 w-4' />
          </Button>
        </div>
      )}

      {!value && !preview && (
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors w-full max-w-full min-w-0',
            isDragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400',
            disabled || isUploading ? 'opacity-50 cursor-not-allowed' : ''
          )}
        >
          <input {...getInputProps()} />
          <div className='flex flex-col items-center justify-center space-y-2'>
            {isUploading ? (
              <>
                <Loader2 className='h-8 w-8 animate-spin text-blue-500' />
                <p className='text-sm text-gray-600'>Uploading...</p>
                <Progress value={uploadProgress} className='w-full max-w-xs' />
              </>
            ) : (
              <>
                <Upload className='h-8 w-8 text-gray-400' />
                <div>
                  <p className='text-sm font-medium text-gray-900'>
                    {isDragActive
                      ? 'Drop the file here'
                      : 'Click to upload or drag and drop'}
                  </p>
                  <p className='text-xs text-gray-500 mt-1'>
                    Supports images, PDFs, and documents up to{' '}
                    {formatBytes(maxSize)}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {isUploading && (
        <div className='space-y-2'>
          <Progress value={uploadProgress} />
          <p className='text-xs text-center text-gray-600'>
            Uploading... {uploadProgress}%
          </p>
        </div>
      )}
    </div>
  )
}
