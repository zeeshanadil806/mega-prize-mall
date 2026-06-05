// Coupon domain schemas.
//
// Re-exports the Zod schemas + Mongoose types for global coupons and
// coupon usage records from models/*. Phase 3 will physically move
// them here.

export {
  GlobalCouponSchema,
  type GlobalCouponInput,
  type IGlobalCoupon,
} from "@/models/GlobalCoupon";

export {
  CouponUsageSchema,
  type CouponUsage,
  type ICouponUsage,
} from "@/models/CouponUsage";
