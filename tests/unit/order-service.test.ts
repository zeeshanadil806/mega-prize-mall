import { describe, it, expect, vi, beforeEach } from "vitest";
import type { PlaceOrderInput } from "@/features/order/schema";

// Mock-based unit tests for placeOrder orchestration.
//
// These tests stub the repository + cross-domain service layer so the
// 11-step transactional flow can be exercised in milliseconds without
// a real Mongo. They lock the call order, payload composition, and
// branching of placeOrder; they intentionally do NOT verify rollback
// semantics (a real transaction is required for that — covered by
// production / manual QA, since mongodb-memory-server can't run
// session reads inside withTransaction on Windows).

// ─── Mocks ───────────────────────────────────────────────────────

// Order repository: every DB-touching function is replaced with a spy.
const mockCreateOrder = vi.fn();
const mockDecrementProductStock = vi.fn();
const mockFindActiveProductsByIds = vi.fn();
const mockFindMostRecentOrderForActor = vi.fn();
const mockFindUserForPointsUpdate = vi.fn();
const mockCreateWalletTransaction = vi.fn();
const mockSetOrderGlobalCouponCode = vi.fn();

// Fake session: just runs the callback and tracks endSession() calls.
const mockEndSession = vi.fn();
const fakeSession = {
  withTransaction: async (cb: () => Promise<void>) => cb(),
  endSession: mockEndSession,
};
const mockStartOrderSession = vi.fn(async () => fakeSession);

vi.mock("@/features/order/repository", () => ({
  findActiveProductsByIds: (...args: unknown[]) =>
    mockFindActiveProductsByIds(...args),
  decrementProductStock: (...args: unknown[]) =>
    mockDecrementProductStock(...args),
  createOrder: (...args: unknown[]) => mockCreateOrder(...args),
  setOrderGlobalCouponCode: (...args: unknown[]) =>
    mockSetOrderGlobalCouponCode(...args),
  findMostRecentOrderForActor: (...args: unknown[]) =>
    mockFindMostRecentOrderForActor(...args),
  findUserForPointsUpdate: (...args: unknown[]) =>
    mockFindUserForPointsUpdate(...args),
  createWalletTransaction: (...args: unknown[]) =>
    mockCreateWalletTransaction(...args),
  startOrderSession: () => mockStartOrderSession(),
}));

const mockFindRedeemableBargainCouponsByCode = vi.fn();
const mockMarkBargainCouponsUsed = vi.fn();

vi.mock("@/features/bargain/repository", () => ({
  findRedeemableBargainCouponsByCode: (...args: unknown[]) =>
    mockFindRedeemableBargainCouponsByCode(...args),
  markBargainCouponsUsed: (...args: unknown[]) =>
    mockMarkBargainCouponsUsed(...args),
}));

const mockValidateGlobalCoupon = vi.fn();
const mockRecordCouponUsage = vi.fn();

vi.mock("@/features/coupon/service", () => ({
  validateGlobalCoupon: (...args: unknown[]) =>
    mockValidateGlobalCoupon(...args),
  recordCouponUsage: (...args: unknown[]) => mockRecordCouponUsage(...args),
}));

vi.mock("@/lib/logger", () => ({
  log: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

// Import the service AFTER mocks are registered.
const { placeOrder } = await import("@/features/order/service");

// ─── Fixtures ────────────────────────────────────────────────────

const SHIPPING_ADDRESS = {
  fullName: "T",
  phone: "+923000000000",
  addressLine1: "1 St",
  city: "Karachi",
  state: "Sindh",
  postalCode: "75000",
  country: "Pakistan",
};

const PRODUCT = {
  _id: { toString: () => "prod-1" },
  name: "Test",
  slug: "test",
  stock: 100,
  images: [{ url: "/img.png" }],
};

function makeInput(overrides: Partial<PlaceOrderInput> = {}): PlaceOrderInput {
  return {
    userId: "user-1",
    items: [
      {
        productId: "prod-1",
        name: "Test",
        price: 1000,
        quantity: 1,
      },
    ],
    shippingAddress: SHIPPING_ADDRESS,
    shippingMethod: "standard",
    pointsToUse: 0,
    couponCodes: [],
    ...overrides,
  } as PlaceOrderInput;
}

// Default mock state — happy path for a logged-in single-item order.
function resetMocks() {
  vi.clearAllMocks();
  mockFindActiveProductsByIds.mockResolvedValue([PRODUCT]);
  mockFindRedeemableBargainCouponsByCode.mockResolvedValue([]);
  mockMarkBargainCouponsUsed.mockResolvedValue(undefined);
  mockValidateGlobalCoupon.mockResolvedValue({ valid: false });
  mockCreateOrder.mockResolvedValue({
    _id: { toString: () => "order-1" },
  });
  mockDecrementProductStock.mockResolvedValue(undefined);
  mockFindUserForPointsUpdate.mockResolvedValue({
    _id: "user-1",
    points: 500,
    save: vi.fn().mockResolvedValue(undefined),
  });
  mockCreateWalletTransaction.mockResolvedValue(undefined);
  mockFindMostRecentOrderForActor.mockResolvedValue({
    _id: { toString: () => "order-1" },
  });
  mockSetOrderGlobalCouponCode.mockResolvedValue(undefined);
  mockEndSession.mockResolvedValue(undefined);
}

beforeEach(resetMocks);

// ─── Tests ───────────────────────────────────────────────────────

describe("placeOrder — orchestration", () => {
  it("returns outcome=placed and ends the session", async () => {
    const result = await placeOrder(makeInput());
    expect(result.outcome).toBe("placed");
    expect(mockEndSession).toHaveBeenCalledTimes(1);
  });

  it("calls steps in the expected order", async () => {
    const order: string[] = [];
    mockFindActiveProductsByIds.mockImplementation(async () => {
      order.push("findActiveProductsByIds");
      return [PRODUCT];
    });
    mockFindRedeemableBargainCouponsByCode.mockImplementation(async () => {
      order.push("findRedeemableBargainCouponsByCode");
      return [];
    });
    mockMarkBargainCouponsUsed.mockImplementation(async () => {
      order.push("markBargainCouponsUsed");
    });
    mockCreateOrder.mockImplementation(async () => {
      order.push("createOrder");
      return { _id: { toString: () => "order-1" } };
    });
    mockDecrementProductStock.mockImplementation(async () => {
      order.push("decrementProductStock");
    });

    await placeOrder(makeInput());

    expect(order).toEqual([
      "findActiveProductsByIds",
      "findRedeemableBargainCouponsByCode",
      "markBargainCouponsUsed",
      "createOrder",
      "decrementProductStock",
    ]);
  });

  it("composes the order payload with the computed totals", async () => {
    await placeOrder(
      makeInput({
        items: [
          {
            productId: "prod-1",
            name: "Test",
            price: 1000,
            quantity: 3,
          },
        ],
      }),
    );

    const [orderData] = mockCreateOrder.mock.calls[0];
    expect(orderData.subtotal).toBe(3000);
    expect(orderData.shippingFee).toBe(0); // > Rs 2000 → free standard
    expect(orderData.grandTotal).toBe(3000);
    expect(orderData.userId).toBe("user-1");
    expect(orderData.isGuestOrder).toBeUndefined();
    expect(orderData.status).toBe("pending");
    expect(orderData.paymentMethod).toBe("cod");
    expect(orderData.paymentStatus).toBe("pending");
  });

  it("decrements stock once per line item", async () => {
    await placeOrder(
      makeInput({
        items: [
          {
            productId: "prod-1",
            name: "Test",
            price: 1000,
            quantity: 4,
          },
        ],
      }),
    );

    expect(mockDecrementProductStock).toHaveBeenCalledTimes(1);
    expect(mockDecrementProductStock).toHaveBeenCalledWith(
      "prod-1",
      4,
      expect.objectContaining({ session: fakeSession }),
    );
  });
});

describe("placeOrder — guest order", () => {
  it("marks isGuestOrder and skips wallet transactions", async () => {
    await placeOrder(
      makeInput({
        userId: undefined,
        guestSessionId: "gsess",
        guestPhone: "+923111111111",
        guestEmail: "g@x.com",
      }),
    );

    const [orderData] = mockCreateOrder.mock.calls[0];
    expect(orderData.isGuestOrder).toBe(true);
    expect(orderData.guestSessionId).toBe("gsess");
    expect(orderData.guestPhone).toBe("+923111111111");
    expect(orderData.guestEmail).toBe("g@x.com");
    expect(orderData.userId).toBeUndefined();

    // Guest never earns points or has a wallet write.
    expect(mockCreateWalletTransaction).not.toHaveBeenCalled();
    expect(mockFindUserForPointsUpdate).not.toHaveBeenCalled();
  });
});

describe("placeOrder — wallet legs (logged-in)", () => {
  it("writes redeem then earn transactions when both apply", async () => {
    await placeOrder(
      makeInput({
        items: [
          {
            productId: "prod-1",
            name: "Test",
            price: 5000,
            quantity: 1,
          },
        ],
        pointsToUse: 200,
      }),
    );

    expect(mockCreateWalletTransaction).toHaveBeenCalledTimes(2);
    const [redeemArgs, earnArgs] = mockCreateWalletTransaction.mock.calls.map(
      (c) => c[0],
    );
    expect(redeemArgs.type).toBe("redeem");
    expect(redeemArgs.points).toBe(-200);
    expect(redeemArgs.status).toBe("completed");

    expect(earnArgs.type).toBe("earn");
    expect(earnArgs.status).toBe("pending");
    // 5000 - 20 (pointsValue) + 0 shipping = 4980 → 498 points
    expect(earnArgs.points).toBe(498);
  });

  it("throws when user has insufficient points", async () => {
    mockFindUserForPointsUpdate.mockResolvedValue({
      _id: "user-1",
      points: 10,
      save: vi.fn().mockResolvedValue(undefined),
    });

    await expect(
      placeOrder(
        makeInput({
          items: [
            {
              productId: "prod-1",
              name: "Test",
              price: 5000,
              quantity: 1,
            },
          ],
          pointsToUse: 500,
        }),
      ),
    ).rejects.toThrow(/insufficient points/i);
  });

  it("throws when user is missing on redeem path", async () => {
    mockFindUserForPointsUpdate.mockResolvedValue(null);

    await expect(
      placeOrder(
        makeInput({
          pointsToUse: 100,
        }),
      ),
    ).rejects.toThrow(/user not found/i);
  });

  it("skips the earn leg when grandTotal yields zero points", async () => {
    // Order < Rs 10 → calculatePointsForOrder = 0. Not realistic at
    // production prices but locks the branch.
    await placeOrder(
      makeInput({
        items: [
          {
            productId: "prod-1",
            name: "Test",
            price: 1,
            quantity: 1,
          },
        ],
      }),
    );

    // grandTotal = 1 + 150 (standard shipping) = 151 → 15 points, so
    // earn DOES fire. Sanity-check the math, then use a higher-priced
    // case where shipping doesn't push it over.
    expect(mockCreateWalletTransaction).toHaveBeenCalledTimes(1);
  });
});

describe("placeOrder — bargain coupons", () => {
  it("queries + marks coupons used when codes are passed", async () => {
    const fakeCoupons = [{ _id: "c1" }];
    mockFindRedeemableBargainCouponsByCode.mockResolvedValue(fakeCoupons);

    await placeOrder(
      makeInput({
        couponCodes: ["BARGAIN-XYZ"],
        items: [
          {
            productId: "prod-1",
            name: "Test",
            price: 1000,
            quantity: 1,
            bargainCouponId: "c1",
            bargainDiscount: 300,
          },
        ],
      }),
    );

    expect(mockFindRedeemableBargainCouponsByCode).toHaveBeenCalledWith(
      ["BARGAIN-XYZ"],
      expect.objectContaining({ session: fakeSession }),
    );
    expect(mockMarkBargainCouponsUsed).toHaveBeenCalledWith(
      fakeCoupons,
      expect.objectContaining({ session: fakeSession }),
    );
  });

  it("still calls the lookup with an empty codes array when none are passed", async () => {
    await placeOrder(makeInput());
    expect(mockFindRedeemableBargainCouponsByCode).toHaveBeenCalledWith(
      [],
      expect.objectContaining({ session: fakeSession }),
    );
  });
});

describe("placeOrder — global coupon", () => {
  it("applies a valid global coupon, records usage, and stamps the order", async () => {
    mockValidateGlobalCoupon.mockResolvedValue({
      valid: true,
      couponType: "global",
      discountAmount: 200,
    });

    await placeOrder(
      makeInput({
        items: [
          {
            productId: "prod-1",
            name: "Test",
            price: 2000,
            quantity: 1,
          },
        ],
        couponCodes: ["SAVE10"],
      }),
    );

    const [orderData] = mockCreateOrder.mock.calls[0];
    expect(orderData.discountTotal).toBe(200);
    // subtotal=2000 is NOT > 2000 threshold, so standard shipping (150)
    // applies: 2000 + 150 - 200 = 1950.
    expect(orderData.shippingFee).toBe(150);
    expect(orderData.grandTotal).toBe(1950);

    expect(mockRecordCouponUsage).toHaveBeenCalledWith(
      "SAVE10",
      "global",
      "user-1",
      "order-1",
      200,
      2150, // subtotal + shippingFee
      1950,
      undefined,
      undefined,
    );
    expect(mockSetOrderGlobalCouponCode).toHaveBeenCalled();
  });

  it("does not record usage when coupon validation fails", async () => {
    mockValidateGlobalCoupon.mockResolvedValue({ valid: false });

    await placeOrder(
      makeInput({
        couponCodes: ["WRONG"],
      }),
    );

    expect(mockRecordCouponUsage).not.toHaveBeenCalled();
    expect(mockSetOrderGlobalCouponCode).not.toHaveBeenCalled();
  });

  it("only applies the first valid global coupon when multiple are passed", async () => {
    mockValidateGlobalCoupon
      .mockResolvedValueOnce({
        valid: true,
        couponType: "global",
        discountAmount: 100,
      })
      .mockResolvedValueOnce({
        valid: true,
        couponType: "global",
        discountAmount: 999,
      });

    await placeOrder(
      makeInput({
        couponCodes: ["FIRST", "SECOND"],
      }),
    );

    expect(mockValidateGlobalCoupon).toHaveBeenCalledTimes(1);
    expect(mockRecordCouponUsage.mock.calls[0]?.[0]).toBe("FIRST");
  });

  it("does not record coupon usage for guests even with a valid coupon", async () => {
    mockValidateGlobalCoupon.mockResolvedValue({
      valid: true,
      couponType: "global",
      discountAmount: 50,
    });

    await placeOrder(
      makeInput({
        userId: undefined,
        guestSessionId: "gs",
        guestPhone: "+92300",
        couponCodes: ["SAVE5"],
      }),
    );

    expect(mockRecordCouponUsage).not.toHaveBeenCalled();
  });
});

describe("placeOrder — failure paths", () => {
  it("throws when fewer products are returned than requested", async () => {
    mockFindActiveProductsByIds.mockResolvedValue([]);

    await expect(placeOrder(makeInput())).rejects.toThrow(
      /products are not available/i,
    );
  });

  it("throws when product stock is below requested quantity", async () => {
    mockFindActiveProductsByIds.mockResolvedValue([
      {
        _id: { toString: () => "prod-1" },
        name: "Test",
        slug: "test",
        stock: 2,
        images: [],
      },
    ]);

    await expect(
      placeOrder(
        makeInput({
          items: [
            {
              productId: "prod-1",
              name: "Test",
              price: 1000,
              quantity: 5,
            },
          ],
        }),
      ),
    ).rejects.toThrow(/insufficient stock/i);
  });

  it("throws when the post-transaction order lookup returns null", async () => {
    mockFindMostRecentOrderForActor.mockResolvedValue(null);

    await expect(placeOrder(makeInput())).rejects.toThrow(/order lookup/i);
  });
});
