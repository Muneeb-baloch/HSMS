import { ClientSession, Document, Model, Schema, Types, model } from 'mongoose';

export enum PaymentTargetType {
  INSTALLMENT = 'installment',
  BILL = 'bill',
  TRANSFER = 'transfer',
}

export interface IPayment extends Document {
  receiptNo: string;
  fileId: Types.ObjectId;
  /** The file's member at the moment of payment - snapshotted, never changed afterwards. */
  paidByMemId: Types.ObjectId;
  targetType: string;
  targetId: Types.ObjectId;
  amount: number;
  paymentDate: Date;
  paymentMode: string;
  transactionRefNo?: string;
  receivedBy: Types.ObjectId;
  remarks?: string;
  reversed: boolean;
  /** True for receipts created by the one-time backfill, not a live recordPayment call. */
  migrated: boolean;
  societyId: Types.ObjectId;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    receiptNo: {
      type: String,
      required: [true, 'Receipt number is required'],
      unique: true,
      trim: true,
      index: true,
    },
    fileId: {
      type: Schema.Types.ObjectId,
      ref: 'File',
      required: [true, 'File is required'],
      index: true,
    },
    paidByMemId: {
      type: Schema.Types.ObjectId,
      ref: 'Member',
      required: [true, 'Paying member is required'],
    },
    targetType: {
      type: String,
      enum: {
        values: Object.values(PaymentTargetType),
        message: '{VALUE} is not a valid payment target type',
      },
      required: [true, 'Target type is required'],
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: [true, 'Target ID is required'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    paymentDate: {
      type: Date,
      required: [true, 'Payment date is required'],
    },
    paymentMode: {
      type: String,
      required: [true, 'Payment mode is required'],
      trim: true,
    },
    transactionRefNo: {
      type: String,
      trim: true,
      maxlength: [100, 'Transaction reference cannot exceed 100 characters'],
    },
    receivedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Received-by user is required'],
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [1000, 'Remarks cannot exceed 1000 characters'],
    },
    reversed: {
      type: Boolean,
      default: false,
      index: true,
    },
    migrated: {
      type: Boolean,
      default: false,
    },
    societyId: {
      type: Schema.Types.ObjectId,
      ref: 'Society',
      required: [true, 'Society ID is required for tenant isolation'],
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ fileId: 1, isDeleted: 1, paymentDate: -1 });
paymentSchema.index({ targetType: 1, targetId: 1, isDeleted: 1 });

const Payment: Model<IPayment> = model<IPayment>('Payment', paymentSchema);

export default Payment;

// ---------------------------------------------------------------------------
// Atomic, sequential receipt numbering: RCP-YYYY-NNNNN, reset per calendar
// year. findOneAndUpdate's $inc is a single-document atomic operation, so
// concurrent recordPayment calls can never be issued the same number - and
// passing the transaction's session ties the increment to that transaction,
// so a rolled-back payment doesn't burn a number (no gaps from failures).
// ---------------------------------------------------------------------------

interface IReceiptCounter extends Omit<Document, '_id'> {
  _id: string; // the year, e.g. "2026"
  seq: number;
}

const receiptCounterSchema = new Schema<IReceiptCounter>({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const ReceiptCounter: Model<IReceiptCounter> = model<IReceiptCounter>(
  'ReceiptCounter',
  receiptCounterSchema
);

export async function generateReceiptNo(session?: ClientSession): Promise<string> {
  const year = new Date().getFullYear();
  const key = String(year);

  const counter = await ReceiptCounter.findOneAndUpdate(
    { _id: key },
    { $inc: { seq: 1 } },
    { upsert: true, new: true, session }
  );

  const seq = String(counter.seq).padStart(5, '0');
  return `RCP-${year}-${seq}`;
}
