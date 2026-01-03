import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { OrderModel } from '@/models/Order';
import { UserModel } from '@/models/User';
import { ProductModel } from '@/models/Product';
import { WalletTransactionModel } from '@/models/WalletTransaction';
// import { auth } from '@/auth';
import { log } from '@/lib/logger';

// Helper to get date ranges
function getDateRange(period: string) {
  const now = new Date();
  const start = new Date();
  
  switch (period) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      break;
    case 'week':
      start.setDate(now.getDate() - 7);
      break;
    case 'month':
      start.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      start.setFullYear(now.getFullYear() - 1);
      break;
    case 'all':
      start.setFullYear(2020); // Far back date
      break;
  }
  
  return { start, end: now };
}

export async function GET(request: NextRequest) {
  try {
    // const session = await auth();
    
    // // Check admin authentication
    // if (!session?.user?.id) {
    //   return NextResponse.json(
    //     { error: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }
    
    // const adminUser = await UserModel.findById(session.user.id);
    // if (!adminUser || adminUser.role !== 'admin') {
    //   return NextResponse.json(
    //     { error: 'Forbidden: Admin access required' },
    //     { status: 403 }
    //   );
    // }
    
    await connectToDatabase();
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'month';
    
    const { start, end } = getDateRange(period as string);
    
    // Execute all analytics queries in parallel
    const [
      totalOrders,
      totalRevenue,
      totalCustomers,
      activeProducts,
      completedOrders,
      pendingOrders,
      totalPointsEarned,
      totalPointsRedeemed,
      recentOrders,
      topProducts,
      revenueByDay,
      userRegistrations
    ] = await Promise.all([
      // 1. Total Orders
      OrderModel.countDocuments({
        createdAt: { $gte: start, $lte: end }
      }),
      
      // 2. Total Revenue (only delivered orders)
      OrderModel.aggregate([
        {
          $match: {
            status: 'delivered',
            createdAt: { $gte: start, $lte: end }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$grandTotal' }
          }
        }
      ]),
      
      // 3. Total Customers
      UserModel.countDocuments({
        role: 'customer',
        createdAt: { $gte: start, $lte: end }
      }),
      
      // 4. Active Products
      ProductModel.countDocuments({ isActive: true }),
      
      // 5. Completed Orders (delivered)
      OrderModel.countDocuments({
        status: 'delivered',
        createdAt: { $gte: start, $lte: end }
      }),
      
      // 6. Pending Orders
      OrderModel.countDocuments({
        status: { $in: ['pending', 'confirmed', 'processing'] },
        createdAt: { $gte: start, $lte: end }
      }),
      
      // 7. Total Points Earned
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
            _id: null,
            total: { $sum: '$points' }
          }
        }
      ]),
      
      // 8. Total Points Redeemed
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
            _id: null,
            total: { $sum: { $abs: '$points' } }
          }
        }
      ]),
      
      // 9. Recent Orders (last 10)
      OrderModel.find({
        createdAt: { $gte: start, $lte: end }
      })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('grandTotal status createdAt userId')
        .lean(),
      
      // 10. Top Selling Products
      OrderModel.aggregate([
        {
          $match: {
            status: 'delivered',
            createdAt: { $gte: start, $lte: end }
          }
        },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.productId',
            productName: { $first: '$items.productName' },
            totalQuantity: { $sum: '$items.quantity' },
            totalRevenue: { $sum: { $multiply: ['$items.finalPrice', '$items.quantity'] } }
          }
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 5 }
      ]),
      
      // 11. Revenue by Day (for chart)
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
            revenue: { $sum: '$grandTotal' },
            orders: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } },
        { $limit: 30 }
      ]),
      
      // 12. User Registrations by Day
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
      ])
    ]);
    
    // Format the response
    const totalRevenueValue = totalRevenue[0]?.total || 0;
    const totalPointsEarnedValue = totalPointsEarned[0]?.total || 0;
    const totalPointsRedeemedValue = totalPointsRedeemed[0]?.total || 0;
    
    // Calculate conversion rate (orders per customer)
    const conversionRate = totalCustomers > 0 
      ? ((totalOrders / totalCustomers) * 100).toFixed(1)
      : '0.0';
    
    // Calculate average order value
    const averageOrderValue = totalOrders > 0
      ? (totalRevenueValue / totalOrders).toFixed(2)
      : '0.00';
    
    // Format recent orders
    const formattedRecentOrders = await Promise.all(
      recentOrders.map(async (order) => {
        const user = await UserModel.findById(order.userId).select('name email').lean();
        return {
          id: order._id.toString().slice(-6),
          amount: order.grandTotal,
          status: order.status,
          date: order.createdAt,
          customer: user?.name || 'Unknown',
          email: user?.email || ''
        };
      })
    );
    
    // Format chart data
    const revenueChartData = revenueByDay.map(item => ({
      date: item._id,
      revenue: item.revenue,
      orders: item.orders
    }));
    
    const userChartData = userRegistrations.map(item => ({
      date: item._id,
      users: item.count
    }));
    
    const response = {
      success: true,
      data: {
        period: {
          start,
          end,
          label: period
        },
        summary: {
          totalOrders,
          totalRevenue: totalRevenueValue,
          totalCustomers,
          activeProducts,
          conversionRate: `${conversionRate}%`,
          averageOrderValue: `Rs ${averageOrderValue}`,
          completedOrders,
          pendingOrders,
          totalPointsEarned: totalPointsEarnedValue,
          totalPointsRedeemed: totalPointsRedeemedValue,
          pointsValue: (totalPointsEarnedValue * 0.1) - (totalPointsRedeemedValue * 0.1),
        },
        charts: {
          revenue: revenueChartData,
          users: userChartData
        },
        topProducts: topProducts.map(product => ({
          id: product._id,
          name: product.productName,
          quantity: product.totalQuantity,
          revenue: product.totalRevenue
        })),
        recentOrders: formattedRecentOrders,
        timestamp: new Date().toISOString()
      }
    };
    
    log.info('Analytics overview fetched', {
      period,
      totalOrders,
      totalRevenue: totalRevenueValue,
      totalCustomers
    });
    
    return NextResponse.json(response);
    
  } catch (error) {
    log.error('Error fetching analytics overview:', { error: error as Error });
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch analytics data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}