import { NextResponse } from 'next/server';

export function addRateLimitHeaders(
  response: NextResponse,
  remaining: number,
  limit: number,
  resetTime?: number
) {
  response.headers.set('X-RateLimit-Limit', limit.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  
  if (resetTime) {
    response.headers.set('X-RateLimit-Reset', resetTime.toString());
  }
  
  return response;
}