// app/(customer)/checkout/success/page.tsx - UPDATE
import { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import OrderSuccessClient from "@/components/checkout/OrderSuccessClient";
import { connectToDatabase } from "@/lib/mongodb";
import { OrderModel } from "@/models/Order";
import { Types } from "mongoose";

export const metadata: Metadata = {
  title: "Order Confirmed - Mega Prize Mall",
  description: "Your order has been placed successfully",
  robots: "noindex, nofollow",
};

interface OrderSuccessPageProps {
  searchParams: Promise<{ orderId?: string }>;
}

export default async function OrderSuccessPage({
  searchParams,
}: OrderSuccessPageProps) {
  const params = await searchParams;
  const session = await auth();

  if (!params.orderId) {
    redirect("/orders");
  }

  await connectToDatabase();
  interface OrderQuery {
    _id: string | Types.ObjectId;
    userId?: string;
    guestSessionId?: string;
    guestPhone?: string;
    $or?: Array<{
      guestSessionId?: string;
      guestPhone?: string;
    }>;
  }

  // Build query for both guest and logged-in users
  let query: OrderQuery = { _id: params.orderId };

  if (session?.user) {
    if (session.user.isGuest) {
      // Guest user: check guestSessionId
      query = {
        _id: params.orderId,
        $or: [
          { guestSessionId: session.user.id },
          { guestPhone: session.user.id }, // fallback
        ],
      };
    } else {
      // Logged-in user: check userId
      query = {
        _id: params.orderId,
        userId: session.user.id,
      };
    }
  } else {
    // No session but has orderId (edge case)
    // Allow viewing with just orderId for tracking
    query = { _id: params.orderId };
  }

  const order = await OrderModel.findOne(query).lean();

  if (!order) {
    redirect("/orders");
  }

  const orderPlain = JSON.parse(JSON.stringify(order));
  return <OrderSuccessClient order={orderPlain} />;
}
