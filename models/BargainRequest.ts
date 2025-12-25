import mongoose, { Schema, Document } from 'mongoose';
import { z } from 'zod';

// Zod schema for validation
export const BargainRequestSchema = z.object({
  productId: z.string().min(1), // Reference to Product
  userId: z.string().min(1),    // Reference to User
  originalPrice: z.number().positive(),
  offeredPrice: z.number().positive(),
  status: z.enum(['pending', 'accepted', 'rejected', 'expired']).default('pending'),
  minPrice: z.number().positive(), // Minimum acceptable price from product
  message: z.string().max(500).optional(),
  couponCode: z.string().optional(), // Generated if accepted
  couponExpiresAt: z.date().optional(),
  bargainRound: z.number().int().min(1).max(5).default(1), // Which round of bargaining
  maxRounds: z.number().int().min(1).max(5).default(3), // From product settings
  expiresAt: z.date().optional(), // Bargain request expiry
  isActive: z.boolean().default(true),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type BargainRequest = z.infer<typeof BargainRequestSchema>;

export interface IBargainRequest extends Document, BargainRequest {}

const BargainRequestSchemaMongoose = new Schema<IBargainRequest>({
  productId: { type: String, required: true, ref: 'Product', index: true },
  userId: { type: String, required: true, ref: 'User', index: true },
  originalPrice: { type: Number, required: true, min: 0 },
  offeredPrice: { type: Number, required: true, min: 0 },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected', 'expired'],
    default: 'pending',
    index: true 
  },
  minPrice: { type: Number, required: true, min: 0 },
  message: { type: String, maxlength: 500 },
  couponCode: { type: String, unique: true, sparse: true },
  couponExpiresAt: { type: Date },
  bargainRound: { type: Number, default: 1, min: 1, max: 5 },
  maxRounds: { type: Number, default: 3, min: 1, max: 5 },
  expiresAt: { type: Date },
  isActive: { type: Boolean, default: true, index: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Indexes for efficient queries
BargainRequestSchemaMongoose.index({ productId: 1, userId: 1, isActive: 1 });
BargainRequestSchemaMongoose.index({ status: 1, isActive: 1 });
BargainRequestSchemaMongoose.index({ couponCode: 1 });
BargainRequestSchemaMongoose.index({ userId: 1, status: 1 });
BargainRequestSchemaMongoose.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Update timestamp on save
BargainRequestSchemaMongoose.pre('save', function() {
  this.updatedAt = new Date();
//   next();
});

// Virtual for discount percentage
BargainRequestSchemaMongoose.virtual('discountPercentage').get(function() {
  return Math.round(((this.originalPrice - this.offeredPrice) / this.originalPrice) * 100);
});

// Virtual for saving amount
BargainRequestSchemaMongoose.virtual('savingAmount').get(function() {
  return this.originalPrice - this.offeredPrice;
});

// Virtual for isExpired
BargainRequestSchemaMongoose.virtual('isExpired').get(function() {
  if (this.couponExpiresAt) {
    return new Date() > this.couponExpiresAt;
  }
  return false;
});

// Enable virtuals
BargainRequestSchemaMongoose.set('toJSON', { virtuals: true });
BargainRequestSchemaMongoose.set('toObject', { virtuals: true });

export const BargainRequestModel = mongoose.models.BargainRequest || 
  mongoose.model<IBargainRequest>('BargainRequest', BargainRequestSchemaMongoose);