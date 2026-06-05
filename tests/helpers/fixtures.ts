// Fixture builders for integration tests.
//
// Each `create*` function persists a minimal valid document via Mongoose
// and returns it. Pass overrides to customize specific fields. Defaults
// satisfy required-field validation so tests don't need to know the full
// schema.

import { randomUUID } from "node:crypto";
import { UserModel } from "@/models/User";
import { ProductModel } from "@/models/Product";
import { BargainCouponModel } from "@/models/BargainCoupon";
import { GlobalCouponModel } from "@/models/GlobalCoupon";
import { OrderModel } from "@/models/Order";
import { CouponUsageModel } from "@/models/CouponUsage";

let counter = 0;
const uniq = (prefix: string) => `${prefix}-${++counter}-${randomUUID().slice(0, 8)}`;

export async function createUser(overrides: Record<string, unknown> = {}) {
  return UserModel.create({
    email: `${uniq("user")}@test.local`,
    name: "Test User",
    role: "customer",
    points: 0,
    ...overrides,
  });
}

export async function createProduct(overrides: Record<string, unknown> = {}) {
  return ProductModel.create({
    name: uniq("Product"),
    slug: uniq("product").toLowerCase(),
    description: "Test product description",
    price: 1000,
    discountedPrice: 0,
    category: "Mobile Accessories",
    brand: "TestBrand",
    sku: uniq("SKU").toUpperCase(),
    stock: 100,
    bargainEnabled: true,
    minBargainPrice: 600,
    maxBargainRounds: 3,
    bargainValidityHours: 24,
    isActive: true,
    images: [],
    features: [],
    ...overrides,
  });
}

interface BargainCouponOverrides {
  code?: string;
  productId?: string;
  userId?: string;
  originalPrice?: number;
  discountedPrice?: number;
  discountAmount?: number;
  discountPercentage?: number;
  validFrom?: Date;
  validUntil?: Date;
  isActive?: boolean;
  isUsed?: boolean;
}

export async function createBargainCoupon(overrides: BargainCouponOverrides = {}) {
  const originalPrice = overrides.originalPrice ?? 1000;
  const discountedPrice = overrides.discountedPrice ?? 700;
  const discountAmount = overrides.discountAmount ?? originalPrice - discountedPrice;
  const discountPercentage =
    overrides.discountPercentage ??
    Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);

  return BargainCouponModel.create({
    code: overrides.code ?? `BARGAIN-${uniq("X").toUpperCase().slice(0, 6)}`,
    productId: overrides.productId ?? uniq("product"),
    userId: overrides.userId ?? uniq("user"),
    bargainRequestId: uniq("req"),
    originalPrice,
    discountedPrice,
    discountAmount,
    discountPercentage,
    validFrom: overrides.validFrom ?? new Date(Date.now() - 1000),
    validUntil: overrides.validUntil ?? new Date(Date.now() + 24 * 60 * 60 * 1000),
    isActive: overrides.isActive ?? true,
    isUsed: overrides.isUsed ?? false,
  });
}

interface GlobalCouponOverrides {
  code?: string;
  name?: string;
  discountType?: "percentage" | "fixed" | "free_shipping";
  discountValue?: number;
  maxDiscountAmount?: number;
  validFrom?: Date;
  validUntil?: Date;
  isActive?: boolean;
  maxUses?: number;
  maxUsesPerUser?: number;
  minOrderAmount?: number;
  applicableTo?: "all_products" | "specific_categories" | "specific_products";
  productIds?: string[];
  categoryIds?: string[];
  excludedProductIds?: string[];
  userEligibility?: "all_users" | "new_users" | "specific_users";
  specificUserIds?: string[];
  firstOrderOnly?: boolean;
  usedCount?: number;
}

export async function createGlobalCoupon(overrides: GlobalCouponOverrides = {}) {
  return GlobalCouponModel.create({
    code: overrides.code ?? uniq("CODE").toUpperCase().replace(/-/g, ""),
    name: overrides.name ?? "Test Coupon",
    discountType: overrides.discountType ?? "percentage",
    discountValue: overrides.discountValue ?? 10,
    maxDiscountAmount: overrides.maxDiscountAmount,
    validFrom: overrides.validFrom ?? new Date(Date.now() - 1000),
    validUntil: overrides.validUntil ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isActive: overrides.isActive ?? true,
    maxUses: overrides.maxUses,
    maxUsesPerUser: overrides.maxUsesPerUser ?? 1,
    minOrderAmount: overrides.minOrderAmount ?? 0,
    applicableTo: overrides.applicableTo ?? "all_products",
    productIds: overrides.productIds ?? [],
    categoryIds: overrides.categoryIds ?? [],
    excludedProductIds: overrides.excludedProductIds ?? [],
    userEligibility: overrides.userEligibility ?? "all_users",
    specificUserIds: overrides.specificUserIds ?? [],
    firstOrderOnly: overrides.firstOrderOnly ?? false,
    usedCount: overrides.usedCount ?? 0,
    createdBy: "test-admin",
  });
}

export async function createOrder(overrides: Record<string, unknown> = {}) {
  // Minimal saveable Order. Most fields aren't asserted on in coupon
  // tests; we only need this to make countDocuments({ userId }) return >0.
  return OrderModel.create({
    userId: overrides.userId,
    items: [
      {
        productId: uniq("product"),
        productName: "Test",
        productSlug: "test",
        quantity: 1,
        price: 1000,
        finalPrice: 1000,
      },
    ],
    subtotal: 1000,
    grandTotal: 1000,
    status: "pending",
    paymentStatus: "pending",
    shippingAddress: {
      fullName: "Test User",
      phone: "+923000000000",
      addressLine1: "1 Test Street",
      city: "Karachi",
      state: "Sindh",
      postalCode: "75000",
    },
    ...overrides,
  });
}

export async function createCouponUsage(overrides: Record<string, unknown> = {}) {
  return CouponUsageModel.create({
    couponCode: uniq("CODE").toUpperCase(),
    couponType: "global",
    userId: uniq("user"),
    orderId: uniq("order"),
    discountApplied: 100,
    orderAmount: 1000,
    orderAmountAfterDiscount: 900,
    ...overrides,
  });
}
