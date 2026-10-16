'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import {
  usePossession,
  useUpdatePossessionStatus
} from '@/lib/hooks/entities/usePossession'
import { useAuth } from '@/lib/hooks/useAuth'
import { PossessionStatus } from '@/lib/types/possession'
import { ArrowLeft } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { FormPageSkeleton } from '@/components/shared/PageSkeleton'

const statusLabels: Record<string, string> = {
  [PossessionStatus.REQUESTED]: 'Requested',
  [PossessionStatus.SURVEYED]: 'Surveyed',
  [PossessionStatus.READY]: 'Ready for Handover',
  [PossessionStatus.HANDED_OVER]: 'Handed Over',
  [PossessionStatus.CANCELLED]: 'Cancelled',
  [PossessionStatus.ON_HOLD]: 'On Hold'
}

const statusColors: Record<string, string> = {
  [PossessionStatus.REQUESTED]: 'bg-blue-100 text-blue-800',
  [PossessionStatus.SURVEYED]: 'bg-orange-100 text-orange-800',
  [PossessionStatus.READY]: 'bg-green-100 text-green-800',
  [PossessionStatus.HANDED_OVER]: 'bg-purple-100 text-purple-800',
  [PossessionStatus.CANCELLED]: 'bg-red-100 text-red-800',
  [PossessionStatus.ON_HOLD]: 'bg-yellow-100 text-yellow-800'
}

export default function EditPossessionPage () {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()

  const id = params.id as string
  const { data: possession, isLoading } = usePossession(id)
  const updateStatusMutation = useUpdatePossessionStatus()

  const [newStatus, setNewStatus] = useState<string>('')
  const [remarks, setRemarks] = useState('')
  const [surveyPerson, setSurveyPerson] = useState('')
  const [surveyDate, setSurveyDate] = useState('')
  const [handoverDate, setHandoverDate] = useState('')

  const canUpdate =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN] as UserRole[])

  if (!canUpdate) {
    router.push('/possessions')
    return null
  }

  if (isLoading) {
    return <FormPageSkeleton />
  }

  if (!possession) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Possession Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/possessions')}>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Possessions
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const allowedNextStatuses = possession.allowedNextStatuses || []

  const handleCancel = () => router.push(`/possessions/view/${id}`)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newStatus) return

    try {
      await updateStatusMutation.mutateAsync({
        id,
        newStatus,
        remarks: remarks || undefined,
        surveyPerson: surveyPerson || undefined,
        surveyDate: surveyDate ? new Date(surveyDate) : undefined,
        handoverDate: handoverDate ? new Date(handoverDate) : undefined
      })
      router.push(`/possessions/view/${id}`)
    } catch {
      // Error toasted by useUpdatePossessionStatus's onError.
    }
  }

  return (
    <div className='space-y-1'>
      <Button variant='ghost' onClick={() => router.back()} className='mb-4'>
        <ArrowLeft className='mr-2 h-4 w-4' />
        Back
      </Button>

      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='text-2xl'>
                Update Possession Status
              </CardTitle>
              <CardDescription>
                {possession.possessionCode} - change the possession status along its allowed
                workflow transitions
              </CardDescription>
            </div>
            <Badge className={statusColors[possession.possessionStatus] || 'bg-gray-100'}>
              Current: {possession.statusDisplayName || possession.possessionStatus}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {allowedNextStatuses.length === 0 ? (
            <div className='text-center py-10 text-muted-foreground'>
              This possession is in its final state ({possession.statusDisplayName}). No further
              status transitions are allowed.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className='space-y-5 max-w-lg'>
              <div className='space-y-2'>
                <Label htmlFor='newStatus'>
                  New Status <span className='text-destructive'>*</span>
                </Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger id='newStatus' className='w-full'>
                    <SelectValue placeholder='Select new status' />
                  </SelectTrigger>
                  <SelectContent>
                    {allowedNextStatuses.map(status => (
                      <SelectItem key={status} value={status}>
                        {statusLabels[status] || status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {newStatus === PossessionStatus.SURVEYED && (
                <>
                  <div className='space-y-2'>
                    <Label htmlFor='surveyPerson'>Survey Person</Label>
                    <Input
                      id='surveyPerson'
                      value={surveyPerson}
                      onChange={e => setSurveyPerson(e.target.value)}
                      placeholder='Enter surveyor name'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='surveyDate'>Survey Date</Label>
                    <Input
                      id='surveyDate'
                      type='date'
                      value={surveyDate}
                      onChange={e => setSurveyDate(e.target.value)}
                    />
                  </div>
                </>
              )}

              {newStatus === PossessionStatus.HANDED_OVER && (
                <div className='space-y-2'>
                  <Label htmlFor='handoverDate'>Handover Date</Label>
                  <Input
                    id='handoverDate'
                    type='date'
                    value={handoverDate}
                    onChange={e => setHandoverDate(e.target.value)}
                  />
                </div>
              )}

              <div className='space-y-2'>
                <Label htmlFor='remarks'>Remarks</Label>
                <Textarea
                  id='remarks'
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  placeholder='Optional remarks for this status change'
                  rows={3}
                />
              </div>

              <div className='flex gap-3 pt-2'>
                <Button type='submit' disabled={!newStatus || updateStatusMutation.isPending}>
                  Update Status
                </Button>
                <Button type='button' variant='outline' onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
