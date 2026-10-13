// frontend/src/lib/upload/components/FilePreview.tsx
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { UploadedFile } from '@/lib/types/upload.types'
import { cn } from '@/lib/utils'
import { formatBytes } from '@/lib/utils/format'
import { IconEyeFilled } from '@tabler/icons-react'
import { Download, Eye, File, FileText, Trash2, X } from 'lucide-react'
import Image from 'next/image'

interface FilePreviewProps {
  file: UploadedFile | File
  onRemove?: () => void
  onDelete?: (id: string) => void
  onDownload?: (url: string, filename: string) => void
  onView?: (url: string) => void
  uploadProgress?: number
  isUploading?: boolean
  showActions?: boolean
  className?: string
}

export function FilePreview ({
  file,
  onRemove,
  onDelete,
  onDownload,
  onView,
  uploadProgress = 0,
  isUploading = false,
  showActions = true,
  className
}: FilePreviewProps) {
  const isUploadedFile = '_id' in file
  const mimeType = isUploadedFile ? file.mimeType : file.type
  const fileName = isUploadedFile ? file.originalName : file.name
  const fileSize = isUploadedFile ? file.size : file.size
  const fileUrl = isUploadedFile ? file.secureUrl : URL.createObjectURL(file)

  const isImage = mimeType.startsWith('image/')
  const isPDF = mimeType === 'application/pdf'
  const isDocument =
    mimeType.includes('document') ||
    mimeType.includes('sheet') ||
    mimeType.includes('presentation')

  const getFileIcon = () => {
    if (isImage) return <IconEyeFilled className='h-8 w-8 text-blue-500' />
    if (isPDF) return <File className='h-8 w-8 text-red-500' />
    return <FileText className='h-8 w-8 text-gray-500' />
  }

  const handleDownload = () => {
    if (onDownload && isUploadedFile) {
      onDownload(file.secureUrl, file.originalName)
    } else if (!isUploadedFile) {
      const link = document.createElement('a')
      link.href = fileUrl
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleView = () => {
    if (onView && isUploadedFile) {
      onView(file.secureUrl)
    } else {
      window.open(fileUrl, '_blank')
    }
  }

  const getFileTypeBadge = () => {
    if (isUploadedFile) {
      return (
        <Badge variant='outline' className='text-xs'>
          {file.fileType}
        </Badge>
      )
    }
    return null
  }

  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <CardContent className='p-4'>
        <div className='flex items-start space-x-4'>
          {/* Thumbnail */}
          <div className='flex-shrink-0'>
            {isImage ? (
              <div className='relative h-16 w-16'>
                <Image
                  src={fileUrl}
                  alt={fileName}
                  width={64}
                  height={64}
                  className='h-full w-full rounded-md object-cover border'
                  onError={e => {
                    ;(e.target as HTMLImageElement).src =
                      '/placeholder-image.png'
                  }}
                />
              </div>
            ) : (
              <div className='flex h-16 w-16 items-center justify-center rounded-md bg-gray-100'>
                {getFileIcon()}
              </div>
            )}
          </div>

          {/* File Info */}
          <div className='flex-1 min-w-0'>
            <div className='flex items-start justify-between'>
              <div className='min-w-0'>
                <h4 className='truncate text-sm font-medium text-gray-900'>
                  {fileName}
                </h4>
                <div className='mt-1 flex flex-wrap items-center gap-2'>
                  <span className='text-xs text-gray-500'>
                    {formatBytes(fileSize)}
                  </span>
                  {isUploadedFile && (
                    <>
                      <span className='text-xs text-gray-500'>•</span>
                      <span className='text-xs text-gray-500'>
                        {new Date(file.createdAt).toLocaleDateString()}
                      </span>
                    </>
                  )}
                  {getFileTypeBadge()}
                </div>
              </div>

              {/* Actions */}
              {showActions && (
                <div className='flex items-center space-x-1'>
                  {isUploadedFile && onView && (
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      onClick={handleView}
                      className='h-8 w-8'
                    >
                      <Eye className='h-4 w-4' />
                    </Button>
                  )}
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    onClick={handleDownload}
                    className='h-8 w-8'
                  >
                    <Download className='h-4 w-4' />
                  </Button>
                  {onRemove && !isUploadedFile && (
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      onClick={onRemove}
                      className='h-8 w-8 text-red-600 hover:text-red-700'
                      disabled={isUploading}
                    >
                      <X className='h-4 w-4' />
                    </Button>
                  )}
                  {isUploadedFile && onDelete && (
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      onClick={() => onDelete(file._id)}
                      className='h-8 w-8 text-red-600 hover:text-red-700'
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Upload Progress */}
            {isUploading && uploadProgress < 100 && (
              <div className='mt-2'>
                <Progress value={uploadProgress} className='h-2' />
                <p className='mt-1 text-xs text-gray-500'>
                  Uploading... {Math.round(uploadProgress)}%
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
