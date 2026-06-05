// Bargain service — orchestration layer.
//
// Coordinates the bargain submission flow that lives inline in
// app/api/bargain/route.ts today:
//   1. Find the user's prior active bargains for this product
//   2. Compute which round they're on
//   3. Reject early if they've blown past the round cap
//   4. Run domain validation on the offered price
//   5. On rejection: persist a 'rejected' BargainRequest
//   6. On acceptance: persist an 'accepted' BargainRequest +
//      generate and persist a BargainCoupon
//
// Side effects deliberately NOT in the service: emails, logging,
// HTTP response shaping. Those stay in the caller (route handler)
// so this module is testable in isolation and free of next/server.

import {
  validateBargainOffer,
  calculateDiscountPercentage,
  generateBargainCouponCode,
} from "./domain";
import {
  createBargainRequest,
  createBargainCoupon,
  findActiveBargainsForUserAndProduct,
  findRecentBargainHistory,
  findRedeemableBargainCoupon,
} from "./repository";
import { log } from "@/lib/logger";

/** Minimal product surface the service needs. Decoupled from the
 *  full Mongoose document so service tests can pass plain objects. */
export interface BargainServiceProduct {
  id: string;
  price: number;
  discountedPrice?: number;
  minBargainPrice?: number;
  maxBargainRounds: number;
}

export interface SubmitOfferInput {
  userId: string;
  product: BargainServiceProduct;
  offeredPrice: number;
  message?: string;
}

/** Service outcomes. The route maps these to HTTP statuses:
 *  - rounds_exceeded → 400 (matches the original route's pre-check)
 *  - rejected        → 200 with success:false
 *  - accepted        → 201 with success:true                   */
export type SubmitOfferOutcome =
  | {
      outcome: "rounds_exceeded";
      data: {
        message: string;
        currentRound: number;
        maxRounds: number;
      };
    }
  | {
      outcome: "rejected";
      data: {
        status: "rejected";
        message: string;
        currentRound: number;
        maxRounds: number;
        bargainId: unknown;
      };
    }
  | {
      outcome: "accepted";
      data: {
        status: "accepted";
        message: string;
        couponCode: string;
        validUntil: Date;
        discountPercentage: number;
        savingAmount: number;
        originalPrice: number;
        offeredPrice: number;
        currentRound: number;
        maxRounds: number;
        bargainId: unknown;
        couponId: unknown;
      };
    };

const BARGAIN_VALIDITY_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function submitBargainOffer(
  input: SubmitOfferInput,
): Promise<SubmitOfferOutcome> {
  const { userId, product, offeredPrice, message } = input;

  // 1. Determine current round from prior active bargains.
  const previousBargains = await findActiveBargainsForUserAndProduct(
    userId,
    product.id,
  );
  const currentRound = previousBargains.length + 1;

  // 2. Pre-check: the original route returns HTTP 400 (a distinct path
  //    from domain rejection) when currentRound STRICTLY exceeds
  //    maxRounds. validateBargainOffer also rejects when currentRound
  //    >= maxRounds, but with a different response shape. Preserve
  //    both paths exactly.
  if (currentRound > product.maxBargainRounds) {
    return {
      outcome: "rounds_exceeded",
      data: {
        message: `Maximum ${product.maxBargainRounds} bargain rounds reached`,
        currentRound,
        maxRounds: product.maxBargainRounds,
      },
    };
  }

  const currentPrice = product.discountedPrice || product.price;
  const minPrice = product.minBargainPrice ?? 0;

  // 3. Domain validation.
  const validation = validateBargainOffer(
    offeredPrice,
    minPrice,
    currentPrice,
    currentRound,
    product.maxBargainRounds,
  );

  // 4. Rejection path — record the attempt and surface the rejection.
  if (!validation.valid) {
    const rejectedBargain = await createBargainRequest({
      productId: product.id,
      userId,
      originalPrice: currentPrice,
      offeredPrice,
      minPrice,
      status: "rejected",
      message,
      bargainRound: currentRound,
      maxRounds: product.maxBargainRounds,
      expiresAt: new Date(Date.now() + BARGAIN_VALIDITY_MS),
    });

    return {
      outcome: "rejected",
      data: {
        status: "rejected",
        message: validation.message,
        currentRound,
        maxRounds: product.maxBargainRounds,
        bargainId: rejectedBargain._id,
      },
    };
  }

  // 5. Acceptance path — persist the request + coupon, return success.
  //    NOTE: these two creates are not transactionally paired (mirror
  //    of the route handler's prior behavior). If the coupon create
  //    fails the request still exists. Documented quirk.
  const discountPercentage = calculateDiscountPercentage(
    currentPrice,
    offeredPrice,
  );
  const savingAmount = currentPrice - offeredPrice;
  const couponCode = generateBargainCouponCode();
  const validUntil = new Date(Date.now() + BARGAIN_VALIDITY_MS);

  const acceptedBargain = await createBargainRequest({
    productId: product.id,
    userId,
    originalPrice: currentPrice,
    offeredPrice,
    minPrice,
    status: "accepted",
    message,
    couponCode,
    couponExpiresAt: validUntil,
    bargainRound: currentRound,
    maxRounds: product.maxBargainRounds,
    expiresAt: validUntil,
  });

  const bargainCoupon = await createBargainCoupon({
    code: couponCode,
    productId: product.id,
    userId,
    bargainRequestId: acceptedBargain._id?.toString(),
    originalPrice: currentPrice,
    discountedPrice: offeredPrice,
    discountAmount: savingAmount,
    discountPercentage,
    validFrom: new Date(),
    validUntil,
  });

  return {
    outcome: "accepted",
    data: {
      status: "accepted",
      message: validation.message,
      couponCode,
      validUntil,
      discountPercentage,
      savingAmount,
      originalPrice: currentPrice,
      offeredPrice,
      currentRound,
      maxRounds: product.maxBargainRounds,
      bargainId: acceptedBargain._id,
      couponId: bargainCoupon._id,
    },
  };
}

// ─── History fetch ─────────────────────────────────────────────────

export interface BargainHistoryEntry {
  id: unknown;
  productId: string;
  originalPrice: number;
  offeredPrice: number;
  status: string;
  discountPercentage: number;
  couponCode?: string;
  couponExpiresAt?: Date;
  bargainRound: number;
  maxRounds: number;
  createdAt?: Date;
  isExpired: boolean;
}

export interface BargainHistoryResult {
  history: BargainHistoryEntry[];
  total: number;
  /** Next round number a user would be on for a new bargain attempt.
   *  Counts only non-rejected entries (mirrors current API behavior). */
  currentRound: number;
}

// ─── Bargain coupon redemption check ───────────────────────────────
//
// Validates a stored bargain coupon at checkout time. Moved here from
// lib/coupon-utils.ts because it operates entirely on bargain-domain
// state — the coupon, its validity window, and the current product
// price relative to the bargained original.
//
// The price guard is intentional: if the admin cut the sticker price
// after the bargain was struck, the bargained discount would
// "double-apply" against the lower sticker. Reject and force the user
// to re-bargain at the new price. A small upward drift (≤10%) is
// tolerated so trivial admin price tweaks don't invalidate active
// coupons.

export interface BargainCouponValidationResult {
  valid: boolean;
  message: string;
  discountAmount?: number;
  discountPercentage?: number;
  couponType?: "bargain";
}

export async function validateBargainCoupon(
  couponCode: string,
  productId: string,
  userId: string,
  currentPrice: number,
): Promise<BargainCouponValidationResult> {
  try {
    const coupon = await findRedeemableBargainCoupon(
      couponCode,
      productId,
      userId,
    );

    if (!coupon) {
      return {
        valid: false,
        message: "Invalid coupon for this product",
      };
    }

    // Validity window.
    const now = new Date();
    if (now < coupon.validFrom) {
      return { valid: false, message: "Coupon not yet valid" };
    }
    if (now > coupon.validUntil) {
      return { valid: false, message: "Coupon has expired" };
    }

    // Price guard — see file-level comment above.
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
    return { valid: false, message: "Error validating coupon" };
  }
}

export async function getRecentBargainHistory(
  userId: string,
  productId?: string,
): Promise<BargainHistoryResult> {
  const bargains = await findRecentBargainHistory(userId, productId);

  const history: BargainHistoryEntry[] = bargains.map((bargain) => ({
    id: bargain._id,
    productId: bargain.productId,
    originalPrice: bargain.originalPrice,
    offeredPrice: bargain.offeredPrice,
    status: bargain.status,
    discountPercentage: Math.round(
      ((bargain.originalPrice - bargain.offeredPrice) / bargain.originalPrice) *
        100,
    ),
    couponCode: bargain.couponCode,
    couponExpiresAt: bargain.couponExpiresAt,
    bargainRound: bargain.bargainRound,
    maxRounds: bargain.maxRounds,
    createdAt: bargain.createdAt,
    isExpired: bargain.couponExpiresAt
      ? new Date() > new Date(bargain.couponExpiresAt)
      : false,
  }));

  return {
    history,
    total: history.length,
    currentRound: history.filter((b) => b.status !== "rejected").length + 1,
  };
}
