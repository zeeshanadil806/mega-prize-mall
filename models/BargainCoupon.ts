import mongoose, { Schema, Document } from 'mongoose';
import { z } from 'zod';

// Zod schema for validation
export const BargainCouponSchema = z.object({
  code: z.string().min(8).max(20), // e.g., BARGAIN-ABC123
  productId: z.string().min(1),    // Specific product
  userId: z.string().min(1),       // Specific user
  bargainRequestId: z.string().min(1), // Original bargain request
  originalPrice: z.number().positive(),
  discountedPrice: z.number().positive(), // Bargained price
  discountAmount: z.number().positive(),
  discountPercentage: z.number().min(0).max(100),
  validFrom: z.date().default(() => new Date()),
  validUntil: z.date(), // 24 hours from creation
  isUsed: z.boolean().default(false),
  usedAt: z.date().optional(),
  orderId: z.string().optional(), // If used in an order
  isActive: z.boolean().default(true),
  reminderSent: z.boolean().default(false),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type BargainCoupon = z.infer<typeof BargainCouponSchema>;

export interface IBargainCoupon extends Document, BargainCoupon {}

const BargainCouponSchemaMongoose = new Schema<IBargainCoupon>({
  code: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true,
    index: true 
  },
  productId: { type: String, required: true, ref: 'Product', index: true },
  userId: { type: String, required: true, ref: 'User', index: true },
  bargainRequestId: { type: String, required: true, ref: 'BargainRequest' },
  originalPrice: { type: Number, required: true, min: 0 },
  discountedPrice: { type: Number, required: true, min: 0 },
  discountAmount: { type: Number, required: true, min: 0 },
  discountPercentage: { type: Number, required: true, min: 0, max: 100 },
  validFrom: { type: Date, default: Date.now },
  validUntil: { type: Date, required: true, index: true },
  isUsed: { type: Boolean, default: false, index: true },
  usedAt: { type: Date },
  orderId: { type: String, ref: 'Order' },
  isActive: { type: Boolean, default: true, index: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  reminderSent: { type: Boolean, default: false, index: true },
});

// Indexes
BargainCouponSchemaMongoose.index({ userId: 1, isUsed: 1, isActive: 1 });
BargainCouponSchemaMongoose.index({ productId: 1, isActive: 1 });
BargainCouponSchemaMongoose.index({ validUntil: 1, isUsed: 1, isActive: 1 });

// Update timestamp
BargainCouponSchemaMongoose.pre('save', function() {
  this.updatedAt = new Date();
//   next();
});

// Virtual for isValid
BargainCouponSchemaMongoose.virtual('isValid').get(function() {
  const now = new Date();
  return this.isActive && !this.isUsed && now >= this.validFrom && now <= this.validUntil;
});

// Virtual for remaining time in hours
BargainCouponSchemaMongoose.virtual('remainingHours').get(function() {
  const now = new Date();
  const diffMs = this.validUntil.getTime() - now.getTime();
  return Math.max(0, Math.round(diffMs / (1000 * 60 * 60)));
});

// Virtual for remaining time formatted
BargainCouponSchemaMongoose.virtual('remainingTimeFormatted').get(function() {
  const now = new Date();
  const diffMs = this.validUntil.getTime() - now.getTime();
  
  if (diffMs <= 0) return 'Expired';
  
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h ${minutes}m`;
});

// Enable virtuals
BargainCouponSchemaMongoose.set('toJSON', { virtuals: true });
BargainCouponSchemaMongoose.set('toObject', { virtuals: true });

export const BargainCouponModel = mongoose.models.BargainCoupon || 
  mongoose.model<IBargainCoupon>('BargainCoupon', BargainCouponSchemaMongoose);