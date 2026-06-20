// app/api/wallet/redeem/route.ts
//
// Thin HTTP controller for manual point redemption. Owns: NextAuth
// session check, input validation, outcome → HTTP status mapping.
// Orchestration in features/wallet/service.ts.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { log } from "@/lib/logger";
import { redeemPointsManually } from "@/features/wallet/service";
import { badRequest, forbidden, requireSession } from "@/shared/http";

const redeemSchema = z.object({
  points: z.number().int().min(100).max(100000),
  userId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    if (!session.ok) return session.response;

    const body = await request.json();
    const validation = redeemSchema.safeParse(body);
    if (!validation.success) {
      return badRequest("Invalid request data", validation.error.issues);
    }

    const { points, userId } = validation.data;

    if (session.user.id !== userId) {
      return forbidden("Forbidden");
    }

    const result = await redeemPointsManually({ userId, points });

    if (result.outcome === "user_not_found") {
      return NextResponse.json(
        { error: "User not found", code: "REDEEM_FAILED" },
        { status: 400 },
      );
    }

    if (result.outcome === "insufficient_points") {
      const message = `Insufficient points. Available: ${result.available}`;
      return NextResponse.json(
        { error: message, code: "INSUFFICIENT_POINTS" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully redeemed ${result.data.pointsRedeemed.toLocaleString()} points`,
      data: result.data,
    });
  } catch (error) {
    log.error("Error redeeming points", { error: error as Error });
    // Preserved verbatim — see comment in the expire route.
    const errorMessage =
      error instanceof Error ? error.message : "Failed to generate invoice";
    return NextResponse.json(
      {
        error: errorMessage || "Failed to redeem points",
        code: errorMessage.includes("Insufficient")
          ? "INSUFFICIENT_POINTS"
          : "REDEEM_FAILED",
      },
      { status: 400 },
    );
  }
}

