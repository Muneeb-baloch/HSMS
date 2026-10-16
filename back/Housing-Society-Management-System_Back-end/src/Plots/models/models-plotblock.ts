import { Decimal } from 'decimal.js';
import { Document, Model, Schema, Types, model } from 'mongoose';
import {
  decimalToString,
  fromBaseSqft,
  normalizeAreaUnit,
  toBaseSqft,
} from '../../common/utils/areaUnits';
import { AppError } from '../../middleware/error.middleware';

export interface IPlotBlock extends Document {
  societyId?: Types.ObjectId;
  projectId: Types.ObjectId; // Added: Foreign key to Project
  plotBlockName: string;
  plotBlockDesc?: string;
  blockTotalArea?: number; // Added
  blockAreaUnit?: string; // Added: e.g., 'acres', 'hectares', 'sqft'
  /** Canonical total area in square feet (base unit). Always forced to match the project's unit. */
  areaBase: Types.Decimal128;
  /** Sum of all active child Plots' areaBase currently reserved against this block. */
  allocatedBase: Types.Decimal128;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  isDeleted: boolean;
  deletedAt?: Date;
}

const plotBlockSchema = new Schema<IPlotBlock>(
  {
    societyId: {
      type: Schema.Types.ObjectId,
      ref: 'Society',
      index: true,
    },

    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
      index: true,
    },

    plotBlockName: {
      type: String,
      required: [true, 'Plot Block Name is required'],
      trim: true,
      minlength: [2, 'Plot Block Name must be at least 2 characters'],
      maxlength: [100, 'Plot Block Name cannot exceed 100 characters'],
      index: true,
    },

    plotBlockDesc: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },

    blockTotalArea: {
      type: Number,
      min: [0, 'Area cannot be negative'],
      default: 0,
    },

    blockAreaUnit: {
      type: String,
      enum: {
        values: ['marla', 'kanal', 'acre', 'hectare', 'sqyd', 'sqft'],
        message: '{VALUE} is not a valid area unit',
      },
      default: 'marla',
    },

    areaBase: {
      type: Schema.Types.Decimal128,
      required: true,
      default: () => Types.Decimal128.fromString('0'),
    },

    allocatedBase: {
      type: Schema.Types.Decimal128,
      required: true,
      default: () => Types.Decimal128.fromString('0'),
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Keep areaBase (canonical sqft) in sync with blockTotalArea/blockAreaUnit, and guard
// against shrinking the block below what's already allocated to child plots.
plotBlockSchema.pre('validate', function (next) {
  if (!this.blockTotalArea || !this.blockAreaUnit) {
    next();
    return;
  }

  if (this.isModified('blockTotalArea') || this.isModified('blockAreaUnit') || !this.areaBase) {
    try {
      const unit = normalizeAreaUnit(this.blockAreaUnit);
      const newAreaBase = toBaseSqft(this.blockTotalArea, unit);

      // Check shrink against allocated plots using canonical sqft, not display unit
      if (!this.isNew && this.allocatedBase) {
        const allocated = new Decimal(decimalToString(this.allocatedBase));
        const newArea = new Decimal(newAreaBase.toString());
        if (newArea.lessThan(allocated)) {
          const allocatedDisplay = fromBaseSqft(this.allocatedBase, 'sqft');
          const newAreaDisplay = fromBaseSqft(newAreaBase, 'sqft');
          next(
            new AppError(
              400,
              `Cannot shrink plot block area below what is already allocated to plots ` +
              `(${allocatedDisplay} sqft allocated, trying to shrink to ${newAreaDisplay} sqft).`
            ) as any
          );
          return;
        }
      }

      this.areaBase = newAreaBase;
    } catch (err: any) {
      next(err);
      return;
    }
  }
  next();
});

// Query-middleware equivalent of the pre('validate') hook above - document middleware
// does not run for findOneAndUpdate/findByIdAndUpdate, so this covers that path too.
plotBlockSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate() as any;
  if (update?.$set?.blockTotalArea === undefined && update?.$set?.blockAreaUnit === undefined) {
    next();
    return;
  }

  try {
    const current = await this.model.findOne(this.getQuery());
    if (!current || !current.blockAreaUnit) {
      next();
      return;
    }

    const blockTotalArea = update.$set.blockTotalArea ?? current.blockTotalArea;
    const blockAreaUnitRaw = update.$set.blockAreaUnit ?? current.blockAreaUnit;
    if (!blockTotalArea || !blockAreaUnitRaw) {
      next();
      return;
    }

    const unit = normalizeAreaUnit(blockAreaUnitRaw);
    const newAreaBase = toBaseSqft(blockTotalArea, unit);

    // Check shrink against allocated plots using canonical sqft, not display unit
    const allocated = new Decimal(decimalToString(current.allocatedBase));
    const newArea = new Decimal(newAreaBase.toString());
    if (newArea.lessThan(allocated)) {
      const allocatedDisplay = fromBaseSqft(current.allocatedBase, 'sqft');
      const newAreaDisplay = fromBaseSqft(newAreaBase, 'sqft');
      next(
        new AppError(
          400,
          `Cannot shrink plot block area below what is already allocated to plots ` +
          `(${allocatedDisplay} sqft allocated, trying to shrink to ${newAreaDisplay} sqft).`
        ) as any
      );
      return;
    }

    update.$set.areaBase = newAreaBase;
    next();
  } catch (err: any) {
    next(err);
  }
});

// Virtual populate: get all active plots in this block
plotBlockSchema.virtual('plots', {
  ref: 'Plot',
  localField: '_id',
  foreignField: 'plotBlockId',
  match: { isDeleted: false },
});

// Compound index for societyId
plotBlockSchema.index({ societyId: 1, isDeleted: 1 });

// Compound index for name uniqueness within the same project
plotBlockSchema.index(
  { projectId: 1, plotBlockName: 1, isDeleted: 1 },
  {
    unique: true,
    partialFilterExpression: { isDeleted: false },
  }
);

// Text index for search
plotBlockSchema.index(
  { plotBlockName: 'text', plotBlockDesc: 'text' },
  {
    weights: { plotBlockName: 10, plotBlockDesc: 5 },
    name: 'plotblock_text_search',
  }
);

// Index for filtering by project
plotBlockSchema.index({ projectId: 1, isDeleted: 1 });

const PlotBlock: Model<IPlotBlock> = model<IPlotBlock>('PlotBlock', plotBlockSchema);

export default PlotBlock;
