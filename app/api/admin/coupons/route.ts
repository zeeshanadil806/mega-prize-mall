// app/api/admin/coupons/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { CouponServices, GlobalCouponModel, GlobalCouponSchema } from '@/models/GlobalCoupon';
import { log } from '@/lib/logger';
import { z } from 'zod';

// Schema for creating/updating coupons
const CreateCouponSchema = GlobalCouponSchema.pick({
  name: true,
  description: true,
  discountType: true,
  discountValue: true,
  maxDiscountAmount: true,
  validFrom: true,
  validUntil: true,
  maxUses: true,
  maxUsesPerUser: true,
  minOrderAmount: true,
  applicableTo: true,
  categoryIds: true,
  productIds: true,
  excludedProductIds: true,
  userEligibility: true,
  specificUserIds: true,
  canCombineWithBargain: true,
  canCombineWithOtherGlobal: true,
  cannotCombineWithCodes: true,
  firstOrderOnly: true,
  freeShippingMaxWeight: true,
  freeShippingZones: true,
  notes: true,
}).partial().extend({
  code: z.string().min(3).max(20).optional(), // Optional, will auto-generate if not provided
  validFrom: z.string().optional().transform(val => val ? new Date(val) : new Date()),
  validUntil: z.string().transform(val => new Date(val)),
});

// GET - List all coupons with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    // Check admin authentication
if (!session?.user || (session.user.role !== "admin" && session.user.role !== "support")) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status'); // 'active', 'expired', 'used', 'inactive'
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    interface CouponQuery {
  isActive?: boolean;
  validUntil?: { $gt?: Date; $lt?: Date };
  validFrom?: { $lte?: Date };
  $expr?: { $gte: [string, string] };
  $or?: Array<
    | { code: { $regex: string; $options: string } }
    | { name: { $regex: string; $options: string } }
    | { description: { $regex: string; $options: string } }
  >;
}
    // Build query
    const query: CouponQuery = {};
    
    // Status filter
    if (status) {
      const now = new Date();
      switch (status) {
        case 'active':
          query.isActive = true;
          query.validUntil = { $gt: now };
          query.validFrom = { $lte: now };
          break;
        case 'expired':
          query.validUntil = { $lt: now };
          break;
        case 'used':
          query.$expr = { $gte: ['$usedCount', '$maxUses'] };
          break;
        case 'inactive':
          query.isActive = false;
          break;
      }
    }
    
    // Search filter
    if (search) {
      query.$or = [
        { code: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get total count
    const total = await GlobalCouponModel.countDocuments(query);
    
    // Get coupons with sorting
    const coupons = await GlobalCouponModel.find(query)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(limit)
      .select('-__v') // Exclude version key
      .lean();
    
    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;
    
    return NextResponse.json({
      success: true,
      data: coupons,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
    });
    
  } catch (error) {
    log.error('Error fetching coupons', { error: error as Error });
    return NextResponse.json(
      { error: 'Failed to fetch coupons' },
      { status: 500 }
    );
  }
}

// POST - Create new coupon
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    // Check admin authentication
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    // Validate input
    const validatedData = CreateCouponSchema.parse(body);
    
    await connectToDatabase();
    
    // Generate coupon code if not provided
    let code = validatedData.code;
    if (!code) {
  // Use the standalone service function we created
  code = await CouponServices.generateUniqueCode(10);
}
    
    // Check if code already exists
    const existingCoupon = await GlobalCouponModel.findOne({ code });
    if (existingCoupon) {
      return NextResponse.json(
        { error: 'Coupon code already exists' },
        { status: 400 }
      );
    }
    
    // Create coupon
    const coupon = new GlobalCouponModel({
      ...validatedData,
      code,
      createdBy: session.user.id,
      isActive: true,
      usedCount: 0,
      totalDiscountGiven: 0,
    });
    
    await coupon.save();
    
    log.info('Coupon created', { 
      couponId: coupon._id, 
      code: coupon.code,
      createdBy: session.user.id 
    });
    
    return NextResponse.json({
      success: true,
      message: 'Coupon created successfully',
      data: coupon,
    }, { status: 201 });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    
    log.error('Error creating coupon', { error: error as Error });
    return NextResponse.json(
      { error: 'Failed to create coupon' },
      { status: 500 }
    );
  }
}