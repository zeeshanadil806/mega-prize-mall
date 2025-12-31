// app/api/user/addresses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { AddressModel } from "@/models/Address";
import { Types } from "mongoose";
import { z } from "zod";
import { log } from "@/lib/logger";

// Validation schemas
const createAddressSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(100),
  phone: z.string().min(1, "Phone number is required").max(20),
  addressLine1: z.string().min(1, "Address line 1 is required").max(200),
  addressLine2: z.string().max(200).optional(),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().min(1, "State is required").max(100),
  postalCode: z.string().min(1, "Postal code is required").max(20),
  country: z.string().default("Pakistan"),
  isDefault: z.boolean().default(false),
  label: z.enum(["home", "work", "other"]).default("home"),
});

const updateAddressSchema = createAddressSchema.partial();

// Helper to validate ObjectId
const isValidObjectId = (id: string): boolean => {
  return Types.ObjectId.isValid(id);
};

// GET: Fetch user addresses
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
console.log("session...",session)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const userId = new Types.ObjectId(session.user.id);
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("activeOnly") !== "false";

    interface IAddress {
      userId: Types.ObjectId;
      isActive?: boolean;
      // Add other fields if you filter by them later
    }
    // Build query
    const query: IAddress = { userId };
    if (activeOnly) {
      query.isActive = true;
    }

    const addresses = await AddressModel.find(query)
      .sort({ isDefault: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: addresses,
      count: addresses.length,
    });
  } catch (error) {
    log.error("Failed to fetch addresses", { error: error as Error });
    return NextResponse.json(
      { success: false, error: "Failed to fetch addresses" },
      { status: 500 }
    );
  }
}

// POST: Create new address
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = new Types.ObjectId(session.user.id);
    const body = await request.json();

    // Validate input
    const validatedData = createAddressSchema.parse(body);

    await connectToDatabase();

    // Check address limit (max 10 addresses per user)
    const addressCount = await AddressModel.countDocuments({
      userId,
      isActive: true,
    });

    if (addressCount >= 10) {
      return NextResponse.json(
        {
          success: false,
          error: "Address limit reached. Maximum 10 addresses allowed.",
        },
        { status: 400 }
      );
    }

    // If setting as default, unset other defaults
    if (validatedData.isDefault) {
      await AddressModel.updateMany(
        { userId, isDefault: true },
        { $set: { isDefault: false } }
      );
    }

    // Create new address
    const address = await AddressModel.create({
      userId,
      ...validatedData,
    });

    log.info("Address created", {
      userId: session.user.id,
      addressId: address._id,
      isDefault: address.isDefault,
    });

    return NextResponse.json(
      {
        success: true,
        data: address,
        message: "Address saved successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    log.error("Failed to create address", { error: error as Error });
    return NextResponse.json(
      { success: false, error: "Failed to save address" },
      { status: 500 }
    );
  }
}

// PUT: Update address
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = new Types.ObjectId(session.user.id);
    const { searchParams } = new URL(request.url);
    const addressId = searchParams.get("id");

    if (!addressId) {
      return NextResponse.json(
        { success: false, error: "Address ID is required" },
        { status: 400 }
      );
    }

    if (!isValidObjectId(addressId)) {
      return NextResponse.json(
        { success: false, error: "Invalid address ID format" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = updateAddressSchema.parse(body);

    await connectToDatabase();

    // Find address
    const address = await AddressModel.findOne({
      _id: new Types.ObjectId(addressId),
      userId,
    });

    if (!address) {
      return NextResponse.json(
        { success: false, error: "Address not found" },
        { status: 404 }
      );
    }

    // If setting as default, unset other defaults
    if (validatedData.isDefault === true && !address.isDefault) {
      await AddressModel.updateMany(
        {
          userId,
          _id: { $ne: address._id },
          isDefault: true,
        },
        { $set: { isDefault: false } }
      );
    }

    // Update address
    Object.assign(address, validatedData);
    await address.save();

    log.info("Address updated", {
      userId: session.user.id,
      addressId,
      updates: Object.keys(validatedData),
    });

    return NextResponse.json({
      success: true,
      data: address,
      message: "Address updated successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    log.error("Failed to update address", { error: error as Error });
    return NextResponse.json(
      { success: false, error: "Failed to update address" },
      { status: 500 }
    );
  }
}

// DELETE: Soft delete address
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = new Types.ObjectId(session.user.id);
    const { searchParams } = new URL(request.url);
    const addressId = searchParams.get("id");

    if (!addressId) {
      return NextResponse.json(
        { success: false, error: "Address ID is required" },
        { status: 400 }
      );
    }

    if (!isValidObjectId(addressId)) {
      return NextResponse.json(
        { success: false, error: "Invalid address ID format" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find address
    const address = await AddressModel.findOne({
      _id: new Types.ObjectId(addressId),
      userId,
      isActive: true,
    });

    if (!address) {
      return NextResponse.json(
        { success: false, error: "Address not found or already deleted" },
        { status: 404 }
      );
    }

    // Soft delete by setting isActive to false
    address.isActive = false;
    address.isDefault = false;
    await address.save();

    // If this was the default address, set another as default
    if (address.isDefault) {
      const newDefault = await AddressModel.findOne({
        userId,
        _id: { $ne: address._id },
        isActive: true,
      }).sort({ createdAt: -1 });

      if (newDefault) {
        newDefault.isDefault = true;
        await newDefault.save();
      }
    }

    log.info("Address deleted", {
      userId: session.user.id,
      addressId,
    });

    return NextResponse.json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    log.error("Failed to delete address", { error: error as Error });
    return NextResponse.json(
      { success: false, error: "Failed to delete address" },
      { status: 500 }
    );
  }
}
