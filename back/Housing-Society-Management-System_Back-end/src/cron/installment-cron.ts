import cron, { ScheduledTask } from 'node-cron';
import { Types } from 'mongoose';
import logger from '../core/logger';
import Installment, {
  flattenFileMemberPlot,
  InstallmentStatus,
} from '../Installment/models/models-installment';
import InstallmentPlan from '../Installment/models/models-installment-plan';
import InstallmentPlanDetail from '../Installment/models/models-installment-plan-detail';
import {
  buildInstallmentRows,
  RECONCILIATION_TOLERANCE,
} from '../Installment/services/service-installment';
import File, { FileStatus } from '../File/models/models-file';
import Notification from '../Notification/models/models-notification';
import { CRON_CONFIG } from './cron-config';

let installmentTask: ScheduledTask | null = null;
let overdueTask: ScheduledTask | null = null;

/**
 * Generate due installments for all active files linked to active installment plans.
 * For each file, checks which plan detail occurrences are missing and creates
 * installment records for those whose due date is on or before today.
 */
export async function generateDueInstallments(): Promise<number> {
  const startTime = Date.now();
  let totalCreated = 0;

  try {
    logger.info('[InstallmentCron] Starting generateDueInstallments job');

    // Find all active, non-deleted installment plans
    const activePlans = await InstallmentPlan.find({
      isActive: true,
      isDeleted: false,
    }).lean();

    if (activePlans.length === 0) {
      logger.info('[InstallmentCron] No active installment plans found');
      return 0;
    }

    logger.info(`[InstallmentCron] Found ${activePlans.length} active installment plans`);

    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today for comparison

    const systemUserId = new Types.ObjectId(CRON_CONFIG.SYSTEM_USER_ID);

    for (const plan of activePlans) {
      try {
        // Find all active, non-deleted files that reference this plan
        const files = await File.find({
          planId: plan._id,
          status: { $in: [FileStatus.ACTIVE, FileStatus.PENDING] },
          isDeleted: false,
          isActive: true,
        }).lean();

        if (files.length === 0) {
          logger.info(
            `[InstallmentCron] No active files found for plan: ${plan.planName} (${plan._id})`
          );
          continue;
        }

        logger.info(
          `[InstallmentCron] Processing ${files.length} files for plan: ${plan.planName}`
        );

        // Get all plan details for this plan, sorted by occurrence. Populated
        // with kind so buildInstallmentRows can tag installmentType
        // deterministically and apply the transfer-fee guard.
        const planDetails = await InstallmentPlanDetail.find({
          planId: plan._id,
          isDeleted: false,
        })
          .populate('instCatId', 'instCatName kind')
          .sort({ occurrence: 1 });

        if (planDetails.length === 0) {
          logger.warn(
            `[InstallmentCron] No plan details found for plan: ${plan.planName} (${plan._id})`
          );
          continue;
        }

        for (const file of files) {
          try {
            // Get existing installments for this file
            const existingInstallments = await Installment.find({
              fileId: file._id,
              isDeleted: false,
            })
              .select('installmentNo')
              .lean();

            const existingOccurrences = new Set(
              existingInstallments.map((inst) => inst.installmentNo)
            );

            // Same calculator used at booking time and by the manual
            // generate-from-plan action — basis is the file's frozen
            // contractPrice, never a live plot/file total.
            const { rows, reconciledTotal } = buildInstallmentRows({
              contractPrice: file.contractPrice,
              startDate: file.bookingDate,
              planDetails,
            });

            if (Math.abs(reconciledTotal - file.contractPrice) > RECONCILIATION_TOLERANCE) {
              logger.error(
                `[InstallmentCron] Plan "${plan.planName}" does not reconcile for file ` +
                  `${file.fileRegNo}: rows sum to ${reconciledTotal}, contractPrice is ` +
                  `${file.contractPrice}. Skipping this file until the plan is fixed.`
              );
              continue;
            }

            for (const row of rows) {
              // Skip if this occurrence already has an installment
              if (existingOccurrences.has(row.installmentNo)) {
                continue;
              }

              // Only create if the due date is on or before today
              if (row.dueDate > today) {
                continue;
              }

              const now = new Date();
              now.setHours(0, 0, 0, 0);
              const status = row.dueDate < now ? InstallmentStatus.OVERDUE : InstallmentStatus.UNPAID;

              const installment = new Installment({
                ...row,
                fileId: file._id,
                installmentTitle: `${plan.planName} - ${row.installmentTitle}`,
                status,
                societyId: file.societyId,
                createdBy: systemUserId,
                isDeleted: false,
              });

              await installment.save();
              totalCreated++;

              logger.info(
                `[InstallmentCron] Created installment #${row.installmentNo} for file ${file.fileRegNo} ` +
                  `(amount: ${row.amountDue}, dueDate: ${row.dueDate.toISOString()}, status: ${status})`
              );
            }
          } catch (fileError) {
            logger.error(
              `[InstallmentCron] Error processing file ${file.fileRegNo} (${file._id}):`,
              fileError
            );
            // Continue with next file
          }
        }
      } catch (planError) {
        logger.error(
          `[InstallmentCron] Error processing plan ${plan.planName} (${plan._id}):`,
          planError
        );
        // Continue with next plan
      }
    }

    const duration = Date.now() - startTime;
    logger.info(
      `[InstallmentCron] generateDueInstallments completed: ${totalCreated} installments created in ${duration}ms`
    );

    return totalCreated;
  } catch (error) {
    logger.error('[InstallmentCron] Fatal error in generateDueInstallments:', error);
    throw error;
  }
}

/**
 * Mark unpaid or partially paid installments as overdue if their due date has passed.
 * Also calculates and applies late fee surcharges based on days overdue.
 */
export async function markOverdueInstallments(): Promise<number> {
  const startTime = Date.now();
  let totalUpdated = 0;

  try {
    logger.info('[InstallmentCron] Starting markOverdueInstallments job');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find all installments that are past due and still unpaid or partially paid
    const overdueInstallments = await Installment.find({
      dueDate: { $lt: today },
      status: { $in: [InstallmentStatus.UNPAID, InstallmentStatus.PARTIALLY_PAID] },
      isDeleted: false,
    });

    if (overdueInstallments.length === 0) {
      logger.info('[InstallmentCron] No overdue installments found');
      return 0;
    }

    logger.info(
      `[InstallmentCron] Found ${overdueInstallments.length} installments to mark as overdue`
    );

    for (const installment of overdueInstallments) {
      try {
        const dueDate = new Date(installment.dueDate);
        const diffTime = Math.abs(today.getTime() - dueDate.getTime());
        const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Calculate late fee surcharge
        const calculatedFee =
          installment.amountDue * CRON_CONFIG.LATE_FEE_DAILY_RATE * daysOverdue;
        const maxFee = installment.amountDue * CRON_CONFIG.LATE_FEE_MAX_PERCENTAGE;
        const lateFeeSurcharge = Math.min(calculatedFee, maxFee);

        // Update the installment
        installment.lateFeeSurcharge = lateFeeSurcharge;
        installment.totalPayable = installment.amountDue + lateFeeSurcharge;
        installment.balanceAmount = installment.totalPayable - installment.amountPaid;
        installment.status = InstallmentStatus.OVERDUE;

        await installment.save();
        totalUpdated++;

        logger.info(
          `[InstallmentCron] Marked installment ${installment._id} as overdue ` +
            `(daysOverdue: ${daysOverdue}, lateFee: ${lateFeeSurcharge.toFixed(2)}, ` +
            `balance: ${installment.balanceAmount.toFixed(2)})`
        );
      } catch (updateError) {
        logger.error(
          `[InstallmentCron] Error updating installment ${installment._id}:`,
          updateError
        );
        // Continue with next installment
      }
    }

    const duration = Date.now() - startTime;
    logger.info(
      `[InstallmentCron] markOverdueInstallments completed: ${totalUpdated} installments updated in ${duration}ms`
    );

    return totalUpdated;
  } catch (error) {
    logger.error('[InstallmentCron] Fatal error in markOverdueInstallments:', error);
    throw error;
  }
}

/**
 * Send reminder notifications for installments that are due within REMINDER_DAYS_BEFORE days
 * and are still unpaid.
 */
export async function sendDueReminders(): Promise<number> {
  const startTime = Date.now();
  let totalReminders = 0;

  try {
    logger.info('[InstallmentCron] Starting sendDueReminders job');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const reminderDate = new Date(today);
    reminderDate.setDate(reminderDate.getDate() + CRON_CONFIG.REMINDER_DAYS_BEFORE);
    reminderDate.setHours(23, 59, 59, 999);

    // Find unpaid installments due within the reminder window
    const upcomingInstallments = await Installment.find({
      dueDate: { $gte: today, $lte: reminderDate },
      status: InstallmentStatus.UNPAID,
      isDeleted: false,
    })
      .populate({
        path: 'file',
        select: 'fileRegNo',
        populate: [
          { path: 'member', select: 'memName' },
          { path: 'plot', select: 'plotNo' },
        ],
      })
      .lean();

    // member/plot no longer live directly on Installment — flatten them back
    // from the nested file populate so the reads below don't need to change.
    upcomingInstallments.forEach(inst => flattenFileMemberPlot(inst));

    if (upcomingInstallments.length === 0) {
      logger.info('[InstallmentCron] No upcoming installments requiring reminders');
      return 0;
    }

    logger.info(
      `[InstallmentCron] Found ${upcomingInstallments.length} installments due within ${CRON_CONFIG.REMINDER_DAYS_BEFORE} days`
    );

    const systemUserId = new Types.ObjectId(CRON_CONFIG.SYSTEM_USER_ID);

    for (const installment of upcomingInstallments) {
      try {
        const dueDate = new Date(installment.dueDate);
        const daysUntilDue = Math.ceil(
          (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        const fileInfo = (installment as any).file;
        const memberInfo = (installment as any).member;
        const plotInfo = (installment as any).plot;

        const fileRegNo = fileInfo?.fileRegNo || 'N/A';
        const memberName = memberInfo?.memName || 'N/A';
        const plotNo = plotInfo?.plotNo || 'N/A';

        // Create a notification record
        const notification = new Notification({
          title: `Installment Due Reminder - ${installment.installmentTitle}`,
          message:
            `Installment #${installment.installmentNo} for File ${fileRegNo} ` +
            `(Member: ${memberName}, Plot: ${plotNo}) is due in ${daysUntilDue} day(s) ` +
            `on ${dueDate.toLocaleDateString()}. Amount due: ${installment.amountDue.toFixed(2)}.`,
          referenceId: installment._id as Types.ObjectId,
          module: 'Payment',
          createdBy: systemUserId,
          isRead: false,
          isDeleted: false,
        });

        await notification.save();
        totalReminders++;

        logger.info(
          `[InstallmentCron] Sent reminder for installment ${installment._id} ` +
            `(file: ${fileRegNo}, dueIn: ${daysUntilDue} days, amount: ${installment.amountDue})`
        );
      } catch (notifError) {
        logger.error(
          `[InstallmentCron] Error creating reminder for installment ${installment._id}:`,
          notifError
        );
        // Continue with next installment
      }
    }

    const duration = Date.now() - startTime;
    logger.info(
      `[InstallmentCron] sendDueReminders completed: ${totalReminders} reminders sent in ${duration}ms`
    );

    return totalReminders;
  } catch (error) {
    logger.error('[InstallmentCron] Fatal error in sendDueReminders:', error);
    throw error;
  }
}

/**
 * Start all installment-related cron jobs.
 */
export function startInstallmentCron(): void {
  try {
    logger.info('[InstallmentCron] Starting installment cron jobs...');

    // Validate cron schedules
    if (!cron.validate(CRON_CONFIG.INSTALLMENT_SCHEDULE)) {
      logger.error(
        `[InstallmentCron] Invalid INSTALLMENT_SCHEDULE: ${CRON_CONFIG.INSTALLMENT_SCHEDULE}`
      );
      return;
    }

    if (!cron.validate(CRON_CONFIG.OVERDUE_SCHEDULE)) {
      logger.error(
        `[InstallmentCron] Invalid OVERDUE_SCHEDULE: ${CRON_CONFIG.OVERDUE_SCHEDULE}`
      );
      return;
    }

    // Schedule installment generation job (daily at midnight by default)
    installmentTask = cron.schedule(
      CRON_CONFIG.INSTALLMENT_SCHEDULE,
      async () => {
        logger.info('[InstallmentCron] Running scheduled installment generation...');
        try {
          const created = await generateDueInstallments();
          logger.info(`[InstallmentCron] Scheduled generation complete: ${created} created`);

          // Also send reminders after generating installments
          const reminders = await sendDueReminders();
          logger.info(`[InstallmentCron] Scheduled reminders complete: ${reminders} sent`);
        } catch (error) {
          logger.error('[InstallmentCron] Scheduled installment generation failed:', error);
        }
      },
      {
        timezone: process.env.TZ || 'Asia/Karachi',
      }
    );

    // Schedule overdue marking job (daily at 1am by default)
    overdueTask = cron.schedule(
      CRON_CONFIG.OVERDUE_SCHEDULE,
      async () => {
        logger.info('[InstallmentCron] Running scheduled overdue marking...');
        try {
          const updated = await markOverdueInstallments();
          logger.info(`[InstallmentCron] Scheduled overdue marking complete: ${updated} updated`);
        } catch (error) {
          logger.error('[InstallmentCron] Scheduled overdue marking failed:', error);
        }
      },
      {
        timezone: process.env.TZ || 'Asia/Karachi',
      }
    );

    logger.info(
      `[InstallmentCron] Cron jobs started successfully. ` +
        `Installment generation: "${CRON_CONFIG.INSTALLMENT_SCHEDULE}", ` +
        `Overdue marking: "${CRON_CONFIG.OVERDUE_SCHEDULE}"`
    );
  } catch (error) {
    logger.error('[InstallmentCron] Failed to start cron jobs:', error);
  }
}

/**
 * Stop all installment-related cron jobs.
 */
export function stopInstallmentCron(): void {
  try {
    logger.info('[InstallmentCron] Stopping installment cron jobs...');

    if (installmentTask) {
      installmentTask.stop();
      installmentTask = null;
      logger.info('[InstallmentCron] Installment generation task stopped');
    }

    if (overdueTask) {
      overdueTask.stop();
      overdueTask = null;
      logger.info('[InstallmentCron] Overdue marking task stopped');
    }

    logger.info('[InstallmentCron] All cron jobs stopped');
  } catch (error) {
    logger.error('[InstallmentCron] Error stopping cron jobs:', error);
  }
}
