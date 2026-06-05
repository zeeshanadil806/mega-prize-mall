// Bargain domain — pure functions.
//
// These are the price-math primitives the bargain flow rests on:
// offer validation, discount-percentage computation, coupon-code
// generation. They have no DB, no auth, no HTTP dependencies, so
// they're cheap to test and stable across the codebase's
// concurrency model.
//
// Moved here from lib/bargain-utils.ts as the first Phase 2
// extraction. lib/bargain-utils.ts re-exports these for
// backward compatibility with the ~20 existing importers
// scattered across the codebase; over time those should switch
// to importing directly from this module.

// Generate unique bargain coupon code
export function generateBargainCouponCode(): string {
  const prefix = "BARGAIN-";
  // Anti-confusion charset: A-Z minus I/O, digits 1-9 (no 0).
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ123456789";
  let code = "";

  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return prefix + code;
}

// Calculate bargain discount percentage. Returns negative when
// offeredPrice > originalPrice — the caller is expected to guard
// for that case (the bargain route handler does).
export function calculateDiscountPercentage(
  originalPrice: number,
  offeredPrice: number,
): number {
  return Math.round(((originalPrice - offeredPrice) / originalPrice) * 100);
}

// Validate a bargain offer against the product's bargain configuration.
//
// Order of checks (preserved from the original implementation — any
// reordering would change which error message a borderline offer sees):
//   1. Round limit       — currentRound >= maxRounds → max_rounds_reached
//   2. Price floor       — offeredPrice < minPrice  → too_low
//   3. Price ceiling     — offeredPrice >= originalPrice → too_high
//   4. Acceptance band   — within top 5% of original → "Offer accepted!"
//   5. Generous offer    — anything below the band → "Great offer!"
export function validateBargainOffer(
  offeredPrice: number,
  minPrice: number,
  originalPrice: number,
  currentRound: number,
  maxRounds: number,
): {
  valid: boolean;
  message: string;
  status: "acceptable" | "too_low" | "too_high" | "max_rounds_reached";
} {
  if (currentRound >= maxRounds) {
    return {
      valid: false,
      message: `Maximum ${maxRounds} bargain rounds reached`,
      status: "max_rounds_reached",
    };
  }

  if (offeredPrice < minPrice) {
    return {
      valid: false,
      message: `Offer must be at least Rs ${minPrice}`,
      status: "too_low",
    };
  }

  if (offeredPrice >= originalPrice) {
    return {
      valid: false,
      message: "Offer must be less than original price",
      status: "too_high",
    };
  }

  // Acceptance band: offers within the top 5% (close to sticker) get
  // the softer "Offer accepted" message; bigger discounts get the
  // enthusiastic "Great offer" wording. Both branches accept.
  const minDiscount = originalPrice * 0.05;
  if (offeredPrice > originalPrice - minDiscount) {
    return {
      valid: true,
      message: "Offer accepted! Generating coupon...",
      status: "acceptable",
    };
  }

  return {
    valid: true,
    message: "Great offer! Generating coupon...",
    status: "acceptable",
  };
}
