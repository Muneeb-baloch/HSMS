/**
 * One-time backfill: set Plot.fileId for every plot that has an active
 * File booked on it (File.plotId, status in PLOT_OCCUPYING_FILE_STATUSES)
 * but whose Plot.fileId was never set, because normal booking
 * (fileService.createFile) didn't write it before this fix - only the
 * separate "Assign Plot to Customer" flow ever did.
 *
 * Usage: npx ts-node scripts/backfill-plot-fileid.ts [--apply]
 *
 * Default is a dry run - it reports exactly what would change (counts and
 * a sample of rows) without writing anything. Pass --apply to actually set
 * Plot.fileId.
 *
 * Scope: this backfill only sets Plot.fileId. It deliberately does NOT
 * touch Plot.salesStatusId - unlike new bookings (which now set it to a
 * "booked" status in the same transaction), an existing plot's current
 * sales status may already reflect something more advanced (e.g. "sold",
 * "allotted") that a blanket backfill shouldn't downgrade.
 *
 * Idempotent: skips any plot whose fileId already matches the active file,
 * so it's safe to re-run after a partial apply. Plots whose fileId is set
 * to a DIFFERENT file than the current active one are reported as
 * conflicts and never written to - those need manual review.
 */

import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../src/database/connection';
import { registerTenantPlugin } from '../src/database/tenant-global-plugin';

registerTenantPlugin();

import File, { PLOT_OCCUPYING_FILE_STATUSES } from '../src/File/models/models-file';
import Plot from '../src/Plots/models/models-plot';

const APPLY = process.argv.includes('--apply');

interface PlannedFix {
  plotId: mongoose.Types.ObjectId;
  plotNo?: string;
  fileId: mongoose.Types.ObjectId;
  fileRegNo?: string;
}

interface Conflict {
  plotId: mongoose.Types.ObjectId;
  plotNo?: string;
  currentFileId: mongoose.Types.ObjectId;
  activeFileId: mongoose.Types.ObjectId;
  activeFileRegNo?: string;
}

async function main() {
  await connectDB();

  const activeFiles = await File.find({
    isDeleted: false,
    status: { $in: PLOT_OCCUPYING_FILE_STATUSES },
  }).select('plotId fileRegNo status');

  console.log('='.repeat(70));
  console.log(`Plot.fileId backfill - ${APPLY ? 'APPLY' : 'DRY RUN'}`);
  console.log('='.repeat(70));
  console.log(`Active files found (occupying a plot): ${activeFiles.length}`);

  const seenPlotIds = new Set<string>();
  const duplicatePlotIds = new Set<string>();
  for (const f of activeFiles) {
    const key = String(f.plotId);
    if (seenPlotIds.has(key)) duplicatePlotIds.add(key);
    seenPlotIds.add(key);
  }
  if (duplicatePlotIds.size > 0) {
    console.warn(
      `\nWARNING: ${duplicatePlotIds.size} plot(s) have more than one active file - ` +
        `this should be impossible under uniq_active_file_per_plot. Skipping these entirely:`
    );
    for (const plotId of duplicatePlotIds) {
      console.warn(`  plotId=${plotId}`);
    }
  }

  const planned: PlannedFix[] = [];
  const conflicts: Conflict[] = [];
  let alreadyCorrect = 0;

  for (const f of activeFiles) {
    const plotIdStr = String(f.plotId);
    if (duplicatePlotIds.has(plotIdStr)) continue;

    const plot = await Plot.findById(f.plotId).select('plotNo fileId');
    if (!plot) continue;

    if (plot.fileId && String(plot.fileId) === String(f._id)) {
      alreadyCorrect++;
      continue;
    }

    if (plot.fileId && String(plot.fileId) !== String(f._id)) {
      conflicts.push({
        plotId: plot._id as mongoose.Types.ObjectId,
        plotNo: plot.plotNo,
        currentFileId: plot.fileId,
        activeFileId: f._id as mongoose.Types.ObjectId,
        activeFileRegNo: f.fileRegNo,
      });
      continue;
    }

    planned.push({
      plotId: plot._id as mongoose.Types.ObjectId,
      plotNo: plot.plotNo,
      fileId: f._id as mongoose.Types.ObjectId,
      fileRegNo: f.fileRegNo,
    });
  }

  console.log(`Plots already correct (fileId matches the active file): ${alreadyCorrect}`);
  console.log(`Plots to backfill: ${planned.length}`);
  console.log(`Conflicts found (fileId set to a DIFFERENT file - needs manual review): ${conflicts.length}`);
  console.log('');

  if (conflicts.length > 0) {
    console.log('Conflicts (NOT written, review manually):');
    console.log('-'.repeat(70));
    for (const c of conflicts) {
      console.log(
        `  plot=${c.plotNo || c.plotId} currentFileId=${c.currentFileId} ` +
          `activeFile=${c.activeFileRegNo || c.activeFileId}`
      );
    }
    console.log('-'.repeat(70));
  }

  if (planned.length === 0) {
    console.log('Nothing to backfill.');
    await disconnectDB();
    return;
  }

  console.log('Sample of what would be set (first 20):');
  console.log('-'.repeat(70));
  for (const p of planned.slice(0, 20)) {
    console.log(`  plot=${p.plotNo || p.plotId} -> fileId=${p.fileRegNo || p.fileId}`);
  }
  if (planned.length > 20) {
    console.log(`  ... and ${planned.length - 20} more`);
  }
  console.log('-'.repeat(70));

  if (!APPLY) {
    console.log('\nDry run only - no plots updated. Re-run with --apply to commit.');
    await disconnectDB();
    return;
  }

  let updated = 0;
  for (const p of planned) {
    await Plot.findByIdAndUpdate(p.plotId, { $set: { fileId: p.fileId } });
    updated++;
  }

  console.log(`\nUpdated ${updated} plots.`);
  await disconnectDB();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
