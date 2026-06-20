// app/api/coupons/validate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { validateGlobalCoupon } from "@/features/coupon/service";
import { validateBargainCoupon } from "@/features/bargain/service";
import { log } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";
import {
  applyRateLimit,
  ipFromRequest,
  zodValidationError,
} from "@/shared/http";
import { z } from "zod";

// Tight rate limit: this endpoint can be abused to brute-force coupon codes.
const COUPON_VALIDATE_RATE_LIMIT = 20; // requests per minute per IP
const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 1000,
});

const ValidationSchema = z.object({
  couponCode: z.string().min(1),
  orderAmount: z.number().positive(),
  userId: z.string().optional(),
  productId: z.string().optional(), // For bargain coupons
  currentPrice: z.number().positive().optional(), // For bargain coupons
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number(),
        price: z.number(),
        categoryId: z.string().optional(),
      }),
    )
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    const rl = await applyRateLimit(
      limiter,
      COUPON_VALIDATE_RATE_LIMIT,
      ipFromRequest(request),
    );
    if (!rl.ok) return rl.response;

    const body = await request.json();
    const validatedData = ValidationSchema.parse(body);

    const { couponCode, orderAmount, userId, productId, currentPrice, items } =
      validatedData;

    // First check if it's a bargain coupon
    if (productId && currentPrice && userId) {
      const bargainResult = await validateBargainCoupon(
        couponCode,
        productId,
        userId,
        currentPrice,
      );

      if (bargainResult.valid) {
        return NextResponse.json(bargainResult);
      }
    }

    // Then check global coupon
    const globalResult = await validateGlobalCoupon(
      couponCode,
      orderAmount,
      userId,
      items,
    );

    return NextResponse.json(globalResult);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return zodValidationError(error);
    }

    log.error("Error validating coupon", { error: error as Error });
    return NextResponse.json(
      { valid: false, message: "Error validating coupon" },
      { status: 500 },
    );
  }
}
