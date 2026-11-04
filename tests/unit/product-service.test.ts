import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock-based unit tests for the product service.
//
// Locks the 5-minute in-process cache (getCategories, getPriceRange)
// and verifies that the listing/homepage fetchers delegate to the
// repository and run results through transformProductForCustomer.
// Cache state is module-level inside the service, so the import is
// reset between tests via vi.resetModules to keep tests independent.

const mockFindDistinctActiveCategories = vi.fn();
const mockFindActiveProductPriceRange = vi.fn();
const mockFindFeaturedProducts = vi.fn();
const mockFindNewArrivalProducts = vi.fn();
const mockFindBargainProducts = vi.fn();
const mockAggregateCategoryStats = vi.fn();
const mockFindProductsForListing = vi.fn();

vi.mock("@/features/product/repository", () => ({
  findDistinctActiveCategories: (...a: unknown[]) =>
    mockFindDistinctActiveCategories(...a),
  findActiveProductPriceRange: (...a: unknown[]) =>
    mockFindActiveProductPriceRange(...a),
  findFeaturedProducts: (...a: unknown[]) => mockFindFeaturedProducts(...a),
  findNewArrivalProducts: (...a: unknown[]) => mockFindNewArrivalProducts(...a),
  findBargainProducts: (...a: unknown[]) => mockFindBargainProducts(...a),
  aggregateCategoryStats: (...a: unknown[]) => mockAggregateCategoryStats(...a),
  findProductsForListing: (...a: unknown[]) => mockFindProductsForListing(...a),
}));

const mockConnectToDatabase = vi.fn().mockResolvedValue(undefined);
vi.mock("@/lib/mongodb", () => ({
  connectToDatabase: () => mockConnectToDatabase(),
}));

// Helper: fresh module each test so cache state doesn't leak.
async function freshService() {
  vi.resetModules();
  return await import("@/features/product/service");
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
});

// ─── Minimal product fixture for transform-passthrough tests ─────

const RAW_PRODUCT = {
  _id: { toString: () => "p1" },
  name: "P1",
  slug: "p1",
  description: "d",
  price: 1000,
  category: "C",
  brand: "B",
  sku: "S",
  stock: 5,
  bargainEnabled: true,
  isActive: true,
  isFeatured: false,
  isBestSeller: false,
  isNewArrival: false,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
};

// ─── getCategories (cached) ──────────────────────────────────────

describe("getCategories — cache", () => {
  it("hits the repository on the first call and caches the result", async () => {
    mockFindDistinctActiveCategories.mockResolvedValue(["A", "B"]);
    const { getCategories } = await freshService();
    const result = await getCategories();
    expect(result).toEqual(["A", "B"]);
    expect(mockFindDistinctActiveCategories).toHaveBeenCalledTimes(1);
    expect(mockConnectToDatabase).toHaveBeenCalledTimes(1);
  });

  it("returns the cached value on subsequent calls within 5 minutes", async () => {
    mockFindDistinctActiveCategories.mockResolvedValue(["A", "B"]);
    const { getCategories } = await freshService();
    await getCategories();
    await getCategories();
    await getCategories();
    expect(mockFindDistinctActiveCategories).toHaveBeenCalledTimes(1);
  });

  it("re-fetches after the 5-minute cache window expires", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 5, 12, 0, 0));
    mockFindDistinctActiveCategories.mockResolvedValueOnce(["A"]);
    const { getCategories } = await freshService();
    const first = await getCategories();
    expect(first).toEqual(["A"]);

    // Advance just past the 5-minute window.
    vi.setSystemTime(new Date(2026, 5, 5, 12, 5, 1));
    mockFindDistinctActiveCategories.mockResolvedValueOnce(["A", "B"]);
    const second = await getCategories();
    expect(second).toEqual(["A", "B"]);
    expect(mockFindDistinctActiveCategories).toHaveBeenCalledTimes(2);
  });
});

// ─── getPriceRange (cached) ──────────────────────────────────────

describe("getPriceRange — cache", () => {
  it("returns the repository value and caches it", async () => {
    mockFindActiveProductPriceRange.mockResolvedValue({ min: 100, max: 5000 });
    const { getPriceRange } = await freshService();
    const r1 = await getPriceRange();
    const r2 = await getPriceRange();
    expect(r1).toEqual({ min: 100, max: 5000 });
    expect(r2).toEqual({ min: 100, max: 5000 });
    expect(mockFindActiveProductPriceRange).toHaveBeenCalledTimes(1);
  });

  it("re-fetches after the cache window expires", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 5, 12, 0, 0));
    mockFindActiveProductPriceRange.mockResolvedValueOnce({ min: 100, max: 200 });
    const { getPriceRange } = await freshService();
    await getPriceRange();
    vi.setSystemTime(new Date(2026, 5, 5, 12, 5, 1));
    mockFindActiveProductPriceRange.mockResolvedValueOnce({ min: 300, max: 400 });
    const result = await getPriceRange();
    expect(result).toEqual({ min: 300, max: 400 });
  });
});

// ─── Homepage section fetchers ───────────────────────────────────

describe("getFeaturedProducts", () => {
  it("delegates to repository with the supplied limit and transforms results", async () => {
    mockFindFeaturedProducts.mockResolvedValue([RAW_PRODUCT]);
    const { getFeaturedProducts } = await freshService();
    const result = await getFeaturedProducts(8);
    expect(mockFindFeaturedProducts).toHaveBeenCalledWith(8);
    expect(result).toHaveLength(1);
    expect(result[0]._id).toBe("p1"); // ObjectId.toString() applied
    expect(result[0].discountPercentage).toBe(0);
  });

  it("defaults limit to 12 when not supplied", async () => {
    mockFindFeaturedProducts.mockResolvedValue([]);
    const { getFeaturedProducts } = await freshService();
    await getFeaturedProducts();
    expect(mockFindFeaturedProducts).toHaveBeenCalledWith(12);
  });
});

describe("getNewArrivals", () => {
  it("defaults limit to 5 when not supplied", async () => {
    mockFindNewArrivalProducts.mockResolvedValue([]);
    const { getNewArrivals } = await freshService();
    await getNewArrivals();
    expect(mockFindNewArrivalProducts).toHaveBeenCalledWith(5);
  });

  it("transforms each row through the customer wire shape", async () => {
    mockFindNewArrivalProducts.mockResolvedValue([
      { ...RAW_PRODUCT, discountedPrice: 800 },
    ]);
    const { getNewArrivals } = await freshService();
    const result = await getNewArrivals(3);
    expect(result[0].discountPercentage).toBe(20);
    expect(result[0].discountedPrice).toBe(800);
  });
});

describe("getBargainProducts", () => {
  it("defaults limit to 4 when not supplied", async () => {
    mockFindBargainProducts.mockResolvedValue([]);
    const { getBargainProducts } = await freshService();
    await getBargainProducts();
    expect(mockFindBargainProducts).toHaveBeenCalledWith(4);
  });
});

// ─── getCategoryStats (grouped) ──────────────────────────────────

describe("getCategoryStats", () => {
  it("returns grouped category stats from repository aggregation", async () => {
    const stats = [
      { category: "Mobile", count: 12 },
      { category: "Audio", count: 7 },
    ];
    mockAggregateCategoryStats.mockResolvedValue(stats);
    const { getCategoryStats } = await freshService();
    const result = await getCategoryStats();
    expect(result).toBeDefined();
    expect(mockAggregateCategoryStats).toHaveBeenCalledTimes(1);
  });
});

// ─── getProductsForListingSchema ─────────────────────────────────

describe("getProductsForListingSchema", () => {
  it("passes filters and limit through to the repository", async () => {
    const filters = { category: "Mobile", minPrice: "100", maxPrice: "5000" };
    const payload = { products: [], totalCount: 0 };
    mockFindProductsForListing.mockResolvedValue(payload);

    const { getProductsForListingSchema } = await freshService();
    const result = await getProductsForListingSchema(filters, 48);

    expect(mockFindProductsForListing).toHaveBeenCalledWith(filters, 48);
    expect(result).toBe(payload);
  });

  it("defaults limit to 24 when not supplied", async () => {
    mockFindProductsForListing.mockResolvedValue({
      products: [],
      totalCount: 0,
    });
    const { getProductsForListingSchema } = await freshService();
    await getProductsForListingSchema({});
    expect(mockFindProductsForListing).toHaveBeenCalledWith({}, 24);
  });
});
