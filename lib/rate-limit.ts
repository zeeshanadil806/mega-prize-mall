// Distributed rate limiter with in-memory fallback.
//
// When UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set,
// uses @upstash/ratelimit (sliding window) backed by Upstash Redis.
// Counters are shared across every serverless function instance, so
// the stated limit is the real per-IP ceiling regardless of how many
// Vercel functions are warm.
//
// When the Upstash env vars are absent, falls back to an in-process
// LRU cache. This is fine for `npm run dev` but unsafe in production
// (each cold-started function has its own counter, so concurrent
// instances effectively multiply the limit). A warning is logged on
// boot in production so a missing config doesn't go unnoticed.
//
// Callsites call `await limiter.check(limit, token)`. `.check()` is
// async in both backends so swapping between them is transparent.

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { LRUCache } from "lru-cache";

interface RateLimitOptions {
  interval: number;
  uniqueTokenPerInterval: number;
}

interface RateLimitResult {
  isRateLimited: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
}

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis =
  UPSTASH_URL && UPSTASH_TOKEN
    ? new Redis({ url: UPSTASH_URL, token: UPSTASH_TOKEN })
    : null;

if (!redis && process.env.NODE_ENV === "production") {
  console.warn(
    "[rate-limit] Upstash credentials missing in production; falling back to " +
      "per-process LRU cache. Limits will leak across concurrent instances.",
  );
}

export function rateLimit(options: RateLimitOptions) {
  if (redis) {
    // Ratelimit instances bake the per-window limit into their config,
    // so cache one instance per (limit, interval) pair encountered.
    const instances = new Map<number, Ratelimit>();
    const getLimiter = (limit: number): Ratelimit => {
      const cached = instances.get(limit);
      if (cached) return cached;
      const created = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(
          limit,
          `${options.interval} ms` as `${number} ms`,
        ),
        analytics: false,
        prefix: "mpm:ratelimit",
      });
      instances.set(limit, created);
      return created;
    };

    return {
      check: async (limit: number, token: string): Promise<RateLimitResult> => {
        const result = await getLimiter(limit).limit(token);
        return {
          isRateLimited: !result.success,
          limit,
          remaining: result.remaining,
          resetTime: result.reset,
        };
      },
      getOptions: () => options,
    };
  }

  // In-memory fallback — preserves the prior LRU behavior unchanged so
  // dev environments without Upstash credentials still get a working
  // (though non-distributed) limiter.
  const tokenCache = new LRUCache<string, number[]>({
    max: options.uniqueTokenPerInterval,
    ttl: options.interval,
  });

  return {
    check: async (limit: number, token: string): Promise<RateLimitResult> => {
      const tokenCount = tokenCache.get(token) || [0];
      if (tokenCount[0] === 0) tokenCache.set(token, tokenCount);
      tokenCount[0] += 1;

      const currentUsage = tokenCount[0];
      const isRateLimited = currentUsage >= limit;
      const resetTime = Date.now() + options.interval;

      return {
        isRateLimited,
        limit,
        remaining: isRateLimited ? 0 : limit - currentUsage,
        resetTime,
      };
    },
    getOptions: () => options,
  };
}
