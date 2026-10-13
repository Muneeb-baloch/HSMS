"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBillType } from "@/lib/hooks/entities/useBillType";
import { formatDate } from "@/lib/utils/format";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { DetailPageSkeleton } from '@/components/shared/PageSkeleton'

export default function ViewBillTypePage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { data: billType, isLoading } = useBillType(id);

  if (isLoading || !billType) {
    return <DetailPageSkeleton />
  }

  return (
    <div className="p-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Bill Types
      </Button>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">{billType.billTypeName}</h1>
          <p className="text-muted-foreground mt-1">
            {billType.billTypeCategory}
          </p>
        </div>
        <Badge
          className={
            billType.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }
        >
          {billType.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Category</p>
            <p className="font-medium">{billType.billTypeCategory}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Amount</p>
            <p className="font-medium">
              {billType.defaultAmount != null
                ? `Rs ${billType.defaultAmount.toLocaleString()}`
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Calculation Type</p>
            <p className="font-medium">{billType.calculationMethod || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Recurring</p>
            <p className="font-medium">{billType.isRecurring ? "Yes" : "No"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Created</p>
            <p className="font-medium">{formatDate(billType.createdAt)}</p>
          </div>
        </CardContent>
      </Card>

      {billType.description && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{billType.description}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
