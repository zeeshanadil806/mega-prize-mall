import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { OrderModel } from "@/models/Order";
import { WalletTransactionModel } from "@/models/WalletTransaction";
import { auth } from "@/auth";
import mongoose from "mongoose";
import {
  sendOrderShippedEmail,
  sendOrderDeliveredEmail,
} from "@/lib/email-templates";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const UserModel = (await import("@/models/User")).UserModel;
    await connectToDatabase();
    const user = await UserModel.findById(session.user.id);

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { status } = await request.json();

    // Validate status
    const validStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const sessionDb = await mongoose.startSession();

    try {
      sessionDb.startTransaction();

      // Find the order
      const order = await OrderModel.findById(id).session(sessionDb);
      if (!order) {
        throw new Error("Order not found");
      }

      const oldStatus = order.status;
      order.status = status;

      if (status === "shipped") {
        order.status = status;

        // Send shipped email (non-blocking)
        setTimeout(async () => {
          try {
            const user = await UserModel.findById(order.userId);
            if (user?.email) {
              await sendOrderShippedEmail(order, {
                email: user.email,
                name: user.name,
              });
              console.log(`Shipped email sent for order ${order._id}`);
            }
          } catch (emailError) {
            console.error("Failed to send shipped email:", emailError);
          }
        }, 0);
      }

      // Update timestamps based on status
      if (status === "delivered") {
        order.deliveredAt = new Date();

        setTimeout(async () => {
          try {
            const user = await UserModel.findById(order.userId);
            if (user?.email) {
              // Check if lucky draw entry was created
              let luckyDrawInfo = undefined;
              if (order.grandTotal >= 3000) {
                const { LuckyDrawEntryModel } = await import(
                  "@/models/LuckyDrawEntry"
                );
                const latestEntry = await LuckyDrawEntryModel.findOne({
                  orderId: order._id,
                  userId: order.userId,
                }).sort({ createdAt: -1 });

                if (latestEntry) {
                  const { LuckyDrawModel } = await import("@/models/LuckyDraw");
                  const draw = await LuckyDrawModel.findById(
                    latestEntry.drawId
                  );
                  if (draw) {
                    luckyDrawInfo = {
                      drawTitle: draw.title,
                      entryId: latestEntry._id.toString(),
                    };
                  }
                }
              }

              await sendOrderDeliveredEmail(
                order,
                {
                  email: user.email,
                  name: user.name,
                },
                order.pointsEarned,
                luckyDrawInfo
              );
              console.log(`Delivered email sent for order ${order._id}`);
            }
          } catch (emailError) {
            console.error("Failed to send delivered email:", emailError);
          }
        }, 0);

        // Award points for delivered orders
        if (order.pointsEarned > 0) {
          const pointsTransaction = new WalletTransactionModel({
            userId: order.userId,
            type: "earn",
            points: order.pointsEarned,
            balanceAfter:
              (
                await OrderModel.findOne({ userId: order.userId }).sort({
                  createdAt: -1,
                })
              )?.points || 0 + order.pointsEarned,
            orderId: order._id,
            description: `Points earned for order ${order._id}`,
            status: "completed",
          });
          await pointsTransaction.save({ session: sessionDb });

          // Update user's points
          await UserModel.findByIdAndUpdate(
            order.userId,
            { $inc: { points: order.pointsEarned } },
            { session: sessionDb }
          );
        }
        // ============ ADD THIS PART FOR LUCKY DRAW ============
        // Create lucky draw entry if order qualifies (Rs 3000+ delivered order)
        if (status === "delivered" && order.grandTotal >= 3000) {
          try {
            const { createLuckyDrawEntry } = await import(
              "@/lib/lucky-draw-utils"
            );
            const luckyDrawResult = await createLuckyDrawEntry(
              order._id.toString()
            );

            if (luckyDrawResult.success) {
              console.log(
                `Lucky draw entry created: ${luckyDrawResult.entry?._id} for order ${order._id}`
              );
            } else {
              console.warn(
                `Failed to create lucky draw entry for order ${order._id}:`,
                luckyDrawResult.error
              );
            }
          } catch (luckyDrawError) {
            console.error(
              "Error in lucky draw entry creation:",
              luckyDrawError
            );
            // Don't fail the order status update if lucky draw fails
          }
        }
        // ============ END LUCKY DRAW PART ============
      } else if (status === "cancelled") {
        order.cancelledAt = new Date();

        // Refund points if cancelling an order with redeemed points
        if (order.pointsRedeemed > 0) {
          const refundTransaction = new WalletTransactionModel({
            userId: order.userId,
            type: "refund",
            points: order.pointsRedeemed,
            balanceAfter:
              (
                await OrderModel.findOne({ userId: order.userId }).sort({
                  createdAt: -1,
                })
              )?.points || 0 + order.pointsRedeemed,
            orderId: order._id,
            description: `Points refund for cancelled order ${order._id}`,
            status: "completed",
          });
          await refundTransaction.save({ session: sessionDb });

          await UserModel.findByIdAndUpdate(
            order.userId,
            { $inc: { points: order.pointsRedeemed } },
            { session: sessionDb }
          );
        }
      }

      await order.save({ session: sessionDb });
      await sessionDb.commitTransaction();

      return NextResponse.json({
        success: true,
        message: `Order status updated from ${oldStatus} to ${status}`,
        order,
      });
    } catch (error) {
      await sessionDb.abortTransaction();
      throw error;
    } finally {
      sessionDb.endSession();
    }
  } catch (error) {
    console.error("Error updating order status:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to cancel order";
    return NextResponse.json(
      { error: errorMessage || "Failed to update order status" },
      { status: 400 }
    );
  }
}
