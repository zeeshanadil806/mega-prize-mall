// lib/models/EmailSubscriber.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEmailSubscriber extends Document {
  email: string;
  referralCode: string;
  points: number;
  subscribedAt: Date;
  ipAddress?: string;
  userAgent?: string;
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