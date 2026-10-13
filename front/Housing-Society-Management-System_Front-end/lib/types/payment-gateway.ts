// lib/types/payment-gateway.ts

export interface PaymentTransaction {
  _id: string;
  transactionId: string;
  societyId: string;
  memberId: string;
  billId?: string;
  installmentId?: string;
  amount: number;
  currency: string;
  gateway:
    | "jazzcash"
    | "easypaisa"
    | "bank_transfer"
    | "stripe"
    | "manual";
  gatewayTransactionId?: string;
  status:
    | "pending"
    | "processing"
    | "completed"
    | "failed"
    | "refunded"
    | "cancelled";
  payerName?: string;
  payerPhone?: string;
  payerEmail?: string;
  paymentMethod?: string;
  description?: string;
  failureReason?: string;
  refundAmount?: number;
  refundDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InitiatePaymentDto {
  societyId: string;
  memberId: string;
  billId?: string;
  installmentId?: string;
  amount: number;
  gateway: string;
  payerName?: string;
  payerPhone?: string;
  payerEmail?: string;
  description?: string;
  callbackUrl?: string;
  returnUrl?: string;
}

export interface PaymentQueryParams {
  page?: number;
  limit?: number;
  societyId?: string;
  memberId?: string;
  status?: string;
  gateway?: string;
  fromDate?: string;
  toDate?: string;
}

export interface PaymentStats {
  totalCollected: number;
  totalPending: number;
  totalFailed: number;
  byGateway: Record<string, number>;
}
