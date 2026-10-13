// app/(protected)/files/page.tsx
'use client'

import { FileGallery } from '@/components/FileManagement/FileGallery'
import { FileUploadModal } from '@/components/FileManagement/FileUploadModal'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Pagination } from '@/components/ui/pagination'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useFileManagementModal } from '@/lib/hooks/entities/useFileManagement'
import { useFiles } from '@/lib/hooks/entities/useFiles'
import { useAuth } from '@/lib/hooks/useAuth'
import { EntityType, FileType, UploadedFile } from '@/lib/types/upload.types'

import { Search, Upload } from 'lucide-react'
import { useMemo, useState } from 'react'

export default function FilesPage () {
  const { user } = useAuth()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(12)
  const [searchTerm, setSearchTerm] = useState('')
  const [entityTypeFilter, setEntityTypeFilter] = useState<EntityType | 'all'>(
    'all'
  )
  const [fileTypeFilter, setFileTypeFilter] = useState<FileType | 'all'>('all')

  const uploadModal = useFileManagementModal({
    entityType: EntityType.DOCUMENT,
    entityId: user?.id || ''
  })

  // Fetch files with filters
  const filesQuery = useFiles({
    entityType:
      entityTypeFilter === 'all' ? undefined : (entityTypeFilter as EntityType),
    fileType:
      fileTypeFilter === 'all' ? undefined : (fileTypeFilter as FileType),
    page,
    limit
  })
  const filteredFiles = useMemo(() => {
    // use the correct property based on your PaginatedResponse type
    const files = filesQuery.data?.items ?? []

    if (!searchTerm) return files

    return files.filter((file: UploadedFile) =>
      file.originalName.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [filesQuery.data, searchTerm])

  const pagination = filesQuery.data?.pagination

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= (pagination?.pages || 1)) {
      setPage(newPage)
    }
  }

  const handleRefresh = () => {
    filesQuery.refetch()
  }

  return (
    <>
      <div className='flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6'>
        {/* Header */}
        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Files</h1>
            <p className='text-sm text-muted-foreground mt-1'>
              Manage all uploaded files across your organization
            </p>
          </div>

          <Button onClick={uploadModal.openModal}>
            <Upload className='mr-2 h-4 w-4' />
            Upload Files
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className='pb-4'>
            <CardTitle className='text-lg'>Filters</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
              {/* Search */}
              <div className='relative'>
                <Search className='absolute left-2 top-3 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Search files...'
                  value={searchTerm}
                  onChange={e => {
                    setSearchTerm(e.target.value)
                    setPage(1)
                  }}
                  className='enhanced-input h-11 pl-8'
                />
              </div>

              {/* Entity Type Filter */}
              <Select
                value={entityTypeFilter}
                onValueChange={value => {
                  setEntityTypeFilter(value as EntityType | 'all')
                  setPage(1)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Entity Type' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Entities</SelectItem>
                  <SelectItem value={EntityType.MEMBER}>Members</SelectItem>
                  <SelectItem value={EntityType.PLOT}>Plots</SelectItem>
                  <SelectItem value={EntityType.PROJECT}>Projects</SelectItem>
                  <SelectItem value={EntityType.DOCUMENT}>Documents</SelectItem>
                </SelectContent>
              </Select>

              {/* File Type Filter */}
              <Select
                value={fileTypeFilter}
                onValueChange={value => {
                  setFileTypeFilter(value as FileType | 'all')
                  setPage(1)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder='File Type' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Types</SelectItem>
                  <SelectItem value={FileType.IMAGE}>Images</SelectItem>
                  <SelectItem value={FileType.PDF}>PDFs</SelectItem>
                  <SelectItem value={FileType.DOCUMENT}>Documents</SelectItem>
                  <SelectItem value={FileType.OTHER}>Other</SelectItem>
                </SelectContent>
              </Select>

              {/* Items Per Page */}
              <Select
                value={limit.toString()}
                onValueChange={value => {
                  setLimit(parseInt(value))
                  setPage(1)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Items per page' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='6'>6 per page</SelectItem>
                  <SelectItem value='12'>12 per page</SelectItem>
                  <SelectItem value='24'>24 per page</SelectItem>
                  <SelectItem value='50'>50 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* File Gallery */}
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Files</CardTitle>
            <CardDescription>
              {pagination
                ? `Showing ${filteredFiles.length} of ${pagination.total} files`
                : 'Loading...'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileGallery
              files={filteredFiles}
              isLoading={filesQuery.isLoading}
              onRefresh={handleRefresh}
              showUploadButton={true}
              onUploadClick={uploadModal.openModal}
            />
          </CardContent>
        </Card>
        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className='flex justify-center'>
            <Pagination
              currentPage={page}
              totalPages={pagination.pages}
              pageSize={pagination.limit}
              totalItems={pagination.total}
              onPageChange={handlePageChange}
              onPageSizeChange={newPageSize => {
                setLimit(newPageSize)
                setPage(1)
              }}
            />
          </div>
        )}
        {/*
           {pagination && pagination.pages > 1 && (
            <div className='flex justify-center'>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href='#'
                      onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                        e.preventDefault()
                        handlePageChange(page - 1)
                      }}
                      className={
                        page === 1 ? 'pointer-events-none opacity-50' : ''
                      }
                        {Array.from(
                    { length: Math.min(pagination.pages, 5) },
                    (_, i) => {
                      const pageNum = i + 1
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            href='#'
                            onClick={(
                              e: React.MouseEvent<HTMLAnchorElement>
                            ) => {
                              e.preventDefault()
                              handlePageChange(pageNum)
                            }}
                            isActive={page === pageNum}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    }
                  )}   />
                  </PaginationItem>




                  {pagination.pages > 5 && <PaginationEllipsis />}

                  <PaginationItem>
                    <PaginationNext
                      href='#'
                      onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                        e.preventDefault()
                        handlePageChange(page + 1)
                      }}
                      className={
                        page === pagination.pages
                          ? 'pointer-events-none opacity-50'
                          : ''
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )} */}
      </div>

      <FileUploadModal
        isOpen={uploadModal.isOpen}
        onClose={uploadModal.closeModal}
        entityType={EntityType.DOCUMENT}
        entityId={user?.id || ''}
        onUploadComplete={files => {
          uploadModal.handleUploadComplete(files)
          handleRefresh()
        }}
        multiple={true}
      />
    </>
  )
}
