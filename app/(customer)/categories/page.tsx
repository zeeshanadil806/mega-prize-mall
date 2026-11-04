// app/(customer)/categories/page.tsx
import { connectToDatabase } from "@/lib/mongodb";
import { ProductModel } from "@/models/Product";
import { Metadata } from "next";

// Categories change rarely (only when admin adds/removes a category from any
// product). 10-minute cache window is fine; ISR rebuilds on first visitor
// after expiry.
export const revalidate = 600;
import Link from "next/link";
import Image from "next/image";
import {
  Smartphone,
  Headphones,
  Gamepad2,
  Laptop,
  Zap,
  Tag,
  ArrowRight,
  ShoppingBag,
  Star,
  TrendingUp,
  Watch,
  Camera,
  Tv,
  Wifi,
  Shield,
  SmartphoneCharging,
  Package,
} from "lucide-react";
import { getCategoryStats } from "@/features/product/service";
import { resolveCategoryQuery } from "@/features/product/domain";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title:
    "Electronics Accessories Categories | Shop by Device Type - Mega Prize Mall",
  description:
    "Browse electronics accessories organized by category. Mobile accessories, audio gear, gaming peripherals, PC/laptop accessories, power & charging solutions. Find products for your specific devices.",
  keywords:
    "electronics categories, mobile accessories, audio gear, gaming accessories, PC accessories, laptop accessories, power banks, chargers, smartphone cases, headphones, gaming controllers",
  openGraph: {
    title: "Electronics Accessories Categories | Mega Prize Mall",
    description:
      "Browse electronics accessories by category - Mobile, Audio, Gaming, PC/Laptop, Power & Charging",
    type: "website",
    url: "https://megaprizemall.com/categories",
    siteName: "Mega Prize Mall",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Electronics Accessories Categories at Mega Prize Mall",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Electronics Accessories Categories | Mega Prize Mall",
    description:
      "Browse electronics accessories by category - Mobile, Audio, Gaming, PC/Laptop, Power & Charging",
    images: ["/logo.png"],
    creator: "@megaprizemall",
  },
  alternates: {
    canonical: "https://megaprizemall.com/categories",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

// Helper mappings for category styling
const STYLE_CONFIGS: Record<string, { color: string; bgColor: string; borderColor: string; description: string }> = {
  "Mobile Accessories": {
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    description: "Cases, screen protectors, chargers, stands for smartphones",
  },
  "Audio and Multimedia": {
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    description: "Headphones, earphones, speakers, audio gear",
  },
  "Gaming Accessories": {
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    description: "Gaming controllers, headsets, keyboards, mouse pads",
  },
  "PC and Laptop Accessories": {
    color: "from-orange-500 to-red-500",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    description: "Laptop stands, cooling pads, keyboards, mice, webcams",
  },
  "Power Charging": {
    color: "from-yellow-500 to-amber-500",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    description: "Power banks, chargers, cables, adapters, wireless chargers",
  },
};

function getCategoryStyles(categoryName: string) {
  const matched = Object.entries(STYLE_CONFIGS).find(
    ([key]) => key.toLowerCase() === categoryName.toLowerCase()
  );
  if (matched) return matched[1];

  return {
    color: "from-[#011b54] to-[#022b82]",
    bgColor: "bg-[#011b54]/5",
    borderColor: "border-[#011b54]/10",
    description: `Shop the latest ${categoryName} at Mega Prize Mall.`,
  };
}

function getCategoryIconComponent(name: string) {
  const normalized = name.toLowerCase().trim();
  if (normalized.includes("mobile acc") || normalized.includes("mobile accessories")) {
    return Smartphone;
  }
  if (normalized.includes("gaming")) {
    return Gamepad2;
  }
  if (normalized.includes("audio") || normalized.includes("multimedia") || normalized.includes("headphones")) {
    return Headphones;
  }
  if (normalized.includes("pc") || normalized.includes("laptop")) {
    return Laptop;
  }
  if (normalized.includes("power") || normalized.includes("charging") || normalized.includes("cable") || normalized.includes("battery")) {
    return Zap;
  }
  if (normalized.includes("wearable") || normalized.includes("watch")) {
    return Watch;
  }
  if (normalized.includes("camera") || normalized.includes("content") || normalized.includes("vlog")) {
    return Camera;
  }
  if (normalized.includes("tv")) {
    return Tv;
  }
  if (normalized.includes("wifi") || normalized.includes("connectivity") || normalized.includes("router")) {
    return Wifi;
  }
  if (normalized.includes("case") || normalized.includes("protector") || normalized.includes("shield")) {
    return Shield;
  }
  if (normalized.includes("holder") || normalized.includes("stand")) {
    return SmartphoneCharging;
  }
  return Package;
}

export default async function CategoriesPage() {
  await connectToDatabase();
  const categoryStats = await getCategoryStats();

  // Get dynamic category details and counts
  const categoryCounts = await Promise.all(
    categoryStats.map(async (stat) => {
      const catName = stat.category;
      const styles = getCategoryStyles(catName);
      const IconComp = getCategoryIconComponent(catName);

      // Get featured products for this category using unified query mapping
      const featuredProducts = await ProductModel.find({
        category: resolveCategoryQuery(catName),
        isActive: true,
        isFeatured: true,
      })
        .select("name price discountedPrice images slug bargainEnabled")
        .limit(3)
        .lean();

      return {
        id: catName.toLowerCase().replace(/\s+/g, "-"),
        name: catName,
        icon: IconComp,
        productCount: stat.count,
        color: styles.color,
        bgColor: styles.bgColor,
        borderColor: styles.borderColor,
        description: styles.description,
        featuredProducts: featuredProducts.map((p) => ({
          ...p,
          _id: p._id.toString(),
          finalPrice: p.discountedPrice || p.price,
          discountPercentage: p.discountedPrice
            ? Math.round(((p.price - p.discountedPrice) / p.price) * 100)
            : 0,
        })),
      };
    })
  );

  // Get bargain products count
  const bargainCount = await ProductModel.countDocuments({
    bargainEnabled: true,
    isActive: true,
  });

  // Get total products count
  const totalProducts = await ProductModel.countDocuments({ isActive: true });
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Electronics Accessories Categories",
    description:
      "Browse electronics accessories organized by category at Mega Prize Mall",
    url: "https://megaprizemall.com/categories",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: categoryCounts.length,
      itemListElement: categoryCounts.map((category, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "ProductGroup",
          name: category.name,
          description: category.description,
          url: `https://megaprizemall.com/products?category=${encodeURIComponent(
            category.name
          )}`,
          hasVariant: {
            "@type": "Product",
            category: category.name,
            offers: {
              "@type": "AggregateOffer",
              offerCount: category.productCount,
              lowPrice: 99, // You might want to calculate actual min price
              highPrice: 9999, // You might want to calculate actual max price
              priceCurrency: "PKR",
            },
          },
        },
      })),
    },
  };

  // Breadcrumb structured data
  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://megaprizemall.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Categories",
        item: "https://megaprizemall.com/categories",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructuredData),
        }}
      />
      {/* Hero Section */}
      <div className="bg-linear-to-r from-[#011b54] via-[#022b82] to-[#011b54] text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-white/20 text-white border-0 backdrop-blur-sm">
              <Tag className="h-3 w-3 mr-1" />
              {totalProducts.toLocaleString()} Products
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              Browse by Category
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl">
              Discover electronics accessories organized by category. Find
              exactly what you need for your devices.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/products">
                <Button
                  size="lg"
                  className="bg-white text-[#011b54] hover:bg-white/90"
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  View All Products
                </Button>
              </Link>
              <Link href="/products?bargain=true">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white bg-transparent text-white hover:bg-white/10"
                >
                  <Tag className="h-4 w-4 mr-2" />
                  Bargain Deals ({bargainCount})
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            All Categories
          </h2>
          <p className="text-gray-600">Select a category to browse products</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {categoryCounts.map((category) => (
            <div
              key={category.id}
              className={`rounded-2xl border ${category.borderColor} ${category.bgColor} p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`h-14 w-14 rounded-xl bg-linear-to-r ${category.color} flex items-center justify-center`}
                >
                  <category.icon className="h-6 w-6 text-white" />
                </div>
                <Badge
                  className={`bg-linear-to-r ${category.color} text-white border-0`}
                >
                  {category.productCount} products
                </Badge>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {category.name}
              </h3>

              <p className="text-gray-600 mb-6">{category.description}</p>

              {/* Featured Products Preview */}
              {category.featuredProducts.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-700">
                      Featured
                    </span>
                  </div>
                  <div className="space-y-2">
                    {category.featuredProducts.map((product) => (
                      <div
                        key={product._id}
                        className="flex items-center gap-3 p-2 rounded-lg bg-white/50"
                      >
                        {product.images?.[0]?.url && (
                          <div className="h-10 w-10 rounded-lg bg-gray-100 overflow-hidden relative shrink-0">
                            <Image
                              src={product.images[0].url}
                              alt={product.name}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {product.name}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-900">
                              Rs {product.finalPrice}
                            </span>
                            {product.discountPercentage > 0 && (
                              <Badge
                                variant="outline"
                                className="text-xs border-green-200 text-green-700"
                              >
                                {product.discountPercentage}% OFF
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Link
                href={`/products?category=${encodeURIComponent(category.name)}`}
              >
                <Button className="w-full group">
                  Browse Category
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Special Collections */}
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            Special Collections
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bargain Zone */}
            <Link href="/products?bargain=true">
              <div className="relative rounded-2xl overflow-hidden group cursor-pointer">
                <div className="absolute inset-0 bg-linear-to-r from-[#011b54] via-[#F6B945] to-[#022b82] opacity-90 z-10" />
                <div className="absolute inset-0 bg-black/20 z-20 group-hover:opacity-0 transition-opacity" />
                <div className="relative z-30 p-8 text-white">
                  <div className="h-14 w-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6">
                    <Tag className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Bargain Zone</h3>
                  <p className="text-white/90 mb-4">
                    Negotiate prices and get exclusive discounts
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">
                      {bargainCount} Deals
                    </span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Featured Products */}
            <Link href="/products?sortBy=popular">
              <div className="relative rounded-2xl overflow-hidden group cursor-pointer">
                <div className="absolute inset-0 bg-linear-to-r from-[#011b54] via-[#022b82] to-[#011b54] opacity-90 z-10" />
                <div className="absolute inset-0 bg-black/20 z-20 group-hover:opacity-0 transition-opacity" />
                <div className="relative z-30 p-8 text-white">
                  <div className="h-14 w-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6">
                    <Star className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Featured Products</h3>
                  <p className="text-white/90 mb-4">
                    Curated selection of top-rated products
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">
                      Editor&apos;s Pick
                    </span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Best Sellers */}
            <Link href="/products?sortBy=popular">
              <div className="relative rounded-2xl overflow-hidden group cursor-pointer">
                <div className="absolute inset-0 bg-linear-to-r from-[#011b54] via-[#022b82] to-[#011b54] opacity-90 z-10" />
                <div className="absolute inset-0 bg-black/20 z-20 group-hover:opacity-0 transition-opacity" />
                <div className="relative z-30 p-8 text-white">
                  <div className="h-14 w-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Best Sellers</h3>
                  <p className="text-white/90 mb-4">
                    Most popular products customers love
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">Top Rated</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* All Categories Stats */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Categories Overview
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {categoryCounts.map((category) => (
              <div key={category.id} className="text-center">
                <div
                  className={`h-20 w-20 rounded-full bg-linear-to-r ${category.color} flex items-center justify-center mx-auto mb-3`}
                >
                  <category.icon className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  {category.name}
                </h4>
                <p className="text-2xl font-bold text-gray-900">
                  {category.productCount}
                </p>
                <p className="text-xs text-gray-500">products</p>
              </div>
            ))}
          </div>

          <Separator className="my-6" />

          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Can&apos;t find what you&apos;re looking for?
            </h3>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/products">
                <Button variant="outline" size="lg">
                  Browse All Products
                </Button>
              </Link>
              <Link href="/products?search=">
                <Button
                  size="lg"
                  className="bg-linear-to-r from-[#011b54] to-[#022b82]"
                >
                  Use Advanced Search
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
