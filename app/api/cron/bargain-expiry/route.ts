import { NextRequest, NextResponse } from "next/server";
import { sendBargainExpiryReminders } from "@/lib/bargain-expiry-reminders";
import { log } from "@/lib/logger";
import { requireCronQuerySecret } from "@/shared/http";

export async function GET(request: NextRequest) {
  try {
    const cron = requireCronQuerySecret(request);
    if (!cron.ok) return cron.response;

    console.log("🔔 Running bargain expiry cron job...");
    await sendBargainExpiryReminders();

    return NextResponse.json({
      success: true,
      message: "Bargain expiry reminders processed successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    log.error("Cron job failed", { error: error as Error });
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process bargain expiry reminders",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
