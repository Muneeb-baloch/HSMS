/**
 * Backfills the canonical `areaBase` (sqft, Decimal128) field on every Project,
 * PlotBlock, and Plot that doesn't already have it, then recomputes each
 * parent's `allocatedBase` as the sum of its active children's `areaBase`.
 *
 * Run after deploying the area-allocation feature, and any time you suspect
 * `allocatedBase` has drifted from reality (e.g. after a manual DB edit).
 *
 * Usage: npx tsx scripts/recompute-area-allocations.ts
 */
import dotenv from 'dotenv';
import mongoose, { Types } from 'mongoose';
import {
  addBase,
  compareBase,
  fromBaseSqft,
  normalizeAreaUnit,
  toBaseSqft,
} from '../src/common/utils/areaUnits';
import Project from '../src/Project/models/models-project';
import Plot from '../src/Plots/models/models-plot';
import PlotBlock from '../src/Plots/models/models-plotblock';

dotenv.config();

interface OverAllocated {
  kind: 'Project' | 'PlotBlock';
  id: string;
  name: string;
  areaDisplay: number;
  allocatedDisplay: number;
  unit: string;
}

async function run() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hsms-dev';
  await mongoose.connect(uri);
  console.log(`Connected to ${uri}\n`);

  const overAllocated: OverAllocated[] = [];

  // 1. Backfill Plot.areaBase (leaf - always sqft from length x width)
  const plots = await Plot.find({ isDeleted: false });
  let plotsBackfilled = 0;
  for (const plot of plots) {
    if (!plot.areaBase || compareBase(plot.areaBase, 0) === 0) {
      const area = plot.plotArea || plot.plotLength * plot.plotWidth;
      await Plot.updateOne({ _id: plot._id }, { $set: { areaBase: toBaseSqft(area, 'sqft') } });
      plotsBackfilled++;
    }
  }
  console.log(`Plots: ${plots.length} active, ${plotsBackfilled} backfilled with areaBase`);

  // 2. Backfill PlotBlock.areaBase, then recompute allocatedBase from its Plots
  const blocks = await PlotBlock.find({ isDeleted: false });
  let blocksBackfilled = 0;
  for (const block of blocks) {
    if (!block.areaBase || compareBase(block.areaBase, 0) === 0) {
      if (block.blockTotalArea && block.blockAreaUnit) {
        try {
          const unit = normalizeAreaUnit(block.blockAreaUnit);
          const areaBase = toBaseSqft(block.blockTotalArea, unit);
          await PlotBlock.updateOne({ _id: block._id }, { $set: { areaBase } });
          block.areaBase = areaBase;
          blocksBackfilled++;
        } catch (err: any) {
          console.warn(
            `  WARNING: PlotBlock ${block._id} (${block.plotBlockName}) has unsupported unit ` +
            `"${block.blockAreaUnit}" - skipped, needs manual fix: ${err.message}`
          );
        }
      }
    }
  }
  console.log(`Plot Blocks: ${blocks.length} active, ${blocksBackfilled} backfilled with areaBase`);

  const plotsByBlock = new Map<string, Types.Decimal128[]>();
  for (const plot of plots) {
    const key = plot.plotBlockId.toString();
    if (!plotsByBlock.has(key)) plotsByBlock.set(key, []);
    plotsByBlock.get(key)!.push(plot.areaBase);
  }

  let blocksRecomputed = 0;
  for (const block of blocks) {
    const childAreas = plotsByBlock.get(block._id.toString()) || [];
    const sum = childAreas.reduce((acc, a) => addBase(acc, a), toBaseSqft(0, 'sqft'));
    await PlotBlock.updateOne({ _id: block._id }, { $set: { allocatedBase: sum } });
    blocksRecomputed++;

    if (block.areaBase && compareBase(sum, block.areaBase) > 0) {
      const unit = normalizeAreaUnit(block.blockAreaUnit || 'sqft');
      overAllocated.push({
        kind: 'PlotBlock',
        id: block._id.toString(),
        name: block.plotBlockName,
        areaDisplay: fromBaseSqft(block.areaBase, unit),
        allocatedDisplay: fromBaseSqft(sum, unit),
        unit,
      });
    }
  }
  console.log(`Plot Blocks: allocatedBase recomputed for ${blocksRecomputed}`);

  // 3. Backfill Project.areaBase, then recompute allocatedBase from its PlotBlocks
  const projects = await Project.find({ isDeleted: false });
  let projectsBackfilled = 0;
  for (const project of projects) {
    if (!project.areaBase || compareBase(project.areaBase, 0) === 0) {
      try {
        const unit = normalizeAreaUnit(project.areaUnit);
        const areaBase = toBaseSqft(project.totalArea, unit);
        await Project.updateOne({ _id: project._id }, { $set: { areaBase } });
        project.areaBase = areaBase;
        projectsBackfilled++;
      } catch (err: any) {
        console.warn(
          `  WARNING: Project ${project._id} (${project.projName}) has unsupported unit ` +
          `"${project.areaUnit}" - skipped, needs manual fix: ${err.message}`
        );
      }
    }
  }
  console.log(`Projects: ${projects.length} active, ${projectsBackfilled} backfilled with areaBase`);

  const blocksByProject = new Map<string, Types.Decimal128[]>();
  for (const block of blocks) {
    const key = block.projectId.toString();
    if (!blocksByProject.has(key)) blocksByProject.set(key, []);
    blocksByProject.get(key)!.push(block.areaBase);
  }

  let projectsRecomputed = 0;
  for (const project of projects) {
    const childAreas = blocksByProject.get(project._id.toString()) || [];
    const sum = childAreas.reduce((acc, a) => addBase(acc, a), toBaseSqft(0, 'sqft'));
    await Project.updateOne({ _id: project._id }, { $set: { allocatedBase: sum } });
    projectsRecomputed++;

    if (project.areaBase && compareBase(sum, project.areaBase) > 0) {
      overAllocated.push({
        kind: 'Project',
        id: project._id.toString(),
        name: project.projName,
        areaDisplay: fromBaseSqft(project.areaBase, project.areaUnit as any),
        allocatedDisplay: fromBaseSqft(sum, project.areaUnit as any),
        unit: project.areaUnit,
      });
    }
  }
  console.log(`Projects: allocatedBase recomputed for ${projectsRecomputed}`);

  console.log('\n====================================');
  console.log('  Over-Allocation Report');
  console.log('====================================');
  if (overAllocated.length === 0) {
    console.log('  None - every parent is within capacity.');
  } else {
    for (const entry of overAllocated) {
      const overage = entry.allocatedDisplay - entry.areaDisplay;
      console.log(
        `  [${entry.kind}] ${entry.name} (${entry.id})\n` +
        `      capacity: ${entry.areaDisplay} ${entry.unit}\n` +
        `      allocated: ${entry.allocatedDisplay} ${entry.unit}\n` +
        `      OVER by: ${overage.toFixed(2)} ${entry.unit}\n`
      );
    }
  }
  console.log('====================================\n');

  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => {
  console.error('Recompute failed:', err);
  process.exit(1);
});
