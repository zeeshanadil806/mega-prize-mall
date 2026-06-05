import { describe, it, expect } from "vitest";
import {
  calculatePointsForOrder,
  calculateMaxRedeemablePoints,
  calculateRedemptionValue,
  getDayWindow,
  getRedemptionExpiryDate,
} from "@/features/wallet/domain";

// Wallet point-math — pure, no DB. Mirrors the formulas the route
// handler relies on for awarding points (post-order) and redeeming
// points (during checkout). Behavior locked in here.

describe("calculatePointsForOrder", () => {
  it("awards 1 point per Rs 10 with floor", () => {
    expect(calculatePointsForOrder(100)).toBe(10);
    expect(calculatePointsForOrder(1000)).toBe(100);
  });

  it("rounds down sub-10 remainders", () => {
    expect(calculatePointsForOrder(99)).toBe(9);
    expect(calculatePointsForOrder(101)).toBe(10);
  });

  it("returns 0 for orders below Rs 10", () => {
    expect(calculatePointsForOrder(9)).toBe(0);
    expect(calculatePointsForOrder(0)).toBe(0);
  });
});

describe("calculateMaxRedeemablePoints", () => {
  it("caps redeemable points at 10% of order value (in rupees)", () => {
    // 10% of 1000 = Rs 100 = 1000 points cap.
    // User has 5000 points → capped at 1000.
    const result = calculateMaxRedeemablePoints(1000, 5000);
    expect(result.maxPoints).toBe(1000);
    expect(result.maxDiscount).toBe(100);
    expect(result.canRedeem).toBe(true);
  });

  it("uses user points when they are below the cap", () => {
    // 10% of 1000 = 1000 point cap, but user has only 300.
    const result = calculateMaxRedeemablePoints(1000, 300);
    expect(result.maxPoints).toBe(300);
    expect(result.maxDiscount).toBe(30);
    expect(result.canRedeem).toBe(true);
  });

  it("returns canRedeem=false when user has zero points", () => {
    const result = calculateMaxRedeemablePoints(1000, 0);
    expect(result.maxPoints).toBe(0);
    expect(result.canRedeem).toBe(false);
  });

  it("converts points back to rupees at the 10-to-1 ratio", () => {
    // 500 points = Rs 50 discount.
    const result = calculateMaxRedeemablePoints(10000, 500);
    expect(result.maxDiscount).toBe(50);
  });
});

describe("calculateRedemptionValue", () => {
  it("multiplies points by Rs 0.10", () => {
    expect(calculateRedemptionValue(100)).toBe(10);
    expect(calculateRedemptionValue(1)).toBe(0.1);
    expect(calculateRedemptionValue(0)).toBe(0);
  });
});

describe("getDayWindow", () => {
  it("normalizes the anchor to start of day (no mutation)", () => {
    const anchor = new Date("2026-06-05T14:32:11Z");
    const original = anchor.getTime();
    const { start } = getDayWindow(anchor);
    expect(start.getHours()).toBe(0);
    expect(start.getMinutes()).toBe(0);
    expect(start.getSeconds()).toBe(0);
    expect(start.getMilliseconds()).toBe(0);
    // The function must NOT mutate the caller's Date object.
    expect(anchor.getTime()).toBe(original);
  });

  it("returns a 24-hour window", () => {
    const { start, end } = getDayWindow(new Date());
    expect(end.getTime() - start.getTime()).toBe(24 * 60 * 60 * 1000);
  });
});

describe("getRedemptionExpiryDate", () => {
  it("returns a Date 30 days in the future", () => {
    const now = new Date("2026-06-05T00:00:00Z");
    const expiry = getRedemptionExpiryDate(now);
    expect(expiry.getTime() - now.getTime()).toBe(30 * 24 * 60 * 60 * 1000);
  });

  it("defaults to 30 days from now when called with no arg", () => {
    const before = Date.now();
    const expiry = getRedemptionExpiryDate();
    const after = Date.now();
    const delta = expiry.getTime();
    expect(delta).toBeGreaterThanOrEqual(before + 30 * 24 * 60 * 60 * 1000);
    expect(delta).toBeLessThanOrEqual(after + 30 * 24 * 60 * 60 * 1000);
  });
});
