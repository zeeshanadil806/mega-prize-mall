// models/CouponUsage.ts
import mongoose, { Schema, Document, Types } from 'mongoose';
import { z } from 'zod';

export const CouponUsageSchema = z.object({
  couponCode: z.string().min(3).max(20),
  couponType: z.enum(['global', 'bargain']),
  userId: z.string().min(1),
  orderId: z.string().min(1),
  
  discountApplied: z.number().min(0),
  orderAmount: z.number().positive(),
  orderAmountAfterDiscount: z.number().positive(),
  
  usedAt: z.date().default(() => new Date()),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  
  isReverted: z.boolean().default(false),
  revertedAt: z.date().optional(),
  revertReason: z.string().optional(),
});

export type CouponUsage = z.infer<typeof CouponUsageSchema>;
export interface ICouponUsage extends Document, CouponUsage {
  _id: Types.ObjectId;
}

const CouponUsageSchemaMongoose = new Schema<ICouponUsage>({
  couponCode: { type: String, required: true },
  couponType: { type: String, enum: ['global', 'bargain'], required: true },
  userId: { type: String, required: true, ref: 'User', index: true },
  orderId: { type: String, required: true, ref: 'Order' },
  
  discountApplied: { type: Number, required: true, min: 0 },
  orderAmount: { type: Number, required: true, min: 0 },
  orderAmountAfterDiscount: { type: Number, required: true, min: 0 },
  
  usedAt: { type: Date, default: Date.now, index: true },
  ipAddress: { type: String },
  userAgent: { type: String },
  
  isReverted: { type: Boolean, default: false, index: true },
  revertedAt: { type: Date },
  revertReason: { type: String },
});

// Indexes
CouponUsageSchemaMongoose.index({ couponCode: 1, userId: 1 });
CouponUsageSchemaMongoose.index({ userId: 1, usedAt: -1 });
CouponUsageSchemaMongoose.index({ orderId: 1 }, { unique: true });
CouponUsageSchemaMongoose.index({ couponCode: 1, isReverted: 1 });

export const CouponUsageModel = mongoose.models.CouponUsage || 
  mongoose.model<ICouponUsage>('CouponUsage', CouponUsageSchemaMongoose);