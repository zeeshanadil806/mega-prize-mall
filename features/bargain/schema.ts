// Bargain domain schemas.
//
// The Zod schemas for BargainRequest and BargainCoupon currently live
// in models/* (alongside the Mongoose definitions, the legacy layout).
// This file re-exports them so callers in features/bargain/* can
// import from a single domain-coherent path without depending on the
// models/* layout being permanent.
//
// In Phase 3 the Zod schemas physically move here and models/* either
// disappears or imports from this file.

export {
  BargainRequestSchema,
  type BargainRequest,
  type IBargainRequest,
} from "@/models/BargainRequest";

export {
  BargainCouponSchema,
  type BargainCoupon,
  type IBargainCoupon,
} from "@/models/BargainCoupon";
