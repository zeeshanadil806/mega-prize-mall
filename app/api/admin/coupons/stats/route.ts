// app/api/admin/coupons/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireSessionRoles } from '@/shared/http';
import { connectToDatabase } from '@/lib/mongodb';
import { GlobalCouponModel } from '@/models/GlobalCoupon';
import { CouponUsageModel } from '@/models/CouponUsage';
import { log } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const session = await requireSessionRoles(["admin", "support"]);
    if (!session.ok) return session.response;
    
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month'; // day, week, month, year
    const limit = parseInt(searchParams.get('limit') || '10');
    
    await connectToDatabase();
    
    // Calculate date range based on period
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }
    
    // Overall statistics
    const totalCoupons = await GlobalCouponModel.countDocuments();
    const activeCoupons = await GlobalCouponModel.countDocuments({ 
      isActive: true,
      validUntil: { $gt: now },
      validFrom: { $lte: now },
    });
    const expiredCoupons = await GlobalCouponModel.countDocuments({ 
      validUntil: { $lt: now }
    });
    const fullyUsedCoupons = await GlobalCouponModel.countDocuments({
      $expr: { $gte: ['$usedCount', '$maxUses'] }
    });
    
    // Usage statistics
    const usageStats = await CouponUsageModel.aggregate([
      { $match: { usedAt: { $gte: startDate }, isReverted: false } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalDiscount: { $sum: '$discountApplied' },
          avgDiscountPerOrder: { $avg: '$discountApplied' },
          uniqueUsers: { $addToSet: '$userId' },
        }
      },
      {
        $project: {
          totalOrders: 1,
          totalDiscount: 1,
          avgDiscountPerOrder: 1,
          uniqueUserCount: { $size: '$uniqueUsers' },
        }
      }
    ]);
    
    // Top performing coupons
    const topCoupons = await CouponUsageModel.aggregate([
      { $match: { usedAt: { $gte: startDate }, isReverted: false } },
      {
        $group: {
          _id: '$couponCode',
          usageCount: { $sum: 1 },
          totalDiscount: { $sum: '$discountApplied' },
          avgOrderValue: { $avg: '$orderAmount' },
        }
      },
      { $sort: { usageCount: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'globalcoupons',
          localField: '_id',
          foreignField: 'code',
          as: 'couponDetails',
        }
      },
      { $unwind: { path: '$couponDetails', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          code: '$_id',
          name: '$couponDetails.name',
          discountType: '$couponDetails.discountType',
          discountValue: '$couponDetails.discountValue',
          usageCount: 1,
          totalDiscount: 1,
          avgOrderValue: 1,
          redemptionRate: {
            $cond: [
              { $eq: ['$couponDetails.maxUses', null] },
              null,
              { $divide: ['$usageCount', '$couponDetails.maxUses'] }
            ]
          },
        }
      }
    ]);
    
    // Daily usage trend (last 30 days)
    const dailyTrend = await CouponUsageModel.aggregate([
      { 
        $match: { 
          usedAt: { 
            $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
            $lte: now,
          },
          isReverted: false,
        } 
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$usedAt' }
          },
          count: { $sum: 1 },
          totalDiscount: { $sum: '$discountApplied' },
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: '$_id',
          count: 1,
          totalDiscount: 1,
          _id: 0,
        }
      }
    ]);
    
    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalCoupons,
          activeCoupons,
          expiredCoupons,
          fullyUsedCoupons,
          unusedCoupons: totalCoupons - activeCoupons - expiredCoupons - fullyUsedCoupons,
        },
        usage: usageStats[0] || {
          totalOrders: 0,
          totalDiscount: 0,
          avgDiscountPerOrder: 0,
          uniqueUserCount: 0,
        },
        topCoupons,
        dailyTrend,
        period: {
          start: startDate,
          end: now,
          type: period,
        },
      },
    });
    
  } catch (error) {
    log.error('Error fetching coupon stats', { error: error as Error });
    return NextResponse.json(
      { error: 'Failed to fetch coupon statistics' },
      { status: 500 }
    );
  }
}