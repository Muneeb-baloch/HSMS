'use client'

import {
  EntityForm,
  FieldConfig
} from '@/components/shared/EntityForm/EntityForm'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import {
  useTransferById,
  useUpdateTransfer
} from '@/lib/hooks/entities/useTransfer'
import { useAuth } from '@/lib/hooks/useAuth'
import { TransferFormData, transferSchema } from '@/lib/schemas/transfer.schema'
import { UpdateTransferDto } from '@/lib/types/transfer.types'
import { EntityType } from '@/lib/types/upload.types'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { customToast } from "@/lib/utils/customToast"
import { FormPageSkeleton } from '@/components/shared/PageSkeleton'

const getMemberId = (v: unknown): string | undefined =>
  typeof v === "string"
    ? v
    : v && typeof v === "object" && "_id" in (v as object)
      ? String((v as { _id: string })._id)
      : undefined

const transferFormFields: FieldConfig<TransferFormData>[] = [
  // Read-only fields (display only)
  {
    name: 'fileId',
    label: 'File',
    type: 'relationship',
    required: true,
    relationship: {
      endpoint: '/file',
      labelField: 'fileRegNo',
      valueField: '_id',
      searchable: true
    },
    disabled: true
  },
  {
    name: 'transferTypeId',
    label: 'Transfer Type',
    type: 'relationship',
    required: true,
    relationship: {
      endpoint: '/transfertype',
      labelField: 'typeName',
      valueField: '_id',
      searchable: true
    },
    disabled: true
  },
  {
    name: 'sellerMemId',
    label: 'Seller',
    type: 'relationship',
    required: true,
    relationship: {
      endpoint: '/members',
      labelField: 'memName',
      valueField: '_id',
      searchable: true
    },
    disabled: true
  },
  {
    name: 'buyerMemId',
    label: 'Buyer',
    type: 'relationship',
    required: true,
    relationship: {
      endpoint: '/members',
      labelField: 'memName',
      valueField: '_id',
      searchable: true
    },
    disabled: true
  },
  {
    name: 'nomineeId',
    label: 'Nominee',
    type: 'relationship',
    required: false,
    showWhen: (values) =>
      !!getMemberId((values as { buyerMemId?: unknown }).buyerMemId),
    relationship: {
      endpoint: (values) => {
        const memId = getMemberId(
          (values as { buyerMemId?: unknown }).buyerMemId
        );
        return memId ? `/nominee/member/${memId}` : '/nominee?limit=0'
      },
      labelField: 'nomineeName',
      valueField: '_id',
      searchable: false,
      filter: (item: any) => !item.isDeleted,
    },
    placeholder: 'Select nominee (optional)',
    description: 'Choose a nominee for the buyer (dependent on buyer above)',
  },

  // Editable fields
  {
    name: 'transferInitDate',
    label: 'Initiation Date',
    type: 'date',
    required: true
  },
  {
    name: 'transferFeeAmount',
    label: 'Transfer Fee',
    type: 'number',
    required: false
  },
  {
    name: 'transferFeePaid',
    label: 'Fee Paid',
    type: 'switch',
    required: false
  },
  {
    name: 'transferFeePaidDate',
    label: 'Fee Paid Date',
    type: 'date',
    required: false
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    required: false,
    options: [
      { label: 'Pending', value: 'Pending' },
      { label: 'Under Review', value: 'Under Review' },
      { label: 'Approved', value: 'Approved' },
      { label: 'Rejected', value: 'Rejected' },
      { label: 'Completed', value: 'Completed' },
      { label: 'Cancelled', value: 'Cancelled' },
      { label: 'On Hold', value: 'On Hold' },
      { label: 'Documents Required', value: 'Documents Required' },
      { label: 'Fee Pending', value: 'Fee Pending' }
    ]
  },
  {
    name: 'witness1Name',
    label: 'Witness 1 Name',
    type: 'text',
    required: false
  },
  {
    name: 'witness1CNIC',
    label: 'Witness 1 CNIC',
    type: 'text',
    required: false
  },
  {
    name: 'witness2Name',
    label: 'Witness 2 Name',
    type: 'text',
    required: false
  },
  {
    name: 'witness2CNIC',
    label: 'Witness 2 CNIC',
    type: 'text',
    required: false
  },
  {
    name: 'officerName',
    label: 'Officer Name',
    type: 'text',
    required: false
  },
  {
    name: 'officerDesignation',
    label: 'Officer Designation',
    type: 'text',
    required: false
  },
  {
    name: 'transfIsAtt',
    label: 'Documents Attached',
    type: 'switch',
    required: false
  },
  {
    name: 'ndcDocPath',
    label: 'NDC Document',
    type: 'file-upload',
    required: false,
    uploadConfig: {
      entityType: EntityType.TRANSFER,
      entityId: 'temp-transfer',
      maxSize: 10 * 1024 * 1024,
      acceptedFileTypes: ['image/*', '.pdf', '.doc', '.docx', '.txt'],
      allowMultipleTypes: true
    }
  },
  {
    name: 'remarks',
    label: 'Remarks',
    type: 'textarea',
    required: false
  },
  {
    name: 'legalReviewNotes',
    label: 'Legal Review Notes',
    type: 'textarea',
    required: false
  },
  {
    name: 'cancellationReason',
    label: 'Cancellation Reason',
    type: 'text',
    required: false
  },
  {
    name: 'isActive',
    label: 'Active',
    type: 'switch',
    required: false
  }
]

export default function EditTransferPage () {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()

  const id = params.id as string
  const { data: transfer, isLoading } = useTransferById(id)
  const updateMutation = useUpdateTransfer()

  const modifiedFormFields = transferFormFields.map(field => {
    if (field.name === 'ndcDocPath' && field.uploadConfig) {
      return {
        ...field,
        uploadConfig: {
          ...field.uploadConfig,
          entityId: id
        }
      }
    }
    return field
  })

  const canUpdate =
    user &&
    hasPermission(
      user.role as UserRole,
      [UserRole.ADMIN, UserRole.SUPER_ADMIN] as UserRole[]
    )

  if (!canUpdate) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to edit transfers.
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

  if (!transfer) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Transfer Not Found</CardTitle>
            <CardDescription>
              The transfer you're looking for doesn't exist.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/transfers')}>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Transfers
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Prepare default values
  const defaultValues: TransferFormData = {
    fileId:
      typeof transfer.fileId === 'object'
        ? transfer.fileId._id
        : transfer.fileId,
    transferTypeId:
      typeof transfer.transferTypeId === 'object'
        ? transfer.transferTypeId._id
        : transfer.transferTypeId,
    sellerMemId:
      typeof transfer.sellerMemId === 'object'
        ? transfer.sellerMemId._id
        : transfer.sellerMemId,
    buyerMemId:
      typeof transfer.buyerMemId === 'object'
        ? transfer.buyerMemId._id
        : transfer.buyerMemId,
    applicationId: transfer.applicationId
      ? typeof transfer.applicationId === 'object'
        ? transfer.applicationId._id
        : transfer.applicationId
      : undefined,
    transferInitDate: transfer.transferInitDate
      ? new Date(transfer.transferInitDate).toISOString().split('T')[0]
      : '',
    transferFeeAmount: transfer.transferFeeAmount,
    transferFeePaid: transfer.transferFeePaid,
    transferFeePaidDate: transfer.transferFeePaidDate
      ? new Date(transfer.transferFeePaidDate).toISOString().split('T')[0]
      : undefined,
    status: transfer.status,
    witness1Name: transfer.witness1Name || '',
    witness1CNIC: transfer.witness1CNIC || '',
    witness2Name: transfer.witness2Name || '',
    witness2CNIC: transfer.witness2CNIC || '',
    officerName: transfer.officerName || '',
    officerDesignation: transfer.officerDesignation || '',
    transfIsAtt: transfer.transfIsAtt,
    ndcDocPath: transfer.ndcDocPath || '',
    nomineeId: transfer.nomineeId
      ? typeof transfer.nomineeId === 'object'
        ? transfer.nomineeId._id
        : transfer.nomineeId
      : undefined,
    remarks: transfer.remarks || '',
    legalReviewNotes: transfer.legalReviewNotes || '',
    cancellationReason: transfer.cancellationReason || '',
    isActive: transfer.isActive
  }

  const handleSubmit = async (data: TransferFormData) => {
    try {
      const updateData: UpdateTransferDto = {
        ...data,
        transferFeeAmount: data.transferFeeAmount || undefined,
        transferFeePaidDate: data.transferFeePaidDate || undefined
      }

      await updateMutation.mutateAsync({ id, data: updateData })
      customToast.success('Transfer updated successfully')
      router.push('/transfers')
    } catch (error: any) {
      customToast.error(error.response?.data?.message || 'Failed to update transfer')
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className='p-6 space-y-6'>
      <div>
        <Button variant='ghost' onClick={() => router.back()} className='mb-4'>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back to Transfer
        </Button>

        <h1 className='text-3xl font-bold'>Edit Transfer</h1>
        <p className='text-gray-500 mt-2'>Update transfer information</p>
      </div>

      <Card>
        <CardContent className='pt-6'>
          <EntityForm
            schema={transferSchema}
            fields={modifiedFormFields}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel='Update Transfer'
            cancelLabel='Cancel'
            isLoading={updateMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  )
}
