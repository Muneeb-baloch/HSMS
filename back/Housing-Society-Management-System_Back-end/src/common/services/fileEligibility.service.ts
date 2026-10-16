import { Types } from 'mongoose';
import BillInfo, { BillStatus } from '../../BillI/models/models-bill-info';
import { FileStatus } from '../../File/models/models-file';
import Installment, { InstallmentStatus } from '../../Installment/models/models-installment';
import Possession, { PossessionStatus } from '../../Possession/models/models-possession';
import SrTransfer, { TransferStatus } from '../../Transfer/models/models-transfer';

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Sum of unpaid Installment/BillInfo rows whose dueDate has already passed,
 * for one file. Independent of Society.settings.defaulterThresholdDays -
 * that threshold only gates the defaulter *list* (see service-defaulter.ts);
 * an NDC check cares about any overdue amount, however small or recent.
 */
export async function getOverdueDuesForFile(fileId: string | Types.ObjectId): Promise<number> {
  const id = new Types.ObjectId(fileId);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [instRows, billRows] = await Promise.all([
    Installment.aggregate([
      {
        $match: {
          fileId: id,
          isDeleted: false,
          status: { $nin: [InstallmentStatus.CANCELLED, InstallmentStatus.REFUNDED] },
          dueDate: { $lt: today },
          $expr: { $lt: ['$amountPaid', '$totalPayable'] },
        },
      },
      {
        $group: { _id: null, overdue: { $sum: { $subtract: ['$totalPayable', '$amountPaid'] } } },
      },
    ]),
    BillInfo.aggregate([
      {
        $match: {
          fileId: id,
          isDeleted: false,
          status: { $ne: BillStatus.CANCELLED },
          dueDate: { $lt: today },
          $expr: { $lt: ['$amountPaid', '$totalPayable'] },
        },
      },
      {
        $group: { _id: null, overdue: { $sum: { $subtract: ['$totalPayable', '$amountPaid'] } } },
      },
    ]),
  ]);

  return round2((instRows[0]?.overdue ?? 0) + (billRows[0]?.overdue ?? 0));
}

/**
 * All-in outstanding balance for one file across Installment + BillInfo,
 * regardless of due date - backs the Possession "fully paid" gate ("Total
 * Outstanding = 0: all installments, fees and bills"). This is deliberately
 * NOT the same figure as File.totalOutstanding from service-file.ts's
 * attachFinancials (which is Installment-only) - possession requires
 * utility/bill balances cleared too, not just the plot ledger.
 */
export async function getTotalOutstandingForFile(fileId: string | Types.ObjectId): Promise<number> {
  const id = new Types.ObjectId(fileId);

  const [instRows, billRows] = await Promise.all([
    Installment.aggregate([
      { $match: { fileId: id, isDeleted: false, status: { $ne: InstallmentStatus.CANCELLED } } },
      {
        $group: {
          _id: null,
          outstanding: {
            $sum: { $subtract: [{ $add: ['$amountDue', '$lateFeeSurcharge'] }, '$amountPaid'] },
          },
        },
      },
    ]),
    BillInfo.aggregate([
      { $match: { fileId: id, isDeleted: false, status: { $ne: BillStatus.CANCELLED } } },
      {
        $group: {
          _id: null,
          outstanding: { $sum: { $subtract: ['$totalPayable', '$amountPaid'] } },
        },
      },
    ]),
  ]);

  return round2((instRows[0]?.outstanding ?? 0) + (billRows[0]?.outstanding ?? 0));
}

/** File statuses that block starting/completing a Transfer or Possession. */
export const LIFECYCLE_BLOCKING_FILE_STATUSES: string[] = [
  FileStatus.CANCELLED,
  FileStatus.SUSPENDED,
  FileStatus.DISPUTED,
];

export function isFileStatusBlocked(status: string): boolean {
  return LIFECYCLE_BLOCKING_FILE_STATUSES.includes(status);
}

const ACTIVE_POSSESSION_STATUSES: string[] = Object.values(PossessionStatus).filter(
  s => s !== PossessionStatus.CANCELLED && s !== PossessionStatus.HANDED_OVER
);

/** True if the file has a Possession request that hasn't been cancelled or fully handed over. */
export async function hasActivePossession(fileId: string | Types.ObjectId): Promise<boolean> {
  const count = await Possession.countDocuments({
    fileId: new Types.ObjectId(fileId),
    isDeleted: false,
    possessionStatus: { $in: ACTIVE_POSSESSION_STATUSES },
  });
  return count > 0;
}

const NON_TERMINAL_TRANSFER_STATUSES: string[] = Object.values(TransferStatus).filter(
  s => s !== TransferStatus.COMPLETED && s !== TransferStatus.CANCELLED && s !== TransferStatus.REJECTED
);

/** True if the file has a Transfer request that hasn't completed, been cancelled, or been rejected. */
export async function hasPendingTransfer(fileId: string | Types.ObjectId): Promise<boolean> {
  const count = await SrTransfer.countDocuments({
    fileId: new Types.ObjectId(fileId),
    isDeleted: false,
    status: { $in: NON_TERMINAL_TRANSFER_STATUSES },
  });
  return count > 0;
}
