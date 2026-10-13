// components/FileManagement/EntityFilesSection.tsx
'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { useFilesByEntity } from '@/lib/hooks/entities/useFiles'
import { useAuth } from '@/lib/hooks/useAuth'
import { EntityType } from '@/lib/types/upload.types'
import { Upload } from 'lucide-react'
import { useState } from 'react'
import { FileGallery } from './FileGallery'
import { FileUploadModal } from './FileUploadModal'

interface EntityFilesSectionProps {
  entityType: EntityType
  entityId: string
  title?: string
  description?: string
  allowUpload?: boolean
  showUploadButton?: boolean
  showPreview?: boolean
  className?: string
}

export function EntityFilesSection ({
  entityType,
  entityId,
  title = 'Files',
  description = 'Manage files for this entity',
  allowUpload = true,
  showUploadButton = true,
  showPreview = true,
  className
}: EntityFilesSectionProps) {
  const { user } = useAuth()
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

  const {
    data: files = [],
    isLoading,
    refetch
  } = useFilesByEntity(entityType, entityId)

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {allowUpload && showUploadButton && (
            <div className='mb-4'>
              <Button onClick={() => setIsUploadModalOpen(true)}>
                <Upload className='mr-2 h-4 w-4' />
                Upload Files
              </Button>
            </div>
          )}

          <FileGallery
            files={files}
            isLoading={isLoading}
            onRefresh={() => refetch()}
            showUploadButton={allowUpload && showUploadButton}
            onUploadClick={() => setIsUploadModalOpen(true)}
            showPreview={showPreview}
          />
        </CardContent>
      </Card>

      {allowUpload && user && (
        <FileUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          entityType={entityType}
          entityId={entityId}
          onUploadComplete={() => {
            refetch()
            setIsUploadModalOpen(false)
          }}
          multiple={true}
        />
      )}
    </>
  )
}
