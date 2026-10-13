// components/FileManagement/FileGallery.tsx
'use client'

import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useDeleteFile } from '@/lib/hooks/entities/useFiles'
import { useAuth } from '@/lib/hooks/useAuth'
import { UploadedFile } from '@/lib/types/upload.types'
import { Upload } from 'lucide-react'
import { useState } from 'react'
import { customToast } from "@/lib/utils/customToast"
import { FileCard } from './FileCard'
import { FilePreviewModal } from './FilePreviewModal'

interface FileGalleryProps {
  files: UploadedFile[]
  isLoading?: boolean
  onRefresh?: () => void
  showUploadButton?: boolean
  onUploadClick?: () => void
  showPreview?: boolean
}

export function FileGallery ({
  files,
  isLoading = false,
  onRefresh,
  showUploadButton = false,
  onUploadClick,
  showPreview = true
}: FileGalleryProps) {
  const { user } = useAuth()
  const deleteFile = useDeleteFile()
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null)
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)

  const handleDeleteFile = async () => {
    if (!deletingFileId || !user) return

    try {
      await deleteFile.mutateAsync({
        id: deletingFileId,
        deletedBy: user.id
      })

      customToast.success('File deleted successfully')
      onRefresh?.()
    } catch (error) {
      console.error('Failed to delete file:', error)
      customToast.error('Failed to delete file')
    } finally {
      setDeletingFileId(null)
    }
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-48'>
        <div className='text-center'>
          <div className='h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary mx-auto mb-2' />
          <p className='text-sm text-muted-foreground'>Loading files...</p>
        </div>
      </div>
    )
  }

  if (files.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center min-h-48 bg-muted/30 rounded-lg'>
        <Upload className='h-8 w-8 text-muted-foreground mb-2' />
        <p className='text-sm text-muted-foreground'>No files uploaded yet</p>
        {showUploadButton && onUploadClick && (
          <Button onClick={onUploadClick} className='mt-4'>
            <Upload className='mr-2 h-4 w-4' />
            Upload Files
          </Button>
        )}
      </div>
    )
  }

  return (
    <>
      <div className='space-y-4'>
        {showUploadButton && onUploadClick && (
          <div className='flex justify-end'>
            <Button onClick={onUploadClick}>
              <Upload className='mr-2 h-4 w-4' />
              Upload More Files
            </Button>
          </div>
        )}

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {files.map(file => (
            <FileCard
              key={file._id}
              file={file}
              onPreview={() => setPreviewFile(file)}
              onDelete={() => {
                setDeletingFileId(file._id)
                setConfirmDialogOpen(true)
              }}
              isDeleting={deletingFileId === file._id}
              showPreview={showPreview}
            />
          ))}
        </div>
      </div>

      {/* Preview Modal */}
      <FilePreviewModal
        file={previewFile}
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        title='Delete File'
        description='Are you sure you want to delete this file? This action cannot be undone.'
        onConfirm={handleDeleteFile}
      />
    </>
  )
}
