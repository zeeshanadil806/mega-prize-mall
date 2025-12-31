  import mongoose, { Schema, Document } from 'mongoose';
import { z } from 'zod';
import { ImageSchema } from './Image';

// Updated Zod schema with all requirements
export const ProductSchema = z.object({
  // Basic Information
  name: z.string().min(3).max(100),
  slug: z.string().min(3).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), // SEO-friendly URL
  description: z.string().min(10).max(5000),
  shortDescription: z.string().max(300).optional(),
  
  // Pricing
  price: z.number().positive(),
  discountedPrice: z.number().positive().optional(),
  costPrice: z.number().positive().optional(), // For profit calculation
  
  // Images (Updated)
  images: z.array(ImageSchema).min(1).max(20),
  
  // Categorization
  category: z.string().min(1),
  tags: z.array(z.string()).default([]),
  brand: z.string().min(1),
  
  // Inventory & Variants
  sku: z.string().min(1),
  stock: z.number().int().min(0).default(0),
  compatibility: z.array(z.string()).default([]), // iPhone 15, Samsung S24, etc.
  
  // Specifications
  features: z.array(z.string()).default([]),
  specifications: z.record(z.string(), z.string()).default({}), // Key-value pairs
  color: z.string().optional(),
  
  // Gamification Features (CORE)
  bargainEnabled: z.boolean().default(false),
  minBargainPrice: z.number().positive().optional(), // Minimum acceptable price
  maxBargainRounds: z.number().int().min(1).max(5).default(3),
  bargainValidityHours: z.number().int().min(1).max(168).default(24),
  
  // SEO & Marketing
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
  keywords: z.array(z.string()).default([]),
  
  // Status & Management
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isNewArrival: z.boolean().default(true),
  
  // Analytics
  viewCount: z.number().int().min(0).default(0),
  purchaseCount: z.number().int().min(0).default(0),
  bargainCount: z.number().int().min(0).default(0),
  
  // Timestamps
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type Product = z.infer<typeof ProductSchema>;

// Mongoose Document Interface
export interface IProduct extends Document, Product {}

// Mongoose Schema
const ProductSchemaMongoose = new Schema<IProduct>({
  // Basic Information
  name: { type: String, required: true, index: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: { type: String, required: true },
  shortDescription: { type: String },
  
  // Pricing
  price: { type: Number, required: true, min: 0 },
  discountedPrice: { type: Number, min: 0 },
  costPrice: { type: Number, min: 0 },
  
  // Images
  images: [{
    id: String,
    url: String,
    alt: String,
    order: Number,
    metadata: {
      width: Number,
      height: Number,
      size: Number,
      format: String,
    },
  }],
  
  // Categorization
  category: { type: String, required: true, index: true },
  tags: [{ type: String, index: true }],
  brand: { type: String, required: true, index: true },
  
  // Inventory & Variants
  sku: { type: String, required: true, unique: true, index: true },
  stock: { type: Number, default: 0, min: 0 },
  
  // Specifications
  features: [{ type: String }],
  specifications: { type: Map, of: String },
  color: { type: String },
  
  // Gamification Features
  bargainEnabled: { type: Boolean, default: false, index: true },
  minBargainPrice: { type: Number, min: 0 },
  maxBargainRounds: { type: Number, default: 3 },
  bargainValidityHours: { type: Number, default: 24 },
  
  // SEO & Marketing
  metaTitle: { type: String },
  metaDescription: { type: String },
  keywords: [{ type: String }],
  
  // Status & Management
  isActive: { type: Boolean, default: true, index: true },
  isFeatured: { type: Boolean, default: false, index: true },
  isBestSeller: { type: Boolean, default: false, index: true },
  isNewArrival: { type: Boolean, default: true, index: true },
  
  // Analytics
  viewCount: { type: Number, default: 0 },
  purchaseCount: { type: Number, default: 0 },
  bargainCount: { type: Number, default: 0 },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Indexes for faster queries
ProductSchemaMongoose.index({ category: 1, brand: 1, isActive: 1 });
ProductSchemaMongoose.index({ price: 1, isActive: 1 });
ProductSchemaMongoose.index({ bargainEnabled: 1, isActive: 1 });
ProductSchemaMongoose.index({ isFeatured: 1, isActive: 1 });
ProductSchemaMongoose.index({ isBestSeller: 1, isActive: 1 });
ProductSchemaMongoose.index({ isNewArrival: 1, isActive: 1 });
ProductSchemaMongoose.index({ tags: 1, isActive: 1 });
ProductSchemaMongoose.index({ 'specifications': 1 });

// Update timestamps on save
ProductSchemaMongoose.pre('save', function() {
  this.updatedAt = new Date();
  if (!this.createdAt) {
    this.createdAt = new Date();
  }
  // next();
});

// Virtual for discount percentage
ProductSchemaMongoose.virtual('discountPercentage').get(function() {
  if (this.discountedPrice && this.price) {
    return Math.round(((this.price - this.discountedPrice) / this.price) * 100);
  }
  return 0;
});

// Virtual for final price (discounted or regular)
ProductSchemaMongoose.virtual('finalPrice').get(function() {
  return this.discountedPrice || this.price;
});

// Enable virtuals in JSON output
ProductSchemaMongoose.set('toJSON', { virtuals: true });
ProductSchemaMongoose.set('toObject', { virtuals: true });

export const ProductModel = mongoose.models.Product || 
  mongoose.model<IProduct>('Product', ProductSchemaMongoose);