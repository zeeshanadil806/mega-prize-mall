import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ProductModel, ProductSchema } from "@/models/Product";
import { requireSessionRoles } from '@/shared/http';
import { log } from "@/lib/logger";
import { escapeRegex } from "@/lib/utils";
import { z } from "zod";

type MongoQuery = {
  $or?: Array<{
    name?: { $regex: string; $options: string };
    sku?: { $regex: string; $options: string };
    description?: { $regex: string; $options: string };
  }>;
  category?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  stock?: number;
};

// GET: List products with pagination
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await requireSessionRoles(["admin"]);
    if (!session.ok) return session.response;

    await connectToDatabase();

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const query: MongoQuery = {};

    if (search) {
      const safe = escapeRegex(search);
      query.$or = [
        { name: { $regex: safe, $options: "i" } },
        { sku: { $regex: safe, $options: "i" } },
        { description: { $regex: safe, $options: "i" } },
      ];
    }

    if (category) {
      query.category = category;
    }

    if (status) {
      if (status === "active") query.isActive = true;
      if (status === "inactive") query.isActive = false;
      if (status === "featured") query.isFeatured = true;
      if (status === "out-of-stock") query.stock = 0;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [products, total] = await Promise.all([
      ProductModel.find(query)
        .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ProductModel.countDocuments(query),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    log.info("Products fetched", { count: products.length, page, total });

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    log.error("Error fetching products", { error: error as Error });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Create new product
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await requireSessionRoles(["admin"]);
    if (!session.ok) return session.response;

    await connectToDatabase();

    const body = await request.json();
    // console.log(body.minBargainPrice)

    // Validate input
    const validatedData = ProductSchema.parse({
      ...body,
      // Ensure required fields
      slug: body.slug || generateSlug(body.name),
    });
    console.log(validatedData.minBargainPrice)

    // Check for duplicate SKU or slug
    const existingProduct = await ProductModel.findOne({
      $or: [{ sku: validatedData.sku }, { slug: validatedData.slug }],
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: "Product with this SKU or slug already exists" },
        { status: 409 }
      );
    }
    // Create product
    const product = await ProductModel.create(validatedData);
    log.info("Product created", { productId: product._id, name: product.name });

    return NextResponse.json(
      {
        success: true,
        data: product,
        message: "Product created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log(error)
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    log.error("Error creating product", { error: error as Error });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
}
