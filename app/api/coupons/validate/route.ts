// app/api/coupons/validate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { validateGlobalCoupon, validateBargainCoupon } from '@/lib/coupon-utils';
import { log } from '@/lib/logger';
import { rateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

// Tight rate limit: this endpoint can be abused to brute-force coupon codes.
const COUPON_VALIDATE_RATE_LIMIT = 20; // requests per minute per IP
const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 1000,
});

const ValidationSchema = z.object({
  couponCode: z.string().min(1),
  orderAmount: z.number().positive(),
  userId: z.string().optional(),
  productId: z.string().optional(), // For bargain coupons
  currentPrice: z.number().positive().optional(), // For bargain coupons
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number(),
    price: z.number(),
    categoryId: z.string().optional(),
  })).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const rateLimitResult = await limiter.check(COUPON_VALIDATE_RATE_LIMIT, ip);
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
            'X-RateLimit-Limit': String(COUPON_VALIDATE_RATE_LIMIT),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          },
        }
      );
    }

    const body = await request.json();
    const validatedData = ValidationSchema.parse(body);
    
    const { couponCode, orderAmount, userId, productId, currentPrice, items } = validatedData;
    
    // First check if it's a bargain coupon
    if (productId && currentPrice && userId) {
      const bargainResult = await validateBargainCoupon(
        couponCode,
        productId,
        userId,
        currentPrice
      );
      
      if (bargainResult.valid) {
        return NextResponse.json(bargainResult);
      }
    }
    
    // Then check global coupon
    const globalResult = await validateGlobalCoupon(
      couponCode,
      orderAmount,
      userId,
      items
    );
    
    return NextResponse.json(globalResult);
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    
    log.error('Error validating coupon', { error: error as Error });
    return NextResponse.json(
      { valid: false, message: 'Error validating coupon' },
      { status: 500 }
    );
  }
}