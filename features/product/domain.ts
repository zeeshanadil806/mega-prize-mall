// Product domain — pure transforms and presentational helpers.
//
// No DB access. Functions either reshape raw documents into the
// client-facing wire format (transformProductForCustomer,
// sanitizeImages) or compute UI helpers (generatePaginationLinks).
// Moved from lib/home-products.ts (private internals) + lib/
// product-utils.ts as part of Phase 2.

import type { Types } from "mongoose";
import type { CustomerProductProps, ImageProps } from "@/types";

// ─── Wire-shape transform for homepage/listing components ──────────

// Image sub-docs in Mongoose carry an ObjectId `_id` that React Server
// Components can't serialize across the boundary, so we strip it in
// transformProductForCustomer below.
export interface RawImage {
  _id?: Types.ObjectId;
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
}

export interface RawProduct {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  discountedPrice?: number;
  costPrice?: number;
  images?: RawImage[];
  category: string;
  tags?: string[];
  brand: string;
  sku: string;
  stock: number;
  features?: string[];
  specifications?: Record<string, string>;
  color?: string;
  bargainEnabled: boolean;
  minBargainPrice?: number;
  maxBargainRounds?: number;
  bargainValidityHours?: number;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  isActive: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  purchaseCount?: number;
  bargainCount?: number;
  viewCount?: number;
  createdAt: Date;
  updatedAt?: Date;
}

export function sanitizeImages(images?: RawImage[]): ImageProps[] {
  if (!images) return [];
  return images.map((img, idx) => ({
    // Prefer the author-supplied stable `id`; fall back to ObjectId
    // string, then to index, so the wire object never carries a
    // Mongoose ObjectId.
    id: img.id ?? img._id?.toString() ?? String(idx),
    url: img.url,
    alt: img.alt,
    order: img.order ?? idx,
    metadata: img.metadata ?? { width: 0, height: 0, size: 0, format: "" },
  }));
}

export function transformProductForCustomer(
  p: RawProduct,
): CustomerProductProps {
  return {
    _id: p._id.toString(),
    name: p.name,
    slug: p.slug,
    description: p.description,
    shortDescription: p.shortDescription ?? "",
    price: p.price,
    discountedPrice: p.discountedPrice ?? 0,
    costPrice: p.costPrice ?? 0,
    category: p.category,
    tags: p.tags ?? [],
    brand: p.brand,
    sku: p.sku,
    stock: p.stock,
    features: p.features ?? [],
    specifications: p.specifications ?? {},
    color: p.color ?? "",
    bargainEnabled: p.bargainEnabled,
    minBargainPrice: p.minBargainPrice ?? 0,
    maxBargainRounds: p.maxBargainRounds ?? 0,
    bargainValidityHours: p.bargainValidityHours ?? 24,
    images: sanitizeImages(p.images),
    metaTitle: p.metaTitle ?? "",
    metaDescription: p.metaDescription ?? "",
    keywords: p.keywords ?? [],
    isActive: p.isActive,
    isFeatured: p.isFeatured,
    isBestSeller: p.isBestSeller,
    isNewArrival: p.isNewArrival,
    purchaseCount: p.purchaseCount ?? 0,
    bargainCount: p.bargainCount ?? 0,
    viewCount: p.viewCount ?? 0,
    createdAt: p.createdAt
      ? p.createdAt.toISOString()
      : new Date().toISOString(),
    discountPercentage: p.discountedPrice
      ? Math.round(((p.price - p.discountedPrice) / p.price) * 100)
      : 0,
  };
}

// ─── Pagination links helper ───────────────────────────────────────
//
// Builds a list of pagination entries — first, last, current ± 2,
// ellipses where appropriate. Returns `{ page: number | "...", url,
// isCurrent }`. Pure: no I/O, deterministic from inputs.

export function generatePaginationLinks(
  currentPage: number,
  totalPages: number,
  baseUrl: string,
): Array<{ page: number | string; url: string; isCurrent: boolean }> {
  const links: Array<{ page: number | string; url: string; isCurrent: boolean }> = [];

  // Always show first page
  links.push({
    page: 1,
    url: `${baseUrl}?page=1`,
    isCurrent: currentPage === 1,
  });

  let startPage = Math.max(2, currentPage - 2);
  let endPage = Math.min(totalPages - 1, currentPage + 2);

  if (currentPage <= 3) {
    endPage = Math.min(5, totalPages - 1);
  }
  if (currentPage >= totalPages - 2) {
    startPage = Math.max(2, totalPages - 4);
  }

  if (startPage > 2) {
    links.push({ page: "...", url: "#", isCurrent: false });
  }

  for (let i = startPage; i <= endPage; i++) {
    links.push({
      page: i,
      url: `${baseUrl}?page=${i}`,
      isCurrent: i === currentPage,
    });
  }

  if (endPage < totalPages - 1) {
    links.push({ page: "...", url: "#", isCurrent: false });
  }

  if (totalPages > 1) {
    links.push({
      page: totalPages,
      url: `${baseUrl}?page=${totalPages}`,
      isCurrent: currentPage === totalPages,
    });
  }

  return links;
}

// ─── Listing-page wire types ───────────────────────────────────────

export interface ProductListingFilters {
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  search?: string;
  bargain?: string;
}

export interface ListingProductForSchema {
  name: string;
  slug: string;
  price: number;
  discountedPrice?: number;
  stock: number;
  bargainEnabled: boolean;
}

export interface CategoryStat {
  category: string;
  count: number;
}

export const CATEGORY_MAPPING: Record<string, string[]> = {
  "Mobile Accessories": [
    "Mobile Accessories",
    "Mobile Holders",
    "Mobile Cases",
    "Screen Protectors"
  ],
  "Audio and Multimedia": [
    "Audio and Multimedia",
    "Earphones and Headphones"
  ],
  "Gaming Accessories": [
    "Gaming Accessories"
  ],
  "PC and Laptop Accessories": [
    "PC and Laptop Accessories",
    "PC and Laptop"
  ],
  "PC and Laptop": [
    "PC and Laptop Accessories",
    "PC and Laptop"
  ],
  "Power and Charging": [
    "Power Charging",
    "Power Banks",
    "Chargers and Cables",
    "Chargers & Cables",
    "Power and Charging"
  ],
  "Power Charging": [
    "Power Charging",
    "Power Banks",
    "Chargers and Cables",
    "Chargers & Cables",
    "Power and Charging"
  ],
  "Smart Wearables": [
    "Smart Wearables",
    "Smart Watches"
  ],
  "Other Accessories": [
    "Other Accessories",
    "Content Creation and Vlogging",
    "TV Accessories"
  ]
};

export function resolveCategoryQuery(category: string) {
  const matchedKey = Object.keys(CATEGORY_MAPPING).find(
    (key) => key.toLowerCase() === category.toLowerCase()
  );
  if (matchedKey) {
    return { $in: CATEGORY_MAPPING[matchedKey] };
  }
  return category;
}

export function getGroupedCategoryStats(stats: CategoryStat[]): CategoryStat[] {
  const groupedMap: Record<string, number> = {};

  Object.keys(CATEGORY_MAPPING).forEach((parentKey) => {
    if (parentKey === "PC and Laptop" || parentKey === "Power Charging") return;
    groupedMap[parentKey] = 0;
  });

  (stats || []).forEach((stat) => {
    const dbName = stat.category;
    const foundParent = Object.entries(CATEGORY_MAPPING).find(([parent, subList]) =>
      subList.some((sub) => sub.toLowerCase() === dbName.toLowerCase())
    );

    if (foundParent) {
      let parentKey = foundParent[0];
      if (parentKey === "PC and Laptop") parentKey = "PC and Laptop Accessories";
      if (parentKey === "Power Charging") parentKey = "Power and Charging";

      groupedMap[parentKey] = (groupedMap[parentKey] || 0) + stat.count;
    } else {
      groupedMap["Other Accessories"] = (groupedMap["Other Accessories"] || 0) + stat.count;
    }
  });

  return Object.entries(groupedMap)
    .map(([category, count]) => ({ category, count }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);
}
