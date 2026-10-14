/**
 * Backfills `File.contractPrice`/`priceSnapshotAt` for any File documents
 * created before this fix (which had a hand-typed `totalAmount`/`downPayment`
 * instead). Re-derives contractPrice fresh from the linked Plot's
 * `plotTotalAmount` — intentionally does NOT carry over the old hand-typed
 * `totalAmount`, since that's exactly the unreliable number this fix exists
 * to replace. Confirmed via audit (2026-10-14) that this only ever applied to
 * test data — no real financial records existed at the time this shipped.
 *
 * Idempotent — only touches File docs missing `contractPrice`.
 *
 * Usage: npx tsx scripts/backfill-file-contractprice.ts
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import File from '../src/File/models/models-file';
import Plot from '../src/Plots/models/models-plot';

dotenv.config();

async function run() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/hsms';
  await mongoose.connect(uri);
  console.log(`Connected to ${uri}\n`);

  const files = await File.find({
    $or: [{ contractPrice: { $exists: false } }, { contractPrice: null }],
  });

  console.log(`Found ${files.length} File doc(s) missing contractPrice.\n`);

  let updated = 0;
  const skipped: string[] = [];

  for (const file of files) {
    const plot = await Plot.findById(file.plotId);
    if (!plot) {
      skipped.push(`${file.fileRegNo} (plot ${file.plotId} not found)`);
      console.log(`  SKIP "${file.fileRegNo}" — linked plot not found`);
      continue;
    }

    // totalAmount is no longer a declared schema path, so dot-access isn't
    // reliable on a hydrated document — read it via get(), which still
    // reaches the raw stored value regardless of schema declaration.
    const oldTotalAmount = file.get('totalAmount');
    file.contractPrice = plot.plotTotalAmount;
    file.priceSnapshotAt = new Date();
    await file.save();

    console.log(
      `  "${file.fileRegNo}" -> contractPrice: ${plot.plotTotalAmount} ` +
        `(was totalAmount: ${oldTotalAmount ?? 'none'}, re-derived from plot, not carried over)`
    );
    updated++;
  }

  console.log(`\nUpdated ${updated} doc(s).`);
  if (skipped.length > 0) {
    console.log(`Skipped (needs manual review): ${skipped.join(', ')}`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => {
  console.error('Backfill failed:', err);
  process.exit(1);
});
