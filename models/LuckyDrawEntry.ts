import mongoose, { Schema, Document } from 'mongoose';
import { z } from 'zod';

// Zod schema for validation
export const LuckyDrawEntrySchema = z.object({
  // References
  drawId: z.string(), // Reference to LuckyDraw
  userId: z.string(), // Reference to User
  orderId: z.string(), // Reference to Order that qualified
  
  // Entry Details
  entryNumber: z.number().int().min(1), // Unique entry number for this draw
  orderAmount: z.number().min(0), // Order grandTotal
  orderDate: z.date(), // Order created date
  
  // Customer Details (snapshot at time of entry)
  customerName: z.string(),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),
  
  // Status
  status: z.enum(['active', 'winner', 'invalid', 'withdrawn']).default('active'),
  
  // Winner Information (if this entry wins)
  winnerDeclaredAt: z.date().optional(),
  prizeClaimed: z.boolean().default(false),
  prizeClaimedAt: z.date().optional(),
  prizeDeliveryStatus: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).optional(),
  
  // Metadata
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  notes: z.string().max(500).optional(),
  
  // Timestamps
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type LuckyDrawEntry = z.infer<typeof LuckyDrawEntrySchema>;

export interface ILuckyDrawEntry extends Document, LuckyDrawEntry {}

// Mongoose Schema
const LuckyDrawEntrySchemaMongoose = new Schema<ILuckyDrawEntry>({
  // References
  drawId: { type: String, required: true, ref: 'LuckyDraw', index: true },
  userId: { type: String, required: true, ref: 'User', index: true },
  orderId: { type: String, required: true, ref: 'Order'},
  
  // Entry Details
  entryNumber: { type: Number, required: true, min: 1 },
  orderAmount: { type: Number, required: true, min: 0 },
  orderDate: { type: Date, required: true },
  
  // Customer Details
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String },
  
  // Status
  status: { 
    type: String, 
    enum: ['active', 'winner', 'invalid', 'withdrawn'],
    default: 'active',
    index: true 
  },
  
  // Winner Information
  winnerDeclaredAt: { type: Date },
  prizeClaimed: { type: Boolean, default: false },
  prizeClaimedAt: { type: Date },
  prizeDeliveryStatus: { 
    type: String, 
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
  },
  
  // Metadata
  ipAddress: { type: String },
  userAgent: { type: String },
  notes: { type: String, maxlength: 500 },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Compound Indexes
LuckyDrawEntrySchemaMongoose.index({ drawId: 1, userId: 1 });
LuckyDrawEntrySchemaMongoose.index({ drawId: 1, orderId: 1 });
LuckyDrawEntrySchemaMongoose.index({ drawId: 1, status: 1 });
LuckyDrawEntrySchemaMongoose.index({ userId: 1, status: 1 });
LuckyDrawEntrySchemaMongoose.index({ drawId: 1, entryNumber: 1 }, { unique: true });
LuckyDrawEntrySchemaMongoose.index({ orderId: 1 }, { unique: true }); // One entry per order

// Update timestamp
LuckyDrawEntrySchemaMongoose.pre('save', function() {
  this.updatedAt = new Date();
});

// Virtuals
LuckyDrawEntrySchemaMongoose.virtual('isWinner').get(function() {
  return this.status === 'winner';
});

LuckyDrawEntrySchemaMongoose.virtual('isActiveEntry').get(function() {
  return this.status === 'active';
});

LuckyDrawEntrySchemaMongoose.virtual('canWin').get(function() {
  return this.status === 'active' && !this.winnerDeclaredAt;
});

// Enable virtuals
LuckyDrawEntrySchemaMongoose.set('toJSON', { virtuals: true });
LuckyDrawEntrySchemaMongoose.set('toObject', { virtuals: true });

export const LuckyDrawEntryModel = mongoose.models.LuckyDrawEntry || 
  mongoose.model<ILuckyDrawEntry>('LuckyDrawEntry', LuckyDrawEntrySchemaMongoose);