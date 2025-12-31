// app/api/checkout/order/route.ts
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

// Validation schema
const orderSchema = z.object({
  userId: z.string().min(1),
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
      })
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

export async function POST(request: NextRequest) {
  const userSession = await auth();

  if (!userSession?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validatedData = orderSchema.parse(body);

    // Start transaction for atomic operations
    const session = await OrderModel.startSession();

    // Verify user matches session
    if (validatedData.userId !== userSession.user.id) {
      return NextResponse.json({ error: "User mismatch" }, { status: 403 });
    }

    await connectToDatabase();

    try {
      await session.withTransaction(async () => {
        // 1. Validate products and inventory
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
            (p) => p._id.toString() === item.productId
          );
          if (!product) {
            throw new Error(`Product ${item.productId} not found`);
          }

          if (product.stock < item.quantity) {
            throw new Error(
              `Insufficient stock for ${product.name}. Available: ${product.stock}`
            );
          }

          inventoryUpdates.push({
            productId: product._id.toString(),
            quantity: item.quantity,
            currentStock: product.stock,
          });
        }

        // 2. Validate and mark bargain coupons as used
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
            (p) => p._id.toString() === item.productId
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
            : subtotal > 1000
            ? 0
            : 150;

        // 5. Calculate points discount (10 points = Rs 1)
        const pointsDiscount = validatedData.pointsToUse * 0.1;

        // 6. Apply global coupon discount if any
        let globalCouponDiscount = 0;
        let appliedGlobalCouponCode = "";

        if (validatedData.couponCodes.length > 0) {
          // Validate global coupon
          for (const couponCode of validatedData.couponCodes) {
            const validation = await validateGlobalCoupon(
              couponCode,
              subtotal,
              validatedData.userId,
              validatedData.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
              }))
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
          subtotal + shippingFee - discountTotal - pointsDiscount
        );

        // 7. Calculate points to earn (1 point per Rs 10 spent)
        const pointsEarned = calculatePointsForOrder(grandTotal);

        // 8. Create order
        const order = new OrderModel({
          userId: validatedData.userId,
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
          taxAmount: 0, // Add tax calculation if needed
          grandTotal,
          couponCodes: validatedData.couponCodes,
          pointsEarned,
          notes: validatedData.notes,
          status: "pending",
          paymentMethod: "cod",
          paymentStatus: "pending",
        });

        await order.save({ session });
        // Send emails (non-blocking, outside transaction but after order is saved)
        setTimeout(async () => {
          try {
            // Get user details for email
            const user = await UserModel.findById(validatedData.userId);
            if (!user || !user.email) {
              log.warn(
                "User not found or has no email for order confirmation",
                {
                  userId: validatedData.userId,
                  orderId: order._id,
                }
              );
              return;
            }

            // Send customer confirmation email
            const customerEmailSent = await sendOrderConfirmationEmail(order, {
              email: user.email,
              name: user.name,
            });

            // Send admin notification email
            const adminEmailSent = await sendAdminOrderNotification(order);

            log.info("Order confirmation emails sent", {
              orderId: order._id,
              customerEmail: customerEmailSent,
              adminEmail: adminEmailSent,
              userEmail: user.email,
            });
          } catch (emailError) {
            log.error("Failed to send order confirmation emails:", {
              error: emailError as Error,
              orderId: order._id,
              userId: validatedData.userId,
            });
            // Don't throw - email failure shouldn't fail the order
          }
        }, 0);
        // 9. Update inventory
        for (const update of inventoryUpdates) {
          await ProductModel.findByIdAndUpdate(
            update.productId,
            {
              $inc: {
                stock: -update.quantity,
                purchaseCount: update.quantity,
              },
            },
            { session }
          );
        }

        // 10. Create wallet transaction for points redemption
        if (validatedData.pointsToUse > 0) {
          // Get current user points
          const user = await UserModel.findById(validatedData.userId).session(
            session
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
            { session }
          );
        }

        // 11. Add points transaction for earned points (will be processed after delivery)
        await WalletTransactionModel.create(
          [
            {
              userId: validatedData.userId,
              type: "earn",
              points: pointsEarned,
              balanceAfter:
                (
                  await UserModel.findById(validatedData.userId).session(
                    session
                  )
                )?.points || 0 + pointsEarned,
              description: `Earned from order #${order._id}`,
              orderId: order._id.toString(),
              status: "pending", // Will be completed after delivery
              processedAt: null,
            },
          ],
          { session }
        );

        // 12. Record coupon usage if global coupon was applied
        if (appliedGlobalCouponCode) {
          await recordCouponUsage(
            appliedGlobalCouponCode,
            "global",
            validatedData.userId,
            order._id.toString(),
            globalCouponDiscount,
            subtotal + shippingFee,
            grandTotal,
            request.headers.get("x-forwarded-for") || undefined,
            request.headers.get("user-agent") || undefined
          );

          // Update order with global coupon code
          order.globalCouponCode = appliedGlobalCouponCode;
          await order.save({ session });
        }

        log.info("Order created successfully", {
          orderId: order._id,
          userId: validatedData.userId,
          total: grandTotal,
          items: orderItems.length,
        });

        return order;
      });

      const order = await OrderModel.findOne({ userId: validatedData.userId })
        .sort({ createdAt: -1 })
        .limit(1);

      return NextResponse.json(
        {
          success: true,
          orderId: order?._id,
          // orderNumber: order?.orderNumber,
          message: "Order placed successfully",
        },
        { status: 201 }
      );
    } finally {
      await session.endSession();
    }
  } catch (error) {
    log.error("Order creation failed", {
      error: error as Error,
      userId: userSession.user.id,
    });

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Order creation failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
