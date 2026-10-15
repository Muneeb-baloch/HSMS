import { Types } from 'mongoose';
import BillInfo, { BillStatus } from '../../BillI/models/models-bill-info';
import File, { FileStatus } from '../../File/models/models-file';
import Installment, { InstallmentStatus } from '../../Installment/models/models-installment';
import Society from '../../Society/models/models-society';
import DefaulterWorkflow, { DefaulterStatus } from '../models/models-defaulter-workflow';
import {
  DefaulterQueryParams,
  DefaulterRow,
  DefaulterStatistics,
  SendNoticeDto,
} from '../types/types-defaulter';

const DEFAULT_THRESHOLD_DAYS = 30;

type LedgerStat = {
  oldestUnpaidDueDate: Date;
  overdueAmount: number;
};

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Aggregates "still owed" rows (amountPaid < totalPayable, not cancelled)
 * from a model, grouped by fileId. Used identically for Installment and
 * BillInfo - see computeDefaulterRows for why amountPaid/totalPayable are
 * used instead of matching specific status strings (status is cheap to let
 * go stale, see Item 5; the two amount fields are always kept correct by
 * recordPayment regardless of status).
 */
async function aggregateLedgerStats(
  model: any,
  excludedStatuses: string[],
  extraMatch: Record<string, any>,
  today: Date
): Promise<Map<string, LedgerStat>> {
  const rows = await model.aggregate([
    {
      $match: {
        isDeleted: false,
        status: { $nin: excludedStatuses },
        $expr: { $lt: ['$amountPaid', '$totalPayable'] },
        ...extraMatch,
      },
    },
    {
      $group: {
        _id: '$fileId',
        oldestUnpaidDueDate: { $min: '$dueDate' },
        overdueAmount: {
          $sum: {
            $cond: [
              { $lt: ['$dueDate', today] },
              { $subtract: ['$totalPayable', '$amountPaid'] },
              0,
            ],
          },
        },
      },
    },
  ]);

  return new Map(rows.map((r: any) => [String(r._id), { oldestUnpaidDueDate: r.oldestUnpaidDueDate, overdueAmount: r.overdueAmount }]));
}

function suggestStatus(daysOverdue: number): DefaulterStatus {
  if (daysOverdue >= 180) return DefaulterStatus.LEGAL_ACTION;
  if (daysOverdue >= 90) return DefaulterStatus.SUSPENDED;
  return DefaulterStatus.WARNING;
}

/**
 * Computes the full, unpaginated, ledger-derived defaulter list: every File
 * whose oldest unpaid installment/bill due date is at least the owning
 * society's defaulterThresholdDays in the past. Nothing here is read from a
 * stored "defaulter" record - amounts, days overdue, and admission onto the
 * list are all computed fresh from Installment/BillInfo every call. The only
 * persisted state merged in is DefaulterWorkflow (staff override/notices/
 * remarks), which doesn't affect whether a file qualifies.
 *
 * Also lazily auto-resolves: any DefaulterWorkflow without resolvedAt whose
 * file's totalOverdue has reached 0 gets resolvedAt stamped here. This is
 * the mechanism behind "drops off the list automatically" - the file simply
 * stops appearing in the computed rows below once overdue hits 0, and this
 * stamps the history record saying so.
 */
async function computeDefaulterRows(): Promise<DefaulterRow[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [instStats, billStats] = await Promise.all([
    aggregateLedgerStats(
      Installment,
      [InstallmentStatus.CANCELLED, InstallmentStatus.REFUNDED],
      {},
      today
    ),
    aggregateLedgerStats(BillInfo, [BillStatus.CANCELLED], { isActive: true }, today),
  ]);

  const fileIds = new Set([...instStats.keys(), ...billStats.keys()]);
  if (fileIds.size === 0) {
    await reconcileResolvedWorkflows(new Map());
    return [];
  }

  const objectIds = [...fileIds].map(id => new Types.ObjectId(id));
  const files = await File.find({
    _id: { $in: objectIds },
    isDeleted: false,
    status: { $in: [FileStatus.ACTIVE, FileStatus.PENDING] },
  })
    .populate('memId', 'memName fullName memNic mobileNo')
    .populate({ path: 'plotId', select: 'plotNo plotBlockId', populate: { path: 'plotBlockId', select: 'plotBlockName' } })
    .lean();

  const societyIds = [...new Set(files.map(f => String(f.societyId)))].map(
    id => new Types.ObjectId(id)
  );
  const societies = await Society.find({ _id: { $in: societyIds } })
    .select('settings.defaulterThresholdDays')
    .lean();
  const thresholdBySociety = new Map(
    societies.map(s => [String(s._id), s.settings?.defaulterThresholdDays ?? DEFAULT_THRESHOLD_DAYS])
  );

  const workflows = await DefaulterWorkflow.find({ fileId: { $in: objectIds } }).lean();
  const workflowByFileId = new Map(workflows.map(w => [String(w.fileId), w]));

  // Merge per-file stats once so both row-building and the auto-resolve pass
  // below use the exact same totals.
  const mergedByFileId = new Map<
    string,
    { oldestUnpaidDueDate: Date; installmentsOverdue: number; billsOverdue: number }
  >();
  for (const fileId of fileIds) {
    const inst = instStats.get(fileId);
    const bill = billStats.get(fileId);
    const candidates = [inst?.oldestUnpaidDueDate, bill?.oldestUnpaidDueDate].filter(
      (d): d is Date => !!d
    );
    if (candidates.length === 0) continue;
    mergedByFileId.set(fileId, {
      oldestUnpaidDueDate: new Date(Math.min(...candidates.map(d => d.getTime()))),
      installmentsOverdue: inst?.overdueAmount ?? 0,
      billsOverdue: bill?.overdueAmount ?? 0,
    });
  }

  await reconcileResolvedWorkflows(mergedByFileId);

  const rows: DefaulterRow[] = [];
  for (const file of files) {
    const stats = mergedByFileId.get(String(file._id));
    if (!stats) continue;

    const threshold =
      thresholdBySociety.get(String(file.societyId)) ?? DEFAULT_THRESHOLD_DAYS;
    const daysOverdue = Math.max(
      0,
      Math.floor((today.getTime() - stats.oldestUnpaidDueDate.getTime()) / (1000 * 60 * 60 * 24))
    );
    if (daysOverdue < threshold) continue;

    const installmentsOverdue = round2(stats.installmentsOverdue);
    const billsOverdue = round2(stats.billsOverdue);
    const totalOverdue = round2(installmentsOverdue + billsOverdue);
    if (totalOverdue <= 0) continue;

    const workflow = workflowByFileId.get(String(file._id));
    const suggestedStatus = suggestStatus(daysOverdue);
    const statusOverride = workflow?.statusOverride as DefaulterStatus | undefined;

    rows.push({
      fileId: file._id as Types.ObjectId,
      file: { _id: file._id, fileRegNo: (file as any).fileRegNo, fileBarCode: (file as any).fileBarCode },
      member: (file as any).memId,
      plot: (file as any).plotId,
      daysOverdue,
      oldestUnpaidDueDate: stats.oldestUnpaidDueDate,
      installmentsOverdue,
      billsOverdue,
      totalOverdue,
      suggestedStatus,
      statusOverride,
      actualStatus: statusOverride ?? suggestedStatus,
      noticeSentCount: workflow?.noticeSentCount ?? 0,
      remarks: workflow?.remarks,
      workflowId: workflow?._id as Types.ObjectId | undefined,
    });
  }

  return rows;
}

/**
 * Stamps resolvedAt on any DefaulterWorkflow that doesn't have it yet but
 * whose file no longer owes anything (not in currentOwedByFileId, or owes
 * <= 0). Runs as a side effect of every list/stats read - see
 * computeDefaulterRows's docstring.
 */
async function reconcileResolvedWorkflows(
  currentOwedByFileId: Map<string, { installmentsOverdue: number; billsOverdue: number }>
): Promise<void> {
  const unresolved = await DefaulterWorkflow.find({ resolvedAt: { $exists: false } })
    .select('_id fileId')
    .lean();
  if (unresolved.length === 0) return;

  const toResolve = unresolved
    .filter(w => {
      const owed = currentOwedByFileId.get(String(w.fileId));
      const total = (owed?.installmentsOverdue ?? 0) + (owed?.billsOverdue ?? 0);
      return total <= 0;
    })
    .map(w => w._id);

  if (toResolve.length > 0) {
    await DefaulterWorkflow.updateMany(
      { _id: { $in: toResolve } },
      { $set: { resolvedAt: new Date() } }
    );
  }
}

function applyFilters(rows: DefaulterRow[], params: DefaulterQueryParams): DefaulterRow[] {
  let filtered = rows;

  if (params.status) {
    filtered = filtered.filter(r => r.actualStatus === params.status);
  }
  if (params.minAmount !== undefined) {
    filtered = filtered.filter(r => r.totalOverdue >= params.minAmount!);
  }
  if (params.maxAmount !== undefined) {
    filtered = filtered.filter(r => r.totalOverdue <= params.maxAmount!);
  }
  if (params.minDays !== undefined) {
    filtered = filtered.filter(r => r.daysOverdue >= params.minDays!);
  }
  if (params.maxDays !== undefined) {
    filtered = filtered.filter(r => r.daysOverdue <= params.maxDays!);
  }
  if (params.search && params.search.trim()) {
    const term = params.search.trim().toLowerCase();
    filtered = filtered.filter(r => {
      const memberName = (r.member?.memName || r.member?.fullName || '').toLowerCase();
      const memberNic = (r.member?.memNic || '').toLowerCase();
      const plotNo = (r.plot?.plotNo || '').toLowerCase();
      const fileRegNo = (r.file?.fileRegNo || '').toLowerCase();
      return (
        memberName.includes(term) ||
        memberNic.includes(term) ||
        plotNo.includes(term) ||
        fileRegNo.includes(term)
      );
    });
  }

  const sortBy = params.sortBy || 'daysOverdue';
  const sortOrder = params.sortOrder === 'asc' ? 1 : -1;
  filtered = [...filtered].sort((a, b) => (a[sortBy] - b[sortBy]) * sortOrder);

  return filtered;
}

export const defaulterService = {
  /**
   * Get paginated, filtered, ledger-derived defaulter list.
   */
  async getDefaulters(params: DefaulterQueryParams): Promise<{
    defaulters: DefaulterRow[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }> {
    const page = params.page || 1;
    const limit = params.limit || 20;

    const allRows = await computeDefaulterRows();
    const filtered = applyFilters(allRows, params);

    const total = filtered.length;
    const start = (page - 1) * limit;
    const defaulters = filtered.slice(start, start + limit);

    return {
      defaulters,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  },

  /**
   * Get a single file's defaulter row. Throws if the file isn't currently a
   * defaulter (e.g. already resolved, or never was one).
   */
  async getDefaulterByFileId(fileId: string): Promise<DefaulterRow> {
    const rows = await computeDefaulterRows();
    const row = rows.find(r => String(r.fileId) === fileId);
    if (!row) {
      throw new Error('File is not currently a defaulter');
    }
    return row;
  },

  /**
   * Set (or clear, with status: null) the staff status override for a file.
   */
  async setStatusOverride(
    fileId: string,
    status: DefaulterStatus | null,
    userId: Types.ObjectId
  ): Promise<DefaulterRow> {
    const file = await File.findById(fileId);
    if (!file || file.isDeleted) {
      throw new Error('File not found');
    }

    await DefaulterWorkflow.findOneAndUpdate(
      { fileId: new Types.ObjectId(fileId) },
      {
        $set: {
          statusOverride: status ?? undefined,
          societyId: file.societyId,
          modifiedBy: userId,
        },
        $unset: status ? {} : { statusOverride: '' },
        $setOnInsert: { createdBy: userId, noticeSentCount: 0 },
      },
      { upsert: true, new: true, runValidators: true }
    );

    return this.getDefaulterByFileId(fileId);
  },

  /**
   * Set remarks for a file's defaulter workflow.
   */
  async setRemarks(fileId: string, remarks: string, userId: Types.ObjectId): Promise<DefaulterRow> {
    const file = await File.findById(fileId);
    if (!file || file.isDeleted) {
      throw new Error('File not found');
    }

    await DefaulterWorkflow.findOneAndUpdate(
      { fileId: new Types.ObjectId(fileId) },
      {
        $set: { remarks, societyId: file.societyId, modifiedBy: userId },
        $setOnInsert: { createdBy: userId, noticeSentCount: 0 },
      },
      { upsert: true, new: true, runValidators: true }
    );

    return this.getDefaulterByFileId(fileId);
  },

  /**
   * Record that a notice was sent, incrementing noticeSentCount. FINAL/LEGAL
   * notices also bump the status override, same as the old sendNotice did.
   */
  async sendNotice(
    fileId: string,
    data: SendNoticeDto,
    userId: Types.ObjectId
  ): Promise<DefaulterRow> {
    const file = await File.findById(fileId);
    if (!file || file.isDeleted) {
      throw new Error('File not found');
    }

    const existing = await DefaulterWorkflow.findOne({ fileId: new Types.ObjectId(fileId) });
    const newCount = (existing?.noticeSentCount ?? 0) + 1;

    const setObj: any = {
      noticeSentCount: newCount,
      societyId: file.societyId,
      modifiedBy: userId,
    };
    if (data.noticeType === 'FINAL' && newCount >= 2) {
      setObj.statusOverride = DefaulterStatus.SUSPENDED;
    } else if (data.noticeType === 'LEGAL') {
      setObj.statusOverride = DefaulterStatus.LEGAL_ACTION;
    }

    await DefaulterWorkflow.findOneAndUpdate(
      { fileId: new Types.ObjectId(fileId) },
      { $set: setObj, $setOnInsert: { createdBy: userId } },
      { upsert: true, new: true, runValidators: true }
    );

    return this.getDefaulterByFileId(fileId);
  },

  /**
   * Aggregate statistics over the live defaulter list.
   */
  async getDefaulterStatistics(): Promise<DefaulterStatistics> {
    const rows = await computeDefaulterRows();

    const byStatus: Record<string, number> = {};
    let totalOverdueAmount = 0;
    let totalInstallmentsOverdue = 0;
    let totalBillsOverdue = 0;
    let totalDays = 0;

    for (const row of rows) {
      byStatus[row.actualStatus] = (byStatus[row.actualStatus] || 0) + 1;
      totalOverdueAmount += row.totalOverdue;
      totalInstallmentsOverdue += row.installmentsOverdue;
      totalBillsOverdue += row.billsOverdue;
      totalDays += row.daysOverdue;
    }

    const topDefaulters = [...rows]
      .sort((a, b) => b.totalOverdue - a.totalOverdue)
      .slice(0, 10)
      .map(r => ({
        fileId: r.fileId,
        fileRegNo: r.file?.fileRegNo,
        memberName: r.member?.memName || r.member?.fullName,
        totalOverdue: r.totalOverdue,
        daysOverdue: r.daysOverdue,
      }));

    return {
      totalDefaulters: rows.length,
      byStatus,
      totalOverdueAmount: round2(totalOverdueAmount),
      totalInstallmentsOverdue: round2(totalInstallmentsOverdue),
      totalBillsOverdue: round2(totalBillsOverdue),
      averageOverdueAmount: rows.length ? round2(totalOverdueAmount / rows.length) : 0,
      averageDaysOverdue: rows.length ? Math.round(totalDays / rows.length) : 0,
      topDefaulters,
    };
  },
};
