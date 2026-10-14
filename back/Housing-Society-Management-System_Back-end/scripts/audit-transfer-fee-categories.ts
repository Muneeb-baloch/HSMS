/**
 * Checks whether any InstallmentCategory looks like a transfer fee (matches
 * /transfer/i) and, if so, whether it's actually wired into a plan and has
 * already generated real Installment ledger rows — which would mean a file
 * was billed for the same transfer fee twice: once through the Installment
 * ledger, once through the Transfer module's own TransferType.transferFee /
 * Transfer.transferFeeAmount (the sole intended owner of that money).
 *
 * The installment generator (buildInstallmentRows in
 * src/Installment/services/service-installment.ts) rejects any plan detail
 * wired to a transfer-fee-named category at generation time, so this should
 * stay clean going forward — but it won't catch a transfer-fee category that
 * was wired into a plan BEFORE that guard existed. Run this:
 *   - before go-live
 *   - any time a new InstallmentPlan or InstallmentCategory is added
 *   - if you ever suspect a transfer was double-charged
 *
 * Usage: npx tsx scripts/audit-transfer-fee-categories.ts
 */
import dotenv from 'dotenv';
import mongoose, { Types } from 'mongoose';

dotenv.config();

async function run() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/hsms';
  await mongoose.connect(uri);
  const db = mongoose.connection.db!;
  console.log(`Connected to ${uri}\n`);

  const categories = await db
    .collection('installmentcategories')
    .find({ instCatName: { $regex: 'transfer', $options: 'i' } })
    .toArray();

  console.log(`=== InstallmentCategory rows matching /transfer/i: ${categories.length} ===`);
  categories.forEach(c => console.log(`  _id=${c._id} name="${c.instCatName}" kind=${c.kind} isActive=${c.isActive}`));

  if (categories.length === 0) {
    console.log('\nNo transfer-fee-named installment category exists at all — nothing to audit further.');
    await mongoose.disconnect();
    return;
  }

  const catIds = categories.map(c => c._id);

  const planDetails = await db
    .collection('installmentplandetails')
    .find({ instCatId: { $in: catIds }, isDeleted: { $ne: true } })
    .toArray();

  console.log(`\n=== InstallmentPlanDetail rows using a transfer-fee category: ${planDetails.length} ===`);
  planDetails.forEach(d =>
    console.log(
      `  planId=${d.planId} occurrence=${d.occurrence} percentageAmount=${d.percentageAmount} fixedAmount=${d.fixedAmount}`
    )
  );

  if (planDetails.length === 0) {
    console.log(
      '\nCategory exists but is not wired into any plan — generation guard would never even see it. ' +
        'Still worth deleting/renaming the unused category to avoid a future accident.'
    );
    await mongoose.disconnect();
    return;
  }

  const planIds = [...new Set(planDetails.map(d => String(d.planId)))].map(id => new Types.ObjectId(id));

  const files = await db
    .collection('files')
    .find({ planId: { $in: planIds }, isDeleted: { $ne: true } })
    .toArray();
  console.log(`\n=== Files booked on a plan containing a transfer-fee category: ${files.length} ===`);
  files.forEach(f => console.log(`  fileId=${f._id} fileRegNo=${f.fileRegNo} status=${f.status}`));

  const generatedRows = await db
    .collection('installments')
    .find({ installmentCategoryId: { $in: catIds }, isDeleted: { $ne: true } })
    .toArray();
  console.log(`\n=== Already-GENERATED Installment ledger rows for a transfer-fee category: ${generatedRows.length} ===`);
  generatedRows.forEach(r =>
    console.log(
      `  fileId=${r.fileId} installmentNo=${r.installmentNo} amountDue=${r.amountDue} status=${r.status} amountPaid=${r.amountPaid}`
    )
  );

  if (generatedRows.length > 0) {
    const fileIdsWithGeneratedRows = [...new Set(generatedRows.map(r => String(r.fileId)))].map(
      id => new Types.ObjectId(id)
    );
    const transfersCollExists = (await db.listCollections({ name: 'transfers' }).toArray()).length > 0;
    if (transfersCollExists) {
      const transfers = await db
        .collection('transfers')
        .find({ fileId: { $in: fileIdsWithGeneratedRows } })
        .toArray();
      console.log(
        `\n=== DOUBLE-CHARGE CHECK: files with BOTH a generated transfer-fee installment row AND a real Transfer record: ${transfers.length} ===`
      );
      transfers.forEach(t =>
        console.log(`  fileId=${t.fileId} transferFeeAmount=${t.transferFeeAmount} status=${t.status}`)
      );
      if (transfers.length > 0) {
        console.log('\n*** CONFIRMED: these files were billed for transfer fee through two independent paths. ***');
      } else {
        console.log(
          '\nNo matching Transfer records yet for these files — installment rows exist but no transfer has ' +
            'happened on them yet, so no double-charge has actually occurred (but would, the moment a transfer ' +
            'is processed on one of these files).'
        );
      }
    } else {
      console.log('\n(no "transfers" collection found in this DB — skipping cross-check)');
    }
  }

  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
