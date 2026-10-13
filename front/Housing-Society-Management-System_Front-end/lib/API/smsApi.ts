// lib/API/smsApi.ts
import { apiClient } from "@/lib/API/client";
import { PaginatedResponse } from "@/lib/types/api";
import {
  SMSLog,
  SendSMSDto,
  BulkSMSDto,
  SMSQueryParams,
  SMSStats,
} from "@/lib/types/sms";

const BASE = "/sms";

export const smsApi = {
  sendSMS: (data: SendSMSDto) =>
    apiClient.post<SMSLog>(`${BASE}/send`, data),

  sendBulkSMS: (data: BulkSMSDto) =>
    apiClient.post<{ sent: number; failed: number }>(`${BASE}/send-bulk`, data),

  getSMSLogs: (params: SMSQueryParams = {}) => {
    const queryParams: Record<string, unknown> = {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    };
    if (params.societyId) queryParams.societyId = params.societyId;
    if (params.messageType) queryParams.messageType = params.messageType;
    if (params.status) queryParams.status = params.status;
    if (params.fromDate) queryParams.fromDate = params.fromDate;
    if (params.toDate) queryParams.toDate = params.toDate;

    return apiClient.get<{
      items: SMSLog[];
      pagination: PaginatedResponse<SMSLog>["pagination"];
    }>(`${BASE}/logs`, { params: queryParams });
  },

  getSMSStats: (societyId: string) =>
    apiClient.get<SMSStats>(`${BASE}/stats/${societyId}`),
};
