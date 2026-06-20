// src/app/api/admin/support/[id]/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { requireAdmin } from '@/shared/http';
import { z } from "zod";
import { log } from "@/lib/logger";
import bcrypt from "bcryptjs";

const resetPasswordSchema = z.object({
  password: z.string().min(8),
});

export async function POST(
  request: NextRequest,
props: { params: Promise<{ id: string }> }) {
  try {
        const params = await props.params;
  const id = params.id;
    const admin = await requireAdmin();
    if (!admin.ok) return admin.response;
    
    await connectToDatabase();
    
    const body = await request.json();
    const validatedData = resetPasswordSchema.parse(body);
    
    // Find support account
    const supportAccount = await UserModel.findOne({
      _id: id,
      role: "support",
    });
    
    if (!supportAccount) {
      return NextResponse.json(
        { error: "Support account not found" },
        { status: 404 }
      );
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);
    
    // Update password
    supportAccount.password = hashedPassword;
    supportAccount.updatedAt = new Date();
    await supportAccount.save();
    
    log.info("Admin reset support account password", {
      adminId: admin.user.id,
      supportId: id,
      email: supportAccount.email,
    });
    
    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    
    log.error("Error resetting password:", { error: error as Error });
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}