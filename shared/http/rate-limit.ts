// Rate-limit gate for route handlers.
//
// Thin wrapper around lib/rate-limit that returns a GateResult so it
// composes with the auth helpers in the same early-return chain:
//
//   const rl = await applyRateLimit(limiter, 20, ipFromRequest(req));
//   if (!rl.ok) return rl.response;
//
// On hit, builds the standard 429 + headers response. On miss, the
// caller gets `{ ok: true }` and can proceed. The headers carried on
// success (X-RateLimit-Remaining etc.) are intentionally NOT added —
// the original routes only set rate-limit headers on the 429 path,
// so this preserves that behavior.

import type { rateLimit } from "@/lib/rate-limit";
import { tooManyRequests } from "./responses";
import type { GateResult } from "./auth";

export type Limiter = ReturnType<typeof rateLimit>;

/** Extract the client IP from the standard request headers. Falls
 *  back to "unknown" — mirrors the existing inline pattern. */
export function ipFromRequest(request: Request): string {
  return (
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function applyRateLimit(
  limiter: Limiter,
  limit: number,
  token: string,
): Promise<GateResult<{ remaining: number; resetTime: number }>> {
  const result = await limiter.check(limit, token);
  if (result.isRateLimited) {
    return {
      ok: false,
      response: tooManyRequests({
        limit: result.limit,
        resetTime: result.resetTime,
      }),
    };
  }
  return {
    ok: true,
    user: { remaining: result.remaining, resetTime: result.resetTime },
  };
}
