import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";
import { NextRequest } from "next/server";

// Unit tests for shared/http/* — locks the response shapes (status,
// body, headers) that the existing route handlers emit so we can swap
// inline NextResponse.json calls for these helpers byte-equivalently.

// ─── responses ───────────────────────────────────────────────────

import {
  badRequest,
  forbidden,
  notFound,
  serverError,
  tooManyRequests,
  unauthorized,
  zodValidationError,
} from "@/shared/http/responses";

async function bodyOf(res: Response): Promise<unknown> {
  return res.json();
}

describe("responses — status codes + body shapes", () => {
  it("unauthorized → 401, { error: 'Unauthorized' }", async () => {
    const r = unauthorized();
    expect(r.status).toBe(401);
    expect(await bodyOf(r)).toEqual({ error: "Unauthorized" });
  });

  it("unauthorized accepts a custom message", async () => {
    const r = unauthorized("Token expired");
    expect(await bodyOf(r)).toEqual({ error: "Token expired" });
  });

  it("forbidden → 403, { error: 'Forbidden: Admin access required' }", async () => {
    const r = forbidden();
    expect(r.status).toBe(403);
    expect(await bodyOf(r)).toEqual({
      error: "Forbidden: Admin access required",
    });
  });

  it("badRequest → 400 with optional details", async () => {
    const r1 = badRequest("Nope");
    expect(r1.status).toBe(400);
    expect(await bodyOf(r1)).toEqual({ error: "Nope" });

    const r2 = badRequest("Bad input", [{ code: "x" }]);
    expect(await bodyOf(r2)).toEqual({
      error: "Bad input",
      details: [{ code: "x" }],
    });
  });

  it("zodValidationError → 400, { error: 'Validation failed', details: issues }", async () => {
    const parsed = z
      .object({ foo: z.string() })
      .safeParse({ foo: 42 });
    if (parsed.success) throw new Error("expected schema failure");
    const r = zodValidationError(parsed.error);
    expect(r.status).toBe(400);
    const body = (await bodyOf(r)) as { error: string; details: unknown[] };
    expect(body.error).toBe("Validation failed");
    expect(Array.isArray(body.details)).toBe(true);
    expect(body.details).toHaveLength(1);
  });

  it("notFound → 404 with default + custom message", async () => {
    expect(notFound().status).toBe(404);
    expect(await bodyOf(notFound())).toEqual({ error: "Not found" });
    expect(await bodyOf(notFound("Order not found"))).toEqual({
      error: "Order not found",
    });
  });

  it("serverError → 500 with optional extras", async () => {
    const r = serverError("Boom", { code: "DB_DOWN" });
    expect(r.status).toBe(500);
    expect(await bodyOf(r)).toEqual({ error: "Boom", code: "DB_DOWN" });
  });

  it("tooManyRequests → 429 with retryAfter body + rate-limit headers", async () => {
    const future = Date.now() + 10_000;
    const r = tooManyRequests({ limit: 20, resetTime: future });
    expect(r.status).toBe(429);
    const body = (await bodyOf(r)) as { error: string; retryAfter: number };
    expect(body.error).toBe("Too many requests");
    expect(body.retryAfter).toBeGreaterThanOrEqual(9);
    expect(body.retryAfter).toBeLessThanOrEqual(10);

    expect(r.headers.get("X-RateLimit-Limit")).toBe("20");
    expect(r.headers.get("X-RateLimit-Remaining")).toBe("0");
    expect(r.headers.get("X-RateLimit-Reset")).toBe(String(future));
    expect(r.headers.get("Retry-After")).toBe(String(body.retryAfter));
  });
});

// ─── auth (requireSession / requireAdmin) ────────────────────────

const mockAuth = vi.fn();
vi.mock("@/auth", () => ({
  auth: () => mockAuth(),
}));

const mockConnectToDatabase = vi.fn().mockResolvedValue(undefined);
vi.mock("@/lib/mongodb", () => ({
  connectToDatabase: () => mockConnectToDatabase(),
}));

const mockUserFindById = vi.fn();
vi.mock("@/models/User", () => ({
  UserModel: { findById: (...a: unknown[]) => mockUserFindById(...a) },
}));

const { requireSession, requireAdmin, requireSessionRoles } = await import(
  "@/shared/http/auth"
);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("requireSession", () => {
  it("returns 401 when there is no session", async () => {
    mockAuth.mockResolvedValue(null);
    const result = await requireSession();
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.response.status).toBe(401);
  });

  it("returns 401 when session has no user.id", async () => {
    mockAuth.mockResolvedValue({ user: { email: "x@y.com" } });
    const result = await requireSession();
    expect(result.ok).toBe(false);
  });

  it("returns the user when session is valid", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "u1", email: "x@y.com", name: "X" },
    });
    const result = await requireSession();
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.user.id).toBe("u1");
    expect(result.user.email).toBe("x@y.com");
    expect(result.user.name).toBe("X");
  });
});

describe("requireAdmin", () => {
  it("returns 401 when there is no session (delegates to requireSession)", async () => {
    mockAuth.mockResolvedValue(null);
    const result = await requireAdmin();
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.response.status).toBe(401);
    // No DB query when session check fails.
    expect(mockUserFindById).not.toHaveBeenCalled();
  });

  it("returns 403 when session user is not an admin", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } });
    mockUserFindById.mockReturnValue({
      select: () => Promise.resolve({ role: "customer" }),
    });
    const result = await requireAdmin();
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.response.status).toBe(403);
    expect(await result.response.json()).toEqual({
      error: "Forbidden: Admin access required",
    });
  });

  it("returns 403 when user record is missing", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } });
    mockUserFindById.mockReturnValue({
      select: () => Promise.resolve(null),
    });
    const result = await requireAdmin();
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.response.status).toBe(403);
  });

  it("returns the user on the happy path", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "u1", email: "a@b.com", name: "Admin" },
    });
    mockUserFindById.mockReturnValue({
      select: () => Promise.resolve({ role: "admin" }),
    });
    const result = await requireAdmin();
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.user.id).toBe("u1");
    expect(mockConnectToDatabase).toHaveBeenCalled();
    expect(mockUserFindById).toHaveBeenCalledWith("u1");
  });
});

describe("requireSessionRoles", () => {
  it("returns 401 when there is no session (no DB hit)", async () => {
    mockAuth.mockResolvedValue(null);
    const result = await requireSessionRoles(["admin"]);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.response.status).toBe(401);
    expect(mockUserFindById).not.toHaveBeenCalled();
  });

  it("returns 401 when session.user.role is missing", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } });
    const result = await requireSessionRoles(["admin"]);
    expect(result.ok).toBe(false);
  });

  it("returns 401 (not 403) when the role is not in the allowed set", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "u1", role: "customer" },
    });
    const result = await requireSessionRoles(["admin"]);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    // Matches the original inline behavior: wrong-role still emits 401.
    expect(result.response.status).toBe(401);
  });

  it("returns the user (including role) when allowed", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "u1", role: "admin", email: "a@b.com", name: "A" },
    });
    const result = await requireSessionRoles(["admin", "support"]);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.user.id).toBe("u1");
    expect(result.user.role).toBe("admin");
  });

  it("admits any role in the allowed set (support, customer, etc.)", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "u1", role: "support" },
    });
    const result = await requireSessionRoles(["admin", "support"]);
    expect(result.ok).toBe(true);
  });
});

// ─── cron ────────────────────────────────────────────────────────

import {
  requireCronBearer,
  requireCronQuerySecret,
} from "@/shared/http/cron";

describe("requireCronBearer", () => {
  it("returns 401 when CRON_SECRET env is unset", async () => {
    const original = process.env.CRON_SECRET;
    delete process.env.CRON_SECRET;
    try {
      const req = new NextRequest("http://localhost/x", {
        headers: { authorization: "Bearer anything" },
      });
      const result = requireCronBearer(req);
      expect(result.ok).toBe(false);
    } finally {
      process.env.CRON_SECRET = original;
    }
  });

  it("returns 401 when header is missing", async () => {
    process.env.CRON_SECRET = "topsecret";
    const req = new NextRequest("http://localhost/x");
    const result = requireCronBearer(req);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.response.status).toBe(401);
  });

  it("returns 401 when header does not match secret", async () => {
    process.env.CRON_SECRET = "topsecret";
    const req = new NextRequest("http://localhost/x", {
      headers: { authorization: "Bearer wrong" },
    });
    const result = requireCronBearer(req);
    expect(result.ok).toBe(false);
  });

  it("returns ok when header matches secret", () => {
    process.env.CRON_SECRET = "topsecret";
    const req = new NextRequest("http://localhost/x", {
      headers: { authorization: "Bearer topsecret" },
    });
    const result = requireCronBearer(req);
    expect(result.ok).toBe(true);
  });
});

describe("requireCronQuerySecret", () => {
  it("returns 401 when secret query param is missing", () => {
    process.env.CRON_SECRET = "topsecret";
    const req = new NextRequest("http://localhost/x");
    expect(requireCronQuerySecret(req).ok).toBe(false);
  });

  it("returns ok when secret query matches", () => {
    process.env.CRON_SECRET = "topsecret";
    const req = new NextRequest("http://localhost/x?secret=topsecret");
    expect(requireCronQuerySecret(req).ok).toBe(true);
  });

  it("rejects mismatched secret", () => {
    process.env.CRON_SECRET = "topsecret";
    const req = new NextRequest("http://localhost/x?secret=nope");
    expect(requireCronQuerySecret(req).ok).toBe(false);
  });
});

// ─── rate-limit ──────────────────────────────────────────────────

import { applyRateLimit, ipFromRequest } from "@/shared/http/rate-limit";

describe("ipFromRequest", () => {
  it("prefers x-forwarded-for", () => {
    const req = new NextRequest("http://localhost/x", {
      headers: { "x-forwarded-for": "1.1.1.1", "x-real-ip": "2.2.2.2" },
    });
    expect(ipFromRequest(req)).toBe("1.1.1.1");
  });

  it("falls back to x-real-ip", () => {
    const req = new NextRequest("http://localhost/x", {
      headers: { "x-real-ip": "2.2.2.2" },
    });
    expect(ipFromRequest(req)).toBe("2.2.2.2");
  });

  it("returns 'unknown' when neither header is present", () => {
    const req = new NextRequest("http://localhost/x");
    expect(ipFromRequest(req)).toBe("unknown");
  });
});

describe("applyRateLimit", () => {
  it("returns ok when limiter reports not rate-limited", async () => {
    const fakeLimiter = {
      check: vi.fn().mockResolvedValue({
        isRateLimited: false,
        limit: 20,
        remaining: 19,
        resetTime: Date.now() + 60_000,
      }),
      getOptions: () => ({ interval: 60_000, uniqueTokenPerInterval: 1000 }),
    };
    const result = await applyRateLimit(fakeLimiter, 20, "ip-1");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.user.remaining).toBe(19);
  });

  it("returns a 429 with rate-limit headers when limiter trips", async () => {
    const resetTime = Date.now() + 30_000;
    const fakeLimiter = {
      check: vi.fn().mockResolvedValue({
        isRateLimited: true,
        limit: 20,
        remaining: 0,
        resetTime,
      }),
      getOptions: () => ({ interval: 60_000, uniqueTokenPerInterval: 1000 }),
    };
    const result = await applyRateLimit(fakeLimiter, 20, "ip-1");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.response.status).toBe(429);
    expect(result.response.headers.get("X-RateLimit-Limit")).toBe("20");
    expect(result.response.headers.get("X-RateLimit-Reset")).toBe(
      String(resetTime),
    );
  });

  it("forwards the supplied limit + token to the underlying limiter", async () => {
    const check = vi.fn().mockResolvedValue({
      isRateLimited: false,
      limit: 5,
      remaining: 4,
      resetTime: Date.now() + 60_000,
    });
    const fakeLimiter = {
      check,
      getOptions: () => ({ interval: 60_000, uniqueTokenPerInterval: 100 }),
    };
    await applyRateLimit(fakeLimiter, 5, "tok-xyz");
    expect(check).toHaveBeenCalledWith(5, "tok-xyz");
  });
});
