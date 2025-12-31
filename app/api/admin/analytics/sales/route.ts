import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { OrderModel } from '@/models/Order';
// import { ProductModel } from '@/models/Product';
// import { UserModel } from '@/models/User';
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
    case 'yesterday':
      start.setDate(now.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      now.setDate(now.getDate() - 1);
      now.setHours(23, 59, 59, 999);
      break;
    case 'week':
      start.setDate(now.getDate() - 7);
      break;
    case 'month':
      start.setMonth(now.getMonth() - 1);
      break;
    case 'quarter':
      start.setMonth(now.getMonth() - 3);
      break;
    case 'year':
      start.setFullYear(now.getFullYear() - 1);
      break;
    default:
      // Custom range: format YYYY-MM-DD
      if (period.includes('_to_')) {
        const [startStr, endStr] = period.split('_to_');
        return {
          start: new Date(startStr),
          end: new Date(endStr)
        };
      }
      start.setFullYear(2020); // All time
  }
  
  return { start, end: new Date() };
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
    const groupBy = searchParams.get('groupBy') || 'day'; // day, week, month, category, product
    
    const { start, end } = getDateRange(period);
    
    let salesData;
    
    switch (groupBy) {
      case 'category':
        salesData = await getSalesByCategory(start, end);
        break;
      case 'product':
        salesData = await getSalesByProduct(start, end);
        break;
      case 'week':
        salesData = await getSalesByWeek(start, end);
        break;
      case 'month':
        salesData = await getSalesByMonth(start, end);
        break;
      default: // day
        salesData = await getSalesByDay(start, end);
    }
    
    // Get summary statistics
    const summary = await getSalesSummary(start, end);
    
    // Get top performing metrics
    const topMetrics = await getTopMetrics(start, end);
    
    const response = {
      success: true,
      data: {
        period: {
          start,
          end,
          label: period,
          groupBy
        },
        summary,
        salesData,
        topMetrics,
        timestamp: new Date().toISOString()
      }
    };
    
    log.info('Sales analytics fetched', {
      period,
      groupBy,
      totalRevenue: summary.totalRevenue,
      totalOrders: summary.totalOrders
    });
    
    return NextResponse.json(response);
    
  } catch (error) {
    log.error('Error fetching sales analytics:', { error: error as Error });
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch sales analytics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Helper functions
async function getSalesByDay(start: Date, end: Date) {
  return OrderModel.aggregate([
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
        orders: { $sum: 1 },
        items: { $sum: { $size: '$items' } },
        averageOrderValue: { $avg: '$grandTotal' },
        discounts: { $sum: '$discountTotal' }
      }
    },
    { $sort: { _id: 1 } }
  ]);
}

async function getSalesByWeek(start: Date, end: Date) {
  return OrderModel.aggregate([
    {
      $match: {
        status: 'delivered',
        createdAt: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' }
        },
        revenue: { $sum: '$grandTotal' },
        orders: { $sum: 1 },
        items: { $sum: { $size: '$items' } },
        averageOrderValue: { $avg: '$grandTotal' }
      }
    },
    { 
      $sort: { 
        '_id.year': 1, 
        '_id.week': 1 
      } 
    }
  ]);
}

async function getSalesByMonth(start: Date, end: Date) {
  return OrderModel.aggregate([
    {
      $match: {
        status: 'delivered',
        createdAt: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        revenue: { $sum: '$grandTotal' },
        orders: { $sum: 1 },
        items: { $sum: { $size: '$items' } },
        averageOrderValue: { $avg: '$grandTotal' }
      }
    },
    { 
      $sort: { 
        '_id.year': 1, 
        '_id.month': 1 
      } 
    }
  ]);
}

async function getSalesByCategory(start: Date, end: Date) {
  return OrderModel.aggregate([
    {
      $match: {
        status: 'delivered',
        createdAt: { $gte: start, $lte: end }
      }
    },
    { $unwind: '$items' },
    {
      $lookup: {
        from: 'products',
        localField: 'items.productId',
        foreignField: '_id',
        as: 'product'
      }
    },
    { $unwind: '$product' },
    {
      $group: {
        _id: '$product.category',
        revenue: { $sum: { $multiply: ['$items.finalPrice', '$items.quantity'] } },
        orders: { $sum: 1 },
        items: { $sum: '$items.quantity' },
        products: { $addToSet: '$product._id' }
      }
    },
    { $sort: { revenue: -1 } }
  ]);
}

async function getSalesByProduct(start: Date, end: Date) {
  return OrderModel.aggregate([
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
        revenue: { $sum: { $multiply: ['$items.finalPrice', '$items.quantity'] } },
        quantity: { $sum: '$items.quantity' },
        orders: { $sum: 1 },
        averagePrice: { $avg: '$items.finalPrice' }
      }
    },
    { $sort: { revenue: -1 } },
    { $limit: 20 }
  ]);
}

async function getSalesSummary(start: Date, end: Date) {
  const [
    revenueStats,
    orderStats,
    customerStats,
    discountStats,
    shippingStats
  ] = await Promise.all([
    // Revenue
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
          total: { $sum: '$grandTotal' },
          average: { $avg: '$grandTotal' },
          min: { $min: '$grandTotal' },
          max: { $max: '$grandTotal' }
        }
      }
    ]),
    
    // Orders
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
          total: { $sum: 1 },
          averageItems: { $avg: { $size: '$items' } }
        }
      }
    ]),
    
    // Customers
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
          orders: { $sum: 1 },
          revenue: { $sum: '$grandTotal' }
        }
      },
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          averageOrdersPerCustomer: { $avg: '$orders' },
          averageRevenuePerCustomer: { $avg: '$revenue' }
        }
      }
    ]),
    
    // Discounts
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
          totalDiscounts: { $sum: '$discountTotal' },
          averageDiscount: { $avg: '$discountTotal' },
          discountPercentage: { 
            $avg: { 
              $cond: [
                { $eq: ['$subtotal', 0] },
                0,
                { $divide: ['$discountTotal', '$subtotal'] }
              ]
            } 
          }
        }
      }
    ]),
    
    // Shipping
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
          totalShipping: { $sum: '$shippingFee' },
          averageShipping: { $avg: '$shippingFee' },
          freeShippingOrders: {
            $sum: {
              $cond: [{ $eq: ['$shippingFee', 0] }, 1, 0]
            }
          }
        }
      }
    ])
  ]);
  
  return {
    totalRevenue: revenueStats[0]?.total || 0,
    averageOrderValue: revenueStats[0]?.average || 0,
    minOrderValue: revenueStats[0]?.min || 0,
    maxOrderValue: revenueStats[0]?.max || 0,
    
    totalOrders: orderStats[0]?.total || 0,
    averageItemsPerOrder: orderStats[0]?.averageItems || 0,
    
    totalCustomers: customerStats[0]?.totalCustomers || 0,
    averageOrdersPerCustomer: customerStats[0]?.averageOrdersPerCustomer || 0,
    averageRevenuePerCustomer: customerStats[0]?.averageRevenuePerCustomer || 0,
    
    totalDiscounts: discountStats[0]?.totalDiscounts || 0,
    averageDiscount: discountStats[0]?.averageDiscount || 0,
    averageDiscountPercentage: (discountStats[0]?.discountPercentage || 0) * 100,
    
    totalShipping: shippingStats[0]?.totalShipping || 0,
    averageShipping: shippingStats[0]?.averageShipping || 0,
    freeShippingOrders: shippingStats[0]?.freeShippingOrders || 0,
    freeShippingPercentage: orderStats[0]?.total ? 
      (shippingStats[0]?.freeShippingOrders / orderStats[0]?.total) * 100 : 0
  };
}

async function getTopMetrics(start: Date, end: Date) {
  const [
    topProducts,
    topCategories,
    topCustomers,
    peakDays,
    paymentMethods
  ] = await Promise.all([
    // Top Products
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
          name: { $first: '$items.productName' },
          revenue: { $sum: { $multiply: ['$items.finalPrice', '$items.quantity'] } },
          quantity: { $sum: '$items.quantity' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 }
    ]),
    
    // Top Categories
    OrderModel.aggregate([
      {
        $match: {
          status: 'delivered',
          createdAt: { $gte: start, $lte: end }
        }
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.category',
          revenue: { $sum: { $multiply: ['$items.finalPrice', '$items.quantity'] } },
          products: { $addToSet: '$product._id' }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 }
    ]),
    
    // Top Customers
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
          revenue: { $sum: '$grandTotal' },
          orders: { $sum: 1 },
          averageOrderValue: { $avg: '$grandTotal' }
        }
      },
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
          revenue: 1,
          orders: 1,
          averageOrderValue: 1
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 }
    ]),
    
    // Peak Days
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
      { $sort: { revenue: -1 } },
      { $limit: 5 }
    ]),
    
    // Payment Methods
    OrderModel.aggregate([
      {
        $match: {
          status: 'delivered',
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$paymentMethod',
          orders: { $sum: 1 },
          revenue: { $sum: '$grandTotal' }
        }
      },
      { $sort: { revenue: -1 } }
    ])
  ]);
  
  return {
    topProducts,
    topCategories,
    topCustomers,
    peakDays,
    paymentMethods
  };
}