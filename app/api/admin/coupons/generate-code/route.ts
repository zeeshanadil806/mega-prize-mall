// app/api/admin/coupons/generate-code/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { CouponServices } from '@/models/GlobalCoupon';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const code = await CouponServices.generateUniqueCode(10);
    
    return NextResponse.json({
      success: true,
      code,
    });
    
  } catch (error) {
    console.error('Error generating coupon code:', error);
    return NextResponse.json(
      { error: 'Failed to generate code' },
      { status: 500 }
    );
  }
}