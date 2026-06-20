// Product repository — every DB access for the product domain.
//
// Returns Mongoose-shaped raw documents (or .lean() shapes typed via
// RawProduct). Domain transforms (sanitizeImages, transformProduct-
// ForCustomer) live in ./domain.ts; service layer combines the two.

import { ProductModel } from "@/models/Product";
import { escapeRegex } from "@/lib/utils";
import { resolveCategoryQuery } from "./domain";
import type {
  RawProduct,
  ProductListingFilters,
  ListingProductForSchema,
  CategoryStat,
} from "./domain";

// ─── Reads scoped to "active product catalog" ──────────────────────

export function findDistinctActiveCategories(): Promise<string[]> {
  return ProductModel.distinct("category", { isActive: true }).exec();
}

export async function findActiveProductPriceRange(): Promise<{
  min: number;
  max: number;
}> {
  const [minDoc, maxDoc] = await Promise.all([
    ProductModel.findOne({ isActive: true })
      .sort({ price: 1 })
      .select("price")
      .lean<{ price: number }>(),
    ProductModel.findOne({ isActive: true })
      .sort({ price: -1 })
      .select("price")
      .lean<{ price: number }>(),
  ]);
  return {
    min: minDoc?.price || 0,
    max: maxDoc?.price || 10000,
  };
}

export function findFeaturedProducts(limit: number): Promise<RawProduct[]> {
  return ProductModel.find({ isActive: true, isFeatured: true })
    .sort({ isFeatured: -1, isBestSeller: -1, createdAt: -1 })
    .limit(limit)
    .lean<RawProduct[]>();
}

export function findNewArrivalProducts(limit: number): Promise<RawProduct[]> {
  return ProductModel.find({ isActive: true, isNewArrival: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean<RawProduct[]>();
}

export function findBargainProducts(limit: number): Promise<RawProduct[]> {
  return ProductModel.find({ isActive: true, bargainEnabled: true })
    .sort({ bargainCount: -1, createdAt: -1 })
    .limit(limit)
    .lean<RawProduct[]>();
}

export function aggregateCategoryStats(): Promise<CategoryStat[]> {
  return ProductModel.aggregate<CategoryStat>([
    { $match: { isActive: true } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $project: { _id: 0, category: "$_id", count: 1 } },
    { $sort: { count: -1 } },
  ]).exec();
}

// ─── Listing filter query used by /products page + JSON-LD schema ──

/** Builds the same MongoDB filter that the customer-facing ProductGrid
 *  applies, so server-side JSON-LD matches what the user sees. Returns
 *  the trimmed listing-shape (only the schema-relevant fields) plus
 *  the total match count for pagination. */
export async function findProductsForListing(
  filters: ProductListingFilters,
  limit: number,
): Promise<{ products: ListingProductForSchema[]; totalCount: number }> {
  const query: Record<string, unknown> = { isActive: true };

  if (filters.category) {
    query.category = resolveCategoryQuery(filters.category);
  }
  if (filters.bargain === "true") query.bargainEnabled = true;
  if (filters.minPrice || filters.maxPrice) {
    const price: { $gte?: number; $lte?: number } = {};
    if (filters.minPrice) price.$gte = parseFloat(filters.minPrice);
    if (filters.maxPrice) price.$lte = parseFloat(filters.maxPrice);
    query.price = price;
  }
  if (filters.search) {
    const safe = escapeRegex(filters.search);
    query.$or = [
      { name: { $regex: safe, $options: "i" } },
      { description: { $regex: safe, $options: "i" } },
      { tags: { $regex: safe, $options: "i" } },
    ];
  }

  const [products, totalCount] = await Promise.all([
    ProductModel.find(query)
      .select("name slug price discountedPrice stock bargainEnabled")
      .limit(limit)
      .lean<ListingProductForSchema[]>(),
    ProductModel.countDocuments(query),
  ]);

  return { products, totalCount };
}
