// app/(customer)/products/page.tsx (Server Component)
import { Suspense } from "react";
import ProductGrid from "@/components/products/ProductGrid";
import ProductFilters from "@/components/products/ProductFilters";
import { Skeleton } from "@/components/ui/skeleton";
import { Metadata } from "next";
import { getCategories, getPriceRange, getProductsForListingSchema, getCategoryStats } from "@/features/product/service";
import { connectToDatabase } from "@/lib/mongodb";
import Link from "next/link";

// Cache the listing page for 60s. Each unique (?category, ?search, ?page,
// ?sortBy, ?minPrice, ?maxPrice) combo is cached separately by Next's ISR.
// Admin product edits should call revalidatePath('/products') to bust early.
export const revalidate = 60;
import MobileFilterTrigger from "@/components/products/MobileFilterTrigger";
import MobileFilterDrawer from "@/components/products/MobileFilterDrawer";
import QuickSortSelect from "@/components/products/QuickSortSelect";
import { Search, X } from "lucide-react";

// ✅ DYNAMIC METADATA FUNCTION
export async function generateMetadata(props: {
  searchParams: Promise<{
    page?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sortBy?: string;
    search?: string;
    bargain?: string;
    new?: string;
  }>;
}): Promise<Metadata> {
  const searchParams = await props.searchParams;
  
  // For category pages
  if (searchParams.category) {
    const category = decodeURIComponent(searchParams.category);
    const categoryFormatted = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
    
    return {
      title: `${categoryFormatted} Mobile Accessories | Best ${categoryFormatted} Online | Mega Prize Mall`,
      description: `Shop best ${categoryFormatted} for mobile phones. Premium quality ${categoryFormatted.toLowerCase()} with bargain option. Make offers, earn lucky draw entries. Price match guarantee. Free shipping available.`,
      keywords: `${categoryFormatted}, ${categoryFormatted} online, buy ${categoryFormatted}, ${categoryFormatted} for mobile, ${categoryFormatted} with bargain, mobile ${categoryFormatted}`,
      
      openGraph: {
        title: `${categoryFormatted} Collection - Bargain Available | Mega Prize Mall`,
        description: `Browse ${categoryFormatted} collection with price negotiation feature. Premium quality with bargain options.`,
        type: "website",
        url: `https://megaprizemall.com/products?category=${encodeURIComponent(category)}`,
        images: [
          {
            url: `/logo.png`,
            width: 1200,
            height: 630,
            alt: `${categoryFormatted} Collection - Mega Prize Mall`,
          },
        ],
      },
      
      twitter: {
        card: "summary_large_image",
        title: `${categoryFormatted} Collection - Bargain Feature`,
        description: `Browse ${categoryFormatted} with price negotiation option`,
        images: [`/logo.png`],
      },
      
      alternates: {
        canonical: `https://megaprizemall.com/products?category=${encodeURIComponent(category)}`,
      },
      
      other: {
        'og:type': 'product.group',
        'product:category': categoryFormatted,
      },
    };
  }
  
  // For search results — noindex so each user query doesn't spawn its own
  // crawlable URL, and point the canonical back at /products so any inbound
  // link signal consolidates on the main listing.
  if (searchParams.search) {
    const query = decodeURIComponent(searchParams.search);

    return {
      title: `"${query}" Mobile Accessories | Search Results | Mega Prize Mall`,
      description: `Find ${query} mobile accessories with bargain option. Shop best ${query} online with price negotiation & lucky draw rewards. Free shipping across Pakistan.`,
      keywords: `${query}, ${query} mobile accessories, buy ${query} online, ${query} with bargain`,

      robots: {
        index: false,
        follow: true,
      },

      alternates: {
        canonical: "https://megaprizemall.com/products",
      },

      openGraph: {
        title: `Search Results for "${query}" - Mobile Accessories`,
        description: `Find ${query} mobile accessories with price negotiation feature.`,
        type: "website",
        url: `https://megaprizemall.com/products?search=${encodeURIComponent(query)}`,
      },
    };
  }
  
  // Default - All products
  return {
    title: "Shop All Mobile Accessories | Phone Cases, Chargers, Earbuds | Mega Prize Mall",
    description: "Browse 1000+ mobile accessories with bargain option. Choose from phone cases, wireless chargers, earbuds, screen protectors, power banks. Make offers on prices & earn lucky draw entries. Free shipping across Pakistan.",
    keywords: "mobile accessories online, phone accessories, buy phone cases, wireless earbuds, mobile chargers, screen protectors, power banks, cables, smartphone gadgets, bargain prices, negotiate prices",
    
    // Open Graph
    openGraph: {
      title: "Mobile Accessories Collection - Bargain Prices Available",
      description: "Shop complete range of mobile accessories. Use bargain feature to negotiate prices on phone cases, chargers, earbuds and more.",
      type: "website",
      url: "https://megaprizemall.com/products",
      images: [
        {
          url: "/logo.png",
          width: 1200,
          height: 630,
          alt: "Mega Prize Mall Mobile Accessories Collection",
        },
      ],
    },
    
    // Twitter
    twitter: {
      card: "summary_large_image",
      title: "Mobile Accessories Collection - Bargain Feature",
      description: "Browse all mobile accessories with price negotiation option",
      images: ["/logo.png"],
    },
    
    // Canonical
    alternates: {
      canonical: "https://megaprizemall.com/products",
    },
    
    // Additional
    other: {
      'og:type': 'product.group',
      'product:category': 'Mobile Accessories',
      'product:price:amount': '199',
      'product:price:currency': 'PKR',
    },
  };
}

interface ProductsPageProps {
  searchParams: Promise<{
    page?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sortBy?: string;
    search?: string;
    bargain?: string;
    new?: string;
  }>;
}

export default async function ProductsPage(props: ProductsPageProps) {
  await connectToDatabase();

  // Await searchParams before accessing properties
  const searchParams = await props.searchParams;
  // Fetch filter data + a snapshot of the actual products on this page in parallel
  const [categories, priceRange, listingForSchema, categoryStats] = await Promise.all([
    getCategories(),
    getPriceRange(),
    getProductsForListingSchema(searchParams, 24),
    getCategoryStats(),
  ]);

  const listName = searchParams.category
    ? `${decodeURIComponent(searchParams.category)} Collection`
    : "Mobile Accessories Collection";
  const listDescription = searchParams.category
    ? `Browse ${decodeURIComponent(searchParams.category)} with bargain option`
    : "Complete range of mobile accessories with bargain option";

  // Build ItemList JSON-LD from the real products being rendered on this page
  // so Google's structured-data view matches the actual listing.
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName,
    description: listDescription,
    numberOfItems: listingForSchema.totalCount,
    itemListElement: listingForSchema.products.map((product, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      item: {
        "@type": "Product",
        name: product.name,
        url: `https://megaprizemall.com/products/${product.slug}`,
        offers: {
          "@type": "Offer",
          price: String(product.discountedPrice && product.discountedPrice > 0 ? product.discountedPrice : product.price),
          priceCurrency: "PKR",
          availability: product.stock > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          ...(product.bargainEnabled && {
            additionalProperty: {
              "@type": "PropertyValue",
              name: "Bargain Available",
              value: "true",
            },
          }),
        },
      },
    })),
  };

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://megaprizemall.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": searchParams.category 
          ? decodeURIComponent(searchParams.category).charAt(0).toUpperCase() + decodeURIComponent(searchParams.category).slice(1).toLowerCase()
          : "Products",
        "item": searchParams.category 
          ? `https://megaprizemall.com/products?category=${encodeURIComponent(searchParams.category)}`
          : "https://megaprizemall.com/products"
      }
    ]
  };

  const activeFilterKeys = Object.keys(searchParams).filter(
    (k) => k !== "page" && k !== "sortBy" && Boolean(searchParams[k as keyof typeof searchParams])
  );
  const activeFilterCount = activeFilterKeys.length;

  return (
    <>
      {/* ✅ Structured Data Scripts */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      
      <div className="min-h-screen bg-linear-to-b from-gray-50 via-white to-gray-50">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-5 md:py-6 max-w-[1560px]">
          {/* Compact Top Bar: Title, Count & Instant Sort */}
          <div className="flex items-center justify-between gap-3 mb-2.5 sm:mb-3.5">
            <div className="min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <h1 className="text-base sm:text-xl md:text-2xl font-black text-gray-900 tracking-tight truncate">
                  {searchParams.category
                    ? `${decodeURIComponent(searchParams.category)}`
                    : searchParams.search
                      ? `Results for "${decodeURIComponent(searchParams.search)}"`
                      : "All Products"}
                </h1>
                <span className="text-[11px] sm:text-xs font-semibold text-gray-500 whitespace-nowrap">
                  ({listingForSchema.totalCount} {listingForSchema.totalCount === 1 ? 'item' : 'items'})
                </span>
              </div>
              <p className="hidden sm:block text-xs text-gray-500 mt-0.5">
                {searchParams.category
                  ? `Authentic ${decodeURIComponent(searchParams.category).toLowerCase()} with live bargain & lucky draw entries`
                  : "Explore authentic gadgets with live price negotiation & lucky draw rewards"}
              </p>
            </div>

            {/* Instant Quick Sort Dropdown */}
            <QuickSortSelect currentSort={searchParams.sortBy} />
          </div>

          <div className="flex flex-col lg:flex-row gap-5 lg:gap-6 xl:gap-7 items-start">
            {/* Filters Sidebar - Desktop (Fixed ergonomic width) */}
            <aside className="hidden lg:block w-[260px] xl:w-[275px] shrink-0 sticky top-20">
              <ProductFilters
                categories={categories}
                categoryStats={categoryStats}
                priceRange={priceRange}
                selectedCategory={searchParams.category}
                selectedMinPrice={searchParams.minPrice}
                selectedMaxPrice={searchParams.maxPrice}
                selectedSortBy={searchParams.sortBy}
                selectedBargain={searchParams.bargain}
                selectedNew={searchParams.new}
                searchQuery={searchParams.search}
              />
            </aside>

            {/* Main Content (Expands to fill available wide layout) */}
            <main className="w-full flex-1 min-w-0">
              {/* Unified Mobile Search + Filter Toolbar (Single Compact Row) */}
              <div className="mb-2 sm:mb-3">
                <form
                  action="/products"
                  method="GET"
                  className="flex items-center gap-2"
                >
                  {searchParams.category && (
                    <input type="hidden" name="category" value={searchParams.category} />
                  )}
                  {searchParams.sortBy && (
                    <input type="hidden" name="sortBy" value={searchParams.sortBy} />
                  )}
                  {searchParams.bargain && (
                    <input type="hidden" name="bargain" value={searchParams.bargain} />
                  )}

                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 stroke-[2] pointer-events-none" />
                    <input
                      type="text"
                      name="search"
                      defaultValue={searchParams.search}
                      placeholder="Search gadgets, audio, cases..."
                      className="w-full h-9 sm:h-10 pl-9 pr-3 bg-white border border-gray-200/90 rounded-xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#011b54]/20 focus:border-[#011b54] shadow-2xs transition-all"
                    />
                  </div>

                  {/* Mobile Filter Button - in the same row! */}
                  <div className="lg:hidden shrink-0">
                    <MobileFilterTrigger activeCount={activeFilterCount} />
                  </div>

                  {/* Desktop Submit Button */}
                  <button
                    type="submit"
                    className="hidden sm:inline-flex items-center justify-center h-10 px-4.5 bg-[#011b54] hover:bg-[#022b82] text-white rounded-xl text-xs sm:text-sm font-bold shadow-2xs transition-colors shrink-0"
                  >
                    Search
                  </button>
                </form>
              </div>

              {/* Active Filter Chips */}
              <ActiveFilters searchParams={searchParams} />

              {/* Mobile Filter Drawer */}
              <MobileFilterDrawer
                categories={categories}
                priceRange={priceRange}
                searchParams={searchParams}
              />

              {/* Product Grid with Suspense */}
              <Suspense fallback={<ProductGridSkeleton />}>
                <ProductGrid searchParams={searchParams} />
              </Suspense>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}

// Active Filters Component - Human-Friendly E-Commerce Chips
function ActiveFilters({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const filterEntries = Object.entries(searchParams).filter(
    ([key, value]) => key !== "page" && key !== "sortBy" && Boolean(value)
  );

  if (filterEntries.length === 0) return null;

  const removeFilter = (key: string) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([k, v]) => {
      if (k !== key && k !== "page" && v) {
        params.append(k, Array.isArray(v) ? v[0] : v);
      }
    });
    return `/products?${params.toString()}`;
  };

  const formatFilterLabel = (key: string, val: string) => {
    if (key === "new") return "New Arrivals";
    if (key === "bargain") return "Bargain Deals";
    if (key === "category") return decodeURIComponent(val);
    if (key === "search") return `"${decodeURIComponent(val)}"`;
    if (key === "minPrice") return `Min: Rs. ${Number(val).toLocaleString()}`;
    if (key === "maxPrice") return `Max: Rs. ${Number(val).toLocaleString()}`;
    return `${key}: ${val}`;
  };

  return (
    <div className="mb-2.5 sm:mb-3 flex flex-wrap items-center gap-1.5 sm:gap-2">
      <span className="text-[11px] sm:text-xs font-semibold text-gray-500 mr-0.5">
        Active Filters:
      </span>
      {filterEntries.map(([key, value]) => {
        const stringValue = Array.isArray(value) ? value[0] : value || "";
        const label = formatFilterLabel(key, stringValue);

        return (
          <Link
            key={key}
            href={removeFilter(key)}
            className="group inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-200/90 hover:border-rose-300 text-gray-700 hover:text-rose-600 rounded-full text-[11px] sm:text-xs font-semibold shadow-2xs transition-colors"
          >
            <span>{label}</span>
            <X className="w-3 h-3 text-gray-400 group-hover:text-rose-600 transition-colors" />
          </Link>
        );
      })}
      <Link
        href="/products"
        className="inline-flex items-center px-2.5 py-1 text-[11px] sm:text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-full transition-colors ml-0.5"
      >
        Clear All
      </Link>
    </div>
  );
}

// Skeleton Loader
function ProductGridSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-200 p-4"
          >
            <Skeleton className="h-48 w-full mb-4 rounded-lg" />
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-4 w-32 mb-4" />
            <div className="flex justify-between">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}