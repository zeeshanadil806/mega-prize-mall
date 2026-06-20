import { NextRequest, NextResponse } from "next/server";
import { unauthorized, serverError } from "@/shared/http";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/mongodb";
import { tiktokConversionAPI } from "@/lib/tiktok/server/conversion-api";
import { deduplicationService } from "@/lib/tiktok/server/deduplication";
import { rateLimit } from "@/lib/rate-limit";
import { log } from "@/lib/logger";

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 100,
});


export async function POST(request: NextRequest) {
  try {
    const source = request.headers.get('x-webhook-source') || 'unknown';
    const rateLimitResult = await limiter.check(5, source);

    if (rateLimitResult.isRateLimited) {
      return NextResponse.json(
        { error: 'Webhook rate limit exceeded' },
        { status: 429 }
      );
    }

    // Fail closed if the shared secret is not configured.
    const secret = process.env.TIKTOK_PURCHASE_WEBHOOK_SECRET;
    if (!secret) {
      log.error("TIKTOK_PURCHASE_WEBHOOK_SECRET is not set; rejecting webhook");
      return NextResponse.json(
        { error: "Webhook receiver not configured" },
        { status: 503 }
      );
    }

    // Read the raw body once so we can both verify the signature against it
    // and parse it as JSON. request.json() would consume the stream.
    const rawBody = await request.text();

    // Verify webhook signature
    const signature = request.headers.get("x-webhook-signature");
    if (!verifySignature(signature, rawBody, secret)) {
      return unauthorized("Invalid signature");
    }

    // Connect to MongoDB after signature passes — avoid DB work on bad requests.
    await connectToDatabase();

    const body = JSON.parse(rawBody);
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
    log.error("TikTok purchase webhook error", { error: error as Error });
    return serverError("Internal server error");
  }
}

// Verify HMAC-SHA256 webhook signature over the raw request body.
// Accepts either a bare hex digest or a `sha256=<hex>` prefix (common convention
// used by GitHub, Shopify, and many payment processors). Uses constant-time
// comparison to avoid timing attacks.
function verifySignature(
  signature: string | null,
  rawBody: string,
  secret: string
): boolean {
  if (!signature) return false;

  const provided = signature.startsWith("sha256=")
    ? signature.slice("sha256=".length)
    : signature;

  // Hex digests are always even-length; bail early on malformed input so the
  // Buffer.from below can't silently truncate.
  if (provided.length === 0 || provided.length % 2 !== 0) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  if (provided.length !== expected.length) return false;

  try {
    return crypto.timingSafeEqual(
      Buffer.from(provided, "hex"),
      Buffer.from(expected, "hex")
    );
  } catch {
    return false;
  }
}
