// app/api/products/categories/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ProductModel } from '@/models/Product';
import { rateLimit } from '@/lib/rate-limit';
import { log } from '@/lib/logger';
import { applyRateLimit, ipFromRequest } from '@/shared/http';

const CATEGORIES_RATE_LIMIT = 60; // requests per minute per IP
const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
});

export async function GET(request: Request) {
  try {
    const rl = await applyRateLimit(
      limiter,
      CATEGORIES_RATE_LIMIT,
      ipFromRequest(request),
    );
    if (!rl.ok) return rl.response;

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
    return NextResponse.json(categoryStats, {
      headers: {
        // Category list + counts change only when products are added/
        // archived; a 5-minute edge cache with 10-minute SWR is plenty.
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    log.error('Error fetching categories', { error: error as Error });
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
