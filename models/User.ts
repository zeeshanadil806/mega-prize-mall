import mongoose, { Schema, Document } from "mongoose";
import { z } from "zod";

// Zod schema for validation
export const UserSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  email: z.string().email(),
  password: z.string().min(8).optional(), // Optional for social login
  image: z.string().url().optional(),
  role: z.enum(["customer", "admin", "support"]).default("customer"),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/)
    .optional(),
  emailVerified: z.date().optional().nullable(),
  points: z.number().min(0).default(0),
  referredBy: { type: String, default: null }, // Referral code used
  referralPointsEarned: { type: Number, default: 0 }, // Points from referrals given
  totalReferrals: { type: Number, default: 0 },
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

// TypeScript type from Zod schema
export type User = z.infer<typeof UserSchema>;

// Mongoose interface extending Document
export interface IUser extends Document, User {}

// Mongoose schema
const UserSchemaMongoose = new Schema<IUser>({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  image: { type: String },
  role: {
    type: String,
    enum: ["customer", "admin", "support"],
    default: "customer",
  },
  phone: { type: String },
  emailVerified: { type: Date },
  referredBy: { type: String, default: null, index: true }, // Referral code used
  referralPointsEarned: { type: Number, default: 0 }, // Points earned from giving referrals
  totalReferrals: { type: Number, default: 0 }, // Count of successful referrals given
  points: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Pre-save middleware to update updatedAt
UserSchemaMongoose.pre("save", function () {
  this.updatedAt = new Date();
  //   next();
});

// Export model (check if already compiled in dev)
export const UserModel =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchemaMongoose);
