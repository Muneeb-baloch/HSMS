// lib/API/pdfGeneratorApi.ts
import { apiClient } from "@/lib/API/client";
import {
  ReceiptData,
  InvoiceData,
  TemplateInfo,
} from "@/lib/types/pdf-generator";

const BASE = "/pdf";

export const pdfGeneratorApi = {
  generateReceipt: (data: ReceiptData) =>
    apiClient.post<Blob>(`${BASE}/receipt`, data, {
      responseType: "blob",
    }),

  generateInvoice: (data: InvoiceData) =>
    apiClient.post<Blob>(`${BASE}/invoice`, data, {
      responseType: "blob",
    }),

  generateCertificate: (data: Record<string, unknown>) =>
    apiClient.post<Blob>(`${BASE}/certificate`, data, {
      responseType: "blob",
    }),

  generateNOC: (data: Record<string, unknown>) =>
    apiClient.post<Blob>(`${BASE}/noc`, data, {
      responseType: "blob",
    }),

  generateAllotmentLetter: (data: Record<string, unknown>) =>
    apiClient.post<Blob>(`${BASE}/allotment-letter`, data, {
      responseType: "blob",
    }),

  generateMembershipForm: (data: Record<string, unknown>) =>
    apiClient.post(`${BASE}/membership-form`, data),

  generateTransferForm: (data: Record<string, unknown>) =>
    apiClient.post(`${BASE}/transfer-form`, data),

  generatePaymentReceipt: (data: Record<string, unknown>) =>
    apiClient.post(`${BASE}/payment-receipt`, data),

  generateInstallmentSchedule: (data: Record<string, unknown>) =>
    apiClient.post(`${BASE}/installment-schedule`, data),

  getTemplates: () =>
    apiClient.get<TemplateInfo[]>(`${BASE}/templates`),
};
