// models/Address.ts    
import mongoose, { Schema, Document } from 'mongoose';
import { z } from 'zod';

// Zod schema for validation
export const AddressSchema = z.object({
  userId: z.string().min(1),
  fullName: z.string().min(1).max(100),
  phone: z.string().min(1).max(20),
  addressLine1: z.string().min(1).max(200),
  addressLine2: z.string().max(200).optional(),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  postalCode: z.string().min(1).max(20),
  country: z.string().default('Pakistan'),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
  label: z.enum(['home', 'work', 'other']).default('home'),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type Address = z.infer<typeof AddressSchema>;

export interface IAddress extends Document, Address {}

// Mongoose Schema
const AddressSchemaMongoose = new Schema<IAddress>({
  userId: { 
    type: String, 
    required: true, 
    ref: 'User',
    index: true 
  },
  fullName: { 
    type: String, 
    required: true, 
    trim: true 
  },
  phone: { 
    type: String, 
    required: true, 
    trim: true 
  },
  addressLine1: { 
    type: String, 
    required: true, 
    trim: true 
  },
  addressLine2: { 
    type: String, 
    trim: true 
  },
  city: { 
    type: String, 
    required: true, 
    trim: true 
  },
  state: { 
    type: String, 
    required: true, 
    trim: true 
  },
  postalCode: { 
    type: String, 
    required: true, 
    trim: true 
  },
  country: { 
    type: String, 
    default: 'Pakistan' 
  },
  isDefault: { 
    type: Boolean, 
    default: false,
    index: true 
  },
  isActive: { 
    type: Boolean, 
    default: true,
    index: true 
  },
  label: { 
    type: String, 
    enum: ['home', 'work', 'other'],
    default: 'home' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
});

// Indexes
AddressSchemaMongoose.index({ userId: 1, isDefault: 1 });
AddressSchemaMongoose.index({ userId: 1, isActive: 1 });

// Pre-save middleware
AddressSchemaMongoose.pre('save', function() {
  this.updatedAt = new Date();
  
  // If this address is being set as default, unset other defaults
  if (this.isDefault && this.isModified('isDefault')) {
    mongoose.models.Address?.updateMany(
      { 
        userId: this.userId, 
        _id: { $ne: this._id } 
      },
      { $set: { isDefault: false } }
    ).catch(err => console.error('Error updating default addresses:', err));
  }
  
//   next();
});

// Virtual for formatted address
AddressSchemaMongoose.virtual('formattedAddress').get(function() {
  const parts = [
    this.addressLine1,
    this.addressLine2,
    `${this.city}, ${this.state} ${this.postalCode}`,
    this.country
  ].filter(Boolean);
  
  return parts.join(', ');
});

// Enable virtuals
AddressSchemaMongoose.set('toJSON', { virtuals: true });
AddressSchemaMongoose.set('toObject', { virtuals: true });

export const AddressModel = mongoose.models.Address || 
  mongoose.model<IAddress>('Address', AddressSchemaMongoose);