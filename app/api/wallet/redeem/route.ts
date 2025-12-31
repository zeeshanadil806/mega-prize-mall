import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { WalletTransactionModel } from '@/models/WalletTransaction';
import { UserModel } from '@/models/User';
import { auth } from '@/auth';
import mongoose from 'mongoose';
import { z } from 'zod';

// Validation schema
const redeemSchema = z.object({
  points: z.number().int().min(100).max(100000), // Min 100, Max 100k points
  userId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate input
    const body = await request.json();
    const validation = redeemSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { points, userId } = validation.data;

    // Verify user owns this wallet
    if (session.user.id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const sessionDb = await mongoose.startSession();

    try {
      sessionDb.startTransaction();

      // Get user with current points
      const user = await UserModel.findById(userId).session(sessionDb);
      if (!user) {
        throw new Error('User not found');
      }

      // Check if user has enough points
      if (user.points < points) {
        throw new Error(`Insufficient points. Available: ${user.points}`);
      }

      // Calculate new balance
      const newBalance = user.points - points;
      const discountValue = points * 0.1; // 1 point = Rs 0.10

      // Create redeem transaction
      const transaction = new WalletTransactionModel({
        userId,
        type: 'redeem',
        points: -points, // Negative for redemption
        balanceAfter: newBalance,
        rate: 0.1,
        description: `Redeemed ${points.toLocaleString()} points for Rs ${discountValue.toFixed(2)} discount`,
        status: 'completed',
        metadata: {
          discountValue,
          redeemedAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Valid for 30 days
        },
      });

      // Update user points
      user.points = newBalance;
      
      // Save both in transaction
      await transaction.save({ session: sessionDb });
      await user.save({ session: sessionDb });

      await sessionDb.commitTransaction();

      return NextResponse.json({
        success: true,
        message: `Successfully redeemed ${points.toLocaleString()} points`,
        data: {
          transactionId: transaction._id,
          pointsRedeemed: points,
          discountValue,
          newBalance,
          expiresAt: transaction.metadata.expiresAt,
        },
      });

    } catch (error) {
      await sessionDb.abortTransaction();
      throw error;
    } finally {
      sessionDb.endSession();
    }

  } catch (error) {
    console.error('Error redeeming points:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to generate invoice';

    return NextResponse.json(
      { 
        error: errorMessage || 'Failed to redeem points',
        code: errorMessage.includes('Insufficient') ? 'INSUFFICIENT_POINTS' : 'REDEEM_FAILED'
      },
      { status: 400 }
    );
  }
}