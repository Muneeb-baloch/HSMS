"use client";

import { PaymentView } from "@/components/payment-gateway/PaymentView";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePaymentTransaction } from "@/lib/hooks/entities/usePaymentGateway";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { DetailPageSkeleton } from '@/components/shared/PageSkeleton'

export default function ViewPaymentPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { data: transaction, isLoading, error } = usePaymentTransaction(id);

  if (isLoading) {
    return <DetailPageSkeleton />
  }

  if (error || !transaction) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Transaction not found.</p>
            <Button onClick={() => router.back()} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Transactions
      </Button>
      <PaymentView transaction={transaction} />
    </div>
  );
}
