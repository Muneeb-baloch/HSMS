// src/database/File/models/models-file.ts
import { Document, Model, Schema, Types, model, models } from 'mongoose';

// ------------------- ENUMS -------------------
// @deprecated - use LookupValue collection (category: 'file_status') instead
export enum FileStatus {
  ACTIVE = 'Active',
  PENDING = 'Pending',
  CANCELLED = 'Cancelled',
  MERGED = 'Merged',
  CLOSED = 'Closed',
  SUSPENDED = 'Suspended',
  TRANSFERRED = 'Transferred',
  DISPUTED = 'Disputed',
}

/**
 * Every FileStatus except CANCELLED. A plot counts as occupied by a File in
 * any of these states - see the uniq_active_file_per_plot index below for
 * why this is NOT just [ACTIVE, PENDING]. The single source of truth for
 * "does this file still hold the plot" - the index's partialFilterExpression
 * and every app-level double-booking guard in service-file.ts (createFile,
 * updateFile, assignPlot) all use this same array, so they can't drift apart
 * the way the index briefly did from the original [ACTIVE, PENDING] check.
 */
export const PLOT_OCCUPYING_FILE_STATUSES = [
  FileStatus.ACTIVE,
  FileStatus.PENDING,
  FileStatus.TRANSFERRED,
  FileStatus.SUSPENDED,
  FileStatus.DISPUTED,
  FileStatus.MERGED,
  FileStatus.CLOSED,
];

// @deprecated - use LookupValue collection (category: 'payment_mode') instead
export enum PaymentMode {
  CASH = 'Cash',
  BANK_TRANSFER = 'Bank Transfer',
  CHEQUE = 'Cheque',
  CREDIT_CARD = 'Credit Card',
  DEBIT_CARD = 'Debit Card',
  ONLINE = 'Online',
  MOBILE_WALLET = 'Mobile Wallet',
  OTHER = 'Other',
}

// ------------------- INTERFACE -------------------
export interface IFile extends Document {
  fileRegNo: string;
  fileBarCode: string;
  planId: Types.ObjectId;
  memId: Types.ObjectId;
  nomineeId?: Types.ObjectId;
  applicationId?: Types.ObjectId;
  plotId: Types.ObjectId; // REQUIRED now

  // The agreed contract price, snapshotted from Plot.plotTotalAmount at the
  // moment of booking. Never silently recomputed from a later plot-price edit
  // — only a deliberate revision path should change it (none exists yet).
  contractPrice: number;
  priceSnapshotAt: Date;
  paymentMode: string;
  isAdjusted: boolean;
  adjustmentRef?: string;
  status: string;
  fileRemarks?: string;
  bookingDate: Date;
  expectedCompletionDate?: Date;
  actualCompletionDate?: Date;
  cancellationDate?: Date;
  cancellationReason?: string;
  societyId: Types.ObjectId;
  createdBy: Types.ObjectId;
  modifiedBy?: Types.ObjectId;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Virtual fields
  plan?: any;
  member?: any;
  nominee?: any;
  application?: any;
  plot?: any;
  createdByUser?: any;
  modifiedByUser?: any;
  // balanceAmount here is a synchronous, pre-ledger-only fallback (see the
  // virtual below). The real post-generation balance/downPayment/
  // paymentPercentage are computed async from the Installment ledger by
  // fileService.attachFinancials() and merged onto the plain response
  // object — not true Mongoose virtuals, since they require a DB query.
  balanceAmount?: number;
  downPayment?: number;
  paymentPercentage?: number;
  fileAge?: number;
  statusBadgeColor?: string;
}

// ------------------- SCHEMA -------------------
const fileSchema = new Schema<IFile>(
  {
    fileRegNo: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      minlength: 5,
      maxlength: 50,
    },
    fileBarCode: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    planId: {
      type: Schema.Types.ObjectId,
      ref: 'InstallmentPlan',
      required: [true, 'Installment plan is required'],
      index: true,
    },
    memId: {
      type: Schema.Types.ObjectId,
      ref: 'Member',
      required: true,
    },
    nomineeId: {
      type: Schema.Types.ObjectId,
      ref: 'Nominee',
    },
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: 'Application',
    },
    plotId: {
      type: Schema.Types.ObjectId,
      ref: 'Plot',
      required: true, // REQUIRED
    },

    contractPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    priceSnapshotAt: {
      type: Date,
      required: true,
    },
    paymentMode: {
      type: String,
      // Validated via LookupValue (category: 'payment_mode')
      required: true,
      trim: true,
      index: true,
    },
    isAdjusted: {
      type: Boolean,
      default: false,
    },
    adjustmentRef: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    status: {
      type: String,
      // Validated via LookupValue (category: 'file_status')
      default: 'Pending',
      trim: true,
      index: true,
    },
    fileRemarks: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    bookingDate: {
      type: Date,
      required: true,
    },
    expectedCompletionDate: {
      type: Date,
    },
    actualCompletionDate: {
      type: Date,
    },
    cancellationDate: {
      type: Date,
    },
    cancellationReason: {
      type: String,
      trim: true,
      maxlength: 500,
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
    },
    modifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'UserStaff',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ------------------- INDEXES -------------------
fileSchema.index({ fileRegNo: 1, isDeleted: 1 }, { unique: true });
fileSchema.index({ fileBarCode: 1, isDeleted: 1 }, { unique: true });
// A plot is occupied by any File that isn't Cancelled. This was originally
// written as status $in [ACTIVE, PENDING] (matching the pre-existing
// app-level check in service-file.ts), but transferFile() proved that
// wrong: a transfer does NOT create a new File - it mutates the SAME
// document's memId and sets status to TRANSFERRED, with the ledger
// (installments) continuing unchanged on the same fileId. A real pre-
// existing File in this DB has exactly that shape (status: 'Transferred',
// still the only file on its plot) - under the old [ACTIVE, PENDING] rule,
// a second file could have been booked against that same, still-occupied
// plot. CLOSED (actualCompletionDate stamped = plan completed successfully)
// is the same story: a finished sale, not a freed plot. SUSPENDED/DISPUTED/
// MERGED have no dedicated code path that frees the plot either - nothing
// in this codebase ever demonstrates that leaving a plot's only File in one
// of those states means the plot is available again. Only CANCELLED has
// that evidence (deleteFile's dedicated cancel path). So: block everything
// except Cancelled. (MongoDB's partialFilterExpression doesn't support $ne/
// $not, confirmed empirically against this MongoDB version - hence the
// explicit $in of every other FileStatus value rather than a $ne. If a new
// FileStatus value is ever added, it needs to be added here too - and to
// the matching checks in service-file.ts's createFile/updateFile.)
fileSchema.index(
  { plotId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      isDeleted: false,
      status: { $in: PLOT_OCCUPYING_FILE_STATUSES },
    },
    name: 'uniq_active_file_per_plot',
  }
);
fileSchema.index({ plotId: 1, memId: 1 });
fileSchema.index({ status: 1, isActive: 1 });
fileSchema.index({ memId: 1, isDeleted: 1 });
fileSchema.index({ bookingDate: -1, status: 1 });
fileSchema.index({ fileRegNo: 1 });
fileSchema.index({ fileBarCode: 1 });
fileSchema.index({ plotId: 1 });
fileSchema.index({ memId: 1 });
fileSchema.index({ status: 1 });
fileSchema.index({ bookingDate: 1 });
fileSchema.index({ isActive: 1 });
fileSchema.index({ isDeleted: 1 });
fileSchema.index({ planId: 1 });
fileSchema.index({ createdBy: 1 });
fileSchema.index({ paymentMode: 1 });

// Text index for search
fileSchema.index(
  {
    fileRegNo: 'text',
    fileBarCode: 'text',
    fileRemarks: 'text',
    adjustmentRef: 'text',
    cancellationReason: 'text',
  },
  {
    weights: {
      fileRegNo: 10,
      fileBarCode: 8,
      adjustmentRef: 5,
      fileRemarks: 3,
      cancellationReason: 3,
    },
    name: 'file_text_search',
  }
);

// ------------------- VIRTUALS -------------------
// Pre-ledger-only fallback: correct exactly when no Installment row exists
// yet for this file (amountPaid is necessarily 0, so balance == contractPrice).
// Once a ledger exists, fileService.attachFinancials() overwrites this with
// the real contractPrice + lateFees - amountPaid computed from Installment —
// Mongoose virtuals are synchronous and can't run that query themselves.
fileSchema.virtual('balanceAmount').get(function () {
  return this.contractPrice;
});

fileSchema.virtual('fileAge').get(function () {
  if (!this.bookingDate) return 0;
  const diff = Math.abs(Date.now() - this.bookingDate.getTime());
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

fileSchema.virtual('statusBadgeColor').get(function () {
  const colors: Record<string, string> = {
    [FileStatus.ACTIVE]: 'success',
    [FileStatus.PENDING]: 'warning',
    [FileStatus.CANCELLED]: 'danger',
    [FileStatus.MERGED]: 'info',
    [FileStatus.CLOSED]: 'secondary',
    [FileStatus.SUSPENDED]: 'dark',
    [FileStatus.TRANSFERRED]: 'primary',
    [FileStatus.DISPUTED]: 'danger',
  };
  return colors[this.status] || 'secondary';
});

// Virtual relationships
fileSchema.virtual('plan', {
  ref: 'InstallmentPlan',
  localField: 'planId',
  foreignField: '_id',
  justOne: true,
});

fileSchema.virtual('member', {
  ref: 'Member',
  localField: 'memId',
  foreignField: '_id',
  justOne: true,
});

fileSchema.virtual('nominee', {
  ref: 'Nominee',
  localField: 'nomineeId',
  foreignField: '_id',
  justOne: true,
});

fileSchema.virtual('application', {
  ref: 'Application',
  localField: 'applicationId',
  foreignField: '_id',
  justOne: true,
});

fileSchema.virtual('plot', {
  ref: 'Plot',
  localField: 'plotId',
  foreignField: '_id',
  justOne: true,
});

fileSchema.virtual('createdByUser', {
  ref: 'UserStaff',
  localField: 'createdBy',
  foreignField: '_id',
  justOne: true,
});

fileSchema.virtual('modifiedByUser', {
  ref: 'UserStaff',
  localField: 'modifiedBy',
  foreignField: '_id',
  justOne: true,
});

// ------------------- PRE SAVE -------------------
fileSchema.pre('save', function (next) {
  if (this.isModified('fileRegNo')) {
    this.fileRegNo = this.fileRegNo.toUpperCase();
  }

  if (!this.fileBarCode || this.isModified('fileRegNo')) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    this.fileBarCode = `BC-${this.fileRegNo}-${timestamp}-${random}`;
  }

  if (!this.expectedCompletionDate) {
    const expected = new Date(this.bookingDate);
    expected.setFullYear(expected.getFullYear() + 1);
    this.expectedCompletionDate = expected;
  }

  if (this.isModified('status') && this.status === FileStatus.CANCELLED && !this.cancellationDate) {
    this.cancellationDate = new Date();
  }

  next();
});

// ------------------- PRE UPDATE -------------------
fileSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() as any;

  if (update) {
    if (update.fileRegNo) {
      update.fileRegNo = update.fileRegNo.toUpperCase();
    }

    if (update.status === FileStatus.CANCELLED) {
      update.cancellationDate = new Date();
    }

    if (update.status === FileStatus.CLOSED && !update.actualCompletionDate) {
      update.actualCompletionDate = new Date();
    }
  }

  next();
});

// ------------------- STATIC METHODS -------------------
interface IFileModel extends Model<IFile> {
  findByRegNo(fileRegNo: string): Promise<IFile | null>;
  findByBarcode(fileBarCode: string): Promise<IFile | null>;
  findActiveFilesByMember(memId: string): Promise<IFile[]>;
  getFileStatistics(): Promise<any>;
  getFilesByProject(projId: string): Promise<IFile[]>;
}

fileSchema.statics.findByRegNo = function (fileRegNo: string) {
  return this.findOne({
    fileRegNo: fileRegNo.toUpperCase(),
    isDeleted: false,
  });
};

fileSchema.statics.findByBarcode = function (fileBarCode: string) {
  return this.findOne({
    fileBarCode,
    isDeleted: false,
  });
};

fileSchema.statics.findActiveFilesByMember = function (memId: string) {
  return this.find({
    memId: new Types.ObjectId(memId),
    isDeleted: false,
    isActive: true,
  })
    .populate('plot', 'plotNo plotSize')
    .sort({ bookingDate: -1 });
};

fileSchema.statics.getFileStatistics = function () {
  return this.aggregate([
    {
      $match: { isDeleted: false },
    },
    {
      $group: {
        _id: null,
        totalFiles: { $sum: 1 },
        activeFiles: { $sum: { $cond: [{ $eq: ['$status', FileStatus.ACTIVE] }, 1, 0] } },
        pendingFiles: { $sum: { $cond: [{ $eq: ['$status', FileStatus.PENDING] }, 1, 0] } },
        cancelledFiles: { $sum: { $cond: [{ $eq: ['$status', FileStatus.CANCELLED] }, 1, 0] } },
        totalContractPrice: { $sum: '$contractPrice' },
        // totalDownPayment dropped: downPayment is no longer a raw stored field
        // (it's derived from the Installment ledger). This static is currently
        // unused — fileService.getFileStatistics() is the real implementation
        // and does the ledger lookup properly. Kept in sync here so it isn't
        // silently wrong if ever called.
      },
    },
  ]);
};

fileSchema.statics.getFilesByProject = function (projId: string) {
  return this.aggregate([
    {
      $lookup: {
        from: 'plots',
        localField: 'plotId',
        foreignField: '_id',
        as: 'plot',
      },
    },
    {
      $unwind: '$plot',
    },
    {
      $match: {
        'plot.projectId': new Types.ObjectId(projId),
        'plot.isDeleted': false,
        isDeleted: false,
      },
    },
  ]);
};

// ------------------- MODEL EXPORT -------------------
const File = (models?.File as IFileModel) || model<IFile, IFileModel>('File', fileSchema);

export default File;
