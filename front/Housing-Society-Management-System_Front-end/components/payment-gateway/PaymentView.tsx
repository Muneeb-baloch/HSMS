"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { hasPermission, UserRole } from "@/lib/constants/roles";
import { useRefundTransaction } from "@/lib/hooks/entities/usePaymentGateway";
import { useAuth } from "@/lib/hooks/useAuth";
import { formatCurrency, formatDateTime } from "@/lib/utils/format";
import { customToast } from "@/lib/utils/customToast";
import { CreditCard, RotateCcw } from "lucide-react";
import { useState } from "react";
import { useConfirm } from "@/components/shared/ConfirmDialog";

interface Transaction {
  _id: string;
  transactionId?: string;
  memberId?: string | { _id: string; memName?: string; memEmail?: string; memPhone?: string };
  memberName?: string;
  amount: number;
  gateway: string;
  status: string;
  payerName?: string;
  payerEmail?: string;
  payerPhone?: string;
  gatewayTransactionId?: string;
  gatewayResponse?: string;
  refundReason?: string;
  refundedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

interface PaymentViewProps {
  transaction: Transaction;
}

const statusColors: Record<string, string> = {
  completed: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-blue-100 text-blue-800",
  processing: "bg-orange-100 text-orange-800",
};

const gatewayColors: Record<string, string> = {
  jazzcash: "bg-red-100 text-red-800",
  easypaisa: "bg-green-100 text-green-800",
  stripe: "bg-purple-100 text-purple-800",
  bank_transfer: "bg-blue-100 text-blue-800",
  cash: "bg-gray-100 text-gray-800",
};

export function PaymentView({ transaction }: PaymentViewProps) {
  const { user } = useAuth();
  const refundMutation = useRefundTransaction();
  const [isRefunding, setIsRefunding] = useState(false);
  const { confirm } = useConfirm();

  const canRefund =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN]) &&
    transaction.status === "completed";

  const member =
    typeof transaction.memberId === "object" ? transaction.memberId : null;

  const handleRefund = async () => {
    if (!await confirm({ title: "Refund", description: "Are you sure you want to refund this transaction? This action cannot be undone." })) {
      return;
    }
    try {
      setIsRefunding(true);
      await refundMutation.mutateAsync({
        id: transaction._id,
        data: { reason: "Admin initiated refund" },
      });
      customToast.success("Transaction refunded successfully");
    } catch {
      customToast.error("Failed to refund transaction");
    } finally {
      setIsRefunding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Transaction Details</h1>
          <p className="text-gray-500 mt-1">
            <span className="font-mono">
              {transaction.transactionId || transaction._id}
            </span>
          </p>
        </div>
        {canRefund && (
          <Button
            variant="destructive"
            onClick={handleRefund}
            disabled={isRefunding}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            {isRefunding ? "Processing..." : "Refund"}
          </Button>
        )}
      </div>

      <Card>
        <CardHeader icon={CreditCard}>
          <CardTitle>Payment Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Transaction ID</p>
              <p className="font-mono font-medium">
                {transaction.transactionId || transaction._id}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Gateway</p>
              <Badge
                className={
                  gatewayColors[transaction.gateway] ||
                  "bg-gray-100 text-gray-800"
                }
              >
                {transaction.gateway?.replace("_", " ").toUpperCase() || "N/A"}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500">Amount</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(transaction.amount)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <Badge
                className={
                  statusColors[transaction.status] ||
                  "bg-gray-100 text-gray-800"
                }
              >
                {transaction.status?.charAt(0).toUpperCase() +
                  transaction.status?.slice(1) || "N/A"}
              </Badge>
            </div>
            {transaction.gatewayTransactionId && (
              <div>
                <p className="text-sm text-gray-500">Gateway Transaction ID</p>
                <p className="font-mono font-medium">
                  {transaction.gatewayTransactionId}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">
                {member?.memName || transaction.payerName || "---"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">
                {member?.memEmail || transaction.payerEmail || "---"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">
                {member?.memPhone || transaction.payerPhone || "---"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Created At</p>
              <p className="font-medium">{formatDateTime(transaction.createdAt)}</p>
            </div>
            {transaction.updatedAt && (
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="font-medium">
                  {formatDateTime(transaction.updatedAt)}
                </p>
              </div>
            )}
            {transaction.refundedAt && (
              <div>
                <p className="text-sm text-gray-500">Refunded At</p>
                <p className="font-medium">
                  {formatDateTime(transaction.refundedAt)}
                </p>
              </div>
            )}
            {transaction.refundReason && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">Refund Reason</p>
                <p className="font-medium">{transaction.refundReason}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
