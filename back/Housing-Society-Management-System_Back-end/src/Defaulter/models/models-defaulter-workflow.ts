import { Document, Model, Schema, Types, model } from 'mongoose';

// @deprecated - use LookupValue collection (category: 'defaulter_status') instead
export enum DefaulterStatus {
  WARNING = 'Warning',
  SUSPENDED = 'Suspended',
  LEGAL_ACTION = 'Legal Action',
  RESOLVED = 'Resolved',
}

/**
 * Staff-only workflow state for a defaulting File. Everything about WHETHER a
 * file is a defaulter and HOW MUCH it owes is computed live from the
 * Installment/BillInfo ledger (see service-defaulter.ts) - this collection
 * only holds what isn't derivable from the ledger: a manual status override,
 * how many notices have been sent, free-text remarks, and when it was last
 * auto-resolved. A file with no document here simply uses the
 * ledger-suggested status and zero notices/remarks.
 */
export interface IDefaulterWorkflow extends Document {
  fileId: Types.ObjectId;
  societyId: Types.ObjectId;
  statusOverride?: string;
  noticeSentCount: number;
  remarks?: string;
  resolvedAt?: Date;
  createdBy: Types.ObjectId;
  modifiedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const defaulterWorkflowSchema = new Schema<IDefaulterWorkflow>(
  {
    fileId: {
      type: Schema.Types.ObjectId,
      ref: 'File',
      required: true,
      unique: true,
      index: true,
    },
    societyId: {
      type: Schema.Types.ObjectId,
      ref: 'Society',
      required: [true, 'Society ID is required for tenant isolation'],
      index: true,
    },
    statusOverride: {
      type: String,
      // Validated via LookupValue (category: 'defaulter_status') long-term;
      // enum kept here for now since DefaulterStatus has no LookupValue rows seeded yet.
      enum: Object.values(DefaulterStatus),
      trim: true,
    },
    noticeSentCount: {
      type: Number,
      required: true,
      min: [0, 'Notice count cannot be negative'],
      default: 0,
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [1000, 'Remarks cannot exceed 1000 characters'],
    },
    resolvedAt: {
      type: Date,
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
  },
  {
    timestamps: true,
  }
);

const DefaulterWorkflow: Model<IDefaulterWorkflow> = model<IDefaulterWorkflow>(
  'DefaulterWorkflow',
  defaulterWorkflowSchema
);

export default DefaulterWorkflow;
