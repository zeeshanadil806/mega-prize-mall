import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { WalletTransactionModel } from '@/models/WalletTransaction';
import { UserModel } from '@/models/User';
import { OrderModel } from '@/models/Order';
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
    
    // Date range
    const end = new Date();
    const start = new Date();
    switch (period) {
      case 'week': start.setDate(end.getDate() - 7); break;
      case 'month': start.setMonth(end.getMonth() - 1); break;
      case 'quarter': start.setMonth(end.getMonth() - 3); break;
      case 'year': start.setFullYear(end.getFullYear() - 1); break;
      default: start.setFullYear(2020);
    }
    
    const [
      pointsSummary,
      pointsByType,
      pointsTrend,
      topEarners,
      topRedeemers,
      pointsExpiry,
      pointsUtilization
    ] = await Promise.all([
      // 1. Points Summary
      WalletTransactionModel.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end }
          }
        },
        {
          $facet: {
            totalEarned: [
              {
                $match: { type: 'earn', status: 'completed' }
              },
              {
                $group: {
                  _id: null,
                  points: { $sum: '$points' },
                  value: { $sum: { $multiply: ['$points', '$rate'] } }
                }
              }
            ],
            totalRedeemed: [
              {
                $match: { type: 'redeem', status: 'completed' }
              },
              {
                $group: {
                  _id: null,
                  points: { $sum: { $abs: '$points' } },
                  value: { $sum: { $multiply: [{ $abs: '$points' }, '$rate'] } }
                }
              }
            ],
            totalExpired: [
              {
                $match: { type: 'expiry', status: 'completed' }
              },
              {
                $group: {
                  _id: null,
                  points: { $sum: { $abs: '$points' } },
                  value: { $sum: { $multiply: [{ $abs: '$points' }, '$rate'] } }
                }
              }
            ],
            currentBalance: [
              {
                $match: { status: 'completed' }
              },
              {
                $sort: { createdAt: -1 }
              },
              {
                $group: {
                  _id: '$userId',
                  latestBalance: { $first: '$balanceAfter' }
                }
              },
              {
                $group: {
                  _id: null,
                  totalBalance: { $sum: '$latestBalance' },
                  userCount: { $sum: 1 },
                  avgBalance: { $avg: '$latestBalance' }
                }
              }
            ]
          }
        }
      ]),
      
      // 2. Points by Type
      WalletTransactionModel.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
            status: 'completed'
          }
        },
        {
          $group: {
            _id: '$type',
            points: { 
              $sum: { 
                $cond: [
                  { $in: ['$type', ['redeem', 'expiry']] },
                  { $abs: '$points' },
                  '$points'
                ]
              }
            },
            transactions: { $sum: 1 },
            value: { 
              $sum: { 
                $multiply: [
                  { 
                    $cond: [
                      { $in: ['$type', ['redeem', 'expiry']] },
                      { $abs: '$points' },
                      '$points'
                    ]
                  },
                  '$rate'
                ]
              }
            }
          }
        }
      ]),
      
      // 3. Points Trend
      WalletTransactionModel.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
            status: 'completed'
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            earned: {
              $sum: {
                $cond: [
                  { $eq: ['$type', 'earn'] },
                  '$points',
                  0
                ]
              }
            },
            redeemed: {
              $sum: {
                $cond: [
                  { $eq: ['$type', 'redeem'] },
                  { $abs: '$points' },
                  0
                ]
              }
            },
            expired: {
              $sum: {
                $cond: [
                  { $eq: ['$type', 'expiry'] },
                  { $abs: '$points' },
                  0
                ]
              }
            }
          }
        },
        { $sort: { _id: 1 } },
        { $limit: 30 }
      ]),
      
      // 4. Top Points Earners
      WalletTransactionModel.aggregate([
        {
          $match: {
            type: 'earn',
            status: 'completed',
            createdAt: { $gte: start, $lte: end }
          }
        },
        {
          $group: {
            _id: '$userId',
            points: { $sum: '$points' },
            value: { $sum: { $multiply: ['$points', '$rate'] } },
            transactions: { $sum: 1 }
          }
        },
        { $sort: { points: -1 } },
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
            points: 1,
            value: 1,
            transactions: 1
          }
        }
      ]),
      
      // 5. Top Points Redeemers
      WalletTransactionModel.aggregate([
        {
          $match: {
            type: 'redeem',
            status: 'completed',
            createdAt: { $gte: start, $lte: end }
          }
        },
        {
          $group: {
            _id: '$userId',
            points: { $sum: { $abs: '$points' } },
            value: { $sum: { $multiply: [{ $abs: '$points' }, '$rate'] } },
            transactions: { $sum: 1 }
          }
        },
        { $sort: { points: -1 } },
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
            points: 1,
            value: 1,
            transactions: 1
          }
        }
      ]),
      
      // 6. Points Expiry Data
      WalletTransactionModel.aggregate([
        {
          $match: {
            type: 'expiry',
            status: 'completed',
            createdAt: { $gte: start, $lte: end }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m', date: '$createdAt' }
            },
            points: { $sum: { $abs: '$points' } },
            value: { $sum: { $multiply: [{ $abs: '$points' }, '$rate'] } },
            users: { $addToSet: '$userId' }
          }
        },
        { $sort: { _id: -1 } },
        { $limit: 12 }
      ]),
      
      // 7. Points Utilization Rate
      OrderModel.aggregate([
        {
          $match: {
            status: 'delivered',
            createdAt: { $gte: start, $lte: end },
            pointsRedeemed: { $gt: 0 }
          }
        },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            ordersWithPoints: { $sum: 1 },
            totalPointsRedeemed: { $sum: '$pointsRedeemed' },
            totalDiscountValue: { $sum: '$pointsValue' },
            avgPointsPerOrder: { $avg: '$pointsRedeemed' }
          }
        }
      ])
    ]);
    
    // Calculate utilization rate
    const totalOrders = pointsUtilization[0]?.totalOrders || 0;
    const ordersWithPoints = pointsUtilization[0]?.ordersWithPoints || 0;
    const utilizationRate = totalOrders > 0 ? (ordersWithPoints / totalOrders) * 100 : 0;
    
    const response = {
      success: true,
      data: {
        period: { start, end, label: period },
        summary: {
          totalEarned: pointsSummary[0]?.totalEarned[0] || { points: 0, value: 0 },
          totalRedeemed: pointsSummary[0]?.totalRedeemed[0] || { points: 0, value: 0 },
          totalExpired: pointsSummary[0]?.totalExpired[0] || { points: 0, value: 0 },
          currentBalance: pointsSummary[0]?.currentBalance[0] || { 
            totalBalance: 0, 
            userCount: 0, 
            avgBalance: 0 
          },
          utilizationRate: utilizationRate.toFixed(1)
        },
        distribution: {
          byType: pointsByType
        },
        trends: {
          daily: pointsTrend
        },
        topUsers: {
          earners: topEarners,
          redeemers: topRedeemers
        },
        expiry: {
          monthly: pointsExpiry
        },
        timestamp: new Date().toISOString()
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    log.error('Error fetching points analytics:', { error: error as Error });
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch points analytics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}