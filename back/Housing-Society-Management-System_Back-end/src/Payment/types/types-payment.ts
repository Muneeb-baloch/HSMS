export interface PaymentType {
  _id: string;
  receiptNo: string;
  fileId: any;
  paidByMemId: any;
  targetType: string;
  targetId: string;
  amount: number;
  paymentDate: Date;
  paymentMode: string;
  transactionRefNo?: string;
  receivedBy: any;
  remarks?: string;
  reversed: boolean;
  migrated: boolean;
  societyId: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReceiptParams {
  fileId: string | import('mongoose').Types.ObjectId;
  paidByMemId: string | import('mongoose').Types.ObjectId;
  targetType: 'installment' | 'bill';
  targetId: string | import('mongoose').Types.ObjectId;
  amount: number;
  paymentDate: Date | string;
  paymentMode: string;
  transactionRefNo?: string;
  receivedBy: import('mongoose').Types.ObjectId;
  remarks?: string;
  societyId: string | import('mongoose').Types.ObjectId;
}

export interface PaymentQueryParams {
  page?: number;
  limit?: number;
  fileId?: string;
  targetType?: 'installment' | 'bill';
  targetId?: string;
}
