// Order domain schemas.
//
// Re-exports the Order model + types. Phase 3 will physically move
// the Zod/Mongoose definitions into features/order/repository.ts.
//
// Also defines the checkout-input Zod schema used at the API boundary
// (parsed by the route handler, then passed to the service). Kept here
// — and not duplicated in the service — so a single Zod parse defines
// the canonical shape.

import { z } from "zod";

export { OrderModel, type IOrder } from "@/models/Order";

// ─── Checkout input schema ────────────────────────────────────────
// Mirrors the original orderSchema in app/api/checkout/order/route.ts
// verbatim. Any drift would silently change which payloads the route
// accepts, so behavior is locked here.

export const placeOrderInputSchema = z.object({
  userId: z.string().optional(),
  guestSessionId: z.string().optional(),
  guestEmail: z.string().email().optional(),
  guestPhone: z.string().min(1).optional(),

  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        name: z.string().min(1),
        price: z.number().positive(),
        discountedPrice: z.number().optional(),
        quantity: z.number().int().min(1),
        bargainCouponId: z.string().optional(),
        bargainDiscount: z.number().optional(),
      }),
    )
    .min(1),

  shippingAddress: z.object({
    fullName: z.string().min(1),
    phone: z.string().min(1),
    addressLine1: z.string().min(1),
    addressLine2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().default("Pakistan"),
  }),

  billingAddress: z
    .object({
      fullName: z.string().min(1),
      phone: z.string().min(1),
      addressLine1: z.string().min(1),
      addressLine2: z.string().optional(),
      city: z.string().min(1),
      state: z.string().min(1),
      postalCode: z.string().min(1),
      country: z.string().default("Pakistan"),
    })
    .optional(),

  shippingMethod: z.enum(["standard", "express"]).default("standard"),
  pointsToUse: z.number().min(0).default(0),
  couponCodes: z.array(z.string()).default([]),
  notes: z.string().max(1000).optional(),
});

export type PlaceOrderInput = z.infer<typeof placeOrderInputSchema>;
