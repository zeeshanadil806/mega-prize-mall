// Coupon domain — pure functions.
//
// Today the coupon system supports three coupon types:
//   - bargain: per-user, per-product, single-use, from the bargain flow
//   - global:  admin-issued promo codes, may be percentage / fixed / free_shipping
//   - loyalty: reserved type, not yet used in routes (carried for future)
//
// Stacking rules + global-coupon discount math + applicability +
// eligibility live here because they're stateless. DB-bound flows
// (validateGlobalCoupon, recordCouponUsage, getCouponStats) live in
// features/coupon/service.ts.

import type { IGlobalCoupon } from "@/models/GlobalCoupon";

export type CouponType = "bargain" | "global" | "loyalty";

export interface CouponCompatibilityResult {
  compatible: boolean;
  message: string;
  /** Set when compatible:false and the conflict is type-based. */
  incompatibleTypes?: CouponType[];
}

/** Stacking rules:
 *   - bargain + global → incompatible (a bargained item already has
 *     a per-product discount; a global on top would double-discount).
 *   - More than one bargain coupon per order → incompatible
 *     (one bargain per cart maximum).
 *   - Anything else → compatible. */
export function checkCouponCompatibility(
  appliedCoupons: Array<{ type: CouponType; code: string }>,
): CouponCompatibilityResult {
  const types = appliedCoupons.map((c) => c.type);

  if (types.includes("bargain") && types.includes("global")) {
    return {
      compatible: false,
      message: "Cannot use bargain coupons with global coupons",
      incompatibleTypes: ["bargain", "global"],
    };
  }

  const bargainCoupons = appliedCoupons.filter((c) => c.type === "bargain");
  if (bargainCoupons.length > 1) {
    return {
      compatible: false,
      message: "Only one bargain coupon can be used per order",
    };
  }

  return {
    compatible: true,
    message: "Coupons are compatible",
  };
}

// ─── Discount math ─────────────────────────────────────────────────
//
// Computes the rupee discount a global coupon contributes against an
// order amount. Caller is responsible for supplying the *applicable*
// amount (e.g. when a coupon is product-restricted, sum only matching
// line items first via isApplicableToProduct).
//
// Free-shipping coupons contribute 0 to the line discount — shipping
// is handled separately in order-math and never appears as a line
// item, so its value isn't reflected here.

export function calculateDiscount(
  coupon: IGlobalCoupon,
  orderAmount: number,
): number {
  if (!coupon.isValidForUse) return 0;

  switch (coupon.discountType) {
    case "percentage": {
      const discount = (orderAmount * coupon.discountValue) / 100;
      return coupon.maxDiscountAmount
        ? Math.min(discount, coupon.maxDiscountAmount)
        : discount;
    }
    case "fixed":
      return Math.min(coupon.discountValue, orderAmount);
    case "free_shipping":
      return 0;
    default:
      return 0;
  }
}

// ─── Applicability ─────────────────────────────────────────────────
//
// A given product passes when:
//   - it's not in excludedProductIds, AND
//   - it matches the applicableTo rule:
//       all_products       → always pass
//       specific_products  → must be in coupon.productIds
//       specific_categories→ its categoryId must be in coupon.categoryIds
//
// Note the silent "false" for specific_categories when no categoryId
// is supplied — locks in current behavior.

export function isApplicableToProduct(
  coupon: IGlobalCoupon,
  productId: string,
  categoryId?: string,
): boolean {
  if (coupon.excludedProductIds.includes(productId)) return false;
  if (coupon.applicableTo === "all_products") return true;

  if (coupon.applicableTo === "specific_products") {
    return coupon.productIds.includes(productId);
  }

  if (coupon.applicableTo === "specific_categories" && categoryId) {
    return coupon.categoryIds.includes(categoryId);
  }
  return false;
}

// ─── User eligibility ──────────────────────────────────────────────

export function isUserEligible(
  coupon: IGlobalCoupon,
  userId: string,
  userOrderCount: number,
): boolean {
  if (coupon.userEligibility === "all_users") return true;
  if (coupon.userEligibility === "new_users") return userOrderCount === 0;
  if (coupon.userEligibility === "specific_users") {
    return coupon.specificUserIds.includes(userId);
  }
  return false;
}
