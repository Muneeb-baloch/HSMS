"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { hasPermission, UserRole } from "@/lib/constants/roles";
import {
  useVendorInvoice,
  useApproveInvoice,
  useRejectInvoice,
  useMarkInvoicePaid,
} from "@/lib/hooks/entities/useVendor";
import { useAuth } from "@/lib/hooks/useAuth";
import { customToast } from "@/lib/utils/customToast";
import { formatDate } from "@/lib/utils/format";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { DetailPageSkeleton } from '@/components/shared/PageSkeleton'
import { useConfirm } from "@/components/shared/ConfirmDialog";

const getStatusVariant = (
  status: string
): "default" | "secondary" | "destructive" | "success" | "warning" => {
  switch (status) {
    case "submitted":
      return "secondary";
    case "under-review":
      return "warning";
    case "approved":
      return "success";
    case "paid":
      return "default";
    case "rejected":
      return "destructive";
    case "disputed":
      return "destructive";
    default:
      return "secondary";
  }
};

export default function ViewInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const { confirm } = useConfirm();
  const id = params.id as string;
  const { data: invoice, isLoading, error } = useVendorInvoice(id);
  const approveMutation = useApproveInvoice();
  const rejectMutation = useRejectInvoice();
  const markPaidMutation = useMarkInvoicePaid();

  const canManage =
    user &&
    hasPermission(user.role as UserRole, [
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
    ]);

  const handleApprove = async () => {
    if (await confirm({ title: "Approve", description: "Are you sure you want to approve this invoice?" })) {
      try {
        await approveMutation.mutateAsync(id);
      } catch {
        customToast.error("Failed to approve invoice");
      }
    }
  };

  const handleReject = async () => {
    const reason = prompt("Enter rejection reason:");
    if (reason) {
      try {
        await rejectMutation.mutateAsync({ id, data: { reason } });
      } catch {
        customToast.error("Failed to reject invoice");
      }
    }
  };

  const handleMarkPaid = async () => {
    const paymentReference = prompt("Enter payment reference:");
    if (paymentReference) {
      try {
        await markPaidMutation.mutateAsync({ id, data: { paymentReference } });
      } catch {
        customToast.error("Failed to mark invoice as paid");
      }
    }
  };

  if (isLoading) {
    return <DetailPageSkeleton />
  }
              {invoice.rejectionReason && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">Rejection Reason</p>
                  <p className="font-medium text-red-600">
                    {invoice.rejectionReason}
                  </p>
                </div>
              )}
            </div>

            {invoice.description && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Description</p>
                <p className="whitespace-pre-wrap">{invoice.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card>
          <CardHeader>
            <CardTitle>Line Items</CardTitle>
          </CardHeader>
          <CardContent>
            {invoice.lineItems && invoice.lineItems.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 font-medium">
                        Description
                      </th>
                      <th className="text-right py-3 px-2 font-medium">Qty</th>
                      <th className="text-right py-3 px-2 font-medium">
                        Unit Price
                      </th>
                      <th className="text-right py-3 px-2 font-medium">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.lineItems.map((item, index) => (
                      <tr key={index} className="border-b last:border-0">
                        <td className="py-3 px-2">{item.description}</td>
                        <td className="py-3 px-2 text-right">
                          {item.quantity}
                        </td>
                        <td className="py-3 px-2 text-right">
                          ${item.unitPrice.toFixed(2)}
                        </td>
                        <td className="py-3 px-2 text-right font-medium">
                          ${item.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex flex-col items-end gap-2 pt-4 border-t mt-4">
                  <div className="flex items-center gap-8 text-sm">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-medium w-28 text-right">
                      ${invoice.amount?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                  <div className="flex items-center gap-8 text-sm">
                    <span className="text-muted-foreground">Tax:</span>
                    <span className="font-medium w-28 text-right">
                      ${invoice.taxAmount?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                  <div className="flex items-center gap-8 text-base font-bold">
                    <span>Total:</span>
                    <span className="w-28 text-right">
                      ${invoice.totalAmount?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-8 text-sm">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-medium">
                      ${invoice.amount?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                  <div className="flex items-center gap-8 text-sm">
                    <span className="text-muted-foreground">Tax:</span>
                    <span className="font-medium">
                      ${invoice.taxAmount?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                  <div className="flex items-center gap-8 text-base font-bold">
                    <span>Total:</span>
                    <span>
                      ${invoice.totalAmount?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Timestamps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p className="font-medium">{formatDate(invoice.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Updated At</p>
                <p className="font-medium">{formatDate(invoice.updatedAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
