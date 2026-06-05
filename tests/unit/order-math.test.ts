import { describe, it, expect } from "vitest";
import { calculateOrderTotals } from "@/features/order/domain";

// Lock in the order-totalling math. These tests are the spec the route
// handler at app/api/checkout/order/route.ts:163-249 must remain
// equivalent to. Phase 2 refactor will swap the inline math for a
// call to calculateOrderTotals; if any test breaks then, behavior
// changed and the refactor is wrong.

describe("calculateOrderTotals — subtotal aggregation", () => {
  it("sums price * quantity per item", () => {
    const result = calculateOrderTotals({
      items: [
        { price: 500, quantity: 2 },
        { price: 300, quantity: 1 },
      ],
      shippingMethod: "standard",
      pointsToUse: 0,
      isLoggedIn: true,
    });
    expect(result.subtotal).toBe(1300);
  });

  it("uses discountedPrice over price when present", () => {
    const result = calculateOrderTotals({
      items: [{ price: 1000, discountedPrice: 800, quantity: 2 }],
      shippingMethod: "standard",
      pointsToUse: 0,
      isLoggedIn: true,
    });
    // 800 (discounted) * 2 = 1600, NOT 1000 * 2
    expect(result.subtotal).toBe(1600);
  });

  it("falsy discountedPrice (0, undefined) falls back to price", () => {
    // Documents the `||` behavior: discountedPrice=0 treated as "no
    // discount, use sticker." If admin sets discountedPrice=0 by
    // accident, item is NOT free — it's sticker price.
    const result = calculateOrderTotals({
      items: [{ price: 500, discountedPrice: 0, quantity: 1 }],
      shippingMethod: "standard",
      pointsToUse: 0,
      isLoggedIn: true,
    });
    expect(result.subtotal).toBe(500);
  });
});

describe("calculateOrderTotals — shipping fee", () => {
  it("charges flat Rs 300 for express regardless of subtotal", () => {
    const result = calculateOrderTotals({
      items: [{ price: 100000, quantity: 1 }],
      shippingMethod: "express",
      pointsToUse: 0,
      isLoggedIn: true,
    });
    expect(result.shippingFee).toBe(300);
  });

  it("charges Rs 150 for standard when subtotal <= Rs 2000", () => {
    const result = calculateOrderTotals({
      items: [{ price: 2000, quantity: 1 }],
      shippingMethod: "standard",
      pointsToUse: 0,
      isLoggedIn: true,
    });
    // Subtotal exactly at threshold (2000). NOT > 2000 → standard fee.
    expect(result.shippingFee).toBe(150);
  });

  it("is free for standard when subtotal > Rs 2000", () => {
    const result = calculateOrderTotals({
      items: [{ price: 2001, quantity: 1 }],
      shippingMethod: "standard",
      pointsToUse: 0,
      isLoggedIn: true,
    });
    expect(result.shippingFee).toBe(0);
  });
});

describe("calculateOrderTotals — points redemption", () => {
  it("converts 1 point to Rs 0.10 when user is logged in and using points", () => {
    const result = calculateOrderTotals({
      items: [{ price: 1000, quantity: 1 }],
      shippingMethod: "standard",
      pointsToUse: 500,
      isLoggedIn: true,
    });
    expect(result.pointsDiscount).toBe(50);
  });

  it("ignores points redemption for guests", () => {
    const result = calculateOrderTotals({
      items: [{ price: 1000, quantity: 1 }],
      shippingMethod: "standard",
      pointsToUse: 500,
      isLoggedIn: false,
    });
    expect(result.pointsDiscount).toBe(0);
  });

  it("contributes 0 when pointsToUse is 0", () => {
    const result = calculateOrderTotals({
      items: [{ price: 1000, quantity: 1 }],
      shippingMethod: "standard",
      pointsToUse: 0,
      isLoggedIn: true,
    });
    expect(result.pointsDiscount).toBe(0);
  });
});

describe("calculateOrderTotals — discountTotal", () => {
  it("sums per-item bargainDiscount across items", () => {
    const result = calculateOrderTotals({
      items: [
        { price: 1000, quantity: 1, bargainDiscount: 200 },
        { price: 500, quantity: 1, bargainDiscount: 100 },
      ],
      shippingMethod: "standard",
      pointsToUse: 0,
      isLoggedIn: true,
    });
    expect(result.discountTotal).toBe(300);
  });

  it("adds globalCouponDiscount on top of per-item bargain discounts", () => {
    const result = calculateOrderTotals({
      items: [{ price: 1000, quantity: 1, bargainDiscount: 200 }],
      shippingMethod: "standard",
      pointsToUse: 0,
      globalCouponDiscount: 100,
      isLoggedIn: true,
    });
    expect(result.discountTotal).toBe(300);
  });

  it("treats missing bargainDiscount and globalCouponDiscount as zero", () => {
    const result = calculateOrderTotals({
      items: [{ price: 1000, quantity: 1 }],
      shippingMethod: "standard",
      pointsToUse: 0,
      isLoggedIn: true,
    });
    expect(result.discountTotal).toBe(0);
  });
});

describe("calculateOrderTotals — grand total", () => {
  it("computes subtotal + shipping - discounts - points", () => {
    // Subtotal 1000, ship 150, bargain 100, coupon 50, points 200 → 800
    const result = calculateOrderTotals({
      items: [{ price: 1000, quantity: 1, bargainDiscount: 100 }],
      shippingMethod: "standard",
      pointsToUse: 2000, // 2000 pts = Rs 200
      globalCouponDiscount: 50,
      isLoggedIn: true,
    });
    expect(result.subtotal).toBe(1000);
    expect(result.shippingFee).toBe(150);
    expect(result.discountTotal).toBe(150); // 100 bargain + 50 coupon
    expect(result.pointsDiscount).toBe(200);
    expect(result.grandTotal).toBe(800); // 1000 + 150 - 150 - 200
  });

  it("clamps grandTotal at 0 when discounts exceed subtotal + shipping", () => {
    // Subtotal 100, ship 150, coupon 500 → would be -250, clamp to 0
    const result = calculateOrderTotals({
      items: [{ price: 100, quantity: 1 }],
      shippingMethod: "standard",
      pointsToUse: 0,
      globalCouponDiscount: 500,
      isLoggedIn: true,
    });
    expect(result.grandTotal).toBe(0);
  });

  it("applies free shipping for orders above Rs 2000 (full example)", () => {
    const result = calculateOrderTotals({
      items: [{ price: 1500, quantity: 2 }], // subtotal 3000
      shippingMethod: "standard",
      pointsToUse: 0,
      isLoggedIn: true,
    });
    // 3000 + 0 (free ship) - 0 - 0 = 3000
    expect(result.subtotal).toBe(3000);
    expect(result.shippingFee).toBe(0);
    expect(result.grandTotal).toBe(3000);
  });
});

describe("calculateOrderTotals — points earned", () => {
  it("awards 1 point per Rs 10 of grandTotal for logged-in users", () => {
    const result = calculateOrderTotals({
      items: [{ price: 1000, quantity: 1 }],
      shippingMethod: "standard",
      pointsToUse: 0,
      isLoggedIn: true,
    });
    // grandTotal = 1000 + 150 = 1150 → floor(1150/10) = 115 points
    expect(result.grandTotal).toBe(1150);
    expect(result.pointsEarned).toBe(115);
  });

  it("does not award points to guests", () => {
    const result = calculateOrderTotals({
      items: [{ price: 1000, quantity: 1 }],
      shippingMethod: "standard",
      pointsToUse: 0,
      isLoggedIn: false,
    });
    expect(result.pointsEarned).toBe(0);
  });

  it("computes points on grandTotal AFTER discounts (not subtotal)", () => {
    // Subtotal 5000, ship 0 (>2000), coupon 1000 → grandTotal 4000
    // Points earned = floor(4000/10) = 400, NOT 500 (would be on subtotal)
    const result = calculateOrderTotals({
      items: [{ price: 5000, quantity: 1 }],
      shippingMethod: "standard",
      pointsToUse: 0,
      globalCouponDiscount: 1000,
      isLoggedIn: true,
    });
    expect(result.grandTotal).toBe(4000);
    expect(result.pointsEarned).toBe(400);
  });
});
