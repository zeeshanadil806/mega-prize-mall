import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock-based unit tests for the lucky-draw service.
//
// Six orchestrators: checkOrderQualifiesForDraw, createLuckyDrawEntry,
// selectDrawWinner, getDrawEntriesForSpin, getUserLuckyDrawEntries,
// getActiveDraws. Stubs the repository + mongoose so the branching and
// payload composition is exercised without real Mongo. Integration
// coverage is deferred — same mongodb-memory-server + Windows
// limitation called out in features/order/service.ts.

// ─── Mocks ────────────────────────────────────────────────────────

const mockFindActiveDrawForOrderAmount = vi.fn();
const mockFindAnnouncedActiveDraws = vi.fn();
const mockFindActiveEntriesForDraw = vi.fn();
const mockFindActiveEntriesForSpin = vi.fn();
const mockFindDrawById = vi.fn();
const mockFindEntriesByUserWithDraw = vi.fn();
const mockFindEntryByOrderId = vi.fn();
const mockFindLastEntryForDraw = vi.fn();
const mockFindLeanOrderById = vi.fn();
const mockFindOrderWithUser = vi.fn();
const mockCreateEntry = vi.fn();
const mockIncrementDrawEntryCount = vi.fn();
const mockMarkEntryAsWinner = vi.fn();
const mockPersistDrawWinner = vi.fn();

vi.mock("@/features/lucky-draw/repository", () => ({
  findActiveDrawForOrderAmount: (...a: unknown[]) =>
    mockFindActiveDrawForOrderAmount(...a),
  findAnnouncedActiveDraws: (...a: unknown[]) =>
    mockFindAnnouncedActiveDraws(...a),
  findActiveEntriesForDraw: (...a: unknown[]) =>
    mockFindActiveEntriesForDraw(...a),
  findActiveEntriesForSpin: (...a: unknown[]) =>
    mockFindActiveEntriesForSpin(...a),
  findDrawById: (...a: unknown[]) => mockFindDrawById(...a),
  findEntriesByUserWithDraw: (...a: unknown[]) =>
    mockFindEntriesByUserWithDraw(...a),
  findEntryByOrderId: (...a: unknown[]) => mockFindEntryByOrderId(...a),
  findLastEntryForDraw: (...a: unknown[]) => mockFindLastEntryForDraw(...a),
  findLeanOrderById: (...a: unknown[]) => mockFindLeanOrderById(...a),
  findOrderWithUser: (...a: unknown[]) => mockFindOrderWithUser(...a),
  createEntry: (...a: unknown[]) => mockCreateEntry(...a),
  incrementDrawEntryCount: (...a: unknown[]) =>
    mockIncrementDrawEntryCount(...a),
  markEntryAsWinner: (...a: unknown[]) => mockMarkEntryAsWinner(...a),
  persistDrawWinner: (...a: unknown[]) => mockPersistDrawWinner(...a),
}));

vi.mock("@/lib/mongodb", () => ({
  connectToDatabase: vi.fn().mockResolvedValue(undefined),
}));

const mockStartTransaction = vi.fn();
const mockCommitTransaction = vi.fn();
const mockAbortTransaction = vi.fn();
const mockEndSession = vi.fn();
const fakeSession = {
  startTransaction: mockStartTransaction,
  commitTransaction: mockCommitTransaction,
  abortTransaction: mockAbortTransaction,
  endSession: mockEndSession,
};

vi.mock("mongoose", () => ({
  default: { startSession: vi.fn(async () => fakeSession) },
}));

const {
  checkOrderQualifiesForDraw,
  createLuckyDrawEntry,
  selectDrawWinner,
  getDrawEntriesForSpin,
  getUserLuckyDrawEntries,
  getActiveDraws,
} = await import("@/features/lucky-draw/service");

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── checkOrderQualifiesForDraw ──────────────────────────────────

describe("checkOrderQualifiesForDraw", () => {
  it("returns not-qualifying when order does not exist", async () => {
    mockFindLeanOrderById.mockResolvedValue(null);
    const result = await checkOrderQualifiesForDraw("missing");
    expect(result.qualifies).toBe(false);
    expect(result.reason).toBe("Order not found");
  });

  it("returns not-qualifying when order is not delivered", async () => {
    mockFindLeanOrderById.mockResolvedValue({
      status: "pending",
      grandTotal: 5000,
    });
    const result = await checkOrderQualifiesForDraw("o1");
    expect(result.qualifies).toBe(false);
    expect(result.reason).toMatch(/needs to be delivered/);
  });

  it("returns not-qualifying when an entry already exists, with the draw id", async () => {
    mockFindLeanOrderById.mockResolvedValue({
      status: "delivered",
      grandTotal: 5000,
    });
    mockFindEntryByOrderId.mockResolvedValue({ drawId: "draw-7" });
    const result = await checkOrderQualifiesForDraw("o1");
    expect(result.qualifies).toBe(false);
    expect(result.reason).toMatch(/already exists/);
    expect(result.drawId).toBe("draw-7");
  });

  it("returns not-qualifying when no active draw matches the order amount", async () => {
    mockFindLeanOrderById.mockResolvedValue({
      status: "delivered",
      grandTotal: 5000,
    });
    mockFindEntryByOrderId.mockResolvedValue(null);
    mockFindActiveDrawForOrderAmount.mockResolvedValue(null);
    const result = await checkOrderQualifiesForDraw("o1");
    expect(result.qualifies).toBe(false);
    expect(result.reason).toBe("No active lucky draw found");
  });

  it("returns qualifying with order amount + draw id on the happy path", async () => {
    mockFindLeanOrderById.mockResolvedValue({
      status: "delivered",
      grandTotal: 5000,
    });
    mockFindEntryByOrderId.mockResolvedValue(null);
    mockFindActiveDrawForOrderAmount.mockResolvedValue({
      _id: { toString: () => "draw-1" },
    });
    const result = await checkOrderQualifiesForDraw("o1");
    expect(result.qualifies).toBe(true);
    expect(result.orderAmount).toBe(5000);
    expect(result.drawId).toBe("draw-1");
  });

  it("returns Server error on any thrown failure (catches everything)", async () => {
    mockFindLeanOrderById.mockRejectedValue(new Error("kaboom"));
    const result = await checkOrderQualifiesForDraw("o1");
    expect(result.qualifies).toBe(false);
    expect(result.reason).toBe("Server error");
  });
});

// ─── createLuckyDrawEntry ────────────────────────────────────────

describe("createLuckyDrawEntry", () => {
  const ORDER = {
    _id: { toString: () => "order-1" },
    userId: { toString: () => "user-1", email: "u@x.com" },
    grandTotal: 5000,
    createdAt: new Date("2026-01-01"),
    shippingAddress: { fullName: "Alice", phone: "+923000000000" },
  };

  it("returns the failure shape when qualification rejects (rolls back)", async () => {
    mockFindOrderWithUser.mockResolvedValue(ORDER);
    // Force the qualification check to fail.
    mockFindLeanOrderById.mockResolvedValue({
      status: "pending",
      grandTotal: 5000,
    });

    const result = await createLuckyDrawEntry("order-1");
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/needs to be delivered/);
    expect(mockAbortTransaction).toHaveBeenCalledTimes(1);
    expect(mockCreateEntry).not.toHaveBeenCalled();
  });

  it("returns Order not found when the populated lookup misses", async () => {
    mockFindOrderWithUser.mockResolvedValue(null);
    const result = await createLuckyDrawEntry("missing");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Order not found");
    expect(mockAbortTransaction).toHaveBeenCalledTimes(1);
  });

  it("happy path: increments the draw count, creates the entry with the next number, commits", async () => {
    mockFindOrderWithUser.mockResolvedValue(ORDER);
    mockFindLeanOrderById.mockResolvedValue({
      status: "delivered",
      grandTotal: 5000,
    });
    mockFindEntryByOrderId.mockResolvedValue(null);
    mockFindActiveDrawForOrderAmount.mockResolvedValue({
      _id: { toString: () => "draw-1" },
    });
    mockFindLastEntryForDraw.mockResolvedValue({ entryNumber: 7 });
    mockCreateEntry.mockResolvedValue({
      _id: { toString: () => "entry-99" },
      drawId: "draw-1",
      userId: "user-1",
      orderId: "order-1",
      entryNumber: 8,
      orderAmount: 5000,
      orderDate: ORDER.createdAt,
      customerName: "Alice",
      customerEmail: "u@x.com",
      customerPhone: "+923000000000",
      status: "active",
      createdAt: new Date("2026-01-02"),
    });

    const result = await createLuckyDrawEntry("order-1");

    expect(result.success).toBe(true);
    expect(result.drawId).toBe("draw-1");
    expect(result.entry?.entryNumber).toBe(8);
    expect(mockIncrementDrawEntryCount).toHaveBeenCalledWith(
      "draw-1",
      "user-1",
      expect.objectContaining({ session: fakeSession }),
    );
    expect(mockCreateEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        drawId: "draw-1",
        userId: "user-1",
        orderId: "order-1",
        entryNumber: 8,
        orderAmount: 5000,
        customerName: "Alice",
        customerEmail: "u@x.com",
        status: "active",
      }),
      expect.objectContaining({ session: fakeSession }),
    );
    expect(mockCommitTransaction).toHaveBeenCalledTimes(1);
  });

  it("starts entry numbering at 1 when there is no prior entry", async () => {
    mockFindOrderWithUser.mockResolvedValue(ORDER);
    mockFindLeanOrderById.mockResolvedValue({
      status: "delivered",
      grandTotal: 5000,
    });
    mockFindEntryByOrderId.mockResolvedValue(null);
    mockFindActiveDrawForOrderAmount.mockResolvedValue({
      _id: { toString: () => "draw-1" },
    });
    mockFindLastEntryForDraw.mockResolvedValue(null);
    mockCreateEntry.mockResolvedValue({
      _id: { toString: () => "entry-1" },
      entryNumber: 1,
      orderId: "order-1",
      orderAmount: 5000,
      orderDate: ORDER.createdAt,
      drawId: "draw-1",
      userId: "user-1",
      customerName: "Alice",
      customerEmail: "u@x.com",
      customerPhone: "+923000000000",
      status: "active",
      createdAt: new Date(),
    });

    await createLuckyDrawEntry("order-1");
    const entryArg = mockCreateEntry.mock.calls[0][0];
    expect(entryArg.entryNumber).toBe(1);
  });

  it("falls back to shippingAddress.phone when the populated user has no email", async () => {
    mockFindOrderWithUser.mockResolvedValue({
      ...ORDER,
      userId: { toString: () => "user-1" }, // no email
    });
    mockFindLeanOrderById.mockResolvedValue({
      status: "delivered",
      grandTotal: 5000,
    });
    mockFindEntryByOrderId.mockResolvedValue(null);
    mockFindActiveDrawForOrderAmount.mockResolvedValue({
      _id: { toString: () => "draw-1" },
    });
    mockFindLastEntryForDraw.mockResolvedValue(null);
    mockCreateEntry.mockResolvedValue({
      _id: { toString: () => "entry-x" },
      entryNumber: 1,
      orderId: "order-1",
      orderAmount: 5000,
      orderDate: ORDER.createdAt,
      drawId: "draw-1",
      userId: "user-1",
      customerName: "Alice",
      customerEmail: "+923000000000",
      customerPhone: "+923000000000",
      status: "active",
      createdAt: new Date(),
    });

    await createLuckyDrawEntry("order-1");
    const entryArg = mockCreateEntry.mock.calls[0][0];
    // Documented quirk: customerEmail falls back to shippingAddress.phone
    // when no email is on the populated user record.
    expect(entryArg.customerEmail).toBe("+923000000000");
  });

  it("creates an entry for a guest order without userId crashing", async () => {
    const GUEST_ORDER = {
      _id: { toString: () => "order-guest" },
      userId: undefined,
      guestPhone: "+923001234567",
      status: "delivered",
      grandTotal: 4500,
      createdAt: new Date("2026-01-02"),
      shippingAddress: {
        fullName: "Guest Customer",
        phone: "+923001234567",
      },
    };
    mockFindOrderWithUser.mockResolvedValue(GUEST_ORDER);
    mockFindLeanOrderById.mockResolvedValue({
      status: "delivered",
      grandTotal: 4500,
    });
    mockFindEntryByOrderId.mockResolvedValue(null);
    mockFindActiveDrawForOrderAmount.mockResolvedValue({
      _id: { toString: () => "draw-guest" },
    });
    mockFindLastEntryForDraw.mockResolvedValue({ entryNumber: 7 });
    mockCreateEntry.mockResolvedValue({
      _id: { toString: () => "entry-guest" },
      entryNumber: 8,
      orderId: "order-guest",
      orderAmount: 4500,
      orderDate: GUEST_ORDER.createdAt,
      drawId: "draw-guest",
      userId: "+923001234567",
      customerName: "Guest Customer",
      customerEmail: "+923001234567",
      customerPhone: "+923001234567",
      status: "active",
      createdAt: new Date(),
    });

    const result = await createLuckyDrawEntry("order-guest");
    expect(result.success).toBe(true);
    expect(mockIncrementDrawEntryCount).toHaveBeenCalledWith(
      "draw-guest",
      "+923001234567",
      expect.anything(),
    );
    const entryArg = mockCreateEntry.mock.calls[0][0];
    expect(entryArg.userId).toBe("+923001234567");
    expect(entryArg.customerName).toBe("Guest Customer");
  });
});

// ─── selectDrawWinner ─────────────────────────────────────────────

describe("selectDrawWinner", () => {
  it("fails when draw does not exist", async () => {
    mockFindDrawById.mockResolvedValue(null);
    const result = await selectDrawWinner("draw-x", "admin-1");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Draw not found");
    expect(mockAbortTransaction).toHaveBeenCalled();
  });

  it("fails when draw is already completed", async () => {
    mockFindDrawById.mockResolvedValue({ status: "completed" });
    const result = await selectDrawWinner("draw-1", "admin-1");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Draw already completed");
  });

  it("fails when draw is not in announced state", async () => {
    mockFindDrawById.mockResolvedValue({ status: "draft" });
    const result = await selectDrawWinner("draw-1", "admin-1");
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/must be announced/);
  });

  it("fails when no active entries exist", async () => {
    mockFindDrawById.mockResolvedValue({
      status: "announced",
      save: vi.fn(),
    });
    mockFindActiveEntriesForDraw.mockResolvedValue([]);
    const result = await selectDrawWinner("draw-1", "admin-1");
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/No entries/);
  });

  it("happy path: marks winner, writes snapshot to draw, returns winner payload", async () => {
    const draw: Record<string, unknown> = {
      status: "announced",
      title: "Grand Prize",
      prizeName: "iPhone",
      prizeDescription: "Latest iPhone",
    };
    mockFindDrawById.mockResolvedValue(draw);

    const entries = [
      {
        _id: { toString: () => "entry-1" },
        userId: "u1",
        orderId: "o1",
        entryNumber: 1,
        customerName: "Alice",
        customerEmail: "a@x.com",
        customerPhone: "+92300",
        orderAmount: 5000,
      },
    ];
    mockFindActiveEntriesForDraw.mockResolvedValue(entries);

    const result = await selectDrawWinner("draw-1", "admin-1");

    expect(result.success).toBe(true);
    expect(result.winner?.entryId).toBe("entry-1");
    expect(result.winner?.userId).toBe("u1");
    expect(result.winner?.customerName).toBe("Alice");
    expect(result.winner?.drawTitle).toBe("Grand Prize");
    expect(result.winner?.prizeName).toBe("iPhone");

    // Draw was mutated with completion snapshot.
    expect(draw.status).toBe("completed");
    expect(draw.winnerUserId).toBe("u1");
    expect(draw.winnerName).toBe("Alice");
    expect(draw.updatedBy).toBe("admin-1");

    expect(mockMarkEntryAsWinner).toHaveBeenCalledWith(
      "entry-1",
      expect.objectContaining({ session: fakeSession }),
    );
    expect(mockPersistDrawWinner).toHaveBeenCalledWith(
      draw,
      expect.objectContaining({ session: fakeSession }),
    );
    expect(mockCommitTransaction).toHaveBeenCalledTimes(1);
  });

  it("rolls back when winner persistence throws", async () => {
    const draw = { status: "announced", save: vi.fn() } as Record<
      string,
      unknown
    >;
    mockFindDrawById.mockResolvedValue(draw);
    mockFindActiveEntriesForDraw.mockResolvedValue([
      {
        _id: { toString: () => "entry-1" },
        userId: "u1",
        orderId: "o1",
        entryNumber: 1,
        customerName: "Alice",
        customerEmail: "a@x.com",
        orderAmount: 5000,
      },
    ]);
    mockPersistDrawWinner.mockRejectedValue(new Error("save failed"));

    const result = await selectDrawWinner("draw-1", "admin-1");
    expect(result.success).toBe(false);
    expect(result.error).toBe("save failed");
    expect(mockAbortTransaction).toHaveBeenCalled();
  });
});

// ─── Read-path mappers ───────────────────────────────────────────

describe("getDrawEntriesForSpin", () => {
  it("maps entries to the spin shape with stringified entryId", async () => {
    mockFindActiveEntriesForSpin.mockResolvedValue([
      {
        _id: { toString: () => "e1" },
        entryNumber: 1,
        customerName: "Alice",
        orderId: "o1",
        orderAmount: 5000,
      },
      {
        _id: { toString: () => "e2" },
        entryNumber: 2,
        customerName: "Bob",
        orderId: "o2",
        orderAmount: 6000,
      },
    ]);
    const result = await getDrawEntriesForSpin("draw-1");
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      entryId: "e1",
      entryNumber: 1,
      customerName: "Alice",
      orderId: "o1",
      orderAmount: 5000,
    });
  });

  it("returns an empty array when the repository throws", async () => {
    mockFindActiveEntriesForSpin.mockRejectedValue(new Error("boom"));
    const result = await getDrawEntriesForSpin("draw-1");
    expect(result).toEqual([]);
  });
});

describe("getUserLuckyDrawEntries", () => {
  it("counts totals and winners and maps to the dashboard shape", async () => {
    mockFindEntriesByUserWithDraw.mockResolvedValue([
      {
        _id: "e1",
        entryNumber: 1,
        orderId: { toString: () => "o1" },
        orderAmount: 100,
        orderDate: new Date("2026-01-01"),
        createdAt: new Date("2026-01-02"),
        status: "winner",
        drawId: { title: "T1", prizeName: "P1", status: "completed" },
      },
      {
        _id: "e2",
        entryNumber: 2,
        orderId: { toString: () => "o2" },
        orderAmount: 200,
        orderDate: new Date("2026-01-03"),
        createdAt: new Date("2026-01-04"),
        status: "active",
        drawId: { title: "T2", prizeName: "P2", status: "announced" },
      },
    ]);

    const result = await getUserLuckyDrawEntries("user-1");
    expect(result.totalEntries).toBe(2);
    expect(result.activeEntries).toBe(1);
    expect(result.wonDraws).toBe(1);
    expect(result.entries[0].isWinner).toBe(true);
    expect(result.entries[0].drawTitle).toBe("T1");
    expect(result.entries[1].isWinner).toBe(false);
    expect(result.entries[1].drawStatus).toBe("announced");
  });

  it("returns the zero shape when the repository throws", async () => {
    mockFindEntriesByUserWithDraw.mockRejectedValue(new Error("boom"));
    const result = await getUserLuckyDrawEntries("user-1");
    expect(result).toEqual({
      totalEntries: 0,
      activeEntries: 0,
      wonDraws: 0,
      entries: [],
    });
  });
});

describe("getActiveDraws", () => {
  it("maps draws and computes daysRemaining", async () => {
    const future = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    mockFindAnnouncedActiveDraws.mockResolvedValue([
      {
        _id: "d1",
        title: "Big Draw",
        description: "Win it all",
        prizeName: "iPhone",
        prizeImage: "/i.png",
        prizeCategory: "electronics",
        totalEntries: 42,
        eligibleUserCount: 10,
        drawDate: future,
      },
    ]);

    const result = await getActiveDraws();
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Big Draw");
    expect(result[0].totalEntries).toBe(42);
    // 5 days ahead, Math.ceil → 5 (or 4 if Date.now drifted into the
    // next ms; allow either to keep the test stable).
    expect([4, 5]).toContain(result[0].daysRemaining);
  });

  it("returns null daysRemaining when drawDate is missing", async () => {
    mockFindAnnouncedActiveDraws.mockResolvedValue([
      {
        _id: "d1",
        title: "x",
        description: "x",
        prizeName: "x",
        prizeCategory: "x",
        totalEntries: 0,
        eligibleUserCount: 0,
      },
    ]);
    const result = await getActiveDraws();
    expect(result[0].daysRemaining).toBeNull();
  });

  it("returns an empty array when the repository throws", async () => {
    mockFindAnnouncedActiveDraws.mockRejectedValue(new Error("boom"));
    const result = await getActiveDraws();
    expect(result).toEqual([]);
  });
});
