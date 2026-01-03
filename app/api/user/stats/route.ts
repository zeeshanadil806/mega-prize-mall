import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { UserModel } from '@/models/User';
import { OrderModel } from '@/models/Order';
import { BargainRequestModel } from '@/models/BargainRequest';
import { auth } from '@/auth';
import { ProductProps } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const userId = session.user.id;

    // Fetch all data in parallel
    const [user, orders, bargainRequests] = await Promise.all([
      // User details
      UserModel.findById(userId).select('points email name').lean(),
      
      // User's orders
      OrderModel.find({ userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('_id status grandTotal createdAt items')
        .lean(),
      
      // User's active bargain requests
      BargainRequestModel.find({ 
        userId, 
        isActive: true 
      })
        .populate('productId', 'name slug images')
        .sort({ createdAt: -1 })
        .select('_id productId originalPrice offeredPrice status createdAt message')
        .lean(),
    ]);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate stats
    const totalOrders = orders.length;
    
    const activeBargains = bargainRequests.filter(
      br => br.status === 'pending' || br.status === 'accepted'
    ).length;

    // Calculate bargain success rate
    const totalBargains = bargainRequests.length;
    const successfulBargains = bargainRequests.filter(
      br => br.status === 'accepted'
    ).length;
    const successRate = totalBargains > 0 
      ? Math.round((successfulBargains / totalBargains) * 100)
      : 0;

    // Format recent orders
    const recentOrders = orders.slice(0, 3).map(order => ({
      id: order._id.toString().slice(-8).toUpperCase(),
      date: formatDate(order.createdAt),
      amount: `₹${order.grandTotal.toLocaleString('en-IN')}`,
      status: formatStatus(order.status),
      fullId: order._id.toString(),
    }));

    // Format active bargains
    const formattedBargains = bargainRequests
      .filter(br => br.status === 'pending' || br.status === 'accepted')
      .slice(0, 3)
      .map(br => {
        const product = br.productId as ProductProps;
        return {
          product: product?.name || 'Unknown Product',
          productId: product?._id || '',
          offer: `₹${br.offeredPrice.toLocaleString('en-IN')}`,
          original: `₹${br.originalPrice.toLocaleString('en-IN')}`,
          status: br.status.charAt(0).toUpperCase() + br.status.slice(1),
          savingAmount: br.originalPrice - br.offeredPrice,
          bargainId: br._id.toString(),
        };
      });

    return NextResponse.json({
      stats: {
        totalOrders,
        activeBargains,
        pointsBalance: user.points,
        successRate,
      },
      recentOrders,
      activeBargains: formattedBargains,
      user: {
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions
function formatDate(date: Date): string {
  const now = new Date();
  const orderDate = new Date(date);
  const diffMs = now.getTime() - orderDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return orderDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
}

function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    pending: 'Processing',
    confirmed: 'Confirmed',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    returned: 'Returned',
    refunded: 'Refunded',
  };
  return statusMap[status] || status;
}