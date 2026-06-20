// Product service — combines repository fetches with domain
// transforms to produce the homepage- and listing-ready shapes the
// page components consume.
//
// Caching: getCategories + getPriceRange retain the original 5-minute
// in-memory cache from lib/product-utils.ts. It's a per-process
// optimization for two values that change very infrequently (admin
// product CRUD). The cache survives Phase 2 because behavior must
// stay identical; a later turn can replace it with Next.js
// `revalidate` / `unstable_cache` for proper edge-cache integration.

import { cache } from "react";
import { connectToDatabase } from "@/lib/mongodb";
import { transformProductForCustomer, getGroupedCategoryStats } from "./domain";
import type {
  ProductListingFilters,
  ListingProductForSchema,
  CategoryStat,
} from "./domain";
import {
  findDistinctActiveCategories,
  findActiveProductPriceRange,
  findFeaturedProducts,
  findNewArrivalProducts,
  findBargainProducts,
  aggregateCategoryStats,
  findProductsForListing,
} from "./repository";
import type { CustomerProductProps } from "@/types";

// ─── In-process cache for low-change reads ─────────────────────────

const CACHE_DURATION = 5 * 60 * 1000;
let cachedCategories: string[] | null = null;
let cachedPriceRange: { min: number; max: number } | null = null;
let cacheTimestamp = 0;

export async function getCategories(): Promise<string[]> {
  const now = Date.now();
  if (cachedCategories && now - cacheTimestamp < CACHE_DURATION) {
    return cachedCategories;
  }
  await connectToDatabase();
  cachedCategories = await findDistinctActiveCategories();
  cacheTimestamp = now;
  return cachedCategories;
}

export async function getPriceRange(): Promise<{ min: number; max: number }> {
  const now = Date.now();
  if (cachedPriceRange && now - cacheTimestamp < CACHE_DURATION) {
    return cachedPriceRange;
  }
  await connectToDatabase();
  cachedPriceRange = await findActiveProductPriceRange();
  cacheTimestamp = now;
  return cachedPriceRange;
}

// ─── Homepage section fetchers ─────────────────────────────────────

export async function getFeaturedProducts(
  limit = 12,
): Promise<CustomerProductProps[]> {
  await connectToDatabase();
  const rows = await findFeaturedProducts(limit);
  return rows.map(transformProductForCustomer);
}

export async function getNewArrivals(
  limit = 5,
): Promise<CustomerProductProps[]> {
  await connectToDatabase();
  const rows = await findNewArrivalProducts(limit);
  return rows.map(transformProductForCustomer);
}

export async function getBargainProducts(
  limit = 4,
): Promise<CustomerProductProps[]> {
  await connectToDatabase();
  const rows = await findBargainProducts(limit);
  return rows.map(transformProductForCustomer);
}

export const getCategoryStats = cache(async (): Promise<CategoryStat[]> => {
  await connectToDatabase();
  const stats = await aggregateCategoryStats();
  return getGroupedCategoryStats(stats);
});

// ─── Listing-page fetch (matches ProductGrid filter) ───────────────

export async function getProductsForListingSchema(
  filters: ProductListingFilters,
  limit = 24,
): Promise<{ products: ListingProductForSchema[]; totalCount: number }> {
  await connectToDatabase();
  return findProductsForListing(filters, limit);
}
