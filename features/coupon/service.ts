// Coupon service — orchestration for global coupon validation,
// usage recording, and stats.
//
// validateGlobalCoupon coordinates the 9-step gauntlet a global
// coupon must pass before it can apply to an order:
//   1. Code exists + isActive
//   2. isValidForUse (not expired, not fully used)
//   3. orderAmount >= minOrderAmount
//   4. (if userId given AND user exists)
//      a. firstOrderOnly check
//      b. userEligibility (new_users / specific_users)
//      c. per-user usage cap
//   5. total usage cap (maxUses)
//   6. (if items given) product applicability — filter and re-min
//   7. Discount math
//
// Logic moved verbatim from lib/coupon-utils.ts so behavior is
// identical. Documented quirks (silent bypass when userId references
// a non-existent user) carry over and are locked in by tests.

import { log } from "@/lib/logger";
import { UserModel } from "@/models/User";
import {
  calculateDiscount,
  isApplicableToProduct,
  isUserEligible,
} from "./domain";
import type { CouponType } from "./domain";
import {
  findActiveGlobalCouponByCode,
  findGlobalCouponByCode,
  countOrdersForUser,
  countCouponUsagesForUser,
  insertCouponUsage,
  incrementGlobalCouponUsage,
  aggregateCouponUsageStats,
} from "./repository";

export interface CouponValidationResult {
  valid: boolean;
  message: string;
  discountAmount?: number;
  discountPercentage?: number;
  couponType?: CouponType;
  couponCode?: string;
}

interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  categoryId?: string;
}

export async function validateGlobalCoupon(
  couponCode: string,
  orderAmount: number,
  userId?: string,
  items?: CartItem[],
): Promise<CouponValidationResult> {
  try {
    const coupon = await findActiveGlobalCouponByCode(couponCode);

    if (!coupon) {
      return { valid: false, message: "Invalid coupon code" };
    }

    if (!coupon.isValidForUse) {
      return {
        valid: false,
        message: coupon.isExpired
          ? "Coupon has expired"
          : coupon.isFullyUsed
            ? "Coupon usage limit reached"
            : "Coupon is not active",
      };
    }

    if (orderAmount < coupon.minOrderAmount) {
      return {
        valid: false,
        message: `Minimum order of Rs ${coupon.minOrderAmount} required`,
      };
    }

    // User-restriction block. NOTE: this is gated on
    // `if (user)` — when userId points to a missing/deleted user,
    // firstOrderOnly + userEligibility + per-user cap are all
    // silently bypassed. Documented bug; locked in by integration
    // test "bypasses firstOrderOnly when userId references a
    // non-existent user".
    if (userId) {
      const user = await UserModel.findById(userId);
      if (user) {
        if (coupon.firstOrderOnly) {
          const orderCount = await countOrdersForUser(userId);
          if (orderCount > 0) {
            return {
              valid: false,
              message: "This coupon is for first orders only",
            };
          }
        }

        const userOrderCount = await countOrdersForUser(userId);
        if (!isUserEligible(coupon, userId, userOrderCount)) {
          return {
            valid: false,
            message: "You are not eligible for this coupon",
          };
        }

        const userUsageCount = await countCouponUsagesForUser(
          coupon.code,
          userId,
        );
        if (userUsageCount >= coupon.maxUsesPerUser) {
          return {
            valid: false,
            message: "You have already used this coupon",
          };
        }
      }
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return { valid: false, message: "Coupon usage limit reached" };
    }

    // Product applicability — only relevant when items + product
    // restriction are both present. The applicable subtotal then has
    // to pass minOrderAmount on its own.
    if (items && items.length > 0 && coupon.applicableTo !== "all_products") {
      const applicableItems = items.filter((item) =>
        isApplicableToProduct(coupon, item.productId, item.categoryId),
      );

      if (applicableItems.length === 0) {
        return {
          valid: false,
          message: "Coupon not applicable to items in cart",
        };
      }

      const applicableAmount = applicableItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      if (applicableAmount < coupon.minOrderAmount) {
        return {
          valid: false,
          message: `Minimum order of Rs ${coupon.minOrderAmount} required for applicable items`,
        };
      }

      const discountAmount = calculateDiscount(coupon, applicableAmount);

      return {
        valid: true,
        message: `Global coupon applied: ${coupon.discountValue}${
          coupon.discountType === "percentage" ? "%" : " Rs"
        } off`,
        discountAmount,
        discountPercentage:
          coupon.discountType === "percentage"
            ? coupon.discountValue
            : undefined,
        couponType: "global",
        couponCode: coupon.code,
      };
    }

    // Whole-order discount path.
    const discountAmount = calculateDiscount(coupon, orderAmount);
    return {
      valid: true,
      message: `Global coupon applied: ${coupon.discountValue}${
        coupon.discountType === "percentage" ? "%" : " Rs"
      } off`,
      discountAmount,
      discountPercentage:
        coupon.discountType === "percentage" ? coupon.discountValue : undefined,
      couponType: "global",
      couponCode: coupon.code,
    };
  } catch (error) {
    log.error("Error validating global coupon", {
      error: error as Error,
      couponCode,
    });
    return { valid: false, message: "Error validating coupon" };
  }
}

// ─── Usage recording ───────────────────────────────────────────────

// couponType is narrowed to the two values the CouponUsage schema
// actually accepts — "loyalty" exists in the domain CouponType for
// future use but the schema would reject it at save time. Compile-
// time narrowing prevents a runtime ValidationError.
export async function recordCouponUsage(
  couponCode: string,
  couponType: "bargain" | "global",
  userId: string,
  orderId: string,
  discountApplied: number,
  orderAmount: number,
  orderAmountAfterDiscount: number,
  ipAddress?: string,
  userAgent?: string,
): Promise<boolean> {
  try {
    await insertCouponUsage({
      couponCode,
      couponType,
      userId,
      orderId,
      discountApplied,
      orderAmount,
      orderAmountAfterDiscount,
      ipAddress,
      userAgent,
    });

    if (couponType === "global") {
      await incrementGlobalCouponUsage(couponCode, discountApplied);
    }

    log.info("Coupon usage recorded", { couponCode, orderId, userId });
    return true;
  } catch (error) {
    log.error("Error recording coupon usage", {
      error: error as Error,
      couponCode,
      orderId,
    });
    return false;
  }
}

// ─── Stats ─────────────────────────────────────────────────────────

export async function getCouponStats(couponCode: string) {
  try {
    const coupon = await findGlobalCouponByCode(couponCode);
    if (!coupon) return null;

    const stats = (await aggregateCouponUsageStats(couponCode)) ?? {
      totalOrders: 0,
      totalDiscount: 0,
      avgDiscountPerOrder: 0,
      uniqueUserCount: 0,
    };

    return {
      coupon: {
        code: coupon.code,
        name: coupon.name,
        usedCount: coupon.usedCount,
        totalDiscountGiven: coupon.totalDiscountGiven,
        remainingUses: coupon.remainingUses,
        daysRemaining: coupon.daysRemaining,
        isValidForUse: coupon.isValidForUse,
      },
      stats,
    };
  } catch (error) {
    log.error("Error getting coupon stats", {
      error: error as Error,
      couponCode,
    });
    return null;
  }
}
