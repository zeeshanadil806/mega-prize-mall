import { LRUCache } from 'lru-cache';

interface RateLimitOptions {
  interval: number; // Time window in milliseconds
  uniqueTokenPerInterval: number;
}

interface RateLimitResult {
  isRateLimited: boolean;
  limit: number;
  remaining: number;
  resetTime: number; // Add this
}

export function rateLimit(options: RateLimitOptions) {
  const tokenCache = new LRUCache({
    max: options.uniqueTokenPerInterval,
    ttl: options.interval,
  });

  return {
    check: (limit: number, token: string): RateLimitResult => {
      const tokenCount = (tokenCache.get(token) as number[]) || [0];
      if (tokenCount[0] === 0) {
        tokenCache.set(token, tokenCount);
      }
      tokenCount[0] += 1;

      const currentUsage = tokenCount[0];
      const isRateLimited = currentUsage >= limit;
      
      // Calculate reset time
      const cacheEntry = tokenCache.get(token);
      const resetTime = cacheEntry ? Date.now() + options.interval : Date.now();
      
      return {
        isRateLimited,
        limit,
        remaining: isRateLimited ? 0 : limit - currentUsage,
        resetTime,
      };
    },
    getOptions: () => options, // Expose options for interval access
  };
}