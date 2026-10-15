/**
 * Sync MongoDB indexes for all models
 * Usage: npm run sync-indexes [--apply]
 *
 * By default, performs a dry-run showing what indexes would be created/dropped.
 * Pass --apply to actually build the indexes.
 *
 * This script is needed because autoIndex is disabled in development.
 * It explicitly builds all indexes defined in schemas.
 */

import logger from '../core/logger';
import { connectDB, disconnectDB } from './connection';
import { registerTenantPlugin } from './tenant-global-plugin';

// Register tenant plugin before importing models
registerTenantPlugin();

// Import all models to ensure schemas are registered
import Plot from '../Plots/models/models-plot';
import PlotSize from '../Plots/models/models-plotsize';
import File from '../File/models/models-file';
import InstallmentPlan from '../Installment/models/models-installment-plan';
import InstallmentPlanDetail from '../Installment/models/models-installment-plan-detail';
import InstallmentCategory from '../Installment/models/models-installment-category';
import Installment from '../Installment/models/models-installment';
import BillType from '../BillI/models/models-bill-type';
import BillInfo from '../BillI/models/models-bill-info';
import DefaulterWorkflow from '../Defaulter/models/models-defaulter-workflow';
import PaymentMode from '../Payment/models/models-paymentmodule';

const models = [
  { name: 'Plot', model: Plot },
  { name: 'PlotSize', model: PlotSize },
  { name: 'File', model: File },
  { name: 'InstallmentPlan', model: InstallmentPlan },
  { name: 'InstallmentPlanDetail', model: InstallmentPlanDetail },
  { name: 'InstallmentCategory', model: InstallmentCategory },
  { name: 'Installment', model: Installment },
  { name: 'BillType', model: BillType },
  { name: 'BillInfo', model: BillInfo },
  { name: 'DefaulterWorkflow', model: DefaulterWorkflow },
  { name: 'PaymentMode', model: PaymentMode },
];

async function syncIndexes(): Promise<void> {
  const applyChanges = process.argv.includes('--apply');
  const isDryRun = !applyChanges;

  try {
    logger.info('Connecting to database...');
    await connectDB();

    if (isDryRun) {
      logger.info('DRY RUN: Showing what indexes would be created/dropped...\n');
    } else {
      logger.info('APPLYING: Syncing indexes for all models...\n');
    }

    let changesFound = 0;
    let syncedCount = 0;

    for (const { name, model } of models) {
      try {
        if (isDryRun) {
          const diff = await model.diffIndexes();
          if (diff && (diff.toCreate?.length > 0 || diff.toDrop?.length > 0)) {
            changesFound++;
            logger.info(`${name}:`);
            if (diff.toCreate && diff.toCreate.length > 0) {
              logger.info(`  Create: ${JSON.stringify(diff.toCreate)}`);
            }
            if (diff.toDrop && diff.toDrop.length > 0) {
              logger.info(`  Drop: ${JSON.stringify(diff.toDrop)}`);
            }
          }
        } else {
          await model.syncIndexes();
          logger.info(`✓ Synced indexes for ${name}`);
          syncedCount++;
        }
      } catch (error) {
        logger.error(`✗ Error processing ${name}:`, error);
      }
    }

    if (isDryRun) {
      if (changesFound === 0) {
        logger.info('\nNo index changes needed.');
      } else {
        logger.info(
          `\n${changesFound} model(s) have index changes. Run with --apply to sync.`
        );
      }
    } else {
      logger.info(`\nSuccessfully synced indexes for ${syncedCount}/${models.length} models`);
    }

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    logger.error('Error syncing indexes:', error);
    await disconnectDB().catch(() => {});
    process.exit(1);
  }
}

syncIndexes();
