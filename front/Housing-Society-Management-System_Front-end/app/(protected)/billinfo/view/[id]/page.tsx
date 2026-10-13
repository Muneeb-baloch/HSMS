"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBill } from "@/lib/hooks/entities/useBillInfo";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { DetailPageSkeleton } from '@/components/shared/PageSkeleton'

const statusColors: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  Paid: "bg-green-100 text-green-800",
  "Partially Paid": "bg-blue-100 text-blue-800",
  Overdue: "bg-red-100 text-red-800",
  Cancelled: "bg-gray-100 text-gray-800",
  Disputed: "bg-orange-100 text-orange-800",
};

export default function ViewBillPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { data: bill, isLoading } = useBill(id);

  const canEdit =
    bill &&
    bill.status !== "Paid" &&
    bill.status !== "Cancelled";

  if (isLoading || !bill) {
    return <DetailPageSkeleton />
  }

  const member =
    typeof bill.memId === "object"
      ? (bill.memId as { memName?: string; fullName?: string }).memName ||
        (bill.memId as { fullName?: string }).fullName ||
        "—"
      : "—";
  const file =
    typeof bill.fileId === "object"
      ? (bill.fileId as { fileRegNo?: string; fileNo?: string }).fileRegNo ||
        (bill.fileId as { fileNo?: string }).fileNo ||
        "—"
      : "—";

  return (
    <div className="p-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Bills
      </Button>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">Bill {bill.billNo}</h1>
          <p className="text-muted-foreground mt-1">
            {bill.billType?.billTypeName ?? "—"} • {bill.billMonth}
          </p>
        </div>
        <Badge className={statusColors[bill.status] || "bg-gray-100"}>
          {bill.status}
        </Badge>
      </div>

      <div className="grid gap-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Member</p>
              <p className="font-medium">{member}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">File</p>
              <p className="font-medium">{file}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bill Amount</p>
              <p className="font-medium">{formatCurrency(bill.billAmount)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Payable</p>
              <p className="font-medium">{formatCurrency(bill.totalPayable ?? bill.billAmount)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Paid Amount</p>
              <p className="font-medium text-green-600">
                {formatCurrency(bill.totalPaid ?? 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p className="font-medium text-amber-600">
                {formatCurrency(
                  bill.remainingBalance ??
                    (bill.totalPayable || 0) - (bill.totalPaid || 0)
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Due Date</p>
              <p className="font-medium">{formatDate(bill.dueDate)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Payment Date</p>
              <p className="font-medium">
                {bill.paymentDate ? formatDate(bill.paymentDate) : "—"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Payment Method</p>
              <p className="font-medium">{bill.paymentMethod || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="font-medium">{formatDate(bill.createdAt)}</p>
            </div>
          </CardContent>
        </Card>

        {bill.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{bill.notes}</p>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-2">
          {canEdit && (
            <Button onClick={() => router.push(`/billinfo/edit/${id}`)}>
              Edit Bill
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
