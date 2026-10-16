export interface Payment {
  _id: string;
  id?: string;
  receiptNo: string;
  fileId: string | { _id: string; fileRegNo: string };
  paidByMemId: string | { _id: string; memName: string; memNic?: string };
  targetType: "installment" | "bill";
  targetId: string;
  amount: number;
  paymentDate: string;
  paymentMode: string;
  transactionRefNo?: string;
  receivedBy:
    | string
    | { _id: string; firstName?: string; lastName?: string; fullName?: string };
  remarks?: string;
  reversed: boolean;
  migrated: boolean;
  societyId: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReceiptDetail extends Payment {
  file: { fileRegNo: string } | null;
  member: { memName: string; memNic?: string } | null;
  plot: { plotNo: string } | null;
  society: {
    societyName: string;
    address?: string;
    contactPhone?: string;
    contactEmail?: string;
  } | null;
  targetDescription: string;
  amountInWords: string;
}
