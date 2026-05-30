import { connectToDatabase } from './mongodb';
import EmailSubscriber, { IEmailSubscriber } from '@/models/EmailSubscriber';
import { UserModel } from '@/models/User';
import { WalletTransactionModel } from '@/models/WalletTransaction';
import mongoose from 'mongoose';
import { log } from './logger';

interface ReferralValidationResult {
  valid: boolean;
  error?: string;
  subscriber?: IEmailSubscriber;
}

interface ProcessReferralResult {
  success: boolean;
  message: string;
  newUserPoints?: number;
  referrerPoints?: number;
    subscriberPoints?: number; // New: Email subscriber points transferred
  error?: string;
}

// Validate referral code
export async function validateReferralCode(
  referralCode: string, 
  userEmail: string
): Promise<ReferralValidationResult> {
  try {
    await connectToDatabase();

    if (!referralCode || !referralCode.trim()) {
      return { valid: true }; // No referral code is valid (optional field)
    }

    // Clean the code
    const cleanCode = referralCode.trim().toUpperCase();

    // Find the referral code owner. `isActive: { $ne: false }` matches active
    // and legacy rows where the field is missing, but blocks explicit false —
    // the model sets isActive=false once a code hits its max-uses limit.
    const subscriber = await EmailSubscriber.findOne({
      referralCode: cleanCode,
      isActive: { $ne: false },
    });

    if (!subscriber) {
      return {
        valid: false,
        error: 'Invalid referral code',
      };
    }

    // Check if user is referring themselves
    if (subscriber.email.toLowerCase() === userEmail.toLowerCase()) {
      return {
        valid: false,
        error: 'Cannot use your own referral code',
      };
    }

    // Check if code has reached max uses
    if (subscriber.referralUses >= 5) {
      return {
        valid: false,
        error: 'This referral code has reached maximum usage limit',
      };
    }

    // Check if user already exists with this email
    const existingUser = await UserModel.findOne({
      email: userEmail.toLowerCase(),
    });

    if (existingUser) {
      return {
        valid: false,
        error: 'User with this email already exists',
      };
    }

    return {
      valid: true,
      subscriber,
    };

  } catch (error) {
    console.error('Error validating referral code:', error);
    return {
      valid: false,
      error: 'Failed to validate referral code',
    };
  }
}

// Process referral and award points
export async function processReferral(
  referralCode: string,
  newUserId: string,
  newUserEmail: string,
  newUserName: string
): Promise<ProcessReferralResult> {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    await connectToDatabase();

    const cleanCode = referralCode.trim().toUpperCase();

    // Get referral code owner (same isActive gate as validateReferralCode).
    const subscriber = await EmailSubscriber.findOne({
      referralCode: cleanCode,
      isActive: { $ne: false },
    }).session(session);

    if (!subscriber) {
      throw new Error('Referral code not found');
    }

    // Verify max uses not reached
    if (subscriber.referralUses >= 5) {
      throw new Error('Referral code has reached maximum usage');
    }

    // Get referrer user (owner of the email)
    const referrerUser = await UserModel.findOne({
      email: subscriber.email,
    }).session(session);

    if (!referrerUser) {
      throw new Error('Referrer user not found');
    }

    
    // 1. Update new user (receiver)
    const newUser = await UserModel.findById(newUserId).session(session);
    if (!newUser) {
      throw new Error('New user not found');
    }
    
    const REFERRAL_POINTS = 200;
    let subscriberPoints = 0;
    const userSubscriber = await EmailSubscriber.findOne({
      email: newUserEmail.toLowerCase(),
    }).session(session);

    if (userSubscriber && userSubscriber.points > 0) {
      subscriberPoints = userSubscriber.points;
      
      // Transfer points to user
      newUser.points += subscriberPoints;
      await newUser.save({ session });

      // Create transaction for subscriber points
      const subscriberTransaction = new WalletTransactionModel({
        userId: newUserId,
        type: 'earn',
        points: subscriberPoints,
        balanceAfter: newUser.points,
        rate: 0.1,
        description: `Email subscription bonus points transferred`,
        status: 'completed',
        metadata: {
          pointsType: 'email_subscription_transfer',
          originalSubscriberPoints: subscriberPoints,
        },
      });

      await subscriberTransaction.save({ session });

      // Clear subscriber points
      userSubscriber.points = 0;
      await userSubscriber.save({ session });

      log.info("Transferred EmailSubscriber points during referral", {
        userId: newUserId,
        points: subscriberPoints,
      });
    }
    newUser.points += REFERRAL_POINTS; 
    
    // Save the user with the new balance
    await newUser.save({ session });
    // Create transaction for new user
    const newUserTransaction = new WalletTransactionModel({
      userId: newUserId,
      type: 'earn',
      points: REFERRAL_POINTS,
      balanceAfter: newUser.points,
      rate: 0.1,
      description: `Referral signup bonus using code: ${cleanCode}`,
      status: 'completed',
      metadata: {
        referralCode: cleanCode,
        referredBy: subscriber.email,
        pointsType: 'referral_bonus',
      },
    });

    await newUserTransaction.save({ session });

    // 2. Update referrer (giver)
    referrerUser.points += REFERRAL_POINTS;
    referrerUser.referralPointsEarned += REFERRAL_POINTS;
    referrerUser.totalReferrals += 1;
    
    await referrerUser.save({ session });

    // Create transaction for referrer
    const referrerTransaction = new WalletTransactionModel({
      userId: referrerUser._id,
      type: 'earn',
      points: REFERRAL_POINTS,
      balanceAfter: referrerUser.points,
      rate: 0.1,
      description: `Referral bonus - ${newUserName} (${newUserEmail}) signed up using your code`,
      status: 'completed',
      metadata: {
        referralCode: cleanCode,
        referredUser: newUserEmail,
        pointsType: 'referral_reward',
      },
    });

    await referrerTransaction.save({ session });

    // 3. Update EmailSubscriber record
    subscriber.referralUses += 1;
    subscriber.totalPointsGiven += REFERRAL_POINTS;
    subscriber.referredUsers.push(newUserId);
    
    // Deactivate if max reached
    if (subscriber.referralUses >= 5) {
      subscriber.isActive = false;
    }
    
    await subscriber.save({ session });

    await session.commitTransaction();

    return {
      success: true,
      message: 'Referral processed successfully',
      newUserPoints: REFERRAL_POINTS,
      referrerPoints: REFERRAL_POINTS,
            subscriberPoints: subscriberPoints, // Include transferred subscriber points
    };

  } catch (error) {
    await session.abortTransaction();
    console.error('Error processing referral:', error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to cancel order";
    return {
      success: false,
      message: 'Failed to process referral',
      error: errorMessage || 'Unknown error',
    };
  } finally {
    session.endSession();
  }
}
