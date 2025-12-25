import mongoose, { Schema, Document } from 'mongoose';
import { z } from 'zod';

// Zod schema for validation
export const WalletTransactionSchema = z.object({
  userId: z.string().min(1),
  type: z.enum(['earn', 'redeem', 'adjustment', 'expiry', 'refund']),
  points: z.number().int(), // Positive for earn, negative for redeem
  balanceAfter: z.number().int().min(0), // Points balance after this transaction
  rate: z.number().default(0.1), // Rs 1 = 10 points (0.1 Rs per point)
  orderId: z.string().optional(), // For order-related transactions
  productId: z.string().optional(), // For product-specific points
  description: z.string().max(500),
  status: z.enum(['pending', 'completed', 'cancelled']).default('completed'),
  metadata: z.record(z.string(), z.any()).default({}),
  expiresAt: z.date().optional(), // Points expiry (if applicable)
  processedAt: z.date().optional(), // When points were actually processed
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type WalletTransaction = z.infer<typeof WalletTransactionSchema>;

export interface IWalletTransaction extends Document, WalletTransaction {}

const WalletTransactionSchemaMongoose = new Schema<IWalletTransaction>({
  userId: { type: String, required: true, ref: 'User', index: true },
  type: { 
    type: String, 
    enum: ['earn', 'redeem', 'adjustment', 'expiry', 'refund'],
    required: true,
    index: true 
  },
  points: { type: Number, required: true }, // Can be positive or negative
  balanceAfter: { type: Number, required: true, min: 0 },
  rate: { type: Number, default: 0.1 }, // Rs 1 = 10 points
  orderId: { type: String, ref: 'Order', index: true },
  productId: { type: String, ref: 'Product' },
  description: { type: String, maxlength: 500 },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'cancelled'],
    default: 'completed',
    index: true 
  },
  metadata: { type: Schema.Types.Mixed, default: {} },
  expiresAt: { type: Date, index: true },
  processedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Indexes
WalletTransactionSchemaMongoose.index({ userId: 1, type: 1, createdAt: -1 });
WalletTransactionSchemaMongoose.index({ userId: 1, status: 1 });
WalletTransactionSchemaMongoose.index({ orderId: 1, type: 1 });

// Update timestamp
WalletTransactionSchemaMongoose.pre('save', function() {
  this.updatedAt = new Date();
//   next();
});

// Virtual for monetary value
WalletTransactionSchemaMongoose.virtual('monetaryValue').get(function() {
  return Math.abs(this.points) * this.rate;
});

// Virtual for isExpired
WalletTransactionSchemaMongoose.virtual('isExpired').get(function() {
  if (this.expiresAt) {
    return new Date() > this.expiresAt;
  }
  return false;
});

// Enable virtuals
WalletTransactionSchemaMongoose.set('toJSON', { virtuals: true });
WalletTransactionSchemaMongoose.set('toObject', { virtuals: true });

export const WalletTransactionModel = mongoose.models.WalletTransaction || 
  mongoose.model<IWalletTransaction>('WalletTransaction', WalletTransactionSchemaMongoose);