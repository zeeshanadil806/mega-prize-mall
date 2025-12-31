import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { IWalletTransaction, WalletTransactionModel } from '@/models/WalletTransaction';
import { UserModel } from '@/models/User';
import mongoose from 'mongoose';
import { AnyBulkWriteOperation } from 'mongoose';

// This would be called by a cron job (e.g., Vercel Cron, GitHub Actions, etc.)
export async function POST(request: NextRequest) {
  try {
    // Simple authentication for cron job
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const sessionDb = await mongoose.startSession();

    try {
      sessionDb.startTransaction();

      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      
      // Find points that expired today
      const expiredPoints = await WalletTransactionModel.find({
        type: 'earn',
        expiresAt: { 
          $gte: startOfDay,
          $lt: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
        },
        status: 'completed',
      }).session(sessionDb);

      if (expiredPoints.length === 0) {
        await sessionDb.commitTransaction();
        return NextResponse.json({
          success: true,
          message: 'No points to expire today',
          expiredCount: 0,
        });
      }

      // Group by user for batch updates
      const userPointsMap: Record<string, number> = {};
      const transactionUpdates: AnyBulkWriteOperation<IWalletTransaction>[] = [];

      expiredPoints.forEach(tx => {
        if (!userPointsMap[tx.userId]) {
          userPointsMap[tx.userId] = 0;
        }
        userPointsMap[tx.userId] += tx.points;
        
        transactionUpdates.push({
          updateOne: {
            filter: { _id: tx._id },
            update: { 
              $set: { 
                status: 'expired',
                description: `${tx.description} (Expired)`,
                metadata: { ...tx.metadata, expiredAt: new Date() }
              }
            },
          },
        });
      });

      // Update transactions to expired status
      if (transactionUpdates.length > 0) {
        await WalletTransactionModel.bulkWrite(transactionUpdates, { session: sessionDb });
      }

      // Update user points (deduct expired points)
      const userUpdates = Object.entries(userPointsMap).map(([userId, points]) => ({
        updateOne: {
          filter: { _id: userId },
          update: { $inc: { points: -points } },
        },
      }));

      if (userUpdates.length > 0) {
        await UserModel.bulkWrite(userUpdates, { session: sessionDb });
      }

      // Create expiry transaction records
      const expiryTransactions = Object.entries(userPointsMap).map(([userId, points]) => ({
        userId,
        type: 'expiry',
        points: -points,
        balanceAfter: 0, // Will be updated with actual balance
        rate: 0.1,
        description: `${points.toLocaleString()} points expired`,
        status: 'completed',
        metadata: {
          expiredAt: new Date(),
          originalPoints: points,
        },
      }));

      if (expiryTransactions.length > 0) {
        await WalletTransactionModel.insertMany(expiryTransactions, { session: sessionDb });
      }

      await sessionDb.commitTransaction();

      return NextResponse.json({
        success: true,
        message: `Successfully expired ${expiredPoints.length} point transactions`,
        data: {
          expiredTransactions: expiredPoints.length,
          affectedUsers: Object.keys(userPointsMap).length,
          totalPointsExpired: Object.values(userPointsMap).reduce((a, b) => a + b, 0),
        },
      });

    } catch (error) {
      await sessionDb.abortTransaction();
      throw error;
    } finally {
      sessionDb.endSession();
    }

  } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to generate invoice';
    console.error('Error expiring points:', error);
    return NextResponse.json(
      { error: errorMessage || 'Failed to expire points' },
      { status: 400 }
    );
  }
}