// Wallet service — orchestration layer.
//
// Two transactional flows that lived inline in route handlers:
//   - expireDailyPoints:   the cron job at app/api/wallet/expire
//   - redeemPointsManually: the user-initiated redeem at /api/wallet/redeem
//
// Both use the manual startTransaction / commit / abort pattern (not
// withTransaction) to preserve the original retry semantics. Side
// effects (HTTP shaping, auth) stay in the route handlers.

import type { AnyBulkWriteOperation } from "mongoose";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import {
  calculateRedemptionValue,
  getDayWindow,
  getRedemptionExpiryDate,
} from "./domain";
import {
  bulkInsertExpiryTransactions,
  bulkWriteTransactions,
  bulkWriteUsers,
  buildTransaction,
  findExpiringEarnTransactionsInWindow,
  findUserForBalanceUpdate,
  saveTransaction,
} from "./repository";
import type {
  ExpirePointsResult,
  IWalletTransaction,
  RedeemPointsResult,
} from "./schema";

// ─── Expiry cron ─────────────────────────────────────────────────

export type ExpirePointsOutcome =
  | { outcome: "nothing_to_expire" }
  | { outcome: "expired"; data: ExpirePointsResult };

export async function expireDailyPoints(): Promise<ExpirePointsOutcome> {
  await connectToDatabase();
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    // NOTE: preserve the original quirk where `today` is mutated by
    // setHours via the `new Date(today.setHours(...))` pattern. The
    // domain helper recomputes the window cleanly from any anchor.
    const { start, end } = getDayWindow(new Date());

    const expiredPoints = await findExpiringEarnTransactionsInWindow(
      start,
      end,
      { session },
    );

    if (expiredPoints.length === 0) {
      await session.commitTransaction();
      return { outcome: "nothing_to_expire" };
    }

    // Group by user for batched per-user updates.
    const userPointsMap: Record<string, number> = {};
    const transactionUpdates: AnyBulkWriteOperation<IWalletTransaction>[] = [];

    for (const tx of expiredPoints) {
      if (!userPointsMap[tx.userId]) userPointsMap[tx.userId] = 0;
      userPointsMap[tx.userId] += tx.points;

      transactionUpdates.push({
        updateOne: {
          filter: { _id: tx._id },
          update: {
            $set: {
              status: "expired",
              description: `${tx.description} (Expired)`,
              metadata: { ...tx.metadata, expiredAt: new Date() },
            },
          },
        },
      });
    }

    if (transactionUpdates.length > 0) {
      await bulkWriteTransactions(transactionUpdates, { session });
    }

    // Deduct expired points from each affected user.
    const userUpdates = Object.entries(userPointsMap).map(
      ([userId, points]) => ({
        updateOne: {
          filter: { _id: userId },
          update: { $inc: { points: -points } },
        },
      }),
    );

    if (userUpdates.length > 0) {
      await bulkWriteUsers(userUpdates, { session });
    }

    // Append one expiry-type record per affected user.
    const expiryTransactions = Object.entries(userPointsMap).map(
      ([userId, points]) => ({
        userId,
        type: "expiry",
        points: -points,
        balanceAfter: 0, // Original code's pattern; not derived from real balance.
        rate: 0.1,
        description: `${points.toLocaleString()} points expired`,
        status: "completed",
        metadata: {
          expiredAt: new Date(),
          originalPoints: points,
        },
      }),
    );

    if (expiryTransactions.length > 0) {
      await bulkInsertExpiryTransactions(expiryTransactions, { session });
    }

    await session.commitTransaction();

    return {
      outcome: "expired",
      data: {
        expiredTransactions: expiredPoints.length,
        affectedUsers: Object.keys(userPointsMap).length,
        totalPointsExpired: Object.values(userPointsMap).reduce(
          (a, b) => a + b,
          0,
        ),
      },
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

// ─── Manual redemption ──────────────────────────────────────────

export interface RedeemPointsInput {
  userId: string;
  points: number;
}

export type RedeemPointsOutcome =
  | { outcome: "user_not_found" }
  | { outcome: "insufficient_points"; available: number }
  | { outcome: "redeemed"; data: RedeemPointsResult };

export async function redeemPointsManually(
  input: RedeemPointsInput,
): Promise<RedeemPointsOutcome> {
  await connectToDatabase();
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const user = await findUserForBalanceUpdate(input.userId, { session });
    if (!user) {
      await session.abortTransaction();
      return { outcome: "user_not_found" };
    }

    if (user.points < input.points) {
      await session.abortTransaction();
      return { outcome: "insufficient_points", available: user.points };
    }

    const newBalance = user.points - input.points;
    const discountValue = calculateRedemptionValue(input.points);
    const expiresAt = getRedemptionExpiryDate();

    const transaction = buildTransaction({
      userId: input.userId,
      type: "redeem",
      points: -input.points,
      balanceAfter: newBalance,
      rate: 0.1,
      description: `Redeemed ${input.points.toLocaleString()} points for Rs ${discountValue.toFixed(2)} discount`,
      status: "completed",
      metadata: {
        discountValue,
        redeemedAt: new Date(),
        expiresAt,
      },
    });

    user.points = newBalance;

    await saveTransaction(transaction, { session });
    await user.save({ session });

    await session.commitTransaction();

    return {
      outcome: "redeemed",
      data: {
        transactionId: transaction._id,
        pointsRedeemed: input.points,
        discountValue,
        newBalance,
        expiresAt,
      },
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
