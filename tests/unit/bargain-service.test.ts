import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock-based unit tests for the bargain service.
//
// Three orchestrators: submitBargainOffer (3-outcome union),
// validateBargainCoupon (redemption-time check), and
// getRecentBargainHistory (shape mapper). Repository is mocked so the
// branching, payload composition, and the documented non-transactional
// pairing in the accepted path can be exercised without real Mongo.

// ─── Mocks ────────────────────────────────────────────────────────

const mockFindActiveBargainsForUserAndProduct = vi.fn();
const mockFindRecentBargainHistory = vi.fn();
const mockFindRedeemableBargainCoupon = vi.fn();
const mockCreateBargainRequest = vi.fn();
const mockCreateBargainCoupon = vi.fn();

vi.mock("@/features/bargain/repository", () => ({
  findActiveBargainsForUserAndProduct: (...a: unknown[]) =>
    mockFindActiveBargainsForUserAndProduct(...a),
  findRecentBargainHistory: (...a: unknown[]) =>
    mockFindRecentBargainHistory(...a),
  findRedeemableBargainCoupon: (...a: unknown[]) =>
    mockFindRedeemableBargainCoupon(...a),
  createBargainRequest: (...a: unknown[]) => mockCreateBargainRequest(...a),
  createBargainCoupon: (...a: unknown[]) => mockCreateBargainCoupon(...a),
}));

vi.mock("@/lib/logger", () => ({
  log: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

const {
  submitBargainOffer,
  validateBargainCoupon,
  getRecentBargainHistory,
} = await import("@/features/bargain/service");

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── submitBargainOffer ──────────────────────────────────────────

const PRODUCT = {
  id: "prod-1",
  price: 1000,
  discountedPrice: undefined,
  minBargainPrice: 600,
  maxBargainRounds: 3,
};

describe("submitBargainOffer — round gate", () => {
  it("returns rounds_exceeded when the user is past maxBargainRounds", async () => {
    // 3 prior bargains → currentRound = 4 → strictly > 3.
    mockFindActiveBargainsForUserAndProduct.mockResolvedValue([
      {},
      {},
      {},
    ]);

    const result = await submitBargainOffer({
      userId: "u1",
      product: PRODUCT,
      offeredPrice: 800,
    });

    expect(result.outcome).toBe("rounds_exceeded");
    if (result.outcome !== "rounds_exceeded") return;
    expect(result.data.currentRound).toBe(4);
    expect(result.data.maxRounds).toBe(3);
    expect(result.data.message).toMatch(/Maximum 3 bargain rounds reached/);
    // Round-gate is a pre-check: no DB writes.
    expect(mockCreateBargainRequest).not.toHaveBeenCalled();
    expect(mockCreateBargainCoupon).not.toHaveBeenCalled();
  });
});

describe("submitBargainOffer — rejection path", () => {
  beforeEach(() => {
    mockFindActiveBargainsForUserAndProduct.mockResolvedValue([]);
    mockCreateBargainRequest.mockResolvedValue({ _id: "req-rej-1" });
  });

  it("records a rejected BargainRequest and returns outcome=rejected", async () => {
    // Offer below the Rs 600 floor.
    const result = await submitBargainOffer({
      userId: "u1",
      product: PRODUCT,
      offeredPrice: 500,
    });

    expect(result.outcome).toBe("rejected");
    if (result.outcome !== "rejected") return;
    expect(result.data.status).toBe("rejected");
    expect(result.data.bargainId).toBe("req-rej-1");
    expect(result.data.currentRound).toBe(1);

    expect(mockCreateBargainRequest).toHaveBeenCalledTimes(1);
    const persisted = mockCreateBargainRequest.mock.calls[0][0];
    expect(persisted.status).toBe("rejected");
    expect(persisted.userId).toBe("u1");
    expect(persisted.productId).toBe("prod-1");
    expect(persisted.offeredPrice).toBe(500);
    expect(persisted.originalPrice).toBe(1000);
    expect(persisted.minPrice).toBe(600);
    expect(persisted.bargainRound).toBe(1);

    // Coupon is NOT generated on the rejection path.
    expect(mockCreateBargainCoupon).not.toHaveBeenCalled();
  });

  it("rejects offers at or above original price (too_high)", async () => {
    const result = await submitBargainOffer({
      userId: "u1",
      product: PRODUCT,
      offeredPrice: 1000,
    });
    expect(result.outcome).toBe("rejected");
  });
});

describe("submitBargainOffer — accepted path", () => {
  beforeEach(() => {
    mockFindActiveBargainsForUserAndProduct.mockResolvedValue([]);
    mockCreateBargainRequest.mockResolvedValue({ _id: "req-acc-1" });
    mockCreateBargainCoupon.mockResolvedValue({ _id: "coupon-1" });
  });

  it("persists the request + coupon (in that order) and returns outcome=accepted", async () => {
    const callOrder: string[] = [];
    mockCreateBargainRequest.mockImplementation(async () => {
      callOrder.push("request");
      return { _id: "req-acc-1" };
    });
    mockCreateBargainCoupon.mockImplementation(async () => {
      callOrder.push("coupon");
      return { _id: "coupon-1" };
    });

    const result = await submitBargainOffer({
      userId: "u1",
      product: PRODUCT,
      offeredPrice: 800,
      message: "Please :)",
    });

    expect(result.outcome).toBe("accepted");
    if (result.outcome !== "accepted") return;
    expect(result.data.status).toBe("accepted");
    expect(result.data.offeredPrice).toBe(800);
    expect(result.data.originalPrice).toBe(1000);
    expect(result.data.savingAmount).toBe(200);
    expect(result.data.discountPercentage).toBe(20);
    expect(result.data.couponCode).toMatch(/^BARGAIN-/);
    expect(result.data.validUntil).toBeInstanceOf(Date);
    expect(result.data.bargainId).toBe("req-acc-1");
    expect(result.data.couponId).toBe("coupon-1");

    // Order locked: request first, coupon second. Documented quirk
    // (non-transactional pair) — if coupon-creation fails, the
    // request still exists.
    expect(callOrder).toEqual(["request", "coupon"]);
  });

  it("uses discountedPrice as the current price when present", async () => {
    // Admin store-cut: sticker 1000 but currently discounted to 800.
    // Offer of 700 saves Rs 100 off the 800 baseline.
    const product = { ...PRODUCT, discountedPrice: 800, minBargainPrice: 500 };
    const result = await submitBargainOffer({
      userId: "u1",
      product,
      offeredPrice: 700,
    });
    expect(result.outcome).toBe("accepted");
    if (result.outcome !== "accepted") return;
    expect(result.data.originalPrice).toBe(800);
    expect(result.data.savingAmount).toBe(100);
  });

  it("passes a valid 24h coupon validity window to both writes", async () => {
    const before = Date.now();
    await submitBargainOffer({
      userId: "u1",
      product: PRODUCT,
      offeredPrice: 800,
    });
    const after = Date.now();

    const reqPayload = mockCreateBargainRequest.mock.calls[0][0];
    const couponPayload = mockCreateBargainCoupon.mock.calls[0][0];
    const expectedMin = before + 23.99 * 60 * 60 * 1000;
    const expectedMax = after + 24.01 * 60 * 60 * 1000;
    expect(reqPayload.expiresAt.getTime()).toBeGreaterThanOrEqual(expectedMin);
    expect(reqPayload.expiresAt.getTime()).toBeLessThanOrEqual(expectedMax);
    expect(couponPayload.validUntil.getTime()).toBeGreaterThanOrEqual(
      expectedMin,
    );
    expect(couponPayload.validUntil.getTime()).toBeLessThanOrEqual(expectedMax);
  });
});

// ─── validateBargainCoupon ───────────────────────────────────────

describe("validateBargainCoupon", () => {
  it("rejects an unknown / mismatched code", async () => {
    mockFindRedeemableBargainCoupon.mockResolvedValue(null);
    const result = await validateBargainCoupon("X", "prod-1", "u1", 1000);
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/Invalid coupon for this product/);
  });

  it("rejects when current time is before validFrom", async () => {
    mockFindRedeemableBargainCoupon.mockResolvedValue({
      validFrom: new Date(Date.now() + 60_000),
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
      originalPrice: 1000,
      discountAmount: 200,
      discountPercentage: 20,
    });
    const result = await validateBargainCoupon("X", "prod-1", "u1", 1000);
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/not yet valid/);
  });

  it("rejects when current time is after validUntil", async () => {
    mockFindRedeemableBargainCoupon.mockResolvedValue({
      validFrom: new Date(Date.now() - 60_000),
      validUntil: new Date(Date.now() - 1000),
      originalPrice: 1000,
      discountAmount: 200,
      discountPercentage: 20,
    });
    const result = await validateBargainCoupon("X", "prod-1", "u1", 1000);
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/has expired/);
  });

  it("rejects when product price has dropped below the bargained original", async () => {
    mockFindRedeemableBargainCoupon.mockResolvedValue({
      validFrom: new Date(Date.now() - 60_000),
      validUntil: new Date(Date.now() + 60 * 60 * 1000),
      originalPrice: 1000,
      discountAmount: 200,
      discountPercentage: 20,
    });
    const result = await validateBargainCoupon("X", "prod-1", "u1", 900);
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/price has dropped/i);
  });

  it("rejects when product price drifted up beyond the 10% tolerance", async () => {
    mockFindRedeemableBargainCoupon.mockResolvedValue({
      validFrom: new Date(Date.now() - 60_000),
      validUntil: new Date(Date.now() + 60 * 60 * 1000),
      originalPrice: 1000,
      discountAmount: 200,
      discountPercentage: 20,
    });
    const result = await validateBargainCoupon("X", "prod-1", "u1", 1101);
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/price has changed/);
  });

  it("accepts when within the price-guard tolerance and returns the discount", async () => {
    mockFindRedeemableBargainCoupon.mockResolvedValue({
      validFrom: new Date(Date.now() - 60_000),
      validUntil: new Date(Date.now() + 60 * 60 * 1000),
      originalPrice: 1000,
      discountAmount: 200,
      discountPercentage: 20,
    });
    const result = await validateBargainCoupon("X", "prod-1", "u1", 1050);
    expect(result.valid).toBe(true);
    expect(result.discountAmount).toBe(200);
    expect(result.discountPercentage).toBe(20);
    expect(result.couponType).toBe("bargain");
  });

  it("returns Error validating coupon and swallows thrown errors", async () => {
    mockFindRedeemableBargainCoupon.mockRejectedValue(new Error("boom"));
    const result = await validateBargainCoupon("X", "prod-1", "u1", 1000);
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/Error validating coupon/);
  });
});

// ─── getRecentBargainHistory ─────────────────────────────────────

describe("getRecentBargainHistory", () => {
  it("maps repository docs into the history shape", async () => {
    mockFindRecentBargainHistory.mockResolvedValue([
      {
        _id: "h1",
        productId: "p1",
        originalPrice: 1000,
        offeredPrice: 800,
        status: "accepted",
        couponCode: "BARGAIN-AAA111",
        couponExpiresAt: new Date(Date.now() + 60_000),
        bargainRound: 1,
        maxRounds: 3,
        createdAt: new Date(),
      },
    ]);

    const result = await getRecentBargainHistory("u1");
    expect(result.total).toBe(1);
    expect(result.history[0].discountPercentage).toBe(20); // (1000-800)/1000
    expect(result.history[0].isExpired).toBe(false);
  });

  it("flags expired coupons via isExpired", async () => {
    mockFindRecentBargainHistory.mockResolvedValue([
      {
        _id: "h1",
        productId: "p1",
        originalPrice: 1000,
        offeredPrice: 800,
        status: "accepted",
        couponCode: "BARGAIN-OLD",
        couponExpiresAt: new Date(Date.now() - 1000),
        bargainRound: 1,
        maxRounds: 3,
        createdAt: new Date(),
      },
    ]);
    const result = await getRecentBargainHistory("u1");
    expect(result.history[0].isExpired).toBe(true);
  });

  it("computes currentRound counting only non-rejected entries +1", async () => {
    mockFindRecentBargainHistory.mockResolvedValue([
      {
        _id: "a",
        productId: "p1",
        originalPrice: 1000,
        offeredPrice: 700,
        status: "accepted",
        bargainRound: 1,
        maxRounds: 3,
      },
      {
        _id: "b",
        productId: "p1",
        originalPrice: 1000,
        offeredPrice: 500,
        status: "rejected",
        bargainRound: 2,
        maxRounds: 3,
      },
    ]);
    const result = await getRecentBargainHistory("u1");
    // 1 non-rejected + 1 → currentRound = 2
    expect(result.currentRound).toBe(2);
  });
});
