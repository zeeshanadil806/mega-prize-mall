// src/app/api/admin/support/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { requireAdmin } from '@/shared/http';
import { z } from "zod";
import { log } from "@/lib/logger";
import bcrypt from "bcryptjs";

// Schema for updating support account
const updateSupportSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
        const params = await props.params;
    const id = params.id;
    const admin = await requireAdmin();
    if (!admin.ok) return admin.response;

    await connectToDatabase();

    const supportAccount = await UserModel.findOne({
      _id: id,
      role: "support",
    }).select("-password");

    if (!supportAccount) {
      return NextResponse.json(
        { error: "Support account not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: supportAccount,
    });
  } catch (error) {
    log.error("Error fetching support account:", { error: error as Error });
    return NextResponse.json(
      { error: "Failed to fetch support account" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
        const params = await props.params;
    const id = params.id;
    const admin = await requireAdmin();
    if (!admin.ok) return admin.response;

    await connectToDatabase();

    const body = await request.json();
    const validatedData = updateSupportSchema.parse(body);

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

    // Update fields
    if (validatedData.name !== undefined) {
      supportAccount.name = validatedData.name;
    }

    if (validatedData.phone !== undefined) {
      supportAccount.phone = validatedData.phone;
    }

    if (validatedData.isActive !== undefined) {
      supportAccount.isActive = validatedData.isActive;
    }

    supportAccount.updatedAt = new Date();
    await supportAccount.save();

    log.info("Admin updated support account", {
      adminId: admin.user.id,
      supportId: id,
      updates: Object.keys(validatedData),
    });

    return NextResponse.json({
      success: true,
      message: "Support account updated successfully",
      data: {
        id: supportAccount._id.toString(),
        name: supportAccount.name,
        email: supportAccount.email,
        phone: supportAccount.phone,
        isActive: supportAccount.isActive,
        updatedAt: supportAccount.updatedAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    log.error("Error updating support account:", { error: error as Error });
    return NextResponse.json(
      { error: "Failed to update support account" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
        const params = await props.params;
    const id = params.id;
    const admin = await requireAdmin();
    if (!admin.ok) return admin.response;

    await connectToDatabase();

    // Check if trying to delete own account
    if (id === admin.user.id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

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

    // Delete the account
    await UserModel.findByIdAndDelete(id);

    log.info("Admin deleted support account", {
      adminId: admin.user.id,
      supportId: id,
      email: supportAccount.email,
    });

    return NextResponse.json({
      success: true,
      message: "Support account deleted successfully",
    });
  } catch (error) {
    log.error("Error deleting support account:", { error: error as Error });
    return NextResponse.json(
      { error: "Failed to delete support account" },
      { status: 500 }
    );
  }
}
