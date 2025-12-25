// app/api/coupons/validate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { validateGlobalCoupon } from '@/lib/coupon-utils';
import { log } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const { couponCode, orderAmount } = await request.json();
    
    if (!couponCode || !orderAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const validation = await validateGlobalCoupon(couponCode, orderAmount);
    
    return NextResponse.json(validation);
    
  } catch (error) {
    log.error('Error validating coupon', { error: error as Error });
    return NextResponse.json(
      { valid: false, message: 'Error validating coupon' },
      { status: 500 }
    );
  }
}