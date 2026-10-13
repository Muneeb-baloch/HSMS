// src/app/(dashboard)/cities/view/[id]/page.tsx (Simplified)
'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { useCity } from '@/lib/hooks/entities/useCity'
import { formatDate } from '@/lib/utils/format'
import { ArrowLeft } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'

export default function ViewCityPage () {
  const router = useRouter()
  const params = useParams()

  const id = params.id as string
  const { data: city, isLoading } = useCity(id)

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!city) {
    return <div>City not found</div>
  }

  return (
    <div className='p-6'>
      <Button variant='ghost' onClick={() => router.back()} className='mb-4'>
        <ArrowLeft className='mr-2 h-4 w-4' />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{city.cityName}</CardTitle>
          <CardDescription>City Details</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <p className='text-sm text-gray-500'>State</p>
              <p className='font-medium'>
                {typeof city.stateId === 'object'
                  ? city.stateId.stateName
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className='text-sm text-gray-500'>Created</p>
              <p className='font-medium'>{formatDate(city.createdAt)}</p>
            </div>
          </div>
          {city.cityDescription && (
            <div>
              <p className='text-sm text-gray-500'>Description</p>
              <p className='font-medium'>{city.cityDescription}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
