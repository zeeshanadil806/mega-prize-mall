import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ProductModel } from '@/models/Product';
import { OrderModel } from '@/models/Order';
import { log } from '@/lib/logger';
import { requireAdmin } from '@/shared/http';
import { UserModel } from '@/models';

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return admin.response;

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
      productStats,
      salesByCategory,
      inventoryStatus,
      topPerformers,
      lowPerformers,
      bargainProducts,
      stockAlerts
    ] = await Promise.all([
      // 1. Product Statistics
      ProductModel.aggregate([
        {
          $facet: {
            totalProducts: [{ $count: 'count' }],
            byStatus: [
              {
                $group: {
                  _id: '$isActive',
                  count: { $sum: 1 }
                }
              }
            ],
            byCategory: [
              {
                $group: {
                  _id: '$category',
                  count: { $sum: 1 },
                  avgPrice: { $avg: '$price' }
                }
              }
            ]
          }
        }
      ]),
      
      // 2. Sales by Category
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
            revenue: { 
              $sum: { 
                $multiply: ['$items.finalPrice', '$items.quantity'] 
              } 
            },
            quantity: { $sum: '$items.quantity' },
            products: { $addToSet: '$product._id' },
            avgPrice: { $avg: '$items.finalPrice' }
          }
        },
        { $sort: { revenue: -1 } }
      ]),
      
      // 3. Inventory Status
      ProductModel.aggregate([
        {
          $bucket: {
            groupBy: '$stock',
            boundaries: [0, 10, 50, 100, 500, Infinity],
            default: 'Other',
            output: {
              count: { $sum: 1 },
              products: { 
                $push: {
                  name: '$name',
                  stock: '$stock',
                  sku: '$sku'
                }
              }
            }
          }
        }
      ]),
      
      // 4. Top Performers
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
            revenue: { 
              $sum: { 
                $multiply: ['$items.finalPrice', '$items.quantity'] 
              } 
            },
            quantity: { $sum: '$items.quantity' },
            orders: { $sum: 1 },
            avgPrice: { $avg: '$items.finalPrice' }
          }
        },
        { $sort: { revenue: -1 } },
        { $limit: 10 }
      ]),
      
      // 5. Low Performers (products with no sales)
      ProductModel.aggregate([
        {
          $lookup: {
            from: 'orders',
            let: { productId: '$_id' },
            pipeline: [
              { $unwind: '$items' },
              {
                $match: {
                  $expr: {
                    $eq: ['$items.productId', '$$productId']
                  },
                  status: 'delivered',
                  createdAt: { $gte: start, $lte: end }
                }
              }
            ],
            as: 'sales'
          }
        },
        {
          $match: {
            sales: { $size: 0 },
            isActive: true
          }
        },
        {
          $project: {
            name: 1,
            sku: 1,
            price: 1,
            stock: 1,
            category: 1,
            createdAt: 1
          }
        },
        { $sort: { createdAt: -1 } },
        { $limit: 10 }
      ]),
      
      // 6. Bargain Products Performance
      ProductModel.aggregate([
        {
          $match: {
            bargainEnabled: true,
            bargainCount: { $gt: 0 }
          }
        },
        {
          $lookup: {
            from: 'bargainrequests',
            localField: '_id',
            foreignField: 'productId',
            as: 'bargains'
          }
        },
        {
          $project: {
            name: 1,
            price: 1,
            bargainCount: 1,
            successfulBargains: {
              $size: {
                $filter: {
                  input: '$bargains',
                  as: 'bargain',
                  cond: { $eq: ['$$bargain.status', 'accepted'] }
                }
              }
            },
            bargainSuccessRate: {
              $cond: [
                { $eq: ['$bargainCount', 0] },
                0,
                {
                  $divide: [
                    {
                      $size: {
                        $filter: {
                          input: '$bargains',
                          as: 'bargain',
                          cond: { $eq: ['$$bargain.status', 'accepted'] }
                        }
                      }
                    },
                    '$bargainCount'
                  ]
                }
              ]
            }
          }
        },
        { $sort: { bargainCount: -1 } },
        { $limit: 10 }
      ]),
      
      // 7. Stock Alerts
      ProductModel.find({
        stock: { $lt: 10 },
        isActive: true
      })
      .select('name sku stock price category')
      .sort({ stock: 1 })
      .limit(20)
      .lean()
    ]);
    
    const response = {
      success: true,
      data: {
        period: { start, end, label: period },
        summary: {
          totalProducts: productStats[0]?.totalProducts[0]?.count || 0,
          activeProducts: productStats[0]?.byStatus?.find((s:{ _id: boolean; count: number }) => s._id === true)?.count || 0,
          categories: productStats[0]?.byCategory?.length || 0
        },
        sales: {
          byCategory: salesByCategory,
          topPerformers,
          lowPerformers: lowPerformers.length
        },
        inventory: {
          status: inventoryStatus,
          alerts: stockAlerts
        },
        bargainPerformance: bargainProducts,
        timestamp: new Date().toISOString()
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    log.error('Error fetching product analytics:', { error: error as Error });
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch product analytics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}