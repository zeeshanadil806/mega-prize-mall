// app/api/products/batch/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ProductModel } from '@/models/Product';
import { log } from '@/lib/logger';
import { rateLimit } from '@/lib/rate-limit';
import { CartItem } from '@/types';
import { applyRateLimit, ipFromRequest } from '@/shared/http';

const BATCH_RATE_LIMIT = 60; // requests per minute per IP
const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
});

type BatchProduct = Pick<CartItem,
  | 'name'
  | 'bargainEnabled'
  | 'minBargainPrice'
  | 'maxBargainRounds'
  | 'bargainValidityHours'
  | 'images'
> & { _id: string };

export async function POST(request: NextRequest) {
  try {
    const rl = await applyRateLimit(
      limiter,
      BATCH_RATE_LIMIT,
      ipFromRequest(request),
    );
    if (!rl.ok) return rl.response;

    const { productIds } = await request.json();
    
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid product IDs' },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    const products = await ProductModel.find({
      _id: { $in: productIds },
      isActive: true,
    }).select('name bargainEnabled minBargainPrice maxBargainRounds bargainValidityHours images').lean();
    
    // Convert to object with productId as key
    const productsMap = products.reduce((acc, product) => {
      acc[product._id.toString()] = {
        _id: product._id.toString(),
        name: product.name,
        bargainEnabled: product.bargainEnabled,
        minBargainPrice: product.minBargainPrice,
        maxBargainRounds: product.maxBargainRounds,
        bargainValidityHours: product.bargainValidityHours,
        images: product.images,
      };
      return acc;
    }, {} as Record<string, BatchProduct>);
    
    return NextResponse.json(productsMap, {
      headers: {
        // POST + per-cart request body — not CDN-cacheable. Set the
        // header explicitly so no shared cache between client and
        // origin (e.g. service worker) holds onto a stale list.
        "Cache-Control": "private, no-store",
      },
    });

  } catch (error) {
    log.error('Error fetching batch products', { error: error as Error });
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
