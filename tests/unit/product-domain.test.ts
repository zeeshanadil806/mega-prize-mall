import { describe, it, expect } from "vitest";
import {
  sanitizeImages,
  transformProductForCustomer,
  generatePaginationLinks,
  type RawImage,
  type RawProduct,
} from "@/features/product/domain";

// Pure-function tests for the product domain. No I/O, no mocks — these
// lock the wire-format transforms and pagination math that the
// homepage + listing pages depend on.

// ─── sanitizeImages ──────────────────────────────────────────────

describe("sanitizeImages", () => {
  it("returns an empty array when images is undefined", () => {
    expect(sanitizeImages(undefined)).toEqual([]);
  });

  it("returns an empty array for an empty input array", () => {
    expect(sanitizeImages([])).toEqual([]);
  });

  it("prefers the author-supplied `id` when present", () => {
    const result = sanitizeImages([{ id: "custom-id", url: "/a.png" }]);
    expect(result[0].id).toBe("custom-id");
  });

  it("falls back to ObjectId.toString() when `id` is absent", () => {
    const result = sanitizeImages([
      {
        _id: { toString: () => "obj-id-string" } as RawImage["_id"],
        url: "/a.png",
      },
    ]);
    expect(result[0].id).toBe("obj-id-string");
  });

  it("falls back to the index when both id and _id are absent", () => {
    const result = sanitizeImages([
      { url: "/0.png" },
      { url: "/1.png" },
      { url: "/2.png" },
    ]);
    expect(result.map((i) => i.id)).toEqual(["0", "1", "2"]);
  });

  it("preserves url, alt, and order", () => {
    const result = sanitizeImages([
      { id: "a", url: "/x.png", alt: "X", order: 5 },
    ]);
    expect(result[0]).toMatchObject({
      id: "a",
      url: "/x.png",
      alt: "X",
      order: 5,
    });
  });

  it("defaults order to the array index when not supplied", () => {
    const result = sanitizeImages([
      { id: "a", url: "/0.png" },
      { id: "b", url: "/1.png" },
    ]);
    expect(result[0].order).toBe(0);
    expect(result[1].order).toBe(1);
  });

  it("provides a zero metadata default when missing", () => {
    const result = sanitizeImages([{ id: "a", url: "/a.png" }]);
    expect(result[0].metadata).toEqual({
      width: 0,
      height: 0,
      size: 0,
      format: "",
    });
  });

  it("never leaks the Mongoose _id to the wire shape", () => {
    const result = sanitizeImages([
      {
        _id: { toString: () => "leak-me" } as RawImage["_id"],
        url: "/x.png",
      },
    ]);
    expect(result[0]).not.toHaveProperty("_id");
  });
});

// ─── transformProductForCustomer ─────────────────────────────────

const MINIMAL_RAW: RawProduct = {
  _id: { toString: () => "prod-1" } as RawProduct["_id"],
  name: "Test",
  slug: "test",
  description: "desc",
  price: 1000,
  category: "Mobile",
  brand: "TestBrand",
  sku: "SKU-1",
  stock: 10,
  bargainEnabled: true,
  isActive: true,
  isFeatured: false,
  isBestSeller: false,
  isNewArrival: false,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
};

describe("transformProductForCustomer", () => {
  it("converts ObjectId _id to its string form", () => {
    const result = transformProductForCustomer(MINIMAL_RAW);
    expect(result._id).toBe("prod-1");
  });

  it("serializes createdAt to ISO string", () => {
    const result = transformProductForCustomer(MINIMAL_RAW);
    expect(result.createdAt).toBe("2026-01-01T00:00:00.000Z");
  });

  it("computes discountPercentage from price + discountedPrice", () => {
    const result = transformProductForCustomer({
      ...MINIMAL_RAW,
      discountedPrice: 750,
    });
    expect(result.discountPercentage).toBe(25);
  });

  it("returns 0 discountPercentage when discountedPrice is absent", () => {
    const result = transformProductForCustomer(MINIMAL_RAW);
    expect(result.discountPercentage).toBe(0);
  });

  it("defaults optional fields to safe values (no undefined leaks)", () => {
    const result = transformProductForCustomer(MINIMAL_RAW);
    expect(result.shortDescription).toBe("");
    expect(result.discountedPrice).toBe(0);
    expect(result.costPrice).toBe(0);
    expect(result.tags).toEqual([]);
    expect(result.features).toEqual([]);
    expect(result.specifications).toEqual({});
    expect(result.color).toBe("");
    expect(result.minBargainPrice).toBe(0);
    expect(result.maxBargainRounds).toBe(0);
    expect(result.bargainValidityHours).toBe(24);
    expect(result.metaTitle).toBe("");
    expect(result.metaDescription).toBe("");
    expect(result.keywords).toEqual([]);
    expect(result.purchaseCount).toBe(0);
    expect(result.bargainCount).toBe(0);
    expect(result.viewCount).toBe(0);
    expect(result.images).toEqual([]);
  });

  it("passes images through sanitizeImages", () => {
    const result = transformProductForCustomer({
      ...MINIMAL_RAW,
      images: [{ id: "img-1", url: "/x.png" }],
    });
    expect(result.images).toEqual([
      expect.objectContaining({ id: "img-1", url: "/x.png", order: 0 }),
    ]);
  });

  it("supplies a current-time ISO createdAt when the raw doc has none", () => {
    const raw = { ...MINIMAL_RAW, createdAt: undefined as unknown as Date };
    const before = Date.now();
    const result = transformProductForCustomer(raw);
    const after = Date.now();
    // CustomerProductProps.createdAt inherits optionality from ProductProps;
    // the transform always emits a string, so the non-null assertion is safe.
    const ts = Date.parse(result.createdAt!);
    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after);
  });
});

// ─── generatePaginationLinks ─────────────────────────────────────

describe("generatePaginationLinks", () => {
  it("returns just the first page when totalPages is 1", () => {
    const links = generatePaginationLinks(1, 1, "/p");
    expect(links).toHaveLength(1);
    expect(links[0]).toEqual({
      page: 1,
      url: "/p?page=1",
      isCurrent: true,
    });
  });

  it("returns first + last (no ellipsis) for 2 pages", () => {
    const links = generatePaginationLinks(1, 2, "/p");
    expect(links.map((l) => l.page)).toEqual([1, 2]);
    expect(links[0].isCurrent).toBe(true);
    expect(links[1].isCurrent).toBe(false);
  });

  it("near the start: shows 1, 2..5, ellipsis, last", () => {
    const links = generatePaginationLinks(1, 10, "/p");
    // first, 2..5, ellipsis, 10
    expect(links.map((l) => l.page)).toEqual([1, 2, 3, 4, 5, "...", 10]);
    expect(links[0].isCurrent).toBe(true);
  });

  it("in the middle: shows first, ellipsis, current ± 2, ellipsis, last", () => {
    const links = generatePaginationLinks(6, 10, "/p");
    expect(links.map((l) => l.page)).toEqual([
      1,
      "...",
      4,
      5,
      6,
      7,
      8,
      "...",
      10,
    ]);
    const current = links.find((l) => l.isCurrent);
    expect(current?.page).toBe(6);
  });

  it("near the end: shows first, ellipsis, last-3..last", () => {
    const links = generatePaginationLinks(10, 10, "/p");
    expect(links.map((l) => l.page)).toEqual([1, "...", 6, 7, 8, 9, 10]);
    expect(links[links.length - 1].isCurrent).toBe(true);
  });

  it("builds urls using the supplied baseUrl + ?page=N", () => {
    const links = generatePaginationLinks(3, 5, "/products");
    const numbered = links.filter((l) => typeof l.page === "number");
    for (const link of numbered) {
      expect(link.url).toBe(`/products?page=${link.page}`);
    }
  });

  it("ellipsis entries carry url=# and isCurrent=false", () => {
    const links = generatePaginationLinks(6, 12, "/p");
    const ellipses = links.filter((l) => l.page === "...");
    expect(ellipses.length).toBeGreaterThan(0);
    for (const e of ellipses) {
      expect(e.url).toBe("#");
      expect(e.isCurrent).toBe(false);
    }
  });
});
