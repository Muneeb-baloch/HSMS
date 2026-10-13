// lib/types/sms.ts

export interface SMSLog {
  _id: string;
  recipient: string;
  message: string;
  messageType:
    | "otp"
    | "payment_reminder"
    | "visitor_alert"
    | "announcement"
    | "emergency"
    | "custom";
  provider: string;
  providerMessageId?: string;
  status: "queued" | "sent" | "delivered" | "failed" | "rejected";
  errorMessage?: string;
  cost?: number;
  societyId?: string;
  sentAt?: string;
  deliveredAt?: string;
  createdAt: string;
}

export interface SendSMSDto {
  recipient: string;
  message: string;
  messageType: string;
  societyId?: string;
}

export interface BulkSMSDto {
  recipients: string[];
  message: string;
  messageType: string;
  societyId?: string;
}

export interface SMSQueryParams {
  page?: number;
  limit?: number;
  societyId?: string;
  messageType?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
}

export interface SMSStats {
  totalSent: number;
  delivered: number;
  failed: number;
  byType: Record<string, number>;
}
