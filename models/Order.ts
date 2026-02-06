// models/Order.ts
import mongoose, { Schema, Document } from "mongoose";
import { z } from "zod";

// Order Item Schema (subdocument)
export const OrderItemSchema = z.object({
  productId: z.string().min(1),
  productName: z.string().min(1),
  productSlug: z.string().min(1),
  productImage: z.string().optional(),
  quantity: z.number().int().min(1),
  price: z.number().positive(), // Price at time of order
  bargainCouponId: z.string().optional(), // Specific bargain coupon used
  discountAmount: z.number().min(0).default(0),
  finalPrice: z.number().positive(), // price - discountAmount
});

// Address Schema
export const AddressSchema = z.object({
  fullName: z.string().min(1),
  phone: z.string().min(1),
  addressLine1: z.string().min(1),
  addressLine2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().default("Pakistan"),
  isDefault: z.boolean().default(false),
});

// Order Schema
export const OrderSchema = z.object({
  // Core Order Info
  // orderNumber: z.string().min(1), // e.g., "MPM-20241225-001"
  userId: z.string().min(1),

  // Guest Identification
  guestSessionId: z.string().optional(),
  guestPhone: z.string().optional(),
  guestEmail: z.string().email().optional(),
  isGuestOrder: z.boolean().default(false),

  // Order Items
  items: z.array(OrderItemSchema).min(1),

  // Pricing Summary
  subtotal: z.number().positive(),
  discountTotal: z.number().min(0), // Sum of all discounts
  pointsRedeemed: z.number().min(0).default(0),
  pointsValue: z.number().min(0).default(0), // pointsRedeemed * 0.1
  shippingFee: z.number().min(0).default(0),
  taxAmount: z.number().min(0).default(0),
  grandTotal: z.number().positive(),

  // Discounts & Coupons
  couponCodes: z.array(z.string()).default([]),
  bargainCouponIds: z.array(z.string()).default([]),
  globalCouponCode: z.string().optional(),

  // Shipping & Delivery
  shippingAddress: AddressSchema,
  billingAddress: AddressSchema.optional(),
  shippingMethod: z.string().default("standard"),
  estimatedDelivery: z.date().optional(),
  deliveredAt: z.date().optional(),

  // Payment
  paymentMethod: z.enum(["cod", "card", "bank_transfer"]).default("cod"),
  paymentStatus: z
    .enum(["pending", "paid", "failed", "refunded"])
    .default("pending"),
  transactionId: z.string().optional(),

  // Order Status
  status: z
    .enum([
      "pending", // Order placed
      "confirmed", // Admin confirmed
      "processing", // Preparing for shipment
      "shipped", // Shipped to customer
      "delivered", // Successfully delivered
      "cancelled", // Cancelled by admin/user
      "returned", // Returned by customer
      "refunded", // Refund processed
    ])
    .default("pending"),

  // Points & Rewards
  pointsEarned: z.number().min(0).default(0), // Points to earn after delivery
  pointsRedeemTransactionId: z.string().optional(), // Reference to wallet transaction

  // Lucky Draw
  luckyDrawEntries: z.number().int().min(0).default(0),
  luckyDrawEntryIds: z.array(z.string()).default([]),

  // Metadata
  notes: z.string().max(1000).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),

  // Timestamps
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  paidAt: z.date().optional(),
  cancelledAt: z.date().optional(),
});

export type Order = z.infer<typeof OrderSchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type Address = z.infer<typeof AddressSchema>;

export interface IOrder extends Document, Order {}

// Mongoose Schema
const OrderSchemaMongoose = new Schema<IOrder>({
  // orderNumber: { type: String, required: true, unique: true, index: true },
  userId: { type: String, required: false, ref: "User", index: true },

  // Guest Identification
  guestSessionId: {
    type: String,
    index: true,
  },
  guestPhone: {
    type: String,
    index: true,
  },
  guestEmail: {
    type: String,
  },
  isGuestOrder: {
    type: Boolean,
    default: false,
    index: true,
  },

  items: [
    {
      productId: { type: String, required: true, ref: "Product" },
      productName: { type: String, required: true },
      productSlug: { type: String, required: true },
      productImage: { type: String },
      quantity: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true, min: 0 },
      bargainCouponId: { type: String, ref: "BargainCoupon" },
      discountAmount: { type: Number, default: 0, min: 0 },
      finalPrice: { type: Number, required: true, min: 0 },
    },
  ],

  // Pricing
  subtotal: { type: Number, required: true, min: 0 },
  discountTotal: { type: Number, default: 0, min: 0 },
  pointsRedeemed: { type: Number, default: 0, min: 0 },
  pointsValue: { type: Number, default: 0, min: 0 },
  shippingFee: { type: Number, default: 0, min: 0 },
  taxAmount: { type: Number, default: 0, min: 0 },
  grandTotal: { type: Number, required: true, min: 0 },

  // Discounts
  couponCodes: [{ type: String }],
  bargainCouponIds: [{ type: String, ref: "BargainCoupon" }],
  globalCouponCode: { type: String },

  // Shipping
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, default: "Pakistan" },
    isDefault: { type: Boolean, default: false },
  },

  billingAddress: {
    fullName: { type: String },
    phone: { type: String },
    addressLine1: { type: String },
    addressLine2: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String, default: "Pakistan" },
    isDefault: { type: Boolean, default: false },
  },

  shippingMethod: { type: String, default: "standard" },
  estimatedDelivery: { type: Date },
  deliveredAt: { type: Date },

  // Payment
  paymentMethod: {
    type: String,
    enum: ["cod", "card", "bank_transfer"],
    default: "cod",
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed", "refunded"],
    default: "pending",
    index: true,
  },
  transactionId: { type: String },

  // Order Status
  status: {
    type: String,
    enum: [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "returned",
      "refunded",
    ],
    default: "pending",
    index: true,
  },

  // Points & Rewards
  pointsEarned: { type: Number, default: 0, min: 0 },
  pointsRedeemTransactionId: { type: String, ref: "WalletTransaction" },

  // Lucky Draw
  luckyDrawEntries: { type: Number, default: 0, min: 0 },
  luckyDrawEntryIds: [{ type: String, ref: "LuckyDrawEntry" }],

  // Metadata
  notes: { type: String, maxlength: 1000 },
  ipAddress: { type: String },
  userAgent: { type: String },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  paidAt: { type: Date },
  cancelledAt: { type: Date },
});

// Indexes
OrderSchemaMongoose.index({ userId: 1, createdAt: -1 });
OrderSchemaMongoose.index({ guestSessionId: 1, createdAt: -1 });
OrderSchemaMongoose.index({ guestPhone: 1, createdAt: -1 });
OrderSchemaMongoose.index({ isGuestOrder: 1, createdAt: -1 });
OrderSchemaMongoose.index({ status: 1, createdAt: -1 });
OrderSchemaMongoose.index({ paymentStatus: 1, status: 1 });
OrderSchemaMongoose.index({ "items.productId": 1 });

OrderSchemaMongoose.virtual("formattedDate").get(function () {
  return this.createdAt.toLocaleDateString("en-PK", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
});

// Add validation to ensure either userId OR guest fields
OrderSchemaMongoose.pre("validate", function () {
  if (!this.userId && !this.guestSessionId && !this.guestPhone) {
    this.invalidate(
      "userId",
      "Either userId or guest identification is required",
    );
  }
});

// Virtual for item count
OrderSchemaMongoose.virtual("itemCount").get(function () {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// Virtual for delivery status
OrderSchemaMongoose.virtual("deliveryStatus").get(function () {
  if (this.status === "delivered") return "Delivered";
  if (this.status === "shipped") return "Shipped";
  if (this.status === "processing") return "Processing";
  if (this.status === "confirmed") return "Confirmed";
  return "Pending";
});

// Enable virtuals
OrderSchemaMongoose.set("toJSON", { virtuals: true });
OrderSchemaMongoose.set("toObject", { virtuals: true });

export const OrderModel =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchemaMongoose);
