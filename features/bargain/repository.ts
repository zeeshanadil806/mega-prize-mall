// Bargain repository — every DB access for the bargain domain.
//
// Two model surfaces:
//   - BargainRequest: one record per offer attempt (accepted/rejected/expired)
//   - BargainCoupon:  generated when a request is accepted; consumed at checkout
//
// Functions here are thin Mongoose wrappers, not business logic. They
// preserve the exact query shapes used today by:
//   - app/api/bargain/route.ts (offer submission, history listing)
//   - app/api/checkout/order/route.ts (coupon consumption at checkout)
//   - lib/coupon-utils.ts validateBargainCoupon (coupon lookup)
//
// Optional ClientSession parameter so callers inside an outer
// transaction can pass it through (checkout uses a transaction).

import type { ClientSession } from "mongoose";
import {
  BargainRequestModel,
  type IBargainRequest,
} from "@/models/BargainRequest";
import {
  BargainCouponModel,
  type IBargainCoupon,
} from "@/models/BargainCoupon";

// ─── Read operations ───────────────────────────────────────────────

/** Active offer attempts by this user against this product, most recent
 *  first. Used to determine which bargain round the user is on. */
export function findActiveBargainsForUserAndProduct(
  userId: string,
  productId: string,
): Promise<IBargainRequest[]> {
  return BargainRequestModel.find({
    productId,
    userId,
    isActive: true,
  })
    .sort({ createdAt: -1 })
    .exec();
}

/** Recent bargain history for a user, optionally scoped to one product.
 *  Used by the GET /api/bargain endpoint. Capped at 10 most recent. */
export function findRecentBargainHistory(
  userId: string,
  productId?: string,
): Promise<IBargainRequest[]> {
  const query: { userId: string; isActive: boolean; productId?: string } = {
    userId,
    isActive: true,
  };
  if (productId) query.productId = productId;

  return BargainRequestModel.find(query)
    .sort({ createdAt: -1 })
    .limit(10)
    .lean()
    .exec() as unknown as Promise<IBargainRequest[]>;
}

/** Look up an unredeemed bargain coupon scoped to a user + product.
 *  Returns null when code/user/product mismatch, when already used,
 *  or when marked inactive. Code lookup is case-insensitive via the
 *  schema's `uppercase: true` modifier. */
export function findRedeemableBargainCoupon(
  code: string,
  productId: string,
  userId: string,
): Promise<IBargainCoupon | null> {
  return BargainCouponModel.findOne({
    code: code.toUpperCase(),
    productId,
    userId,
    isActive: true,
    isUsed: false,
  }).exec();
}

/** Find unredeemed bargain coupons by code (no user/product filter).
 *  Used at checkout when consuming coupons passed in by the cart. */
export function findRedeemableBargainCouponsByCode(
  codes: string[],
  opts: { session?: ClientSession } = {},
): Promise<IBargainCoupon[]> {
  const query = BargainCouponModel.find({
    code: { $in: codes },
    isActive: true,
    isUsed: false,
    validUntil: { $gt: new Date() },
  });
  if (opts.session) query.session(opts.session);
  return query.exec();
}

// ─── Write operations ──────────────────────────────────────────────

/** Create a BargainRequest record (accepted, rejected, or otherwise).
 *  Caller decides the `status` and supplies all required fields. */
export function createBargainRequest(
  data: Partial<IBargainRequest>,
  opts: { session?: ClientSession } = {},
): Promise<IBargainRequest> {
  if (opts.session) {
    return BargainRequestModel.create([data], { session: opts.session }).then(
      (docs) => docs[0],
    );
  }
  return BargainRequestModel.create(data);
}

/** Create a BargainCoupon record. Typically paired with an accepted
 *  BargainRequest; the route handler currently does the two creates
 *  back-to-back without a transaction, so this function mirrors that
 *  un-transactional behavior. (Phase 2 doesn't change behavior; the
 *  un-transactional pairing is a documented quirk to revisit.) */
export function createBargainCoupon(
  data: Partial<IBargainCoupon>,
  opts: { session?: ClientSession } = {},
): Promise<IBargainCoupon> {
  if (opts.session) {
    return BargainCouponModel.create([data], { session: opts.session }).then(
      (docs) => docs[0],
    );
  }
  return BargainCouponModel.create(data);
}

/** Mark a set of bargain coupon documents as used at checkout time.
 *  Mutates the documents in place + persists via save(). Mirrors the
 *  exact mutation pattern in checkout/order/route.ts so behavior is
 *  preserved when that route is later refactored to call this. */
export async function markBargainCouponsUsed(
  coupons: IBargainCoupon[],
  opts: { session?: ClientSession } = {},
): Promise<void> {
  const now = new Date();
  for (const coupon of coupons) {
    coupon.isUsed = true;
    coupon.usedAt = now;
    await coupon.save(opts.session ? { session: opts.session } : undefined);
  }
}
