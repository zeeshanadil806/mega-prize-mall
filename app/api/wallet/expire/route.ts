// app/api/wallet/expire/route.ts
//
// Thin HTTP controller for the daily points-expiry cron. Owns:
// CRON_SECRET auth, response shaping. Orchestration in
// features/wallet/service.ts.

import { NextRequest, NextResponse } from "next/server";
import { log } from "@/lib/logger";
import { expireDailyPoints } from "@/features/wallet/service";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await expireDailyPoints();

    if (result.outcome === "nothing_to_expire") {
      return NextResponse.json({
        success: true,
        message: "No points to expire today",
        expiredCount: 0,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully expired ${result.data.expiredTransactions} point transactions`,
      data: result.data,
    });
  } catch (error) {
    // Preserved verbatim: the original route surfaced a copy-pasted
    // "Failed to generate invoice" string when the error wasn't an
    // Error instance. Keep it so the response shape is unchanged.
    const errorMessage =
      error instanceof Error ? error.message : "Failed to generate invoice";
    log.error("Error expiring points", { error: error as Error });
    return NextResponse.json(
      { error: errorMessage || "Failed to expire points" },
      { status: 400 },
    );
  }
}
