import { Document, Model, Schema, Types, model } from 'mongoose';
import File from '../../File/models/models-file';

// @deprecated - use LookupValue collection (category: 'installment_status') instead
export enum InstallmentStatus {
  UNPAID = 'Unpaid',
  PARTIALLY_PAID = 'Partially Paid',
  PAID = 'Paid',
  OVERDUE = 'Overdue',
  CANCELLED = 'Cancelled',
  REFUNDED = 'Refunded',
}

// @deprecated - use LookupValue collection (category: 'installment_type') instead
export enum InstallmentType {
  MONTHLY = 'Monthly',
  QUARTERLY = 'Quarterly',
  HALF_YEARLY = 'Half-Yearly',
  YEARLY = 'Yearly',
  BALLOON = 'Balloon',
  DOWN_PAYMENT = 'Down Payment',
  POSSESSION_FEE = 'Possession Fee',
  BALLOTING_FEE = 'Balloting Fee',
  UTILITY_CHARGES = 'Utility Charges',
  DEVELOPMENT_CHARGES = 'Development Charges',
  LEGAL_FEE = 'Legal Fee',
  TRANSFER_FEE = 'Transfer Fee',
  APPLICATION_FEE = 'Application Fee',
  NOC_FEE = 'NOC Fee',
  REGISTRY_FEE = 'Registry Fee',
  OTHER = 'Other',
}

// @deprecated - use LookupValue collection (category: 'payment_mode') instead
export enum PaymentMode {
  CASH = 'Cash',
  BANK_TRANSFER = 'Bank Transfer',
  CHEQUE = 'Cheque',
  ONLINE_PAYMENT = 'Online Payment',
  CREDIT_CARD = 'Credit Card',
  DEBIT_CARD = 'Debit Card',
  MOBILE_WALLET = 'Mobile Wallet',
}

export interface IInstallment extends Document {
  // File is the only authoritative link — memId/plotId used to be duplicated
  // here and never cascaded on ownership transfer, so a sold file's old
  // installments silently kept pointing at the previous owner. Always read
  // member/plot through fileId -> File now (see populateFileMemberPlot below).
  fileId: Types.ObjectId;
  installmentCategoryId: Types.ObjectId;
  planId?: Types.ObjectId;
  installmentNo: number;
  installmentTitle: string;
  installmentType: string;
  dueDate: Date;
  amountDue: number;
  lateFeeSurcharge?: number;
  totalPayable: number;
  amountPaid: number;
  balanceAmount: number;
  paidDate?: Date;
  paymentMode?: string;
  transactionRefNo?: string;
  status: string;
  installmentRemarks?: string;
  societyId: Types.ObjectId;
  createdBy: Types.ObjectId;
  modifiedBy?: Types.ObjectId;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Virtual fields
  file?: any;
  // member/plot are no longer Mongoose virtuals (no local memId/plotId field
  // to populate against) — they're attached by populateFileMemberPlot() via
  // a nested populate through file, then flattened by flattenFileMemberPlot().
  member?: any;
  plot?: any;
  installmentCategory?: any;
  createdByUser?: any;
  modifiedByUser?: any;
  isOverdue?: boolean;
  daysOverdue?: number;
  paymentStatusColor?: string;
}

const installmentSchema = new Schema<IInstallment>(
  {
    fileId: {
      type: Schema.Types.ObjectId,
      ref: 'File',
      required: true,
      index: true,
    },
    installmentCategoryId: {
      type: Schema.Types.ObjectId,
      ref: 'InstallmentCategory',
      required: true,
      index: true,
    },
    planId: {
      type: Schema.Types.ObjectId,
      ref: 'InstallmentPlan',
      required: false,
      index: true,
    },
    installmentNo: {
      type: Number,
      required: [true, 'Installment number is required'],
      min: [1, 'Installment number must be at least 1'],
      index: true,
    },
    installmentTitle: {
      type: String,
      required: [true, 'Installment title is required'],
      trim: true,
      maxlength: [200, 'Installment title cannot exceed 200 characters'],
    },
    installmentType: {
      type: String,
      // Validated via LookupValue (category: 'installment_type')
      required: [true, 'Installment type is required'],
      trim: true,
      index: true,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
      index: true,
    },
    amountDue: {
      type: Number,
      required: [true, 'Amount due is required'],
      min: [0, 'Amount due cannot be negative'],
    },
    lateFeeSurcharge: {
      type: Number,
      min: [0, 'Late fee surcharge cannot be negative'],
      default: 0,
    },
    totalPayable: {
      type: Number,
      required: [true, 'Total payable is required'],
      min: [0, 'Total payable cannot be negative'],
    },
    amountPaid: {
      type: Number,
      default: 0,
      min: [0, 'Amount paid cannot be negative'],
    },
    balanceAmount: {
      type: Number,
      default: 0,
      min: [0, 'Balance amount cannot be negative'],
    },
    paidDate: {
      type: Date,
      index: true,
    },
    paymentMode: {
      type: String,
      // Validated via LookupValue (category: 'payment_mode')
      trim: true,
      index: true,
    },
    transactionRefNo: {
      type: String,
      trim: true,
      maxlength: [100, 'Transaction reference number cannot exceed 100 characters'],
      index: true,
    },
    status: {
      type: String,
      // Validated via LookupValue (category: 'installment_status')
      default: 'Unpaid',
      trim: true,
      index: true,
    },
    installmentRemarks: {
      type: String,
      trim: true,
      maxlength: [1000, 'Remarks cannot exceed 1000 characters'],
    },
    societyId: {
      type: Schema.Types.ObjectId,
      ref: 'Society',
      required: [true, 'Society ID is required for tenant isolation'],
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'UserStaff',
      required: true,
      index: true,
    },
    modifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'UserStaff',
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
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret: Record<string, any>) {
        const { __v, ...cleanRet } = ret;
        // Add id field for frontend compatibility
        if (ret._id) {
          ret.id = ret._id.toString();
          delete ret._id;
        }
        return cleanRet;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (_doc, ret: Record<string, any>) {
        const { __v, ...cleanRet } = ret;
        // Add id field for frontend compatibility
        if (ret._id) {
          ret.id = ret._id.toString();
          delete ret._id;
        }
        return cleanRet;
      },
    },
  }
);

// Compound indexes for efficient querying
installmentSchema.index({ fileId: 1, installmentNo: 1 });
installmentSchema.index({ status: 1, dueDate: 1 });
installmentSchema.index({ dueDate: 1, isDeleted: 1 });
installmentSchema.index({ installmentCategoryId: 1, status: 1 });
installmentSchema.index({ createdBy: 1, createdAt: -1 });

// Text index for search
installmentSchema.index(
  {
    installmentTitle: 'text',
    transactionRefNo: 'text',
    installmentRemarks: 'text',
  },
  {
    weights: {
      installmentTitle: 5,
      transactionRefNo: 4,
      installmentRemarks: 3,
    },
    name: 'installment_text_search',
  }
);

// Virtual for file
installmentSchema.virtual('file', {
  ref: 'File',
  localField: 'fileId',
  foreignField: '_id',
  justOne: true,
});

// member/plot are intentionally NOT virtual-populate fields anymore — there's
// no local memId/plotId to match against. Use populateFileMemberPlot() below
// (nested populate through file) plus flattenFileMemberPlot() on the plain
// object, so callers that read installment.member/installment.plot keep
// working without caring that the data now comes from File.

// Virtual for installment category
installmentSchema.virtual('installmentCategory', {
  ref: 'InstallmentCategory',
  localField: 'installmentCategoryId',
  foreignField: '_id',
  justOne: true,
});

// Virtual for installment plan
installmentSchema.virtual('plan', {
  ref: 'InstallmentPlan',
  localField: 'planId',
  foreignField: '_id',
  justOne: true,
});

// Virtual for created by user
installmentSchema.virtual('createdByUser', {
  ref: 'UserStaff',
  localField: 'createdBy',
  foreignField: '_id',
  justOne: true,
});

// Virtual for modified by user
installmentSchema.virtual('modifiedByUser', {
  ref: 'UserStaff',
  localField: 'modifiedBy',
  foreignField: '_id',
  justOne: true,
});

// Virtual to check if installment is overdue. "Overdue" = due strictly before
// the start of today; a row due *today* is NOT overdue (matches the dashboard
// Due-Today vs Total-Overdue bucketing and the list UI label).
installmentSchema.virtual('isOverdue').get(function () {
  if (this.status === InstallmentStatus.PAID || this.status === InstallmentStatus.CANCELLED) {
    return false;
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  return this.dueDate < startOfToday;
});

// Virtual for days overdue
installmentSchema.virtual('daysOverdue').get(function () {
  if (!this.isOverdue) {
    return 0;
  }

  const now = new Date();
  const dueDate = new Date(this.dueDate);
  const diffTime = Math.abs(now.getTime() - dueDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for payment status color
installmentSchema.virtual('paymentStatusColor').get(function () {
  const colors: Record<string, string> = {
    [InstallmentStatus.UNPAID]: 'warning',
    [InstallmentStatus.PARTIALLY_PAID]: 'info',
    [InstallmentStatus.PAID]: 'success',
    [InstallmentStatus.OVERDUE]: 'danger',
    [InstallmentStatus.CANCELLED]: 'secondary',
    [InstallmentStatus.REFUNDED]: 'light',
  };
  return colors[this.status] || 'secondary';
});

// Helper function to calculate late fee
const calculateLateFee = (amountDue: number, daysOverdue: number): number => {
  if (daysOverdue <= 0) return 0;

  // Late fee formula: 0.5% per day, capped at 25% of amount due
  const dailyRate = 0.005; // 0.5%
  const maxLateFee = amountDue * 0.25; // 25% cap
  const calculatedFee = amountDue * dailyRate * daysOverdue;

  return Math.min(calculatedFee, maxLateFee);
};

// Pre-save middleware
installmentSchema.pre('save', function (next) {
  const doc = this as any;

  // "Overdue" is measured from the start of today — a row due today is not yet
  // overdue (consistent with the isOverdue virtual and the dashboard buckets).
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  // Calculate total payable
  doc.totalPayable = doc.amountDue + (doc.lateFeeSurcharge || 0);

  // Calculate balance amount
  doc.balanceAmount = doc.totalPayable - doc.amountPaid;

  // Auto-update status based on payments
  if (doc.amountPaid === 0) {
    if (doc.dueDate < startOfToday && doc.status !== InstallmentStatus.CANCELLED) {
      doc.status = InstallmentStatus.OVERDUE;
    } else if (doc.status !== InstallmentStatus.CANCELLED) {
      doc.status = InstallmentStatus.UNPAID;
    }
  } else if (doc.amountPaid >= doc.totalPayable) {
    doc.status = InstallmentStatus.PAID;
    doc.balanceAmount = 0;
    if (!doc.paidDate) {
      doc.paidDate = new Date();
    }
  } else if (doc.amountPaid > 0) {
    doc.status = InstallmentStatus.PARTIALLY_PAID;
  }

  // Calculate late fee only once genuinely overdue (past start of today)
  if (
    doc.dueDate < startOfToday &&
    doc.status !== InstallmentStatus.PAID &&
    doc.status !== InstallmentStatus.CANCELLED
  ) {
    const now = new Date();
    const dueDate = new Date(doc.dueDate);
    const diffTime = Math.abs(now.getTime() - dueDate.getTime());
    const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    doc.lateFeeSurcharge = calculateLateFee(doc.amountDue, daysOverdue);
    doc.totalPayable = doc.amountDue + doc.lateFeeSurcharge;
    doc.balanceAmount = doc.totalPayable - doc.amountPaid;
  }

  next();
});

// Pre-update middleware
installmentSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() as any;

  if (update) {
    // If amount paid is being updated, recalculate balance and status
    if (update.amountPaid !== undefined) {
      const totalPayable = update.totalPayable || 0;
      const amountPaid = update.amountPaid;

      // Calculate balance
      update.balanceAmount = totalPayable - amountPaid;

      // Update status based on payment
      if (amountPaid === 0) {
        update.status = InstallmentStatus.UNPAID;
      } else if (amountPaid >= totalPayable) {
        update.status = InstallmentStatus.PAID;
        update.balanceAmount = 0;
        if (!update.paidDate) {
          update.paidDate = new Date();
        }
      } else if (amountPaid > 0) {
        update.status = InstallmentStatus.PARTIALLY_PAID;
      }
    }

    // Set paid date if status changes to PAID
    if (update.status === InstallmentStatus.PAID && !update.paidDate) {
      update.paidDate = new Date();
    }
  }

  next();
});

/**
 * Nests a member/plot populate under file instead of populating them
 * directly off the Installment document (there's no local memId/plotId to
 * match against anymore — fileId -> File is the only link). Chain onto any
 * query that also wants `.populate('installmentCategory', ...)` etc.
 */
function populateFileMemberPlot<T extends { populate: (...args: any[]) => any }>(
  query: T,
  opts: { fileSelect?: string; memberSelect?: string; plotSelect?: string } = {}
): T {
  // File.member / File.plot are virtuals keyed on File.memId / File.plotId, so
  // those foreign keys MUST be selected on the file or the nested virtuals
  // can't resolve (member/plot come back empty). Always include them.
  const fileSelect = `${opts.fileSelect ?? 'fileRegNo'} memId plotId`;
  return query.populate({
    path: 'file',
    select: fileSelect,
    populate: [
      { path: 'member', select: opts.memberSelect ?? 'memName memNic' },
      { path: 'plot', select: opts.plotSelect ?? 'plotNo plotSize' },
    ],
  });
}

/**
 * Flattens installment.file.member/installment.file.plot back onto
 * installment.member/installment.plot on a plain object, so existing
 * callers reading those two fields directly don't need to change.
 */
function flattenFileMemberPlot(plainObj: any): any {
  if (plainObj && plainObj.file) {
    if (plainObj.file.member !== undefined) plainObj.member = plainObj.file.member;
    if (plainObj.file.plot !== undefined) plainObj.plot = plainObj.file.plot;
  }
  return plainObj;
}

// Static methods
interface IInstallmentModel extends Model<IInstallment> {
  findByFile(fileId: string): Promise<IInstallment[]>;
  findByMember(memId: string): Promise<IInstallment[]>;
  findByPlot(plotId: string): Promise<IInstallment[]>;
  findOverdue(): Promise<IInstallment[]>;
  findDueToday(): Promise<IInstallment[]>;
  findNextDue(memId: string): Promise<IInstallment | null>;
}

// Find by file
installmentSchema.statics.findByFile = function (fileId: string) {
  return populateFileMemberPlot(
    this.find({
      fileId: new Types.ObjectId(fileId),
      isDeleted: false,
    }).populate('installmentCategory', 'instCatName instCatDescription')
  ).sort({ installmentNo: 1 });
};

// Find by member — resolve the member's File ids first (memId lives on File
// now, not here), then match installments by fileId.
installmentSchema.statics.findByMember = async function (memId: string) {
  const fileIds = await File.find({ memId: new Types.ObjectId(memId) }).distinct('_id');

  return populateFileMemberPlot(
    this.find({
      fileId: { $in: fileIds },
      isDeleted: false,
    }).populate('installmentCategory', 'instCatName instCatDescription'),
    { fileSelect: 'fileRegNo' }
  ).sort({ dueDate: 1 });
};

// Find by plot — same pattern as findByMember.
installmentSchema.statics.findByPlot = async function (plotId: string) {
  const fileIds = await File.find({ plotId: new Types.ObjectId(plotId) }).distinct('_id');

  return populateFileMemberPlot(
    this.find({
      fileId: { $in: fileIds },
      isDeleted: false,
    }).populate('installmentCategory', 'instCatName instCatDescription'),
    { fileSelect: 'fileRegNo', memberSelect: 'memName memNic' }
  ).sort({ dueDate: 1 });
};

// Find overdue installments
installmentSchema.statics.findOverdue = function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return populateFileMemberPlot(
    this.find({
      dueDate: { $lt: today },
      status: { $in: [InstallmentStatus.UNPAID, InstallmentStatus.PARTIALLY_PAID] },
      isDeleted: false,
    }).populate('installmentCategory', 'instCatName'),
    { fileSelect: 'fileRegNo', memberSelect: 'memName memNic mobileNo', plotSelect: 'plotNo' }
  ).sort({ dueDate: 1 });
};

// Find installments due today
installmentSchema.statics.findDueToday = function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return populateFileMemberPlot(
    this.find({
      dueDate: { $gte: today, $lt: tomorrow },
      status: { $in: [InstallmentStatus.UNPAID, InstallmentStatus.PARTIALLY_PAID] },
      isDeleted: false,
    }).populate('installmentCategory', 'instCatName'),
    { fileSelect: 'fileRegNo', memberSelect: 'memName memNic mobileNo', plotSelect: 'plotNo' }
  ).sort({ dueDate: 1 });
};

// Find next due installment for member — same File-first resolution as
// findByMember, then the single next-due row across those files.
installmentSchema.statics.findNextDue = async function (memId: string) {
  const fileIds = await File.find({ memId: new Types.ObjectId(memId) }).distinct('_id');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return populateFileMemberPlot(
    this.findOne({
      fileId: { $in: fileIds },
      dueDate: { $gte: today },
      status: { $in: [InstallmentStatus.UNPAID, InstallmentStatus.PARTIALLY_PAID] },
      isDeleted: false,
    }).populate('installmentCategory', 'instCatName instCatDescription'),
    { fileSelect: 'fileRegNo', plotSelect: 'plotNo plotSize' }
  ).sort({ dueDate: 1 });
};

// Create and export model
const Installment = model<IInstallment, IInstallmentModel>('Installment', installmentSchema);

export { populateFileMemberPlot, flattenFileMemberPlot };
export default Installment;
