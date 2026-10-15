import { Document, Model, Schema, Types, model } from 'mongoose';

// @deprecated - use LookupValue collection (category: 'bill_status') instead
export enum BillStatus {
  PENDING = 'Pending',
  PAID = 'Paid',
  PARTIALLY_PAID = 'Partially Paid',
  OVERDUE = 'Overdue',
  CANCELLED = 'Cancelled',
  DISPUTED = 'Disputed',
}

export interface IBillInfo extends Document {
  societyId: Types.ObjectId;
  billNo: string;
  billTypeId: Types.ObjectId;
  fileId: Types.ObjectId;
  memId: Types.ObjectId;
  billMonth: string; // Format: "January 2026"
  previousReading?: number;
  currentReading?: number;
  unitsConsumed?: number;
  billAmount: number;
  fineAmount: number;
  arrears: number;
  totalPayable: number;
  amountPaid: number;
  dueDate: Date;
  gracePeriodDays: number;
  status: string;
  paymentDate?: Date;
  paymentMethod?: string;
  transactionId?: string;
  notes?: string;
  createdBy: Types.ObjectId;
  modifiedBy?: Types.ObjectId;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Virtual fields
  file?: any;
  member?: any;
  createdByUser?: any;
  modifiedByUser?: any;
  isOverdue?: boolean;
  daysOverdue?: number;
  totalPaid?: number;
  remainingBalance?: number;
}

const billInfoSchema = new Schema<IBillInfo>(
  {
    societyId: {
      type: Schema.Types.ObjectId,
      ref: 'Society',
      required: [true, 'Society ID is required for tenant isolation'],
      index: true,
    },
    billNo: {
      type: String,
      required: [true, 'Bill number is required'],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [5, 'Bill number must be at least 5 characters'],
      maxlength: [50, 'Bill number cannot exceed 50 characters'],
      index: true,
    },
    billTypeId: {
      type: Schema.Types.ObjectId,
      ref: 'BillType',
      required: [true, 'Bill type is required'],
      index: true,
    },
    fileId: {
      type: Schema.Types.ObjectId,
      ref: 'File',
      required: true,
      index: true,
    },
    memId: {
      type: Schema.Types.ObjectId,
      ref: 'Member',
      required: true,
      index: true,
    },
    billMonth: {
      type: String,
      required: [true, 'Bill month is required'],
      trim: true,
      match: [
        /^[A-Za-z]+ \d{4}$/,
        'Bill month must be in format "Month Year" (e.g., "January 2026")',
      ],
      index: true,
    },
    previousReading: {
      type: Number,
      min: [0, 'Previous reading cannot be negative'],
    },
    currentReading: {
      type: Number,
      min: [0, 'Current reading cannot be negative'],
      validate: {
        validator: function (this: IBillInfo, value: number) {
          return !this.previousReading || value >= this.previousReading;
        },
        message: 'Current reading must be greater than or equal to previous reading',
      },
    },
    unitsConsumed: {
      type: Number,
      min: [0, 'Units consumed cannot be negative'],
    },
    billAmount: {
      type: Number,
      required: [true, 'Bill amount is required'],
      min: [0, 'Bill amount cannot be negative'],
    },
    fineAmount: {
      type: Number,
      default: 0,
      min: [0, 'Fine amount cannot be negative'],
    },
    arrears: {
      type: Number,
      default: 0,
      min: [0, 'Arrears cannot be negative'],
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
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
      index: true,
    },
    gracePeriodDays: {
      type: Number,
      default: 7,
      min: [0, 'Grace period days cannot be negative'],
      max: [30, 'Grace period days cannot exceed 30'],
    },
    status: {
      type: String,
      // Validated via LookupValue (category: 'bill_status')
      default: 'Pending',
      trim: true,
      index: true,
    },
    paymentDate: {
      type: Date,
      index: true,
    },
    paymentMethod: {
      type: String,
      trim: true,
      maxlength: [50, 'Payment method cannot exceed 50 characters'],
    },
    transactionId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      maxlength: [100, 'Transaction ID cannot exceed 100 characters'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
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
    isActive: {
      type: Boolean,
      default: true,
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
        return cleanRet;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (_doc, ret: Record<string, any>) {
        const { __v, ...cleanRet } = ret;
        return cleanRet;
      },
    },
  }
);

// Compound indexes for efficient querying
billInfoSchema.index({ societyId: 1, isDeleted: 1 });
billInfoSchema.index({ billNo: 1, isDeleted: 1 }, { unique: true });
// One bill per {file, bill type, month} - prevents the same recurring charge
// (e.g. maintenance for "November 2026") from being generated twice for the
// same file. Replaces the old memId-based (non-unique) index: a member can
// have multiple files, and the charge is really per-file, not per-member.
billInfoSchema.index(
  { fileId: 1, billTypeId: 1, billMonth: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false }, name: 'uniq_bill_per_file_type_month' }
);
billInfoSchema.index({ status: 1, dueDate: 1 });
billInfoSchema.index({ fileId: 1, isActive: 1 });
billInfoSchema.index({ dueDate: -1, isActive: 1 });

// Text index for search
billInfoSchema.index(
  {
    billNo: 'text',
    billMonth: 'text',
    notes: 'text',
    transactionId: 'text',
  },
  {
    weights: {
      billNo: 10,
      billMonth: 5,
      transactionId: 8,
      notes: 3,
    },
    name: 'bill_info_text_search',
  }
);

// Virtual for file
billInfoSchema.virtual('file', {
  ref: 'File',
  localField: 'fileId',
  foreignField: '_id',
  justOne: true,
});

// Virtual for member
billInfoSchema.virtual('member', {
  ref: 'Member',
  localField: 'memId',
  foreignField: '_id',
  justOne: true,
});

// Virtual for created by user
billInfoSchema.virtual('createdByUser', {
  ref: 'UserStaff',
  localField: 'createdBy',
  foreignField: '_id',
  justOne: true,
});

// Virtual for modified by user
billInfoSchema.virtual('modifiedByUser', {
  ref: 'UserStaff',
  localField: 'modifiedBy',
  foreignField: '_id',
  justOne: true,
});

// Virtual to check if bill is overdue
billInfoSchema.virtual('isOverdue').get(function () {
  if (this.status === BillStatus.PAID || this.status === BillStatus.CANCELLED) {
    return false;
  }

  const now = new Date();
  const graceEndDate = new Date(this.dueDate);
  graceEndDate.setDate(graceEndDate.getDate() + this.gracePeriodDays);

  return now > graceEndDate;
});

// Virtual for days overdue
billInfoSchema.virtual('daysOverdue').get(function () {
  if (this.status === BillStatus.PAID || this.status === BillStatus.CANCELLED || !this.isOverdue) {
    return 0;
  }

  const now = new Date();
  const graceEndDate = new Date(this.dueDate);
  graceEndDate.setDate(graceEndDate.getDate() + this.gracePeriodDays);

  const diffTime = Math.abs(now.getTime() - graceEndDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for total paid amount — derived from the real amountPaid field
// (previously guessed from status: Paid = 100%, Partially Paid = a flat 50%
// regardless of what was actually paid).
billInfoSchema.virtual('totalPaid').get(function () {
  return this.amountPaid ?? 0;
});

// Virtual for remaining balance
billInfoSchema.virtual('remainingBalance').get(function () {
  return Math.max(0, (this.totalPayable ?? 0) - (this.amountPaid ?? 0));
});

// Virtual for status badge color
billInfoSchema.virtual('statusBadgeColor').get(function () {
  const colors: Record<string, string> = {
    [BillStatus.PENDING]: 'warning',
    [BillStatus.PAID]: 'success',
    [BillStatus.PARTIALLY_PAID]: 'info',
    [BillStatus.OVERDUE]: 'danger',
    [BillStatus.CANCELLED]: 'secondary',
    [BillStatus.DISPUTED]: 'dark',
  };
  return colors[this.status] || 'secondary';
});

// Pre-validate middleware: totalPayable is required, but required-field
// checks run before pre('save') hooks, so a brand-new document that omits it
// gets rejected with "Total payable is required" before the pre('save')
// calculation below ever runs. Fill it in here, before validation, only
// when missing; pre('save') still recomputes it below whenever billAmount/
// fineAmount/arrears are modified (always true for a new doc), so this
// doesn't change the final persisted value.
billInfoSchema.pre('validate', function (next) {
  if (this.totalPayable === undefined && this.billAmount !== undefined) {
    this.totalPayable = this.billAmount + (this.fineAmount || 0) + (this.arrears || 0);
  }
  next();
});

// Pre-save middleware
billInfoSchema.pre('save', function (next) {
  // Convert billNo to uppercase
  if (this.isModified('billNo')) {
    this.billNo = this.billNo.toUpperCase();
  }

  // Calculate units consumed if readings are provided
  if (this.isModified('currentReading') || this.isModified('previousReading')) {
    if (this.currentReading !== undefined && this.previousReading !== undefined) {
      this.unitsConsumed = this.currentReading - this.previousReading;
      if (this.unitsConsumed < 0) {
        this.unitsConsumed = 0;
      }
    }
  }

  // Calculate total payable
  if (
    this.isModified('billAmount') ||
    this.isModified('fineAmount') ||
    this.isModified('arrears')
  ) {
    this.totalPayable = this.billAmount + this.fineAmount + this.arrears;
  }

  // Auto-update status based on due date (Pending -> Overdue). The
  // amount-based block below takes precedence over this when something has
  // actually been paid.
  if (this.isModified('dueDate') || this.isModified('status')) {
    const now = new Date();
    const graceEndDate = new Date(this.dueDate);
    graceEndDate.setDate(graceEndDate.getDate() + this.gracePeriodDays);

    if (this.status === BillStatus.PENDING && now > graceEndDate) {
      this.status = BillStatus.OVERDUE;
    }
  }

  // Status is derived from amountPaid vs totalPayable, same as Installment.
  // Cancelled/Disputed are administrative states and are never overwritten
  // here. amountPaid === 0 falls through untouched, leaving whatever the
  // due-date block above set (Pending or Overdue).
  if (
    this.status !== BillStatus.CANCELLED &&
    this.status !== BillStatus.DISPUTED &&
    (this.isModified('amountPaid') || this.isModified('totalPayable') || this.isNew)
  ) {
    if (this.totalPayable > 0 && this.amountPaid >= this.totalPayable) {
      this.status = BillStatus.PAID;
      if (!this.paymentDate) {
        this.paymentDate = new Date();
      }
    } else if (this.amountPaid > 0) {
      this.status = BillStatus.PARTIALLY_PAID;
    }
  }

  next();
});


// Static method to find by bill number
billInfoSchema.statics.findByBillNo = function (billNo: string) {
  return this.findOne({
    billNo: billNo.toUpperCase(),
    isDeleted: false,
  });
};

// Static method to find overdue bills
billInfoSchema.statics.findOverdueBills = function (page: number = 1, limit: number = 20) {
  const skip = (page - 1) * limit;

  const query = {
    status: BillStatus.OVERDUE,
    isDeleted: false,
    isActive: true,
  };

  return Promise.all([
    this.find(query)
      .populate('memId', 'memName fullName memNic mobileNo')
      .populate('fileId', 'fileRegNo')
      .sort({ dueDate: 1 })
      .skip(skip)
      .limit(limit),
    this.countDocuments(query),
  ]);
};

// Static method to find bills by member and month
billInfoSchema.statics.findByMemberAndMonth = function (memId: string, month: string) {
  return this.find({
    memId: new Types.ObjectId(memId),
    billMonth: month,
    isDeleted: false,
    isActive: true,
  })
    .populate('fileId', 'fileRegNo')
    .sort({ dueDate: 1 });
};

// Static method to get bill statistics
billInfoSchema.statics.getStatistics = function (year?: number) {
  const matchStage: any = {
    isDeleted: false,
    isActive: true,
  };

  if (year) {
    matchStage.$expr = {
      $eq: [{ $year: '$createdAt' }, year],
    };
  }

  return this.aggregate([
    {
      $match: matchStage,
    },
    {
      $group: {
        _id: null,
        totalBills: { $sum: 1 },
        totalAmount: { $sum: '$totalPayable' },
        totalPaid: {
          $sum: {
            $cond: [{ $eq: ['$status', BillStatus.PAID] }, '$totalPayable', 0],
          },
        },
        totalPending: {
          $sum: {
            $cond: [
              { $in: ['$status', [BillStatus.PENDING, BillStatus.PARTIALLY_PAID]] },
              '$totalPayable',
              0,
            ],
          },
        },
        totalOverdue: {
          $sum: {
            $cond: [{ $eq: ['$status', BillStatus.OVERDUE] }, '$totalPayable', 0],
          },
        },
        byType: {
          $push: {
            type: '$billTypeId',
            amount: '$totalPayable',
          },
        },
      },
    },
  ]);
};

// Define interface for static methods
interface IBillInfoModel extends Model<IBillInfo> {
  findByBillNo(billNo: string): Promise<IBillInfo | null>;
  findOverdueBills(page: number, limit: number): Promise<[IBillInfo[], number]>;
  findByMemberAndMonth(memId: string, month: string): Promise<IBillInfo[]>;
  getStatistics(year?: number): Promise<any[]>;
}

// Create and export model
const BillInfo = model<IBillInfo, IBillInfoModel>('BillInfo', billInfoSchema);

export default BillInfo;
