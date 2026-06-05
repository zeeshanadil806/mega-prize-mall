// Wallet domain — pure point-math functions.
//
// The system mints 1 point per Rs 10 of order grand total, and lets
// users redeem points at 10 points = Rs 1 (i.e. each point is worth
// Rs 0.10). Redemption is capped at 10% of the order amount to
// prevent runaway discounts.
//
// Moved here from lib/bargain-utils.ts (Phase 2). lib/bargain-utils.ts
// retains re-exports for the ~5 existing import sites; new code
// should import from this module directly.

const POINT_VALUE_RUPEES = 0.1;
const POINTS_PER_RUPEE = 10;
const REDEMPTION_CAP_FRACTION = 0.1; // up to 10% of order value

/** Points awarded for a completed order. Rounds down — Rs 99 spend
 *  earns 9 points, not 10. */
export function calculatePointsForOrder(orderAmount: number): number {
  return Math.floor(orderAmount / 10);
}

/** How many of `userPoints` can be applied to a `orderAmount` order.
 *  Cap = 10% of order in rupees, converted to points. Returns the
 *  actual usable amount + its rupee value + a canRedeem flag. */
export function calculateMaxRedeemablePoints(
  orderAmount: number,
  userPoints: number,
): {
  maxPoints: number;
  maxDiscount: number;
  canRedeem: boolean;
} {
  const maxDiscountRupees = orderAmount * REDEMPTION_CAP_FRACTION;
  const cap = Math.floor(maxDiscountRupees * POINTS_PER_RUPEE);
  const usable = Math.min(userPoints, cap);

  return {
    maxPoints: usable,
    maxDiscount: usable * POINT_VALUE_RUPEES,
    canRedeem: usable > 0,
  };
}

/** Rupee value of N points at the canonical 1 point = Rs 0.10 rate.
 *  Used by the manual redemption endpoint to compute the discount
 *  voucher value. */
export function calculateRedemptionValue(points: number): number {
  return points * POINT_VALUE_RUPEES;
}

/** Half-open window covering a single calendar day starting at the
 *  given midnight. The expiry cron uses this to scope its scan of
 *  earn-type transactions whose `expiresAt` falls within "today". */
export function getDayWindow(startOfDay: Date): {
  start: Date;
  end: Date;
} {
  const start = new Date(startOfDay);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}

/** Redemption voucher validity window (30 days) used by the manual
 *  redemption endpoint's metadata.expiresAt. Returns a future Date. */
export function getRedemptionExpiryDate(now: Date = new Date()): Date {
  return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
}
