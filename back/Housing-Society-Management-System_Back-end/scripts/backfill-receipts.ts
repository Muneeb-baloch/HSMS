/**
 * One-time backfill: create a Payment (receipt) for every pre-existing
 * Installment/BillInfo row that already has amountPaid > 0 but no receipt,
 * because it was paid before the Payment/Receipt system existed.
 *
 * Usage: npx ts-node scripts/backfill-receipts.ts [--apply]
 *
 * Default is a dry run - it reports exactly what would be created (counts,
 * total amount, and a sample of rows) without writing anything. Pass
 * --apply to actually create the receipts.
 *
 * Each backfilled receipt:
 * - amount = the row's current cumulative amountPaid (no per-payment-event
 *   history exists for these old rows, so one receipt represents the whole
 *   amount paid to date, not each individual historical payment).
 * - paymentDate = the row's own paidDate/paymentDate if set, else its
 *   updatedAt (best available signal for when the payment was recorded).
 * - paymentMode = the row's own paymentMode/paymentMethod if set, else
 *   "Unknown" (explicit placeholder rather than guessing Cash).
 * - receivedBy = the super admin user (no record of who actually took the
 *   original payment).
 * - migrated = true, remarks note it's a backfilled receipt.
 *
 * Idempotent: skips any row that already has a receipt (by targetType +
 * targetId), so it's safe to re-run after a partial apply.
 */

import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../src/database/connection';
import { registerTenantPlugin } from '../src/database/tenant-global-plugin';

registerTenantPlugin();

import Installment from '../src/Installment/models/models-installment';
import BillInfo from '../src/BillI/models/models-bill-info';
import File from '../src/File/models/models-file';
import User, { UserRole } from '../src/database/models/User';
import Payment, { generateReceiptNo } from '../src/Payment/models/models-payment';

const APPLY = process.argv.includes('--apply');

interface PlannedReceipt {
  targetType: 'installment' | 'bill';
  targetId: mongoose.Types.ObjectId;
  fileId: mongoose.Types.ObjectId;
  paidByMemId: mongoose.Types.ObjectId;
  amount: number;
  paymentDate: Date;
  paymentMode: string;
  transactionRefNo?: string;
  societyId: mongoose.Types.ObjectId;
  // display-only, for the dry-run report
  fileRegNo?: string;
  label: string;
}

async function planInstallmentBackfills(): Promise<PlannedReceipt[]> {
  const paidInstallments = await Installment.find({
    isDeleted: false,
    amountPaid: { $gt: 0 },
  }).select('fileId amountPaid paidDate paymentMode transactionRefNo societyId installmentTitle updatedAt');

  const existingTargetIds = new Set(
    (
      await Payment.find({ targetType: 'installment', isDeleted: false }).distinct('targetId')
    ).map(String)
  );

  const planned: PlannedReceipt[] = [];
  for (const inst of paidInstallments) {
    if (existingTargetIds.has(String(inst._id))) continue;

    const file = await File.findById(inst.fileId).select('fileRegNo memId');
    if (!file) continue;

    planned.push({
      targetType: 'installment',
      targetId: inst._id as mongoose.Types.ObjectId,
      fileId: inst.fileId,
      paidByMemId: file.memId,
      amount: inst.amountPaid,
      paymentDate: inst.paidDate || (inst as any).updatedAt,
      paymentMode: inst.paymentMode || 'Unknown',
      transactionRefNo: inst.transactionRefNo,
      societyId: inst.societyId,
      fileRegNo: file.fileRegNo,
      label: inst.installmentTitle,
    });
  }
  return planned;
}

async function planBillBackfills(): Promise<PlannedReceipt[]> {
  const paidBills = await BillInfo.find({
    isDeleted: false,
    amountPaid: { $gt: 0 },
  }).select('fileId memId amountPaid paymentDate paymentMethod transactionId societyId billMonth updatedAt');

  const existingTargetIds = new Set(
    (await Payment.find({ targetType: 'bill', isDeleted: false }).distinct('targetId')).map(String)
  );

  const planned: PlannedReceipt[] = [];
  for (const bill of paidBills) {
    if (existingTargetIds.has(String(bill._id))) continue;

    const file = await File.findById(bill.fileId).select('fileRegNo');

    planned.push({
      targetType: 'bill',
      targetId: bill._id as mongoose.Types.ObjectId,
      fileId: bill.fileId,
      paidByMemId: bill.memId,
      amount: bill.amountPaid,
      paymentDate: bill.paymentDate || (bill as any).updatedAt,
      paymentMode: bill.paymentMethod || 'Unknown',
      transactionRefNo: bill.transactionId,
      societyId: bill.societyId,
      fileRegNo: file?.fileRegNo,
      label: bill.billMonth,
    });
  }
  return planned;
}

async function main() {
  await connectDB();

  const [installmentPlans, billPlans] = await Promise.all([
    planInstallmentBackfills(),
    planBillBackfills(),
  ]);
  const allPlans = [...installmentPlans, ...billPlans];

  console.log('='.repeat(70));
  console.log(`Receipt backfill - ${APPLY ? 'APPLY' : 'DRY RUN'}`);
  console.log('='.repeat(70));
  console.log(`Installments needing a backfilled receipt: ${installmentPlans.length}`);
  console.log(`Bills needing a backfilled receipt: ${billPlans.length}`);
  console.log(`Total: ${allPlans.length}`);
  console.log(
    `Total amount represented: PKR ${allPlans.reduce((s, p) => s + p.amount, 0).toLocaleString()}`
  );
  console.log('');

  if (allPlans.length === 0) {
    console.log('Nothing to backfill - every paid row already has a receipt.');
    await disconnectDB();
    return;
  }

  console.log('Sample of what would be created (first 20):');
  console.log('-'.repeat(70));
  for (const p of allPlans.slice(0, 20)) {
    console.log(
      `  [${p.targetType}] file=${p.fileRegNo || p.fileId} "${p.label}" ` +
        `amount=${p.amount} mode=${p.paymentMode} date=${p.paymentDate?.toISOString().slice(0, 10)}`
    );
  }
  if (allPlans.length > 20) {
    console.log(`  ... and ${allPlans.length - 20} more`);
  }
  console.log('-'.repeat(70));

  if (!APPLY) {
    console.log('\nDry run only - no receipts created. Re-run with --apply to commit.');
    await disconnectDB();
    return;
  }

  const superAdmin = await User.findOne({ role: UserRole.SUPER_ADMIN, isDeleted: false });
  if (!superAdmin) {
    console.error('No Super Admin user found to attribute backfilled receipts to. Aborting.');
    await disconnectDB();
    process.exit(1);
  }

  let created = 0;
  for (const p of allPlans) {
    const receiptNo = await generateReceiptNo();
    await Payment.create({
      receiptNo,
      fileId: p.fileId,
      paidByMemId: p.paidByMemId,
      targetType: p.targetType,
      targetId: p.targetId,
      amount: p.amount,
      paymentDate: p.paymentDate,
      paymentMode: p.paymentMode,
      transactionRefNo: p.transactionRefNo,
      receivedBy: superAdmin._id,
      remarks: 'Backfilled receipt for a payment recorded before the Payment/Receipt system existed.',
      reversed: false,
      migrated: true,
      societyId: p.societyId,
      isDeleted: false,
    });
    created++;
  }

  console.log(`\nCreated ${created} backfilled receipts.`);
  await disconnectDB();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
