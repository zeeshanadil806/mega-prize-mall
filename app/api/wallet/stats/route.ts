import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { WalletTransactionModel } from '@/models/WalletTransaction';
import { UserModel } from '@/models/User';
import { requireSession } from '@/shared/http';
import { log } from '@/lib/logger';
import { STORE_CONFIG } from '@/shared/config';

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession();
    if (!session.ok) return session.response;

    await connectToDatabase();

    const userId = session.user.id;
    const currentDate = new Date();
    
    // Calculate start of current and previous month
    const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const lastMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0, 23, 59, 59);

    // Get user current points
    const user = await UserModel.findById(userId).lean();
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Run all aggregations in parallel
    const [
      currentMonthEarned,
      lastMonthEarned,
      pointsExpiringSoon,
      totalEarned,
      totalRedeemed,
      monthlyBreakdown,
      typeBreakdown,
    ] = await Promise.all([
      // Current month earned
      WalletTransactionModel.aggregate([
        {
          $match: {
            userId,
            type: 'earn',
            status: 'completed',
            createdAt: { $gte: currentMonthStart },
          },
        },
        { $group: { _id: null, total: { $sum: '$points' } } },
      ]),
      
      // Last month earned
      WalletTransactionModel.aggregate([
        {
          $match: {
            userId,
            type: 'earn',
            status: 'completed',
            createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
          },
        },
        { $group: { _id: null, total: { $sum: '$points' } } },
      ]),
      
      // Points expiring in next 30 days
      WalletTransactionModel.aggregate([
        {
          $match: {
            userId,
            type: 'earn',
            expiresAt: {
              $gte: new Date(),
              $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          },
        },
        { $group: { _id: null, total: { $sum: '$points' }, count: { $sum: 1 } } },
      ]),
      
      // Total earned
      WalletTransactionModel.aggregate([
        { $match: { userId, type: 'earn', status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$points' }, count: { $sum: 1 } } },
      ]),
      
      // Total redeemed
      WalletTransactionModel.aggregate([
        { $match: { userId, type: 'redeem', status: 'completed' } },
        { $group: { _id: null, total: { $sum: { $abs: '$points' } }, count: { $sum: 1 } } },
      ]),
      
      // Last 6 months breakdown
      WalletTransactionModel.aggregate([
        {
          $match: {
            userId,
            type: 'earn',
            status: 'completed',
            createdAt: {
              $gte: new Date(currentDate.getFullYear(), currentDate.getMonth() - 5, 1),
            },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            points: { $sum: '$points' },
            transactions: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 6 },
      ]),
      
      // Type breakdown (last 30 days)
      WalletTransactionModel.aggregate([
        {
          $match: {
            userId,
            status: 'completed',
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          },
        },
        {
          $group: {
            _id: '$type',
            points: { $sum: '$points' },
            count: { $sum: 1 },
            monetaryValue: { $sum: { $multiply: [{ $abs: '$points' }, '$rate'] } },
          },
        },
      ]),
    ]);

    // Format monthly breakdown
    const formattedMonthly = monthlyBreakdown.map(item => ({
      month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
      label: `${new Date(item._id.year, item._id.month - 1).toLocaleString('default', { month: 'short' })} ${item._id.year}`,
      points: item.points,
      transactions: item.transactions,
      value: item.points * STORE_CONFIG.pointsToRupeeRate,
    }));

    // Format type breakdown
    const formattedTypeBreakdown = typeBreakdown.map(item => ({
      type: item._id,
      label: item._id.charAt(0).toUpperCase() + item._id.slice(1),
      points: item.points,
      count: item.count,
      monetaryValue: item.monetaryValue,
    }));

    // Get recent transactions
    const recentTransactions = await WalletTransactionModel.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const stats = {
      currentPoints: user.points,
      monetaryValue: user.points * STORE_CONFIG.pointsToRupeeRate,
      currentMonthEarned: currentMonthEarned[0]?.total || 0,
      lastMonthEarned: lastMonthEarned[0]?.total || 0,
      pointsExpiringSoon: pointsExpiringSoon[0]?.total || 0,
      expiringCount: pointsExpiringSoon[0]?.count || 0,
      totalEarned: totalEarned[0]?.total || 0,
      totalEarnedCount: totalEarned[0]?.count || 0,
      totalRedeemed: totalRedeemed[0]?.total || 0,
      totalRedeemedCount: totalRedeemed[0]?.count || 0,
      netPoints: user.points,
      monthlyBreakdown: formattedMonthly,
      typeBreakdown: formattedTypeBreakdown,
      recentTransactions: recentTransactions.map(tx => ({
        id: tx._id,
        type: tx.type,
        points: tx.points,
        description: tx.description,
        date: tx.createdAt,
        balanceAfter: tx.balanceAfter,
      })),
      calculatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });

  } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to generate invoice';
    log.error('Error fetching wallet stats', { error: error as Error });
    return NextResponse.json(
      { error: errorMessage || 'Failed to fetch wallet statistics' },
      { status: 400 }
    );
  }
}
