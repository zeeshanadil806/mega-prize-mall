import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { tiktokConversionAPI } from "@/lib/tiktok/server/conversion-api";
import { deduplicationService } from "@/lib/tiktok/server/deduplication";
import { rateLimit } from "@/lib/rate-limit";

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 100,
});


export async function POST(request: NextRequest) {
  try {
    const source = request.headers.get('x-webhook-source') || 'unknown';
    const rateLimitResult = limiter.check(5, source);
    
    if (rateLimitResult.isRateLimited) {
      return NextResponse.json(
        { error: 'Webhook rate limit exceeded' },
        { status: 429 }
      );
    }

    // Connect to MongoDB
    await connectToDatabase();

    // Verify webhook signature
    const signature = request.headers.get("x-webhook-signature");
    if (!verifySignature(signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = await request.json();
    const { event, order_id, amount, currency, customer, items, metadata } =
      body;

    if (event !== "payment.succeeded") {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Generate event ID from order ID and timestamp for deduplication
    const eventId = `order_${order_id}_${Date.now()}`;

    // Check for duplicates
    const isDuplicate = await deduplicationService.isDuplicate(eventId);
    if (isDuplicate) {
      return NextResponse.json(
        { success: true, duplicate: true },
        { status: 200 }
      );
    }

    // Send to TikTok Conversion API
    const response = await tiktokConversionAPI.sendPurchaseEvent(eventId, {
      orderId: order_id,
      value: amount,
      currency,
      contents: items.map(
        (item: {
          product_id: string;
          name: string;
          quantity: number;
          price: number;
        }) => ({
          content_id: item.product_id,
          content_name: item.name,
          quantity: item.quantity,
          price: item.price,
        })
      ),
      user: {
        email: customer.email,
        phone: customer.phone,
        external_id: customer.id,
      },
      ttclid: metadata?.ttclid,
      pageUrl: metadata?.page_url,
    });

    // Record successful event
    await deduplicationService.recordEvent(
      eventId,
      "Purchase",
      "conversion_api",
      customer.id
    );

    return NextResponse.json({
      success: response.code === 0,
      event_id: eventId,
    });
  } catch (error) {
    console.error("TikTok purchase webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function verifySignature(signature: string | null): boolean {
  // Implement based on your payment processor
  // Example for Stripe:
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  // return stripe.webhooks.constructEvent(...);
  return !!signature;
}
