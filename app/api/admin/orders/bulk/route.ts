import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { IOrder, OrderModel } from '@/models/Order';
import { auth } from '@/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const UserModel = (await import('@/models/User')).UserModel;
    await connectToDatabase();
    const user = await UserModel.findById(session.user.id);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const { orderIds, action } = await request.json();

    if (!Array.isArray(orderIds) || orderIds.length === 0 || !action) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    let updateData: Partial<IOrder> = {};
    let message = '';

    switch (action) {
      case 'mark_processing':
        updateData = { status: 'processing' };
        message = 'Orders marked as processing';
        break;
      case 'mark_shipped':
        updateData = { 
          status: 'shipped',
          estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
        };
        message = 'Orders marked as shipped';
        break;
      case 'mark_delivered':
        updateData = { 
          status: 'delivered',
          deliveredAt: new Date()
        };
        message = 'Orders marked as delivered';
        break;
      case 'mark_cancelled':
        updateData = { 
          status: 'cancelled',
          cancelledAt: new Date()
        };
        message = 'Orders marked as cancelled';
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    const result = await OrderModel.updateMany(
      { _id: { $in: orderIds } },
      { $set: updateData }
    );

    return NextResponse.json({
      success: true,
      message,
      updatedCount: result.modifiedCount,
      action,
    });

  } catch (error) {
    console.error('Error processing bulk action:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to cancel order';
    return NextResponse.json(
      { error: errorMessage || 'Failed to process bulk action' },
      { status: 400 }
    );
  }
}