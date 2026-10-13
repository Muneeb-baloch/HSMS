"use client";

import { ContractForm } from "@/components/vendor/ContractForm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { hasPermission, UserRole } from "@/lib/constants/roles";
import {
  useVendorContract,
  useUpdateVendorContract,
} from "@/lib/hooks/entities/useVendor";
import { useAuth } from "@/lib/hooks/useAuth";
import { UpdateContractDto } from "@/lib/types/vendor";
import { customToast } from "@/lib/utils/customToast";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { FormPageSkeleton } from '@/components/shared/PageSkeleton'

export default function EditContractPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const updateMutation = useUpdateVendorContract();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const id = params.id as string;

  const { data: contract, isLoading, error } = useVendorContract(id);

  const canUpdate =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN]);

  const handleSubmit = async (data: UpdateContractDto) => {
    try {
      setIsSubmitting(true);
      await updateMutation.mutateAsync({ id, data: data as UpdateContractDto });
      router.push("/vendor-contracts");
    } catch {
      customToast.error("Failed to update contract");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => router.back();

  if (!canUpdate) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to edit contracts.
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
    return <FormPageSkeleton />
  }

  if (error || !contract) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Failed to load contract.</CardDescription>
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

  const defaultValues = {
    vendorId:
      typeof contract.vendorId === "object"
        ? (contract.vendorId as { _id: string })._id
        : contract.vendorId,
    societyId:
      typeof contract.societyId === "object"
        ? (contract.societyId as { _id: string })._id
        : contract.societyId,
    workOrderId:
      contract.workOrderId
        ? typeof contract.workOrderId === "object"
          ? (contract.workOrderId as { _id: string })._id
          : contract.workOrderId
        : "",
    contractName: contract.contractName,
    description: contract.description || "",
    scope: contract.scope || "",
    startDate: contract.startDate,
    endDate: contract.endDate,
    amount: contract.amount,
    paymentFrequency: contract.paymentFrequency,
    autoRenew: contract.autoRenew,
  };

  return (
    <div className="p-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Contracts
      </Button>
      <h1 className="text-3xl font-bold">Edit Contract</h1>
      <p className="text-gray-500 mt-2">Update contract details</p>
      <div className="mt-6 max-w-4xl">
        <ContractForm
          mode="edit"
          defaultValues={{ ...defaultValues, _id: contract._id }}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isSubmitting}
        />
      </div>
    </div>
  );
}
