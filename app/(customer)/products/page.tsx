// app/(customer)/products/page.tsx (Server Component)
import { Suspense } from "react";
import ProductGrid from "@/components/products/ProductGrid";
import ProductFilters from "@/components/products/ProductFilters";
import { Skeleton } from "@/components/ui/skeleton";
import { Metadata } from "next";
import { getCategories, getPriceRange, getProductsForListingSchema } from "@/lib/product-utils";
import { connectToDatabase } from "@/lib/mongodb";
import Link from "next/link";

// Cache the listing page for 60s. Each unique (?category, ?search, ?page,
// ?sortBy, ?minPrice, ?maxPrice) combo is cached separately by Next's ISR.
// Admin product edits should call revalidatePath('/products') to bust early.
export const revalidate = 60;
// import { Filter, X } from "lucide-react";
// import MobileFilters from "@/components/products/ProductFilters";
import MobileFilterTrigger from "@/components/products/MobileFilterTrigger";
import MobileFilterDrawer from "@/components/products/MobileFilterDrawer";

// ✅ DYNAMIC METADATA FUNCTION
export async function generateMetadata(props: {
  searchParams: Promise<{
    page?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sortBy?: string;
    search?: string;
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
  }>;
}

export default async function ProductsPage(props: ProductsPageProps) {
  await connectToDatabase();

  // Await searchParams before accessing properties
  const searchParams = await props.searchParams;
  // Fetch filter data + a snapshot of the actual products on this page in parallel
  const [categories, priceRange, listingForSchema] = await Promise.all([
    getCategories(),
    getPriceRange(),
    getProductsForListingSchema(searchParams, 24),
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
      
      <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-8">
          {/* Page Header with Mobile Filter Button */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Title Section */}
              <div className="flex-1">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 leading-tight">
                  {searchParams.category 
                    ? `${decodeURIComponent(searchParams.category).charAt(0).toUpperCase() + decodeURIComponent(searchParams.category).slice(1).toLowerCase()} Collection`
                    : "Discover Amazing Products"
                  }
                </h1>
                <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
                  {searchParams.category 
                    ? `Premium ${decodeURIComponent(searchParams.category).toLowerCase()} with bargain option`
                    : "Browse our collection and bargain for the best prices"
                  }
                </p>
              </div>

              {/* Mobile Filter Button - Perfectly aligned */}
              <div className="flex justify-end lg:hidden">
                <MobileFilterTrigger />
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar - Hidden on mobile, shown on desktop */}
            <aside className="hidden lg:block lg:w-1/4">
              <ProductFilters
                categories={categories}
                priceRange={priceRange}
                selectedCategory={searchParams.category}
                selectedMinPrice={searchParams.minPrice}
                selectedMaxPrice={searchParams.maxPrice}
                selectedSortBy={searchParams.sortBy}
                searchQuery={searchParams.search}
              />
            </aside>

            {/* Main Content */}
            <main className="lg:w-3/4">
              {/* Search Bar */}
              <div className="mb-6">
                <div className="mb-6">
                  <form
                    action="/products"
                    method="GET"
                    className="flex flex-col sm:flex-row gap-2 sm:gap-3"
                  >
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        name="search"
                        defaultValue={searchParams.search}
                        placeholder="Search products by name, category, or keywords..."
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#7C2C78] focus:border-transparent text-sm sm:text-base"
                      />
                      {/* Optional: Add a search icon on mobile */}
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 sm:hidden text-gray-400">
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="px-4 sm:px-6 py-3 bg-linear-to-r from-[#7C2C78] to-[#A43875] text-white rounded-lg hover:from-[#6A2566] hover:to-[#8D2F6A] transition-all text-sm sm:text-base font-medium whitespace-nowrap"
                    >
                      <span className="hidden sm:inline">Search</span>
                      <span className="sm:hidden">🔍 Search</span>
                    </button>
                  </form>
                </div>
              </div>

              {/* Active Filters */}
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

// Active Filters Component
function ActiveFilters({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const hasActiveFilters = Object.keys(searchParams).some(
    (key) => key !== "page" && searchParams[key]
  );

  if (!hasActiveFilters) return null;

  const removeFilter = (key: string) => {
    const params = new URLSearchParams();
    // Reconstruct params carefully avoiding null/undefined
    Object.entries(searchParams).forEach(([k, v]) => {
      if (k !== key && k !== "page" && v) {
        params.append(k, Array.isArray(v) ? v[0] : v);
      }
    });
    return `/products?${params.toString()}`;
  };

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      <span className="text-sm text-gray-600">Active filters:</span>
      {Object.entries(searchParams).map(([key, value]) => {
        if (key === "page" || !value) return null;

        // Fix 2: Ensure value is treated as a string
        const stringValue = Array.isArray(value) ? value[0] : value;

        let displayValue = stringValue;

        if (key === "sortBy") {
          const sortLabels: Record<string, string> = {
            price_asc: "Price: Low to High",
            price_desc: "Price: High to Low",
            newest: "Newest",
            popular: "Most Popular",
          };
          // distinct string assignment
          displayValue = sortLabels[stringValue] || stringValue;
        }

        return (
          <Link
            key={key}
            href={removeFilter(key)}
            className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
          >
            <span className="font-medium">{key}:</span> {displayValue}
            <span className="ml-1">×</span>
          </Link>
        );
      })}
      {hasActiveFilters && (
        <Link
          href="/products"
          className="inline-flex items-center px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm hover:bg-red-100 transition-colors"
        >
          Clear All
        </Link>
      )}
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