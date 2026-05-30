// app/api/products/categories/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ProductModel } from '@/models/Product';
import { rateLimit } from '@/lib/rate-limit';
import { log } from '@/lib/logger';

const CATEGORIES_RATE_LIMIT = 60; // requests per minute per IP
const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
});

export async function GET(request: Request) {
  try {
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const rateLimitResult = limiter.check(CATEGORIES_RATE_LIMIT, ip);
    if (rateLimitResult.isRateLimited) {
      const retryAfter = Math.ceil(
        (rateLimitResult.resetTime - Date.now()) / 1000
      );
      return NextResponse.json(
        { error: 'Too many requests', retryAfter },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': String(CATEGORIES_RATE_LIMIT),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          },
        }
      );
    }

    await connectToDatabase();

    // Get all active categories with product counts
    const categoryStats = await ProductModel.aggregate([
      {
        $match: {
          isActive: true
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          category: '$_id',
          count: 1,
          _id: 0
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    return NextResponse.json(categoryStats);
  } catch (error) {
    log.error('Error fetching categories', { error: error as Error });
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}