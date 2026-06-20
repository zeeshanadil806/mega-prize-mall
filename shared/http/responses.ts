// Shared HTTP response helpers — keep the JSON body + status code
// shape consistent across every route handler. Each helper returns
// a NextResponse so callers can `return unauthorized()` directly.
//
// The response shapes here mirror the strings + structures the
// existing routes already emit ("Unauthorized", "Forbidden: Admin
// access required", `{ error: "Too many requests", retryAfter }`,
// etc.), so swapping a route's inline NextResponse.json for one of
// these helpers is byte-equivalent.

import { NextResponse } from "next/server";
import type { z } from "zod";

export function unauthorized(message = "Unauthorized"): NextResponse {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbidden(
  message = "Forbidden: Admin access required",
): NextResponse {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function badRequest(error: string, details?: unknown): NextResponse {
  const body: Record<string, unknown> = { error };
  if (details !== undefined) body.details = details;
  return NextResponse.json(body, { status: 400 });
}

/** 400 with the standard `Validation failed` + Zod issues shape. */
export function zodValidationError(error: z.ZodError): NextResponse {
  return badRequest("Validation failed", error.issues);
}

export function notFound(message = "Not found"): NextResponse {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function serverError(
  message = "Internal Server Error",
  extras?: Record<string, unknown>,
): NextResponse {
  return NextResponse.json({ error: message, ...extras }, { status: 500 });
}

export interface RateLimitedOptions {
  /** Per-window limit value that was enforced (echoed in X-RateLimit-Limit). */
  limit: number;
  /** Unix timestamp ms of the next reset (echoed in X-RateLimit-Reset). */
  resetTime: number;
}

/** 429 with the standard retryAfter body + rate-limit headers. */
export function tooManyRequests(opts: RateLimitedOptions): NextResponse {
  const retryAfter = Math.ceil((opts.resetTime - Date.now()) / 1000);
  return NextResponse.json(
    { error: "Too many requests", retryAfter },
    {
      status: 429,
      headers: {
        "Retry-After": retryAfter.toString(),
        "X-RateLimit-Limit": String(opts.limit),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": opts.resetTime.toString(),
      },
    },
  );
}
