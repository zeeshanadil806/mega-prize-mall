// Order domain — pure order-totalling math.
//
// Extracted from the inline math in app/api/checkout/order/route.ts.
// The route handler calls calculateOrderTotals(...) to derive subtotal,
// shipping fee, points discount, total discount, grand total, and
// points earned in one pass.
//
// Caller responsibility: feed only line items whose products have
// already been resolved and validated (presence, isActive, stock).
// This function does no DB access and trusts its inputs.

import { calculatePointsForOrder } from "@/features/wallet/domain";

export interface OrderLineInput {
  /** Original sticker price for the unit. */
  price: number;
  /** Optional admin-cut price; replaces `price` for subtotal contribution. */
  discountedPrice?: number;
  /** How many of this line. */
  quantity: number;
  /** Bargain discount in rupees (already applied/agreed per coupon). */
  bargainDiscount?: number;
}

export interface OrderTotalsInput {
  items: OrderLineInput[];
  shippingMethod: "standard" | "express";
  /** Points the user is redeeming. Ignored for guests. */
  pointsToUse: number;
  /** Validated global-coupon discount in rupees, if any. */
  globalCouponDiscount?: number;
  /** Whether the order is attached to a logged-in user.
   *  Guests don't earn points and can't redeem them. */
  isLoggedIn: boolean;
}

export interface OrderTotalsResult {
  subtotal: number;
  shippingFee: number;
  pointsDiscount: number;
  discountTotal: number;
  grandTotal: number;
  pointsEarned: number;
}

const POINT_VALUE_RUPEES = 0.1;
const EXPRESS_SHIPPING_FEE = 300;
const STANDARD_SHIPPING_FEE = 150;
const FREE_SHIPPING_THRESHOLD = 2000;

export function calculateOrderTotals(
  input: OrderTotalsInput,
): OrderTotalsResult {
  // 1. Subtotal + per-item bargain discount aggregation.
  //    The subtotal uses discountedPrice if present (admin store cut),
  //    otherwise the sticker price. The admin store-cut savings are
  //    therefore implicitly baked into subtotal; only the explicit
  //    bargainDiscount is added to discountTotal.
  let subtotal = 0;
  let perItemBargainDiscount = 0;
  for (const item of input.items) {
    const unitPrice = item.discountedPrice || item.price;
    subtotal += unitPrice * item.quantity;
    perItemBargainDiscount += item.bargainDiscount ?? 0;
  }

  // 2. Shipping fee — flat express, or threshold-based standard.
  const shippingFee =
    input.shippingMethod === "express"
      ? EXPRESS_SHIPPING_FEE
      : subtotal > FREE_SHIPPING_THRESHOLD
        ? 0
        : STANDARD_SHIPPING_FEE;

  // 3. Points redemption (logged-in only). 1 point = Rs 0.10.
  const pointsDiscount =
    input.isLoggedIn && input.pointsToUse > 0
      ? input.pointsToUse * POINT_VALUE_RUPEES
      : 0;

  // 4. Discount aggregate: per-item bargain + validated global coupon.
  const discountTotal =
    perItemBargainDiscount + (input.globalCouponDiscount ?? 0);

  // 5. Grand total — never negative; clamp at zero if discounts exceed
  //    subtotal+shipping (over-applied coupons, etc.).
  const grandTotal = Math.max(
    0,
    subtotal + shippingFee - discountTotal - pointsDiscount,
  );

  // 6. Points earned on the order (logged-in only).
  const pointsEarned = input.isLoggedIn
    ? calculatePointsForOrder(grandTotal)
    : 0;

  return {
    subtotal,
    shippingFee,
    pointsDiscount,
    discountTotal,
    grandTotal,
    pointsEarned,
  };
}
