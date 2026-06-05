import { describe, it, expect } from "vitest";
import {
  checkCouponCompatibility,
  calculateDiscount,
  isApplicableToProduct,
  isUserEligible,
} from "@/features/coupon/domain";

// Pure-function coupon logic — runs without a DB and locks in
// current rules. Cross-DB validation (validateBargainCoupon,
// validateGlobalCoupon) is tested separately under tests/integration.

describe("checkCouponCompatibility", () => {
  it("accepts a single bargain coupon", () => {
    const result = checkCouponCompatibility([
      { type: "bargain", code: "B1" },
    ]);
    expect(result.compatible).toBe(true);
  });

  it("accepts a single global coupon", () => {
    const result = checkCouponCompatibility([
      { type: "global", code: "G1" },
    ]);
    expect(result.compatible).toBe(true);
  });

  it("rejects bargain + global together", () => {
    const result = checkCouponCompatibility([
      { type: "bargain", code: "B1" },
      { type: "global", code: "G1" },
    ]);
    expect(result.compatible).toBe(false);
    expect(result.incompatibleTypes).toEqual(["bargain", "global"]);
  });

  it("rejects multiple bargain coupons", () => {
    const result = checkCouponCompatibility([
      { type: "bargain", code: "B1" },
      { type: "bargain", code: "B2" },
    ]);
    expect(result.compatible).toBe(false);
    expect(result.message).toContain("Only one bargain coupon");
  });

  it("accepts an empty list (no coupons applied)", () => {
    const result = checkCouponCompatibility([]);
    expect(result.compatible).toBe(true);
  });
});

// Domain helpers operate on plain coupon-shaped objects.
// We pass minimal mocks that satisfy the function's read paths —
// the Mongoose virtuals (isValidForUse, etc.) are pre-baked on
// the mock so we test the function's own branching, not the virtual.
type CouponMock = Parameters<typeof calculateDiscount>[0];

function couponFixture(overrides: Partial<CouponMock> = {}): CouponMock {
  return {
    isValidForUse: true,
    discountType: "percentage",
    discountValue: 10,
    maxDiscountAmount: undefined,
    applicableTo: "all_products",
    productIds: [],
    categoryIds: [],
    excludedProductIds: [],
    userEligibility: "all_users",
    specificUserIds: [],
    ...overrides,
  } as CouponMock;
}

describe("calculateDiscount", () => {
  it("returns 0 when coupon is not valid for use", () => {
    const coupon = couponFixture({ isValidForUse: false });
    expect(calculateDiscount(coupon, 1000)).toBe(0);
  });

  describe("percentage discount", () => {
    it("computes the percentage of order amount", () => {
      const coupon = couponFixture({
        discountType: "percentage",
        discountValue: 10,
      });
      expect(calculateDiscount(coupon, 1000)).toBe(100);
    });

    it("caps at maxDiscountAmount when set", () => {
      const coupon = couponFixture({
        discountType: "percentage",
        discountValue: 50,
        maxDiscountAmount: 200,
      });
      // 50% of 1000 = 500 → capped at 200
      expect(calculateDiscount(coupon, 1000)).toBe(200);
    });

    it("does not cap when discount is below maxDiscountAmount", () => {
      const coupon = couponFixture({
        discountType: "percentage",
        discountValue: 10,
        maxDiscountAmount: 500,
      });
      // 10% of 1000 = 100, well below cap
      expect(calculateDiscount(coupon, 1000)).toBe(100);
    });
  });

  describe("fixed discount", () => {
    it("subtracts the fixed amount", () => {
      const coupon = couponFixture({
        discountType: "fixed",
        discountValue: 200,
      });
      expect(calculateDiscount(coupon, 1000)).toBe(200);
    });

    it("never discounts more than the order amount itself", () => {
      const coupon = couponFixture({
        discountType: "fixed",
        discountValue: 5000,
      });
      // Order is Rs 1000; fixed Rs 5000 caps at the order amount.
      expect(calculateDiscount(coupon, 1000)).toBe(1000);
    });
  });

  describe("free_shipping discount", () => {
    it("returns 0 (shipping discount handled elsewhere, not as line discount)", () => {
      const coupon = couponFixture({ discountType: "free_shipping" });
      expect(calculateDiscount(coupon, 1000)).toBe(0);
    });
  });
});

describe("isApplicableToProduct", () => {
  it("respects excludedProductIds even when applicableTo is all_products", () => {
    const coupon = couponFixture({
      applicableTo: "all_products",
      excludedProductIds: ["P1"],
    });
    expect(isApplicableToProduct(coupon, "P1")).toBe(false);
    expect(isApplicableToProduct(coupon, "P2")).toBe(true);
  });

  it("matches all products when applicableTo is all_products", () => {
    const coupon = couponFixture({ applicableTo: "all_products" });
    expect(isApplicableToProduct(coupon, "anything")).toBe(true);
  });

  it("matches only listed productIds when applicableTo is specific_products", () => {
    const coupon = couponFixture({
      applicableTo: "specific_products",
      productIds: ["P1", "P2"],
    });
    expect(isApplicableToProduct(coupon, "P1")).toBe(true);
    expect(isApplicableToProduct(coupon, "P3")).toBe(false);
  });

  it("matches by categoryId when applicableTo is specific_categories", () => {
    const coupon = couponFixture({
      applicableTo: "specific_categories",
      categoryIds: ["CAT1"],
    });
    expect(
      isApplicableToProduct(coupon, "P1", "CAT1"),
    ).toBe(true);
    expect(
      isApplicableToProduct(coupon, "P1", "CAT2"),
    ).toBe(false);
  });

  it("does not match category-restricted coupons when no categoryId is given", () => {
    const coupon = couponFixture({
      applicableTo: "specific_categories",
      categoryIds: ["CAT1"],
    });
    expect(isApplicableToProduct(coupon, "P1")).toBe(false);
  });
});

describe("isUserEligible", () => {
  it("allows all users when eligibility is all_users", () => {
    const coupon = couponFixture({ userEligibility: "all_users" });
    expect(isUserEligible(coupon, "U1", 5)).toBe(true);
  });

  it("allows new users only when eligibility is new_users", () => {
    const coupon = couponFixture({ userEligibility: "new_users" });
    // User with 0 prior orders = new
    expect(isUserEligible(coupon, "U1", 0)).toBe(true);
    // User with 1+ prior orders = not new
    expect(isUserEligible(coupon, "U1", 1)).toBe(false);
  });

  it("allows only listed userIds when eligibility is specific_users", () => {
    const coupon = couponFixture({
      userEligibility: "specific_users",
      specificUserIds: ["U1", "U2"],
    });
    expect(isUserEligible(coupon, "U1", 0)).toBe(true);
    expect(isUserEligible(coupon, "U3", 0)).toBe(false);
  });
});
