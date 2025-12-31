// app/api/admin/coupons/[code]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { GlobalCouponModel } from '@/models/GlobalCoupon';
import { CouponUsageModel } from '@/models/CouponUsage';
import { log } from '@/lib/logger';
import { z } from 'zod';

// Schema for updating coupons
const UpdateCouponSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  discountValue: z.number().positive().optional(),
  maxDiscountAmount: z.number().positive().optional(),
  validFrom: z.string().transform(val => new Date(val)).optional(),
  validUntil: z.string().transform(val => new Date(val)).optional(),
  isActive: z.boolean().optional(),
  maxUses: z.number().int().positive().optional(),
  maxUsesPerUser: z.number().int().positive().optional(),
  minOrderAmount: z.number().min(0).optional(),
  notes: z.string().max(1000).optional(),
});

// GET - Get single coupon with detailed stats
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { code } = await params;
    
    await connectToDatabase();
    
    // Find coupon
    const coupon = await GlobalCouponModel.findOne({ code: decodeURIComponent(code) });
    
    if (!coupon) {
      return NextResponse.json(
        { error: 'Coupon not found' },
        { status: 404 }
      );
    }
    
    // Get usage statistics
    const usageStats = await CouponUsageModel.aggregate([
      { $match: { couponCode: coupon.code, isReverted: false } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalDiscount: { $sum: '$discountApplied' },
          avgDiscountPerOrder: { $avg: '$discountApplied' },
          lastUsed: { $max: '$usedAt' },
          uniqueUsers: { $addToSet: '$userId' },
        }
      },
      {
        $project: {
          totalOrders: 1,
          totalDiscount: 1,
          avgDiscountPerOrder: 1,
          lastUsed: 1,
          uniqueUserCount: { $size: '$uniqueUsers' },
        }
      }
    ]);
    
    // Get recent usage (last 10 orders)
    const recentUsage = await CouponUsageModel.find({ 
      couponCode: coupon.code,
      isReverted: false 
    })
      .sort({ usedAt: -1 })
      .limit(10)
      .populate('userId', 'name email')
      .populate('orderId', 'grandTotal createdAt')
      .lean();
    
    return NextResponse.json({
      success: true,
      data: {
        coupon: coupon.toObject(),
        stats: usageStats[0] || {
          totalOrders: 0,
          totalDiscount: 0,
          avgDiscountPerOrder: 0,
          lastUsed: null,
          uniqueUserCount: 0,
        },
        recentUsage,
      },
    });
    
  } catch (error) {
    log.error('Error fetching coupon details', { error: error as Error });
    return NextResponse.json(
      { error: 'Failed to fetch coupon details' },
      { status: 500 }
    );
  }
}

// PUT - Update coupon
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { code } = await params;
    const body = await request.json();
    
    // Validate input
    const validatedData = UpdateCouponSchema.parse(body);
    
    await connectToDatabase();
    
    // Find coupon
    const coupon = await GlobalCouponModel.findOne({ code: decodeURIComponent(code) });
    
    if (!coupon) {
      return NextResponse.json(
        { error: 'Coupon not found' },
        { status: 404 }
      );
    }
    
    // Don't allow updating if coupon has been used (except certain fields)
    if (coupon.usedCount > 0) {
      const allowedFields = ['name', 'description', 'notes', 'isActive'];
      const disallowedFields = Object.keys(validatedData).filter(
        field => !allowedFields.includes(field)
      );
      
      if (disallowedFields.length > 0) {
        return NextResponse.json(
          { 
            error: 'Cannot update fields after coupon has been used',
            disallowedFields 
          },
          { status: 400 }
        );
      }
    }
    
    // Update coupon
    Object.assign(coupon, validatedData);
    await coupon.save();
    
    log.info('Coupon updated', { 
      couponCode: coupon.code,
      updatedBy: session.user.id,
      updates: Object.keys(validatedData),
    });
    
    return NextResponse.json({
      success: true,
      message: 'Coupon updated successfully',
      data: coupon,
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    
    log.error('Error updating coupon', { error: error as Error });
    return NextResponse.json(
      { error: 'Failed to update coupon' },
      { status: 500 }
    );
  }
}

// DELETE - Delete/Deactivate coupon
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { code } = await params;
    
    await connectToDatabase();
    
    const coupon = await GlobalCouponModel.findOne({ code: decodeURIComponent(code) });
    
    if (!coupon) {
      return NextResponse.json(
        { error: 'Coupon not found' },
        { status: 404 }
      );
    }
    
    // If coupon has been used, soft delete (deactivate)
    if (coupon.usedCount > 0) {
      coupon.isActive = false;
      await coupon.save();
      
      log.info('Coupon deactivated (soft delete)', { 
        couponCode: coupon.code,
        deletedBy: session.user.id,
        reason: 'Has usage history',
      });
      
      return NextResponse.json({
        success: true,
        message: 'Coupon deactivated (cannot delete used coupons)',
        data: coupon,
      });
    }
    
    // Otherwise, hard delete
    await GlobalCouponModel.deleteOne({ _id: coupon._id });
    
    log.info('Coupon deleted', { 
      couponCode: coupon.code,
      deletedBy: session.user.id,
    });
    
    return NextResponse.json({
      success: true,
      message: 'Coupon deleted successfully',
    });
    
  } catch (error) {
    log.error('Error deleting coupon', { error: error as Error });
    return NextResponse.json(
      { error: 'Failed to delete coupon' },
      { status: 500 }
    );
  }
}