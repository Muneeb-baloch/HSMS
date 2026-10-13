"use client";

import { VendorForm } from "@/components/vendor/VendorForm";
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
  useVendor,
  useUpdateVendor,
} from "@/lib/hooks/entities/useVendor";
import { useAuth } from "@/lib/hooks/useAuth";
import { UpdateVendorDto } from "@/lib/types/vendor";
import { customToast } from "@/lib/utils/customToast";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { FormPageSkeleton } from '@/components/shared/PageSkeleton'

export default function EditVendorPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const updateMutation = useUpdateVendor();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const id = params.id as string;

  const { data: vendor, isLoading, error } = useVendor(id);

  const canUpdate =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN]);

  const handleSubmit = async (data: UpdateVendorDto) => {
    try {
      setIsSubmitting(true);
      await updateMutation.mutateAsync({ id, data: data as UpdateVendorDto });
      router.push("/vendors");
    } catch {
      customToast.error("Failed to update vendor");
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
              You don&apos;t have permission to edit vendors.
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

  if (error || !vendor) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Failed to load vendor.</CardDescription>
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
    vendorName: vendor.vendorName,
    companyName: vendor.companyName || "",
    email: vendor.email,
    phone: vendor.phone,
    address: vendor.address || "",
    vendorType: vendor.vendorType,
    registrationNumber: vendor.registrationNumber || "",
    taxId: vendor.taxId || "",
  };

  return (
    <div className="p-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Vendors
      </Button>
      <h1 className="text-3xl font-bold">Edit Vendor</h1>
      <p className="text-gray-500 mt-2">Update vendor information</p>
      <div className="mt-6 max-w-4xl">
        <VendorForm
          mode="edit"
          defaultValues={{ ...defaultValues, _id: vendor._id }}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isSubmitting}
        />
      </div>
    </div>
  );
}
