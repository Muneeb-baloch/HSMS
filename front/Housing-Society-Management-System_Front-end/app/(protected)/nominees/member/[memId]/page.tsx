// src/app/(dashboard)/nominees/member/[memId]/page.tsx
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
import { Progress } from '@/components/ui/progress'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import { useMember } from '@/lib/hooks/entities/useMember'
import {
  useCreateNominee,
  useMemberShareCoverage,
  useNomineesByMember
} from '@/lib/hooks/entities/useNominee'
import { useAuth } from '@/lib/hooks/useAuth'
import { RelationType } from '@/lib/types/nominee'
import {
  ArrowLeft,
  CheckCircle,
  Plus,
  Shield,
  TrendingUp,
  Users
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { customToast } from "@/lib/utils/customToast"

export default function MemberNomineesPage () {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()

  const memId = params.memId as string
  const { data: member, isLoading: memberLoading } = useMember(memId)
  const { data: nominees, isLoading: nomineesLoading } =
    useNomineesByMember(memId)
  const { data: coverage } = useMemberShareCoverage(memId)
  const createMutation = useCreateNominee()

  const canCreate =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

  const [showAddForm, setShowAddForm] = useState(false)
  const [newNominee, setNewNominee] = useState({
    nomineeName: '',
    nomineeCNIC: '',
    relationWithMember: RelationType.SON,
    nomineeContact: '',
    nomineeSharePercentage: 0
  })

  const handleAddNominee = async () => {
    if (
      !newNominee.nomineeName.trim() ||
      !newNominee.nomineeCNIC.trim() ||
      !newNominee.nomineeContact.trim()
    ) {
      customToast.error('Please fill in all required fields')
      return
    }

    try {
      const remainingShare = 100 - (coverage?.totalShare || 0)
      const sharePercentage = Math.min(
        newNominee.nomineeSharePercentage || 0,
        remainingShare
      )

      await createMutation.mutateAsync({
        memId,
        nomineeName: newNominee.nomineeName,
        nomineeCNIC: newNominee.nomineeCNIC,
        relationWithMember: newNominee.relationWithMember,
        nomineeContact: newNominee.nomineeContact,
        nomineeSharePercentage: sharePercentage
      })

      setNewNominee({
        nomineeName: '',
        nomineeCNIC: '',
        relationWithMember: RelationType.SON,
        nomineeContact: '',
        nomineeSharePercentage: 0
      })
      setShowAddForm(false)
    } catch (error) {
      customToast.error('Failed to add nominee')
    }
  }

  if (memberLoading || nomineesLoading) {
    return (
      <div className='p-6 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
      </div>
    )
  }

  if (!member) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Member Not Found</CardTitle>
            <CardDescription>
              The requested member does not exist or has been deleted.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/nominees')}>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Nominees
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const relationColors = {
    [RelationType.SON]: 'bg-blue-100 text-blue-800',
    [RelationType.DAUGHTER]: 'bg-pink-100 text-pink-800',
    [RelationType.WIFE]: 'bg-red-100 text-red-800',
    [RelationType.HUSBAND]: 'bg-cyan-100 text-cyan-800',
    [RelationType.FATHER]: 'bg-orange-100 text-orange-800',
    [RelationType.MOTHER]: 'bg-green-100 text-green-800',
    [RelationType.BROTHER]: 'bg-gray-100 text-gray-800',
    [RelationType.SISTER]: 'bg-purple-100 text-purple-800',
    [RelationType.UNCLE]: 'bg-yellow-100 text-yellow-800',
    [RelationType.AUNT]: 'bg-indigo-100 text-indigo-800',
    [RelationType.GRANDFATHER]: 'bg-amber-100 text-amber-800',
    [RelationType.GRANDMOTHER]: 'bg-teal-100 text-teal-800',
    [RelationType.OTHER]: 'bg-gray-100 text-gray-800'
  }

  return (
    <div className='p-6 space-y-6'>
      <div className='flex justify-between items-start'>
        <div>
          <Button variant='ghost' onClick={() => router.back()}>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back
          </Button>
          <h1 className='text-2xl font-bold mt-4'>
            {member.memName}&apos; Nominees
          </h1>
          <p className='text-muted-foreground'>
            Manage nominees and share distribution for this member
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className='mr-2 h-4 w-4' />
            Add Nominee
          </Button>
        )}
      </div>

      {/* Coverage Summary */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Shield className='h-5 w-5' />
            Share Coverage Summary
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <div className='flex justify-between'>
              <div>
                <div className='text-sm text-gray-500'>Total Coverage</div>
                <div
                  className={`text-2xl font-bold ${
                    coverage?.isFullyCovered
                      ? 'text-green-600'
                      : 'text-blue-600'
                  }`}
                >
                  {coverage?.coveragePercentage || 0}%
                </div>
              </div>
              <div className='text-right'>
                <div className='text-sm text-gray-500'>Nominees</div>
                <div className='text-2xl font-bold'>
                  {nominees?.length || 0}
                </div>
              </div>
            </div>
            <Progress
              value={coverage?.coveragePercentage || 0}
              className='h-3'
            />
            <div className='flex justify-between text-sm'>
              <span>
                Remaining: {100 - (coverage?.coveragePercentage || 0)}%
              </span>
              <span>Target: 100%</span>
            </div>
          </div>

          {coverage?.isFullyCovered ? (
            <div className='flex items-center gap-2 text-green-600'>
              <CheckCircle className='h-5 w-5' />
              <span className='font-medium'>Full coverage achieved</span>
            </div>
          ) : (
            <div className='flex items-center gap-2 text-orange-600'>
              <TrendingUp className='h-5 w-5' />
              <span className='font-medium'>
                Additional {100 - (coverage?.coveragePercentage || 0)}% coverage
                needed
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Nominee Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Nominee</CardTitle>
            <CardDescription>Add a new nominee for this member</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium mb-2'>
                  Nominee Name
                </label>
                <input
                  type='text'
                  value={newNominee.nomineeName}
                  onChange={e =>
                    setNewNominee(prev => ({
                      ...prev,
                      nomineeName: e.target.value
                    }))
                  }
                  className='w-full px-3 py-2 border rounded-md'
                  placeholder='Enter nominee name'
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-2'>CNIC</label>
                <input
                  type='text'
                  value={newNominee.nomineeCNIC}
                  onChange={e =>
                    setNewNominee(prev => ({
                      ...prev,
                      nomineeCNIC: e.target.value
                    }))
                  }
                  className='w-full px-3 py-2 border rounded-md'
                  placeholder='XXXXX-XXXXXXX-X'
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-2'>
                  Relation
                </label>
                <select
                  value={newNominee.relationWithMember}
                  onChange={e =>
                    setNewNominee(prev => ({
                      ...prev,
                      relationWithMember: e.target.value as RelationType
                    }))
                  }
                  className='w-full px-3 py-2 border rounded-md'
                >
                  {Object.values(RelationType).map(relation => (
                    <option key={relation} value={relation}>
                      {relation}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium mb-2'>
                  Contact Number
                </label>
                <input
                  type='text'
                  value={newNominee.nomineeContact}
                  onChange={e =>
                    setNewNominee(prev => ({
                      ...prev,
                      nomineeContact: e.target.value
                    }))
                  }
                  className='w-full px-3 py-2 border rounded-md'
                  placeholder='03XXXXXXXXX'
                />
              </div>
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium mb-2'>
                  Share Percentage (Max: {100 - (coverage?.totalShare || 0)}%)
                </label>
                <input
                  type='range'
                  min='0'
                  max={100 - (coverage?.totalShare || 0)}
                  value={newNominee.nomineeSharePercentage}
                  onChange={e =>
                    setNewNominee(prev => ({
                      ...prev,
                      nomineeSharePercentage: parseInt(e.target.value)
                    }))
                  }
                  className='w-full'
                />
                <div className='flex justify-between text-sm text-gray-500 mt-2'>
                  <span>0%</span>
                  <span className='font-medium'>
                    {newNominee.nomineeSharePercentage}%
                  </span>
                  <span>{100 - (coverage?.totalShare || 0)}%</span>
                </div>
              </div>
            </div>
            <div className='flex gap-2 mt-6'>
              <Button
                onClick={handleAddNominee}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Adding...' : 'Add Nominee'}
              </Button>
              <Button variant='outline' onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Nominees List */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Users className='h-5 w-5' />
            Nominees ({nominees?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {nominees && nominees.length > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {nominees.map(nominee => (
                <Card key={nominee._id} className='overflow-hidden'>
                  <CardContent className='pt-6'>
                    <div className='flex justify-between items-start mb-4'>
                      <div>
                        <h3 className='font-bold text-lg'>
                          {nominee.nomineeName}
                        </h3>
                        <p className='text-sm text-gray-500'>
                          {nominee.nomineeCNIC}
                        </p>
                      </div>
                      <Badge
                        className={relationColors[nominee.relationWithMember]}
                      >
                        {nominee.relationWithMember}
                      </Badge>
                    </div>
                    <div className='space-y-3'>
                      <div>
                        <div className='text-sm text-gray-600'>Contact</div>
                        <div className='font-medium'>
                          {nominee.nomineeContact}
                        </div>
                      </div>
                      {nominee.nomineeEmail && (
                        <div>
                          <div className='text-sm text-gray-600'>Email</div>
                          <div className='font-medium'>
                            {nominee.nomineeEmail}
                          </div>
                        </div>
                      )}
                      <div>
                        <div className='text-sm text-gray-600'>
                          Share Percentage
                        </div>
                        <div
                          className={`text-xl font-bold ${
                            nominee.nomineeSharePercentage === 100
                              ? 'text-purple-600'
                              : 'text-blue-600'
                          }`}
                        >
                          {nominee.nomineeSharePercentage}%
                        </div>
                      </div>
                      <div className='flex gap-2 pt-4'>
                        <Button
                          size='sm'
                          variant='outline'
                          className='flex-1'
                          onClick={() =>
                            router.push(`/nominees/view/${nominee._id}`)
                          }
                        >
                          View
                        </Button>
                        {canCreate && (
                          <Button
                            size='sm'
                            variant='outline'
                            className='flex-1'
                            onClick={() =>
                              router.push(`/nominees/edit/${nominee._id}`)
                            }
                          >
                            Edit
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className='text-center py-12'>
              <Users className='h-12 w-12 text-gray-300 mx-auto mb-4' />
              <h3 className='text-lg font-medium text-gray-900 mb-2'>
                No nominees found
              </h3>
              <p className='text-gray-500 mb-4'>
                This member doesn&apos;t have any nominees yet.
              </p>
              {canCreate && (
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className='mr-2 h-4 w-4' />
                  Add First Nominee
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
