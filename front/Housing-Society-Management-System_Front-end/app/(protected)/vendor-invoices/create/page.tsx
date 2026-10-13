"use client";

import { InvoiceForm } from "@/components/vendor/InvoiceForm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSubmitInvoice } from "@/lib/hooks/entities/useVendor";
import { CreateInvoiceDto } from "@/lib/types/vendor";
import { customToast } from "@/lib/utils/customToast";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateInvoicePage() {
  const router = useRouter();
  const createMutation = useSubmitInvoice();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CreateInvoiceDto) => {
    try {
      setIsSubmitting(true);
      await createMutation.mutateAsync(data);
      router.push("/vendor-invoices");
    } catch {
      customToast.error("Failed to submit invoice");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => router.back();

  return (
    <div className="p-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Invoices
      </Button>
      <h1 className="text-3xl font-bold">Submit Invoice</h1>
      <p className="text-gray-500 mt-2">Submit a new vendor invoice</p>
      <div className="mt-6 max-w-4xl">
        <InvoiceForm
          mode="create"
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isSubmitting}
        />
      </div>
    </div>
  );
}
