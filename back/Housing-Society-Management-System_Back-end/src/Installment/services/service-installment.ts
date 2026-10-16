import { Types } from 'mongoose';
import File from '../../File/models/models-file';
import Member from '../../Member/models/models-member';
import { runInTransaction } from '../../common/services/areaAllocation.service';
import { AppError } from '../../middleware/error.middleware';
import { paymentService } from '../../Payment/index-payment';

import Plot from '../../Plots/models/models-plot';
import { InstallmentCategory } from '../index-installment-category';
import { InstallmentCategoryKind } from '../models/models-installment-category';
import Installment, {
  flattenFileMemberPlot,
  InstallmentStatus,
  InstallmentType,
  populateFileMemberPlot,
} from '../models/models-installment';
import InstallmentPlan from '../models/models-installment-plan';
import InstallmentPlanDetail from '../models/models-installment-plan-detail';
import {
  BulkInstallmentCreationDto,
  CreateInstallmentDto,
  InstallmentDashboardSummary,
  InstallmentGroup,
  InstallmentType as InstallmentInterface,
  InstallmentQueryParams,
  InstallmentReport,
  InstallmentReportParams,
  InstallmentSummary,
  RecordPaymentDto,
  UpdateInstallmentDto,
} from '../types/types-installment';

// Helper function to convert Mongoose document to plain object
const toPlainObject = (doc: any): InstallmentInterface => {
  const plainObj = doc.toObject ? doc.toObject() : doc;

  // Ensure timestamps are included
  if (!plainObj.createdAt && doc.createdAt) {
    plainObj.createdAt = doc.createdAt;
  }
  if (!plainObj.updatedAt && doc.updatedAt) {
    plainObj.updatedAt = doc.updatedAt;
  }

  // member/plot no longer exist as real fields on Installment — when the
  // query populated them via populateFileMemberPlot() (nested under file),
  // flatten them back onto the top level so existing callers reading
  // installment.member/installment.plot directly keep working.
  flattenFileMemberPlot(plainObj);

  return plainObj as InstallmentInterface;
};

// Helper function to calculate next due date
const calculateNextDueDate = (
  startDate: Date,
  frequency: 'monthly' | 'quarterly' | 'half-yearly' | 'yearly',
  installmentNo: number
): Date => {
  const date = new Date(startDate);

  switch (frequency) {
    case 'monthly':
      date.setMonth(date.getMonth() + (installmentNo - 1));
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + (installmentNo - 1) * 3);
      break;
    case 'half-yearly':
      date.setMonth(date.getMonth() + (installmentNo - 1) * 6);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + (installmentNo - 1));
      break;
  }

  return date;
};

// Deterministic mapping from InstallmentCategory.kind to the legacy
// InstallmentType enum tagged on each generated Installment row. Replaces the
// old fuzzy categoryName.includes(...) matcher now that kind exists.
const INSTALLMENT_TYPE_BY_KIND: Record<string, string> = {
  [InstallmentCategoryKind.DOWN_PAYMENT]: InstallmentType.DOWN_PAYMENT,
  [InstallmentCategoryKind.INSTALLMENT]: InstallmentType.MONTHLY,
  [InstallmentCategoryKind.POSSESSION_FEE]: InstallmentType.POSSESSION_FEE,
  [InstallmentCategoryKind.LEGAL_FEE]: InstallmentType.LEGAL_FEE,
  [InstallmentCategoryKind.APPLICATION_FEE]: InstallmentType.APPLICATION_FEE,
  [InstallmentCategoryKind.NOC_FEE]: InstallmentType.NOC_FEE,
  [InstallmentCategoryKind.REGISTRY_FEE]: InstallmentType.REGISTRY_FEE,
  [InstallmentCategoryKind.OTHER]: InstallmentType.OTHER,
};

// kinds whose amounts must reconcile to File.contractPrice (down payment +
// financed installments). possession_fee/legal_fee/application_fee/noc_fee/
// registry_fee/other are real charges that still get generated and tracked,
// just not part of that sum.
const RECONCILED_KINDS = new Set<string>([
  InstallmentCategoryKind.DOWN_PAYMENT,
  InstallmentCategoryKind.INSTALLMENT,
]);

export interface GeneratedInstallmentRow {
  installmentCategoryId: Types.ObjectId;
  installmentNo: number;
  installmentTitle: string;
  installmentType: string;
  dueDate: Date;
  amountDue: number;
  lateFeeSurcharge: number;
  totalPayable: number;
  amountPaid: number;
  balanceAmount: number;
  status: string;
}

/**
 * Single source of truth for turning an InstallmentPlan's detail rows into
 * real Installment ledger rows. Used by every generator (atomic booking,
 * the manual "generate from plan" action, and the cron backfill) so the
 * basis amount and category tagging can never diverge between them again.
 *
 * `planDetails` must have `instCatId` populated with at least
 * `instCatName kind`.
 */
export function buildInstallmentRows(params: {
  contractPrice: number;
  startDate: Date;
  planDetails: Array<InstanceType<typeof InstallmentPlanDetail>>;
}): { rows: GeneratedInstallmentRow[]; reconciledTotal: number } {
  const { contractPrice, startDate, planDetails } = params;
  const rows: GeneratedInstallmentRow[] = [];
  let reconciledTotal = 0;

  for (const detail of planDetails) {
    const category = detail.instCatId as any;
    const categoryName: string = category?.instCatName || 'Installment';
    const kind: string = category?.kind || InstallmentCategoryKind.OTHER;

    // Transfer fees are owned by the Transfer module (TransferType.transferFee /
    // Transfer.transferFeeAmount, with its own paid-status tracking) — if a plan
    // detail is wired to a transfer-fee-named category, generating it here would
    // double-charge the file through two unrelated paths. Fail loud so the admin
    // fixes the plan config instead of silently skipping it.
    if (/transfer/i.test(categoryName)) {
      throw new Error(
        `Installment plan detail uses category "${categoryName}", which looks like a transfer fee. ` +
          'Transfer fees are owned by the Transfer module and must not be part of an installment ' +
          'plan — remove this category from the plan before generating installments.'
      );
    }

    const amountDue =
      detail.fixedAmount > 0
        ? detail.fixedAmount
        : Math.round((detail.percentageAmount / 100) * contractPrice * 100) / 100;

    const dueDate = calculateNextDueDate(startDate, 'monthly', detail.occurrence);
    const installmentType = INSTALLMENT_TYPE_BY_KIND[kind] || InstallmentType.OTHER;

    if (RECONCILED_KINDS.has(kind)) {
      reconciledTotal += amountDue;
    }

    rows.push({
      installmentCategoryId: category?._id ?? detail.instCatId,
      installmentNo: detail.occurrence,
      installmentTitle: `${categoryName} - #${detail.occurrence}`,
      installmentType,
      dueDate,
      amountDue,
      lateFeeSurcharge: 0,
      totalPayable: amountDue,
      amountPaid: 0,
      balanceAmount: amountDue,
      status: InstallmentStatus.UNPAID,
    });
  }

  return { rows, reconciledTotal: Math.round(reconciledTotal * 100) / 100 };
}

// Reconciliation tolerance for floating-point rounding across many rows.
export const RECONCILIATION_TOLERANCE = 0.01;

export const installmentService = {
  /**
   * Create new installment
   */
  /**
   * Create new installment
   */
  async createInstallment(
    data: CreateInstallmentDto,
    userId: Types.ObjectId
  ): Promise<InstallmentInterface> {
    // fileId is the only link now — member/plot are read through it, never
    // accepted as independent client input (that's exactly how they used to
    // go stale after a transfer).
    const file = await File.findById(data.fileId);
    if (!file || file.isDeleted) {
      throw new Error('File not found');
    }

    const member = await Member.findById(file.memId);
    if (!member || (member as any).isDeleted) {
      throw new Error('File has no valid member');
    }

    // Check if installment category exists
    const installmentCategory = await InstallmentCategory.findById(data.installmentCategoryId);
    if (!installmentCategory || !installmentCategory.isActive) {
      throw new Error('Installment category not found');
    }

    // installmentNo is unique per file (enforced by a unique index on
    // {fileId, installmentNo}) regardless of category - the plan generator
    // already treats it as a single global sequence across all rows in a
    // file's ledger, never reset per category.
    const existingInstallment = await Installment.findOne({
      fileId: data.fileId,
      installmentNo: data.installmentNo,
      isDeleted: false,
    });

    if (existingInstallment) {
      throw new AppError(400, `Installment number ${data.installmentNo} already exists for this file`);
    }

    // Strip computed fields - totalPayable is ALWAYS recalculated by the model,
    // client values (including null) are ignored and unsafe to trust. paidDate
    // is a payment fact, not a creation-time input - a brand-new installment
    // is never paid, so it must stay unset until recordPayment sets it.
    const { totalPayable, balanceAmount, status, paidDate, ...safeData } = data as any;

    const installmentData: any = {
      ...safeData,
      societyId: (member as any).societyId,
      amountPaid: 0,
      status: InstallmentStatus.UNPAID,
      isDeleted: false,
      createdBy: userId,
    };

    const installment = await Installment.create(installmentData);

    const createdInstallment = await populateFileMemberPlot(
      Installment.findById(installment._id).populate(
        'installmentCategory',
        'instCatName instCatDescription'
      )
    ).populate('createdBy', 'userName fullName designation');

    if (!createdInstallment) {
      throw new Error('Failed to create installment');
    }

    return toPlainObject(createdInstallment);
  },

  /**
   * Create multiple installments (bulk creation)
   */
  /**
   * Create multiple installments (bulk creation)
   */
  async createBulkInstallments(
    data: BulkInstallmentCreationDto,
    userId: Types.ObjectId
  ): Promise<InstallmentInterface[]> {
    // fileId is the only link — member/plot are read through it, never taken
    // as separate client input.
    const file = await File.findById(data.fileId);
    if (!file || file.isDeleted) {
      throw new Error('File not found');
    }

    const member = await Member.findById(file.memId);
    if (!member || (member as any).isDeleted) {
      throw new Error('File has no valid member');
    }

    // Check if installment category exists
    const installmentCategory = await InstallmentCategory.findById(data.installmentCategoryId);
    if (!installmentCategory || !installmentCategory.isActive) {
      throw new Error('Installment category not found');
    }

    // Use .create() for each installment to ensure pre('save') hooks run —
    // insertMany() skips pre('save') where balanceAmount/status are computed.
    // Wrapped in a transaction so a failure on any row (e.g. the unique
    // installmentNo index on a later row) rolls back every row already
    // created in this batch, instead of leaving a partial ledger.
    const createdInstallments: any[] = await runInTransaction(async session => {
      const results: any[] = [];

      for (let i = 1; i <= data.totalInstallments; i++) {
        const dueDate = calculateNextDueDate(data.startDate, data.frequency, i);

        // Computed fields (totalPayable, balanceAmount, status) are ALWAYS recalculated by the model's pre('save') hook
        const [installment] = await Installment.create(
          [
            {
              fileId: data.fileId,
              installmentCategoryId: data.installmentCategoryId,
              installmentNo: i,
              installmentTitle:
                data.installmentTitle || `${installmentCategory.instCatName} - Installment ${i}`,
              installmentType: data.installmentType,
              dueDate,
              amountDue: data.amountPerInstallment,
              lateFeeSurcharge: 0,
              amountPaid: 0,
              isDeleted: false,
              societyId: file.societyId,
              createdBy: userId,
            },
          ],
          { session }
        );

        results.push(installment);
      }

      return results;
    });

    // Fetch created installments with populated data
    const installmentIds = createdInstallments.map(inst => inst._id);
    const populatedInstallments = await populateFileMemberPlot(
      Installment.find({ _id: { $in: installmentIds } }).populate(
        'installmentCategory',
        'instCatName instCatDescription'
      )
    ).populate('createdBy', 'userName fullName designation');

    return populatedInstallments.map(doc => toPlainObject(doc));
  },

  /**
   * Generate the full installment schedule for a File from its linked
   * Installment Plan. Reads the Plan's InstallmentPlanDetail rows (category +
   * occurrence + percentage/fixed amount), computes each installment's amount
   * against the File's frozen contractPrice snapshot via buildInstallmentRows
   * (shared with the atomic booking path and the cron backfill), and
   * bulk-creates the real Installment ledger records. Manual/admin entry
   * point for files that didn't get their ledger generated at booking time
   * (e.g. pre-dating this fix) — also doubles as the cron's safety net target.
   */
  async generateInstallmentsFromPlan(
    fileId: string,
    userId: Types.ObjectId
  ): Promise<InstallmentInterface[]> {
    const file = await File.findById(fileId);
    if (!file || file.isDeleted) {
      throw new Error('File not found');
    }

    const existingCount = await Installment.countDocuments({
      fileId: file._id,
      isDeleted: false,
    });
    if (existingCount > 0) {
      throw new Error('Installments have already been generated for this file');
    }

    const plan = await InstallmentPlan.findById(file.planId);
    if (!plan || !plan.isActive) {
      throw new Error('Installment plan not found or inactive');
    }

    const plot = await Plot.findById(file.plotId);
    if (!plot || plot.isDeleted) {
      throw new Error('Plot not found');
    }

    const planDetails = await InstallmentPlanDetail.find({
      planId: plan._id,
      isDeleted: false,
    })
      .populate('instCatId', 'instCatName kind')
      .sort({ occurrence: 1 });

    if (planDetails.length === 0) {
      throw new AppError(400, 'Selected installment plan has no configured details');
    }

    // Basis is the file's own contractPrice snapshot (frozen at booking), never
    // the plot's live plotTotalAmount — a later plot-price edit must not change
    // what an already-booked file owes. This is also now the same basis the
    // cron backfill and the atomic booking generator use — one calculator.
    const startDate = file.bookingDate || new Date();
    const { rows, reconciledTotal } = buildInstallmentRows({
      contractPrice: file.contractPrice,
      startDate,
      planDetails,
    });

    if (Math.abs(reconciledTotal - file.contractPrice) > RECONCILIATION_TOLERANCE) {
      throw new AppError(
        400,
        `Plan "${plan.planName}" does not reconcile: down payment + installment rows sum to ` +
          `${reconciledTotal}, but the file's contract price is ${file.contractPrice}. Fix the ` +
          'plan\'s percentages/fixed amounts before generating.'
      );
    }

    const installments = rows.map(row => ({
      ...row,
      fileId: file._id,
      planId: plan._id,
      societyId: file.societyId,
      isDeleted: false,
      createdBy: userId,
    }));

    const createdInstallments = await Installment.insertMany(installments);

    const installmentIds = createdInstallments.map(inst => inst._id);
    const populatedInstallments = await populateFileMemberPlot(
      Installment.find({ _id: { $in: installmentIds } }).populate(
        'installmentCategory',
        'instCatName instCatDescription'
      ),
      { fileSelect: 'fileRegNo' }
    )
      .populate('plan', 'planName')
      .populate('createdBy', 'userName fullName designation')
      .sort({ installmentNo: 1 });

    return populatedInstallments.map(doc => toPlainObject(doc));
  },

  /**
   * Get installment by ID
   */
  async getInstallmentById(id: string): Promise<InstallmentInterface> {
    try {
      const installment = await populateFileMemberPlot(
        Installment.findById(id).populate(
          'installmentCategory',
          'instCatName instCatDescription isRefundable'
        ),
        {
          fileSelect: 'fileRegNo fileBarCode projId plotId contractPrice',
          memberSelect: 'memName memNic fatherName mobileNo email address',
          plotSelect: 'plotNo plotSize blockNo sectorNo',
        }
      )
        .populate('createdBy', 'userName fullName designation')
        .populate('modifiedBy', 'userName fullName designation');

      if (!installment || installment.isDeleted) {
        throw new Error('Installment not found');
      }

      return toPlainObject(installment);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Invalid installment ID');
    }
  },

  /**
   * Get installments grouped by file, paginated by file group (not by row).
   *
   * status/installmentType/paymentMode/fromDate/toDate/overdue filter at the
   * row level (same semantics as getInstallments) - a group is included only
   * if at least one of its rows survives those filters, and only the
   * surviving rows are returned inside that group (non-matching rows in an
   * otherwise-included file are hidden).
   *
   * search matches File.fileRegNo/fileBarCode, Member.memName/memNic,
   * Plot.plotNo, or installmentTitle - matching on ANY of a file's rows (or
   * its file/member/plot identity) qualifies the WHOLE group, not just the
   * matching row, so a file shows all its filter-passing rows regardless of
   * which field the search term actually hit.
   */
  async getGroupedInstallments(params: InstallmentQueryParams): Promise<{
    groups: InstallmentGroup[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }> {
    const {
      page = 1,
      limit = 20,
      installmentCategoryId,
      status,
      installmentType,
      paymentMode,
      fromDate,
      toDate,
      overdue,
      search,
    } = params;

    const skip = (page - 1) * limit;
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // Row-level filters - identical semantics to getInstallments above.
    const matchStage: any = { isDeleted: false };

    if (installmentCategoryId) {
      matchStage.installmentCategoryId = new Types.ObjectId(installmentCategoryId);
    }
    if (status === InstallmentStatus.OVERDUE) {
      matchStage.dueDate = { $lt: startOfToday };
      matchStage.status = { $in: [InstallmentStatus.UNPAID, InstallmentStatus.PARTIALLY_PAID] };
    } else if (status) {
      matchStage.status = status;
    }
    if (installmentType) {
      matchStage.installmentType = installmentType;
    }
    if (paymentMode) {
      matchStage.paymentMode = paymentMode;
    }
    if (fromDate || toDate) {
      matchStage.dueDate = { ...matchStage.dueDate };
      if (fromDate) matchStage.dueDate.$gte = new Date(fromDate);
      if (toDate) matchStage.dueDate.$lte = new Date(toDate);
    }
    if (overdue === true) {
      matchStage.dueDate = { $lt: startOfToday };
      matchStage.status = { $in: [InstallmentStatus.UNPAID, InstallmentStatus.PARTIALLY_PAID] };
    } else if (overdue === false) {
      matchStage.$or = [
        { dueDate: { $gte: startOfToday } },
        { status: { $in: [InstallmentStatus.PAID, InstallmentStatus.CANCELLED] } },
      ];
    }

    const joinStages: any[] = [
      { $lookup: { from: 'files', localField: 'fileId', foreignField: '_id', as: 'file' } },
      { $unwind: '$file' },
      { $lookup: { from: 'members', localField: 'file.memId', foreignField: '_id', as: 'member' } },
      { $unwind: { path: '$member', preserveNullAndEmptyArrays: true } },
      { $lookup: { from: 'plots', localField: 'file.plotId', foreignField: '_id', as: 'plot' } },
      { $unwind: { path: '$plot', preserveNullAndEmptyArrays: true } },
    ];

    // Phase 1: which files qualify (filters + search), sorted and paginated
    // by FILE, not by row.
    const qualifyPipeline: any[] = [{ $match: matchStage }, ...joinStages];

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      qualifyPipeline.push({
        $match: {
          $or: [
            { 'file.fileRegNo': regex },
            { 'file.fileBarCode': regex },
            { 'member.memName': regex },
            { 'member.memNic': regex },
            { 'plot.plotNo': regex },
            { installmentTitle: regex },
          ],
        },
      });
    }

    qualifyPipeline.push({
      $group: { _id: '$fileId', fileRegNo: { $first: '$file.fileRegNo' } },
    });

    const [countResult, pagedFileIdsResult] = await Promise.all([
      Installment.aggregate([...qualifyPipeline, { $count: 'total' }]),
      Installment.aggregate([
        ...qualifyPipeline,
        { $sort: { fileRegNo: 1 } },
        { $skip: skip },
        { $limit: limit },
      ]),
    ]);

    const total = countResult[0]?.total || 0;
    const orderedFileIds: Types.ObjectId[] = pagedFileIdsResult.map((r: any) => r._id);

    if (orderedFileIds.length === 0) {
      return { groups: [], pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
    }

    // Phase 2: fetch every filter-passing row for exactly this page's files
    // (search is deliberately NOT reapplied here - a qualifying file shows
    // all of its filter-passing rows, not just the one that matched search).
    const rows = await populateFileMemberPlot(
      Installment.find({ ...matchStage, fileId: { $in: orderedFileIds } }).populate(
        'installmentCategory',
        'instCatName'
      ),
      { fileSelect: 'fileRegNo fileBarCode', plotSelect: 'plotNo' }
    )
      .sort({ installmentNo: 1 })
      .then(docs => docs.map(doc => toPlainObject(doc)));

    const rowsByFileId = new Map<string, InstallmentInterface[]>();
    for (const row of rows) {
      const fid = String((row as any).fileId?._id ?? (row as any).fileId);
      if (!rowsByFileId.has(fid)) rowsByFileId.set(fid, []);
      rowsByFileId.get(fid)!.push(row);
    }

    const groups: InstallmentGroup[] = orderedFileIds.map(fileObjectId => {
      const fid = String(fileObjectId);
      const fileRows = rowsByFileId.get(fid) || [];
      const first = fileRows[0] as any;
      const file = first?.file || {};
      const member = first?.member || {};
      const plot = first?.plot || {};

      let totalDue = 0;
      let totalPaid = 0;
      let overdueCount = 0;
      let nextDueDate: Date | null = null;
      const statusCounts: Record<string, number> = {
        [InstallmentStatus.PAID]: 0,
        [InstallmentStatus.PARTIALLY_PAID]: 0,
        [InstallmentStatus.UNPAID]: 0,
        [InstallmentStatus.CANCELLED]: 0,
        [InstallmentStatus.REFUNDED]: 0,
      };

      for (const row of fileRows) {
        const r = row as any;
        const isCancelled = r.status === InstallmentStatus.CANCELLED;
        const isRefunded = r.status === InstallmentStatus.REFUNDED;
        if (!isCancelled) {
          totalDue += r.totalPayable ?? 0;
          totalPaid += r.amountPaid ?? 0;
        }

        const isFullyPaid = r.status === InstallmentStatus.PAID;
        const isLiveOverdue =
          !isFullyPaid &&
          !isCancelled &&
          !isRefunded &&
          new Date(r.dueDate) < startOfToday;

        if (isLiveOverdue) {
          overdueCount++;
        }

        if (isFullyPaid) {
          statusCounts[InstallmentStatus.PAID]++;
        } else if (isCancelled) {
          statusCounts[InstallmentStatus.CANCELLED]++;
        } else if (isRefunded) {
          statusCounts[InstallmentStatus.REFUNDED]++;
        } else if (r.status === InstallmentStatus.PARTIALLY_PAID) {
          statusCounts[InstallmentStatus.PARTIALLY_PAID]++;
        } else {
          statusCounts[InstallmentStatus.UNPAID]++;
        }

        if (!isFullyPaid && !isCancelled && !isRefunded) {
          const due = new Date(r.dueDate);
          if (!nextDueDate || due < nextDueDate) {
            nextDueDate = due;
          }
        }
      }

      return {
        fileId: fid,
        fileRegNo: file.fileRegNo ?? null,
        fileBarCode: file.fileBarCode ?? null,
        memberName: member.memName ?? null,
        memberNic: member.memNic ?? null,
        plotNo: plot.plotNo ?? null,
        installmentCount: fileRows.length,
        totalDue: Math.round(totalDue * 100) / 100,
        totalPaid: Math.round(totalPaid * 100) / 100,
        balance: Math.round((totalDue - totalPaid) * 100) / 100,
        statusCounts,
        overdueCount,
        nextDueDate,
        installments: fileRows,
      };
    });

    return {
      groups,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  },

  /**
   * Get all installments with pagination
   */
  async getInstallments(params: InstallmentQueryParams): Promise<{
    installments: InstallmentInterface[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }> {
    const {
      page = 1,
      limit = 20,
      fileId,
      memId,
      plotId,
      installmentCategoryId,
      status,
      installmentType,
      paymentMode,
      fromDate,
      toDate,
      overdue,
      search,
      sortBy = 'dueDate',
      sortOrder = 'asc',
    } = params;

    const skip = (page - 1) * limit;
    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };

    // Build query
    const query: any = { isDeleted: false };

    // memId/plotId no longer live on Installment — resolve to the matching
    // File ids first, then filter the ledger by fileId.
    if (fileId) {
      query.fileId = new Types.ObjectId(fileId);
    } else if (memId || plotId) {
      const fileFilter: any = { isDeleted: false };
      if (memId) fileFilter.memId = new Types.ObjectId(memId);
      if (plotId) fileFilter.plotId = new Types.ObjectId(plotId);
      const matchingFileIds = await File.find(fileFilter).distinct('_id');
      query.fileId = { $in: matchingFileIds };
    }

    if (installmentCategoryId) {
      query.installmentCategoryId = new Types.ObjectId(installmentCategoryId);
    }

    // "Overdue" is a label, not a reliably-updated stored state - the stored
    // status field only flips to Overdue via the daily cron (or the next
    // document .save(), which most update paths don't trigger). Computing it
    // live here means this filter is correct regardless of whether that cron
    // has run recently. Every other status value is a real stored/derived
    // state (Paid/Cancelled/Refunded are explicit; Unpaid/Partially Paid are
    // always kept correct by recordPayment) so those still match directly.
    if (status === InstallmentStatus.OVERDUE) {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      query.dueDate = { $lt: startOfToday };
      query.status = { $in: [InstallmentStatus.UNPAID, InstallmentStatus.PARTIALLY_PAID] };
    } else if (status) {
      query.status = status;
    }

    if (installmentType) {
      query.installmentType = installmentType;
    }

    if (paymentMode) {
      query.paymentMode = paymentMode;
    }

    if (fromDate || toDate) {
      query.dueDate = {};
      if (fromDate) query.dueDate.$gte = new Date(fromDate);
      if (toDate) query.dueDate.$lte = new Date(toDate);
    }

    // Overdue = due strictly before the start of today (a row due today is not
    // overdue), consistent with the isOverdue virtual and dashboard buckets.
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    if (overdue === true) {
      query.dueDate = { $lt: startOfToday };
      query.status = { $in: [InstallmentStatus.UNPAID, InstallmentStatus.PARTIALLY_PAID] };
    } else if (overdue === false) {
      query.$or = [
        { dueDate: { $gte: startOfToday } },
        { status: { $in: [InstallmentStatus.PAID, InstallmentStatus.CANCELLED] } },
      ];
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    const [installments, total] = await Promise.all([
      populateFileMemberPlot(
        Installment.find(query).populate('installmentCategory', 'instCatName'),
        { fileSelect: 'fileRegNo', plotSelect: 'plotNo' }
      )
        .skip(skip)
        .limit(limit)
        .sort(sort)
        .then(docs => docs.map(doc => toPlainObject(doc))),
      Installment.countDocuments(query),
    ]);

    return {
      installments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Update installment
   */
  async updateInstallment(
    id: string,
    data: UpdateInstallmentDto,
    userId: Types.ObjectId
  ): Promise<InstallmentInterface | null> {
    const existingInstallment = await Installment.findById(id);
    if (!existingInstallment || existingInstallment.isDeleted) {
      throw new Error('Installment not found');
    }

    // Prevent updates for paid installments
    if (existingInstallment.status === InstallmentStatus.PAID) {
      const allowedUpdates = ['installmentRemarks', 'transactionRefNo'];
      const updateKeys = Object.keys(data);
      const invalidUpdates = updateKeys.filter(key => !allowedUpdates.includes(key));

      if (invalidUpdates.length > 0) {
        throw new Error(`Cannot update ${invalidUpdates.join(', ')} for a paid installment`);
      }
    }

    // Check for duplicate installment number if being updated (unique per
    // file regardless of category - see createInstallment for why)
    if (data.installmentNo && data.installmentNo !== existingInstallment.installmentNo) {
      const duplicateInstallment = await Installment.findOne({
        _id: { $ne: id },
        fileId: existingInstallment.fileId,
        installmentNo: data.installmentNo,
        isDeleted: false,
      });

      if (duplicateInstallment) {
        throw new AppError(400, `Installment number ${data.installmentNo} already exists for this file`);
      }
    }

    // Strip computed fields - totalPayable, balanceAmount are ALWAYS recalculated by the model,
    // client values (including null) are ignored and unsafe to trust.
    const { totalPayable, balanceAmount, ...safeData } = data as any;

    // amountPaid and paidDate only ever change via recordPayment, which also
    // derives status/balanceAmount from the new amountPaid atomically. A
    // generic update can't do that safely, so reject rather than silently
    // drop the field - the previous behavior (silent strip) let edits to
    // these fields appear to succeed while doing nothing, with no feedback
    // to the caller.
    if ('amountPaid' in data) {
      throw new AppError(400, 'amountPaid cannot be set via update - use Record Payment instead.');
    }
    if ('paidDate' in data) {
      throw new AppError(400, 'paidDate cannot be set via update - use Record Payment instead.');
    }

    const updateObj: any = {
      ...safeData,
      modifiedBy: userId,
    };

    // Paid / Partially Paid / Unpaid / Overdue are DERIVED from amountPaid vs
    // amountDue - they can never be set directly through update (that's how
    // a row could show "Paid" with amountPaid 0, or move money without a
    // payment record). Only the administrative states (Cancelled / Refunded)
    // may be set here; to collect money, callers must use recordPayment.
    const paymentDerivedStatuses: string[] = [
      InstallmentStatus.PAID,
      InstallmentStatus.PARTIALLY_PAID,
      InstallmentStatus.UNPAID,
      InstallmentStatus.OVERDUE,
    ];
    if (data.status !== undefined && paymentDerivedStatuses.includes(data.status)) {
      throw new AppError(
        400,
        `status cannot be set to "${data.status}" via update - it is derived from amountPaid. Use Record Payment instead, or set status to Cancelled/Refunded.`
      );
    }

    // Recalculate totals if amount due or late fee is edited, and re-derive the
    // payment status against the (unchanged) amountPaid so it stays consistent.
    if (data.amountDue !== undefined || data.lateFeeSurcharge !== undefined) {
      const amountDue =
        data.amountDue !== undefined ? data.amountDue : existingInstallment.amountDue;
      const lateFeeSurcharge =
        data.lateFeeSurcharge !== undefined
          ? data.lateFeeSurcharge
          : existingInstallment.lateFeeSurcharge || 0;
      const paid = existingInstallment.amountPaid;

      updateObj.totalPayable = amountDue + lateFeeSurcharge;
      updateObj.balanceAmount = Math.max(0, updateObj.totalPayable - paid);

      if (
        existingInstallment.status !== InstallmentStatus.CANCELLED &&
        existingInstallment.status !== InstallmentStatus.REFUNDED
      ) {
        if (paid >= updateObj.totalPayable) {
          updateObj.status = InstallmentStatus.PAID;
        } else if (paid > 0) {
          updateObj.status = InstallmentStatus.PARTIALLY_PAID;
        } else {
          updateObj.status = InstallmentStatus.UNPAID;
        }
      }
    }

    const installment = await populateFileMemberPlot(
      Installment.findByIdAndUpdate(id, { $set: updateObj }, { new: true, runValidators: true }).populate(
        'installmentCategory',
        'instCatName'
      ),
      { fileSelect: 'fileRegNo', memberSelect: 'memName' }
    ).populate('modifiedBy', 'userName fullName');

    return installment ? toPlainObject(installment) : null;
  },

  /**
   * Delete installment (soft delete)
   */
  async deleteInstallment(id: string, userId: Types.ObjectId): Promise<boolean> {
    const existingInstallment = await Installment.findById(id);
    if (!existingInstallment || existingInstallment.isDeleted) {
      throw new Error('Installment not found');
    }

    // Don't allow deletion of paid installments
    if (existingInstallment.status === InstallmentStatus.PAID) {
      throw new Error('Cannot delete a paid installment');
    }

    const result = await Installment.findByIdAndUpdate(
      id,
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
          status: InstallmentStatus.CANCELLED,
          modifiedBy: userId,
        },
      },
      { new: true }
    );

    return !!result;
  },

  /**
   * Record payment for installment
   */
  async recordPayment(
    id: string,
    data: RecordPaymentDto,
    userId: Types.ObjectId
  ): Promise<InstallmentInterface | null> {
    const installment = await Installment.findById(id);
    if (!installment || installment.isDeleted) {
      throw new Error('Installment not found');
    }

    if (installment.status === InstallmentStatus.PAID) {
      throw new Error('Installment is already fully paid');
    }

    if (installment.status === InstallmentStatus.CANCELLED) {
      throw new Error('Cannot record payment for a cancelled installment');
    }

    const newAmountPaid = installment.amountPaid + data.amountPaid;
    const totalPayable = installment.totalPayable;

    if (newAmountPaid > totalPayable) {
      throw new AppError(
        400,
        `Payment amount exceeds total payable. Maximum payment allowed: ${totalPayable - installment.amountPaid}`
      );
    }

    // fileId is the only link to the paying member - installment itself
    // never stores memId (see createInstallment's comments on why).
    const file = await File.findById(installment.fileId);
    if (!file || file.isDeleted) {
      throw new Error('File not found');
    }

    // paidDate arrives over HTTP/JSON as a string (RecordPaymentDto's `Date`
    // type is a TS-only lie) — coerce once so both the stored field and the
    // remark text below can safely call Date methods on it.
    const paidDate = new Date(data.paidDate);

    const updateObj: any = {
      amountPaid: newAmountPaid,
      balanceAmount: totalPayable - newAmountPaid,
      paidDate,
      paymentMode: data.paymentMode,
      transactionRefNo: data.transactionRefNo,
      modifiedBy: userId,
    };

    // Update status based on payment
    if (newAmountPaid >= totalPayable) {
      updateObj.status = InstallmentStatus.PAID;
      updateObj.balanceAmount = 0;
    } else if (newAmountPaid > 0) {
      updateObj.status = InstallmentStatus.PARTIALLY_PAID;
    }

    // Add payment remarks
    const paymentRemark = `Payment of Rs. ${data.amountPaid} recorded via ${data.paymentMode} on ${paidDate.toLocaleDateString()}${data.transactionRefNo ? ` (Ref: ${data.transactionRefNo})` : ''}${data.remarks ? ` - ${data.remarks}` : ''}`;
    updateObj.installmentRemarks = installment.installmentRemarks
      ? `${installment.installmentRemarks}\n${paymentRemark}`
      : paymentRemark;

    // Balance/status update and the receipt it produces must commit or fail
    // together - a payment that updates the ledger but loses its receipt
    // (or vice versa) is exactly the kind of inconsistency a receipt system
    // exists to prevent.
    await runInTransaction(async session => {
      await Installment.findByIdAndUpdate(id, { $set: updateObj }, { session });

      await paymentService.createReceipt(
        {
          fileId: installment.fileId,
          paidByMemId: file.memId,
          targetType: 'installment',
          targetId: installment._id,
          amount: data.amountPaid,
          paymentDate: paidDate,
          paymentMode: data.paymentMode,
          transactionRefNo: data.transactionRefNo,
          receivedBy: userId,
          remarks: data.remarks,
          societyId: installment.societyId,
        },
        session
      );
    });

    const updatedInstallment = await populateFileMemberPlot(
      Installment.findById(id).populate('installmentCategory', 'instCatName'),
      { fileSelect: 'fileRegNo', memberSelect: 'memName', plotSelect: 'plotNo' }
    );

    return updatedInstallment ? toPlainObject(updatedInstallment) : null;
  },

  /**
   * Get installments by file
   */
  async getInstallmentsByFile(fileId: string): Promise<InstallmentInterface[]> {
    const installments = await Installment.findByFile(fileId);
    return installments.map(doc => toPlainObject(doc));
  },

  /**
   * Get installments by member
   */
  async getInstallmentsByMember(memId: string): Promise<InstallmentInterface[]> {
    const installments = await Installment.findByMember(memId);
    return installments.map(doc => toPlainObject(doc));
  },

  /**
   * Get installments by plot
   */
  async getInstallmentsByPlot(plotId: string): Promise<InstallmentInterface[]> {
    const installments = await Installment.findByPlot(plotId);
    return installments.map(doc => toPlainObject(doc));
  },

  /**
   * Get overdue installments
   */
  async getOverdueInstallments(): Promise<InstallmentInterface[]> {
    const installments = await Installment.findOverdue();
    return installments.map(doc => toPlainObject(doc));
  },

  /**
   * Get installments due today
   */
  async getDueTodayInstallments(): Promise<InstallmentInterface[]> {
    const installments = await Installment.findDueToday();
    return installments.map(doc => toPlainObject(doc));
  },

  /**
   * Get installment summary for member
   */
  async getInstallmentSummary(memId: string): Promise<InstallmentSummary> {
    // memId lives on File now, not Installment — resolve the member's File
    // ids once and reuse across every pipeline below.
    const fileIds = await File.find({ memId: new Types.ObjectId(memId) }).distinct('_id');
    const matchStage = { fileId: { $in: fileIds }, isDeleted: false };

    const [summaryStats, statusStats, categoryStats, monthlyStats] = await Promise.all([
      Installment.aggregate([
        {
          $match: matchStage,
        },
        {
          $group: {
            _id: null,
            totalInstallments: { $sum: 1 },
            totalAmountDue: { $sum: '$amountDue' },
            totalAmountPaid: { $sum: '$amountPaid' },
            totalBalance: { $sum: '$balanceAmount' },
            totalLateFee: { $sum: '$lateFeeSurcharge' },
            paidInstallments: {
              $sum: { $cond: [{ $eq: ['$status', InstallmentStatus.PAID] }, 1, 0] },
            },
            unpaidInstallments: {
              $sum: { $cond: [{ $eq: ['$status', InstallmentStatus.UNPAID] }, 1, 0] },
            },
            overdueInstallments: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $lt: ['$dueDate', new Date()] },
                      { $ne: ['$status', InstallmentStatus.PAID] },
                      { $ne: ['$status', InstallmentStatus.CANCELLED] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            partiallyPaidInstallments: {
              $sum: { $cond: [{ $eq: ['$status', InstallmentStatus.PARTIALLY_PAID] }, 1, 0] },
            },
          },
        },
      ]),
      Installment.aggregate([
        {
          $match: matchStage,
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            amount: { $sum: '$amountDue' },
            paid: { $sum: '$amountPaid' },
            balance: { $sum: '$balanceAmount' },
          },
        },
      ]),
      Installment.aggregate([
        {
          $match: matchStage,
        },
        {
          $lookup: {
            from: 'installmentcategories',
            localField: 'installmentCategoryId',
            foreignField: '_id',
            as: 'installmentCategory',
          },
        },
        {
          $unwind: '$installmentCategory',
        },
        {
          $group: {
            _id: '$installmentCategory.instCatName',
            count: { $sum: 1 },
            amount: { $sum: '$amountDue' },
            paid: { $sum: '$amountPaid' },
          },
        },
      ]),
      Installment.aggregate([
        {
          $match: matchStage,
        },
        {
          $group: {
            _id: {
              year: { $year: '$dueDate' },
              month: { $month: '$dueDate' },
            },
            count: { $sum: 1 },
            amount: { $sum: '$amountDue' },
          },
        },
        {
          $sort: { '_id.year': -1, '_id.month': -1 },
        },
        {
          $limit: 12,
        },
      ]),
    ]);

    const baseStats = summaryStats[0] || {
      totalInstallments: 0,
      totalAmountDue: 0,
      totalAmountPaid: 0,
      totalBalance: 0,
      totalLateFee: 0,
      paidInstallments: 0,
      unpaidInstallments: 0,
      overdueInstallments: 0,
      partiallyPaidInstallments: 0,
    };

    const byStatus: Record<
      string,
      { count: number; amount: number; paid: number; balance: number }
    > = {};
    statusStats.forEach(stat => {
      byStatus[stat._id] = {
        count: stat.count,
        amount: stat.amount,
        paid: stat.paid,
        balance: stat.balance,
      };
    });

    const byCategory: Record<string, { count: number; amount: number; paid: number }> = {};
    categoryStats.forEach(stat => {
      byCategory[stat._id] = {
        count: stat.count,
        amount: stat.amount,
        paid: stat.paid,
      };
    });

    const byMonth: Record<string, number> = {};
    monthlyStats.forEach(stat => {
      const monthNames = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      const key = `${monthNames[stat._id.month - 1]} ${stat._id.year}`;
      byMonth[key] = stat.amount;
    });

    return {
      ...baseStats,
      byStatus,
      byCategory,
      byMonth,
    };
  },

  /**
   * Get installment dashboard summary
   */
  async getDashboardSummary(): Promise<InstallmentDashboardSummary> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      outstandingStats,
      paidTodayStats,
      dueTodayStats,
      overdueStats,
      recentPayments,
      upcomingDue,
    ] = await Promise.all([
      // Outstanding must be computed live from totalPayable - amountPaid, not
      // summed from the stored balanceAmount field. balanceAmount is only
      // ever written by the pre('save') hook; any row created through a
      // path that bypasses it (e.g. insertMany, which only runs pre('validate'))
      // is left at its schema default of 0 while still carrying a real
      // amountDue/totalPayable - silently dropping it out of this total.
      // Matching ledger facts (status $nin Cancelled/Refunded + amountPaid <
      // totalPayable) instead of trusting the stored status string also
      // avoids the same staleness the Overdue list filter already moved
      // away from (see list filter note elsewhere in this file).
      Installment.aggregate([
        {
          $match: {
            isDeleted: false,
            status: { $nin: [InstallmentStatus.CANCELLED, InstallmentStatus.REFUNDED] },
            $expr: { $lt: ['$amountPaid', '$totalPayable'] },
          },
        },
        {
          $group: {
            _id: null,
            totalOutstanding: { $sum: { $subtract: ['$totalPayable', '$amountPaid'] } },
          },
        },
      ]),
      Installment.aggregate([
        {
          $match: {
            isDeleted: false,
            status: InstallmentStatus.PAID,
            paidDate: { $gte: today, $lt: tomorrow },
          },
        },
        {
          $group: {
            _id: null,
            totalPaid: { $sum: '$amountPaid' },
          },
        },
      ]),
      Installment.aggregate([
        {
          $match: {
            isDeleted: false,
            dueDate: { $gte: today, $lt: tomorrow },
            status: { $in: [InstallmentStatus.UNPAID, InstallmentStatus.PARTIALLY_PAID] },
          },
        },
        {
          $group: {
            _id: null,
            totalDue: { $sum: '$totalPayable' },
          },
        },
      ]),
      // Same fix as totalOutstanding above: compute live, don't trust the
      // stored balanceAmount field.
      Installment.aggregate([
        {
          $match: {
            isDeleted: false,
            dueDate: { $lt: today },
            status: { $nin: [InstallmentStatus.CANCELLED, InstallmentStatus.REFUNDED] },
            $expr: { $lt: ['$amountPaid', '$totalPayable'] },
          },
        },
        {
          $group: {
            _id: null,
            totalOverdue: { $sum: { $subtract: ['$totalPayable', '$amountPaid'] } },
          },
        },
      ]),
      populateFileMemberPlot(
        Installment.find({
          isDeleted: false,
          status: InstallmentStatus.PAID,
        }).populate('installmentCategory', 'instCatName'),
        { fileSelect: 'fileRegNo', memberSelect: 'memName' }
      )
        .sort({ paidDate: -1 })
        .limit(10)
        .then(docs => docs.map(doc => toPlainObject(doc))),
      populateFileMemberPlot(
        Installment.find({
          isDeleted: false,
          dueDate: { $gte: today },
          status: { $in: [InstallmentStatus.UNPAID, InstallmentStatus.PARTIALLY_PAID] },
        }).populate('installmentCategory', 'instCatName'),
        { fileSelect: 'fileRegNo', memberSelect: 'memName' }
      )
        .sort({ dueDate: 1 })
        .limit(10)
        .then(docs => docs.map(doc => toPlainObject(doc))),
    ]);

    // Get top payers — memId lives on File now, so this needs a two-stage
    // lookup (installment -> file -> member) instead of a direct one.
    const topPayers = await Installment.aggregate([
      {
        $match: {
          isDeleted: false,
          status: InstallmentStatus.PAID,
        },
      },
      {
        $lookup: {
          from: 'files',
          localField: 'fileId',
          foreignField: '_id',
          as: 'file',
        },
      },
      {
        $unwind: '$file',
      },
      {
        $lookup: {
          from: 'members',
          localField: 'file.memId',
          foreignField: '_id',
          as: 'member',
        },
      },
      {
        $unwind: '$member',
      },
      {
        $group: {
          _id: '$file.memId',
          memberName: { $first: '$member.memName' },
          totalPaid: { $sum: '$amountPaid' },
          totalDue: { $sum: '$amountDue' },
        },
      },
      {
        $sort: { totalPaid: -1 },
      },
      {
        $limit: 5,
      },
    ]);

    return {
      totalOutstanding: outstandingStats[0]?.totalOutstanding || 0,
      totalPaidToday: paidTodayStats[0]?.totalPaid || 0,
      totalDueToday: dueTodayStats[0]?.totalDue || 0,
      totalOverdue: overdueStats[0]?.totalOverdue || 0,
      recentPayments,
      upcomingDue,
      topPayers: topPayers.map(payer => ({
        memId: payer._id,
        memberName: payer.memberName,
        totalPaid: payer.totalPaid,
        totalDue: payer.totalDue,
      })),
    };
  },

  /**
   * Generate installment report
   */
  async generateReport(params: InstallmentReportParams): Promise<InstallmentReport> {
    const {
      startDate,
      endDate,
      fileId,
      memId,
      plotId,
      installmentCategoryId,
      status,
      installmentType,
    } = params;

    // Build query
    const matchQuery: any = {
      isDeleted: false,
      dueDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
    };

    // memId/plotId no longer live on Installment — resolve to matching File
    // ids first, same pattern as getInstallments.
    if (fileId) {
      matchQuery.fileId = new Types.ObjectId(fileId);
    } else if (memId || plotId) {
      const fileFilter: any = { isDeleted: false };
      if (memId) fileFilter.memId = new Types.ObjectId(memId);
      if (plotId) fileFilter.plotId = new Types.ObjectId(plotId);
      const matchingFileIds = await File.find(fileFilter).distinct('_id');
      matchQuery.fileId = { $in: matchingFileIds };
    }
    if (installmentCategoryId)
      matchQuery.installmentCategoryId = new Types.ObjectId(installmentCategoryId);
    if (status) matchQuery.status = status;
    if (installmentType) matchQuery.installmentType = installmentType;

    const [summary, data, byDate, byCategory, byStatus] = await Promise.all([
      Installment.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            totalRecords: { $sum: 1 },
            totalAmountDue: { $sum: '$amountDue' },
            totalAmountPaid: { $sum: '$amountPaid' },
            totalBalance: { $sum: '$balanceAmount' },
            totalLateFee: { $sum: '$lateFeeSurcharge' },
          },
        },
      ]),
      populateFileMemberPlot(
        Installment.find(matchQuery).populate('installmentCategory', 'instCatName'),
        { fileSelect: 'fileRegNo', plotSelect: 'plotNo' }
      )
        .sort({ dueDate: 1 })
        .then(docs => docs.map(doc => toPlainObject(doc))),
      Installment.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$dueDate' } },
            amount: { $sum: '$amountDue' },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Installment.aggregate([
        { $match: matchQuery },
        {
          $lookup: {
            from: 'installmentcategories',
            localField: 'installmentCategoryId',
            foreignField: '_id',
            as: 'installmentCategory',
          },
        },
        { $unwind: '$installmentCategory' },
        {
          $group: {
            _id: '$installmentCategory.instCatName',
            amount: { $sum: '$amountDue' },
            count: { $sum: 1 },
          },
        },
        { $sort: { amount: -1 } },
      ]),
      Installment.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$status',
            amount: { $sum: '$amountDue' },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),
    ]);

    const summaryData = summary[0] || {
      totalRecords: 0,
      totalAmountDue: 0,
      totalAmountPaid: 0,
      totalBalance: 0,
      totalLateFee: 0,
    };

    return {
      summary: summaryData,
      data,
      byDate: byDate.map(item => ({
        date: item._id,
        amount: item.amount,
        count: item.count,
      })),
      byCategory: byCategory.map(item => ({
        category: item._id,
        amount: item.amount,
        count: item.count,
      })),
      byStatus: byStatus.map(item => ({
        status: item._id,
        amount: item.amount,
        count: item.count,
      })),
    };
  },

  /**
   * Get next due installment for member
   */
  async getNextDueInstallment(memId: string): Promise<InstallmentInterface | null> {
    const installment = await Installment.findNextDue(memId);
    return installment ? toPlainObject(installment) : null;
  },

  /**
   * Search installments
   */
  async searchInstallments(
    searchTerm: string,
    limit: number = 10
  ): Promise<InstallmentInterface[]> {
    const installments = await populateFileMemberPlot(
      Installment.find({
        $text: { $search: searchTerm },
        isDeleted: false,
      }).populate('installmentCategory', 'instCatName'),
      { fileSelect: 'fileRegNo' }
    )
      .limit(limit)
      .sort({ score: { $meta: 'textScore' } })
      .then(docs => docs.map(doc => toPlainObject(doc)));

    return installments;
  },

  /**
   * Bulk update installment status
   */
  async bulkUpdateStatus(
    installmentIds: string[],
    status: InstallmentStatus,
    userId: Types.ObjectId
  ): Promise<{ matched: number; modified: number }> {
    // Paid / Partially Paid / Unpaid / Overdue are derived from amountPaid and
    // must never be bulk-set (the old behaviour set status=Paid with
    // amountPaid untouched, producing "Paid but Rs 0" rows). Collecting money
    // is per-row via recordPayment. Only administrative states are allowed here.
    const allowedBulkStatuses: string[] = [
      InstallmentStatus.CANCELLED,
      InstallmentStatus.REFUNDED,
    ];
    if (!allowedBulkStatuses.includes(status)) {
      throw new Error(
        `Bulk status change to "${status}" is not allowed. Paid/Partial/Unpaid are ` +
          'derived from recorded payments — use Record Payment on each installment instead. ' +
          'Bulk updates may only set Cancelled or Refunded.'
      );
    }

    const objectIds = installmentIds.map(id => {
      try {
        return new Types.ObjectId(id);
      } catch (error) {
        throw new Error(`Invalid installment ID: ${id}`);
      }
    });

    const updateObj: any = {
      status,
      modifiedBy: userId,
    };

    // Set cancellation reason if status is CANCELLED
    if (status === InstallmentStatus.CANCELLED) {
      updateObj.installmentRemarks = 'Bulk cancelled by admin';
    }

    const result = await Installment.updateMany(
      {
        _id: { $in: objectIds },
        isDeleted: false,
      },
      {
        $set: updateObj,
      }
    );

    return {
      matched: result.matchedCount,
      modified: result.modifiedCount,
    };
  },

  /**
   * Validate installment payment
   */
  async validatePayment(
    installmentId: string,
    paymentAmount: number
  ): Promise<{
    isValid: boolean;
    message?: string;
    installment?: InstallmentInterface;
    maxPaymentAllowed?: number;
  }> {
    const installment = await Installment.findById(installmentId);
    if (!installment || installment.isDeleted) {
      throw new Error('Installment not found');
    }

    if (installment.status === InstallmentStatus.PAID) {
      return {
        isValid: false,
        message: 'Installment is already fully paid',
        installment: toPlainObject(installment),
      };
    }

    if (installment.status === InstallmentStatus.CANCELLED) {
      return {
        isValid: false,
        message: 'Cannot process payment for cancelled installment',
        installment: toPlainObject(installment),
      };
    }

    const maxPaymentAllowed = installment.totalPayable - installment.amountPaid;

    if (paymentAmount > maxPaymentAllowed) {
      return {
        isValid: false,
        message: `Payment amount exceeds maximum allowed. Maximum: Rs. ${maxPaymentAllowed}`,
        installment: toPlainObject(installment),
        maxPaymentAllowed,
      };
    }

    return {
      isValid: true,
      installment: toPlainObject(installment),
      maxPaymentAllowed,
    };
  },
};
