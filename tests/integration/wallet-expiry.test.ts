import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  afterEach,
  vi,
} from "vitest";
import { NextRequest } from "next/server";

// Mock connectToDatabase to a no-op — the test harness already connected
// mongoose. The route's call to lib/mongodb's connectToDatabase would
// otherwise try to dial the placeholder MONGODB_URI from tests/setup.ts.
vi.mock("@/lib/mongodb", () => ({
  connectToDatabase: vi.fn().mockResolvedValue(undefined),
}));

import { POST } from "@/app/api/wallet/expire/route";
import { WalletTransactionModel } from "@/models/WalletTransaction";
import { UserModel } from "@/models/User";
import { setupTestDb, teardownTestDb, clearCollections } from "../helpers/db";
import { createUser } from "../helpers/fixtures";

beforeAll(setupTestDb);
afterAll(teardownTestDb);
afterEach(clearCollections);

const CRON_SECRET = "test-cron-secret-1234567890abcdef";

function authorizedReq() {
  return new NextRequest("http://localhost/api/wallet/expire", {
    method: "POST",
    headers: { Authorization: `Bearer ${CRON_SECRET}` },
  });
}

function todayAt(hour: number): Date {
  const d = new Date();
  d.setHours(hour, 0, 0, 0);
  return d;
}

function yesterdayAt(hour: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  d.setHours(hour, 0, 0, 0);
  return d;
}

describe("wallet expiry cron — authentication", () => {
  it("rejects missing Authorization header with 401", async () => {
    const req = new NextRequest("http://localhost/api/wallet/expire", {
      method: "POST",
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("rejects wrong bearer token with 401", async () => {
    const req = new NextRequest("http://localhost/api/wallet/expire", {
      method: "POST",
      headers: { Authorization: "Bearer wrong-secret" },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });
});

describe("wallet expiry cron — empty case", () => {
  it("returns success with 0 expired when no transactions match today", async () => {
    const res = await POST(authorizedReq());
    const body = await res.json();
    if (res.status !== 200) {
      // Surface the actual error so the failure is debuggable.
      throw new Error(
        `Expected 200, got ${res.status}. Body: ${JSON.stringify(body)}`,
      );
    }
    expect(body.success).toBe(true);
    expect(body.expiredCount).toBe(0);
  });
});

describe("wallet expiry cron — single-user single-transaction", () => {
  it("marks the transaction expired, decrements user points, creates an expiry record", async () => {
    const user = await createUser({ points: 100 });
    const earnTx = await WalletTransactionModel.create({
      userId: user._id.toString(),
      type: "earn",
      points: 100,
      balanceAfter: 100,
      description: "Order reward",
      status: "completed",
      expiresAt: todayAt(12),
    });

    const res = await POST(authorizedReq());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.expiredTransactions).toBe(1);
    expect(body.data.affectedUsers).toBe(1);
    expect(body.data.totalPointsExpired).toBe(100);

    // Original earn transaction now marked expired
    const updatedEarn = await WalletTransactionModel.findById(earnTx._id);
    expect(updatedEarn?.status).toBe("expired");
    expect(updatedEarn?.description).toMatch(/\(Expired\)$/);

    // User points decremented
    const updatedUser = await UserModel.findById(user._id);
    expect(updatedUser?.points).toBe(0);

    // A new 'expiry' transaction was inserted
    const expiryRecords = await WalletTransactionModel.find({
      userId: user._id.toString(),
      type: "expiry",
    });
    expect(expiryRecords).toHaveLength(1);
    expect(expiryRecords[0].points).toBe(-100);
  });
});

describe("wallet expiry cron — multi-transaction aggregation", () => {
  it("aggregates several today-expiring transactions for the same user into one debit", async () => {
    const user = await createUser({ points: 250 });
    await WalletTransactionModel.create({
      userId: user._id.toString(),
      type: "earn",
      points: 100,
      balanceAfter: 100,
      description: "Order A",
      status: "completed",
      expiresAt: todayAt(10),
    });
    await WalletTransactionModel.create({
      userId: user._id.toString(),
      type: "earn",
      points: 150,
      balanceAfter: 250,
      description: "Order B",
      status: "completed",
      expiresAt: todayAt(14),
    });

    await POST(authorizedReq());

    const updatedUser = await UserModel.findById(user._id);
    expect(updatedUser?.points).toBe(0);

    // Only one new expiry record per user even though two transactions expired
    const expiryRecords = await WalletTransactionModel.find({
      userId: user._id.toString(),
      type: "expiry",
    });
    expect(expiryRecords).toHaveLength(1);
    expect(expiryRecords[0].points).toBe(-250);
  });
});

describe("wallet expiry cron — multi-user independence", () => {
  it("handles two users with different expiry amounts independently", async () => {
    const userA = await createUser({ points: 100 });
    const userB = await createUser({ points: 200 });
    await WalletTransactionModel.create({
      userId: userA._id.toString(),
      type: "earn",
      points: 100,
      balanceAfter: 100,
      description: "A",
      status: "completed",
      expiresAt: todayAt(10),
    });
    await WalletTransactionModel.create({
      userId: userB._id.toString(),
      type: "earn",
      points: 200,
      balanceAfter: 200,
      description: "B",
      status: "completed",
      expiresAt: todayAt(11),
    });

    const res = await POST(authorizedReq());
    const body = await res.json();
    expect(body.data.expiredTransactions).toBe(2);
    expect(body.data.affectedUsers).toBe(2);
    expect(body.data.totalPointsExpired).toBe(300);

    const a = await UserModel.findById(userA._id);
    const b = await UserModel.findById(userB._id);
    expect(a?.points).toBe(0);
    expect(b?.points).toBe(0);
  });
});

describe("wallet expiry cron — quirks documented (NOT fixed)", () => {
  it("BUG: does NOT process yesterday-expired transactions", async () => {
    // The cron only processes transactions whose expiresAt falls in
    // [startOfToday, startOfTomorrow). Any earn transaction whose
    // expiresAt was yesterday but never got processed (e.g., cron
    // missed a run) stays in 'completed' forever and the user keeps
    // the points. Locking in current behavior; real fix would scan
    // expiresAt <= startOfTomorrow with status='completed'.
    const user = await createUser({ points: 100 });
    await WalletTransactionModel.create({
      userId: user._id.toString(),
      type: "earn",
      points: 100,
      balanceAfter: 100,
      description: "Yesterday's missed expiry",
      status: "completed",
      expiresAt: yesterdayAt(12),
    });

    const res = await POST(authorizedReq());
    const body = await res.json();
    expect(body.data?.expiredTransactions ?? body.expiredCount).toBe(0);

    const updatedUser = await UserModel.findById(user._id);
    expect(updatedUser?.points).toBe(100); // still has them
  });

  it("does not re-process transactions already marked expired", async () => {
    const user = await createUser({ points: 100 });
    await WalletTransactionModel.create({
      userId: user._id.toString(),
      type: "earn",
      points: 100,
      balanceAfter: 100,
      description: "Already done",
      status: "completed",
      expiresAt: todayAt(10),
    });
    // Manually mark this one expired ahead of time
    await WalletTransactionModel.updateMany(
      { userId: user._id.toString() },
      { $set: { status: "expired" } },
    );

    const res = await POST(authorizedReq());
    const body = await res.json();
    expect(body.data?.expiredTransactions ?? body.expiredCount).toBe(0);
  });

  it("does not expire non-earn transaction types even with expiresAt today", async () => {
    const user = await createUser({ points: 100 });
    // A redeem transaction with expiresAt today — should be ignored
    // because the cron filters on type: 'earn'.
    await WalletTransactionModel.create({
      userId: user._id.toString(),
      type: "redeem",
      points: -50,
      balanceAfter: 50,
      description: "Redeem",
      status: "completed",
      expiresAt: todayAt(12),
    });

    const res = await POST(authorizedReq());
    const body = await res.json();
    expect(body.data?.expiredTransactions ?? body.expiredCount).toBe(0);
  });
});
