import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { UserModel } from '@/models/User';
import { OrderModel } from '@/models/Order';
// import { WalletTransactionModel } from '@/models/WalletTransaction';
import { auth } from '@/auth';
import { log } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    // Check admin authentication
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const adminUser = await UserModel.findById(session.user.id);
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    await connectToDatabase();
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'month';
    
    // Date range calculation
    const end = new Date();
    const start = new Date();
    switch (period) {
      case 'week': start.setDate(end.getDate() - 7); break;
      case 'month': start.setMonth(end.getMonth() - 1); break;
      case 'quarter': start.setMonth(end.getMonth() - 3); break;
      case 'year': start.setFullYear(end.getFullYear() - 1); break;
      default: start.setFullYear(2020);
    }
    
    // Execute all user analytics queries
    const [
      userStats,
      registrationTrend,
      activityTrend,
      pointsDistribution,
      referralStats,
      userSegments,
      topUsers
    ] = await Promise.all([
      // 1. User Statistics
      UserModel.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end }
          }
        },
        {
          $facet: {
            totalUsers: [{ $count: 'count' }],
            byRole: [
              {
                $group: {
                  _id: '$role',
                  count: { $sum: 1 }
                }
              }
            ],
            byMonth: [
              {
                $group: {
                  _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' }
                  },
                  count: { $sum: 1 }
                }
              },
              { $sort: { '_id.year': 1, '_id.month': 1 } }
            ]
          }
        }
      ]),
      
      // 2. Registration Trend
      UserModel.aggregate([
        {
          $match: {
            role: 'customer',
            createdAt: { $gte: start, $lte: end }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } },
        { $limit: 30 }
      ]),
      
      // 3. User Activity Trend (based on orders)
      OrderModel.aggregate([
        {
          $match: {
            status: 'delivered',
            createdAt: { $gte: start, $lte: end }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            activeUsers: { $addToSet: '$userId' }
          }
        },
        {
          $project: {
            date: '$_id',
            activeUsersCount: { $size: '$activeUsers' }
          }
        },
        { $sort: { date: 1 } },
        { $limit: 30 }
      ]),
      
      // 4. Points Distribution
      UserModel.aggregate([
        {
          $match: {
            role: 'customer',
            points: { $gt: 0 }
          }
        },
        {
          $bucket: {
            groupBy: '$points',
            boundaries: [0, 100, 500, 1000, 5000, 10000, Infinity],
            default: 'Other',
            output: {
              count: { $sum: 1 },
              totalPoints: { $sum: '$points' },
              users: { $push: { name: '$name', points: '$points' } }
            }
          }
        }
      ]),
      
      // 5. Referral Statistics
      UserModel.aggregate([
        {
          $match: {
            totalReferrals: { $gt: 0 }
          }
        },
        {
          $group: {
            _id: null,
            totalReferrals: { $sum: '$totalReferrals' },
            totalReferrers: { $sum: 1 },
            avgReferrals: { $avg: '$totalReferrals' },
            maxReferrals: { $max: '$totalReferrals' },
            referralPoints: { $sum: '$referralPointsEarned' }
          }
        }
      ]),
      
      // 6. User Segments
      OrderModel.aggregate([
        {
          $match: {
            status: 'delivered',
            createdAt: { $gte: start, $lte: end }
          }
        },
        {
          $group: {
            _id: '$userId',
            orderCount: { $sum: 1 },
            totalSpent: { $sum: '$grandTotal' },
            lastOrder: { $max: '$createdAt' }
          }
        },
        {
          $bucket: {
            groupBy: '$orderCount',
            boundaries: [0, 1, 3, 5, 10, Infinity],
            default: 'Other',
            output: {
              count: { $sum: 1 },
              avgSpent: { $avg: '$totalSpent' },
              totalSpent: { $sum: '$totalSpent' }
            }
          }
        }
      ]),
      
      // 7. Top Users by Spending
      OrderModel.aggregate([
        {
          $match: {
            status: 'delivered',
            createdAt: { $gte: start, $lte: end }
          }
        },
        {
          $group: {
            _id: '$userId',
            totalSpent: { $sum: '$grandTotal' },
            orderCount: { $sum: 1 },
            avgOrderValue: { $avg: '$grandTotal' }
          }
        },
        { $sort: { totalSpent: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $project: {
            userId: '$_id',
            name: '$user.name',
            email: '$user.email',
            totalSpent: 1,
            orderCount: 1,
            avgOrderValue: 1
          }
        }
      ])
    ]);
    
    // Format response
    const response = {
      success: true,
      data: {
        period: { start, end, label: period },
        summary: {
          totalUsers: userStats[0]?.totalUsers[0]?.count || 0,
          byRole: userStats[0]?.byRole || [],
          referralStats: referralStats[0] || {
            totalReferrals: 0,
            totalReferrers: 0,
            avgReferrals: 0,
            maxReferrals: 0,
            referralPoints: 0
          }
        },
        trends: {
          registration: registrationTrend,
          activity: activityTrend
        },
        distribution: {
          points: pointsDistribution,
          segments: userSegments
        },
        topUsers,
        timestamp: new Date().toISOString()
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    log.error('Error fetching user analytics:', { error: error as Error });
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch user analytics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}