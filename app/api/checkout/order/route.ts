// app/api/checkout/order/route.ts - UPDATE for Guest Orders
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { OrderModel } from "@/models/Order";
import { ProductModel } from "@/models/Product";
import { BargainCouponModel } from "@/models/BargainCoupon";
import { WalletTransactionModel } from "@/models/WalletTransaction";
import { UserModel } from "@/models/User";
import { z } from "zod";
import { log } from "@/lib/logger";
import { calculatePointsForOrder } from "@/lib/bargain-utils";
import {
  sendAdminOrderNotification,
  sendOrderConfirmationEmail,
} from "@/lib/email-templates";
import { recordCouponUsage, validateGlobalCoupon } from "@/lib/coupon-utils";

// Updated validation schema for guest orders
const orderSchema = z.object({
  // Make userId optional for guests
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
type OrderInput = z.infer<typeof orderSchema>;
// Validate if it's a guest order
const isGuestOrder = (data: OrderInput): boolean => {
  return !data.userId && Boolean(data.guestSessionId || data.guestPhone);
};

export async function POST(request: NextRequest) {
  const userSession = await auth();

  try {
    const body = await request.json();
    const validatedData = orderSchema.parse(body);

    // Check authorization
    if (!isGuestOrder(validatedData)) {
      // For non-guest orders, require authentication
      if (!userSession?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Verify user matches session for logged-in users
      if (validatedData.userId !== userSession.user.id) {
        return NextResponse.json({ error: "User mismatch" }, { status: 403 });
      }
    } else {
      // For guest orders, ensure at least guestPhone is provided
      if (!validatedData.guestPhone && !validatedData.guestSessionId) {
        return NextResponse.json(
          { error: "Guest phone number is required" },
          { status: 400 },
        );
      }
    }

    await connectToDatabase();
    const session = await OrderModel.startSession();

    try {
      await session.withTransaction(async () => {
        // 1. Validate products and inventory (same for guests and users)
        const productIds = validatedData.items.map((item) => item.productId);
        const products = await ProductModel.find({
          _id: { $in: productIds },
          isActive: true,
        }).session(session);

        if (products.length !== productIds.length) {
          throw new Error("Some products are not available");
        }

        // Check inventory and prepare updates
        const inventoryUpdates: Array<{
          productId: string;
          quantity: number;
          currentStock: number;
        }> = [];

        for (const item of validatedData.items) {
          const product = products.find(
            (p) => p._id.toString() === item.productId,
          );
          if (!product) {
            throw new Error(`Product ${item.productId} not found`);
          }

          if (product.stock < item.quantity) {
            throw new Error(
              `Insufficient stock for ${product.name}. Available: ${product.stock}`,
            );
          }

          inventoryUpdates.push({
            productId: product._id.toString(),
            quantity: item.quantity,
            currentStock: product.stock,
          });
        }

        // 2. Validate and mark bargain coupons as used (if any)
        const bargainCoupons = await BargainCouponModel.find({
          code: { $in: validatedData.couponCodes },
          isActive: true,
          isUsed: false,
          validUntil: { $gt: new Date() },
        }).session(session);

        for (const coupon of bargainCoupons) {
          coupon.isUsed = true;
          coupon.usedAt = new Date();
          await coupon.save({ session });
        }

        // 3. Calculate order totals
        let subtotal = 0;
        let discountTotal = 0;
        const orderItems = [];

        for (const item of validatedData.items) {
          const product = products.find(
            (p) => p._id.toString() === item.productId,
          );
          if (!product) continue;

          const price = item.discountedPrice || item.price;
          const itemTotal = price * item.quantity;
          const bargainDiscount = item.bargainDiscount || 0;

          subtotal += itemTotal;
          discountTotal += bargainDiscount;

          orderItems.push({
            productId: item.productId,
            productName: item.name,
            productSlug: product.slug,
            productImage: product.images?.[0]?.url,
            quantity: item.quantity,
            price: item.price,
            bargainCouponId: item.bargainCouponId,
            discountAmount:
              bargainDiscount +
              (item.discountedPrice
                ? (item.price - item.discountedPrice) * item.quantity
                : 0),
            finalPrice: price,
          });
        }

        // 4. Calculate shipping
        const shippingFee =
          validatedData.shippingMethod === "express"
            ? 300
            : subtotal > 2000
              ? 0
              : 150;

        // 5. Calculate points discount (only for logged-in users)
        let pointsDiscount = 0;
        if (validatedData.userId && validatedData.pointsToUse > 0) {
          pointsDiscount = validatedData.pointsToUse * 0.1;
        }

        // 6. Apply global coupon discount if any
        let globalCouponDiscount = 0;
        let appliedGlobalCouponCode = "";

        if (validatedData.couponCodes.length > 0) {
          // Validate global coupon (for logged-in users only)
          for (const couponCode of validatedData.couponCodes) {
            const validation = await validateGlobalCoupon(
              couponCode,
              subtotal,
              validatedData.userId || undefined, // Pass null for guests
              validatedData.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
              })),
            );

            if (validation.valid && validation.couponType === "global") {
              globalCouponDiscount = validation.discountAmount || 0;
              appliedGlobalCouponCode = couponCode;
              break; // Only apply one global coupon
            }
          }
        }

        // Update discount total
        discountTotal += globalCouponDiscount;

        // 7. Calculate grand total
        const grandTotal = Math.max(
          0,
          subtotal + shippingFee - discountTotal - pointsDiscount,
        );

        // 8. Calculate points to earn (only for logged-in users)
        const pointsEarned = validatedData.userId
          ? calculatePointsForOrder(grandTotal)
          : 0; // Guests don't earn points
        interface OrderPayload {
          items: typeof orderItems;
          shippingAddress: typeof validatedData.shippingAddress;
          billingAddress:
            | typeof validatedData.billingAddress
            | typeof validatedData.shippingAddress;
          shippingMethod: string;
          subtotal: number;
          discountTotal: number;
          pointsRedeemed: number;
          pointsValue: number;
          shippingFee: number;
          taxAmount: number;
          grandTotal: number;
          couponCodes: string[];
          pointsEarned: number;
          notes?: string;
          status: string;
          paymentMethod: string;
          paymentStatus: string;
          ipAddress?: string;
          userAgent?: string;
          // Optional fields that are added conditionally
          userId?: string;
          guestSessionId?: string;
          guestPhone?: string;
          guestEmail?: string;
          isGuestOrder?: boolean;
          globalCouponCode?: string;
        }
        // 9. Create order
        const orderData: OrderPayload = {
          items: orderItems,
          shippingAddress: validatedData.shippingAddress,
          billingAddress:
            validatedData.billingAddress || validatedData.shippingAddress,
          shippingMethod: validatedData.shippingMethod,
          subtotal,
          discountTotal,
          pointsRedeemed: validatedData.pointsToUse,
          pointsValue: pointsDiscount,
          shippingFee,
          taxAmount: 0,
          grandTotal,
          couponCodes: validatedData.couponCodes,
          pointsEarned,
          notes: validatedData.notes,
          status: "pending",
          paymentMethod: "cod",
          paymentStatus: "pending",
          ipAddress: request.headers.get("x-forwarded-for") || undefined,
          userAgent: request.headers.get("user-agent") || undefined,
        };

        // Add user/guest identification
        if (validatedData.userId) {
          orderData.userId = validatedData.userId;
        } else {
          // Guest order
          orderData.guestSessionId = validatedData.guestSessionId;
          orderData.guestPhone = validatedData.guestPhone;
          orderData.guestEmail = validatedData.guestEmail;
          orderData.isGuestOrder = true;
        }

        const order = new OrderModel(orderData);
        await order.save({ session });

        // 10. Update inventory
        for (const update of inventoryUpdates) {
          await ProductModel.findByIdAndUpdate(
            update.productId,
            {
              $inc: {
                stock: -update.quantity,
                purchaseCount: update.quantity,
              },
            },
            { session },
          );
        }

        // 11. Handle points redemption (only for logged-in users)
        if (validatedData.userId && validatedData.pointsToUse > 0) {
          const user = await UserModel.findById(validatedData.userId).session(
            session,
          );
          if (!user) throw new Error("User not found");

          if (user.points < validatedData.pointsToUse) {
            throw new Error("Insufficient points");
          }

          // Deduct points
          user.points -= validatedData.pointsToUse;
          await user.save({ session });

          // Create redemption transaction
          await WalletTransactionModel.create(
            [
              {
                userId: validatedData.userId,
                type: "redeem",
                points: -validatedData.pointsToUse,
                balanceAfter: user.points,
                description: `Redeemed for order #${order._id}`,
                orderId: order._id.toString(),
                status: "completed",
              },
            ],
            { session },
          );
        }

        // 12. Add points transaction for earned points (only for logged-in users)
        if (validatedData.userId && pointsEarned > 0) {
          await WalletTransactionModel.create(
            [
              {
                userId: validatedData.userId,
                type: "earn",
                points: pointsEarned,
                balanceAfter:
                  (
                    await UserModel.findById(validatedData.userId).session(
                      session,
                    )
                  )?.points || 0 + pointsEarned,
                description: `Earned from order #${order._id}`,
                orderId: order._id.toString(),
                status: "pending", // Will be completed after delivery
                processedAt: null,
              },
            ],
            { session },
          );
        }

        // 13. Record coupon usage if global coupon was applied
        if (appliedGlobalCouponCode && validatedData.userId) {
          await recordCouponUsage(
            appliedGlobalCouponCode,
            "global",
            validatedData.userId,
            order._id.toString(),
            globalCouponDiscount,
            subtotal + shippingFee,
            grandTotal,
            request.headers.get("x-forwarded-for") || undefined,
            request.headers.get("user-agent") || undefined,
          );

          // Update order with global coupon code
          order.globalCouponCode = appliedGlobalCouponCode;
          await order.save({ session });
        }

        // 14. Send emails (only for logged-in users with email)
        // 14. Send emails for both logged-in users and guests
        setTimeout(async () => {
          try {
            let customerEmail = null;
            let customerName = null;

            if (validatedData.userId) {
              // For logged-in users
              const user = await UserModel.findById(validatedData.userId);
              if (user && user.email) {
                customerEmail = user.email;
                customerName = user.name;
              }
            } else if (validatedData.guestEmail) {
              // For guests
              customerEmail = validatedData.guestEmail;
              customerName = validatedData.shippingAddress.fullName;
            }

            // Send customer confirmation email if email exists
            if (customerEmail) {
              const customerEmailSent = await sendOrderConfirmationEmail(
                order,
                {
                  email: customerEmail,
                  name: customerName || "Customer",
                },
              );

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

            // Send admin notification email (always send)
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
            // Don't throw - email failure shouldn't fail the order
          }
        }, 0);

        log.info("Order created successfully", {
          orderId: order._id,
          userId: validatedData.userId || "guest",
          guestSessionId: validatedData.guestSessionId,
          total: grandTotal,
          items: orderItems.length,
        });

        return order;
      });

      const order = await OrderModel.findOne({
        $or: [
          { userId: validatedData.userId },
          { guestSessionId: validatedData.guestSessionId },
          { guestPhone: validatedData.guestPhone },
        ],
      })
        .sort({ createdAt: -1 })
        .limit(1);

      return NextResponse.json(
        {
          success: true,
          orderId: order?._id,
          message: "Order placed successfully",
        },
        { status: 201 },
      );
    } finally {
      await session.endSession();
    }
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
