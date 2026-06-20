// src/app/api/admin/support/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { requireAdmin } from '@/shared/http';
import { z } from "zod";
import { log } from "@/lib/logger";
import { escapeRegex } from "@/lib/utils";
import bcrypt from "bcryptjs";

// Schema for creating support account
const createSupportSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
  isActive: z.boolean().default(true),
});

// Schema for updating support account
// const updateSupportSchema = z.object({
//   name: z.string().min(2).max(50).optional(),
//   phone: z.string().optional(),
//   isActive: z.boolean().optional(),
// });

// GET all support accounts
export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return admin.response;
    
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const isActive = searchParams.get("isActive");
    interface SupportUserQuery {
  role: "support";
  isActive?: boolean;
  $or?: Array<
    | { name: { $regex: string; $options: string } }
    | { email: { $regex: string; $options: string } }
    | { phone: { $regex: string; $options: string } }
  >;
}
    // Build query for support accounts only
    const query: SupportUserQuery = { role: "support" };
    
    if (search) {
      const safe = escapeRegex(search);
      query.$or = [
        { name: { $regex: safe, $options: "i" } },
        { email: { $regex: safe, $options: "i" } },
        { phone: { $regex: safe, $options: "i" } },
      ];
    }
    
    if (isActive) {
      query.isActive = isActive === "true";
    }
    
    const skip = (page - 1) * limit;
    
    const [supportAccounts, total] = await Promise.all([
      UserModel.find(query)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      UserModel.countDocuments(query),
    ]);
    
    // Format response
    const formattedAccounts = supportAccounts.map((account) => ({
      id: account._id.toString(),
      name: account.name,
      email: account.email,
      phone: account.phone,
      role: account.role,
      isActive: account.isActive !== false, // Default to true if not set
      points: account.points || 0,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
      lastLogin: account.lastLogin,
    }));
    
    return NextResponse.json({
      success: true,
      data: {
        accounts: formattedAccounts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
    
  } catch (error) {
    log.error("Error fetching support accounts:", { error: error as Error });
    return NextResponse.json(
      { error: "Failed to fetch support accounts" },
      { status: 500 }
    );
  }
}

// POST - Create new support account
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return admin.response;
    
    await connectToDatabase();
    
    const body = await request.json();
    const validatedData = createSupportSchema.parse(body);
    
    // Check if user already exists
    const existingUser = await UserModel.findOne({ 
      email: validatedData.email 
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);
    
    // Create support account
    const supportAccount = await UserModel.create({
      name: validatedData.name,
      email: validatedData.email,
      password: hashedPassword,
      phone: validatedData.phone,
      role: "support",
      isActive: validatedData.isActive,
      emailVerified: new Date(), // Auto-verify for support accounts
      points: 0,
    });
    
    // Remove password from response
    const responseData = {
      id: supportAccount._id.toString(),
      name: supportAccount.name,
      email: supportAccount.email,
      phone: supportAccount.phone,
      role: supportAccount.role,
      isActive: supportAccount.isActive,
      createdAt: supportAccount.createdAt,
      updatedAt: supportAccount.updatedAt,
    };
    
    log.info("Admin created support account", {
      adminId: admin.user.id,
      supportId: supportAccount._id.toString(),
      email: supportAccount.email,
    });
    
    return NextResponse.json(
      {
        success: true,
        message: "Support account created successfully",
        data: responseData,
      },
      { status: 201 }
    );
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    
    log.error("Error creating support account:", { error: error as Error });
    return NextResponse.json(
      { error: "Failed to create support account" },
      { status: 500 }
    );
  }
}