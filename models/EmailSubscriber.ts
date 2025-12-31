// lib/models/EmailSubscriber.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEmailSubscriber extends Document {
  email: string;
  referralCode: string;
  points: number;
  referralUses: number; // NEW: Track how many times code used
  totalPointsGiven: number; // NEW: Total points given via referrals
  referredUsers: string[];
  subscribedAt: Date;
  ipAddress?: string;
  userAgent?: string;
    isActive: boolean; // NEW: Active/inactive status
}

const EmailSubscriberSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  referralCode: {
    type: String,
    default: () => Math.random().toString(36).substring(2, 8).toUpperCase(),
  },
  referralUses: {
    type: Number,
    default: 0,
    min: 0,
    max: 5, // Maximum 5 uses per code
  },
  totalPointsGiven: {
    type: Number,
    default: 0,
    min: 0,
  },
  referredUsers: [{
    type: String, // User IDs who used this referral code
    ref: 'User',
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  points: {
    type: Number,
    default: 500,
  },
  subscribedAt: {
    type: Date,
    default: Date.now,
  },
  ipAddress: String,
  userAgent: String,
});

const EmailSubscriber: Model<IEmailSubscriber> = 
  mongoose.models.EmailSubscriber || 
  mongoose.model<IEmailSubscriber>('EmailSubscriber', EmailSubscriberSchema);

export default EmailSubscriber;