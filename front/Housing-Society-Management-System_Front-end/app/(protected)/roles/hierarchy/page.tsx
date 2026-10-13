// src/app/(dashboard)/roles/hierarchy/page.tsx
'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRoleHierarchy } from '@/lib/hooks/entities/useUserRole'
import { RoleLevel } from '@/lib/types/userrole'
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Shield,
  Users
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { DetailPageSkeleton } from '@/components/shared/PageSkeleton'

export default function RoleHierarchyPage () {
  const router = useRouter()
  const { data: hierarchy, isLoading } = useRoleHierarchy()
  const [expandedLevels, setExpandedLevels] = useState<string[]>([])

  const toggleLevel = (level: string) => {
    setExpandedLevels(prev =>
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    )
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case RoleLevel.SYSTEM:
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case RoleLevel.ADMINISTRATIVE:
        return 'bg-red-100 text-red-800 border-red-200'
      case RoleLevel.MANAGERIAL:
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case RoleLevel.OPERATIONAL:
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case RoleLevel.STAFF:
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (isLoading) {
    return <DetailPageSkeleton />
  }

  return (
    <div className='space-y-1'>
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-2'>
          <Button variant='ghost' size='sm' onClick={() => router.back()}>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back
          </Button>
        </div>
      </div>

      <div>
        <h1 className='text-2xl font-bold mb-2'>Role Hierarchy</h1>
        <p className='text-muted-foreground mb-6'>
          Visual representation of role levels and their relationships
        </p>
      </div>

      <div className='space-y-4'>
        {hierarchy?.map(level => {
          const isExpanded = expandedLevels.includes(level.level)
          const Icon = isExpanded ? ChevronDown : ChevronRight

          return (
            <Card key={level.level} className='overflow-hidden'>
              <CardHeader
                className='cursor-pointer hover:bg-gray-50 transition-colors'
                onClick={() => toggleLevel(level.level)}
              >
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <Icon className='h-5 w-5 text-muted-foreground' />
                    <div>
                      <CardTitle className='flex items-center gap-2'>
                        <span>{level.level}</span>
                        <Badge
                          variant='outline'
                          className={getLevelColor(level.level)}
                        >
                          {level.roles.length} roles
                        </Badge>
                      </CardTitle>
                      <p className='text-sm text-muted-foreground mt-1'>
                        {level.description}
                      </p>
                    </div>
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    Priority: {level.minPriority} - {level.maxPriority}
                  </div>
                </div>
              </CardHeader>

              {isExpanded && level.roles.length > 0 && (
                <CardContent className='pt-0'>
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4'>
                    {level.roles.map(role => (
                      <div
                        key={role._id}
                        className='border rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer'
                        onClick={() => router.push(`/roles/view/${role._id}`)}
                      >
                        <div className='flex justify-between items-start mb-2'>
                          <div>
                            <h4 className='font-medium'>{role.roleName}</h4>
                            <p className='text-sm text-muted-foreground'>
                              {role.roleCode}
                            </p>
                          </div>
                          <Badge
                            className={
                              role.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }
                          >
                            {role.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>

                        <p className='text-sm text-muted-foreground line-clamp-2 mb-3'>
                          {role.roleDescription || 'No description'}
                        </p>

                        <div className='flex items-center justify-between text-sm'>
                          <div className='flex items-center gap-2'>
                            <Users className='h-3 w-3' />
                            <span>{role.userCount || 0} users</span>
                          </div>
                          <div className='flex items-center gap-2'>
                            <Shield className='h-3 w-3' />
                            <span>{role.permissionCount || 0} perms</span>
                          </div>
                          <div className='font-medium'>P: {role.priority}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
