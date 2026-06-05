import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock-based unit tests for the coupon service.
//
// Three orchestrators:
//   - validateGlobalCoupon — 9-step gauntlet with many branches
//   - recordCouponUsage    — writes usage + increments global counter
//   - getCouponStats       — aggregation result shaping
//
// Repository + UserModel are mocked. The documented silent-bypass
// quirk (userId references missing user → restrictions skipped) is
// locked in by tests so any future refactor that "fixes" it is
// caught.

// ─── Mocks ────────────────────────────────────────────────────────

const mockFindActiveGlobalCouponByCode = vi.fn();
const mockFindGlobalCouponByCode = vi.fn();
const mockCountOrdersForUser = vi.fn();
const mockCountCouponUsagesForUser = vi.fn();
const mockInsertCouponUsage = vi.fn();
const mockIncrementGlobalCouponUsage = vi.fn();
const mockAggregateCouponUsageStats = vi.fn();

vi.mock("@/features/coupon/repository", () => ({
  findActiveGlobalCouponByCode: (...a: unknown[]) =>
    mockFindActiveGlobalCouponByCode(...a),
  findGlobalCouponByCode: (...a: unknown[]) =>
    mockFindGlobalCouponByCode(...a),
  countOrdersForUser: (...a: unknown[]) => mockCountOrdersForUser(...a),
  countCouponUsagesForUser: (...a: unknown[]) =>
    mockCountCouponUsagesForUser(...a),
  insertCouponUsage: (...a: unknown[]) => mockInsertCouponUsage(...a),
  incrementGlobalCouponUsage: (...a: unknown[]) =>
    mockIncrementGlobalCouponUsage(...a),
  aggregateCouponUsageStats: (...a: unknown[]) =>
    mockAggregateCouponUsageStats(...a),
}));

const mockUserFindById = vi.fn();
vi.mock("@/models/User", () => ({
  UserModel: { findById: (...a: unknown[]) => mockUserFindById(...a) },
}));

vi.mock("@/lib/logger", () => ({
  log: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

const { validateGlobalCoupon, recordCouponUsage, getCouponStats } =
  await import("@/features/coupon/service");

// Domain helpers (calculateDiscount, isUserEligible, isApplicableToProduct)
// are NOT mocked — they're pure functions and we want their real behavior
// exercised through the service.

// ─── Default coupon shape ────────────────────────────────────────

function makeCoupon(overrides: Record<string, unknown> = {}) {
  return {
    code: "SAVE10",
    isValidForUse: true,
    isExpired: false,
    isFullyUsed: false,
    minOrderAmount: 0,
    firstOrderOnly: false,
    userEligibility: "all_users",
    specificUserIds: [],
    maxUsesPerUser: 999,
    maxUses: undefined,
    usedCount: 0,
    applicableTo: "all_products",
    productIds: [],
    categoryIds: [],
    excludedProductIds: [],
    discountType: "percentage",
    discountValue: 10,
    maxDiscountAmount: undefined,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockFindActiveGlobalCouponByCode.mockResolvedValue(makeCoupon());
  mockUserFindById.mockResolvedValue(null);
  mockCountOrdersForUser.mockResolvedValue(0);
  mockCountCouponUsagesForUser.mockResolvedValue(0);
});

// ─── validateGlobalCoupon ────────────────────────────────────────

describe("validateGlobalCoupon — coupon-lookup branches", () => {
  it("rejects when no coupon matches the code", async () => {
    mockFindActiveGlobalCouponByCode.mockResolvedValue(null);
    const result = await validateGlobalCoupon("WRONG", 1000);
    expect(result.valid).toBe(false);
    expect(result.message).toBe("Invalid coupon code");
  });

  it("rejects when coupon is expired (via isValidForUse + isExpired)", async () => {
    mockFindActiveGlobalCouponByCode.mockResolvedValue(
      makeCoupon({ isValidForUse: false, isExpired: true }),
    );
    const result = await validateGlobalCoupon("OLD", 1000);
    expect(result.valid).toBe(false);
    expect(result.message).toBe("Coupon has expired");
  });

  it("rejects when coupon is fully used (isFullyUsed)", async () => {
    mockFindActiveGlobalCouponByCode.mockResolvedValue(
      makeCoupon({ isValidForUse: false, isFullyUsed: true }),
    );
    const result = await validateGlobalCoupon("FULL", 1000);
    expect(result.valid).toBe(false);
    expect(result.message).toBe("Coupon usage limit reached");
  });

  it("rejects when coupon is otherwise not active", async () => {
    mockFindActiveGlobalCouponByCode.mockResolvedValue(
      makeCoupon({ isValidForUse: false }),
    );
    const result = await validateGlobalCoupon("X", 1000);
    expect(result.valid).toBe(false);
    expect(result.message).toBe("Coupon is not active");
  });
});

describe("validateGlobalCoupon — minOrderAmount", () => {
  it("rejects orders below the coupon's minOrderAmount", async () => {
    mockFindActiveGlobalCouponByCode.mockResolvedValue(
      makeCoupon({ minOrderAmount: 2000 }),
    );
    const result = await validateGlobalCoupon("X", 500);
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/Minimum order of Rs 2000/);
  });
});

describe("validateGlobalCoupon — user restrictions", () => {
  it("rejects when firstOrderOnly is set and the user already has orders", async () => {
    mockFindActiveGlobalCouponByCode.mockResolvedValue(
      makeCoupon({ firstOrderOnly: true }),
    );
    mockUserFindById.mockResolvedValue({ _id: "u1" });
    mockCountOrdersForUser.mockResolvedValue(5);

    const result = await validateGlobalCoupon("X", 1000, "u1");
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/first orders only/);
  });

  it("rejects when the user hits their per-user usage cap", async () => {
    mockFindActiveGlobalCouponByCode.mockResolvedValue(
      makeCoupon({ maxUsesPerUser: 1 }),
    );
    mockUserFindById.mockResolvedValue({ _id: "u1" });
    mockCountOrdersForUser.mockResolvedValue(0);
    mockCountCouponUsagesForUser.mockResolvedValue(1);

    const result = await validateGlobalCoupon("X", 1000, "u1");
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/already used this coupon/);
  });

  it("rejects when user is not eligible (specific_users list excludes them)", async () => {
    mockFindActiveGlobalCouponByCode.mockResolvedValue(
      makeCoupon({
        userEligibility: "specific_users",
        specificUserIds: ["other-user"],
      }),
    );
    mockUserFindById.mockResolvedValue({ _id: "u1" });

    const result = await validateGlobalCoupon("X", 1000, "u1");
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/not eligible/);
  });

  it("DOCUMENTED QUIRK: silently bypasses user restrictions when the user record is missing", async () => {
    // Coupon is firstOrderOnly with a specific-users list — if checked,
    // the request should be rejected. But when UserModel.findById returns
    // null, the entire `if (user) { ... }` block is skipped.
    mockFindActiveGlobalCouponByCode.mockResolvedValue(
      makeCoupon({
        firstOrderOnly: true,
        userEligibility: "specific_users",
        specificUserIds: ["only-this-user"],
        maxUsesPerUser: 1,
      }),
    );
    mockUserFindById.mockResolvedValue(null);

    const result = await validateGlobalCoupon("X", 1000, "missing-user");
    // Bypass: validates as if no user restrictions exist.
    expect(result.valid).toBe(true);
    expect(result.couponType).toBe("global");
    // Confirm the per-user lookups were never performed.
    expect(mockCountOrdersForUser).not.toHaveBeenCalled();
    expect(mockCountCouponUsagesForUser).not.toHaveBeenCalled();
  });
});

describe("validateGlobalCoupon — total usage cap", () => {
  it("rejects when usedCount has reached maxUses", async () => {
    mockFindActiveGlobalCouponByCode.mockResolvedValue(
      makeCoupon({ maxUses: 100, usedCount: 100 }),
    );
    const result = await validateGlobalCoupon("X", 1000);
    expect(result.valid).toBe(false);
    expect(result.message).toBe("Coupon usage limit reached");
  });
});

describe("validateGlobalCoupon — product applicability path", () => {
  it("rejects when none of the items are applicable", async () => {
    mockFindActiveGlobalCouponByCode.mockResolvedValue(
      makeCoupon({
        applicableTo: "specific_products",
        productIds: ["allowed-prod"],
      }),
    );
    const result = await validateGlobalCoupon("X", 1000, undefined, [
      { productId: "other-prod", quantity: 1, price: 1000 },
    ]);
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/not applicable to items/);
  });

  it("rejects when applicable items subtotal is below minOrderAmount", async () => {
    mockFindActiveGlobalCouponByCode.mockResolvedValue(
      makeCoupon({
        applicableTo: "specific_products",
        productIds: ["p1"],
        minOrderAmount: 5000,
      }),
    );
    const result = await validateGlobalCoupon("X", 5000, undefined, [
      { productId: "p1", quantity: 1, price: 1000 },
      { productId: "other", quantity: 4, price: 1000 },
    ]);
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/applicable items/);
  });

  it("returns the discount on the applicable subtotal only", async () => {
    mockFindActiveGlobalCouponByCode.mockResolvedValue(
      makeCoupon({
        applicableTo: "specific_products",
        productIds: ["p1"],
        discountType: "percentage",
        discountValue: 10,
      }),
    );
    const result = await validateGlobalCoupon("X", 3000, undefined, [
      { productId: "p1", quantity: 1, price: 1000 }, // applicable
      { productId: "p2", quantity: 1, price: 2000 }, // ignored
    ]);
    expect(result.valid).toBe(true);
    // 10% of Rs 1000 applicable = Rs 100, not 10% of 3000 = 300.
    expect(result.discountAmount).toBe(100);
    expect(result.discountPercentage).toBe(10);
  });
});

describe("validateGlobalCoupon — happy path (whole-order discount)", () => {
  it("applies a percentage discount to the whole order", async () => {
    mockFindActiveGlobalCouponByCode.mockResolvedValue(
      makeCoupon({ discountType: "percentage", discountValue: 10 }),
    );
    const result = await validateGlobalCoupon("SAVE10", 2000);
    expect(result.valid).toBe(true);
    expect(result.discountAmount).toBe(200);
    expect(result.discountPercentage).toBe(10);
    expect(result.couponType).toBe("global");
    expect(result.couponCode).toBe("SAVE10");
    expect(result.message).toMatch(/10% off/);
  });

  it("applies a fixed discount (no discountPercentage)", async () => {
    mockFindActiveGlobalCouponByCode.mockResolvedValue(
      makeCoupon({ discountType: "fixed", discountValue: 250 }),
    );
    const result = await validateGlobalCoupon("FLAT250", 2000);
    expect(result.valid).toBe(true);
    expect(result.discountAmount).toBe(250);
    expect(result.discountPercentage).toBeUndefined();
    expect(result.message).toMatch(/250 Rs off/);
  });
});

describe("validateGlobalCoupon — swallows internal errors", () => {
  it("returns Error validating coupon on any thrown failure", async () => {
    mockFindActiveGlobalCouponByCode.mockRejectedValue(new Error("db down"));
    const result = await validateGlobalCoupon("X", 1000);
    expect(result.valid).toBe(false);
    expect(result.message).toBe("Error validating coupon");
  });
});

// ─── recordCouponUsage ───────────────────────────────────────────

describe("recordCouponUsage", () => {
  it("writes a usage record and increments the global counter for global coupons", async () => {
    mockInsertCouponUsage.mockResolvedValue(undefined);
    mockIncrementGlobalCouponUsage.mockResolvedValue(undefined);

    const ok = await recordCouponUsage(
      "SAVE10",
      "global",
      "u1",
      "order-1",
      200,
      2000,
      1800,
      "1.2.3.4",
      "UA",
    );
    expect(ok).toBe(true);

    expect(mockInsertCouponUsage).toHaveBeenCalledWith({
      couponCode: "SAVE10",
      couponType: "global",
      userId: "u1",
      orderId: "order-1",
      discountApplied: 200,
      orderAmount: 2000,
      orderAmountAfterDiscount: 1800,
      ipAddress: "1.2.3.4",
      userAgent: "UA",
    });
    expect(mockIncrementGlobalCouponUsage).toHaveBeenCalledWith("SAVE10", 200);
  });

  it("does NOT increment the global counter for bargain coupons", async () => {
    mockInsertCouponUsage.mockResolvedValue(undefined);
    await recordCouponUsage(
      "BARGAIN-X",
      "bargain",
      "u1",
      "o1",
      100,
      1000,
      900,
    );
    expect(mockIncrementGlobalCouponUsage).not.toHaveBeenCalled();
  });

  it("returns false (does not throw) when the usage write fails", async () => {
    mockInsertCouponUsage.mockRejectedValue(new Error("write failed"));
    const ok = await recordCouponUsage(
      "X",
      "global",
      "u1",
      "o1",
      100,
      1000,
      900,
    );
    expect(ok).toBe(false);
  });
});

// ─── getCouponStats ──────────────────────────────────────────────

describe("getCouponStats", () => {
  it("returns null when the coupon does not exist", async () => {
    mockFindGlobalCouponByCode.mockResolvedValue(null);
    const result = await getCouponStats("MISSING");
    expect(result).toBeNull();
  });

  it("returns coupon + stats when aggregation has data", async () => {
    mockFindGlobalCouponByCode.mockResolvedValue({
      code: "SAVE10",
      name: "Save 10",
      usedCount: 7,
      totalDiscountGiven: 700,
      remainingUses: 93,
      daysRemaining: 5,
      isValidForUse: true,
    });
    mockAggregateCouponUsageStats.mockResolvedValue({
      totalOrders: 7,
      totalDiscount: 700,
      avgDiscountPerOrder: 100,
      uniqueUserCount: 5,
    });

    const result = await getCouponStats("SAVE10");
    expect(result).not.toBeNull();
    expect(result?.coupon.code).toBe("SAVE10");
    expect(result?.coupon.usedCount).toBe(7);
    expect(result?.stats.totalOrders).toBe(7);
    expect(result?.stats.uniqueUserCount).toBe(5);
  });

  it("falls back to a zero stats shape when aggregation returns null", async () => {
    mockFindGlobalCouponByCode.mockResolvedValue({
      code: "FRESH",
      name: "Fresh",
      usedCount: 0,
      totalDiscountGiven: 0,
      remainingUses: 100,
      daysRemaining: 30,
      isValidForUse: true,
    });
    mockAggregateCouponUsageStats.mockResolvedValue(null);

    const result = await getCouponStats("FRESH");
    expect(result?.stats).toEqual({
      totalOrders: 0,
      totalDiscount: 0,
      avgDiscountPerOrder: 0,
      uniqueUserCount: 0,
    });
  });

  it("swallows internal errors and returns null", async () => {
    mockFindGlobalCouponByCode.mockRejectedValue(new Error("db down"));
    const result = await getCouponStats("X");
    expect(result).toBeNull();
  });
});
