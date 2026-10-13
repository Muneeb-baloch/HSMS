'use client'

import { EntityForm, FieldConfig } from '@/components/shared/EntityForm/EntityForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import { useExecuteTransfer, useTransferById } from '@/lib/hooks/entities/useTransfer'
import { useAuth } from '@/lib/hooks/useAuth'
import { executeTransferSchema, ExecuteTransferFormData } from '@/lib/schemas/transfer.schema'
import { ExecuteTransferDto } from '@/lib/types/transfer.types'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { customToast } from "@/lib/utils/customToast"
import { DetailPageSkeleton } from '@/components/shared/PageSkeleton'

const executeTransferFields: FieldConfig<ExecuteTransferFormData>[] = [
  {
    name: 'executionDate',
    label: 'Execution Date',
    type: 'date',
    required: true,
  },
  {
    name: 'witness1Name',
    label: 'Primary Witness Name',
    type: 'text',
    required: true,
    placeholder: 'Enter witness name',
  },
  {
    name: 'witness1CNIC',
    label: 'Primary Witness CNIC',
    type: 'text',
    required: true,
    placeholder: 'XXXXX-XXXXXXX-X',
  },
  {
    name: 'witness2Name',
    label: 'Secondary Witness Name (Optional)',
    type: 'text',
    required: false,
    placeholder: 'Enter witness name',
  },
  {
    name: 'witness2CNIC',
    label: 'Secondary Witness CNIC (Optional)',
    type: 'text',
    required: false,
    placeholder: 'XXXXX-XXXXXXX-X',
  },
  {
    name: 'officerName',
    label: 'Officer Name',
    type: 'text',
    required: true,
    placeholder: 'Enter officer name',
  },
  {
    name: 'officerDesignation',
    label: 'Officer Designation',
    type: 'text',
    required: true,
    placeholder: 'Enter officer designation',
  },
  {
    name: 'remarks',
    label: 'Execution Remarks',
    type: 'textarea',
    required: false,
    placeholder: 'Enter any remarks about the execution',
  },
];

export default function ExecuteTransferPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();

  const id = params.id as string;
  const { data: transfer, isLoading } = useTransferById(id);
  const executeMutation = useExecuteTransfer();

  const canUpdate = user &&
    hasPermission(
      user.role as UserRole,
      [UserRole.ADMIN, UserRole.SUPER_ADMIN] as UserRole[]
    );

  if (!canUpdate) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to execute transfers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return <DetailPageSkeleton />
  }

  if (!transfer) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Transfer Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/transfers')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Transfers
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Validate if transfer can be executed
  if (transfer.status !== 'Approved') {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Transfer Not Ready</CardTitle>
            <CardDescription>
              Only approved transfers can be executed. Current status: {transfer.status}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!transfer.transferFeePaid) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Fee Not Paid</CardTitle>
            <CardDescription>
              Transfer fee must be paid before execution.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push(`/transfers/fee-payment/${id}`)}>
              Record Fee Payment
            </Button>
            <Button variant="outline" onClick={() => router.back()} className="ml-2">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const defaultValues: ExecuteTransferFormData = {
    executionDate: new Date().toISOString().split('T')[0],
    witness1Name: transfer.witness1Name || '',
    witness1CNIC: transfer.witness1CNIC || '',
    witness2Name: transfer.witness2Name || '',
    witness2CNIC: transfer.witness2CNIC || '',
    officerName: transfer.officerName || '',
    officerDesignation: transfer.officerDesignation || '',
    remarks: transfer.remarks || '',
  };

  const handleSubmit = async (data: ExecuteTransferFormData) => {
    try {
      const executeData: ExecuteTransferDto = {
        ...data,
        executionDate: new Date(data.executionDate).toISOString(),
      };

      await executeMutation.mutateAsync({ id, data: executeData });
      customToast.success('Transfer executed successfully');
      router.push(`/transfers/view/${id}`);
    } catch (error: any) {
      customToast.error(error.response?.data?.message || 'Failed to execute transfer');
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const seller = typeof transfer.sellerMemId === 'object' ? transfer.sellerMemId : null;
  const buyer = typeof transfer.buyerMemId === 'object' ? transfer.buyerMemId : null;

  return (
    <div className="p-6 space-y-6">
      <div>
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Transfer
        </Button>

        <h1 className="text-3xl font-bold">Execute Transfer</h1>
        <p className="text-gray-500 mt-2">
          Finalize the transfer from {seller?.memName || 'Seller'} to {buyer?.memName || 'Buyer'}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <EntityForm
            schema={executeTransferSchema}
            fields={executeTransferFields}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel="Execute Transfer"
            cancelLabel="Cancel"
            isLoading={executeMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
