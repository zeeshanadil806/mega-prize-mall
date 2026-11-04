// models/GlobalCoupon.ts
import mongoose, { Schema, Document, Model } from 'mongoose';
import { z } from 'zod';

// ==========================================
// 1. Zod Schema (Validation & Shape)
// ==========================================
export const GlobalCouponSchema = z.object({
  // Basic Info
  code: z.string()
    .min(3)
    .max(20)
    .regex(/^[A-Z0-9]+$/, 'Only uppercase letters and numbers allowed')
    .transform(val => val.toUpperCase())
    .optional(),
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  
  // Discount Configuration
  discountType: z.enum(['percentage', 'fixed', 'free_shipping']),
  discountValue: z.number().positive('Discount value must be positive'),
  maxDiscountAmount: z.number().positive().optional(),
  
  // Validity
  validFrom: z.coerce.date().default(() => new Date()),
  validUntil: z.coerce.date(),
  isActive: z.boolean().default(true),
  
  // Usage Limits
  maxUses: z.number().int().positive().optional(),
  maxUsesPerUser: z.number().int().positive().default(1),
  minOrderAmount: z.number().min(0).default(0),
  
  // Applicability
  applicableTo: z.enum(['all_products', 'specific_categories', 'specific_products']).default('all_products'),
  categoryIds: z.array(z.string()).default([]),
  productIds: z.array(z.string()).default([]),
  excludedProductIds: z.array(z.string()).default([]),
  
  // User Restrictions
  userEligibility: z.enum(['all_users', 'new_users', 'specific_users']).default('all_users'),
  specificUserIds: z.array(z.string()).default([]),
  
  // Combination Rules
  canCombineWithBargain: z.boolean().default(false),
  canCombineWithOtherGlobal: z.boolean().default(false),
  cannotCombineWithCodes: z.array(z.string()).default([]),
  
  // Extra Rules
  firstOrderOnly: z.boolean().default(false),
  freeShippingMaxWeight: z.number().optional(),
  freeShippingZones: z.array(z.string()).default([]),
  
  // Admin Metadata
  notes: z.string().max(1000).optional(),
});

export type GlobalCouponInput = z.infer<typeof GlobalCouponSchema>;

// ==========================================
// 2. TypeScript Interfaces
// ==========================================

// The Document Interface (The data you get back from DB)
export interface IGlobalCoupon extends Document {
  code: string;
  name: string;
  description?: string;
  discountType: 'percentage' | 'fixed' | 'free_shipping';
  discountValue: number;
  maxDiscountAmount?: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  maxUses?: number;
  maxUsesPerUser: number;
  minOrderAmount: number;
  applicableTo: 'all_products' | 'specific_categories' | 'specific_products';
  categoryIds: string[];
  productIds: string[];
  excludedProductIds: string[];
  userEligibility: 'all_users' | 'new_users' | 'specific_users';
  specificUserIds: string[];
  canCombineWithBargain: boolean;
  canCombineWithOtherGlobal: boolean;
  cannotCombineWithCodes: string[];
  firstOrderOnly: boolean;
  freeShippingMaxWeight?: number;
  freeShippingZones: string[];
  
  // Managed Fields
  usedCount: number;
  totalDiscountGiven: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;

  // Virtuals (Calculated properties)
  readonly isExpired: boolean;
  readonly isFullyUsed: boolean;
  readonly isValidForUse: boolean;
  readonly remainingUses: number | null;
  readonly daysRemaining: number;
}

// ==========================================
// 3. Mongoose Schema
// ==========================================
const GlobalCouponSchemaMongoose = new Schema<IGlobalCoupon>({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  discountType: { type: String, enum: ['percentage', 'fixed', 'free_shipping'], required: true },
  discountValue: { type: Number, required: true, min: 0 },
  maxDiscountAmount: { type: Number, min: 0 },
  validFrom: { type: Date, default: Date.now, index: true },
  validUntil: { type: Date, required: true, index: true },
  isActive: { type: Boolean, default: true, index: true },
  maxUses: { type: Number, min: 1 },
  maxUsesPerUser: { type: Number, default: 1, min: 1 },
  minOrderAmount: { type: Number, default: 0, min: 0 },
  applicableTo: { type: String, enum: ['all_products', 'specific_categories', 'specific_products'], default: 'all_products' },
  categoryIds: [{ type: String, ref: 'Category' }],
  productIds: [{ type: String, ref: 'Product' }],
  excludedProductIds: [{ type: String, ref: 'Product' }],
  userEligibility: { type: String, enum: ['all_users', 'new_users', 'specific_users'], default: 'all_users' },
  specificUserIds: [{ type: String, ref: 'User' }],
  canCombineWithBargain: { type: Boolean, default: false },
  canCombineWithOtherGlobal: { type: Boolean, default: false },
  cannotCombineWithCodes: [{ type: String }],
  firstOrderOnly: { type: Boolean, default: false },
  freeShippingMaxWeight: { type: Number },
  freeShippingZones: [{ type: String }],
  usedCount: { type: Number, default: 0, min: 0 },
  totalDiscountGiven: { type: Number, default: 0, min: 0 },
  createdBy: { type: String, required: true, ref: 'User' },
  notes: { type: String },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ==========================================
// 4. Virtuals (Must use 'function' for Mongoose context)
// ==========================================
// We keep these because they are properties of a specific document instance
GlobalCouponSchemaMongoose.virtual('isExpired').get(function() {
  return new Date() > this.validUntil;
});

GlobalCouponSchemaMongoose.virtual('isFullyUsed').get(function() {
  return this.maxUses ? this.usedCount >= this.maxUses : false;
});

GlobalCouponSchemaMongoose.virtual('remainingUses').get(function() {
  return this.maxUses ? Math.max(0, this.maxUses - this.usedCount) : null;
});

GlobalCouponSchemaMongoose.virtual('daysRemaining').get(function() {
  const now = new Date();
  const diffTime = this.validUntil.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

GlobalCouponSchemaMongoose.virtual('isValidForUse').get(function() {
  const now = new Date();
  return this.isActive && !this.isExpired && !this.isFullyUsed && now >= this.validFrom;
});

// ==========================================
// 5. Model Export
// ==========================================
// Note: We use a simpler Model interface since we removed statics
export const GlobalCouponModel = (mongoose.models.GlobalCoupon || 
  mongoose.model<IGlobalCoupon>('GlobalCoupon', GlobalCouponSchemaMongoose));


// ==========================================
// 6. Standalone Services (Replaces Statics)
// ==========================================
// Use these functions instead of Model.generateCode()

/**
 * Generates a unique coupon code
 */
const generateUniqueCode = async (length: number = 8): Promise<string> => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let isUnique = false;
  let result = '';
  let attempts = 0;

  while (!isUnique && attempts < 10) {
    result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Check directly against the exported Model
    const existing = await GlobalCouponModel.findOne({ code: result });
    if (!existing) isUnique = true;
    attempts++;
  }

  if (!isUnique) throw new Error('Failed to generate unique coupon code');
  return result;
};

/**
 * Bulk generates coupons based on a template
 */
const bulkGenerateCoupons = async (
  count: number, 
  template: Partial<GlobalCouponInput>,
  createdBy: string
): Promise<IGlobalCoupon[]> => {
  const coupons = [];
  
  for (let i = 0; i < count; i++) {
    const code = await generateUniqueCode(10);
    coupons.push({
      ...template,
      code,
      createdBy,
    });
  }
  
  // Use insertMany from the exported Model
  return GlobalCouponModel.insertMany(coupons);
};

// ==========================================
// 7. Helper Utilities (Pure Functions)
// ==========================================

const calculateDiscount = (coupon: IGlobalCoupon, orderAmount: number): number => {
  if (!coupon.isValidForUse) return 0;

  switch (coupon.discountType) {
    case 'percentage':
      const discount = (orderAmount * coupon.discountValue) / 100;
      return coupon.maxDiscountAmount ? Math.min(discount, coupon.maxDiscountAmount) : discount;
    case 'fixed':
      return Math.min(coupon.discountValue, orderAmount);
    case 'free_shipping':
      return 0; 
    default:
      return 0;
  }
};

const isApplicableToProduct = (coupon: IGlobalCoupon, productId: string, categoryId?: string): boolean => {
  if (coupon.excludedProductIds.includes(productId)) return false;
  if (coupon.applicableTo === 'all_products') return true;
  
  if (coupon.applicableTo === 'specific_products') {
    return coupon.productIds.includes(productId);
  }
  
  if (coupon.applicableTo === 'specific_categories' && categoryId) {
    return coupon.categoryIds.includes(categoryId);
  }
  return false;
};

const isUserEligible = (coupon: IGlobalCoupon, userId: string, userOrderCount: number): boolean => {
  if (coupon.userEligibility === 'all_users') return true;
  if (coupon.userEligibility === 'new_users') return userOrderCount === 0;
  if (coupon.userEligibility === 'specific_users') return coupon.specificUserIds.includes(userId);
  return false;
};

// Export Services and Helpers neatly
export const CouponServices = {
  generateUniqueCode,
  bulkGenerateCoupons,
  calculateDiscount,
  isApplicableToProduct,
  isUserEligible,
};