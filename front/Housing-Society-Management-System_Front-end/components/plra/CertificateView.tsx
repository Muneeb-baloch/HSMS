'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import { useAuth } from '@/lib/hooks/useAuth'
import {
  useCertificate,
  useSyncCertificate,
  useSyncLogs,
  useRevokeCertificate
} from '@/lib/hooks/entities/usePLRA'
import { PLRASyncLog } from '@/lib/types/plra'
import { formatDate } from '@/lib/utils/format'
import {
  Download,
  Edit,
  Loader2,
  RefreshCw,
  ShieldCheck,
  XCircle
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useConfirm } from "@/components/shared/ConfirmDialog";

interface CertificateViewProps {
  id: string
}

const syncStatusVariant = (status: string) => {
  switch (status) {
    case 'synced':
      return 'success'
    case 'pending':
      return 'warning'
    case 'failed':
      return 'destructive'
    default:
      return 'secondary'
  }
}

const statusVariant = (status: string) => {
  switch (status) {
    case 'issued':
    case 'verified':
      return 'success'
    case 'revoked':
      return 'destructive'
    case 'expired':
      return 'warning'
    default:
      return 'secondary'
  }
}

const logStatusVariant = (status: string) => {
  switch (status) {
    case 'success':
      return 'success'
    case 'failed':
      return 'destructive'
    case 'timeout':
      return 'warning'
    default:
      return 'secondary'
  }
}

export default function CertificateView ({ id }: CertificateViewProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { confirm } = useConfirm();

  const { data: certificate, isLoading, error } = useCertificate(id)
  const { data: syncLogsData } = useSyncLogs(id)
  const syncCertificate = useSyncCertificate()
  const revokeCertificate = useRevokeCertificate()

  const canAdmin =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[60vh]'>
        <Loader2 className='h-10 w-10 animate-spin text-primary' />
      </div>
    )
  }

  if (error || !certificate) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Certificate Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground mb-4'>
            The requested certificate does not exist or has been deleted.
          </p>
          <Button onClick={() => router.push('/plra')}>
            Back to Certificates
          </Button>
        </CardContent>
      </Card>
    )
  }

  const handleSync = async () => {
    try {
      await syncCertificate.mutateAsync(id)
    } catch {
      // Error handled in hook
    }
  }

  const handleRevoke = async () => {
    if (!await confirm({ title: "Confirm", description: 'Are you sure you want to revoke this certificate? This action cannot be undone.' })) return
    try {
      await revokeCertificate.mutateAsync({ id })
    } catch {
      // Error handled in hook
    }
  }

  const syncLogs: PLRASyncLog[] = syncLogsData?.items || []

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-white flex items-center gap-3'>
            <ShieldCheck className='h-6 w-6' />
            {certificate.certificateNumber}
          </h1>
          <div className='flex items-center gap-2 mt-2'>
            <Badge variant='outline' className='capitalize'>
              {certificate.certificateType}
            </Badge>
            <Badge variant={statusVariant(certificate.status)} className='capitalize'>
              {certificate.status}
            </Badge>
            <Badge variant={syncStatusVariant(certificate.syncStatus)} className='capitalize'>
              {certificate.syncStatus}
            </Badge>
          </div>
        </div>

        <div className='flex gap-2'>
          {canAdmin && (
            <Button
              variant='outline'
              onClick={() => router.push(`/plra/certificates/edit/${id}`)}
            >
              <Edit className='mr-2 h-4 w-4' />
              Edit
            </Button>
          )}
          <Button
            variant='outline'
            onClick={handleSync}
            disabled={syncCertificate.isPending || certificate.syncStatus === 'synced'}
          >
            {syncCertificate.isPending ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              <RefreshCw className='mr-2 h-4 w-4' />
            )}
            Sync with PLRA
          </Button>
          {certificate.pdfUrl && (
            <Button variant='outline' asChild>
              <a href={certificate.pdfUrl} target='_blank' rel='noopener noreferrer'>
                <Download className='mr-2 h-4 w-4' />
                Download PDF
              </a>
            </Button>
          )}
          {canAdmin && certificate.status !== 'revoked' && (
            <Button
              variant='destructive'
              onClick={handleRevoke}
              disabled={revokeCertificate.isPending}
            >
              {revokeCertificate.isPending ? (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              ) : (
                <XCircle className='mr-2 h-4 w-4' />
              )}
              Revoke
            </Button>
          )}
        </div>
      </div>

      {/* Two-column layout */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Property Details */}
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Property Details</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4 text-sm'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <div className='text-gray-500'>Plot Number</div>
                <div className='font-medium mt-1'>
                  {certificate.propertyDetails.plotNumber}
                </div>
              </div>
              <div>
                <div className='text-gray-500'>Block</div>
                <div className='font-medium mt-1'>
                  {certificate.propertyDetails.blockName}
                </div>
              </div>
              <div>
                <div className='text-gray-500'>Area</div>
                <div className='font-medium mt-1'>
                  {certificate.propertyDetails.area} {certificate.propertyDetails.areaUnit}
                </div>
              </div>
              <div>
                <div className='text-gray-500'>Issued Date</div>
                <div className='font-medium mt-1'>
                  {formatDate(certificate.issuedDate)}
                </div>
              </div>
            </div>
            <div>
              <div className='text-gray-500'>Address</div>
              <div className='font-medium mt-1'>
                {certificate.propertyDetails.address}
              </div>
            </div>
            {certificate.propertyDetails.boundaries && (
              <div>
                <div className='text-gray-500'>Boundaries</div>
                <div className='font-medium mt-1 whitespace-pre-wrap'>
                  {certificate.propertyDetails.boundaries}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Owner Details */}
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Owner Details</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4 text-sm'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <div className='text-gray-500'>Name</div>
                <div className='font-medium mt-1'>
                  {certificate.ownerDetails.name}
                </div>
              </div>
              <div>
                <div className='text-gray-500'>CNIC</div>
                <div className='font-medium mt-1 font-mono'>
                  {certificate.ownerDetails.cnic}
                </div>
              </div>
              <div>
                <div className='text-gray-500'>Father&apos;s Name</div>
                <div className='font-medium mt-1'>
                  {certificate.ownerDetails.fatherName}
                </div>
              </div>
            </div>
            <div>
              <div className='text-gray-500'>Address</div>
              <div className='font-medium mt-1'>
                {certificate.ownerDetails.address}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QR Code and PLRA Reference */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>QR Code</CardTitle>
          </CardHeader>
          <CardContent>
            {certificate.qrCode ? (
              <div className='flex flex-col items-center gap-4'>
                <div className='w-48 h-48 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center bg-white p-2'>
                  {/* QR code image rendered from the qrCode data URL or string */}
                  {certificate.qrCode.startsWith('data:') ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={certificate.qrCode}
                      alt='Certificate QR Code'
                      className='w-full h-full object-contain'
                    />
                  ) : (
                    <div className='text-center text-xs text-gray-500 break-all p-2'>
                      {certificate.qrCode}
                    </div>
                  )}
                </div>
                <p className='text-xs text-muted-foreground text-center'>
                  Scan this QR code to verify the certificate
                </p>
              </div>
            ) : (
              <p className='text-muted-foreground'>No QR code available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>PLRA Reference</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4 text-sm'>
            <div>
              <div className='text-gray-500'>Reference Number</div>
              <div className='font-medium mt-1 font-mono text-lg'>
                {certificate.plraReferenceNumber || 'Not yet synced'}
              </div>
            </div>
            <div>
              <div className='text-gray-500'>Sync Status</div>
              <div className='mt-1'>
                <Badge
                  variant={syncStatusVariant(certificate.syncStatus)}
                  className='capitalize'
                >
                  {certificate.syncStatus}
                </Badge>
              </div>
            </div>
            {certificate.validUntil && (
              <div>
                <div className='text-gray-500'>Valid Until</div>
                <div className='font-medium mt-1'>
                  {formatDate(certificate.validUntil)}
                </div>
              </div>
            )}
            {certificate.digitalSignature && (
              <div>
                <div className='text-gray-500'>Digital Signature</div>
                <div className='font-mono text-xs mt-1 truncate'>
                  {certificate.digitalSignature}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sync History */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Sync History</CardTitle>
        </CardHeader>
        <CardContent>
          {syncLogs.length === 0 ? (
            <p className='text-muted-foreground text-sm'>
              No sync logs available for this certificate.
            </p>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b border-border'>
                    <th className='text-left py-3 px-4 font-medium text-muted-foreground'>
                      Action
                    </th>
                    <th className='text-left py-3 px-4 font-medium text-muted-foreground'>
                      Status
                    </th>
                    <th className='text-left py-3 px-4 font-medium text-muted-foreground'>
                      Duration
                    </th>
                    <th className='text-left py-3 px-4 font-medium text-muted-foreground'>
                      Error
                    </th>
                    <th className='text-left py-3 px-4 font-medium text-muted-foreground'>
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {syncLogs.map((log: PLRASyncLog) => (
                    <tr
                      key={log._id}
                      className='border-b border-border/50 hover:bg-muted/50'
                    >
                      <td className='py-3 px-4'>{log.action}</td>
                      <td className='py-3 px-4'>
                        <Badge
                          variant={logStatusVariant(log.status)}
                          className='capitalize'
                        >
                          {log.status}
                        </Badge>
                      </td>
                      <td className='py-3 px-4'>
                        {log.duration ? `${log.duration}ms` : '-'}
                      </td>
                      <td className='py-3 px-4 text-red-400 max-w-[200px] truncate'>
                        {log.errorMessage || '-'}
                      </td>
                      <td className='py-3 px-4'>
                        {formatDate(log.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
