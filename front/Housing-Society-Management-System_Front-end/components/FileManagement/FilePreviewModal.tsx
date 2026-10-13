// components/FileManagement/FilePreviewModal.tsx
'use client'

import { Button } from '@/components/ui/button'
import { UploadedFile } from '@/lib/types/upload.types'
import { downloadFile, formatBytes } from '@/lib/utils/file.utils'
import { Dialog, DialogContent, DialogTitle } from '@radix-ui/react-dialog'
import { Download, FileIcon, X } from 'lucide-react'
import Image from 'next/image'

interface FilePreviewModalProps {
  file: UploadedFile | null
  isOpen: boolean
  onClose: () => void
}

export function FilePreviewModal ({
  file,
  isOpen,
  onClose
}: FilePreviewModalProps) {
  if (!file) return null

  const isImage = file.mimeType.startsWith('image/')
  const isPdf = file.mimeType === 'application/pdf'

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl'>
        <div className='flex items-center justify-between mb-4'>
          <DialogTitle className='truncate'>{file.originalName}</DialogTitle>
          <Button
            variant='ghost'
            size='icon'
            onClick={onClose}
            className='h-6 w-6 p-0'
          >
            <X className='h-4 w-4' />
          </Button>
        </div>

        <div className='space-y-4'>
          {/* Preview Area */}
          <div className='flex items-center justify-center min-h-96 bg-muted rounded-lg overflow-auto'>
            {isImage ? (
              <Image
                src={file.secureUrl}
                alt={file.originalName}
                width={file.width || 500}
                height={file.height || 500}
                className='max-w-full max-h-96 object-contain'
              />
            ) : isPdf ? (
              <iframe
                src={`${file.secureUrl}#toolbar=0`}
                className='w-full h-96'
                title={file.originalName}
              />
            ) : (
              <div className='flex flex-col items-center gap-2 text-muted-foreground'>
                <FileIcon className='h-12 w-12' />
                <p className='text-sm'>Preview not available</p>
              </div>
            )}
          </div>

          {/* File Details */}
          <div className='grid grid-cols-2 gap-4 text-sm'>
            <div>
              <p className='text-muted-foreground'>File Type</p>
              <p className='font-medium'>{file.fileType}</p>
            </div>
            <div>
              <p className='text-muted-foreground'>Size</p>
              <p className='font-medium'>{formatBytes(file.size)}</p>
            </div>
            <div>
              <p className='text-muted-foreground'>Uploaded By</p>
              <p className='font-medium truncate'>{file.uploadedBy}</p>
            </div>
            <div>
              <p className='text-muted-foreground'>Uploaded Date</p>
              <p className='font-medium'>
                {new Date(file.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Download Button */}
          <Button
            onClick={() => downloadFile(file.secureUrl, file.originalName)}
            className='w-full'
          >
            <Download className='mr-2 h-4 w-4' />
            Download File
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
