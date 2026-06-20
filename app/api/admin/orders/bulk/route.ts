import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { IOrder, OrderModel } from '@/models/Order';
import { requireAdmin } from '@/shared/http';
import { log } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
        const admin = await requireAdmin();
    if (!admin.ok) return admin.response;

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
    log.error('Error processing bulk action', { error: error as Error });
        const errorMessage = error instanceof Error ? error.message : 'Failed to cancel order';
    return NextResponse.json(
      { error: errorMessage || 'Failed to process bulk action' },
      { status: 400 }
    );
  }
}