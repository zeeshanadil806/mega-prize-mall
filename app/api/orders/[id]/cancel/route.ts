import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { OrderModel } from '@/models/Order';
import { WalletTransactionModel } from '@/models/WalletTransaction';
import { requireSession } from '@/shared/http';
import mongoose from 'mongoose';
import { log } from '@/lib/logger';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession();
    if (!session.ok) return session.response;

    const { id } = await params;
    await connectToDatabase();

    const sessionDb = await mongoose.startSession();
    
    try {
      sessionDb.startTransaction();

      // Find the order
      const order = await OrderModel.findOne({
        _id: id,
        userId: session.user.id,
        status: { $in: ['pending', 'confirmed'] },
      }).session(sessionDb);

      if (!order) {
        throw new Error('Order not found or cannot be cancelled');
      }

      // Update order status
      order.status = 'cancelled';
      order.cancelledAt = new Date();
      await order.save({ session: sessionDb });

      // Refund points if any were redeemed
      if (order.pointsRedeemed > 0) {
        const refundTransaction = new WalletTransactionModel({
          userId: session.user.id,
          type: 'refund',
          points: order.pointsRedeemed,
          balanceAfter: (await OrderModel.findOne({ userId: session.user.id }).sort({ createdAt: -1 }))?.points || 0 + order.pointsRedeemed,
          orderId: order._id,
          description: `Points refund for cancelled order ${order._id}`,
          status: 'completed',
        });
        await refundTransaction.save({ session: sessionDb });

        // Update user's points
        const UserModel = (await import('@/models/User')).UserModel;
        await UserModel.findByIdAndUpdate(
          session.user.id,
          { $inc: { points: order.pointsRedeemed } },
          { session: sessionDb }
        );
      }

      // Refund bargain coupons (mark as expired)
      if (order.bargainCouponIds.length > 0) {
        const BargainCouponModel = (await import('@/models/BargainCoupon')).BargainCouponModel;
        await BargainCouponModel.updateMany(
          { _id: { $in: order.bargainCouponIds } },
          { status: 'expired' },
          { session: sessionDb }
        );
      }

      await sessionDb.commitTransaction();

      return NextResponse.json({
        success: true,
        message: 'Order cancelled successfully',
        order,
      });

    } catch (error) {
      await sessionDb.abortTransaction();
      throw error;
    } finally {
      sessionDb.endSession();
    }

  } catch (error) {
    log.error('Error cancelling order', { error: error as Error });
    const errorMessage = error instanceof Error ? error.message : 'Failed to cancel order';
    return NextResponse.json(
      { error: errorMessage || 'Failed to cancel order' },
      { status: 400 }
    );
  }
}
