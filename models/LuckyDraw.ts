import mongoose, { Schema, Document } from 'mongoose';
import { z } from 'zod';

// Zod schema for validation
export const LuckyDrawSchema = z.object({
  // Draw Information
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  drawType: z.enum(['instant', 'scheduled', 'manual']).default('manual'),
  
  // Prize Details
  prizeName: z.string().min(3).max(100),
  prizeDescription: z.string().min(10).max(500),
  prizeImage: z.string().optional(),
  prizeValue: z.number().min(0).optional(),
  prizeCategory: z.enum(['vehicle', 'electronics', 'cash', 'voucher', 'other']).default('other'),
  
  // Draw Configuration
  entryCriteria: z.object({
    minOrderAmount: z.number().min(0).default(3000),
    qualifyingStatus: z.string().default('delivered'),
    maxEntriesPerUser: z.number().min(1).optional(),
  }).default({
    // FIX: Explicitly provide the default values here to satisfy TypeScript
    minOrderAmount: 3000,
    qualifyingStatus: 'delivered'
  }),
  
  // Dates
  announcementDate: z.date().optional(), // When prize was announced
  drawDate: z.date().optional(), // When draw will happen (if scheduled)
  resultDate: z.date().optional(), // When winner was selected
  
  // Entries
  totalEntries: z.number().int().min(0).default(0),
  eligibleUserCount: z.number().int().min(0).default(0),
  
  // Winner
  winnerUserId: z.string().optional(),
  winnerOrderId: z.string().optional(),
  winnerEntryId: z.string().optional(),
  winnerName: z.string().optional(),
  winnerEmail: z.string().optional(),
  winnerPhone: z.string().optional(),
  
  // Status
  status: z.enum([
    'draft',      // Created but not announced
    'announced',  // Prize announced, accepting entries
    'in_progress',// Draw in progress
    'completed',  // Winner selected
    'cancelled',  // Draw cancelled
  ]).default('draft'),
  
  // Metadata
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  notes: z.string().max(1000).optional(),
  
  // Admin
  createdBy: z.string(), // Admin user ID
  updatedBy: z.string().optional(),
  
  // Timestamps
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type LuckyDraw = z.infer<typeof LuckyDrawSchema>;

export interface ILuckyDraw extends Document, LuckyDraw {}

// Mongoose Schema
const LuckyDrawSchemaMongoose = new Schema<ILuckyDraw>({
  // Draw Information
  title: { type: String, required: true, index: true },
  description: { type: String, required: true },
  drawType: { 
    type: String, 
    enum: ['instant', 'scheduled', 'manual'], 
    default: 'manual',
    index: true 
  },
  
  // Prize Details
  prizeName: { type: String, required: true },
  prizeDescription: { type: String, required: true },
  prizeImage: { type: String },
  prizeValue: { type: Number, min: 0 },
  prizeCategory: { 
    type: String, 
    enum: ['vehicle', 'electronics', 'cash', 'voucher', 'other'],
    default: 'other',
    index: true 
  },
  
  // Draw Configuration
  entryCriteria: {
    minOrderAmount: { type: Number, default: 3000 },
    qualifyingStatus: { type: String, default: 'delivered' },
    maxEntriesPerUser: { type: Number, min: 1 },
  },
  
  // Dates
  announcementDate: { type: Date, index: true },
  drawDate: { type: Date, index: true },
  resultDate: { type: Date },
  
  // Entries
  totalEntries: { type: Number, default: 0, min: 0 },
  eligibleUserCount: { type: Number, default: 0, min: 0 },
  
  // Winner
  winnerUserId: { type: String, ref: 'User' },
  winnerOrderId: { type: String, ref: 'Order' },
  winnerEntryId: { type: String, ref: 'LuckyDrawEntry' },
  winnerName: { type: String },
  winnerEmail: { type: String },
  winnerPhone: { type: String },
  
  // Status
  status: { 
    type: String, 
    enum: ['draft', 'announced', 'in_progress', 'completed', 'cancelled'],
    default: 'draft',
    index: true 
  },
  
  // Metadata
  isActive: { type: Boolean, default: true, index: true },
  isFeatured: { type: Boolean, default: false, index: true },
  notes: { type: String, maxlength: 1000 },
  
  // Admin
  createdBy: { type: String, required: true, ref: 'User' },
  updatedBy: { type: String, ref: 'User' },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Indexes
LuckyDrawSchemaMongoose.index({ status: 1, isActive: 1 });
LuckyDrawSchemaMongoose.index({ drawDate: 1, status: 1 });
LuckyDrawSchemaMongoose.index({ prizeCategory: 1, status: 1 });
LuckyDrawSchemaMongoose.index({ 'entryCriteria.minOrderAmount': 1 });

// Update timestamp
LuckyDrawSchemaMongoose.pre('save', function() {
  this.updatedAt = new Date();
});

// Virtuals
LuckyDrawSchemaMongoose.virtual('isOpen').get(function() {
  return this.status === 'announced' && this.isActive;
});

LuckyDrawSchemaMongoose.virtual('hasWinner').get(function() {
  return this.status === 'completed' && !!this.winnerUserId;
});

LuckyDrawSchemaMongoose.virtual('daysRemaining').get(function() {
  if (!this.drawDate || this.status !== 'announced') return null;
  const now = new Date();
  const diff = this.drawDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Enable virtuals
LuckyDrawSchemaMongoose.set('toJSON', { virtuals: true });
LuckyDrawSchemaMongoose.set('toObject', { virtuals: true });

export const LuckyDrawModel = mongoose.models.LuckyDraw || 
  mongoose.model<ILuckyDraw>('LuckyDraw', LuckyDrawSchemaMongoose);