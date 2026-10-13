// src/app/(dashboard)/installments/generate-from-plan/page.tsx
'use client'

import { SearchableSelect } from '@/components/shared/SearchableSelect/SearchableSelect'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import { useFile } from '@/lib/hooks/entities/useFile'
import { useGenerateInstallmentsFromPlan } from '@/lib/hooks/entities/useInstallment'
import { useAuth } from '@/lib/hooks/useAuth'
import { Installment } from '@/lib/types/installment'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function GenerateInstallmentsFromPlanPage () {
  const router = useRouter()
  const { user } = useAuth()
  const [fileId, setFileId] = useState('')
  const [generated, setGenerated] = useState<Installment[] | null>(null)

  const { data: file, isLoading: isFileLoading } = useFile(fileId)
  const generateMutation = useGenerateInstallmentsFromPlan()

  const canCreate =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

  if (!canCreate) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to generate installments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.back()}>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleFileChange = (value: string) => {
    setFileId(value)
    setGenerated(null)
  }

  const handleGenerate = async () => {
    if (!fileId) return
    const result = await generateMutation.mutateAsync({ fileId })
    setGenerated(result)
  }

  const plan = file?.plan
  const plot = file?.plot
  const member = file?.member

  return (
    <div className='p-6'>
      <div className='mb-6'>
        <Button variant='ghost' onClick={() => router.back()} className='mb-4'>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back to Installments
        </Button>

        <h1 className='text-3xl font-bold'>Generate Installments from Plan</h1>
        <p className='text-gray-500 mt-2'>
          Pick a member&apos;s file to generate its full installment schedule
          from the Installment Plan linked to that file.
        </p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2 space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>1. Select File</CardTitle>
              <CardDescription>
                Search by file registration number. The file already carries
                the member, plot, and installment plan to use.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SearchableSelect
                value={fileId}
                onValueChange={handleFileChange}
                endpoint='/file'
                labelField='fileRegNo'
                valueField='_id'
                placeholder='Search by file registration number...'
              />
            </CardContent>
          </Card>

          {fileId && (
            <Card>
              <CardHeader>
                <CardTitle>2. Review &amp; Generate</CardTitle>
                <CardDescription>
                  Confirm the details below, then generate the installment
                  schedule.
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                {isFileLoading ? (
                  <div className='text-center py-8 text-gray-500'>
                    Loading file details...
                  </div>
                ) : file ? (
                  <>
                    <div className='grid grid-cols-2 gap-4 text-sm'>
                      <div>
                        <div className='text-gray-500'>Member</div>
                        <div className='font-medium'>
                          {member?.memName || '—'}
                        </div>
                      </div>
                      <div>
                        <div className='text-gray-500'>Plot</div>
                        <div className='font-medium'>
                          {plot?.plotNo || '—'}
                        </div>
                      </div>
                      <div>
                        <div className='text-gray-500'>Installment Plan</div>
                        <div className='font-medium'>
                          {plan?.planName || (
                            <span className='text-red-600'>
                              No plan linked to this file
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className='text-gray-500'>Plot Total Amount</div>
                        <div className='font-medium'>
                          Rs.{' '}
                          {(plot?.plotTotalAmount ?? 0).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <Button
                      onClick={handleGenerate}
                      disabled={!plan || generateMutation.isPending}
                      className='w-full'
                    >
                      <Sparkles className='mr-2 h-4 w-4' />
                      {generateMutation.isPending
                        ? 'Generating...'
                        : 'Generate Installments'}
                    </Button>
                  </>
                ) : (
                  <div className='text-center py-8 text-gray-500'>
                    File not found
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {generated && (
            <Card>
              <CardHeader>
                <CardTitle>Generated Schedule</CardTitle>
                <CardDescription>
                  {generated.length} installments were created for this file.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead className='text-right'>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {generated.map(inst => (
                      <TableRow key={inst._id}>
                        <TableCell>{inst.installmentNo}</TableCell>
                        <TableCell>{inst.installmentTitle}</TableCell>
                        <TableCell>
                          {new Date(inst.dueDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className='text-right'>
                          Rs. {inst.amountDue.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant='secondary'>{inst.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Button
                  variant='outline'
                  className='mt-4'
                  onClick={() => router.push(`/installments?fileId=${fileId}`)}
                >
                  View in Installments List
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>How this works</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 text-sm text-gray-600'>
              <p>
                Each File already has a required Installment Plan selected
                when it was created.
              </p>
              <p>
                This tool reads every category row configured under that
                Plan (Down Payment, Monthly, etc.), applies its percentage or
                fixed amount against the Plot&apos;s actual total price, and
                creates the real due installments — spaced one month apart
                per occurrence, starting from the file&apos;s booking date.
              </p>
              <p>
                This can only be run once per file — if installments already
                exist for the selected file, generation is blocked.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
