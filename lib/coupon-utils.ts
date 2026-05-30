import { UserModel } from "@/models";
import { log } from "./logger";
import { OrderModel } from "@/models/Order";
import { CouponServices, GlobalCouponModel } from "@/models/GlobalCoupon";
import { CouponUsageModel } from "@/models/CouponUsage";

// Types of coupons in our system
export type CouponType = "bargain" | "global" | "loyalty";

interface CouponValidationResult {
  valid: boolean;
  message: string;
  discountAmount?: number;
  discountPercentage?: number;
  couponType?: CouponType;
  couponCode?: string;
}

// Validate bargain coupon
export async function validateBargainCoupon(
  couponCode: string,
  productId: string,
  userId: string,
  currentPrice: number
): Promise<CouponValidationResult> {
  try {
    // Import model dynamically to avoid circular dependencies
    const { BargainCouponModel } = await import("@/models/BargainCoupon");

    const coupon = await BargainCouponModel.findOne({
      code: couponCode.toUpperCase(),
      productId,
      userId,
      isActive: true,
      isUsed: false,
    });

    if (!coupon) {
      return {
        valid: false,
        message: "Invalid coupon for this product",
      };
    }

    // Check validity period
    const now = new Date();
    if (now < coupon.validFrom) {
      return {
        valid: false,
        message: "Coupon not yet valid",
      };
    }

    if (now > coupon.validUntil) {
      return {
        valid: false,
        message: "Coupon has expired",
      };
    }

    // Price guard:
    //  - If the current price has dropped below the bargained original, reject.
    //    Otherwise the bargain discount stacks on top of the admin's price cut.
    //  - If the current price is up to 10% above the bargained original, accept
    //    (covers small admin tweaks). Larger increases require re-bargaining.
    if (currentPrice < coupon.originalPrice) {
      return {
        valid: false,
        message:
          "Product price has dropped — your bargain no longer applies. Buy at the current price or request a new bargain.",
      };
    }
    const upperTolerance = coupon.originalPrice * 0.1;
    if (currentPrice > coupon.originalPrice + upperTolerance) {
      return {
        valid: false,
        message: "Product price has changed significantly",
      };
    }

    return {
      valid: true,
      message: "Coupon applied successfully",
      discountAmount: coupon.discountAmount,
      discountPercentage: coupon.discountPercentage,
      couponType: "bargain",
    };
  } catch (error) {
    log.error("Error validating bargain coupon", {
      error: error as Error,
      couponCode,
      productId,
    });
    return {
      valid: false,
      message: "Error validating coupon",
    };
  }
}

// Validate global coupon (for entire order)
export async function validateGlobalCoupon(
  couponCode: string,
  orderAmount: number,
  userId?: string,
  items?: Array<{
    productId: string;
    quantity: number;
    price: number;
    categoryId?: string;
  }>
): Promise<CouponValidationResult> {
  try {
    // Find global coupon
    const coupon = await GlobalCouponModel.findOne({
      code: couponCode.toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      return {
        valid: false,
        message: "Invalid coupon code",
      };
    }

    // Check if coupon is valid for use
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

    // Check minimum order amount
    if (orderAmount < coupon.minOrderAmount) {
      return {
        valid: false,
        message: `Minimum order of Rs ${coupon.minOrderAmount} required`,
      };
    }

    // Check user eligibility if userId provided
    if (userId) {
      const user = await UserModel.findById(userId);
      if (user) {
        // Check first order restriction
        if (coupon.firstOrderOnly) {
          const orderCount = await OrderModel.countDocuments({ userId });
          if (orderCount > 0) {
            return {
              valid: false,
              message: "This coupon is for first orders only",
            };
          }
        }

        // Check user eligibility
        const userOrderCount = await OrderModel.countDocuments({ userId });
        const isEligible = CouponServices.isUserEligible(
          coupon,
          userId,
          userOrderCount
        );
        if (!isEligible) {
          return {
            valid: false,
            message: "You are not eligible for this coupon",
          };
        }

        // Check per-user usage limit
        const userUsageCount = await CouponUsageModel.countDocuments({
          couponCode: coupon.code,
          userId,
          isReverted: false,
        });

        if (userUsageCount >= coupon.maxUsesPerUser) {
          return {
            valid: false,
            message: "You have already used this coupon",
          };
        }
      }
    }

    // Check total usage limit
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return {
        valid: false,
        message: "Coupon usage limit reached",
      };
    }

    // Check product applicability if items provided
    if (items && items.length > 0 && coupon.applicableTo !== "all_products") {
      const applicableItems = items.filter((item) =>
        CouponServices.isApplicableToProduct(
          coupon,
          item.productId,
          item.categoryId
        )
      );

      if (applicableItems.length === 0) {
        return {
          valid: false,
          message: "Coupon not applicable to items in cart",
        };
      }

      // Calculate applicable order amount
      const applicableAmount = applicableItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      if (applicableAmount < coupon.minOrderAmount) {
        return {
          valid: false,
          message: `Minimum order of Rs ${coupon.minOrderAmount} required for applicable items`,
        };
      }

      // Calculate discount for applicable items
      const discountAmount = CouponServices.calculateDiscount(
        coupon,
        applicableAmount
      );

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

    // Calculate discount for entire order
    const discountAmount = CouponServices.calculateDiscount(
      coupon,
      orderAmount
    );

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
    return {
      valid: false,
      message: "Error validating coupon",
    };
  }
}

export async function recordCouponUsage(
  couponCode: string,
  couponType: CouponType,
  userId: string,
  orderId: string,
  discountApplied: number,
  orderAmount: number,
  orderAmountAfterDiscount: number,
  ipAddress?: string,
  userAgent?: string
) {
  try {
    const usage = new CouponUsageModel({
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

    await usage.save();

    // Update global coupon usage count if applicable
    if (couponType === 'global') {
      await GlobalCouponModel.findOneAndUpdate(
        { code: couponCode },
        { 
          $inc: { 
            usedCount: 1,
            totalDiscountGiven: discountApplied,
          },
          $set: { updatedAt: new Date() }
        }
      );
    }

    log.info('Coupon usage recorded', { couponCode, orderId, userId });
    return true;

  } catch (error) {
    log.error('Error recording coupon usage', { error: error as Error, couponCode, orderId });
    return false;
  }
}

// Check coupon compatibility (can't use bargain + global together)
export function checkCouponCompatibility(
  appliedCoupons: Array<{ type: CouponType; code: string }>
): {
  compatible: boolean;
  message: string;
  incompatibleTypes?: CouponType[];
} {
  const types = appliedCoupons.map(c => c.type);
  
  // Check if both bargain and global coupons are applied
  if (types.includes('bargain') && types.includes('global')) {
    return {
      compatible: false,
      message: 'Cannot use bargain coupons with global coupons',
      incompatibleTypes: ['bargain', 'global']
    };
  }

  // Check for duplicate coupon types
  const bargainCoupons = appliedCoupons.filter(c => c.type === 'bargain');
  if (bargainCoupons.length > 1) {
    return {
      compatible: false,
      message: 'Only one bargain coupon can be used per order'
    };
  }

  return {
    compatible: true,
    message: 'Coupons are compatible'
  };
}

export async function getCouponStats(couponCode: string) {
  try {
    const coupon = await GlobalCouponModel.findOne({ code: couponCode });
    if (!coupon) return null;

    const usageStats = await CouponUsageModel.aggregate([
      { $match: { couponCode, isReverted: false } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalDiscount: { $sum: '$discountApplied' },
          avgDiscountPerOrder: { $avg: '$discountApplied' },
          uniqueUsers: { $addToSet: '$userId' },
        }
      },
      {
        $project: {
          totalOrders: 1,
          totalDiscount: 1,
          avgDiscountPerOrder: 1,
          uniqueUserCount: { $size: '$uniqueUsers' },
        }
      }
    ]);

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
      stats: usageStats[0] || {
        totalOrders: 0,
        totalDiscount: 0,
        avgDiscountPerOrder: 0,
        uniqueUserCount: 0,
      },
    };

  } catch (error) {
    log.error('Error getting coupon stats', { error: error as Error, couponCode });
    return null;
  }
}
