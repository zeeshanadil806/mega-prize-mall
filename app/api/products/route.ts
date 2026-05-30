// app/api/products/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ProductModel } from "@/models/Product";
import { Types } from "mongoose";
import { rateLimit } from "@/lib/rate-limit";
import { log } from "@/lib/logger";

const PRODUCTS_RATE_LIMIT = 120; // requests per minute per IP
const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
});

interface ProductQuery {
  isActive: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  category?: string;
}
interface ProductDocument {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  discountedPrice?: number;
  images: Array<{
    id?: string;
    url: string;
    alt?: string;
    order?: number;
    metadata?: {
      width: number;
      height: number;
      size: number;
      format: string;
    };
  }>;
  category: string;
  brand: string;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  bargainEnabled: boolean;
  stock: number;
  purchaseCount?: number;
  bargainCount?: number;
  viewCount?: number;
  createdAt: Date;
  updatedAt: Date;
  sku: string;
  features: string[];
  isActive: boolean;
}

// Transformed product interface for frontend
interface TransformedProduct {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  discountedPrice?: number;
  images: ProductDocument["images"];
  category: string;
  brand: string;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  bargainEnabled: boolean;
  stock: number;
  purchaseCount: number;
  bargainCount: number;
  viewCount: number;
  createdAt: string;
  discountPercentage: number;
  finalPrice: number;
  sku: string;
  features: string[];
}

export async function GET(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const rateLimitResult = limiter.check(PRODUCTS_RATE_LIMIT, ip);
    if (rateLimitResult.isRateLimited) {
      const retryAfter = Math.ceil(
        (rateLimitResult.resetTime - Date.now()) / 1000
      );
      return NextResponse.json(
        { error: "Too many requests", retryAfter },
        {
          status: 429,
          headers: {
            "Retry-After": retryAfter.toString(),
            "X-RateLimit-Limit": String(PRODUCTS_RATE_LIMIT),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": rateLimitResult.resetTime.toString(),
          },
        }
      );
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const featured = searchParams.get("featured");
    const bestSellers = searchParams.get("bestSellers");
    const newArrivals = searchParams.get("new");
    const limit = searchParams.get("limit") || "8";
    const category = searchParams.get("category");

    // Build query
    const query: ProductQuery = { isActive: true }; // Use 'any' or define proper interface

    // Apply filters
    if (featured === "true") {
      query.isFeatured = true;
    }

    if (bestSellers === "true") {
      query.isBestSeller = true;
    }

    if (newArrivals === "true") {
      query.isNewArrival = true;
    }

    if (category) {
      query.category = category;
    }

    // Build sort object
    const sort: Record<string, 1 | -1> = {
      purchaseCount: -1,
      bargainCount: -1,
      createdAt: -1,
      isFeatured: -1,
      isBestSeller: -1,
    };

    if (bestSellers === "true") {
      // Sort best sellers by purchaseCount first, then rating
      sort.purchaseCount = -1;
      sort.bargainCount = -1; // Alternative popularity metric
    } else if (newArrivals === "true") {
      // Sort new arrivals by creation date
      sort.createdAt = -1;
    } else if (featured === "true") {
      // Sort featured by featured status and best seller
      sort.isFeatured = -1;
      sort.isBestSeller = -1;
    } else {
      // Default sorting
      sort.createdAt = -1;
      // sort.isFeatured = -1;
    }

    // Add secondary sort for consistency
    sort.createdAt = -1;

    // Fetch products
    const products = await ProductModel.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .lean();

    // Transform data for frontend
    const transformedProducts: TransformedProduct[] = products.map(
      (product: ProductDocument) => ({
        _id: product._id.toString(),
        name: product.name,
        slug: product.slug,
        description: product.description,
        shortDescription: product.shortDescription,
        price: product.price,
        discountedPrice: product.discountedPrice,
        images: product.images || [],
        category: product.category,
        brand: product.brand,
        isFeatured: product.isFeatured,
        isBestSeller: product.isBestSeller,
        isNewArrival: product.isNewArrival,
        bargainEnabled: product.bargainEnabled,
        stock: product.stock,
        purchaseCount: product.purchaseCount || 0,
        bargainCount: product.bargainCount || 0,
        viewCount: product.viewCount || 0,
        createdAt: product.createdAt
          ? product.createdAt.toISOString()
          : new Date().toISOString(),
        // Calculate discount percentage
        discountPercentage: product.discountedPrice
          ? Math.round(
              ((product.price - product.discountedPrice) / product.price) * 100,
            )
          : 0,
        finalPrice: product.discountedPrice || product.price,
        sku: product.sku,
        features: product.features || [],
      }),
    );

    return NextResponse.json(transformedProducts);
  } catch (error) {
    log.error("Error fetching products", { error: error as Error });
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}
