import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { validateGlobalCoupon } from "@/features/coupon/service";
import { setupTestDb, teardownTestDb, clearCollections } from "../helpers/db";
import {
  createGlobalCoupon,
  createUser,
  createOrder,
  createCouponUsage,
} from "../helpers/fixtures";

// Integration tests for validateGlobalCoupon. This function queries
// 4 collections: GlobalCoupon, User, Order, CouponUsage. Each test
// builds the minimum graph needed to exercise one branch.

beforeAll(setupTestDb);
afterAll(teardownTestDb);
afterEach(clearCollections);

describe("validateGlobalCoupon — lookup", () => {
  it("rejects an unknown code", async () => {
    await createGlobalCoupon({ code: "SUMMER10" });
    const result = await validateGlobalCoupon("DOESNOTEXIST", 1000);
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/invalid coupon code/i);
  });

  it("treats codes case-insensitively (uppercases input)", async () => {
    await createGlobalCoupon({ code: "WELCOME10", discountValue: 10 });
    const result = await validateGlobalCoupon("welcome10", 1000);
    expect(result.valid).toBe(true);
  });

  it("rejects an inactive coupon", async () => {
    await createGlobalCoupon({ code: "INACTIVE", isActive: false });
    const result = await validateGlobalCoupon("INACTIVE", 1000);
    expect(result.valid).toBe(false);
  });
});

describe("validateGlobalCoupon — validity window", () => {
  it("rejects an expired coupon", async () => {
    await createGlobalCoupon({
      code: "EXPIRED",
      validFrom: new Date(Date.now() - 48 * 60 * 60 * 1000),
      validUntil: new Date(Date.now() - 60 * 60 * 1000),
    });
    const result = await validateGlobalCoupon("EXPIRED", 1000);
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/expired/i);
  });

  it("rejects a coupon that has reached its global usage cap", async () => {
    await createGlobalCoupon({
      code: "MAXEDOUT",
      maxUses: 10,
      usedCount: 10,
    });
    const result = await validateGlobalCoupon("MAXEDOUT", 1000);
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/usage limit reached/i);
  });
});

describe("validateGlobalCoupon — order minimum", () => {
  it("rejects when order amount is below minOrderAmount", async () => {
    await createGlobalCoupon({ code: "MIN500", minOrderAmount: 500 });
    const result = await validateGlobalCoupon("MIN500", 499);
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/minimum order of rs 500/i);
  });

  it("accepts when order amount is exactly at minOrderAmount", async () => {
    await createGlobalCoupon({ code: "MIN500B", minOrderAmount: 500 });
    const result = await validateGlobalCoupon("MIN500B", 500);
    expect(result.valid).toBe(true);
  });
});

describe("validateGlobalCoupon — first-order-only restriction", () => {
  it("rejects when firstOrderOnly is set and the user has prior orders", async () => {
    const user = await createUser();
    await createOrder({ userId: user._id.toString() });
    await createGlobalCoupon({ code: "FIRST10", firstOrderOnly: true });
    const result = await validateGlobalCoupon(
      "FIRST10",
      1000,
      user._id.toString(),
    );
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/first orders only/i);
  });

  it("accepts when firstOrderOnly is set and the user has no prior orders", async () => {
    const user = await createUser();
    await createGlobalCoupon({ code: "FIRST10B", firstOrderOnly: true });
    const result = await validateGlobalCoupon(
      "FIRST10B",
      1000,
      user._id.toString(),
    );
    expect(result.valid).toBe(true);
  });
});

describe("validateGlobalCoupon — user eligibility", () => {
  it("rejects a returning user when eligibility is new_users", async () => {
    const user = await createUser();
    await createOrder({ userId: user._id.toString() });
    await createGlobalCoupon({
      code: "NEWUSER",
      userEligibility: "new_users",
    });
    const result = await validateGlobalCoupon(
      "NEWUSER",
      1000,
      user._id.toString(),
    );
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/not eligible/i);
  });

  it("rejects a user not in specificUserIds when eligibility is specific_users", async () => {
    const user = await createUser();
    await createGlobalCoupon({
      code: "VIPONLY",
      userEligibility: "specific_users",
      specificUserIds: ["someone-else"],
    });
    const result = await validateGlobalCoupon(
      "VIPONLY",
      1000,
      user._id.toString(),
    );
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/not eligible/i);
  });

  it("accepts a user listed in specificUserIds", async () => {
    const user = await createUser();
    await createGlobalCoupon({
      code: "VIPONLYB",
      userEligibility: "specific_users",
      specificUserIds: [user._id.toString()],
    });
    const result = await validateGlobalCoupon(
      "VIPONLYB",
      1000,
      user._id.toString(),
    );
    expect(result.valid).toBe(true);
  });
});

describe("validateGlobalCoupon — per-user usage limit", () => {
  it("rejects when user has already used the coupon up to maxUsesPerUser", async () => {
    const user = await createUser();
    await createGlobalCoupon({
      code: "ONCEUSER",
      maxUsesPerUser: 1,
    });
    await createCouponUsage({
      couponCode: "ONCEUSER",
      userId: user._id.toString(),
    });
    const result = await validateGlobalCoupon(
      "ONCEUSER",
      1000,
      user._id.toString(),
    );
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/already used this coupon/i);
  });

  it("allows a second use when maxUsesPerUser is higher than prior uses", async () => {
    const user = await createUser();
    await createGlobalCoupon({
      code: "TWICE",
      maxUsesPerUser: 2,
    });
    await createCouponUsage({
      couponCode: "TWICE",
      userId: user._id.toString(),
    });
    const result = await validateGlobalCoupon(
      "TWICE",
      1000,
      user._id.toString(),
    );
    expect(result.valid).toBe(true);
  });

  it("does NOT count reverted usages against the per-user limit", async () => {
    const user = await createUser();
    await createGlobalCoupon({
      code: "REVERT",
      maxUsesPerUser: 1,
    });
    await createCouponUsage({
      couponCode: "REVERT",
      userId: user._id.toString(),
      isReverted: true,
    });
    const result = await validateGlobalCoupon(
      "REVERT",
      1000,
      user._id.toString(),
    );
    expect(result.valid).toBe(true);
  });
});

describe("validateGlobalCoupon — reject non-existent user", () => {
  it("rejects when userId references a non-existent user", async () => {
    await createGlobalCoupon({ code: "GHOST", firstOrderOnly: true });
    const result = await validateGlobalCoupon(
      "GHOST",
      1000,
      "507f1f77bcf86cd799439011", // valid ObjectId format but no User exists
    );
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/user not found/i);
  });
});

describe("validateGlobalCoupon — product applicability", () => {
  const ITEM_A = { productId: "P-A", quantity: 1, price: 500 };
  const ITEM_B = { productId: "P-B", quantity: 1, price: 500 };

  it("rejects when applicableTo=specific_products and no item matches", async () => {
    await createGlobalCoupon({
      code: "ONLYA",
      applicableTo: "specific_products",
      productIds: ["P-A"],
    });
    const result = await validateGlobalCoupon("ONLYA", 1000, undefined, [
      ITEM_B,
    ]);
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/not applicable/i);
  });

  it("accepts when applicableTo=specific_products and at least one item matches", async () => {
    await createGlobalCoupon({
      code: "ONLYAB",
      applicableTo: "specific_products",
      productIds: ["P-A"],
      discountType: "percentage",
      discountValue: 10,
    });
    const result = await validateGlobalCoupon("ONLYAB", 1000, undefined, [
      ITEM_A,
      ITEM_B,
    ]);
    expect(result.valid).toBe(true);
    // Discount applies only to applicable items: 10% of 500 = 50
    expect(result.discountAmount).toBe(50);
  });

  it("rejects when only items in the cart are in excludedProductIds", async () => {
    await createGlobalCoupon({
      code: "EXCLUDEB",
      applicableTo: "specific_products",
      productIds: ["P-A", "P-B"],
      excludedProductIds: ["P-B"],
    });
    const result = await validateGlobalCoupon("EXCLUDEB", 500, undefined, [
      ITEM_B,
    ]);
    expect(result.valid).toBe(false);
  });

  it("enforces minOrderAmount against the applicable subset, not the whole cart", async () => {
    await createGlobalCoupon({
      code: "MIN1000",
      applicableTo: "specific_products",
      productIds: ["P-A"],
      minOrderAmount: 1000,
    });
    // Cart total is 1500, but only Item A (Rs 500) is applicable. Rejected.
    const result = await validateGlobalCoupon("MIN1000", 1500, undefined, [
      ITEM_A,
      { productId: "P-NOT-APPLICABLE", quantity: 1, price: 1000 },
    ]);
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/minimum order/i);
  });
});

describe("validateGlobalCoupon — discount math", () => {
  it("applies a percentage discount to the full order when no items array given", async () => {
    await createGlobalCoupon({
      code: "TEN",
      discountType: "percentage",
      discountValue: 10,
    });
    const result = await validateGlobalCoupon("TEN", 1000);
    expect(result.valid).toBe(true);
    expect(result.discountAmount).toBe(100);
    expect(result.discountPercentage).toBe(10);
  });

  it("caps percentage discount at maxDiscountAmount", async () => {
    await createGlobalCoupon({
      code: "CAPPED",
      discountType: "percentage",
      discountValue: 50,
      maxDiscountAmount: 200,
    });
    // 50% of 1000 = 500, capped at 200
    const result = await validateGlobalCoupon("CAPPED", 1000);
    expect(result.valid).toBe(true);
    expect(result.discountAmount).toBe(200);
  });

  it("applies a fixed discount", async () => {
    await createGlobalCoupon({
      code: "FIXED200",
      discountType: "fixed",
      discountValue: 200,
    });
    const result = await validateGlobalCoupon("FIXED200", 1000);
    expect(result.valid).toBe(true);
    expect(result.discountAmount).toBe(200);
    expect(result.discountPercentage).toBeUndefined();
  });

  it("free_shipping coupon is valid but contributes 0 line discount", async () => {
    await createGlobalCoupon({
      code: "FREESHIP",
      discountType: "free_shipping",
      discountValue: 1, // schema requires positive but value isn't used
    });
    const result = await validateGlobalCoupon("FREESHIP", 1000);
    expect(result.valid).toBe(true);
    expect(result.discountAmount).toBe(0);
  });
});
