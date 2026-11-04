// app/api/checkout/order/route.ts
//
// Thin HTTP controller. Owns: auth check, payload parse, header
// extraction, email scheduling (fire-and-forget), response shaping.
// All checkout orchestration lives in features/order/service.ts.

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { z } from "zod";
import { log } from "@/lib/logger";
import {
  placeOrderInputSchema,
  type PlaceOrderInput,
} from "@/features/order/schema";
import { placeOrder } from "@/features/order/service";
import {
  sendAdminOrderNotification,
  sendOrderConfirmationEmail,
} from "@/lib/email-templates";
import { rateLimit } from "@/lib/rate-limit";
import { applyRateLimit, ipFromRequest } from "@/shared/http";

const CHECKOUT_RATE_LIMIT = 15; // 15 orders per 5 minutes per IP
const limiter = rateLimit({
  interval: 5 * 60 * 1000,
  uniqueTokenPerInterval: 500,
});

const isGuestOrder = (data: PlaceOrderInput): boolean => {
  return !data.userId && Boolean(data.guestSessionId || data.guestPhone);
};

export async function POST(request: NextRequest) {
  const rl = await applyRateLimit(
    limiter,
    CHECKOUT_RATE_LIMIT,
    ipFromRequest(request),
  );
  if (!rl.ok) return rl.response;

  const userSession = await auth();

  try {
    const body = await request.json();
    const validatedData = placeOrderInputSchema.parse(body);

    // Auth gates — preserved from the original route.
    if (!isGuestOrder(validatedData)) {
      if (!userSession?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (validatedData.userId !== userSession.user.id) {
        return NextResponse.json({ error: "User mismatch" }, { status: 403 });
      }
    } else {
      if (!validatedData.guestPhone && !validatedData.guestSessionId) {
        return NextResponse.json(
          { error: "Guest phone number is required" },
          { status: 400 },
        );
      }
    }

    await connectToDatabase();

    const result = await placeOrder(validatedData, {
      ipAddress: request.headers.get("x-forwarded-for") || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
    });

    // Email helpers are typed against the serialized ClientOrder /
    // OrderDetails shape (_id: string), but at runtime they call
    // toString() on the Mongoose ObjectId. The original route passed
    // the hydrated document directly; preserve that by casting at the
    // boundary instead of serializing.
    const order = result.order as unknown as Parameters<
      typeof sendOrderConfirmationEmail
    >[0] &
      Parameters<typeof sendAdminOrderNotification>[0];

    // Fire-and-forget customer + admin emails.
    // Preserved as setTimeout(...,0) so the response isn't blocked
    // on SMTP and so the route shape matches the original behavior.
    setTimeout(async () => {
      try {
        let customerEmail: string | null = null;
        let customerName: string | null = null;

        if (validatedData.userId) {
          const user = await UserModel.findById(validatedData.userId);
          if (user && user.email) {
            customerEmail = user.email;
            customerName = user.name;
          }
        } else if (validatedData.guestEmail) {
          customerEmail = validatedData.guestEmail;
          customerName = validatedData.shippingAddress.fullName;
        }

        if (customerEmail) {
          const customerEmailSent = await sendOrderConfirmationEmail(order, {
            email: customerEmail,
            name: customerName || "Customer",
          });
          log.info("Order confirmation email sent", {
            orderId: order._id,
            customerEmail: customerEmailSent,
            userType: validatedData.userId ? "user" : "guest",
            email: customerEmail,
          });
        } else {
          log.warn("No email found for order confirmation", {
            orderId: order._id,
            userId: validatedData.userId || "guest",
          });
        }

        const adminEmailSent = await sendAdminOrderNotification(order);
        log.info("Admin notification email sent", {
          orderId: order._id,
          adminEmail: adminEmailSent,
          userType: validatedData.userId ? "user" : "guest",
        });
      } catch (emailError) {
        log.error("Failed to send order confirmation emails:", {
          error: emailError as Error,
          orderId: order._id,
          userId: validatedData.userId || "guest",
        });
      }
    }, 0);

    return NextResponse.json(
      {
        success: true,
        orderId: order._id,
        message: "Order placed successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    log.error("Order creation failed", {
      error: error as Error,
      userId: userSession?.user?.id || "guest",
    });

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error: "Order creation failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
