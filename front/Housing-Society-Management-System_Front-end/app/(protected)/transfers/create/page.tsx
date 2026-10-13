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
import { apiClient } from '@/lib/API/client'
import { UserRole, hasPermission } from '@/lib/constants/roles'
import { useCreateTransfer } from '@/lib/hooks/entities/useTransfer'
import { useAuth } from '@/lib/hooks/useAuth'
import { TransferFormData, transferSchema } from '@/lib/schemas/transfer.schema'
import { File } from '@/lib/types/file'
import { Nominee } from '@/lib/types/nominee'
import {
  CreateTransferDto,
  Transfer,
  TransferStatus
} from '@/lib/types/transfer.types'
import { EntityType } from '@/lib/types/upload.types'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { customToast } from "@/lib/utils/customToast"

const getMemberId = (v: unknown): string | undefined =>
  typeof v === 'string'
    ? v
    : v && typeof v === 'object' && '_id' in (v as object)
    ? String((v as { _id: string })._id)
    : undefined

const transferFormFields: FieldConfig<TransferFormData>[] = [
  // Seller Information
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
    onChange: (
      _value: unknown,
      form: ReturnType<typeof useForm<TransferFormData>>
    ) => {
      form.setValue('fileId', '')
    }
  },
  {
    name: 'fileId',
    label: 'File',
    type: 'relationship',
    required: true,
    showWhen: (values: TransferFormData) => !!values.sellerMemId,
    relationship: {
      endpoint: '/file',
      labelField: 'fileRegNo',
      valueField: '_id',
      searchable: true,
      queryParams: (values: TransferFormData) => {
        const sellerId = getMemberId(values.sellerMemId)
        return sellerId ? { memId: sellerId, limit: 50 } : {}
      }
    }
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
    }
  },

  // Buyer Information
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
    onChange: (
      value: unknown,
      form: ReturnType<typeof useForm<TransferFormData>>
    ) => {
      form.setValue('nomineeId', '')
    }
  },

  // Application (optional)
  {
    name: 'applicationId',
    label: 'Application',
    type: 'relationship',
    required: false,
    relationship: {
      endpoint: '/application',
      labelField: 'applicationNo',
      valueField: '_id',
      searchable: true
    }
  },

  // Transfer Details
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
    required: false,
    placeholder: 'Enter transfer fee amount'
  },

  // Witness Information
  {
    name: 'witness1Name',
    label: 'Witness 1 Name',
    type: 'text',
    required: false,
    placeholder: 'Enter witness name'
  },
  {
    name: 'witness1CNIC',
    label: 'Witness 1 CNIC',
    type: 'text',
    required: false,
    placeholder: 'XXXXX-XXXXXXX-X'
  },
  {
    name: 'witness2Name',
    label: 'Witness 2 Name',
    type: 'text',
    required: false,
    placeholder: 'Enter witness name'
  },
  {
    name: 'witness2CNIC',
    label: 'Witness 2 CNIC',
    type: 'text',
    required: false,
    placeholder: 'XXXXX-XXXXXXX-X'
  },

  // Attachments
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

  // Nominee (cascading: only nominees for selected buyer)
  {
    name: 'nomineeId',
    label: 'Nominee',
    type: 'relationship',
    required: false,
    showWhen: (values: TransferFormData) => !!getMemberId(values.buyerMemId),
    relationship: {
      endpoint: (values: TransferFormData) => {
        const memId = getMemberId(values.buyerMemId);
        return memId ? `/nominee/member/${memId}` : '/nominee?limit=0';
      },
      labelField: 'nomineeName',
      valueField: '_id',
      searchable: false
    }
  },

  // Remarks
  {
    name: 'remarks',
    label: 'Remarks',
    type: 'textarea',
    required: false,
    placeholder: 'Enter any remarks'
  }
]

export default function CreateTransferPage () {
  const router = useRouter()
  const { user } = useAuth()
  const createMutation = useCreateTransfer()

  const canCreate =
    user &&
    hasPermission(
      user.role as UserRole,
      [UserRole.ADMIN, UserRole.SUPER_ADMIN] as UserRole[]
    )

  if (!canCreate) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to create transfers.
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

  const getObjectId = (value: unknown): string | undefined => {
    if (typeof value === 'string') return value
    if (value && typeof value === 'object' && '_id' in value) {
      const id = (value as { _id?: unknown })._id
      return typeof id === 'string' ? id : undefined
    }
    return undefined
  }

  const getApiErrorMessage = (error: unknown): string | undefined => {
    if (!error || typeof error !== 'object') return undefined
    const response = (error as { response?: { data?: { message?: string } } })
      .response
    return response?.data?.message
  }

  const handleSubmit = async (data: TransferFormData) => {
    try {
      if (data.sellerMemId && data.fileId) {
        const fileResponse = await apiClient.get<File>(`/file/${data.fileId}`)
        const file = fileResponse.data.data
        if (file.memId !== data.sellerMemId) {
          customToast.error('Selected file does not belong to the seller')
          return
        }

        const transferResponse = await apiClient.get<Transfer[]>(
          `/transfer/file/${data.fileId}`
        )
        const transfers = transferResponse.data.data || []

        const hasPendingTransfer = transfers.some(transfer =>
          [
            TransferStatus.PENDING,
            TransferStatus.UNDER_REVIEW,
            TransferStatus.APPROVED
          ].includes(transfer.status)
        )
        if (hasPendingTransfer) {
          customToast.error('File already has a pending transfer')
          return
        }
      }

      if (data.buyerMemId && data.nomineeId) {
        const nomineeResponse = await apiClient.get<Nominee>(
          `/nominee/${data.nomineeId}`
        )
        const nominee = nomineeResponse.data.data
        const nomineeMemId = getObjectId(nominee.memId)
        if (nomineeMemId && nomineeMemId !== data.buyerMemId) {
          customToast.error('Selected nominee does not belong to the buyer')
          return
        }
      }

      const createData: CreateTransferDto = {
        ...data,
        transferFeeAmount: data.transferFeeAmount || undefined
      }

      await createMutation.mutateAsync(createData)
      customToast.success('Transfer created successfully')
      router.push('/transfers')
    } catch (error: unknown) {
      customToast.error(getApiErrorMessage(error) || 'Failed to create transfer')
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
          Back to Transfers
        </Button>

        <h1 className='text-3xl font-bold'>Create New Transfer</h1>
        <p className='text-gray-500 mt-2'>
          Create a new property transfer between members
        </p>
      </div>

      <Card>
        <CardContent className='pt-6'>
          <EntityForm
            schema={transferSchema}
            fields={transferFormFields}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel='Create Transfer'
            cancelLabel='Cancel'
            isLoading={createMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  )
}
