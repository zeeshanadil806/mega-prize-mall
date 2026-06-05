import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock-based unit tests for the wallet service.
//
// Stubs the repository + mongoose + connectToDatabase so the two
// transactional flows (expireDailyPoints, redeemPointsManually) can
// be exercised in milliseconds without real Mongo. Tests lock the
// call order, payload composition, branching, and outcome union.
// Integration coverage is intentionally NOT attempted here —
// mongodb-memory-server + Windows can't reliably run session reads
// inside transactions (see notes in features/order/service.ts).

// ─── Mocks ────────────────────────────────────────────────────────

const mockFindExpiringEarnTransactionsInWindow = vi.fn();
const mockBulkWriteTransactions = vi.fn();
const mockBulkWriteUsers = vi.fn();
const mockBulkInsertExpiryTransactions = vi.fn();
const mockFindUserForBalanceUpdate = vi.fn();
const mockSaveTransaction = vi.fn();
const mockBuildTransaction = vi.fn();

vi.mock("@/features/wallet/repository", () => ({
  findExpiringEarnTransactionsInWindow: (...args: unknown[]) =>
    mockFindExpiringEarnTransactionsInWindow(...args),
  bulkWriteTransactions: (...args: unknown[]) =>
    mockBulkWriteTransactions(...args),
  bulkWriteUsers: (...args: unknown[]) => mockBulkWriteUsers(...args),
  bulkInsertExpiryTransactions: (...args: unknown[]) =>
    mockBulkInsertExpiryTransactions(...args),
  findUserForBalanceUpdate: (...args: unknown[]) =>
    mockFindUserForBalanceUpdate(...args),
  saveTransaction: (...args: unknown[]) => mockSaveTransaction(...args),
  buildTransaction: (...args: unknown[]) => mockBuildTransaction(...args),
}));

vi.mock("@/lib/mongodb", () => ({
  connectToDatabase: vi.fn().mockResolvedValue(undefined),
}));

// Fake mongoose session: tracks transaction lifecycle calls.
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
  default: {
    startSession: vi.fn(async () => fakeSession),
  },
}));

const { expireDailyPoints, redeemPointsManually } = await import(
  "@/features/wallet/service"
);

beforeEach(() => {
  vi.clearAllMocks();
  // Sane defaults — the success path.
  mockFindExpiringEarnTransactionsInWindow.mockResolvedValue([]);
  mockBulkWriteTransactions.mockResolvedValue(undefined);
  mockBulkWriteUsers.mockResolvedValue(undefined);
  mockBulkInsertExpiryTransactions.mockResolvedValue(undefined);
  mockFindUserForBalanceUpdate.mockResolvedValue(null);
  mockSaveTransaction.mockResolvedValue(undefined);
  mockBuildTransaction.mockReturnValue({
    _id: "tx-1",
  });
});

// ─── expireDailyPoints ────────────────────────────────────────────

describe("expireDailyPoints — nothing-to-expire path", () => {
  it("commits the empty transaction and returns nothing_to_expire", async () => {
    mockFindExpiringEarnTransactionsInWindow.mockResolvedValue([]);

    const result = await expireDailyPoints();

    expect(result.outcome).toBe("nothing_to_expire");
    expect(mockStartTransaction).toHaveBeenCalledTimes(1);
    expect(mockCommitTransaction).toHaveBeenCalledTimes(1);
    expect(mockBulkWriteTransactions).not.toHaveBeenCalled();
    expect(mockBulkWriteUsers).not.toHaveBeenCalled();
    expect(mockBulkInsertExpiryTransactions).not.toHaveBeenCalled();
    expect(mockEndSession).toHaveBeenCalled();
  });
});

describe("expireDailyPoints — single user, single transaction", () => {
  beforeEach(() => {
    mockFindExpiringEarnTransactionsInWindow.mockResolvedValue([
      {
        _id: "tx-A",
        userId: "user-1",
        points: 100,
        description: "Earned from order #o1",
        metadata: { foo: "bar" },
      },
    ]);
  });

  it("returns the aggregated expiry totals", async () => {
    const result = await expireDailyPoints();
    expect(result.outcome).toBe("expired");
    if (result.outcome === "expired") {
      expect(result.data.expiredTransactions).toBe(1);
      expect(result.data.affectedUsers).toBe(1);
      expect(result.data.totalPointsExpired).toBe(100);
    }
  });

  it("flips transaction status to expired and appends (Expired) to description", async () => {
    await expireDailyPoints();
    const ops = mockBulkWriteTransactions.mock.calls[0][0];
    expect(ops).toHaveLength(1);
    expect(ops[0].updateOne.filter).toEqual({ _id: "tx-A" });
    expect(ops[0].updateOne.update.$set.status).toBe("expired");
    expect(ops[0].updateOne.update.$set.description).toBe(
      "Earned from order #o1 (Expired)",
    );
    expect(ops[0].updateOne.update.$set.metadata.foo).toBe("bar");
    expect(ops[0].updateOne.update.$set.metadata.expiredAt).toBeInstanceOf(Date);
  });

  it("decrements the user's points balance", async () => {
    await expireDailyPoints();
    const userOps = mockBulkWriteUsers.mock.calls[0][0];
    expect(userOps).toHaveLength(1);
    expect(userOps[0].updateOne.filter).toEqual({ _id: "user-1" });
    expect(userOps[0].updateOne.update.$inc.points).toBe(-100);
  });

  it("inserts an expiry-type transaction record per affected user", async () => {
    await expireDailyPoints();
    const inserts = mockBulkInsertExpiryTransactions.mock.calls[0][0];
    expect(inserts).toHaveLength(1);
    expect(inserts[0].userId).toBe("user-1");
    expect(inserts[0].type).toBe("expiry");
    expect(inserts[0].points).toBe(-100);
    // Locked verbatim quirk: original code writes a literal 0 here
    // rather than reading the user's post-deduction balance.
    expect(inserts[0].balanceAfter).toBe(0);
    expect(inserts[0].status).toBe("completed");
    expect(inserts[0].rate).toBe(0.1);
  });
});

describe("expireDailyPoints — groups multiple txns per user", () => {
  it("sums each user's points across multiple transactions", async () => {
    mockFindExpiringEarnTransactionsInWindow.mockResolvedValue([
      { _id: "a", userId: "u1", points: 50, description: "x", metadata: {} },
      { _id: "b", userId: "u1", points: 30, description: "y", metadata: {} },
      { _id: "c", userId: "u2", points: 200, description: "z", metadata: {} },
    ]);

    const result = await expireDailyPoints();

    expect(result.outcome).toBe("expired");
    if (result.outcome !== "expired") return;
    expect(result.data.expiredTransactions).toBe(3);
    expect(result.data.affectedUsers).toBe(2);
    expect(result.data.totalPointsExpired).toBe(280);

    const userOps = mockBulkWriteUsers.mock.calls[0][0];
    const u1 = userOps.find((o: { updateOne: { filter: { _id: string } } }) => o.updateOne.filter._id === "u1");
    const u2 = userOps.find((o: { updateOne: { filter: { _id: string } } }) => o.updateOne.filter._id === "u2");
    expect(u1.updateOne.update.$inc.points).toBe(-80);
    expect(u2.updateOne.update.$inc.points).toBe(-200);
  });
});

describe("expireDailyPoints — failure rolls back", () => {
  it("aborts the transaction when a bulk write throws", async () => {
    mockFindExpiringEarnTransactionsInWindow.mockResolvedValue([
      { _id: "x", userId: "u1", points: 10, description: "d", metadata: {} },
    ]);
    mockBulkWriteTransactions.mockRejectedValue(new Error("boom"));

    await expect(expireDailyPoints()).rejects.toThrow("boom");
    expect(mockAbortTransaction).toHaveBeenCalledTimes(1);
    expect(mockCommitTransaction).not.toHaveBeenCalled();
    expect(mockEndSession).toHaveBeenCalled();
  });
});

// ─── redeemPointsManually ────────────────────────────────────────

describe("redeemPointsManually — outcome branching", () => {
  it("returns user_not_found and aborts the transaction", async () => {
    mockFindUserForBalanceUpdate.mockResolvedValue(null);
    const result = await redeemPointsManually({ userId: "u1", points: 100 });
    expect(result.outcome).toBe("user_not_found");
    expect(mockAbortTransaction).toHaveBeenCalledTimes(1);
    expect(mockCommitTransaction).not.toHaveBeenCalled();
    expect(mockSaveTransaction).not.toHaveBeenCalled();
  });

  it("returns insufficient_points with available balance and aborts", async () => {
    mockFindUserForBalanceUpdate.mockResolvedValue({
      _id: "u1",
      points: 50,
      save: vi.fn(),
    });
    const result = await redeemPointsManually({ userId: "u1", points: 100 });
    expect(result.outcome).toBe("insufficient_points");
    if (result.outcome === "insufficient_points") {
      expect(result.available).toBe(50);
    }
    expect(mockAbortTransaction).toHaveBeenCalledTimes(1);
    expect(mockSaveTransaction).not.toHaveBeenCalled();
  });

  it("redeems, decrements balance, persists txn, returns shaped result", async () => {
    const userSave = vi.fn().mockResolvedValue(undefined);
    const user = { _id: "u1", points: 500, save: userSave };
    mockFindUserForBalanceUpdate.mockResolvedValue(user);

    const builtTx = { _id: "tx-100", points: -100 };
    mockBuildTransaction.mockReturnValue(builtTx);

    const result = await redeemPointsManually({ userId: "u1", points: 100 });

    expect(result.outcome).toBe("redeemed");
    if (result.outcome !== "redeemed") return;

    // 100 points × Rs 0.10 = Rs 10
    expect(result.data.discountValue).toBe(10);
    expect(result.data.pointsRedeemed).toBe(100);
    expect(result.data.newBalance).toBe(400);
    expect(result.data.transactionId).toBe("tx-100");
    expect(result.data.expiresAt).toBeInstanceOf(Date);

    // User balance was mutated and saved with session.
    expect(user.points).toBe(400);
    expect(userSave).toHaveBeenCalledWith({ session: fakeSession });

    // Transaction payload composition.
    const txPayload = mockBuildTransaction.mock.calls[0][0];
    expect(txPayload.type).toBe("redeem");
    expect(txPayload.points).toBe(-100);
    expect(txPayload.balanceAfter).toBe(400);
    expect(txPayload.rate).toBe(0.1);
    expect(txPayload.status).toBe("completed");
    expect(txPayload.metadata.discountValue).toBe(10);
    expect(txPayload.metadata.expiresAt).toBeInstanceOf(Date);
    expect(txPayload.description).toMatch(/Redeemed 100 points for Rs 10\.00/);

    expect(mockSaveTransaction).toHaveBeenCalledWith(
      builtTx,
      expect.objectContaining({ session: fakeSession }),
    );
    expect(mockCommitTransaction).toHaveBeenCalledTimes(1);
  });

  it("rolls back when the transaction save throws", async () => {
    mockFindUserForBalanceUpdate.mockResolvedValue({
      _id: "u1",
      points: 500,
      save: vi.fn(),
    });
    mockSaveTransaction.mockRejectedValue(new Error("db down"));

    await expect(
      redeemPointsManually({ userId: "u1", points: 100 }),
    ).rejects.toThrow("db down");

    expect(mockAbortTransaction).toHaveBeenCalledTimes(1);
    expect(mockCommitTransaction).not.toHaveBeenCalled();
    expect(mockEndSession).toHaveBeenCalled();
  });
});
