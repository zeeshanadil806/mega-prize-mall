import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import { ProductModel } from "@/models/Product";
import { UserModel } from "@/models/User";
import { auth } from "@/auth";
import { log } from "@/lib/logger";
import { formatCurrency } from "@/shared/format";
import { sendBargainCouponEmail } from "@/lib/email-templates";
import {
  submitBargainOffer,
  getRecentBargainHistory,
} from "@/features/bargain/service";
import { BargainCouponModel } from "@/models/BargainCoupon";

const bargainSchema = z.object({
  productId: z.string().min(1),
  offeredPrice: z.number().positive(),
  message: z.string().max(500).optional(),
});

// POST /api/bargain — submit a bargain offer.
//
// Thin dispatcher: authn, body parse, product fetch + gating, then
// delegates to features/bargain/service.submitBargainOffer for all
// bargain-domain logic. Email is fired-and-forgotten after the service
// returns an accepted outcome.
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    await connectToDatabase();
    const body = await request.json();
    const validated = bargainSchema.parse(body);

    const product = await ProductModel.findById(validated.productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    if (!product.bargainEnabled) {
      return NextResponse.json(
        { error: "Bargain not enabled for this product" },
        { status: 400 },
      );
    }

    const result = await submitBargainOffer({
      userId,
      product: {
        id: product._id.toString(),
        price: product.price,
        discountedPrice: product.discountedPrice,
        minBargainPrice: product.minBargainPrice,
        maxBargainRounds: product.maxBargainRounds,
      },
      offeredPrice: validated.offeredPrice,
      message: validated.message,
    });

    if (result.outcome === "rounds_exceeded") {
      return NextResponse.json(
        {
          error: result.data.message,
          currentRound: result.data.currentRound,
          maxRounds: result.data.maxRounds,
        },
        { status: 400 },
      );
    }

    if (result.outcome === "rejected") {
      log.info("Bargain rejected", {
        productId: product._id.toString(),
        userId,
        offeredPrice: validated.offeredPrice,
        minPrice: product.minBargainPrice,
        round: result.data.currentRound,
      });
      return NextResponse.json({
        success: false,
        data: result.data,
      });
    }

    // Accepted — fire-and-forget the customer email and respond 201.
    const acceptedData = result.data;
    setTimeout(async () => {
      try {
        const user = await UserModel.findById(userId);
        if (user?.email) {
          const bargainCoupon = await BargainCouponModel.findById(
            acceptedData.couponId,
          );
          if (bargainCoupon) {
            await sendBargainCouponEmail(bargainCoupon, product, {
              email: user.email,
              name: user.name,
            });
          }
        }
      } catch (emailError) {
        log.error("Failed to send bargain coupon email", {
          error: emailError as Error,
        });
      }
    }, 0);

    log.info("Bargain accepted", {
      productId: product._id.toString(),
      userId,
      offeredPrice: validated.offeredPrice,
      couponCode: acceptedData.couponCode,
      discountPercentage: acceptedData.discountPercentage,
      round: acceptedData.currentRound,
    });

    // Match the original response shape verbatim: it didn't include
    // raw `originalPrice` / `offeredPrice` at the data root — only
    // their formatted strings inside `formatted`. Strip them off the
    // service output before responding.
    const {
      originalPrice: _orig,
      offeredPrice: _off,
      ...responseData
    } = acceptedData;
    void _orig;
    void _off;
    return NextResponse.json(
      {
        success: true,
        data: {
          ...responseData,
          formatted: {
            originalPrice: formatCurrency(acceptedData.originalPrice),
            offeredPrice: formatCurrency(acceptedData.offeredPrice),
            savingAmount: formatCurrency(acceptedData.savingAmount),
            discountPercentage: `${acceptedData.discountPercentage}%`,
          },
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 },
      );
    }

    const errorMessage =
      error instanceof Error ? error.message : "Bargain processing failed";
    log.error("Bargain API error", { error: error as Error });

    return NextResponse.json(
      { error: "Bargain processing failed", details: errorMessage },
      { status: 500 },
    );
  }
}

// GET /api/bargain — list the user's recent bargain history.
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId") ?? undefined;

    const result = await getRecentBargainHistory(userId, productId);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    log.error("Bargain history API error", { error: error as Error });
    return NextResponse.json(
      { error: "Failed to fetch bargain history" },
      { status: 500 },
    );
  }
}
