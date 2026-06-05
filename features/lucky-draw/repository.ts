// Lucky-draw repository — every DB access for the lucky-draw domain.
//
// Operates against two model surfaces:
//   - LuckyDrawModel       (announced draws, winner write-back)
//   - LuckyDrawEntryModel  (per-order entries, winner selection)
//
// Functions accept an optional Mongoose ClientSession so the service
// can wrap them in a single transaction. Read helpers don't take a
// session unless a caller specifically needs read-your-writes.
//
// Behavior is locked to what lib/lucky-draw-utils.ts does today.

import type { ClientSession } from "mongoose";
import { LuckyDrawModel, type ILuckyDraw } from "@/models/LuckyDraw";
import {
  LuckyDrawEntryModel,
  type ILuckyDrawEntry,
} from "@/models/LuckyDrawEntry";
import { OrderModel } from "@/models/Order";

// ─── Draw lookups ─────────────────────────────────────────────────

/** Find the most-recently-created announced draw whose entry criteria
 *  match the given order amount. Used by checkOrderQualifiesForDraw. */
export function findActiveDrawForOrderAmount(
  orderGrandTotal: number,
): Promise<ILuckyDraw | null> {
  return LuckyDrawModel.findOne({
    status: "announced",
    isActive: true,
    "entryCriteria.minOrderAmount": { $lte: orderGrandTotal },
    "entryCriteria.qualifyingStatus": "delivered",
  })
    .sort({ createdAt: -1 })
    .lean()
    .exec() as unknown as Promise<ILuckyDraw | null>;
}

/** Look up a draw by id (used during winner selection — session-aware). */
export function findDrawById(
  drawId: string,
  opts: { session?: ClientSession } = {},
): Promise<ILuckyDraw | null> {
  const query = LuckyDrawModel.findById(drawId);
  if (opts.session) query.session(opts.session);
  return query.exec();
}

/** All announced + active draws, ordered by drawDate then created.
 *  Read-only; used by the public listing endpoint. */
export function findAnnouncedActiveDraws(): Promise<ILuckyDraw[]> {
  return LuckyDrawModel.find({
    status: "announced",
    isActive: true,
  })
    .sort({ drawDate: 1, createdAt: -1 })
    .lean()
    .exec() as unknown as Promise<ILuckyDraw[]>;
}

/** Update the draw with winner snapshot + completion metadata. */
export async function persistDrawWinner(
  draw: ILuckyDraw,
  opts: { session?: ClientSession } = {},
): Promise<void> {
  await draw.save(opts.session ? { session: opts.session } : undefined);
}

/** Increment totalEntries and add the user to eligibleUserCount set. */
export function incrementDrawEntryCount(
  drawId: string,
  userId: string,
  opts: { session?: ClientSession } = {},
): Promise<unknown> {
  return LuckyDrawModel.findByIdAndUpdate(
    drawId,
    {
      $inc: { totalEntries: 1 },
      $addToSet: { eligibleUserCount: userId },
    },
    opts.session ? { session: opts.session } : undefined,
  ).exec();
}

// ─── Entry lookups ────────────────────────────────────────────────

/** True if any entry already exists for this order. */
export function findEntryByOrderId(
  orderId: string,
): Promise<ILuckyDrawEntry | null> {
  return LuckyDrawEntryModel.findOne({ orderId })
    .lean()
    .exec() as unknown as Promise<ILuckyDrawEntry | null>;
}

/** Last (highest-numbered) entry for a given draw — used to assign
 *  the next sequential entry number. */
export function findLastEntryForDraw(
  drawId: string,
  opts: { session?: ClientSession } = {},
): Promise<ILuckyDrawEntry | null> {
  const query = LuckyDrawEntryModel.findOne({ drawId }).sort({
    entryNumber: -1,
  });
  if (opts.session) query.session(opts.session);
  return query.exec();
}

/** Active entries for a draw — used to populate the spin wheel. */
export function findActiveEntriesForSpin(
  drawId: string,
): Promise<
  Array<
    Pick<
      ILuckyDrawEntry,
      "entryNumber" | "customerName" | "orderId" | "orderAmount"
    > & { _id: { toString(): string } }
  >
> {
  return LuckyDrawEntryModel.find(
    { drawId, status: "active" },
    "entryNumber customerName orderId orderAmount",
  )
    .lean()
    .exec() as unknown as Promise<
    Array<
      Pick<
        ILuckyDrawEntry,
        "entryNumber" | "customerName" | "orderId" | "orderAmount"
      > & { _id: { toString(): string } }
    >
  >;
}

/** All active entries for a draw (full docs) — winner-selection input. */
export function findActiveEntriesForDraw(
  drawId: string,
  opts: { session?: ClientSession } = {},
): Promise<ILuckyDrawEntry[]> {
  return LuckyDrawEntryModel.find(
    { drawId, status: "active" },
    null,
    opts.session ? { session: opts.session } : undefined,
  )
    .lean()
    .exec() as unknown as Promise<ILuckyDrawEntry[]>;
}

/** Entries for a given user (with draw populated) — used by the
 *  customer's lucky-draw dashboard. */
export function findEntriesByUserWithDraw(
  userId: string,
): Promise<ILuckyDrawEntry[]> {
  return LuckyDrawEntryModel.find({ userId })
    .populate("drawId", "title prizeName status drawDate")
    .sort({ createdAt: -1 })
    .lean()
    .exec() as unknown as Promise<ILuckyDrawEntry[]>;
}

// ─── Entry writes ─────────────────────────────────────────────────

/** Persist a new entry document. Mirrors the existing pattern: build
 *  the doc with `new`, then `save({ session })`. */
export async function createEntry(
  data: Partial<ILuckyDrawEntry>,
  opts: { session?: ClientSession } = {},
): Promise<ILuckyDrawEntry> {
  const doc = new LuckyDrawEntryModel(data);
  await doc.save(opts.session ? { session: opts.session } : undefined);
  return doc;
}

/** Mark an entry as the winner — flips status + timestamp. */
export function markEntryAsWinner(
  entryId: string,
  opts: { session?: ClientSession } = {},
): Promise<unknown> {
  return LuckyDrawEntryModel.findByIdAndUpdate(
    entryId,
    {
      status: "winner",
      winnerDeclaredAt: new Date(),
    },
    opts.session ? { session: opts.session } : undefined,
  ).exec();
}

// ─── Order lookup helpers (cross-domain, kept here for the
//     transactional path that needs them session-aware) ────────────

/** Lean order lookup (no populate). Used in checkOrderQualifiesForDraw. */
export function findLeanOrderById(orderId: string) {
  return OrderModel.findById(orderId).lean().exec();
}

/** Order lookup with user populated — used during entry creation so
 *  we can resolve the customer email/name snapshot. Session-aware. */
export function findOrderWithUser(
  orderId: string,
  opts: { session?: ClientSession } = {},
) {
  const query = OrderModel.findById(orderId).populate(
    "userId",
    "name email phone",
  );
  if (opts.session) query.session(opts.session);
  return query.exec();
}
