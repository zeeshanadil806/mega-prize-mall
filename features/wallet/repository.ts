// Wallet repository — every DB access for the wallet domain.
//
// Two model surfaces:
//   - WalletTransactionModel  (earn / redeem / expiry / refund records)
//   - UserModel               (current points balance — debit/credit)
//
// Functions accept an optional Mongoose ClientSession so the service
// can wrap them in a single transaction. Behavior is locked to what
// app/api/wallet/{expire,redeem}/route.ts do today.

import type { ClientSession, AnyBulkWriteOperation } from "mongoose";
import {
  WalletTransactionModel,
  type IWalletTransaction,
} from "@/models/WalletTransaction";
import { UserModel } from "@/models/User";

// ─── Expiry-scan reads ────────────────────────────────────────────

/** Earn-type transactions whose expiresAt falls inside [start, end).
 *  Used by the daily expiry cron — scans whatever expired "today". */
export function findExpiringEarnTransactionsInWindow(
  start: Date,
  end: Date,
  opts: { session?: ClientSession } = {},
): Promise<IWalletTransaction[]> {
  const query = WalletTransactionModel.find({
    type: "earn",
    expiresAt: { $gte: start, $lt: end },
    status: "completed",
  });
  if (opts.session) query.session(opts.session);
  return query.exec();
}

// ─── Bulk writes used by the expiry cron ─────────────────────────

/** Bulk-update a batch of transactions. Caller composes the ops so
 *  this stays a thin wrapper around bulkWrite. */
export function bulkWriteTransactions(
  ops: AnyBulkWriteOperation<IWalletTransaction>[],
  opts: { session?: ClientSession } = {},
) {
  return WalletTransactionModel.bulkWrite(
    ops,
    opts.session ? { session: opts.session } : undefined,
  );
}

/** Bulk-update a batch of users (typically points-balance increments). */
export function bulkWriteUsers(
  ops: AnyBulkWriteOperation<unknown>[],
  opts: { session?: ClientSession } = {},
) {
  return UserModel.bulkWrite(
    ops,
    opts.session ? { session: opts.session } : undefined,
  );
}

/** Bulk-insert expiry-type wallet transactions. */
export function bulkInsertExpiryTransactions(
  docs: Record<string, unknown>[],
  opts: { session?: ClientSession } = {},
) {
  return opts.session
    ? WalletTransactionModel.insertMany(docs, { session: opts.session })
    : WalletTransactionModel.insertMany(docs);
}

// ─── Manual-redemption writes ────────────────────────────────────

/** Load a user (with current points) inside the transaction so the
 *  service can read-modify-write the balance atomically. */
export function findUserForBalanceUpdate(
  userId: string,
  opts: { session?: ClientSession } = {},
) {
  const query = UserModel.findById(userId);
  if (opts.session) query.session(opts.session);
  return query.exec();
}

/** Persist a hydrated transaction document built by the service. */
export async function saveTransaction(
  doc: IWalletTransaction,
  opts: { session?: ClientSession } = {},
): Promise<void> {
  await doc.save(opts.session ? { session: opts.session } : undefined);
}

/** Build a new (unsaved) WalletTransaction. The service composes the
 *  full payload — keeping construction here keeps the model import in
 *  one place. */
export function buildTransaction(
  data: Record<string, unknown>,
): IWalletTransaction {
  return new WalletTransactionModel(data);
}
