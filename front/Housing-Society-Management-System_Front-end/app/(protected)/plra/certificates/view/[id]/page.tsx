'use client'

import CertificateView from '@/components/plra/CertificateView'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'

export default function ViewCertificatePage () {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  return (
    <div className='p-6'>
      <Button variant='ghost' className='mb-6' onClick={() => router.back()}>
        <ArrowLeft className='mr-2 h-4 w-4' /> Back
      </Button>
      <CertificateView id={id} />
    </div>
  )
}
