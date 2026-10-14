import mongoose, { ClientSession, Model, Types } from 'mongoose';
import { AppError } from '../../middleware/error.middleware';
import { AreaUnit, compareBase, fromBaseSqft, isZeroBase } from '../utils/areaUnits';

/**
 * Atomically reserves (or releases, for a negative delta) `deltaBase` sqft against
 * a parent's `allocatedBase`, guaranteeing (via a single conditional updateOne) that
 * concurrent requests can never push `allocatedBase` above `areaBase` or below 0.
 *
 * This is the race-proofing primitive: the capacity check and the increment happen
 * as one atomic operation at the database level via $expr, so two simultaneous
 * requests racing for the last bit of space cannot both succeed.
 */
export async function reserveAreaOnParent(
  ParentModel: Model<any>,
  parentId: Types.ObjectId | string,
  deltaBase: Types.Decimal128,
  session: ClientSession | undefined,
  parentLabel: string,
  displayUnit: AreaUnit
): Promise<void> {
  if (isZeroBase(deltaBase)) return;

  const filter: any = {
    _id: parentId,
    isDeleted: false,
    $expr: {
      $and: [
        { $lte: [{ $add: ['$allocatedBase', deltaBase] }, '$areaBase'] },
        { $gte: [{ $add: ['$allocatedBase', deltaBase] }, 0] },
      ],
    },
  };

  const updated = await ParentModel.findOneAndUpdate(
    filter,
    { $inc: { allocatedBase: deltaBase } },
    { new: true, session }
  );

  if (updated) return;

  // Failed - find out why (not found vs. capacity exceeded) to give a clear error.
  const parent = await ParentModel.findById(parentId).session(session || null);
  if (!parent || parent.isDeleted) {
    throw new AppError(404, `${parentLabel} not found`);
  }

  const isIncrease = compareBase(deltaBase, 0) > 0;
  if (!isIncrease) {
    // Releasing area should never fail capacity-wise; this would only happen if
    // allocatedBase was already inconsistent. Surface it rather than silently continuing.
    throw new AppError(
      500,
      `Failed to release area on ${parentLabel} - allocation data may be inconsistent. Run the area-allocation recompute script.`
    );
  }

  const remainingBase = (parent.areaBase as Types.Decimal128 | undefined) ?? Types.Decimal128.fromString('0');
  const allocatedBase = (parent.allocatedBase as Types.Decimal128 | undefined) ?? Types.Decimal128.fromString('0');
  const remainingDisplay = fromBaseSqft(remainingBase, displayUnit) - fromBaseSqft(allocatedBase, displayUnit);
  const requestedDisplay = fromBaseSqft(deltaBase, displayUnit);

  throw new AppError(
    400,
    `Requested area (${requestedDisplay} ${displayUnit}) exceeds available area on ${parentLabel} ` +
    `(${Math.max(0, remainingDisplay)} ${displayUnit} remaining).`
  );
}

/**
 * Detects MongoDB's "transactions require a replica set / mongos" error, which is
 * thrown on first use of a transaction against a standalone mongod.
 */
export function isTransactionsUnsupportedError(err: any): boolean {
  const msg = String(err?.message || err?.errmsg || '');
  return (
    /Transaction numbers are only allowed on a replica set member or mongos/i.test(msg) ||
    /Transactions are not supported/i.test(msg) ||
    err?.code === 20 // IllegalOperation, commonly raised for this case
  );
}

/**
 * Runs `reserve` then `action` as a single unit, inside a real multi-document
 * transaction when the MongoDB deployment supports one (replica set / mongos).
 *
 * When transactions aren't available (standalone mongod, common in local dev),
 * falls back to running the steps sequentially and manually compensating
 * (calling `release`) if `action` throws - giving the same net effect without
 * true atomicity across the two writes. The `reserve` step itself is always
 * atomic regardless, via the conditional update in reserveAreaOnParent.
 */
export async function reserveThenAct<T>(params: {
  reserve: (session: ClientSession | undefined) => Promise<void>;
  action: (session: ClientSession | undefined) => Promise<T>;
  release: (session: ClientSession | undefined) => Promise<void>;
}): Promise<T> {
  const session = await mongoose.startSession();
  try {
    let result: T | undefined;
    try {
      await session.withTransaction(async () => {
        await params.reserve(session);
        result = await params.action(session);
      });
      return result as T;
    } catch (err: any) {
      if (!isTransactionsUnsupportedError(err)) {
        // Genuine business-logic failure (e.g. capacity exceeded) - propagate as-is.
        throw err;
      }

      // Standalone MongoDB: no multi-document transaction support available.
      // Fall back to sequential writes with manual compensation.
      await params.reserve(undefined);
      try {
        return await params.action(undefined);
      } catch (actionErr) {
        await params.release(undefined).catch(() => {
          // Best-effort compensation; if this also fails the recompute script
          // will detect and report the inconsistency.
        });
        throw actionErr;
      }
    }
  } finally {
    await session.endSession();
  }
}

/**
 * Runs `action` inside a real multi-document transaction when the MongoDB
 * deployment supports one (replica set / mongos, as local dev is now
 * configured to be), falling back to running it without a session on a
 * standalone mongod (no atomicity guarantee in that case, but the same code
 * path executes either way rather than branching at call sites).
 *
 * Use this when a flow has no natural "reserve/release" step (unlike
 * reserveThenAct above) — just two or more writes that must commit together.
 */
export async function runInTransaction<T>(
  action: (session: ClientSession | undefined) => Promise<T>
): Promise<T> {
  const session = await mongoose.startSession();
  try {
    try {
      let result: T | undefined;
      await session.withTransaction(async () => {
        result = await action(session);
      });
      return result as T;
    } catch (err: any) {
      if (!isTransactionsUnsupportedError(err)) {
        throw err;
      }
      return await action(undefined);
    }
  } finally {
    await session.endSession();
  }
}
