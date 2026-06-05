// Coupon repository — every DB access for the coupon domain.
//
// Covers two collections:
//   - GlobalCoupon: admin-issued promo codes
//   - CouponUsage:  audit trail, one row per coupon application
//
// Functions are thin Mongoose wrappers; business logic lives in
// features/coupon/service.ts. Optional ClientSession parameter
// matches the bargain repository pattern.

import type { ClientSession } from "mongoose";
import { GlobalCouponModel, type IGlobalCoupon } from "@/models/GlobalCoupon";
import { CouponUsageModel, type ICouponUsage } from "@/models/CouponUsage";
import { OrderModel } from "@/models/Order";

// ─── Read operations ───────────────────────────────────────────────

/** Look up an active global coupon by code. Code lookup is
 *  case-insensitive via the schema's `uppercase: true` modifier. */
export function findActiveGlobalCouponByCode(
  code: string,
): Promise<IGlobalCoupon | null> {
  return GlobalCouponModel.findOne({
    code: code.toUpperCase(),
    isActive: true,
  }).exec();
}

/** Look up a global coupon by code regardless of isActive — used by
 *  admin stats endpoints that need to surface deactivated coupons. */
export function findGlobalCouponByCode(
  code: string,
): Promise<IGlobalCoupon | null> {
  return GlobalCouponModel.findOne({ code }).exec();
}

/** Number of orders this user has ever placed. Used for first-order
 *  and new-user eligibility checks during coupon validation. */
export function countOrdersForUser(userId: string): Promise<number> {
  return OrderModel.countDocuments({ userId }).exec();
}

/** Non-reverted prior usages of this coupon by this user. Reverted
 *  usages don't count against the per-user cap (mirrors the original
 *  query at lib/coupon-utils.ts validateGlobalCoupon). */
export function countCouponUsagesForUser(
  couponCode: string,
  userId: string,
): Promise<number> {
  return CouponUsageModel.countDocuments({
    couponCode,
    userId,
    isReverted: false,
  }).exec();
}

/** Aggregate stats for a coupon — total orders, total discount,
 *  average per-order discount, unique user count. Returns null when
 *  there are no non-reverted usages yet. */
export async function aggregateCouponUsageStats(couponCode: string) {
  const rows = await CouponUsageModel.aggregate([
    { $match: { couponCode, isReverted: false } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalDiscount: { $sum: "$discountApplied" },
        avgDiscountPerOrder: { $avg: "$discountApplied" },
        uniqueUsers: { $addToSet: "$userId" },
      },
    },
    {
      $project: {
        totalOrders: 1,
        totalDiscount: 1,
        avgDiscountPerOrder: 1,
        uniqueUserCount: { $size: "$uniqueUsers" },
      },
    },
  ]);
  return rows[0] ?? null;
}

// ─── Write operations ──────────────────────────────────────────────

/** Insert a coupon usage record. Caller is responsible for ensuring
 *  the coupon was actually applied to the order. */
export function insertCouponUsage(
  data: Partial<ICouponUsage>,
  opts: { session?: ClientSession } = {},
): Promise<ICouponUsage> {
  const doc = new CouponUsageModel(data);
  return opts.session ? doc.save({ session: opts.session }) : doc.save();
}

/** Increment the global coupon's usedCount + totalDiscountGiven by the
 *  amount applied. Stamps updatedAt. Used after a successful order. */
export function incrementGlobalCouponUsage(
  code: string,
  discountApplied: number,
): Promise<IGlobalCoupon | null> {
  return GlobalCouponModel.findOneAndUpdate(
    { code },
    {
      $inc: {
        usedCount: 1,
        totalDiscountGiven: discountApplied,
      },
      $set: { updatedAt: new Date() },
    },
  ).exec();
}

/** Generate a candidate code and check uniqueness against the
 *  collection. Retries up to 10 times before giving up. Used by
 *  admin coupon generation. */
export async function generateUniqueCouponCode(
  length: number = 8,
): Promise<string> {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for (let attempts = 0; attempts < 10; attempts++) {
    let code = "";
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const existing = await GlobalCouponModel.findOne({ code });
    if (!existing) return code;
  }
  throw new Error("Failed to generate unique coupon code");
}

/** Bulk-insert global coupons from a template. Generates a fresh
 *  unique code per row. Used by admin bulk-create endpoint. */
export async function bulkInsertGlobalCoupons(
  count: number,
  template: Partial<IGlobalCoupon>,
  createdBy: string,
): Promise<IGlobalCoupon[]> {
  const coupons = [];
  for (let i = 0; i < count; i++) {
    const code = await generateUniqueCouponCode(10);
    coupons.push({ ...template, code, createdBy });
  }
  return GlobalCouponModel.insertMany(coupons) as unknown as Promise<
    IGlobalCoupon[]
  >;
}
