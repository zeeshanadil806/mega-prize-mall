// Order repository — every DB access for the order domain.
//
// Operates against three model surfaces:
//   - OrderModel              (create, lookup, status updates)
//   - ProductModel            (inventory check + decrement at checkout)
//   - UserModel               (point balance read + decrement on redemption)
//   - WalletTransactionModel  (earn/redeem records tied to the order)
//
// All write functions accept an optional Mongoose ClientSession so the
// service can wrap them in a single transaction. Lookup helpers don't
// take a session unless a caller specifically needs read-your-writes
// inside the same transaction.
//
// Behavior is locked to what app/api/checkout/order/route.ts does
// today; no semantic changes.

import type { ClientSession } from "mongoose";
import { OrderModel, type IOrder } from "@/models/Order";
import { ProductModel } from "@/models/Product";
import { UserModel } from "@/models/User";
import { WalletTransactionModel } from "@/models/WalletTransaction";

// ─── Product lookups for checkout ─────────────────────────────────

export interface CheckoutProduct {
  _id: { toString(): string };
  name: string;
  slug: string;
  stock: number;
  images?: Array<{ url: string }>;
}

/** Fetch all referenced products in one query, scoped to active items.
 *  Used to validate presence + inventory before placing the order.    */
export function findActiveProductsByIds(
  productIds: string[],
  opts: { session?: ClientSession } = {},
): Promise<CheckoutProduct[]> {
  const query = ProductModel.find({
    _id: { $in: productIds },
    isActive: true,
  });
  if (opts.session) query.session(opts.session);
  return query.exec() as unknown as Promise<CheckoutProduct[]>;
}

/** Decrement stock + increment purchaseCount for one product. */
export function decrementProductStock(
  productId: string,
  quantity: number,
  opts: { session?: ClientSession } = {},
): Promise<unknown> {
  return ProductModel.findByIdAndUpdate(
    productId,
    {
      $inc: {
        stock: -quantity,
        purchaseCount: quantity,
      },
    },
    opts.session ? { session: opts.session } : undefined,
  ).exec();
}

// ─── Order writes ─────────────────────────────────────────────────

/** Create the order document. The full DB shape (orderItems, payment,
 *  totals, etc.) is composed by the service and passed in verbatim. */
export async function createOrder(
  data: Record<string, unknown>,
  opts: { session?: ClientSession } = {},
): Promise<IOrder> {
  const doc = new OrderModel(data);
  await doc.save(opts.session ? { session: opts.session } : undefined);
  return doc;
}

/** Persist a globalCouponCode update on an existing order document.
 *  Matches the current route's pattern: mutate the doc then save().   */
export async function setOrderGlobalCouponCode(
  order: IOrder,
  code: string,
  opts: { session?: ClientSession } = {},
): Promise<void> {
  (order as IOrder & { globalCouponCode?: string }).globalCouponCode = code;
  await order.save(opts.session ? { session: opts.session } : undefined);
}

// ─── Order reads ──────────────────────────────────────────────────

/** Find the most recently placed order matching one of: userId,
 *  guestSessionId, or guestPhone. Used by the route handler to
 *  echo the just-created order's _id back to the client. */
export function findMostRecentOrderForActor(actor: {
  userId?: string;
  guestSessionId?: string;
  guestPhone?: string;
}): Promise<IOrder | null> {
  const orFilters: Array<Record<string, string>> = [];
  if (actor.userId) orFilters.push({ userId: actor.userId });
  if (actor.guestSessionId)
    orFilters.push({ guestSessionId: actor.guestSessionId });
  if (actor.guestPhone) orFilters.push({ guestPhone: actor.guestPhone });

  return OrderModel.findOne({ $or: orFilters })
    .sort({ createdAt: -1 })
    .limit(1)
    .exec();
}

// ─── User / wallet writes ─────────────────────────────────────────

export interface UserPointsRecord {
  _id: unknown;
  points: number;
  save: (opts?: { session?: ClientSession }) => Promise<unknown>;
}

/** Load a user (with current points) inside the transaction so we can
 *  read-modify-write the points balance atomically. */
export function findUserForPointsUpdate(
  userId: string,
  opts: { session?: ClientSession } = {},
): Promise<UserPointsRecord | null> {
  const query = UserModel.findById(userId);
  if (opts.session) query.session(opts.session);
  return query.exec() as unknown as Promise<UserPointsRecord | null>;
}

/** Append a wallet transaction record. Used for both earn and redeem
 *  legs of an order. Status, points sign, and balanceAfter are the
 *  caller's responsibility — mirrors the route's existing writes. */
export function createWalletTransaction(
  data: Record<string, unknown>,
  opts: { session?: ClientSession } = {},
): Promise<unknown> {
  if (opts.session) {
    return WalletTransactionModel.create([data], {
      session: opts.session,
    }).then((docs) => docs[0]);
  }
  return WalletTransactionModel.create(data);
}

// ─── Session helper ───────────────────────────────────────────────

/** Start a session against the Order model. Re-exported so the
 *  service doesn't import OrderModel directly. */
export function startOrderSession() {
  return OrderModel.startSession();
}
