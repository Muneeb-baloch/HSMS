// lib/API/paymentGatewayApi.ts
import { apiClient } from "@/lib/API/client";
import { PaginatedResponse } from "@/lib/types/api";
import {
  PaymentTransaction,
  InitiatePaymentDto,
  PaymentQueryParams,
  PaymentStats,
} from "@/lib/types/payment-gateway";

const BASE = "/payment-gateway";

export const paymentGatewayApi = {
  initiatePayment: (data: InitiatePaymentDto) =>
    apiClient.post<PaymentTransaction>(`${BASE}/initiate`, data),

  verifyTransaction: (transactionId: string) =>
    apiClient.get<PaymentTransaction>(`${BASE}/verify/${transactionId}`),

  getTransactions: (params: PaymentQueryParams = {}) => {
    const queryParams: Record<string, unknown> = {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    };
    if (params.societyId) queryParams.societyId = params.societyId;
    if (params.memberId) queryParams.memberId = params.memberId;
    if (params.status) queryParams.status = params.status;
    if (params.gateway) queryParams.gateway = params.gateway;
    if (params.fromDate) queryParams.fromDate = params.fromDate;
    if (params.toDate) queryParams.toDate = params.toDate;

    return apiClient.get<{
      items: PaymentTransaction[];
      pagination: PaginatedResponse<PaymentTransaction>["pagination"];
    }>(BASE, { params: queryParams });
  },

  getTransactionById: (id: string) =>
    apiClient.get<PaymentTransaction>(`${BASE}/${id}`),

  refundTransaction: (id: string, amount: number) =>
    apiClient.post<PaymentTransaction>(`${BASE}/${id}/refund`, { amount }),

  getPaymentStats: (societyId: string) =>
    apiClient.get<PaymentStats>(`${BASE}/stats/${societyId}`),
};
