'use client'

import CertificateForm from '@/components/plra/CertificateForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import { useAuth } from '@/lib/hooks/useAuth'
import { useGenerateCertificate } from '@/lib/hooks/entities/usePLRA'
import { GenerateCertificateDto } from '@/lib/types/plra'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function CreateCertificatePage () {
  const router = useRouter()
  const { user } = useAuth()
  const generateCertificate = useGenerateCertificate()

  const canCreate =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

  if (!canCreate) {
    return (
      <div className='p-6'>
        <Card>
          <CardContent className='pt-6'>
            <p className='text-muted-foreground'>
              You do not have permission to generate certificates.
            </p>
            <Button variant='ghost' className='mt-4' onClick={() => router.back()}>
              <ArrowLeft className='mr-2 h-4 w-4' /> Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSubmit = async (values: GenerateCertificateDto) => {
    await generateCertificate.mutateAsync(values)
    router.push('/plra')
  }

  return (
    <div className='p-6'>
      <Button variant='ghost' className='mb-6' onClick={() => router.back()}>
        <ArrowLeft className='mr-2 h-4 w-4' /> Back
      </Button>

      <h1 className='text-3xl font-bold mb-2'>Generate Certificate</h1>
      <p className='text-muted-foreground mb-8'>
        Create a new PLRA certificate for a property
      </p>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        <div className='lg:col-span-2'>
          <Card>
            <CardContent className='pt-6'>
              <CertificateForm
                mode='create'
                onSubmit={handleSubmit}
                onCancel={() => router.back()}
                isLoading={generateCertificate.isPending}
              />
            </CardContent>
          </Card>
        </div>

        <div className='space-y-6'>
          <Card>
            <CardContent className='pt-6 text-sm space-y-3'>
              <h3 className='font-semibold text-lg mb-2'>Quick Tips</h3>
              <p>- Ownership certificates are for fully paid plots</p>
              <p>- Allotment certificates are issued on booking</p>
              <p>- Transfer certificates require prior ownership</p>
              <p>- Possession certificates confirm physical handover</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
