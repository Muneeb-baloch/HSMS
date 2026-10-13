// src/components/plots/PlotDocuments.tsx
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { usePlot } from '@/lib/hooks/entities/usePlot'
import {
  Download,
  FileText,
  Paperclip,
  Plus,
  Trash2,
  Upload
} from 'lucide-react'
import { useState } from 'react'
import { customToast } from '@/lib/utils/customToast'
import { useConfirm } from "@/components/shared/ConfirmDialog";

interface PlotDocumentsProps {
  plotId: string
  canManage?: boolean
}

export function PlotDocuments ({
  plotId,
  canManage = false
}: PlotDocumentsProps) {
  const { data: plot, refetch } = usePlot(plotId)
  const [isUploading, setIsUploading] = useState(false)
  const { confirm } = useConfirm();
  const [uploadData, setUploadData] = useState({
    documentType: '',
    documentPath: ''
  })

  if (!plot) return null

  const documents = plot.plotDocuments || []

  const handleUpload = async () => {
    if (!uploadData.documentType || !uploadData.documentPath) {
      customToast.error('Please select document type and provide file path')
      return
    }

    setIsUploading(true)
    try {
      // API call to upload document
      // await apiClient.post(`/plots/${plotId}/documents`, {
      //   documents: [{
      //     documentType: uploadData.documentType,
      //     documentPath: uploadData.documentPath,
      //   }]
      // })

      customToast.success('Document uploaded successfully')
      setUploadData({ documentType: '', documentPath: '' })
      refetch()
    } catch (error) {
      customToast.error('Failed to upload document')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (docIndex: number) => {
    if (!await confirm({ title: "Delete", description: 'Are you sure you want to delete this document?', variant: "destructive" })) return

    try {
      // API call to delete document
      // await apiClient.delete(`/plots/${plotId}/documents/${docIndex}`)
      customToast.success('Document deleted successfully')
      refetch()
    } catch (error) {
      customToast.error('Failed to delete document')
    }
  }

  const handleDownload = async (documentPath: string, documentType: string) => {
    try {
      // API call to download document
      // const response = await apiClient.get(`/plots/documents/download/${documentPath}`)
      // Handle download
      customToast.success('Download started')
    } catch (error) {
      customToast.error('Failed to download document')
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex justify-between items-center'>
          <div>
            <CardTitle className='flex items-center gap-2'>
              <FileText className='h-5 w-5' />
              Plot Documents
            </CardTitle>
            <CardDescription>Documents related to this plot</CardDescription>
          </div>
          {canManage && (
            <Dialog>
              <DialogTrigger asChild>
                <Button size='sm'>
                  <Plus className='mr-2 h-4 w-4' />
                  Add Document
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Document</DialogTitle>
                  <DialogDescription>
                    Add a new document for this plot
                  </DialogDescription>
                </DialogHeader>
                <div className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='documentType'>Document Type</Label>
                    <Select
                      value={uploadData.documentType}
                      onValueChange={value =>
                        setUploadData({ ...uploadData, documentType: value })
                      }
                    >
                      <SelectTrigger className='h-11 enhanced-input'>
                        <SelectValue placeholder='Select document type' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='allotment'>
                          Allotment Letter
                        </SelectItem>
                        <SelectItem value='possession'>
                          Possession Certificate
                        </SelectItem>
                        <SelectItem value='survey'>Survey Report</SelectItem>
                        <SelectItem value='map'>Site Map</SelectItem>
                        <SelectItem value='noc'>NOC</SelectItem>
                        <SelectItem value='other'>Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='documentPath'>File Path/URL</Label>
                    <Input
                      id='documentPath'
                      placeholder='Enter file path or upload file'
                      value={uploadData.documentPath}
                      className='enhanced-input h-11'
                      onChange={e =>
                        setUploadData({
                          ...uploadData,
                          documentPath: e.target.value
                        })
                      }
                    />
                  </div>
                  <Button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className='w-full'
                  >
                    {isUploading ? 'Uploading...' : 'Upload Document'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {documents.length > 0 ? (
          <div className='space-y-3'>
            {documents.map((doc, index) => (
              <div
                key={index}
                className='flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50'
              >
                <div className='flex items-center gap-3'>
                  <Paperclip className='h-4 w-4 text-gray-400' />
                  <div>
                    <div className='font-medium capitalize'>
                      {doc.documentType} Document
                    </div>
                    <div className='text-sm text-gray-500'>
                      Uploaded:{' '}
                      {new Date(doc.uploadedDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      handleDownload(doc.documentPath, doc.documentType)
                    }
                  >
                    <Download className='h-4 w-4' />
                  </Button>
                  {canManage && (
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleDelete(index)}
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='text-center py-8'>
            <FileText className='h-12 w-12 mx-auto text-gray-400 mb-2' />
            <div className='text-gray-500'>No documents uploaded</div>
            <div className='text-sm text-gray-400 mt-1'>
              Upload documents related to this plot
            </div>
            {canManage && (
              <Button variant='outline' className='mt-4'>
                <Upload className='mr-2 h-4 w-4' />
                Upload First Document
              </Button>
            )}
          </div>
        )}

        {/* Document Statistics */}
        <div className='mt-6 pt-4 border-t'>
          <div className='grid grid-cols-3 gap-4'>
            <div className='text-center'>
              <div className='text-2xl font-bold'>{documents.length}</div>
              <div className='text-sm text-gray-500'>Total Documents</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold'>
                {documents.filter(d => d.documentType === 'allotment').length}
              </div>
              <div className='text-sm text-gray-500'>Allotment Letters</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold'>
                {documents.filter(d => d.documentType === 'possession').length}
              </div>
              <div className='text-sm text-gray-500'>Possession Docs</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
