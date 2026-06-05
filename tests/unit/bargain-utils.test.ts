import { describe, it, expect } from "vitest";
// Bargain domain functions — imported from features/bargain/domain.
// Wallet math is tested separately in wallet-domain.test.ts.
// Display helpers still live in lib/bargain-utils pending the
// shared/format extract.
import {
  validateBargainOffer,
  calculateDiscountPercentage,
  generateBargainCouponCode,
} from "@/features/bargain/domain";
import { formatCurrency, formatPoints } from "@/lib/bargain-utils";

// These tests lock in the current behavior of the pure bargain
// utility functions. They survive the Phase 2 refactor unchanged
// because the functions will simply move to features/bargain/domain.ts
// without behavior changes.

describe("validateBargainOffer", () => {
  // Standard product: originalPrice=1000, minPrice=600, max 3 rounds
  const ORIGINAL = 1000;
  const MIN = 600;
  const MAX_ROUNDS = 3;

  describe("round limits", () => {
    it("rejects when currentRound equals maxRounds (>= guard)", () => {
      const result = validateBargainOffer(800, MIN, ORIGINAL, 3, MAX_ROUNDS);
      expect(result.valid).toBe(false);
      expect(result.status).toBe("max_rounds_reached");
      expect(result.message).toContain("Maximum 3 bargain rounds reached");
    });

    it("rejects when currentRound exceeds maxRounds", () => {
      const result = validateBargainOffer(800, MIN, ORIGINAL, 4, MAX_ROUNDS);
      expect(result.valid).toBe(false);
      expect(result.status).toBe("max_rounds_reached");
    });

    it("allows the first round", () => {
      const result = validateBargainOffer(800, MIN, ORIGINAL, 1, MAX_ROUNDS);
      expect(result.valid).toBe(true);
    });

    it("allows the second round when maxRounds is 3", () => {
      const result = validateBargainOffer(800, MIN, ORIGINAL, 2, MAX_ROUNDS);
      expect(result.valid).toBe(true);
    });
  });

  describe("price floor", () => {
    it("rejects offer below minPrice", () => {
      const result = validateBargainOffer(599, MIN, ORIGINAL, 1, MAX_ROUNDS);
      expect(result.valid).toBe(false);
      expect(result.status).toBe("too_low");
      expect(result.message).toContain("Offer must be at least Rs 600");
    });

    it("accepts offer exactly at minPrice", () => {
      const result = validateBargainOffer(MIN, MIN, ORIGINAL, 1, MAX_ROUNDS);
      expect(result.valid).toBe(true);
      expect(result.status).toBe("acceptable");
    });

    it("treats minPrice of 0 as no floor", () => {
      const result = validateBargainOffer(1, 0, ORIGINAL, 1, MAX_ROUNDS);
      expect(result.valid).toBe(true);
    });
  });

  describe("price ceiling", () => {
    it("rejects offer at original price", () => {
      const result = validateBargainOffer(
        ORIGINAL,
        MIN,
        ORIGINAL,
        1,
        MAX_ROUNDS,
      );
      expect(result.valid).toBe(false);
      expect(result.status).toBe("too_high");
    });

    it("rejects offer above original price", () => {
      const result = validateBargainOffer(1500, MIN, ORIGINAL, 1, MAX_ROUNDS);
      expect(result.valid).toBe(false);
      expect(result.status).toBe("too_high");
    });

    it("accepts offer one rupee below original price", () => {
      const result = validateBargainOffer(999, MIN, ORIGINAL, 1, MAX_ROUNDS);
      expect(result.valid).toBe(true);
    });
  });

  describe("acceptance messaging", () => {
    it("uses 'Offer accepted' wording when offer is in the top 5% band", () => {
      // top 5% band = offer > 950
      const result = validateBargainOffer(960, MIN, ORIGINAL, 1, MAX_ROUNDS);
      expect(result.valid).toBe(true);
      expect(result.message).toBe("Offer accepted! Generating coupon...");
    });

    it("uses 'Great offer' wording when offer is a bigger discount", () => {
      // outside top 5% band: <= 950
      const result = validateBargainOffer(800, MIN, ORIGINAL, 1, MAX_ROUNDS);
      expect(result.valid).toBe(true);
      expect(result.message).toBe("Great offer! Generating coupon...");
    });
  });
});

describe("calculateDiscountPercentage", () => {
  it("computes 50% for half-price offer", () => {
    expect(calculateDiscountPercentage(1000, 500)).toBe(50);
  });

  it("computes 0% when prices are equal", () => {
    expect(calculateDiscountPercentage(1000, 1000)).toBe(0);
  });

  it("computes 10% with rounding", () => {
    expect(calculateDiscountPercentage(1000, 900)).toBe(10);
  });

  it("rounds to nearest integer", () => {
    // (1000 - 333) / 1000 = 0.667 → 67%
    expect(calculateDiscountPercentage(1000, 333)).toBe(67);
  });

  it("returns negative when offered price exceeds original (overshoot)", () => {
    // Documents the current behavior. Route handler blocks this case
    // before calling, but the function itself doesn't guard.
    expect(calculateDiscountPercentage(1000, 1500)).toBe(-50);
  });
});

describe("formatCurrency", () => {
  it("formats integers as PKR with no decimals", () => {
    expect(formatCurrency(1000)).toMatch(/1,000/);
    expect(formatCurrency(1000)).toMatch(/Rs|PKR|₨/);
  });

  it("rounds away decimals", () => {
    const formatted = formatCurrency(1234.56);
    expect(formatted).not.toMatch(/\./);
  });
});

describe("formatPoints", () => {
  it("includes both points and Rs equivalent", () => {
    expect(formatPoints(500)).toBe("500 points (Rs 50.0)");
  });

  it("formats large numbers with thousand separator", () => {
    expect(formatPoints(10000)).toContain("10,000 points");
  });
});

describe("generateBargainCouponCode", () => {
  it("starts with the BARGAIN- prefix", () => {
    const code = generateBargainCouponCode();
    expect(code.startsWith("BARGAIN-")).toBe(true);
  });

  it("produces a 14-char code (8 prefix + 6 suffix)", () => {
    const code = generateBargainCouponCode();
    expect(code.length).toBe(14);
  });

  it("uses only the allowed character set (no I/O/0)", () => {
    // Anti-confusion charset: A-Z minus I/O, digits 1-9 (no 0)
    const code = generateBargainCouponCode();
    const suffix = code.slice("BARGAIN-".length);
    expect(suffix).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ123456789]{6}$/);
  });

  it("produces distinct codes across many calls (collision sanity)", () => {
    const codes = new Set(
      Array.from({ length: 200 }, () => generateBargainCouponCode()),
    );
    // Won't be 200 unique with vanishingly small odds, but should be
    // very close. Any meaningful repetition signals a generator bug.
    expect(codes.size).toBeGreaterThan(190);
  });
});
