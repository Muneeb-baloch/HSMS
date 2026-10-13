// components/FileManagement/FileUploadModal.tsx
'use client'

import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Progress } from '@/components/ui/progress'
import {
  useUploadFile,
  useUploadMultipleFiles
} from '@/lib/hooks/entities/useFiles'
import { useAuth } from '@/lib/hooks/useAuth'
import { EntityType, UploadedFile } from '@/lib/types/upload.types'
import { cn } from '@/lib/utils'
import { formatBytes } from '@/lib/utils/file.utils'
import { AlertCircle, CheckCircle2, Upload, X } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { customToast } from "@/lib/utils/customToast"

interface FileUploadModalProps {
  isOpen: boolean
  onClose: () => void
  entityType: EntityType
  entityId: string
  onUploadComplete?: (files: UploadedFile[]) => void
  multiple?: boolean
  maxSize?: number
  accept?: Record<string, string[]>
}

export function FileUploadModal ({
  isOpen,
  onClose,
  entityType,
  entityId,
  onUploadComplete,
  multiple = true,
  maxSize = 10 * 1024 * 1024,
  accept = {
    'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
      '.docx'
    ]
  }
}: FileUploadModalProps) {
  const { user } = useAuth()
  const [files, setFiles] = useState<File[]>([])
  const [uploadStatus, setUploadStatus] = useState<
    Record<string, 'uploading' | 'success' | 'error'>
  >({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadSingle = useUploadFile()
  const uploadMultiple = useUploadMultipleFiles()

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: unknown[]) => {
      if (rejectedFiles.length > 0) {
        customToast.error('Some files were rejected. Check file size and type.')
      }

      if (acceptedFiles.length > 0) {
        if (!multiple && acceptedFiles.length > 1) {
          customToast.error('Only one file can be uploaded at a time')
          return
        }

        const newFiles = multiple ? [...files, ...acceptedFiles] : acceptedFiles

        setFiles(newFiles)
      }
    },
    [files, multiple]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize,
    accept,
    multiple
  })

  const handleUpload = async () => {
    if (files.length === 0) return

    if (!user) {
      customToast.error('User not authenticated')
      return
    }

    try {
      setUploadStatus({})
      files.forEach(file => {
        setUploadStatus(prev => ({ ...prev, [file.name]: 'uploading' }))
      })

      if (multiple && files.length > 1) {
        const result = await uploadMultiple.mutateAsync({
          files,
          entityType,
          entityId,
          uploadedBy: user.id
        })

        files.forEach(file => {
          setUploadStatus(prev => ({ ...prev, [file.name]: 'success' }))
        })

        customToast.success(`${files.length} files uploaded successfully`)
        onUploadComplete?.(result)
      } else {
        const uploadedFiles: UploadedFile[] = []

        for (const file of files) {
          try {
            const result = await uploadSingle.mutateAsync({
              file,
              entityType,
              entityId,
              uploadedBy: user.id
            })

            setUploadStatus(prev => ({ ...prev, [file.name]: 'success' }))
            uploadedFiles.push(result)
          } catch (error) {
            setUploadStatus(prev => ({ ...prev, [file.name]: 'error' }))
            console.error(`Failed to upload ${file.name}:`, error)
          }
        }

        if (uploadedFiles.length > 0) {
          customToast.success(
            `${uploadedFiles.length} of ${files.length} files uploaded`
          )
          onUploadComplete?.(uploadedFiles)
        }
      }

      // Reset after a delay
      setTimeout(() => {
        setFiles([])
        setUploadStatus({})
        onClose()
      }, 1500)
    } catch (error) {
      console.error('Upload failed:', error)
      customToast.error('Upload failed. Please try again.')
    }
  }

  const removeFile = (fileName: string) => {
    setFiles(prev => prev.filter(f => f.name !== fileName))
    setUploadStatus(prev => {
      const newStatus = { ...prev }
      delete newStatus[fileName]
      return newStatus
    })
  }

  const isUploading = Object.values(uploadStatus).some(s => s === 'uploading')
  const canUpload = files.length > 0 && !isUploading

  return (
    <Modal isOpen={isOpen} onClose={onClose} title='Upload Files'>
      <div className='space-y-4'>
        <p className='text-sm text-muted-foreground mb-4'>
          {multiple
            ? 'Upload one or more files to this entity'
            : 'Upload a single file to this entity'}
        </p>

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          )}
        >
          <input
            className='enhanced-input h-11'
            {...getInputProps()}
            ref={fileInputRef}
          />
          <Upload className='mx-auto h-8 w-8 text-muted-foreground mb-2' />
          <p className='text-sm font-medium'>
            {isDragActive ? 'Drop files here' : 'Drag and drop files here'}
          </p>
          <p className='text-xs text-muted-foreground mt-1'>
            or click to select (max {formatBytes(maxSize)})
          </p>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className='space-y-2 max-h-64 overflow-y-auto'>
            {files.map(file => {
              const status = uploadStatus[file.name]
              return (
                <div
                  key={file.name}
                  className='flex items-center justify-between p-3 bg-muted rounded-lg'
                >
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium truncate'>{file.name}</p>
                    <p className='text-xs text-muted-foreground'>
                      {formatBytes(file.size)}
                    </p>
                    {status === 'uploading' && (
                      <Progress value={50} className='mt-1 h-1' />
                    )}
                  </div>

                  <div className='ml-2 flex items-center gap-2'>
                    {status === 'success' && (
                      <CheckCircle2 className='h-5 w-5 text-green-500' />
                    )}
                    {status === 'error' && (
                      <AlertCircle className='h-5 w-5 text-red-500' />
                    )}
                    {!status && (
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-6 w-6'
                        onClick={() => removeFile(file.name)}
                      >
                        <X className='h-4 w-4' />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Actions */}
        <div className='flex gap-2 justify-end pt-4'>
          <Button variant='outline' onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!canUpload}>
            {isUploading ? 'Uploading...' : 'Upload Files'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
