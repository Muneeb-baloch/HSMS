'use client'

import CertificateForm from '@/components/plra/CertificateForm'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import { useAuth } from '@/lib/hooks/useAuth'
import {
  useCertificate,
  useUpdateCertificate
} from '@/lib/hooks/entities/usePLRA'
import { UpdateCertificateDto } from '@/lib/types/plra'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { FormPageSkeleton } from '@/components/shared/PageSkeleton'

export default function EditCertificatePage () {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const id = params.id as string

  const { data: certificate, isLoading, error } = useCertificate(id)
  const updateCertificate = useUpdateCertificate()

  const canUpdate =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

  if (!canUpdate) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You do not have permission to edit certificates.
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

  if (isLoading) {
    return <FormPageSkeleton />
  }

  if (error || !certificate) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Certificate Not Found</CardTitle>
            <CardDescription>
              The certificate could not be loaded or does not exist.
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

  const defaultValues: Partial<UpdateCertificateDto> = {
    plotId: certificate.plotId,
    memberId: certificate.memberId,
    societyId: certificate.societyId,
    certificateType: certificate.certificateType,
    propertyDetails: {
      area: certificate.propertyDetails.area,
      areaUnit: certificate.propertyDetails.areaUnit,
      boundaries: certificate.propertyDetails.boundaries,
      address: certificate.propertyDetails.address,
      plotNumber: certificate.propertyDetails.plotNumber,
      blockName: certificate.propertyDetails.blockName
    },
    ownerDetails: {
      name: certificate.ownerDetails.name,
      cnic: certificate.ownerDetails.cnic,
      fatherName: certificate.ownerDetails.fatherName,
      address: certificate.ownerDetails.address
    }
  }

  const handleSubmit = async (values: UpdateCertificateDto) => {
    await updateCertificate.mutateAsync({ id, data: values })
    router.push('/plra')
  }

  return (
    <div className='p-6'>
      <div className='mb-6'>
        <Button variant='ghost' onClick={() => router.back()} className='mb-4'>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back to Certificates
        </Button>

        <h1 className='text-3xl font-bold'>Edit Certificate</h1>
        <p className='text-gray-500 mt-2'>
          {certificate.certificateNumber}
        </p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2'>
          <Card>
            <CardContent className='pt-6'>
              <CertificateForm
                mode='edit'
                defaultValues={defaultValues}
                onSubmit={handleSubmit}
                onCancel={() => router.back()}
                isLoading={updateCertificate.isPending}
              />
            </CardContent>
          </Card>
        </div>

        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Current Information</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4 text-sm'>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Certificate #:</span>
                <span className='font-medium'>{certificate.certificateNumber}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Type:</span>
                <Badge variant='secondary'>
                  {certificate.certificateType}
                </Badge>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Status:</span>
                <Badge
                  variant={
                    certificate.status === 'issued'
                      ? 'success'
                      : certificate.status === 'revoked'
                      ? 'destructive'
                      : 'secondary'
                  }
                >
                  {certificate.status}
                </Badge>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Sync Status:</span>
                <Badge
                  variant={
                    certificate.syncStatus === 'synced'
                      ? 'success'
                      : certificate.syncStatus === 'failed'
                      ? 'destructive'
                      : certificate.syncStatus === 'pending'
                      ? 'warning'
                      : 'secondary'
                  }
                >
                  {certificate.syncStatus}
                </Badge>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Owner:</span>
                <span className='font-medium'>{certificate.ownerDetails.name}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Plot:</span>
                <span className='font-medium'>
                  {certificate.propertyDetails.plotNumber} - {certificate.propertyDetails.blockName}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
