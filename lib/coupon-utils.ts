// Re-export shim.
//
// The coupon domain has been extracted to features/coupon/*. This file
// stays so existing import sites (`import { validateGlobalCoupon }
// from "@/lib/coupon-utils"`, etc.) keep working unchanged. New code
// should import from features/coupon/* directly.

export type { CouponType, CouponCompatibilityResult } from "@/features/coupon/domain";
export { checkCouponCompatibility } from "@/features/coupon/domain";

export type { CouponValidationResult } from "@/features/coupon/service";
export {
  validateGlobalCoupon,
  recordCouponUsage,
  getCouponStats,
} from "@/features/coupon/service";

export { validateBargainCoupon } from "@/features/bargain/service";
