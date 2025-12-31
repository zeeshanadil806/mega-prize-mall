// app/api/coupons/validate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { validateGlobalCoupon, validateBargainCoupon } from '@/lib/coupon-utils';
import { log } from '@/lib/logger';
import { z } from 'zod';

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