// app/api/admin/coupons/generate-code/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireSessionRoles } from '@/shared/http';
import { CouponServices } from '@/models/GlobalCoupon';
import { log } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const session = await requireSessionRoles(["admin", "support"]);
    if (!session.ok) return session.response;

    const code = await CouponServices.generateUniqueCode(10);
    
    return NextResponse.json({
      success: true,
      code,
    });
    
  } catch (error) {
    log.error('Error generating coupon code', { error: error as Error });
    return NextResponse.json(
      { error: 'Failed to generate code' },
      { status: 500 }
    );
  }
}