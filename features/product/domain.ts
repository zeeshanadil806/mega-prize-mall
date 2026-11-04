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

export interface MegaMenuProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  imageUrl: string;
  bargainEnabled: boolean;
  category?: string;
  brand?: string;
  tag?: string;
  rating?: number;
}

export interface CategoryStat {
  category: string;
  count: number;
}

export const CANONICAL_CATEGORIES = [
  "Mobile Accessories",
  "Audio and Multimedia",
  "Smart Wearables",
  "Power and Charging",
  "Gaming Accessories",
  "PC and Laptop Accessories",
  "Other Accessories",
] as const;

export const CATEGORY_MAPPING: Record<string, string[]> = {
  // Mobile Accessories (Holders, Mounts, Cases, Protectors) — 60 active products
  "Mobile Accessories": [
    "Mobile Accessories",
    "Mobile Holders",
    "Mobile Cases",
    "Screen Protectors",
  ],
  "Mobile & Holders": [
    "Mobile Accessories",
    "Mobile Holders",
    "Mobile Cases",
    "Screen Protectors",
  ],
  "Mobile Cases": [
    "Mobile Accessories",
    "Mobile Holders",
    "Mobile Cases",
    "Screen Protectors",
  ],
  "Mobile Holders": [
    "Mobile Holders",
  ],
  "Holders": [
    "Mobile Holders",
  ],
  "Screen Protectors": [
    "Screen Protectors",
  ],

  // Audio and Multimedia (Headphones, Earbuds, Speakers) — 46 active products
  "Audio and Multimedia": [
    "Audio and Multimedia",
    "Earphones and Headphones",
  ],
  "Audio & Multimedia": [
    "Audio and Multimedia",
    "Earphones and Headphones",
  ],
  "Earphones and Headphones": [
    "Audio and Multimedia",
    "Earphones and Headphones",
  ],
  "Earbuds & Audio": [
    "Audio and Multimedia",
    "Earphones and Headphones",
  ],
  "Earbuds": [
    "Audio and Multimedia",
    "Earphones and Headphones",
  ],
  "Audio": [
    "Audio and Multimedia",
    "Earphones and Headphones",
  ],

  // Smart Wearables (Smart Watches, Fitness Trackers) — 20 active products
  "Smart Wearables": [
    "Smart Wearables",
    "Smart Watches",
  ],
  "Smart Watches": [
    "Smart Wearables",
    "Smart Watches",
  ],
  "Smartwatches": [
    "Smart Wearables",
    "Smart Watches",
  ],
  "Watches": [
    "Smart Wearables",
    "Smart Watches",
  ],

  // Power and Charging (Chargers, Cables, Power Banks) — 14 active products
  "Power and Charging": [
    "Power Charging",
    "Power Banks",
    "Chargers and Cables",
    "Chargers & Cables",
    "Power and Charging",
  ],
  "Power & Charging": [
    "Power Charging",
    "Power Banks",
    "Chargers and Cables",
    "Chargers & Cables",
    "Power and Charging",
  ],
  "Power Charging": [
    "Power Charging",
    "Power Banks",
    "Chargers and Cables",
    "Chargers & Cables",
    "Power and Charging",
  ],
  "Chargers and Cables": [
    "Chargers and Cables",
    "Chargers & Cables",
    "Power Banks",
    "Power and Charging",
    "Power Charging",
  ],
  "Chargers & Cables": [
    "Chargers and Cables",
    "Chargers & Cables",
    "Power Banks",
    "Power and Charging",
    "Power Charging",
  ],
  "Power Banks": [
    "Power Banks",
  ],
  "Power": [
    "Power Charging",
    "Power Banks",
    "Chargers and Cables",
    "Chargers & Cables",
    "Power and Charging",
  ],
  "Chargers": [
    "Chargers and Cables",
    "Chargers & Cables",
    "Power and Charging",
    "Power Charging",
  ],

  // Gaming Accessories — 11 active products
  "Gaming Accessories": [
    "Gaming Accessories",
  ],
  "Gaming Gear": [
    "Gaming Accessories",
  ],
  "Gaming": [
    "Gaming Accessories",
  ],

  // PC and Laptop Accessories — 3 active products
  "PC and Laptop Accessories": [
    "PC and Laptop Accessories",
    "PC and Laptop",
  ],
  "PC & Laptop Accessories": [
    "PC and Laptop Accessories",
    "PC and Laptop",
  ],
  "PC and Laptop": [
    "PC and Laptop Accessories",
    "PC and Laptop",
  ],
  "PC & Laptop": [
    "PC and Laptop Accessories",
    "PC and Laptop",
  ],
  "PC & Laptops": [
    "PC and Laptop Accessories",
    "PC and Laptop",
  ],
  "Laptops": [
    "PC and Laptop Accessories",
    "PC and Laptop",
  ],

  // Other Accessories — 51 active products
  "Other Accessories": [
    "Other Accessories",
    "Content Creation and Vlogging",
    "TV Accessories",
  ],
  "Accessories": [
    "Other Accessories",
    "Content Creation and Vlogging",
    "TV Accessories",
  ],
  "Content Creation and Vlogging": [
    "Content Creation and Vlogging",
  ],
  "Content Creation": [
    "Content Creation and Vlogging",
  ],
  "TV Accessories": [
    "TV Accessories",
  ],
};

export function resolveCategoryQuery(category: string): { $in: string[] } | string {
  if (!category) return category;
  const decoded = decodeURIComponent(category).trim();
  const matchedKey = Object.keys(CATEGORY_MAPPING).find(
    (key) => key.toLowerCase() === decoded.toLowerCase()
  );
  if (matchedKey) {
    return { $in: CATEGORY_MAPPING[matchedKey] };
  }
  return decoded;
}

export function getGroupedCategoryStats(stats: CategoryStat[]): CategoryStat[] {
  const groupedMap: Record<string, number> = {};

  CANONICAL_CATEGORIES.forEach((parentKey) => {
    groupedMap[parentKey] = 0;
  });

  (stats || []).forEach((stat) => {
    const dbName = stat.category;
    const lowerDb = dbName.toLowerCase();
    if (
      lowerDb.includes("holder") ||
      lowerDb === "mobile accessories" ||
      lowerDb === "mobile cases" ||
      lowerDb === "screen protectors"
    ) {
      groupedMap["Mobile Accessories"] += stat.count;
    } else if (
      lowerDb.includes("earphone") ||
      lowerDb.includes("headphone") ||
      lowerDb.includes("audio") ||
      lowerDb.includes("multimedia")
    ) {
      groupedMap["Audio and Multimedia"] += stat.count;
    } else if (
      lowerDb.includes("wearable") ||
      lowerDb.includes("watch")
    ) {
      groupedMap["Smart Wearables"] += stat.count;
    } else if (
      lowerDb.includes("power") ||
      lowerDb.includes("charger") ||
      lowerDb.includes("cable")
    ) {
      groupedMap["Power and Charging"] += stat.count;
    } else if (lowerDb.includes("gaming")) {
      groupedMap["Gaming Accessories"] += stat.count;
    } else if (
      lowerDb.includes("pc") ||
      lowerDb.includes("laptop")
    ) {
      groupedMap["PC and Laptop Accessories"] += stat.count;
    } else {
      groupedMap["Other Accessories"] += stat.count;
    }
  });

  return Object.entries(groupedMap)
    .map(([category, count]) => ({ category, count }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);
}
