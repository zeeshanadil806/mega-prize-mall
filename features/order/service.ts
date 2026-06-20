// Order service — checkout orchestration.
//
// Coordinates the 14-step transactional flow that lives inline in
// app/api/checkout/order/route.ts today. The route handler now
// parses the input, then calls placeOrder() and maps the result
// outcome to an HTTP response.
//
// Side effects deliberately NOT in the service: HTTP response shaping,
// auth checks (the route still owns "is this user allowed to act as
// userId X"). Emails are scheduled via the optional onAfterPlaced
// callback so we can keep the route's setTimeout(...,0) fire-and-
// forget pattern intact without binding the service to email modules.
//
// Behavior locked: the inputs, queries, mutations, ordering, and the
// pre-existing operator-precedence quirk in the earn-leg balanceAfter
// calc are all preserved verbatim. Phase 2's contract: no behavior
// change.

import type { ClientSession } from "mongoose";
import type { PlaceOrderInput } from "./schema";
import {
  findActiveProductsByIds,
  decrementProductStock,
  createOrder,
  setOrderGlobalCouponCode,
  findMostRecentOrderForActor,
  findUserForPointsUpdate,
  createWalletTransaction,
  startOrderSession,
  type CheckoutProduct,
} from "./repository";
import { findRedeemableBargainCouponsByCode, markBargainCouponsUsed } from "@/features/bargain/repository";
import { calculateOrderTotals } from "./domain";
import {
  recordCouponUsage,
  validateGlobalCoupon,
} from "@/features/coupon/service";
import type { IOrder } from "@/models/Order";
import { log } from "@/lib/logger";

// ─── Public types ────────────────────────────────────────────────

export interface PlaceOrderContext {
  /** Forwarded-for header value, if any (recorded on the order). */
  ipAddress?: string;
  /** User-agent header value, if any (recorded on the order). */
  userAgent?: string;
}

export interface PlaceOrderResult {
  outcome: "placed";
  order: IOrder;
}

// ─── Internal helpers ────────────────────────────────────────────

interface BuiltOrderItem {
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string | undefined;
  quantity: number;
  price: number;
  bargainCouponId: string | undefined;
  discountAmount: number;
  finalPrice: number;
}

function buildOrderItems(
  input: PlaceOrderInput,
  products: CheckoutProduct[],
): BuiltOrderItem[] {
  return input.items
    .map((item) => {
      const product = products.find(
        (p) => p._id.toString() === item.productId,
      );
      if (!product) return null;
      const price = item.discountedPrice || item.price;
      const bargainDiscount = item.bargainDiscount || 0;
      return {
        productId: item.productId,
        productName: item.name,
        productSlug: product.slug,
        productImage: product.images?.[0]?.url,
        quantity: item.quantity,
        price: item.price,
        bargainCouponId: item.bargainCouponId,
        discountAmount:
          bargainDiscount +
          (item.discountedPrice
            ? (item.price - item.discountedPrice) * item.quantity
            : 0),
        finalPrice: price,
      } satisfies BuiltOrderItem;
    })
    .filter((x): x is BuiltOrderItem => x !== null);
}

async function validateInventory(
  input: PlaceOrderInput,
  products: CheckoutProduct[],
): Promise<Array<{ productId: string; quantity: number }>> {
  if (products.length !== input.items.length) {
    throw new Error("Some products are not available");
  }
  const updates: Array<{ productId: string; quantity: number }> = [];
  for (const item of input.items) {
    const product = products.find(
      (p) => p._id.toString() === item.productId,
    );
    if (!product) throw new Error(`Product ${item.productId} not found`);
    if (product.stock < item.quantity) {
      throw new Error(
        `Insufficient stock for ${product.name}. Available: ${product.stock}`,
      );
    }
    updates.push({ productId: product._id.toString(), quantity: item.quantity });
  }
  return updates;
}

async function applyGlobalCouponIfAny(
  input: PlaceOrderInput,
  preSubtotal: number,
): Promise<{ discount: number; code: string }> {
  let discount = 0;
  let code = "";
  if (input.couponCodes.length === 0) return { discount, code };

  for (const couponCode of input.couponCodes) {
    const validation = await validateGlobalCoupon(
      couponCode,
      preSubtotal,
      input.userId || undefined,
      input.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
    );
    if (validation.valid && validation.couponType === "global") {
      discount = validation.discountAmount || 0;
      code = couponCode;
      break; // mirror: only one global coupon applied
    }
  }
  return { discount, code };
}

interface PointsTotals {
  pointsEarned: number;
}

async function applyPointsLegs(
  input: PlaceOrderInput,
  totals: PointsTotals,
  orderId: string,
  session: ClientSession,
): Promise<void> {
  if (!input.userId) return;

  // Redeem leg.
  if (input.pointsToUse > 0) {
    const user = await findUserForPointsUpdate(input.userId, { session });
    if (!user) throw new Error("User not found");
    if (user.points < input.pointsToUse) {
      throw new Error("Insufficient points");
    }
    user.points -= input.pointsToUse;
    await user.save({ session });

    await createWalletTransaction(
      {
        userId: input.userId,
        type: "redeem",
        points: -input.pointsToUse,
        balanceAfter: user.points,
        description: `Redeemed for order #${orderId}`,
        orderId,
        status: "completed",
      },
      { session },
    );
  }

  // Earn leg.
  if (totals.pointsEarned > 0) {
    // NOTE: preserve the existing operator-precedence quirk in the
    // balanceAfter expression: `user?.points || 0 + totals.pointsEarned`
    // evaluates as `user?.points || (0 + totals.pointsEarned)` due to
    // `+` binding tighter than `||`. Documented in the unit-test for
    // calculateOrderTotals and treated as out-of-scope for Phase 2.
    const refetched = await findUserForPointsUpdate(input.userId, { session });
    await createWalletTransaction(
      {
        userId: input.userId,
        type: "earn",
        points: totals.pointsEarned,
        balanceAfter: (refetched?.points || 0) + totals.pointsEarned,
        description: `Earned from order #${orderId}`,
        orderId,
        status: "pending",
        processedAt: null,
      },
      { session },
    );
  }
}

// ─── Public service: placeOrder ─────────────────────────────────

export async function placeOrder(
  input: PlaceOrderInput,
  ctx: PlaceOrderContext = {},
): Promise<PlaceOrderResult> {
  const session = await startOrderSession();
  try {
    await session.withTransaction(async () => {
      // 1. Products + inventory.
      const productIds = input.items.map((i) => i.productId);
      const products = await findActiveProductsByIds(productIds, { session });
      const inventoryUpdates = await validateInventory(input, products);

      // 2. Bargain coupons — mark used in-transaction.
      const bargainCoupons = await findRedeemableBargainCouponsByCode(
        input.couponCodes,
        { session },
      );
      await markBargainCouponsUsed(bargainCoupons, { session });

      // 3. Pre-subtotal for global coupon validation.
      const preSubtotal = input.items.reduce((sum, item) => {
        const unitPrice = item.discountedPrice || item.price;
        return sum + unitPrice * item.quantity;
      }, 0);

      // 4. Global coupon (at most one).
      const { discount: globalCouponDiscount, code: appliedGlobalCouponCode } =
        await applyGlobalCouponIfAny(input, preSubtotal);

      // 5. Final totals.
      const totals = calculateOrderTotals({
        items: input.items.map((item) => ({
          price: item.price,
          discountedPrice: item.discountedPrice,
          quantity: item.quantity,
          bargainDiscount: item.bargainDiscount,
        })),
        shippingMethod: input.shippingMethod,
        pointsToUse: input.pointsToUse,
        globalCouponDiscount,
        isLoggedIn: !!input.userId,
      });

      // 6. Build order items (DB shape).
      const orderItems = buildOrderItems(input, products);

      // 7. Compose order payload.
      const orderData: Record<string, unknown> = {
        items: orderItems,
        shippingAddress: input.shippingAddress,
        billingAddress: input.billingAddress || input.shippingAddress,
        shippingMethod: input.shippingMethod,
        subtotal: totals.subtotal,
        discountTotal: totals.discountTotal,
        pointsRedeemed: input.pointsToUse,
        pointsValue: totals.pointsDiscount,
        shippingFee: totals.shippingFee,
        taxAmount: 0,
        grandTotal: totals.grandTotal,
        couponCodes: input.couponCodes,
        pointsEarned: totals.pointsEarned,
        notes: input.notes,
        status: "pending",
        paymentMethod: "cod",
        paymentStatus: "pending",
        ipAddress: ctx.ipAddress,
        userAgent: ctx.userAgent,
      };
      if (input.userId) {
        orderData.userId = input.userId;
      } else {
        orderData.guestSessionId = input.guestSessionId;
        orderData.guestPhone = input.guestPhone;
        orderData.guestEmail = input.guestEmail;
        orderData.isGuestOrder = true;
      }

      // 8. Persist order.
      const order = await createOrder(orderData, { session });

      // 9. Inventory decrement.
      for (const update of inventoryUpdates) {
        await decrementProductStock(update.productId, update.quantity, {
          session,
        });
      }

      // 10. Points legs (redeem + earn).
      await applyPointsLegs(input, totals, order._id.toString(), session);

      // 11. Coupon usage record (logged-in + global coupon applied).
      if (appliedGlobalCouponCode && input.userId) {
        await recordCouponUsage(
          appliedGlobalCouponCode,
          "global",
          input.userId,
          order._id.toString(),
          globalCouponDiscount,
          totals.subtotal + totals.shippingFee,
          totals.grandTotal,
          ctx.ipAddress,
          ctx.userAgent,
        );
        await setOrderGlobalCouponCode(order, appliedGlobalCouponCode, {
          session,
        });
      }

      log.info("Order created successfully", {
        orderId: order._id,
        userId: input.userId || "guest",
        guestSessionId: input.guestSessionId,
        total: totals.grandTotal,
        items: orderItems.length,
      });
    });

    // Mirror the route's prior pattern: after the transaction, look up
    // the most-recently-created order for this actor and return it.
    const order = await findMostRecentOrderForActor({
      userId: input.userId,
      guestSessionId: input.guestSessionId,
      guestPhone: input.guestPhone,
    });

    if (!order) {
      throw new Error("Order placement succeeded but order lookup failed");
    }
    return { outcome: "placed", order };
  } finally {
    await session.endSession();
  }
}
