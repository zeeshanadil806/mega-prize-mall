import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { validateBargainCoupon } from "@/lib/coupon-utils";
import { setupTestDb, teardownTestDb, clearCollections } from "../helpers/db";
import { createBargainCoupon } from "../helpers/fixtures";

// Integration tests for validateBargainCoupon. Real in-memory Mongo
// (mongodb-memory-server) per suite. Each test starts with a clean
// database via clearCollections() in afterEach.

beforeAll(setupTestDb);
afterAll(teardownTestDb);
afterEach(clearCollections);

const PRODUCT_ID = "product-123";
const USER_ID = "user-456";

describe("validateBargainCoupon — lookup", () => {
  it("rejects an unknown code", async () => {
    await createBargainCoupon({
      code: "BARGAIN-AAA111",
      productId: PRODUCT_ID,
      userId: USER_ID,
    });
    const result = await validateBargainCoupon(
      "BARGAIN-DOESNT-EXIST",
      PRODUCT_ID,
      USER_ID,
      1000,
    );
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/invalid coupon/i);
  });

  it("rejects when the code exists but for a different product", async () => {
    await createBargainCoupon({
      code: "BARGAIN-BBB222",
      productId: "other-product",
      userId: USER_ID,
    });
    const result = await validateBargainCoupon(
      "BARGAIN-BBB222",
      PRODUCT_ID,
      USER_ID,
      1000,
    );
    expect(result.valid).toBe(false);
  });

  it("rejects when the code exists but for a different user", async () => {
    await createBargainCoupon({
      code: "BARGAIN-CCC333",
      productId: PRODUCT_ID,
      userId: "other-user",
    });
    const result = await validateBargainCoupon(
      "BARGAIN-CCC333",
      PRODUCT_ID,
      USER_ID,
      1000,
    );
    expect(result.valid).toBe(false);
  });

  it("treats codes case-insensitively (uppercases input)", async () => {
    await createBargainCoupon({
      code: "BARGAIN-DDD444",
      productId: PRODUCT_ID,
      userId: USER_ID,
      originalPrice: 1000,
    });
    const result = await validateBargainCoupon(
      "bargain-ddd444",
      PRODUCT_ID,
      USER_ID,
      1000,
    );
    expect(result.valid).toBe(true);
  });

  it("rejects a coupon already used (isUsed=true)", async () => {
    await createBargainCoupon({
      code: "BARGAIN-EEE555",
      productId: PRODUCT_ID,
      userId: USER_ID,
      isUsed: true,
    });
    const result = await validateBargainCoupon(
      "BARGAIN-EEE555",
      PRODUCT_ID,
      USER_ID,
      1000,
    );
    expect(result.valid).toBe(false);
  });

  it("rejects an inactive coupon", async () => {
    await createBargainCoupon({
      code: "BARGAIN-FFF666",
      productId: PRODUCT_ID,
      userId: USER_ID,
      isActive: false,
    });
    const result = await validateBargainCoupon(
      "BARGAIN-FFF666",
      PRODUCT_ID,
      USER_ID,
      1000,
    );
    expect(result.valid).toBe(false);
  });
});

describe("validateBargainCoupon — validity window", () => {
  it("rejects when current time is before validFrom", async () => {
    await createBargainCoupon({
      code: "BARGAIN-GGG777",
      productId: PRODUCT_ID,
      userId: USER_ID,
      validFrom: new Date(Date.now() + 60 * 60 * 1000), // 1h in future
    });
    const result = await validateBargainCoupon(
      "BARGAIN-GGG777",
      PRODUCT_ID,
      USER_ID,
      1000,
    );
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/not yet valid/i);
  });

  it("rejects when current time is past validUntil", async () => {
    await createBargainCoupon({
      code: "BARGAIN-HHH888",
      productId: PRODUCT_ID,
      userId: USER_ID,
      validFrom: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
      validUntil: new Date(Date.now() - 60 * 60 * 1000), // 1h ago
    });
    const result = await validateBargainCoupon(
      "BARGAIN-HHH888",
      PRODUCT_ID,
      USER_ID,
      1000,
    );
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/expired/i);
  });
});

describe("validateBargainCoupon — price guards", () => {
  // Coupon was bargained against an originalPrice of 1000.
  // Discounted (bargained) price is 700. Tolerance is ±10% on originalPrice
  // for the *current* price: anything < 1000 or > 1100 is rejected.

  it("accepts when current price equals the bargained originalPrice", async () => {
    await createBargainCoupon({
      code: "BARGAIN-III999",
      productId: PRODUCT_ID,
      userId: USER_ID,
      originalPrice: 1000,
      discountedPrice: 700,
    });
    const result = await validateBargainCoupon(
      "BARGAIN-III999",
      PRODUCT_ID,
      USER_ID,
      1000,
    );
    expect(result.valid).toBe(true);
    expect(result.discountAmount).toBe(300);
  });

  it("accepts a small upward price drift within +10% tolerance", async () => {
    await createBargainCoupon({
      code: "BARGAIN-JJJAAA",
      productId: PRODUCT_ID,
      userId: USER_ID,
      originalPrice: 1000,
    });
    const result = await validateBargainCoupon(
      "BARGAIN-JJJAAA",
      PRODUCT_ID,
      USER_ID,
      1050, // +5% — within tolerance
    );
    expect(result.valid).toBe(true);
  });

  it("rejects when current price has dropped below the bargained originalPrice", async () => {
    // Rationale: if admin cut the price after the bargain, the bargain
    // discount would double-apply unfairly. User must re-bargain at the
    // new sticker price.
    await createBargainCoupon({
      code: "BARGAIN-KKKBBB",
      productId: PRODUCT_ID,
      userId: USER_ID,
      originalPrice: 1000,
    });
    const result = await validateBargainCoupon(
      "BARGAIN-KKKBBB",
      PRODUCT_ID,
      USER_ID,
      900,
    );
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/dropped/i);
  });

  it("rejects when current price has risen more than 10% above the bargained originalPrice", async () => {
    await createBargainCoupon({
      code: "BARGAIN-LLLCCC",
      productId: PRODUCT_ID,
      userId: USER_ID,
      originalPrice: 1000,
    });
    const result = await validateBargainCoupon(
      "BARGAIN-LLLCCC",
      PRODUCT_ID,
      USER_ID,
      1200, // +20% — outside tolerance
    );
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/changed significantly/i);
  });
});

describe("validateBargainCoupon — happy path payload", () => {
  it("returns the stored discount amount, percentage, and couponType=bargain", async () => {
    await createBargainCoupon({
      code: "BARGAIN-MMMDDD",
      productId: PRODUCT_ID,
      userId: USER_ID,
      originalPrice: 1000,
      discountedPrice: 750,
      discountAmount: 250,
      discountPercentage: 25,
    });
    const result = await validateBargainCoupon(
      "BARGAIN-MMMDDD",
      PRODUCT_ID,
      USER_ID,
      1000,
    );
    expect(result.valid).toBe(true);
    expect(result.discountAmount).toBe(250);
    expect(result.discountPercentage).toBe(25);
    expect(result.couponType).toBe("bargain");
  });
});
