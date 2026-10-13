// components/FileManagement/FileCard.tsx
'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { UploadedFile } from '@/lib/types/upload.types'
import { formatBytes } from '@/lib/utils/file.utils'
import {
  Download,
  Eye,
  FileIcon,
  Image as ImageIcon,
  MoreVertical,
  Trash2
} from 'lucide-react'
import Image from 'next/image'

interface FileCardProps {
  file: UploadedFile
  onPreview: () => void
  onDelete: () => void
  isDeleting?: boolean
  showPreview?: boolean
}

export function FileCard ({
  file,
  onPreview,
  onDelete,
  isDeleting = false,
  showPreview = true
}: FileCardProps) {
  const isImage = file.mimeType.startsWith('image/')
  const isPdf = file.mimeType === 'application/pdf'

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = file.secureUrl
    link.download = file.originalName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card className='overflow-hidden hover:shadow-lg transition-shadow'>
      {/* Thumbnail */}
      {showPreview && (
        <div className='relative h-48 bg-muted overflow-hidden cursor-pointer group'>
          {isImage ? (
            <Image
              src={file.secureUrl}
              alt={file.originalName}
              fill
              className='object-cover group-hover:scale-105 transition-transform'
              onClick={onPreview}
            />
          ) : (
            <div
              className='w-full h-full flex items-center justify-center group-hover:bg-muted-foreground/10 transition-colors'
              onClick={onPreview}
            >
              {isPdf ? (
                <FileIcon className='h-12 w-12 text-red-500' />
              ) : (
                <ImageIcon className='h-12 w-12 text-blue-500' />
              )}
            </div>
          )}
          <div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2'>
            <Button
              size='sm'
              variant='ghost'
              onClick={onPreview}
              className='text-white hover:bg-white/20'
            >
              <Eye className='h-4 w-4' />
            </Button>
          </div>
        </div>
      )}

      {/* Content */}
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between gap-2'>
          <div className='flex-1 min-w-0'>
            <CardTitle className='text-sm truncate'>
              {file.originalName}
            </CardTitle>
            <CardDescription className='text-xs'>
              {formatBytes(file.size)}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='icon' className='h-8 w-8'>
                <MoreVertical className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={onPreview}>
                <Eye className='mr-2 h-4 w-4' />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownload}>
                <Download className='mr-2 h-4 w-4' />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onDelete}
                disabled={isDeleting}
                className='text-destructive'
              >
                <Trash2 className='mr-2 h-4 w-4' />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className='text-xs text-muted-foreground space-y-1'>
        <p className='truncate'>
          <span className='font-medium'>Type:</span> {file.fileType}
        </p>
        <p className='truncate'>
          <span className='font-medium'>Uploaded:</span>{' '}
          {new Date(file.createdAt).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  )
}
