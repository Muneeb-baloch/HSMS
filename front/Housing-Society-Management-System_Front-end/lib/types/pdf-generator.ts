// lib/types/pdf-generator.ts

export interface ReceiptData {
  societyName: string;
  receiptNumber: string;
  memberName: string;
  plotNumber: string;
  amount: number;
  date: string;
  paymentMode: string;
  description?: string;
}

export interface InvoiceData {
  societyName: string;
  invoiceNumber: string;
  memberName: string;
  plotNumber: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  subtotal: number;
  tax: number;
  total: number;
  dueDate: string;
  issueDate: string;
}

export interface TemplateInfo {
  name: string;
  description: string;
  fields: string[];
}
