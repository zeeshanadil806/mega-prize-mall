// app/(customer)/products/page.tsx (Server Component)
import { Suspense } from "react";
import ProductGrid from "@/components/products/ProductGrid";
import ProductFilters from "@/components/products/ProductFilters";
import { Skeleton } from "@/components/ui/skeleton";
import { Metadata } from "next";
import { getCategories, getPriceRange } from "@/lib/product-utils";
import { connectToDatabase } from "@/lib/mongodb";

export const metadata: Metadata = {
  title: "Products - Mega Prize Mall",
  description:
    "Browse our amazing collection of products with exclusive bargains and deals.",
};

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
  // Fetch filter data in parallel
  const [categories, priceRange] = await Promise.all([
    getCategories(),
    getPriceRange(),
  ]);

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Discover Amazing Products
          </h1>
          <p className="text-gray-600">
            Browse our collection and bargain for the best prices
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-1/4">
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
              <form action="/products" method="GET" className="flex gap-2">
                <input
                  type="text"
                  name="search"
                  defaultValue={searchParams.search}
                  placeholder="Search products..."
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#7C2C78] focus:border-transparent"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-linear-to-r from-[#7C2C78] to-[#A43875] text-white rounded-lg hover:from-[#6A2566] hover:to-[#8D2F6A] transition-all"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Active Filters */}
            <ActiveFilters searchParams={searchParams} />

            {/* Product Grid with Suspense */}
            <Suspense fallback={<ProductGridSkeleton />}>
              <ProductGrid searchParams={searchParams} />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}

// Active Filters Component
// Update the component signature and logic
function ActiveFilters({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const hasActiveFilters = Object.keys(searchParams).some(
    key => key !== 'page' && searchParams[key]
  );
  
  if (!hasActiveFilters) return null;
  
  const removeFilter = (key: string) => {
    const params = new URLSearchParams();
    // Reconstruct params carefully avoiding null/undefined
    Object.entries(searchParams).forEach(([k, v]) => {
        if (k !== key && k !== 'page' && v) {
            params.append(k, Array.isArray(v) ? v[0] : v);
        }
    });
    return `/products?${params.toString()}`;
  };
  
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      <span className="text-sm text-gray-600">Active filters:</span>
      {Object.entries(searchParams).map(([key, value]) => {
        if (key === 'page' || !value) return null;
        
        // Fix 2: Ensure value is treated as a string
        const stringValue = Array.isArray(value) ? value[0] : value;
        
        let displayValue = stringValue;
        
        if (key === 'sortBy') {
          const sortLabels: Record<string, string> = {
            price_asc: 'Price: Low to High',
            price_desc: 'Price: High to Low',
            newest: 'Newest',
            popular: 'Most Popular',
          };
          // distinct string assignment
          displayValue = sortLabels[stringValue] || stringValue;
        }
        
        return (
          <a
            key={key}
            href={removeFilter(key)}
            className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
          >
            <span className="font-medium">{key}:</span> {displayValue}
            <span className="ml-1">×</span>
          </a>
        );
      })}
      {hasActiveFilters && (
        <a
          href="/products"
          className="inline-flex items-center px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm hover:bg-red-100 transition-colors"
        >
          Clear All
        </a>
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
