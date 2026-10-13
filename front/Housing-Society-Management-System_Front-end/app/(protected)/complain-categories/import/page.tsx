// src/app/(dashboard)/complain-categories/import/page.tsx
'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { hasPermission, UserRole as UserRoleEnum } from '@/lib/constants/roles'
import { useImportSrComplaintCategories } from '@/lib/hooks/entities/useSrComplaintCategory'
import { useAuth } from '@/lib/hooks/useAuth'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Download,
  FileText,
  Upload
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Papa from 'papaparse'
import { useState } from 'react'

export default function ImportComplaintCategoriesPage () {
  const router = useRouter()
  const { user } = useAuth()
  const importMutation = useImportSrComplaintCategories()

  const [file, setFile] = useState<File | null>(null)
  const [jsonInput, setJsonInput] = useState<string>('')
  const [previewData, setPreviewData] = useState<any[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [importMethod, setImportMethod] = useState<'csv' | 'json'>('csv')

  const canImport =
    user &&
    hasPermission(
      user.role as UserRoleEnum,
      [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN] as UserRoleEnum[]
    )

  if (!canImport) {
    router.push('/complain-categories')
    return null
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0]
    if (!uploadedFile) return

    setFile(uploadedFile)
    setErrors([])

    Papa.parse(uploadedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results: any) => {
        if (results.errors.length > 0) {
          setErrors(
            results.errors.map((err: any) => `Row ${err.row}: ${err.message}`)
          )
        } else {
          setPreviewData(results.data.slice(0, 5)) // Show first 5 rows
        }
      },
      error: error => {
        setErrors([`File parsing error: ${error.message}`])
      }
    })
  }

  const handleJsonInput = () => {
    try {
      const data = JSON.parse(jsonInput)
      if (!Array.isArray(data)) {
        setErrors(['JSON must be an array of objects'])
        return
      }
      setPreviewData(data.slice(0, 5))
      setErrors([])
    } catch (error: any) {
      setErrors([`Invalid JSON: ${error.message}`])
    }
  }

  const handleImport = async () => {
    try {
      let data: any[] = []

      if (importMethod === 'csv' && file) {
        await new Promise<void>((resolve, reject) => {
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results: any) => {
              if (results.errors.length > 0) {
                reject(new Error('CSV parsing errors'))
                return
              }
              data = results.data
              resolve()
            },
            error: error => {
              reject(error)
            }
          })
        })
      } else if (importMethod === 'json' && jsonInput) {
        data = JSON.parse(jsonInput)
        if (!Array.isArray(data)) {
          throw new Error('JSON must be an array')
        }
      } else {
        throw new Error('No data to import')
      }

      // Validate data structure
      const validationErrors: string[] = []
      data.forEach((item, index) => {
        if (!item.categoryName)
          validationErrors.push(`Row ${index + 1}: Category Name is required`)
        if (!item.categoryCode)
          validationErrors.push(`Row ${index + 1}: Category Code is required`)
        if (
          item.priorityLevel &&
          (item.priorityLevel < 1 || item.priorityLevel > 10)
        ) {
          validationErrors.push(
            `Row ${index + 1}: Priority Level must be between 1 and 10`
          )
        }
        if (item.slaHours && item.slaHours < 1) {
          validationErrors.push(
            `Row ${index + 1}: SLA Hours must be at least 1`
          )
        }
      })

      if (validationErrors.length > 0) {
        setErrors(validationErrors)
        return
      }

      await importMutation.mutateAsync(data)
      router.push('/complain-categories')
    } catch (error: any) {
      setErrors([error.message])
    }
  }

  const downloadTemplate = () => {
    const template = [
      {
        categoryName: 'Example Category',
        categoryCode: 'EXMPL',
        description: 'Example description',
        priorityLevel: 5,
        slaHours: 72,
        isActive: true
      }
    ]

    const csv = Papa.unparse(template)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'complaint-categories-template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className='space-y-1'>
      <div className='flex items-center gap-2'>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => router.back()}
          className='mb-4'
        >
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back
        </Button>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2'>
          <Card>
            <CardHeader>
              <CardTitle className='text-2xl'>
                Import Complaint Categories
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Import Method Selection */}
              <div>
                <Label className='text-sm font-medium mb-2 block'>
                  Import Method
                </Label>
                <div className='flex gap-4'>
                  <Button
                    variant={importMethod === 'csv' ? 'default' : 'outline'}
                    onClick={() => setImportMethod('csv')}
                    className='flex-1'
                  >
                    <FileText className='mr-2 h-4 w-4' />
                    CSV File
                  </Button>
                  <Button
                    variant={importMethod === 'json' ? 'default' : 'outline'}
                    onClick={() => setImportMethod('json')}
                    className='flex-1'
                  >
                    <FileText className='mr-2 h-4 w-4' />
                    JSON Data
                  </Button>
                </div>
              </div>

              {/* CSV Upload */}
              {importMethod === 'csv' && (
                <div className='space-y-4'>
                  <div>
                    <Label className='text-sm font-medium mb-2 block'>
                      Upload CSV File
                    </Label>
                    <div className='border-2 border-dashed rounded-lg p-8 text-center'>
                      <Upload className='h-12 w-12 mx-auto text-gray-400 mb-4' />
                      <p className='text-sm text-gray-500 mb-4'>
                        Drag and drop your CSV file here, or click to browse
                      </p>
                      <Input
                        type='file'
                        accept='.csv'
                        onChange={handleFileUpload}
                        className='hidden'
                        id='csv-upload'
                      />
                      <Label htmlFor='csv-upload'>
                        <Button variant='outline' asChild>
                          <span>Browse Files</span>
                        </Button>
                      </Label>
                      {file && (
                        <p className='mt-4 text-sm text-gray-600'>
                          Selected file:{' '}
                          <span className='font-medium'>{file.name}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className='flex gap-2'>
                    <Button variant='outline' onClick={downloadTemplate}>
                      <Download className='mr-2 h-4 w-4' />
                      Download Template
                    </Button>
                  </div>
                </div>
              )}

              {/* JSON Input */}
              {importMethod === 'json' && (
                <div className='space-y-4'>
                  <div>
                    <Label className='text-sm font-medium mb-2 block'>
                      Paste JSON Data
                    </Label>
                    <Textarea
                      value={jsonInput}
                      onChange={e => setJsonInput(e.target.value)}
                      placeholder='[{"categoryName": "Example", "categoryCode": "EXMPL", ...}]'
                      rows={10}
                      className='font-mono text-sm'
                    />
                  </div>
                  <Button variant='outline' onClick={handleJsonInput}>
                    Validate JSON
                  </Button>
                </div>
              )}

              {/* Errors Display */}
              {errors.length > 0 && (
                <Alert variant='destructive'>
                  <AlertTriangle className='h-4 w-4' />
                  <AlertTitle>Import Errors</AlertTitle>
                  <AlertDescription>
                    <ul className='list-disc pl-5 space-y-1'>
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Import Button */}
              <Button
                onClick={handleImport}
                disabled={
                  importMutation.isPending ||
                  (!file && !jsonInput) ||
                  errors.length > 0
                }
                className='w-full'
                size='lg'
              >
                {importMutation.isPending ? (
                  <>
                    <span className='animate-spin mr-2'>⟳</span>
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className='mr-2 h-5 w-5' />
                    Import Categories
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className='space-y-6'>
          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Import Instructions</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='space-y-2'>
                <h4 className='text-sm font-medium'>Required Fields:</h4>
                <ul className='text-xs text-gray-500 space-y-1 list-disc pl-5'>
                  <li>
                    <code>categoryName</code> (string, 2-100 chars)
                  </li>
                  <li>
                    <code>categoryCode</code> (string, uppercase, 2-20 chars)
                  </li>
                </ul>
              </div>

              <div className='space-y-2'>
                <h4 className='text-sm font-medium'>Optional Fields:</h4>
                <ul className='text-xs text-gray-500 space-y-1 list-disc pl-5'>
                  <li>
                    <code>description</code> (string, max 500 chars)
                  </li>
                  <li>
                    <code>priorityLevel</code> (number, 1-10, default: 5)
                  </li>
                  <li>
                    <code>slaHours</code> (number, min 1, default: 72)
                  </li>
                  <li>
                    <code>isActive</code> (boolean, default: true)
                  </li>
                </ul>
              </div>

              <div className='space-y-2'>
                <h4 className='text-sm font-medium'>Validation Rules:</h4>
                <ul className='text-xs text-gray-500 space-y-1 list-disc pl-5'>
                  <li>Category codes must be unique</li>
                  <li>Category names must be unique</li>
                  <li>Priority levels: 1 (critical) to 10 (low)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Data Preview */}
          {previewData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Data Preview</CardTitle>
                <p className='text-xs text-muted-foreground'>
                  Showing first {previewData.length} records
                </p>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  {previewData.map((item, index) => (
                    <div key={index} className='border rounded p-3'>
                      <div className='flex items-center justify-between mb-2'>
                        <span className='text-sm font-medium'>
                          {item.categoryName}
                        </span>
                        <Badge variant='outline' className='text-xs'>
                          {item.categoryCode}
                        </Badge>
                      </div>
                      <div className='text-xs text-gray-500 space-y-1'>
                        <div>Priority: {item.priorityLevel || 5}</div>
                        <div>SLA: {item.slaHours || 72}h</div>
                        <div>
                          Status:{' '}
                          {item.isActive !== false ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Success Alert (after import) */}
          {importMutation.isSuccess && (
            <Alert>
              <CheckCircle className='h-4 w-4' />
              <AlertTitle>Import Successful</AlertTitle>
              <AlertDescription>
                Categories imported successfully. You will be redirected
                shortly.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  )
}
